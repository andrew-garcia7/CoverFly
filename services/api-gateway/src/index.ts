import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "node:http";
import { metricsMiddleware, registry } from "./metrics.js";

const app = express();
app.disable("x-powered-by");

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN =
  process.env.CORS_ORIGIN ??
  "http://localhost:5173,http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:5173";
const allowedOrigins = Array.from(
  new Set(CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean))
);

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://auth-service:4001";
const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL ?? "http://ride-service:4002";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL ?? "http://payment-service:4004";

app.use(helmet());
app.use(
  cors({
    origin(_origin, cb) {
      return cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-rider-user-id"]
  })
);

app.options(/.*/, cors());

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(metricsMiddleware);

app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    service: "api-gateway",
    upstreams: {
      auth: AUTH_SERVICE_URL,
      rides: RIDE_SERVICE_URL,
      payments: PAYMENT_SERVICE_URL
    }
  });
});

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", registry.contentType);
  res.send(await registry.metrics());
});

function proxyTo(target: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 30_000,
    timeout: 30_000,
    agent: new http.Agent({ keepAlive: true }),
    on: {
      error(err: unknown, _req: unknown, res: unknown) {
        // Always return a response (avoid connection reset / hanging sockets)
        const msg = (err as any)?.code ? String((err as any).code) : "upstream_error";
        const r = res as express.Response;
        if (!r.headersSent) r.status(502);
        r.json({ error: "bad_gateway", message: msg, target });
      }
    }
  });
}

app.use("/api/auth", proxyTo(AUTH_SERVICE_URL));
app.use("/api/rides", proxyTo(RIDE_SERVICE_URL));
app.use("/api/payments", proxyTo(PAYMENT_SERVICE_URL));

app.get("/", (_req, res) => res.send("CoverFly API Gateway Running"));

app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`[api-gateway] listening on :${PORT}`);
});