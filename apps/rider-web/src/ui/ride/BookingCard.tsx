import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { getMapsApiKey, useCoverflyGoogleMaps } from "../../lib/googleMapsLoader.ts";
import { LS_PENDING_CHECKOUT, writeJson } from "../../lib/ridePaymentStorage.ts";
import { VEHICLES, type VehicleKey } from "./vehicleCatalog.ts";
import { VehicleCard } from "./VehicleCard.tsx";
import {
  getHomePlace,
  getRecentPlaces,
  getWorkPlace,
  pushRecentPlace,
  type SavedPlace
} from "./locationStorage.ts";
import {
  LocationAutocompleteField,
  LocationTextFallback,
  type LatLng
} from "./LocationAutocompleteField.tsx";

type PaymentMethod = "CASH" | "UPI" | "CARD";
type Stage = "idle" | "searching" | "assigned";


type Props = {
  onPickupChange?: (place: { address: string; location: LatLng } | null) => void;
  onDropoffChange?: (place: { address: string; location: LatLng } | null) => void;
};

export function BookingCard({ onPickupChange, onDropoffChange }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const apiKey = getMapsApiKey();
  const { isLoaded, loadError } = useCoverflyGoogleMaps();

  const mapsReady = Boolean(apiKey) && isLoaded && !loadError;

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const [pickupLoc, setPickupLoc] = useState<LatLng | null>(null);
  const [dropoffLoc, setDropoffLoc] = useState<LatLng | null>(null);

  const [vehicle, setVehicle] = useState<VehicleKey>("MINI");
  const [payment, setPayment] = useState<PaymentMethod>("UPI");

  const [busy, setBusy] = useState<null | "book">(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rideData, setRideData] = useState<any>(null);

  const [recentVersion, setRecentVersion] = useState(0);
  const [shortcutVersion] = useState(0);

  const recent = useMemo(() => getRecentPlaces(), [recentVersion]);
  const homePlace = useMemo(() => getHomePlace(), [shortcutVersion]);
  const workPlace = useMemo(() => getWorkPlace(), [shortcutVersion]);

  const selected = VEHICLES.find((v) => v.key === vehicle)!;

  const canBook =
    (pickupLoc || pickup.trim().length > 2) &&
    (dropoffLoc || dropoff.trim().length > 2);

  const handlePickupAddressChange = useCallback(
    (addr: string) => {
      setPickup(addr);
      setPickupLoc(null);
      onPickupChange?.(null);
    },
    [onPickupChange]
  );

  const handleDropoffAddressChange = useCallback(
    (addr: string) => {
      setDropoff(addr);
      setDropoffLoc(null);
      onDropoffChange?.(null);
    },
    [onDropoffChange]
  );

  const onPickupResolved = useCallback(
    (place: { address: string; location: LatLng }) => {
      setPickup(place.address);
      setPickupLoc(place.location);

      pushRecentPlace({
        address: place.address,
        lat: place.location.lat,
        lng: place.location.lng
      });

      setRecentVersion((v) => v + 1);

      onPickupChange?.(place);
    },
    [onPickupChange]
  );

  const onDropoffResolved = useCallback(
    (place: { address: string; location: LatLng }) => {
      setDropoff(place.address);
      setDropoffLoc(place.location);

      pushRecentPlace({
        address: place.address,
        lat: place.location.lat,
        lng: place.location.lng
      });

      setRecentVersion((v) => v + 1);

      onDropoffChange?.(place);
    },
    [onDropoffChange]
  );

  const applySaved = useCallback(
    (p: SavedPlace, field: "pickup" | "dropoff") => {
      const data = {
        address: p.address,
        location: { lat: p.lat, lng: p.lng }
      };

      if (field === "pickup") {
        setPickup(p.address);
        setPickupLoc(data.location);
        onPickupChange?.(data);
      } else {
        setDropoff(p.address);
        setDropoffLoc(data.location);
        onDropoffChange?.(data);
      }
    },
    [onPickupChange, onDropoffChange]
  );

  function resetFlow() {
    setStage("idle");
    setRideData(null);
    setErrorMsg(null);
  }

  async function bookRide() {
    setBusy("book");
    setStage("searching");
    setErrorMsg(null);

    setTimeout(() => {
      const fakeData = {
        ride: {
          _id: "RIDE123",
          pricing: {
            total: {
              amountPaise: 29900
            }
          }
        },

        driverAssigned: {
          driverName: "Rahul Sharma",
          phone: "9876543210",
          carModel: "Swift Dzire",
          carNumber: "DL01AB1234",
          rating: 4.8,
          eta: 3
        }
      };

      setRideData(fakeData);
      setStage("assigned");

      writeJson(LS_PENDING_CHECKOUT, {
        ...fakeData,
        selectedPaymentMethod: payment,
        user,
        ts: Date.now()
      });

      setTimeout(() => {
        navigate("/payments/checkout");
      }, 1500);

      setBusy(null);
    }, 2000);
  }

  const mapsLoading = Boolean(apiKey) && !isLoaded && !loadError;
  const showAutocomplete = mapsReady;

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
          {errorMsg}
        </div>
      )}

      {stage === "idle" && (
        <>
          <div className="space-y-3">
            {mapsLoading && (
              <>
                <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
              </>
            )}

            {showAutocomplete && !mapsLoading ? (
              <>
                <LocationAutocompleteField
                  label="Pickup"
                  value={pickup}
                  onAddressChange={handlePickupAddressChange}
                  onPlaceResolved={onPickupResolved}
                  mapsReady={mapsReady}
                  showCurrentLocation
                  placeholder="Pickup location"
                  shortcuts={[
                    { label: "Home", place: homePlace },
                    { label: "Work", place: workPlace }
                  ]}
                />

                {recent.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] text-white/70">
                    {recent.slice(0, 4).map((p) => (
                      <button
                        key={p.address}
                        onClick={() => applySaved(p, "pickup")}
                        className="rounded-full bg-white/10 px-2 py-1"
                      >
                        {p.address}
                      </button>
                    ))}
                  </div>
                )}

                <LocationAutocompleteField
                  label="Dropoff"
                  value={dropoff}
                  onAddressChange={handleDropoffAddressChange}
                  onPlaceResolved={onDropoffResolved}
                  mapsReady={mapsReady}
                  placeholder="Drop location"
                />
              </>
            ) : !mapsLoading ? (
              <>
                <LocationTextFallback
                  label="Pickup"
                  value={pickup}
                  onChange={handlePickupAddressChange}
                  placeholder="Pickup"
                />

                <LocationTextFallback
                  label="Dropoff"
                  value={dropoff}
                  onChange={handleDropoffAddressChange}
                  placeholder="Dropoff"
                />
              </>
            ) : null}
          </div>

          <div>
            <div className="mb-2 text-sm text-white/70">Choose your ride</div>

            <div className="grid grid-cols-2 gap-2">
              {VEHICLES.map((v) => (
                <VehicleCard
                  key={v.key}
                  item={v}
                  selected={vehicle === v.key}
                  onSelect={() => setVehicle(v.key)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {(["CASH", "UPI", "CARD"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPayment(m)}
                className={
                  payment === m
                    ? "rounded-xl bg-white px-3 py-2 text-slate-900"
                    : "rounded-xl bg-white/10 px-3 py-2 text-white"
                }
              >
                {m}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!canBook) {
                setErrorMsg("Please enter pickup and drop location.");
                return;
              }

              bookRide();
            }}
            disabled={busy !== null}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {busy === "book"
              ? "Searching driver..."
              : `Book ${selected.title}`}
          </motion.button>
        </>
      )}

      {stage === "searching" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 font-semibold text-white">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Searching for drivers...
          </div>

          <div className="mt-2 text-sm text-white/70">
            Matching nearby driver...
          </div>
        </div>
      )}

      {stage === "assigned" && rideData && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm text-emerald-300 font-semibold">
            Driver Assigned
          </div>

          <div className="text-white font-semibold">
            {rideData.driverAssigned.driverName}
          </div>

          <div className="text-sm text-white/70">
            {rideData.driverAssigned.carModel} •{" "}
            {rideData.driverAssigned.carNumber}
          </div>

          <div className="text-sm text-white/70">
            ETA {rideData.driverAssigned.eta} min
          </div>

          <button
            onClick={() => navigate("/payments/checkout")}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Proceed to Pay
          </button>

          <button
            onClick={resetFlow}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/60">
        Payment page uses Razorpay checkout.
      </div>
    </div>
  );
}