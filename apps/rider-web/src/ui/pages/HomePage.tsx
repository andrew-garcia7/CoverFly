import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  CreditCard,
  Leaf,
  MapPin,
  Radio,
  Shield,
  Sparkles,
  Star,
  UserRoundSearch,
  Zap
} from "lucide-react";
import { BookingCard } from "../ride/BookingCard.tsx";
import { VEHICLES } from "../ride/vehicleCatalog.ts";

const appStoreBadge =
  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg";
const playStoreBadge =
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";

const heroImg =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=80";
const topDrivers = [
  {
    id: "d1",
    name: "Arjun Nair",
    rating: 4.9,
    exp: "7 years",
    img: "https://i.pravatar.cc/240?u=arjun"
  },
  {
    id: "d2",
    name: "Meera Iyer",
    rating: 4.8,
    exp: "6 years",
    img: "https://i.pravatar.cc/240?u=meera"
  },
  {
    id: "d3",
    name: "Rohit Shetty",
    rating: 4.9,
    exp: "8 years",
    img: "https://i.pravatar.cc/240?u=rohit"
  },
  {
    id: "d4",
    name: "Aisha Khan",
    rating: 4.7,
    exp: "5 years",
    img: "https://i.pravatar.cc/240?u=aisha"
  },
  {
    id: "d5",
    name: "Vikram Rao",
    rating: 4.8,
    exp: "9 years",
    img: "https://i.pravatar.cc/240?u=vikram"
  },
  {
    id: "d6",
    name: "Kavya Singh",
    rating: 4.9,
    exp: "6 years",
    img: "https://i.pravatar.cc/240?u=kavya"
  }
];

const whyChooseCards = [
  {
    title: "Smart Match",
    desc: "AI chooses the best driver by proximity, quality score, and route fit.",
    Icon: Brain,
    iconBg: "from-violet-500/15 to-blue-600/10 ring-violet-500/20"
  },
  {
    title: "Safety AI",
    desc: "One tap to share live trip tracking with trusted contacts.",
    Icon: Shield,
    iconBg: "from-blue-500/15 to-cyan-500/10 ring-blue-500/20"
  },
  {
    title: "Eco rides",
    desc: "Prioritize electric options and see estimated CO₂ savings.",
    Icon: Leaf,
    iconBg: "from-emerald-500/15 to-teal-500/10 ring-emerald-500/25"
  }
] as const;

const whyChooseStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.06 }
  }
};

const whyChooseItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

const testimonials = [
  {
    name: "Nikita A.",
    text: "The app feels premium and booking is genuinely faster than other options.",
    city: "Bengaluru",
    avatar: "https://i.pravatar.cc/120?u=nikita",
    rating: 5
  },
  {
    name: "Raghav M.",
    text: "I love the live tracking + safety share link. Makes late-night rides stress-free.",
    city: "Hyderabad",
    avatar: "https://i.pravatar.cc/120?u=raghav",
    rating: 5
  },
  {
    name: "Ira P.",
    text: "Driver quality is excellent. The entire flow from booking to payment is smooth.",
    city: "Pune",
    avatar: "https://i.pravatar.cc/120?u=ira",
    rating: 5
  }
] as const;

const coverFlyFeatures: {
  line: string;
  Icon: LucideIcon;
  hint: string;
}[] = [
  { line: "Real-time tracking", Icon: Radio, hint: "Live map + shareable trip link" },
  { line: "Smart driver matching", Icon: UserRoundSearch, hint: "Quality, ETA, and route fit" },
  { line: "Secure payments", Icon: CreditCard, hint: "Encrypted checkout & receipts" },
  { line: "AI safety features", Icon: Sparkles, hint: "Anomaly signals before they escalate" }
];

function StarRow({
  count = 5,
  size = "md",
  className = ""
}: {
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className={`${cls} fill-amber-400 text-amber-400`} strokeWidth={0} aria-hidden />
      ))}
    </div>
  );
}

