import { motion } from "framer-motion";
import {
  CircleAlert,
  MapPin,
  Star,
  Clock,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../shell/ToastProvider.tsx";
import { useAuth } from "../../state/auth";
import {
  LS_LAST_RIDE,
  appendPayment,
  appendRide,
  readJson,
  writeJson,
} from "../../lib/ridePaymentStorage.ts";

type PaymentMethod = "UPI" | "CARD" | "CASH";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function formatINR(paise: number) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { user } = useAuth();

  const [checkout, setCheckout] = useState<any>(null);
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = readJson<any>("coverfly_pending_payment", null);
    setCheckout(raw);
  }, []);

  if (!user?._id) {
    return (
      <EmptyState
        title="Login Required"
        desc="Please login first."
        btn="Login"
        go={() => navigate("/login")}
      />
    );
  }

  if (!checkout) {
    return (
      <EmptyState
        title="No pending payment"
        desc="Book a ride first."
        btn="Book Ride"
        go={() => navigate("/book")}
      />
    );
  }

  const ride = checkout.ride;
  const driver = checkout.driverAssigned;
  const pricing = ride.pricing;
  const amountPaise = pricing.total.amountPaise;

  async function paymentSuccess(paymentId: string, provider: "razorpay" | "mock") {
    appendPayment({
      transactionId: paymentId,
      rideId: ride._id,
      amountPaise,
      method,
      status: "success",
      provider,
      createdAt: new Date().toISOString(),
    });

    appendRide({
      ...checkout,
      paid: true,
      status: "CONFIRMED",
      paidAt: new Date().toISOString(),
    });

    writeJson(LS_LAST_RIDE, {
      ...checkout,
      paid: true,
      status: "CONFIRMED",
    });

    localStorage.removeItem("coverfly_pending_payment");

    setSuccess(true);
    push("Payment successful 🎉", "success");

    setTimeout(() => navigate("/"), 2200);
  }

  async function onPayNow() {
    setBusy(true);
    setError("");

    try {
      if (method === "CASH") {
        await paymentSuccess("cash_" + Date.now(), "mock");
        return;
      }

      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        await paymentSuccess("mock_" + Date.now(), "mock");
        return;
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amountPaise,
        currency: "INR",
        name: "CoverFly",
        description: "Ride Payment",

        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },

        theme: {
          color: "#7c3aed",
        },

        handler: async function (resp: any) {
          await paymentSuccess(
            resp.razorpay_payment_id || "rzp_" + Date.now(),
            "razorpay"
          );
        },

        modal: {
          ondismiss: () => {
            setBusy(false);
            setError("Payment cancelled");
          },
        },
      });

      setBusy(false);
      rzp.open();
    } catch (err) {
      console.error(err);
      setBusy(false);
      setError("Payment failed");
    }
  }

  if (success) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl bg-white p-10 text-center shadow-2xl w-[420px]"
      >
        <div className="text-6xl">✅</div>

        <div className="mt-4 text-3xl font-bold text-emerald-600">
          Payment Successful
        </div>

        <div className="mt-2 text-slate-500">
          Ride booked successfully
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-left">
          <div>Receipt ID: TXN{Date.now()}</div>
          <div>Amount: {formatINR(amountPaise)}</div>
          <div>Status: Paid</div>
        </div>

        <div className="mt-5 text-sm text-slate-400">
          Redirecting to Home...
        </div>
      </motion.div>
    </div>
  );
}
    

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* LEFT */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-3xl bg-gradient-to-r from-violet-700 to-pink-600 p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
                {driver.driverName[0]}
              </div>

              <div className="flex-1">
                <div className="text-xl font-bold">{driver.driverName}</div>

                <div className="mt-1 flex gap-3 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                    {driver.rating}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {driver.eta} min
                  </span>
                </div>

                <div className="mt-2 text-sm">{driver.carModel}</div>
                <div className="text-xs">{driver.carNumber}</div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatINR(amountPaise)}
                </div>
                <div className="text-xs text-white/70">Total Fare</div>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400">ROUTE</div>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-emerald-500" />
                <div>{ride.pickup.address}</div>
              </div>

              <div className="flex gap-3">
                <MapPin className="text-rose-500" />
                <div>{ride.dropoff.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400">
              PAYMENT METHOD
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["UPI", "CARD", "CASH"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-2xl py-3 text-sm font-bold ${
                    method === m
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              onClick={onPayNow}
              disabled={busy}
              className="mt-5 w-full rounded-2xl bg-linear-to-r from-violet-600 to-pink-600 py-3 font-bold text-white"
            >
              {busy ? "Preparing checkout..." : `Pay ${formatINR(amountPaise)}`}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
              <Shield className="h-3 w-3" />
              Secured by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  btn,
  go,
}: {
  title: string;
  desc: string;
  btn: string;
  go: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <CircleAlert className="mx-auto h-10 w-10 text-slate-400" />
        <div className="mt-4 text-xl font-bold">{title}</div>
        <div className="mt-2 text-slate-500">{desc}</div>

        <button
          onClick={go}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-white"
        >
          {btn}
        </button>
      </div>
    </div>
  );
}