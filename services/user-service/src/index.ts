import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";
import { loadServiceEnv } from "@coverfly/config";
import { connectMongo } from "./lib/db.js";
import { metricsMiddleware, registry } from "./lib/metrics.js";
import { DriverModel } from "./models/Driver.js";
import { seedDrivers } from "./seed/drivers.js";

const env = loadServiceEnv("user-service", 4002);
const allowedOrigins = Array.from(
  new Set([...env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean), "http://localhost:5173"])
);

await connectMongo(env.MONGODB_URI);
console.log("✅ MongoDB connected");

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(metricsMiddleware);

app.get("/healthz", (_req, res) => res.json({ ok: true, service: env.SERVICE_NAME }));
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", registry.contentType);
  res.send(await registry.metrics());
});

app.post("/v1/drivers/seed", async (_req, res) => {
  const existing = await DriverModel.countDocuments();
  if (existing > 0) return res.json({ ok: true, skipped: true, existing });
  await DriverModel.insertMany(seedDrivers);
  res.json({ ok: true, inserted: seedDrivers.length });
});

app.get("/v1/drivers", async (req, res) => {
  const vehicleType = req.query.vehicleType?.toString();
  const isOnline = req.query.isOnline?.toString();

  const q: Record<string, unknown> = {};
  if (vehicleType) q.vehicleType = vehicleType;
  if (isOnline === "true") q.isOnline = true;
  if (isOnline === "false") q.isOnline = false;

  const drivers = await DriverModel.find(q).sort({ isOnline: -1, rating: -1 }).limit(100);
  res.json(
    drivers.map((d) => ({
      _id: String(d._id),
      userId: d.userId,
      name: d.name,
      phone: d.phone,
      rating: d.rating,
      totalTrips: d.totalTrips,
      acceptanceRate: d.acceptanceRate,
      cancellationRate: d.cancellationRate,
      vehicleType: d.vehicleType,
      vehiclePlate: d.vehiclePlate,
      vehicleModel: d.vehicleModel,
      isOnline: d.isOnline,
      lastLocation: d.lastLocation
    }))
  );
});

const zDriverPatch = z.object({
  isOnline: z.boolean().optional(),
  lastLocation: z.object({ lat: z.number(), lng: z.number() }).optional()
});

app.patch("/v1/drivers/:id", async (req, res) => {
  const parsed = zDriverPatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await DriverModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[${env.SERVICE_NAME}] listening on :${env.PORT}`);
});

