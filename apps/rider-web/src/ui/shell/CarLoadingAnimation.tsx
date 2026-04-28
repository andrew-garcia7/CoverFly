import { motion } from "framer-motion";
import { useId } from "react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  /** Full viewport overlay (boot screen) */
  fullScreen?: boolean;
  className?: string;
};

export function CarLoadingAnimation({ fullScreen, className }: Props) {
  const gid = useId().replace(/:/g, "");

  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-8",
        fullScreen && "fixed inset-0 z-[100] bg-linear-to-b from-slate-950 via-slate-900 to-slate-950",
        !fullScreen && "rounded-3xl border border-white/10 bg-slate-900/90 p-10",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-[min(92vw,420px)] overflow-hidden rounded-2xl bg-slate-800/50 py-10 ring-1 ring-white/10">
        {/* Moving road texture (infinite, no jump) */}
        <div className="cf-load-road pointer-events-none absolute inset-x-0 bottom-0 h-16" aria-hidden />

        {/* Center car + bounce — road scrolls behind for “forward” motion */}
        <div className="relative z-[2] flex justify-center px-6">
          <motion.div
            className="relative"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Trail */}
            <div className="pointer-events-none absolute -left-8 top-1/2 z-0 h-8 w-24 -translate-y-1/2 rounded-full bg-linear-to-r from-fuchsia-500/35 via-blue-500/30 to-transparent blur-lg" />

            <div className="relative z-[1] h-16 w-24 md:h-[4.5rem] md:w-28">
              <svg viewBox="0 0 80 52" className="h-full w-full drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]">
                <defs>
                  <linearGradient id={`${gid}-car`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#${gid}-car)`}
                  d="M12 34 L16 18 Q18 12 26 12 L52 12 Q60 12 66 20 L70 28 Q72 32 72 38 L72 40 Q72 42 70 42 L14 42 Q12 42 12 40 Z"
                />
                <g className="cf-load-wheel cf-load-wheel-l">
                  <circle cx="22" cy="44" r="7" fill="#0f172a" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                  <line x1="22" y1="38" x2="22" y2="50" stroke="rgba(148,163,184,0.6)" strokeWidth="1.2" />
                </g>
                <g className="cf-load-wheel cf-load-wheel-r">
                  <circle cx="58" cy="44" r="7" fill="#0f172a" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                  <line x1="58" y1="38" x2="58" y2="50" stroke="rgba(148,163,184,0.6)" strokeWidth="1.2" />
                </g>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Horizontal dash line “speed” */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-[1] h-px overflow-hidden">
          <div className="cf-load-dash h-full w-[200%] bg-linear-to-r from-transparent via-white/25 to-transparent" />
        </div>
      </div>

      <p className="text-center text-sm font-medium tracking-wide text-slate-300 md:text-base">
        Finding your ride<span className="cf-load-dots">...</span>
      </p>

      {/* Indeterminate progress */}
      <div className="h-1 w-[min(92vw,320px)] overflow-hidden rounded-full bg-slate-800">
        <div className="cf-load-progress h-full w-1/3 rounded-full bg-linear-to-r from-blue-500 via-fuchsia-500 to-pink-400" />
      </div>
    </div>
  );
}
