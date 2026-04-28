import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";
import { apiBase } from "../../lib/api.ts";
import { MapPin, Car, IndianRupee } from "lucide-react";
import { LS_RIDES, readJson } from "../../lib/ridePaymentStorage.ts";

export function RideHistoryPage() {
  const { user, accessToken } = useAuth();

  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    const localRides = readJson<any[]>(LS_RIDES, []);

    async function load() {
      try {
        if (!user?._id) {
          setRides(localRides);
          return;
        }

        const res = await fetch(
          `${apiBase}/api/rides/v1/rides/byRider/${user._id}`,
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          }
        );

        if (!res.ok) {
          setRides(localRides);
          return;
        }

        const data = await res.json();

        const backend = data.rides || [];

        setRides([...localRides, ...backend]);
      } catch {
        setRides(localRides);
      }
    }

    load();
  }, [user, accessToken]);

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-xs tracking-[0.25em] text-slate-500">
          YOUR RIDES
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mt-2">
          Ride history
        </h1>

        <p className="text-slate-500 mt-2">
          Completed and recent bookings
        </p>
      </motion.div>

      {/* LIST */}
      <div className="grid gap-5">
        {rides.map((r: any, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all"
          >
            {/* TOP */}
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg text-slate-900">
                Ride #{String(r.ride?._id || r._id).slice(-6)}
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                Completed
              </div>
            </div>

            {/* BODY */}
            <div className="mt-5 space-y-4 text-slate-700">

              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <span>
                  {r.ride?.pickup?.address ||
                    r.pickup?.address ||
                    "Pickup Location"}
                </span>
              </div>

              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <span>
                  {r.ride?.dropoff?.address ||
                    r.dropoff?.address ||
                    "Drop Location"}
                </span>
              </div>

              <div className="flex gap-3">
                <Car className="h-5 w-5 text-indigo-500" />
                <span>
                  {r.driverAssigned?.carModel || "Mini"}
                </span>
              </div>

              <div className="flex gap-3 font-bold text-lg text-slate-900">
                <IndianRupee className="h-5 w-5" />
                {(
                  (r.ride?.pricing?.total?.amountPaise ||
                    r.pricing?.total?.amountPaise ||
                    0) / 100
                ).toFixed(2)}
              </div>
            </div>
          </motion.div>
        ))}

        {/* EMPTY */}
        {rides.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            No rides yet 🚗
          </div>
        )}
      </div>
    </div>
  );
}