function TestimonialsCarousel() {
  const loop = [...testimonials, ...testimonials];

  return (
    <div
      className="cf-testimonial-viewport mt-8 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/30 py-5 shadow-inner ring-1 ring-white/60 backdrop-blur-sm md:py-7"
      aria-label="Rider testimonials"
    >
      <div className="cf-testimonial-track gap-4 px-3 md:gap-5 md:px-4">
        {loop.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="cf-testimonial-float shrink-0"
            style={{ animationDelay: `${(i % 3) * 0.45}s` }}
          >
            <article
              className="flex h-full w-[240px] flex-col gap-3 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/40 backdrop-blur-md transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.045] hover:border-pink-200/60 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12),0_0_28px_rgba(255,182,193,0.45)] md:w-[300px] md:gap-4 md:p-5"
            >
              <div className="flex items-start gap-2.5 md:gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/80 shadow-sm md:h-12 md:w-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-950 md:text-base">{t.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StarRow count={t.rating} size="sm" className="md:[&_svg]:h-4 md:[&_svg]:w-4" />
                    <span className="text-[11px] text-slate-500 md:text-xs">{t.city}</span>
                  </div>
                </div>
              </div>
              <blockquote className="text-xs leading-relaxed text-slate-700 md:text-sm">“{t.text}”</blockquote>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

function TripFlowStrip() {
  const steps = ["You", "Book", "Driver", "Track", "Pay"] as const;
  return (
    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/60 p-4 backdrop-blur-sm">
      <div className="relative flex items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
        {steps.map((label, i) => (
          <div key={label} className="relative z-10 flex flex-1 flex-col items-center gap-2">
            <motion.span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-[11px] font-bold text-white shadow-md shadow-blue-600/25"
              animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 rgba(59,130,246,0.4)", "0 0 0 10px rgba(59,130,246,0)", "0 0 0 0 rgba(59,130,246,0)"] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35, ease: "easeOut" }}
            >
              {i + 1}
            </motion.span>
            <span className="text-center text-slate-600">{label}</span>
          </div>
        ))}
        <svg className="pointer-events-none absolute left-8 right-8 top-[18px] z-0 h-2 w-[calc(100%-4rem)] overflow-visible sm:left-10 sm:right-10 sm:w-[calc(100%-5rem)]" aria-hidden>
          <motion.line
            x1="0"
            y1="4"
            x2="100%"
            y2="4"
            stroke="url(#whyCfFlowGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 10"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="whyCfFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(59,130,246)" />
              <stop offset="100%" stopColor="rgb(244,114,182)" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          className="pointer-events-none absolute left-8 right-8 top-[14px] z-[5] h-4 sm:left-10 sm:right-10"
          initial={false}
        >
          <motion.div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]"
            animate={{ left: ["0%", "100%", "0%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ marginLeft: -5 }}
          />
          <motion.div
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-pink-400/90 shadow-[0_0_10px_rgba(244,114,182,0.85)]"
            animate={{ left: ["100%", "0%", "100%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            style={{ marginLeft: -4 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function WhyCoverFlyAnimatedPhone() {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-linear-to-br from-blue-500/15 via-transparent to-pink-400/15 blur-2xl" />
      <motion.div
        className="relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative rounded-[2.5rem] border-[10px] border-slate-800 bg-slate-900 shadow-[0_28px_70px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
          <div className="absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-black/85" />
          <div className="relative aspect-[9/18] overflow-hidden rounded-[2rem] bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(ellipse_at_75%_70%,rgba(244,114,182,0.22),transparent_50%)]" />
            <div className="absolute inset-x-2 top-2 flex justify-between text-[9px] text-white/65">
              <span>9:41</span>
              <span className="flex gap-0.5">
                <span className="h-1.5 w-4 rounded-sm bg-white/35" />
              </span>
            </div>
            <div className="absolute inset-x-2 top-10 bottom-20 rounded-2xl bg-slate-900/90 ring-1 ring-white/10">
              <svg className="h-full w-full" viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <defs>
                  <linearGradient id="whyCfRouteLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(96,165,250)" />
                    <stop offset="100%" stopColor="rgb(244,114,182)" />
                  </linearGradient>
                </defs>
                <path
                  id="tripPath"
                  d="M 36 220 Q 92 140 108 96 T 164 52"
                  fill="none"
                  stroke="url(#whyCfRouteLine)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.95"
                />
                <circle cx="36" cy="220" r="7" fill="#60a5fa" opacity="0.95" />
                <circle cx="164" cy="52" r="7" fill="#f472b6" opacity="0.95" />
                <motion.circle
                  r="6"
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="2"
                  initial={{ cx: 36, cy: 220 }}
                  animate={{ cx: [36, 100, 132, 164], cy: [220, 150, 92, 52] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
              <div className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-xl bg-black/55 px-2.5 py-2 text-[10px] text-white ring-1 ring-white/10 backdrop-blur-sm">
                <span className="text-blue-300">Live</span> · Driver en route · ETA 2 min
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20" />
          </div>
        </div>
      </motion.div>
      <TripFlowStrip />
    </div>
  );
}

function WhyCoverFlyBlock() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="relative py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-pink-300/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/20 blur-3xl" />
      </div>
      <div className="relative z-[1] mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-xs tracking-[0.22em] text-slate-500">DIFFERENCE</div>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">Why CoverFly?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            From first tap to final receipt — see how the trip flows in the app, and why riders stay.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-start lg:pt-4"
          >
            <WhyCoverFlyAnimatedPhone />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <ul className="space-y-3">
              {coverFlyFeatures.map((item, i) => {
                const Icon = item.Icon;
                const active = hovered === i;
                return (
                  <motion.li
                    key={item.line}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: 0.08 + i * 0.1 }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className={`group flex gap-4 rounded-2xl border p-4 transition-all duration-300 md:p-5 ${
                      active
                        ? "border-blue-200/80 bg-white/90 shadow-[0_0_28px_rgba(255,182,193,0.35),0_12px_40px_rgba(15,23,42,0.08)]"
                        : "border-slate-200/70 bg-white/70 hover:border-slate-300 hover:bg-white/85"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600/12 to-pink-500/10 ring-1 transition-all duration-300 ${
                        active
                          ? "shadow-[0_0_18px_rgba(59,130,246,0.45)] ring-blue-400/40"
                          : "ring-slate-200/80 group-hover:shadow-[0_0_14px_rgba(244,114,182,0.35)]"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${active ? "text-blue-700" : "text-slate-700"}`} strokeWidth={1.65} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-950">{item.line}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.hint}</div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="pb-0">
      <div
        className="relative w-full min-h-screen flex items-end"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/60 to-black/20" />
        <div className="absolute inset-0 bg-radial-[circle_at_20%_20%] from-blue-700/25 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-white"
            >
              <div className="text-xs tracking-[0.28em] text-white/70">PREMIUM • SAFE • SMART</div>
              <div className="mt-4 text-5xl md:text-6xl font-semibold leading-relaxed">
                Your city, your time,
                <br className="hidden md:block" /> your
                <span className="text-blue-300"> premium ride.</span>
              </div>
              <div className="mt-4 text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
                Move with confidence using realtime tracking, top-rated drivers, safety AI, and ultra-smooth
                booking in one elegant app.
              </div>
              <div className="mt-3 text-white/70 text-sm md:text-base max-w-2xl">
                Night rides, <span className="text-blue-300">elite drivers</span>,
                <br className="hidden md:block" /> real-time tracking.
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/book"
                    className="inline-flex rounded-2xl px-6 py-3.5 bg-blue-600 text-white font-semibold shadow-xl shadow-blue-600/30 hover:shadow-blue-500/45 transition-shadow"
                  >
                    Book a ride
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/drivers"
                    className="inline-flex rounded-2xl px-6 py-3.5 bg-white/10 border border-white/20 text-white font-semibold backdrop-blur hover:bg-white/15 transition-colors"
                  >
                    Meet drivers
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="lg:justify-self-end"
            >
              <div className="rounded-3xl p-5 md:p-7 text-white w-full lg:w-[500px] backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
                <div className="text-sm tracking-[0.22em] text-white/70">BOOKING</div>
                <div className="mt-1 text-2xl font-semibold">Where to?</div>
                <div className="mt-4">
                  <BookingCard />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 space-y-16">
        <section>
          <div className="text-xs tracking-[0.22em] text-slate-500">VEHICLES</div>
          <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">Ride category lineup</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VEHICLES.map((v) => (
              <motion.div
                key={v.key}
                whileHover={{ y: -4, scale: 1.015 }}
                className="cf-hover-pink-glow rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-44 relative">
                  <img src={v.imageUrl} alt={v.title} className="h-full w-full object-cover transition duration-300 hover:brightness-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="absolute top-3 left-3 rounded-full bg-white/15 border border-white/25 text-white text-xs px-3 py-1">
                    {v.multiplierHint}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <div className="text-lg font-semibold">{v.title}</div>
                      <div className="text-xs text-white/80">{v.subtitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">ETA {v.etaMin} min</div>
                      <div className="text-xs text-white/80">{v.seats} seats</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-xs tracking-[0.22em] text-slate-500">HOW IT WORKS</div>
          <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">Three simple steps</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "01", title: "Choose ride", desc: "Pick your preferred category, price, and ETA." },
              { icon: "02", title: "Confirm booking", desc: "Securely confirm with split fare and payment options." },
              { icon: "03", title: "Track driver", desc: "Watch your driver approach in realtime on the map." }
            ].map((s) => (
              <motion.div key={s.icon} whileHover={{ y: -3 }} className="cf-glass-light cf-hover-pink-glow rounded-3xl p-6">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="mt-4 text-xl font-semibold text-slate-950">{s.title}</div>
                <div className="mt-2 text-sm text-slate-600">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs tracking-[0.22em] text-slate-500">TOP DRIVERS</div>
              <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">Trusted by riders daily</h2>
            </div>
            <Link to="/drivers" className="text-sm text-blue-700 font-medium hover:underline">
              View all drivers
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDrivers.map((d) => (
              <motion.div key={d.id} whileHover={{ y: -3, scale: 1.01 }} className="cf-glass-light cf-hover-pink-glow rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <img src={d.img} alt={d.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <div className="font-semibold text-slate-950">{d.name}</div>
                    <div className="text-xs text-slate-600">⭐ {d.rating} • {d.exp}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">Professional, polite, and highly rated for safe driving.</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20">
          <div className="text-xs tracking-[0.22em] text-slate-500">WHY CHOOSE US</div>
          <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">Built for modern urban mobility</h2>
          <motion.div
            className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
            variants={whyChooseStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px", amount: 0.2 }}
          >
            {whyChooseCards.map((c) => {
              const Icon = c.Icon;
              return (
                <motion.div
                  key={c.title}
                  variants={whyChooseItem}
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                    boxShadow: "0 20px 50px rgba(15,23,42,0.08), 0 0 25px rgba(255,182,193,0.35)",
                    transition: { type: "spring", stiffness: 400, damping: 22 }
                  }}
                  className="cf-glass-light flex flex-col gap-4 rounded-3xl border border-slate-200/80 p-6 shadow-sm transition-shadow duration-300 md:p-7"
                >
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${c.iconBg} ring-1`}
                  >
                    <Icon className="h-8 w-8 text-slate-800" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-950">{c.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section className="py-20">
          <div className="text-xs tracking-[0.22em] text-slate-500">TESTIMONIALS</div>
          <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">What riders say</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Smooth infinite carousel — hover anywhere on the strip to pause, or hover a card to lift it with a soft glow.
            Mobile scrolls a bit faster for energy; desktop glides slower.
          </p>

          <TestimonialsCarousel />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-slate-50 via-white to-blue-50/60 p-8 md:p-10 shadow-sm"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-pink-400/10 blur-3xl" />
          <div className="relative">
            <div className="text-xs tracking-[0.22em] text-slate-500">OUR TECHNOLOGY</div>
            <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-slate-950">Built on AI, realtime, and maps</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              CoverFly combines intelligent routing, live telemetry, and map-grade accuracy so every trip feels calm and
              in control.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: "AI-assisted matching",
                  desc: "Models rank drivers using quality, ETA, and route fit — not just distance.",
                  accent: "from-violet-500/20 to-blue-500/10"
                },
                {
                  icon: Zap,
                  title: "Realtime everything",
                  desc: "Sub-second updates for driver movement, trip state, and rider notifications.",
                  accent: "from-amber-400/20 to-orange-500/10"
                },
                {
                  icon: MapPin,
                  title: "Map-native routing",
                  desc: "Turn-by-turn context with traffic-aware ETAs and precise pickup pins.",
                  accent: "from-emerald-400/15 to-cyan-500/10"
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -4 }}
                    className="cf-glass-light cf-hover-pink-glow group relative rounded-2xl p-5"
                  >
                    <div className={`inline-flex rounded-2xl bg-linear-to-br ${item.accent} p-3 ring-1 ring-black/5`}>
                      <Icon className="h-6 w-6 text-slate-800" strokeWidth={1.6} />
                    </div>
                    <div className="mt-3">
                      <div className="text-base font-semibold text-slate-950">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600 leading-relaxed">{item.desc}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <div className="rounded-3xl bg-linear-to-b from-slate-50/90 via-white to-blue-50/40 ring-1 ring-slate-200/60">
          <WhyCoverFlyBlock />
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-14 text-white shadow-xl md:px-12 md:py-16">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              className="relative mx-auto flex w-full max-w-[300px] justify-center lg:mx-0 lg:justify-start"
              animate={{ y: [0, -12, 0], rotate: [-1.2, 1.2, -1.2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative w-[min(100%,280px)]">
                <div className="absolute inset-x-10 -top-3 h-6 rounded-full bg-black/40 blur-xl" />
                <div className="relative rounded-[2.6rem] border-[11px] border-slate-800 bg-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                  <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-black/80" />
                  <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-slate-950">
                    <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-black" />
                    <div className="absolute inset-0 bg-linear-to-br from-blue-600/25 via-transparent to-pink-500/15" />
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between text-[10px] text-white/70">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <span className="h-2 w-3 rounded-sm bg-white/30" />
                        <span className="h-2 w-3 rounded-sm bg-white/30" />
                      </div>
                    </div>
                    <div className="absolute inset-x-3 top-12 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
                      <div className="text-[10px] tracking-wider text-white/60">PICKUP</div>
                      <div className="mt-1 text-sm font-semibold text-white">MG Road Metro</div>
                    </div>
                    <div className="absolute inset-x-3 top-32 bottom-24 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 ring-1 ring-white/10">
                      <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(236,72,153,0.2),transparent_50%)]" />
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 320" aria-hidden>
                        <path
                          d="M40 240 Q 100 120 160 80"
                          fill="none"
                          stroke="rgba(96,165,250,0.9)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="40" cy="240" r="6" fill="#60a5fa" />
                        <circle cx="160" cy="80" r="6" fill="#f472b6" />
                      </svg>
                      <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/45 px-3 py-2 text-[11px] text-white/90 ring-1 ring-white/10 backdrop-blur">
                        Driver arriving · <span className="text-blue-300">2 min</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                      <div className="h-1 w-8 rounded-full bg-white/25" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div>
              <div className="text-xs tracking-[0.28em] text-blue-300/90">MOBILE APPS</div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">Download our app</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Book faster, track live, and manage trips on the go — the full CoverFly experience in your pocket.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <motion.a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block rounded-xl transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(96,165,250,0.45),0_0_32px_rgba(244,114,182,0.35)]"
                >
                  <img src={appStoreBadge} alt="Download on the App Store" className="h-12 w-auto md:h-14" />
                </motion.a>
                <motion.a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block rounded-xl transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(96,165,250,0.45),0_0_32px_rgba(244,114,182,0.35)]"
                >
                  <img src={playStoreBadge} alt="Get it on Google Play" className="h-12 w-auto md:h-14" />
                </motion.a>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/50">
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Face ID ready</span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Instant receipts</span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Live trip sharing</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-3xl cf-glass p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-2xl md:text-3xl font-semibold">Ready to ride smarter?</div>
              <div className="mt-1 text-white/75 text-sm">Book now and experience premium urban mobility.</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/book"
                className="rounded-2xl px-5 py-3 bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-600/25"
              >
                Book now
              </Link>
              <Link
                to="/drivers"
                className="rounded-2xl px-5 py-3 bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
              >
                Explore drivers
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

