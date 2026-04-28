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
const allowedOrigins = Array.from(
  new Set([
    ...env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean),
    "http://localhost:8081",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ])
);

/* -------------------- MongoDB -------------------- */
void connectMongo(
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://mongo:27017/coverfly"
);

/* -------------------- App -------------------- */
const app = express();
app.disable("x-powered-by");

/* -------------------- Security -------------------- */
app.use(helmet());

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin(origin, callback) {
      // allow Postman / curl / no-origin requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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

function getBearerToken(req: express.Request): string | null {
  const h = req.header("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1] ?? null;
}

app.get(["/v1/auth/me", "/api/auth/v1/auth/me"], async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "missing_token" });
    const { verifyToken } = await import("./lib/jwt.js");
    const decoded: any = verifyToken(token);
    const userId = String(decoded?.sub ?? "");
    if (!userId) return res.status(401).json({ error: "invalid_token" });

    // If DB isn't connected yet, return a clear 503 (demo-friendly).
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "db_unavailable" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "user_not_found" });
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
  } catch (err) {
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
  name: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(1).optional()
});

const zLogin = z.object({
  email: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(1).optional()
});

/* =======================================================
   SIGNUP
   Supports BOTH:
   /v1/auth/signup
   /api/auth/v1/auth/signup
======================================================= */

app.post(
  ["/v1/auth/signup", "/api/auth/v1/auth/signup"],
  async (req, res) => {
    try {
      const DEMO_MODE = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
      const parsed = zSignup.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.flatten()
        });
      }

      const role = parsed.data.role;
      const name = (parsed.data.name ?? "Demo User").trim() || "Demo User";
      const emailRaw = (parsed.data.email ?? "").trim();
      const phoneRaw = (parsed.data.phone ?? "").trim();
      const password = (parsed.data.password ?? "demo").trim() || "demo";

      // Demo mode requirements: accept anything and never block on duplicates.
      const email = emailRaw || (DEMO_MODE ? `demo_${Date.now()}@coverfly.demo` : "");
      const phone = phoneRaw || undefined;

      const passwordHash = await bcrypt.hash(password, 10);

      const user =
        (await UserModel.findOneAndUpdate(
          email ? { email } : { phone },
          {
            $setOnInsert: {
              role,
              name,
              email: email || undefined,
              phone,
              passwordHash
            },
            $set: DEMO_MODE
              ? {
                  // keep demo users updatable without breaking subsequent logins
                  role,
                  name,
                  email: email || undefined,
                  phone: phone || undefined,
                  passwordHash
                }
              : {}
          },
          { new: true, upsert: true }
        ))!;

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
    } catch (error) {
      console.error("Signup Error:", error);

      return res.status(500).json({
        error: "internal_server_error"
      });
    }
  }
);

/* =======================================================
   LOGIN
   Supports BOTH:
   /v1/auth/login
   /api/auth/v1/auth/login
======================================================= */

app.post(
  ["/v1/auth/login", "/api/auth/v1/auth/login"],
  async (req, res) => {
    try {
      const DEMO_MODE = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
      const parsed = zLogin.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.flatten()
        });
      }

      const emailRaw = (parsed.data.email ?? "").trim();
      const phoneRaw = (parsed.data.phone ?? "").trim();
      const password = (parsed.data.password ?? "demo").trim() || "demo";

      const email = emailRaw || (DEMO_MODE ? `demo_${Date.now()}@coverfly.demo` : "");
      const phone = phoneRaw || undefined;

      let user = await UserModel.findOne(email ? { email } : { phone });

      // Demo mode requirement: auto-create if user doesn't exist.
      if (!user && DEMO_MODE) {
        const passwordHash = await bcrypt.hash(password, 10);
        user = await UserModel.create({
          role: "RIDER",
          name: "Demo User",
          email: email || undefined,
          phone,
          passwordHash
        });
      }

      if (!user) {
        return res.status(401).json({ error: "invalid_credentials" });
      }

      // Demo mode requirement: never fail for simple credentials.
      if (!DEMO_MODE) {
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: "invalid_credentials" });
      }

      const accessToken = signAccessToken({
        sub: String(user._id),
        role: user.role,
        name: user.name
      });

      const refreshToken = signRefreshToken(
        String(user._id)
      );

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
    } catch (error) {
      console.error("Login Error:", error);

      return res.status(500).json({
        error: "internal_server_error"
      });
    }
  }
);

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