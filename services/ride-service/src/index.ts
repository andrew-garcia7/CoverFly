import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { loadServiceEnv } from "@coverfly/config";
import { zRideCreateRequest } from "@coverfly/common";
import { connectMongo } from "./lib/db.js";
import { metricsMiddleware, registry } from "./lib/metrics.js";
import { RideModel } from "./models/Ride.js";
import { computePricing } from "./lib/pricing.js";

const env = loadServiceEnv("ride-service", 4002);
const allowedOrigins = Array.from(
  new Set([...env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean), "http://localhost:5173"])
);

void connectMongo(
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://mongo:27017/coverfly"
);
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

const mockDrivers = [
  {
    driverUserId: "mock-driver-1",
    name: "Amit Sharma",
    phone: "+919876543210",
    carModel: "Maruti Swift",
    carNumber: "KA-01-MA-4521",
    rating: 4.5
  },
  {
    driverUserId: "mock-driver-2",
    name: "Rahul Verma",
    phone: "+919812345678",
    carModel: "Hyundai i20",
    carNumber: "MH-12-RV-8834",
    rating: 4.7
  },
  {
    driverUserId: "mock-driver-3",
    name: "Suresh Yadav",
    phone: "+919901122334",
    carModel: "WagonR",
    carNumber: "DL-08-SY-1189",
    rating: 4.3
  }
] as const;

function randomDriver() {
  return mockDrivers[Math.floor(Math.random() * mockDrivers.length)]!;
}

function responseRide(ride: any) {
  return {
    _id: String(ride._id),
    riderUserId: ride.riderUserId,
    driverUserId: ride.driverUserId,
    status: ride.status,
    vehicleType: ride.vehicleType,
    pickup: ride.pickup,
    dropoff: ride.dropoff,
    pricing: ride.pricing,
    payment: ride.payment,
    safety: ride.safety,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt
  };
}

app.get("/healthz", (_req, res) => res.json({ ok: true, service: env.SERVICE_NAME }));
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", registry.contentType);
  res.send(await registry.metrics());
});

app.post("/v1/rides/quote", async (req, res) => {
  const parsed = zRideCreateRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { vehicleType, pickup, dropoff, features } = parsed.data;
  const pricing = computePricing({
    vehicleType,
    pickup: pickup.location,
    dropoff: dropoff.location,
    ecoRideSuggestion: features?.ecoRideSuggestion
  });
  res.json({ pricing });
});

app.post("/v1/rides", async (req, res) => {
  const parsed = zRideCreateRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { vehicleType, pickup, dropoff, payment, features } = parsed.data;

  // Demo auth: accept riderUserId header, else create anon
  const riderUserId = (req.header("x-rider-user-id") ?? "").trim();
  if (!riderUserId) {
    return res.status(401).json({ error: "rider_authentication_required", message: "Missing x-rider-user-id" });
  }

  const pricing = computePricing({
    vehicleType,
    pickup: pickup.location,
    dropoff: dropoff.location,
    ecoRideSuggestion: features?.ecoRideSuggestion
  });

  const ride = await RideModel.create({
    riderUserId,
    status: "REQUESTED",
    vehicleType,
    pickup,
    dropoff,
    pricing,
    payment,
    safety: { isSafetyModeOn: false, shareLinkToken: nanoid(16) }
  });

  res.status(201).json({ ride: responseRide(ride) });
});

// Uber-like convenience endpoint for the frontend booking flow.
app.post("/v1/rides/create", async (req, res) => {
  const parsed = zRideCreateRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { vehicleType, pickup, dropoff, payment, features } = parsed.data;

  const riderUserId = (req.header("x-rider-user-id") ?? "").trim();
  if (!riderUserId) {
    return res.status(401).json({ error: "rider_authentication_required", message: "Missing x-rider-user-id" });
  }
  const driver = randomDriver();

  const pricing = computePricing({
    vehicleType,
    pickup: pickup.location,
    dropoff: dropoff.location,
    ecoRideSuggestion: features?.ecoRideSuggestion
  });

  const eta = Math.max(3, Math.min(18, Math.round(pricing.estimatedDurationMin * 0.45)));

  const ride = await RideModel.create({
    riderUserId,
    driverUserId: driver.driverUserId,
    status: "ASSIGNED",
    vehicleType,
    pickup,
    dropoff,
    pricing,
    payment,
    safety: { isSafetyModeOn: false, shareLinkToken: nanoid(16) }
  });

  res.status(201).json({
    ride: responseRide(ride),
    driverAssigned: {
      driverName: driver.name,
      phone: driver.phone,
      carModel: driver.carModel,
      carNumber: driver.carNumber,
      rating: driver.rating,
      eta,
      price: pricing.total.amountPaise / 100
    }
  });
});

// Must be registered before /v1/rides/:id — otherwise "byRider" is captured as :id.
app.get("/v1/rides/byRider/:riderUserId", async (req, res) => {
  const rides = await RideModel.find({ riderUserId: req.params.riderUserId }).sort({ createdAt: -1 }).limit(30);
  res.json({ rides: rides.map((r) => responseRide(r)) });
});

app.get("/v1/rides/:id", async (req, res) => {
  const ride = await RideModel.findById(req.params.id);
  if (!ride) return res.status(404).json({ error: "not_found" });
  res.json({ ride: responseRide(ride) });
});

app.post("/v1/rides/:id/status", async (req, res) => {
  const status = String(req.body?.status ?? "");
  const allowed = new Set(["REQUESTED", "MATCHING", "ASSIGNED", "DRIVER_ARRIVING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
  if (!allowed.has(status)) return res.status(400).json({ error: "invalid_status" });
  const ride = await RideModel.findById(req.params.id);
  if (!ride) return res.status(404).json({ error: "not_found" });
  ride.status = status as any;
  await ride.save();
  res.json({ ride: responseRide(ride) });
});

app.post("/v1/rides/:id/safety/share", async (req, res) => {
  const ride = await RideModel.findById(req.params.id);
  if (!ride) return res.status(404).json({ error: "not_found" });
  const baseUrl = req.header("x-public-base-url") ?? "http://localhost:3000";
  const token = ride.safety.shareLinkToken ?? nanoid(16);
  ride.safety.shareLinkToken = token;
  ride.safety.isSafetyModeOn = true;
  await ride.save();
  res.json({ shareUrl: `${baseUrl}/safety/${token}` });
});

app.get("/v1/safety/:token", async (req, res) => {
  const ride = await RideModel.findOne({ "safety.shareLinkToken": req.params.token });
  if (!ride) return res.status(404).json({ error: "not_found" });
  res.json({
    ride: {
      _id: String(ride._id),
      status: ride.status,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      vehicleType: ride.vehicleType,
      driverUserId: ride.driverUserId
    }
  });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[${env.SERVICE_NAME}] listening on :${env.PORT}`);
});

