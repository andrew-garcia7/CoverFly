import { motion } from "framer-motion";
import { BadgeCheck, CircleAlert, ReceiptIndianRupee, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  LS_PAYMENTS,
  readJson,
  writeJson,
  type StoredPayment
} from "../../lib/ridePaymentStorage.ts";

export function PaymentHistoryPage() {
  const [payments, setPayments] = useState<StoredPayment[]>(
    useMemo(() => readJson<StoredPayment[]>(LS_PAYMENTS, []), [])
  );

  function deletePayment(id: string) {
    const updated = payments.filter((p) => p.transactionId !== id);
    writeJson(LS_PAYMENTS, updated);
    setPayments(updated);
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-xs tracking-[0.25em] text-slate-500">PAYMENTS</div>
        <h1 className="text-4xl font-bold text-slate-900 mt-2">
          Payment history
        </h1>
        <p className="text-slate-500 mt-2">
          Razorpay + mock transactions overview
        </p>
      </motion.div>

      {/* EMPTY STATE */}
      {payments.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 p-10 text-center text-slate-500 shadow-sm">
          No payments yet 🚀
        </div>
      ) : (
        <div className="space-y-5">
          {payments.map((p, i) => (
            <motion.div
              key={p.transactionId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              
              className="relative rounded-3xl p-[1px] bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200"
            >
              {/* CARD */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-5 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">

                <div className="flex justify-between items-start gap-4">

                  {/* LEFT */}
                  <div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <ReceiptIndianRupee className="h-5 w-5 text-indigo-500" />
                      {(p.amountPaise / 100).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR"
                      })}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {p.transactionId}
                    </div>

                    <div className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleString()} • {p.method}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">

                    {/* STATUS */}
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === "success"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {p.status === "success" ? (
                        <BadgeCheck className="h-4 w-4" />
                      ) : (
                        <CircleAlert className="h-4 w-4" />
                      )}
                      {p.status}
                    </div>

                    {/* DELETE */}
                    <button
                      onClick={() => deletePayment(p.transactionId)}
                      className="p-2 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* FLOATING GRADIENT EFFECT */}
                <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition pointer-events-none bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 blur-xl"></div>

              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}