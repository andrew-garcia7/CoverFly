import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

type LatLng = { lat: number; lng: number };
type Driver = {
  _id: string;
  name: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  cancellationRate: number;
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  isOnline: boolean;
  lastLocation?: LatLng;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:30040";

function App() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);
  const [loc, setLoc] = useState<LatLng>({ lat: 12.9716, lng: 77.5946 });
  const [rideId, setRideId] = useState<string>("demo-ride");
  const [status, setStatus] = useState<string>("Idle");
  const [socket, setSocket] = useState<Socket | null>(null);

  const selectedDriver = useMemo(
    () => drivers.find((d) => d._id === selectedDriverId) ?? null,
    [drivers, selectedDriverId]
  );

  async function refreshDrivers() {
    const res = await fetch(`${apiBase}/api/users/v1/drivers?isOnline=true`);
    const data = await res.json();
    setDrivers(data);
    if (!selectedDriverId && data?.[0]?._id) setSelectedDriverId(data[0]._id);
  }

  async function seedDrivers() {
    setStatus("Seeding drivers...");
    await fetch(`${apiBase}/api/users/v1/drivers/seed`, { method: "POST" });
    await refreshDrivers();
    setStatus("Drivers ready");
  }

  useEffect(() => {
    refreshDrivers().catch(() => {});
  }, []);

  useEffect(() => {
    const s = io(`${apiBase.replace(/\/$/, "")}`, { path: "/api/realtime/socket.io" });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  async function setDriverOnline() {
    if (!selectedDriverId) return;
    setStatus("Updating status...");
    await fetch(`${apiBase}/api/users/v1/drivers/${selectedDriverId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnline })
    });
    await refreshDrivers();
    setStatus("Updated");
  }

  async function pushLocation() {
    if (!selectedDriverId) return;
    setStatus("Sending location...");
    await fetch(`${apiBase}/api/realtime/v1/realtime/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverId: selectedDriverId,
        rideId,
        lat: loc.lat,
        lng: loc.lng,
        speedKmph: 24
      })
    });
    setStatus("Location sent");
  }

  function jitter() {
    setLoc((p) => ({ lat: p.lat + (Math.random() - 0.5) * 0.003, lng: p.lng + (Math.random() - 0.5) * 0.003 }));
  }

  return (
    <div className="cf-bg min-h-screen">
      <div className="mx-auto max-w-[1050px] px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.24em] text-slate-600">COVERFLY DRIVER</div>
            <div className="text-2xl md:text-4xl font-semibold text-slate-950">Go online. Accept trips. Track live.</div>
            <div className="mt-2 text-sm text-slate-600">This is a working driver console wired to the realtime service.</div>
          </div>
          <div className="rounded-2xl px-4 py-3 cf-glass text-white">
            <div className="text-xs opacity-70">Realtime</div>
            <div className="font-medium">{socket?.connected ? "Connected" : "Connecting..."}</div>
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-3xl cf-glass-light p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Driver status</div>
              <div className="text-xs text-slate-600">{status}</div>
            </div>

            <div className="mt-3 flex flex-col md:flex-row gap-2">
              <button onClick={seedDrivers} className="rounded-2xl px-4 py-3 bg-slate-950 text-white font-medium hover:bg-black">
                Seed 30 drivers
              </button>
              <button onClick={refreshDrivers} className="rounded-2xl px-4 py-3 bg-blue-700 text-white font-medium hover:bg-blue-800">
                Refresh list
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-slate-600 mb-1">Select driver</div>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none"
                >
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} • {d.vehicleType} • ★{d.rating}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Ride room</div>
                <input
                  value={rideId}
                  onChange={(e) => setRideId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsOnline(true)}
                className={isOnline ? "rounded-xl px-3 py-2 text-sm bg-emerald-600 text-white" : "rounded-xl px-3 py-2 text-sm bg-white border border-slate-200"}
              >
                Online
              </button>
              <button
                onClick={() => setIsOnline(false)}
                className={!isOnline ? "rounded-xl px-3 py-2 text-sm bg-rose-600 text-white" : "rounded-xl px-3 py-2 text-sm bg-white border border-slate-200"}
              >
                Offline
              </button>
              <button onClick={setDriverOnline} className="rounded-xl px-3 py-2 text-sm bg-slate-950 text-white hover:bg-black">
                Update availability
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Live location</div>
                <div className="text-xs text-slate-600">Sends to realtime + emits to ride room</div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="text-sm">
                  <div className="text-slate-600 mb-1">Lat</div>
                  <input
                    value={loc.lat}
                    onChange={(e) => setLoc((p) => ({ ...p, lat: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  />
                </label>
                <label className="text-sm">
                  <div className="text-slate-600 mb-1">Lng</div>
                  <input
                    value={loc.lng}
                    onChange={(e) => setLoc((p) => ({ ...p, lng: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                  />
                </label>
                <div className="flex items-end gap-2">
                  <button onClick={jitter} className="w-full rounded-xl px-3 py-2 text-sm bg-blue-50 border border-blue-200 hover:bg-blue-100">
                    Jitter
                  </button>
                  <button onClick={pushLocation} className="w-full rounded-xl px-3 py-2 text-sm bg-blue-700 text-white hover:bg-blue-800">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl cf-glass p-4 md:p-6 text-white text-left">
            <div className="text-lg font-semibold">Driver transparency</div>
            <div className="mt-3 text-sm text-white/80">
              {selectedDriver ? (
                <div className="space-y-2">
                  <div className="text-white font-medium">{selectedDriver.name}</div>
                  <div>Vehicle: {selectedDriver.vehicleModel} • {selectedDriver.vehiclePlate}</div>
                  <div>Rating: ★{selectedDriver.rating} • Trips: {selectedDriver.totalTrips}</div>
                  <div>Acceptance: {selectedDriver.acceptanceRate}% • Cancel: {selectedDriver.cancellationRate}%</div>
                </div>
              ) : (
                <div>Select a driver.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
