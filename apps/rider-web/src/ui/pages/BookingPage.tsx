import { motion } from "framer-motion";
import { BookingCard } from "../ride/BookingCard.tsx";
import { BookingMap } from "../ride/BookingMap.tsx";
import type { LatLng } from "../ride/LocationAutocompleteField.tsx";
import { useState } from "react";

const DEFAULT_PICKUP: LatLng = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_DROPOFF: LatLng = { lat: 12.987, lng: 77.62 };

export function BookingPage() {
  const [pickupPlace, setPickupPlace] = useState<{
    address: string;
    location: LatLng;
  } | null>(null);

  const [dropoffPlace, setDropoffPlace] = useState<{
    address: string;
    location: LatLng;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const pickup = pickupPlace?.location ?? DEFAULT_PICKUP;
  const dropoff = dropoffPlace?.location ?? DEFAULT_DROPOFF;

  const trackingActive = Boolean(pickupPlace && dropoffPlace);

  function randomFare() {
    return Math.floor(Math.random() * 250) + 180;
  }

  function handleBookRide() {
    setLoading(true);

    setTimeout(() => {
      const fare = randomFare() * 100;

      const checkoutData = {
        ride: {
          _id: "RIDE" + Date.now(),

          pickup: {
            address: pickupPlace?.address || "Majestic, Bengaluru"
          },

          dropoff: {
            address: dropoffPlace?.address || "Indiranagar, Bengaluru"
          },

          pricing: {
            estimatedDistanceKm: 8,
            estimatedDurationMin: 22,

            total: {
              amountPaise: fare
            }
          }
        },

        driverAssigned: {
          driverName: "Rahul Sharma",
          phone: "9876543210",
          carModel: "Swift Dzire",
          carNumber: "WB24AB1020",
          rating: 4.9,
          eta: 4
        },

        selectedPaymentMethod: "UPI",
        ts: Date.now()
      };

      localStorage.setItem(
        "coverfly_pending_payment",
        JSON.stringify(checkoutData)
      );

      setLoading(false);

      window.location.href = "/payments/checkout";
    }, 1800);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-xs tracking-[0.24em] text-slate-600">
          BOOK
        </div>

        <div className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">
          Book your ride
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MAP */}
        <div className="lg:col-span-2 rounded-3xl cf-glass-light p-3 md:p-4">
          <BookingMap
            pickup={pickup}
            dropoff={dropoff}
            trackingActive={trackingActive}
          />
        </div>

        {/* RIGHT CARD */}
        <div className="rounded-3xl cf-glass p-4 md:p-6 text-white">
          <div className="text-sm tracking-[0.22em] text-white/70">
            BOOKING
          </div>

          <div className="mt-1 text-2xl font-semibold">
            Trip details
          </div>

          <div className="mt-4">
            <BookingCard
              onPickupChange={setPickupPlace}
              onDropoffChange={setDropoffPlace}
            />
          </div>

          <button
            onClick={handleBookRide}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Searching driver..." : "Book Ride"}
          </button>

          {loading && (
            <div className="mt-3 text-sm text-white/80">
              Matching you with nearby drivers...
            </div>
          )}

          {!loading && (
            <div className="mt-3 text-sm text-emerald-300">
              Ready to book your ride.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}