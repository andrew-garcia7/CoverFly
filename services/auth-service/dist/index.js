import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { loadServiceEnv } from "@coverfly/config";
import { connectMongo } from "./lib/db.js";
import { metricsMiddleware, registry } from "./lib/metrics.js";
import { UserModel } from "./models/User.js";
import { signAccessToken, signRefreshToken } from "./lib/jwt.js";
const env = loadServiceEnv("auth-service", 4001);
/* -------------------- Allowed Origins -------------------- */
const allowedOrigins = Array.from(new Set([
    ...env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean),
    "http://localhost:8081",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
]));
/* -------------------- MongoDB -------------------- */
void connectMongo(env.MONGODB_URI);
/* -------------------- App -------------------- */
const app = express();
app.disable("x-powered-by");
/* -------------------- Security -------------------- */
app.use(helmet());
/* -------------------- CORS -------------------- */
app.use(cors({
    origin(origin, callback) {
        // allow Postman / curl / no-origin requests
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
/* -------------------- Middleware -------------------- */
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(metricsMiddleware);
/* -------------------- Health -------------------- */
app.get("/healthz", (_req, res) => {
    res.json({
        ok: true,
        service: env.SERVICE_NAME
    });
});
/* -------------------- Metrics -------------------- */
app.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", registry.contentType);
    res.send(await registry.metrics());
});
function getBearerToken(req) {
    const h = req.header("authorization") ?? "";
    const m = /^Bearer\s+(.+)$/i.exec(h);
    return m?.[1] ?? null;
}
app.get(["/v1/auth/me", "/api/auth/v1/auth/me"], async (req, res) => {
    try {
        const token = getBearerToken(req);
        if (!token)
            return res.status(401).json({ error: "missing_token" });
        const { verifyToken } = await import("./lib/jwt.js");
        const decoded = verifyToken(token);
        const userId = String(decoded?.sub ?? "");
        if (!userId)
            return res.status(401).json({ error: "invalid_token" });
        // If DB isn't connected yet, return a clear 503 (demo-friendly).
        const mongoose = (await import("mongoose")).default;
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "db_unavailable" });
        }
        const user = await UserModel.findById(userId);
        if (!user)
            return res.status(404).json({ error: "user_not_found" });
        res.json({
            user: {
                _id: String(user._id),
                role: user.role,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            }
        });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error("auth_me_failed", err);
        res.status(401).json({ error: "invalid_token" });
    }
});
/* =======================================================
   VALIDATION
======================================================= */
const zSignup = z.object({
    role: z.enum(["RIDER", "DRIVER", "ADMIN"]).default("RIDER"),
    name: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    password: z.string().min(6)
});
const zLogin = z.object({
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    password: z.string().min(6)
});
/* =======================================================
   SIGNUP
   Supports BOTH:
   /v1/auth/signup
   /api/auth/v1/auth/signup
======================================================= */
app.post(["/v1/auth/signup", "/api/auth/v1/auth/signup"], async (req, res) => {
    try {
        const parsed = zSignup.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.flatten()
            });
        }
        const { role, name, email, phone, password } = parsed.data;
        if (!email && !phone) {
            return res.status(400).json({
                error: "email_or_phone_required"
            });
        }
        // duplicate check
        const existing = await UserModel.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
            ]
        });
        if (existing) {
            return res.status(409).json({
                error: "user_already_exists"
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            role,
            name,
            email,
            phone,
            passwordHash
        });
        const accessToken = signAccessToken({
            sub: String(user._id),
            role,
            name
        });
        const refreshToken = signRefreshToken(String(user._id));
        return res.json({
            user: {
                _id: String(user._id),
                role,
                name,
                email,
                phone,
                createdAt: user.createdAt
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({
            error: "internal_server_error"
        });
    }
});
/* =======================================================
   LOGIN
   Supports BOTH:
   /v1/auth/login
   /api/auth/v1/auth/login
======================================================= */
app.post(["/v1/auth/login", "/api/auth/v1/auth/login"], async (req, res) => {
    try {
        const parsed = zLogin.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.flatten()
            });
        }
        const { email, phone, password } = parsed.data;
        if (!email && !phone) {
            return res.status(400).json({
                error: "email_or_phone_required"
            });
        }
        const user = await UserModel.findOne(email ? { email } : { phone });
        if (!user) {
            return res.status(401).json({
                error: "invalid_credentials"
            });
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({
                error: "invalid_credentials"
            });
        }
        const accessToken = signAccessToken({
            sub: String(user._id),
            role: user.role,
            name: user.name
        });
        const refreshToken = signRefreshToken(String(user._id));
        return res.json({
            user: {
                _id: String(user._id),
                role: user.role,
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            error: "internal_server_error"
        });
    }
});
/* -------------------- 404 -------------------- */
app.use((_req, res) => {
    res.status(404).json({
        error: "route_not_found"
    });
});
/* -------------------- Start -------------------- */
app.listen(env.PORT, () => {
    console.log(`[${env.SERVICE_NAME}] listening on :${env.PORT}`);
});
