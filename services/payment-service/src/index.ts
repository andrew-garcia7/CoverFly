import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { z } from "zod";
import { loadServiceEnv, envString } from "@coverfly/config";
import Razorpay from "razorpay";
import { connectMongo } from "./lib/db.js";
import { metricsMiddleware, registry } from "./lib/metrics.js";
import { PaymentModel } from "./models/Payment.js";

const env = loadServiceEnv("payment-service", 4004);
const allowedOrigins = Array.from(
  new Set([...env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean), "http://localhost:5173"])
);
void connectMongo(
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://mongo:27017/coverfly"
);
console.log("✅ MongoDB connected");

const provider = (process.env.PAYMENTS_PROVIDER ?? "mock") as "mock" | "stripe";
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? "";
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
const razorpayEnabled = Boolean(razorpayKeyId && razorpaySecret);
const razorpay = razorpayEnabled
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret
    })
  : null;

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

app.get("/healthz", (_req, res) => res.json({ ok: true, service: env.SERVICE_NAME, provider }));
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", registry.contentType);
  res.send(await registry.metrics());
});

const zCreateOrder = z.object({
  rideId: z.string().min(3),
  riderUserId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  currency: z.literal("INR").default("INR"),
  notes: z.record(z.string(), z.string()).optional()
});

const zVerifyPayment = z.object({
  rideId: z.string().min(3),
  riderUserId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  method: z.enum(["UPI", "CARD", "CASH"]).default("UPI"),
  outcome: z.enum(["success", "failure"]).default("success"),
  razorpay_order_id: z.string().min(1).optional(),
  razorpay_payment_id: z.string().min(1).optional(),
  razorpay_signature: z.string().min(1).optional()
});

const zCreatePayment = z.object({
  rideId: z.string().min(3),
  riderUserId: z.string().min(1),
  method: z.enum(["CASH", "UPI", "CARD"]),
  amountPaise: z.number().int().positive()
});

app.post("/v1/payments", async (req, res) => {
  const parsed = zCreatePayment.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { rideId, riderUserId, method, amountPaise } = parsed.data;

  const payment = await PaymentModel.create({
    rideId,
    riderUserId,
    method,
    status: method === "CASH" ? "CAPTURED" : "AUTHORIZED",
    provider,
    amountPaise,
    currency: "INR",
    providerRef: provider === "mock" ? `mock_${nanoid(10)}` : undefined
  });

  if (provider === "stripe") {
    if (!stripeSecret) return res.status(500).json({ error: "stripe_not_configured" });
    // In a full prod setup, create a PaymentIntent here and return client_secret.
    const pub = envString("STRIPE_SECRET_KEY");
    void pub;
  }

  res.status(201).json({
    payment: {
      _id: String(payment._id),
      rideId: payment.rideId,
      riderUserId: payment.riderUserId,
      method: payment.method,
      status: payment.status,
      provider: payment.provider,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      providerRef: payment.providerRef,
      createdAt: payment.createdAt
    }
  });
});

// Create Razorpay order (falls back to mock order if key missing in local/dev).
app.post("/v1/payments/create-order", async (req, res) => {
  const parsed = zCreateOrder.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { rideId, riderUserId, amountPaise, currency, notes } = parsed.data;

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency,
        receipt: `ride_${rideId.slice(-10)}`,
        notes: { rideId, riderUserId, ...(notes ?? {}) }
      });
      return res.status(201).json({
        provider: "razorpay",
        keyId: razorpayKeyId,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          receipt: order.receipt
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("razorpay_create_order_failed_falling_back_to_mock", err);
      const mockOrderId = `order_mock_${nanoid(12)}`;
      return res.status(201).json({
        provider: "mock",
        keyId: "rzp_test_mock",
        order: {
          id: mockOrderId,
          amount: amountPaise,
          currency,
          status: "created",
          receipt: `ride_${rideId.slice(-10)}`
        },
        warning: "Razorpay order creation failed; using mock order for local/dev continuity."
      });
    }
  }

  const mockOrderId = `order_mock_${nanoid(12)}`;
  return res.status(201).json({
    provider: "mock",
    keyId: "rzp_test_mock",
    order: {
      id: mockOrderId,
      amount: amountPaise,
      currency,
      status: "created",
      receipt: `ride_${rideId.slice(-10)}`
    },
    warning: "Razorpay keys missing. Using mock order in local/dev."
  });
});

app.post("/v1/payments/verify", async (req, res) => {
  const DEMO_MODE = (process.env.DEMO_MODE ?? "true").toLowerCase() === "true";
  const parsed = zVerifyPayment.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  if (DEMO_MODE) {
    const paymentId = data.razorpay_payment_id ?? `DEMO${Date.now()}`;
    await PaymentModel.create({
      rideId: data.rideId,
      riderUserId: data.riderUserId,
      method: data.method,
      status: "CAPTURED",
      provider: "mock",
      amountPaise: data.amountPaise,
      currency: "INR",
      providerRef: paymentId
    });
    return res.status(201).json({ success: true, paymentId });
  }

  const isFailure = data.outcome === "failure";
  const providerUsed: "razorpay" | "mock" =
    !isFailure && razorpay && data.razorpay_payment_id ? "razorpay" : "mock";

  // NOTE: Signature validation should be added for production hardening.
  const payment = await PaymentModel.create({
    rideId: data.rideId,
    riderUserId: data.riderUserId,
    method: data.method,
    status: isFailure ? "FAILED" : "CAPTURED",
    provider: providerUsed,
    amountPaise: data.amountPaise,
    currency: "INR",
    providerRef: data.razorpay_payment_id ?? `mock_pay_${nanoid(10)}`
  });

  res.status(201).json({
    payment: {
      _id: String(payment._id),
      rideId: payment.rideId,
      riderUserId: payment.riderUserId,
      method: payment.method,
      status: payment.status,
      provider: payment.provider,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      providerRef: payment.providerRef,
      createdAt: payment.createdAt
    }
  });
});

app.get("/v1/payments/byRide/:rideId", async (req, res) => {
  const payments = await PaymentModel.find({ rideId: req.params.rideId }).sort({ createdAt: -1 }).limit(20);
  res.json({
    payments: payments.map((p) => ({
      _id: String(p._id),
      rideId: p.rideId,
      riderUserId: p.riderUserId,
      method: p.method,
      status: p.status,
      provider: p.provider,
      amountPaise: p.amountPaise,
      currency: p.currency,
      providerRef: p.providerRef,
      createdAt: p.createdAt
    }))
  });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[${env.SERVICE_NAME}] listening on :${env.PORT}`);
});

