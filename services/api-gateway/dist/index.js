import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { metricsMiddleware, registry } from "./metrics.js";
const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = Array.from(new Set([
    ...(process.env.CORS_ORIGIN ?? "http://localhost:3000")
        .split(",")
        .map((s) => s.trim()),
    "http://localhost:5173",
    "http://localhost:8081"
]));
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:4001";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "http://localhost:4003";
const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL ?? "http://localhost:4002";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL ?? "http://localhost:4004";
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL ?? "http://localhost:4010";
const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(metricsMiddleware);
app.get("/healthz", (_req, res) => {
    res.json({ ok: true, service: "api-gateway" });
});
app.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", registry.contentType);
    res.send(await registry.metrics());
});
/* AUTH */
app.use("/api/auth", createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" }
}));
/* USERS */
app.use("/api/users", createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" }
}));
/* RIDES */
app.use("/api/rides", createProxyMiddleware({
    target: RIDE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        console.log("RIDES IN :", path);
        const newPath = path.replace(/^\/api\/rides/, "");
        console.log("RIDES OUT:", newPath);
        return newPath;
    }
}));
/* PAYMENTS */
app.use("/api/payments", createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/payments": "" }
}));
/* REALTIME */
app.use("/api/realtime", createProxyMiddleware({
    target: REALTIME_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/realtime": "" }
}));
app.listen(PORT, () => {
    console.log(`[api-gateway] listening on :${PORT}`);
});
