import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Driver = {
  _id: string;
  name: string;
  phone: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  cancellationRate: number;
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  isOnline: boolean;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:30040";

function App() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [status, setStatus] = useState<string>("Loading...");

  async function seed() {
    setStatus("Seeding drivers...");
    await fetch(`${apiBase}/api/users/v1/drivers/seed`, { method: "POST" });
    await refresh();
  }

  async function refresh() {
    setStatus("Refreshing...");
    const res = await fetch(`${apiBase}/api/users/v1/drivers`);
    const data = await res.json();
    setDrivers(data);
    setStatus(`Loaded ${data.length} drivers`);
  }

  useEffect(() => {
    refresh().catch(() => setStatus("Failed to load"));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return drivers;
    if (filter === "ONLINE") return drivers.filter((d) => d.isOnline);
    if (filter === "OFFLINE") return drivers.filter((d) => !d.isOnline);
    return drivers.filter((d) => d.vehicleType === filter);
  }, [drivers, filter]);

  const kpis = useMemo(() => {
    const online = drivers.filter((d) => d.isOnline).length;
    const avgRating = drivers.length ? drivers.reduce((a, d) => a + d.rating, 0) / drivers.length : 0;
    const totalTrips = drivers.reduce((a, d) => a + d.totalTrips, 0);
    return { online, avgRating, totalTrips };
  }, [drivers]);

  return (
    <div className="cf-bg min-h-screen">
      <div className="mx-auto max-w-[1100px] px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.24em] text-slate-600">COVERFLY ADMIN</div>
            <div className="text-2xl md:text-4xl font-semibold text-slate-950">Operations dashboard</div>
            <div className="mt-2 text-sm text-slate-600">
              Driver transparency, live fleet stats, and seed tooling for demos.
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3 cf-glass text-white">
            <div className="text-xs opacity-70">Status</div>
            <div className="font-medium">{status}</div>
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-3xl cf-glass-light p-4">
            <div className="text-xs text-slate-600">Online drivers</div>
            <div className="mt-1 text-2xl font-semibold">{kpis.online}</div>
          </div>
          <div className="rounded-3xl cf-glass-light p-4">
            <div className="text-xs text-slate-600">Avg rating</div>
            <div className="mt-1 text-2xl font-semibold">★ {kpis.avgRating.toFixed(2)}</div>
          </div>
          <div className="rounded-3xl cf-glass-light p-4">
            <div className="text-xs text-slate-600">Total trips (fleet)</div>
            <div className="mt-1 text-2xl font-semibold">{kpis.totalTrips.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={seed} className="rounded-2xl px-4 py-3 bg-slate-950 text-white font-medium hover:bg-black">
            Seed drivers
          </button>
          <button onClick={refresh} className="rounded-2xl px-4 py-3 bg-blue-700 text-white font-medium hover:bg-blue-800">
            Refresh
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-2xl px-4 py-3 border border-slate-200 bg-white"
          >
            <option value="ALL">All</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="BIKE">Bike</option>
            <option value="MINI">Mini</option>
            <option value="SUV">SUV</option>
            <option value="LUXURY">Luxury</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </div>

        <div className="mt-4 rounded-3xl cf-glass-light p-4 md:p-6">
          <div className="text-lg font-semibold">Drivers</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Vehicle</th>
                  <th className="py-2 pr-3">Rating</th>
                  <th className="py-2 pr-3">Trips</th>
                  <th className="py-2 pr-3">Acceptance</th>
                  <th className="py-2 pr-3">Cancel</th>
                  <th className="py-2 pr-3">Online</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d._id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-slate-950">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.phone}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-slate-950">{d.vehicleType}</div>
                      <div className="text-xs text-slate-500">
                        {d.vehicleModel} • {d.vehiclePlate}
                      </div>
                    </td>
                    <td className="py-2 pr-3">★ {d.rating}</td>
                    <td className="py-2 pr-3">{d.totalTrips}</td>
                    <td className="py-2 pr-3">{d.acceptanceRate}%</td>
                    <td className="py-2 pr-3">{d.cancellationRate}%</td>
                    <td className="py-2 pr-3">
                      <span className={d.isOnline ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
                        {d.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
