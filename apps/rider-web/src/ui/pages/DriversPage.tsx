import { motion } from "framer-motion";
import { BadgeCheck, Search, Shield, Star, UserCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type DrivingStyle = "Safe" | "Fast" | "Eco";

export type DriverProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  rating: number;
  experienceYears: number;
  totalRides: number;
  drivingHours: number;
  drivingStyle: DrivingStyle;
  languages: string[];
  photoUrl: string;
  isOnline: boolean;
  bio: string;
  tags: string[];
  reviews: { by: string; stars: number; text: string }[];
  vehicleModel: string;
  vehiclePlate: string;
};

type RandomUserResult = {
  login: { uuid: string };
  gender: string;
  name: { title: string; first: string; last: string };
  email: string;
  phone: string;
  cell: string;
  picture: { large: string; medium: string; thumbnail: string };
  location: { city: string; country: string; state: string };
  nat: string;
};

const RANDOMUSER_URL =
  "https://randomuser.me/api/?results=28&noinfo&nat=us,gb,in,au,ca,de,fr,br,nz,es,nl,ie";

const VEHICLE_POOL = [
  ["Toyota Camry", "KA-09-ME-1024"],
  ["Honda City", "MH-12-AB-8831"],
  ["Hyundai Verna", "DL-08-CZ-4412"],
  ["Maruti Dzire", "TN-07-DX-2290"],
  ["MG ZS EV", "KA-51-EV-9001"],
  ["Tata Nexon", "GJ-01-NX-7734"],
  ["Skoda Slavia", "RJ-14-SK-1102"],
  ["Mahindra XUV700", "UP-16-XV-5566"]
] as const;

const REVIEW_SNIPPETS = [
  "On time, smooth ride, and the car was spotless.",
  "Felt very safe — calm driving in heavy traffic.",
  "Professional and friendly. Would book again.",
  "Great conversation, zero pressure, perfect route.",
  "Handled my luggage and waited patiently — five stars.",
  "Eco mode drive was surprisingly efficient and comfy."
];

const REVIEWERS = ["Ananya", "Dev", "Priya", "Karan", "Sneha", "Arnav", "Riya", "Manav", "Ishita", "Yash"];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h);
}

function pickRating(seed: string): number {
  const h = hashSeed(seed);
  return Math.min(5, Math.round((4.2 + (h % 80) / 100) * 10) / 10);
}

function pickLanguages(nat: string, seed: string): string[] {
  const base = ["English"];
  const map: Record<string, string[]> = {
    IN: ["English", "Hindi"],
    US: ["English", "Spanish"],
    GB: ["English"],
    DE: ["English", "German"],
    FR: ["English", "French"],
    BR: ["English", "Portuguese"],
    ES: ["English", "Spanish"],
    NL: ["English", "Dutch"],
    IE: ["English"]
  };
  const extra = map[nat] ?? ["English", "Hindi"];
  const h = hashSeed(seed);
  if (h % 3 === 0 && !extra.includes("Spanish")) base.push("Spanish");
  return [...new Set([...base, ...extra])].slice(0, 3);
}

function drivingStyleFromSeed(seed: string): DrivingStyle {
  const styles: DrivingStyle[] = ["Safe", "Fast", "Eco"];
  return styles[hashSeed(seed) % 3];
}

function buildTags(rating: number, style: DrivingStyle, rides: number): string[] {
  const tags: string[] = [];
  tags.push("Safe driver");
  if (rating >= 4.7) tags.push("Top rated");
  if (style === "Eco") tags.push("Eco friendly");
  else if (rides > 2500) tags.push("Eco friendly");
  return tags.slice(0, 3);
}

function buildBio(name: string, city: string, years: number, style: DrivingStyle): string {
  return `${name.split(" ")[0]} has been driving with CoverFly in ${city} for ${years}+ years. Known for ${style === "Safe" ? "calm, safety-first" : style === "Fast" ? "efficient, time-smart" : "fuel-efficient, smooth"} trips — background-checked and community-rated.`;
}

