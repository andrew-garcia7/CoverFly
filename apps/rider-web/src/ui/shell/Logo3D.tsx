import { motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import { Link } from "react-router-dom";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Variant = "nav" | "footer";

type Props = {
  variant?: Variant;
  className?: string;
  withLink?: boolean;
};

function Car3DGraphic({ reducedMotion, hover }: { reducedMotion: boolean; hover: boolean }) {
  const uid = useId().replace(/:/g, "");
  const gid = `cf3d-${uid}`;
  const baseDur = reducedMotion ? 0 : hover ? 2.2 : 3.8;
  const tiltY = reducedMotion ? 0 : hover ? 14 : 9;
  const tiltX = reducedMotion ? 0 : hover ? 6 : 4;

  return (
    <div
      className="relative h-11 w-[56px] shrink-0 md:h-12 md:w-[62px] [perspective:900px]"
      style={{ perspective: "900px" }}
    >
      {/* Soft outer glow */}
      <div
        className={cx(
          "pointer-events-none absolute -inset-3 rounded-3xl opacity-70 blur-xl transition-opacity duration-300",
          "bg-linear-to-br from-blue-500/50 via-purple-500/40 to-pink-500/45",
          hover && "opacity-100"
        )}
        aria-hidden
      />

      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          reducedMotion
            ? {}
            : {
                rotateY: [-tiltY, tiltY, -tiltY],
                rotateX: [-tiltX * 0.4, tiltX * 0.4, -tiltX * 0.4],
                y: [0, -3, 0]
              }
        }
        transition={{
          duration: baseDur,
          repeat: reducedMotion ? 0 : Infinity,
          ease: [0.42, 0, 0.58, 1]
        }}
      >
        {/* Speed / light trail */}
        {!reducedMotion && (
          <motion.div
            className="pointer-events-none absolute -left-2 top-1/2 z-0 h-6 w-14 -translate-y-1/2 rounded-full bg-linear-to-r from-cyan-400/30 via-blue-500/40 to-transparent blur-md"
            animate={{ opacity: [0.4, 0.85, 0.4], scaleX: [0.9, 1.15, 0.9] }}
            transition={{ duration: baseDur * 0.6, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        )}

        <div className="relative z-[1] h-full w-full rounded-2xl [transform:translateZ(12px)]">
          <svg viewBox="0 0 72 48" className="h-full w-full overflow-visible drop-shadow-[0_8px_24px_rgba(59,130,246,0.35)]">
            <defs>
              <linearGradient id={`${gid}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="45%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <linearGradient id={`${gid}-glass`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
            </defs>

            <ellipse cx="36" cy="42" rx="26" ry="3.5" fill="rgba(15,23,42,0.22)" />

            <g>
              <path
                fill={`url(#${gid}-body)`}
                d="M10 28 L14 14 Q16 10 22 10 L46 10 Q54 10 58 16 L62 24 Q64 28 64 32 L64 34 Q64 36 62 36 L12 36 Q10 36 10 34 Z"
              />
              <path fill={`url(#${gid}-glass)`} d="M22 12 L30 8 L44 8 L52 12 Z" opacity="0.95" />
              <rect x="26" y="9" width="10" height="6" rx="1.2" fill="rgba(255,255,255,0.45)" />
              <rect x="40" y="9" width="10" height="6" rx="1.2" fill="rgba(255,255,255,0.22)" />
            </g>

            <g className="cf-logo3d-wheel cf-logo3d-wheel-l">
              <circle cx="22" cy="36" r="6" fill="#0f172a" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
              <circle cx="22" cy="36" r="2.2" fill="#334155" />
            </g>
            <g className="cf-logo3d-wheel cf-logo3d-wheel-r">
              <circle cx="50" cy="36" r="6" fill="#0f172a" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
              <circle cx="50" cy="36" r="2.2" fill="#334155" />
            </g>
          </svg>

          {/* Moving highlight / reflection */}
          {!reducedMotion && (
            <motion.div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              aria-hidden
            >
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/50 to-transparent skew-x-[-18deg]"
                initial={{ x: "-40%" }}
                animate={{ x: "160%" }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.6
                }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function Logo3D({ variant = "nav", className, withLink = true }: Props) {
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = useState(false);

  const titleClass =
    variant === "footer"
      ? "cf-logo3d-title cf-logo3d-title--footer font-semibold tracking-tight text-lg"
      : "cf-logo3d-title cf-logo3d-title--nav font-semibold tracking-tight text-base";

  const tagClass =
    variant === "footer"
      ? "text-[11px] tracking-[0.26em] text-gray-500 transition-colors duration-300 group/logo3d:group-hover:text-gray-300"
      : "text-[11px] tracking-[0.26em] text-slate-500 transition-colors duration-300 group/logo3d:group-hover:text-slate-600";

  const lockup = (
    <div
      className={cx(
        "group/logo3d flex items-center gap-3 rounded-xl outline-none",
        "transition-[filter,transform] duration-300",
        "hover:drop-shadow-[0_0_28px_rgba(168,85,247,0.45)]",
        className
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        whileHover={reduceMotion ? {} : { scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="rounded-2xl p-0.5 transition-shadow duration-300 group-hover/logo3d:shadow-[0_0_32px_rgba(236,72,153,0.35)]"
      >
        <Car3DGraphic reducedMotion={!!reduceMotion} hover={hover} />
      </motion.div>
      <div className="min-w-0 leading-tight">
        <div className={titleClass}>CoverFly</div>
        <div className={tagClass}>PREMIUM RIDES</div>
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link
        to="/"
        className="inline-flex min-w-0 items-center rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {lockup}
      </Link>
    );
  }

  return lockup;
}
