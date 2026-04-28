import { motion } from "framer-motion";
import { useAuth } from "../../state/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiBase } from "../../lib/api.ts";

import {
  User,
  Mail,
  Phone,
  Star,
  CreditCard,
  Plus,
  ArrowRight
} from "lucide-react";

export function CustomerPage() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [lastRide, setLastRide] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    if (!user?._id) return;

    fetch(`${apiBase}/api/rides/v1/rides/byRider/${user._id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setRides(data.rides || []);
        setLastRide(data.rides?.[0]);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 px-4 py-8">
      <div className="mx-auto max-w-[1200px]">

        {/* 🔥 HEADER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-xs tracking-widest text-slate-500">YOUR PROFILE</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            Welcome back, {user?.name}
          </div>
        </motion.div>

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* 🔥 PROFILE CARD */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl p-6 overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 to-pink-200 blur-xl opacity-30 rounded-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <User />
                </div>

                <div>
                  <div className="text-lg font-semibold">{user?.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    Premium Rider <Star className="h-3 w-3 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {user?.phone}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div className="font-bold">{rides.length}</div>
                  <div className="text-xs text-slate-500">Rides</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div className="font-bold">4.8 ⭐</div>
                  <div className="text-xs text-slate-500">Rating</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
                  <div className="font-bold">₹2.3k</div>
                  <div className="text-xs text-slate-500">Spent</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
  onClick={() => navigate("/book")}
  className="flex-1 py-2 rounded-xl bg-indigo-500 text-white shadow hover:bg-indigo-600 active:scale-95 transition"
>
  Book Ride
</button>
                <button
  onClick={() => navigate("/payments")}
  className="flex-1 py-2 rounded-xl bg-black text-white shadow hover:bg-gray-900 active:scale-95 transition"
>
  Add Card
</button>
              </div>
            </div>
          </motion.div>

          {/* 🔥 LAST RIDE HERO */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-2 relative rounded-3xl p-6 shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_white,_transparent)]" />

            <div className="relative z-10">
              <div className="text-sm opacity-80">Last Ride</div>

              {lastRide ? (
                <>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <div className="text-xs opacity-70">Pickup</div>
                      <div className="font-semibold text-lg">
                        {lastRide.pickup?.address}
                      </div>
                    </div>

                    <ArrowRight />

                    <div>
                      <div className="text-xs opacity-70">Drop</div>
                      <div className="font-semibold text-lg">
                        {lastRide.dropoff?.address}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm">
                      Driver:{" "}
                      <span className="font-semibold">
                        {lastRide.driverAssigned?.driverName || "Assigned"}
                      </span>
                    </div>

                    <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                      {lastRide.status}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 text-sm opacity-80">
                  No rides yet. Book your first ride 🚀
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* 🔥 RECENT RIDES */}
        <div className="mt-8">
          <div className="text-lg font-semibold text-slate-900">
            Recent Rides
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {rides.map((r) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={r._id}
                className="group relative p-4 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-slate-100"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="font-semibold">
                    {r.pickup?.address} → {r.dropoff?.address}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>

                  <div className="flex justify-between mt-3">
                    <div className="text-sm text-slate-600">
                      {r.vehicleType}
                    </div>

                    <div className="font-semibold">
                      ₹{(r.pricing?.total?.amountPaise || 0) / 100}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {rides.length === 0 && (
              <div className="p-6 rounded-2xl bg-white text-center text-slate-500 shadow">
                No rides yet
              </div>
            )}
          </div>
        </div>

        {/* 🔥 PAYMENT METHODS */}
        <div className="mt-10">
          <div className="text-lg font-semibold text-slate-900">
            Payment Methods
          </div>

          <div className="flex gap-3 mt-4 flex-wrap">
            {["Card •••• 5555", "UPI", "Cash"].map((p) => (
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-slate-800 flex items-center gap-2 shadow-sm">
                <CreditCard className="h-4 w-4" />
                {p}
              </div>
            ))}

            <button className="px-4 py-2 rounded-full bg-black text-white flex items-center gap-2 shadow">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}