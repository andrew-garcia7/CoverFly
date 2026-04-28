import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import { z } from "zod";
import { loadServiceEnv } from "@coverfly/config";
import { connectMongo } from "./lib/db.js";
import { metricsMiddleware, registry } from "./lib/metrics.js";
import { DriverLocationModel } from "./models/DriverLocation.js";

const env = loadServiceEnv("realtime-service", 4010);
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Rooms:
// - ride:<rideId> (rider + driver)
// - driver:<driverId> (driver specific)
io.on("connection", (socket) => {
  socket.on("joinRide", ({ rideId }: { rideId: string }) => {
    socket.join(`ride:${rideId}`);
  });

  socket.on("joinDriver", ({ driverId }: { driverId: string }) => {
    socket.join(`driver:${driverId}`);
  });
});

const zLocationUpdate = z.object({
  driverId: z.string().min(1),
  rideId: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  heading: z.number().optional(),
  speedKmph: z.number().optional()
});

app.post("/v1/realtime/location", async (req, res) => {
  const parsed = zLocationUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const update = parsed.data;

  await DriverLocationModel.findOneAndUpdate(
    { driverId: update.driverId },
    update,
    { upsert: true, new: true }
  );

  if (update.rideId) io.to(`ride:${update.rideId}`).emit("driverLocation", update);
  io.to(`driver:${update.driverId}`).emit("driverLocation", update);

  res.json({ ok: true });
});

app.get("/v1/realtime/location/:driverId", async (req, res) => {
  const doc = await DriverLocationModel.findOne({ driverId: req.params.driverId });
  if (!doc) return res.status(404).json({ error: "not_found" });
  res.json({
    driverId: doc.driverId,
    rideId: doc.rideId,
    lat: doc.lat,
    lng: doc.lng,
    heading: doc.heading,
    speedKmph: doc.speedKmph,
    updatedAt: doc.updatedAt
  });
});

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[${env.SERVICE_NAME}] listening on :${env.PORT}`);
});