function buildReviews(seed: string): DriverProfile["reviews"] {
  const h = hashSeed(seed);
  return Array.from({ length: 4 }, (_, i) => ({
    by: REVIEWERS[(h + i) % REVIEWERS.length],
    stars: Math.min(5, 4 + ((h + i) % 2)),
    text: REVIEW_SNIPPETS[(h + i) % REVIEW_SNIPPETS.length]
  }));
}

function mapRandomUserToDriver(u: RandomUserResult, index: number): DriverProfile {
  const id = u.login.uuid;
  const name = `${u.name.first} ${u.name.last}`.replace(/\b\w/g, (c) => c.toUpperCase());
  const city = u.location.city.replace(/^\w/, (c) => c.toUpperCase());
  const seed = `${id}-${index}`;
  const rating = pickRating(seed);
  const experienceYears = 1 + (hashSeed(seed + "y") % 14);
  const totalRides = 180 + (hashSeed(seed + "r") % 5200);
  const drivingHours = experienceYears * 780 + (hashSeed(seed + "h") % 900);
  const style = drivingStyleFromSeed(seed);
  const languages = pickLanguages(u.nat, seed);
  const [vehicleModel, vehiclePlate] = VEHICLE_POOL[hashSeed(seed) % VEHICLE_POOL.length];
  const isOnline = hashSeed(seed + "o") % 100 < 42;

  return {
    id,
    name,
    email: u.email,
    phone: u.cell || u.phone,
    city,
    country: u.location.country,
    rating,
    experienceYears,
    totalRides,
    drivingHours,
    drivingStyle: style,
    languages,
    photoUrl: u.picture.large,
    isOnline,
    bio: buildBio(name, city, experienceYears, style),
    tags: buildTags(rating, style, totalRides),
    reviews: buildReviews(seed),
    vehicleModel,
    vehiclePlate
  };
}

const FALLBACK_FIRST = [
  "James", "Emma", "Raj", "Olivia", "Chen", "Sophia", "Marcus", "Aisha",
  "Noah", "Zara", "Liam", "Maya", "Ethan", "Nina", "Lucas", "Fatima",
  "Oliver", "Elena", "Henry", "Amara", "Daniel", "Leah", "Mateo", "Sofia",
  "Arjun", "Chloe", "Vikram", "Grace"
] as const;

const FALLBACK_LAST = [
  "Thompson", "Wilson", "Patel", "Martinez", "Lee", "Brown", "Garcia", "Khan",
  "Anderson", "Hassan", "Chen", "Nguyen", "Okafor", "Silva", "Murphy", "Rahman",
  "Singh", "Cohen", "Iyer", "Fernandez", "Park", "Dubois", "Nair", "Okonkwo",
  "Mehta", "Lopez", "Reed", "Kim"
] as const;

const FALLBACK_CITIES = [
  "Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi", "Chennai", "Kolkata", "Jaipur",
  "Ahmedabad", "Kochi", "London", "Sydney", "Toronto", "Berlin", "Dublin", "Austin",
  "Chicago", "Melbourne", "Vancouver", "Manchester", "Dubai", "Singapore", "Portland",
  "Seattle", "Boston", "Dublin", "Auckland", "Barcelona"
] as const;

function buildFallbackDrivers(): DriverProfile[] {
  return Array.from({ length: 28 }, (_, i) => {
    const first = FALLBACK_FIRST[i % FALLBACK_FIRST.length];
    const last = FALLBACK_LAST[(i * 3) % FALLBACK_LAST.length];
    const name = `${first} ${last}`;
    const city = FALLBACK_CITIES[i % FALLBACK_CITIES.length];
    const gender = i % 2 === 0 ? "men" : "women";
    const picIndex = (i * 11 + 17) % 99;
    const photoUrl = `https://randomuser.me/api/portraits/${gender}/${picIndex}.jpg`;
    const seed = `fb-${i}-${name}`;
    const rating = pickRating(seed);
    const experienceYears = 1 + (hashSeed(seed + "y") % 14);
    const totalRides = 200 + (hashSeed(seed + "r") % 5100);
    const drivingHours = experienceYears * 760 + (hashSeed(seed + "h") % 800);
    const style = drivingStyleFromSeed(seed);
    const isOnline = hashSeed(seed + "o") % 100 < 40;
    const [vehicleModel, vehiclePlate] = VEHICLE_POOL[hashSeed(seed) % VEHICLE_POOL.length];
    const nat = ["IN", "US", "GB", "AU", "CA"][i % 5];
    return {
      id: `fallback-${i}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@coverfly.drivers`,
      phone: `+91 ${90000 + (hashSeed(seed) % 99999)} ${10000 + (hashSeed(seed + "p") % 89999)}`,
      city,
      country: nat === "IN" ? "India" : nat === "US" ? "United States" : "International",
      rating,
      experienceYears,
      totalRides,
      drivingHours,
      drivingStyle: style,
      languages: pickLanguages(nat, seed),
      photoUrl,
      isOnline,
      bio: buildBio(name, city, experienceYears, style),
      tags: buildTags(rating, style, totalRides),
      reviews: buildReviews(seed),
      vehicleModel,
      vehiclePlate
    };
  });
}

async function fetchDriversFromApi(): Promise<DriverProfile[]> {
  const res = await fetch(RANDOMUSER_URL);
  if (!res.ok) throw new Error("randomuser failed");
  const json = (await res.json()) as { results: RandomUserResult[] };
  if (!json.results?.length) throw new Error("empty results");
  return json.results.map(mapRandomUserToDriver);
}

type FilterId = "all" | "online" | "top" | "experienced";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "online", label: "Online now" },
  { id: "top", label: "Top rated" },
  { id: "experienced", label: "Most experienced" }
];

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
  }
};

const listItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } }
};

function DriverAvatar({
  name,
  src,
  sizeClass,
  online,
  ringHover
}: {
  name: string;
  src: string;
  sizeClass: string;
  online: boolean;
  ringHover?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${sizeClass}`}>
      {!failed ? (
        <motion.img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          width={160}
          height={160}
          onError={() => setFailed(true)}
          className={`h-full w-full rounded-full border-2 border-white object-cover shadow-md transition duration-300 ${
            ringHover ? "group-hover/card:scale-110 group-hover/card:ring-4 group-hover/card:ring-pink-300/80" : ""
          }`}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md md:text-base"
          aria-hidden
        >
          {initials || "?"}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm md:h-4 md:w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-300" />
        </span>
      )}
    </div>
  );
}

function AnimatedStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 18 }}
        >
          <Star
            className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
              i < full
                ? "fill-amber-400 text-amber-400"
                : i === full && partial > 0
                  ? "fill-amber-400/60 text-amber-400"
                  : "fill-slate-200 text-slate-200"
            }`}
            strokeWidth={0}
          />
        </motion.span>
      ))}
      <span className="ml-1 text-sm font-semibold text-slate-800 tabular-nums">{rating.toFixed(1)}</span>
    </div>
  );
}

export function DriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DriverProfile | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchDriversFromApi();
      setDrivers(list);
    } catch {
      setDrivers(buildFallbackDrivers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...drivers];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
      );
    }
    if (filter === "online") list = list.filter((d) => d.isOnline);
    else if (filter === "top") list = list.filter((d) => d.rating >= 4.8);
    else if (filter === "experienced") list = list.filter((d) => d.experienceYears >= 8);
    if (filter === "experienced") {
      list.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (filter === "top") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [drivers, filter, search]);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-linear-to-b from-blue-100/50 via-transparent to-transparent blur-2xl" />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Driver network</span>
          {loading && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              Live load
            </span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Meet our drivers</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
          Verified profiles from real cities — ratings, ride history, and contact details in one place. Profiles refresh from
          our partner directory; you always see diverse, photo-backed humans.
        </p>
      </motion.div>

      <div className="relative mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none ring-slate-200 transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60"
            aria-label="Search drivers"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition duration-200 ${
                filter === f.id
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
                  : "border border-slate-200 bg-white/80 text-slate-700 backdrop-blur hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
        className="relative mt-10 rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-lg backdrop-blur-md md:p-8"
      >
        <h2 className="text-lg font-semibold text-slate-950 md:text-xl">Why our drivers are trusted</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3 md:gap-6">
          {[
            { icon: BadgeCheck, title: "Verified profiles", desc: "Government ID + selfie checks before first trip." },
            { icon: Shield, title: "Background checked", desc: "Motor vehicle and safety screening on a fixed cadence." },
            { icon: UserCheck, title: "Rated by real users", desc: "Only riders who completed trips can leave reviews." }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{title}</div>
                <div className="mt-1 text-sm text-slate-600">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-linear-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/80"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white/80 p-10 text-center text-slate-600 backdrop-blur">
          No drivers match your filters. Try clearing search or switching to <strong>All</strong>.
        </div>
      ) : (
        <motion.div
          className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3"
          variants={listContainer}
          initial="hidden"
          animate="show"
          key={`${filter}-${search}`}
        >
          {filtered.map((d) => (
            <motion.button
              key={d.id}
              type="button"
              variants={listItem}
              onClick={() => setSelected(d)}
              className="group/card text-left transition duration-300 ease-out hover:scale-[1.05] hover:border-pink-200/80 hover:shadow-[0_0_30px_rgba(255,182,193,0.5),0_20px_40px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 shadow-lg backdrop-blur-md transition-[border-color,box-shadow] duration-300 group-hover/card:border-pink-200/90">
                <div className="flex items-start gap-3 p-4 md:p-5">
                  <DriverAvatar name={d.name} src={d.photoUrl} sizeClass="h-14 w-14 md:h-16 md:w-16" online={d.isOnline} ringHover />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-950">{d.name}</div>
                        <AnimatedStars rating={d.rating} />
                      </div>
                      {d.isOnline && (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200/80">
                          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 align-middle" />
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 px-4 py-3 md:px-5">
                  <div className="rounded-xl bg-slate-50/90 px-2 py-2 text-center ring-1 ring-slate-100">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Exp</div>
                    <div className="text-sm font-semibold text-slate-900">{d.experienceYears} yrs</div>
                  </div>
                  <div className="rounded-xl bg-slate-50/90 px-2 py-2 text-center ring-1 ring-slate-100">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Rides</div>
                    <div className="text-sm font-semibold text-slate-900">{d.totalRides.toLocaleString()}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50/90 px-2 py-2 text-center ring-1 ring-slate-100">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Hours</div>
                    <div className="text-sm font-semibold text-slate-900">{d.drivingHours.toLocaleString()}+</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-3 md:px-5">
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelected(null)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-modal-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative max-h-[min(92vh,880px)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-xl md:p-8"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Close
            </button>

            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <DriverAvatar
                name={selected.name}
                src={selected.photoUrl}
                sizeClass="h-28 w-28 md:h-32 md:w-32"
                online={selected.isOnline}
              />
              <div className="min-w-0 flex-1 pt-1">
                <h2 id="driver-modal-title" className="text-2xl font-semibold text-slate-950">
                  {selected.name}
                </h2>
                <div className="mt-2">
                  <AnimatedStars rating={selected.rating} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{selected.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 ring-1 ring-blue-100">
                    Style: {selected.drivingStyle}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {selected.vehicleModel} · {selected.vehiclePlate}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</div>
                <div className="mt-2 space-y-1 text-sm text-slate-800">
                  <div>
                    <span className="text-slate-500">Email · </span>
                    <a href={`mailto:${selected.email}`} className="font-medium text-blue-700 hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone · </span>
                    <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="font-medium text-blue-700 hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500">Location · </span>
                    {selected.city}, {selected.country}
                  </div>
                  <div>
                    <span className="text-slate-500">Languages · </span>
                    {selected.languages.join(", ")}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ride stats</div>
                <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Total rides</dt>
                    <dd className="font-semibold text-slate-900">{selected.totalRides.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Driving hours</dt>
                    <dd className="font-semibold text-slate-900">{selected.drivingHours.toLocaleString()}+</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Experience</dt>
                    <dd className="font-semibold text-slate-900">{selected.experienceYears} years</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-semibold text-emerald-700">{selected.isOnline ? "Available now" : "Offline"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews</div>
              <ul className="mt-3 space-y-3">
                {selected.reviews.map((r, i) => (
                  <li key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{r.by}</span>
                      <span className="text-sm text-amber-600">★ {r.stars}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{r.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
