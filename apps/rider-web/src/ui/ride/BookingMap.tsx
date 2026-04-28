import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMapsApiKey, useCoverflyGoogleMaps } from "../../lib/googleMapsLoader.ts";
import type { LatLng } from "./LocationAutocompleteField.tsx";

type Props = {
  pickup: LatLng;
  dropoff: LatLng;
  /** When true, animate the driver car along the path. */
  trackingActive?: boolean;
};

const DEFAULT_ZOOM = 13;

function toRad(n: number) {
  return (n * Math.PI) / 180;
}

function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371e3;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function buildCurvedRoutePath(pickup: LatLng, dropoff: LatLng, steps = 28): LatLng[] {
  const dx = dropoff.lng - pickup.lng;
  const dy = dropoff.lat - pickup.lat;
  const distDeg = Math.max(1e-9, Math.sqrt(dx * dx + dy * dy));
  const nx = -dy / distDeg;
  const ny = dx / distDeg;

  // Scale curve with distance, then clamp to avoid extreme offsets.
  const curve = Math.min(0.02, Math.max(0.004, distDeg * 0.22));
  const midBias = pickup.lat + dropoff.lat > 0 ? 1 : -1;

  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const baseLat = lerp(pickup.lat, dropoff.lat, t);
    const baseLng = lerp(pickup.lng, dropoff.lng, t);
    const arc = Math.sin(Math.PI * t) * curve * midBias;
    return {
      lat: baseLat + ny * arc,
      lng: baseLng + nx * arc
    };
  });
}

function bearingDeg(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function makeDataSvgCar(angleDeg: number, wheelDeg: number) {
  // Minimal “3D-ish” car with wheels and a gradient body.
  // Rotated for direction; wheels rotate for motion feel.
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="34" viewBox="0 0 72 48">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="50%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#f472b6"/>
      </linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.08)"/>
      </linearGradient>
    </defs>
    <g transform="rotate(${angleDeg.toFixed(1)} 36 24)">
      <ellipse cx="36" cy="44" rx="24" ry="3.6" fill="rgba(15,23,42,0.18)"/>
      <path fill="url(#g)" d="M10 28 L14 16 Q16 12 22 12 L46 12 Q54 12 58 18 L62 24 Q64 28 64 32 L64 34 Q64 36 62 36 L12 36 Q10 36 10 34 Z"/>
      <path fill="url(#glass)" opacity="0.95" d="M22 14 L30 10 L44 10 L52 14 Z"/>
      <rect x="26" y="14" width="10" height="6" rx="1.2" fill="rgba(255,255,255,0.40)"/>
      <rect x="38" y="14" width="10" height="6" rx="1.2" fill="rgba(255,255,255,0.20)"/>

      <g transform="translate(22 36) rotate(${wheelDeg.toFixed(1)})">
        <circle cx="0" cy="0" r="6.2" fill="#0f172a" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
        <circle cx="0" cy="0" r="2.3" fill="#334155"/>
        <path d="M0 -4 L0 4" stroke="rgba(148,163,184,0.7)" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g transform="translate(50 36) rotate(${wheelDeg.toFixed(1)})">
        <circle cx="0" cy="0" r="6.2" fill="#0f172a" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
        <circle cx="0" cy="0" r="2.3" fill="#334155"/>
        <path d="M0 -4 L0 4" stroke="rgba(148,163,184,0.7)" stroke-width="1.2" stroke-linecap="round"/>
      </g>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeDataSvgPin(color: string, label: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
    <defs>
      <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.45"/>
      </linearGradient>
    </defs>
    <path d="M22 3 C15 3 9 9 9 16 C9 27 22 41 22 41 C22 41 35 27 35 16 C35 9 29 3 22 3 Z" fill="url(#p)" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
    <text x="22" y="22" text-anchor="middle" dominant-baseline="middle" font-family="ui-sans-serif, system-ui" font-size="12" fill="white" font-weight="700">${label}</text>
  </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function BookingMap({ pickup, dropoff, trackingActive }: Props) {
  const apiKey = getMapsApiKey();
  const { isLoaded, loadError } = useCoverflyGoogleMaps();

  const routePath = useMemo(() => buildCurvedRoutePath(pickup, dropoff, 28), [pickup, dropoff]);

  const { cumulativeMeters, totalMeters } = useMemo(() => {
    const cumulative: number[] = [0];
    let total = 0;
    for (let i = 0; i < routePath.length - 1; i++) {
      total += haversineMeters(routePath[i]!, routePath[i + 1]!);
      cumulative.push(total);
    }
    return { cumulativeMeters: cumulative, totalMeters: total };
  }, [routePath]);

  const initialCenter = useMemo(() => {
    return {
      lat: (pickup.lat + dropoff.lat) / 2,
      lng: (pickup.lng + dropoff.lng) / 2
    };
  }, [pickup, dropoff]);

  const [driverPos, setDriverPos] = useState<LatLng>(pickup);
  const [driverTrail, setDriverTrail] = useState<LatLng[]>([pickup]);
  const [carBearing, setCarBearing] = useState(0);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [etaMins, setEtaMins] = useState<number | null>(null);
  const [distRemainingKm, setDistRemainingKm] = useState<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);
  const lastTrailDistRef = useRef<number>(0);

  const speedKmh = 28;
  const speedMps = speedKmh / 3.6;
  const updateEveryMs = 220; // smooth enough without heavy re-renders

  const pointAtMeters = useMemo(() => {
    const cum = cumulativeMeters;
    const pts = routePath;
    const tot = totalMeters;

    function upperBound(d: number) {
      let lo = 0;
      let hi = cum.length - 1;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (cum[mid] < d) lo = mid + 1;
        else hi = mid;
      }
      return Math.max(0, lo - 1);
    }

    return (meters: number) => {
      const d = Math.max(0, Math.min(tot, meters));
      if (pts.length === 1) return pts[0]!;
      const idx = upperBound(d);
      const a = pts[idx]!;
      const b = pts[idx + 1]!;
      const segStart = cum[idx]!;
      const segEnd = cum[idx + 1]!;
      const segLen = Math.max(1e-9, segEnd - segStart);
      const t = (d - segStart) / segLen;
      return { lat: lerp(a.lat, b.lat, t), lng: lerp(a.lng, b.lng, t) };
    };
  }, [cumulativeMeters, routePath, totalMeters]);

  const startOrReset = (shouldStart: boolean) => {
    setDriverPos(pickup);
    setDriverTrail([pickup]);
    setCarBearing(bearingDeg(pickup, dropoff));
    setWheelDeg(0);
    setEtaMins(null);
    setDistRemainingKm(null);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (!shouldStart) return;

    startedAtRef.current = performance.now();
    lastUiUpdateRef.current = startedAtRef.current;
    lastTrailDistRef.current = 0;

    const tick = (now: number) => {
      const elapsedS = (now - startedAtRef.current) / 1000;
      const travelMeters = Math.min(totalMeters, elapsedS * speedMps);
      const pos = pointAtMeters(travelMeters);
      const ahead = pointAtMeters(Math.min(totalMeters, travelMeters + 12)); // for direction
      const bearing = bearingDeg(pos, ahead);
      const wheel = (elapsedS * speedMps * 8) % 360;

      if (now - lastUiUpdateRef.current >= updateEveryMs) {
        setDriverPos(pos);
        setCarBearing(bearing);
        setWheelDeg(wheel);
        const remainingMeters = totalMeters - travelMeters;
        setDistRemainingKm(remainingMeters / 1000);
        setEtaMins(Math.max(1, Math.ceil(remainingMeters / speedMps / 60)));
        lastUiUpdateRef.current = now;
      }

      // Trail: append when the driver has moved enough.
      if (travelMeters - lastTrailDistRef.current >= 60) {
        setDriverTrail((prev) => {
          const next = [...prev, pos];
          // keep trail short
          if (next.length > 70) return next.slice(next.length - 70);
          return next;
        });
        lastTrailDistRef.current = travelMeters;
      }

      if (travelMeters < totalMeters) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!apiKey) return;
    startOrReset(Boolean(trackingActive));
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, pickup, dropoff, trackingActive, totalMeters, pointAtMeters]);

  const carIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    if (typeof google === "undefined") return undefined;
    return {
      url: makeDataSvgCar(carBearing, wheelDeg),
      scaledSize: new google.maps.Size(44, 30),
      anchor: new google.maps.Point(22, 15)
    };
  }, [carBearing, wheelDeg, isLoaded]);

  const pickupIcon = useMemo(() => {
    if (!isLoaded || typeof google === "undefined") return undefined;
    return {
      url: makeDataSvgPin("#2563eb", "P"),
      scaledSize: new google.maps.Size(34, 34),
      anchor: new google.maps.Point(17, 34)
    };
  }, [isLoaded]);

  const dropoffIcon = useMemo(() => {
    if (!isLoaded || typeof google === "undefined") return undefined;
    return {
      url: makeDataSvgPin("#22c55e", "D"),
      scaledSize: new google.maps.Size(34, 34),
      anchor: new google.maps.Point(17, 34)
    };
  }, [isLoaded]);

  if (!apiKey) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        <div className="font-semibold text-slate-950">Google Maps not configured</div>
        <div className="mt-2">
          Set <code className="px-2 py-1 rounded bg-slate-100">VITE_GOOGLE_MAPS_API_KEY</code> in your
          <code className="px-2 py-1 rounded bg-slate-100">.env</code> and restart the dev server.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="h-[520px] rounded-3xl bg-slate-100 animate-pulse" />;
  }

  if (loadError) {
    return (
      <div className="h-[520px] rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <div className="font-semibold text-slate-950">Google Maps failed to load</div>
        <div className="mt-2 text-sm text-rose-700">Check your API key + enabled services (Maps JavaScript, Places, Geocoding).</div>
      </div>
    );
  }

  return (
    <div className="relative h-[520px] rounded-3xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={initialCenter}
        zoom={DEFAULT_ZOOM}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] }
          ]
        }}
      >
        <Marker position={pickup} icon={pickupIcon} />
        <Marker position={dropoff} icon={dropoffIcon} />

        <Polyline
          path={routePath}
          options={{
            strokeColor: "#1d4ed8",
            strokeOpacity: 0.9,
            strokeWeight: 5
          }}
        />

        {driverTrail.length > 1 && (
          <Polyline
            path={driverTrail}
            options={{
              strokeColor: "#f472b6",
              strokeOpacity: 0.55,
              strokeWeight: 6
            }}
          />
        )}

        <Marker position={driverPos} icon={carIcon} />
      </GoogleMap>

      <div className="absolute left-4 top-4 z-[5] flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live tracking
        </div>
        <div className="rounded-2xl bg-white/85 px-3 py-2 text-xs shadow-sm ring-1 ring-slate-200 backdrop-blur-md">
          <div className="text-slate-600">Driver ETA</div>
          <div className="mt-1 text-sm font-semibold text-slate-950">
            {etaMins != null ? `~${etaMins} min` : trackingActive ? "Calculating…" : "Select pickup & dropoff"}
          </div>
          {distRemainingKm != null && (
            <div className="mt-1 text-xs text-slate-600">{distRemainingKm.toFixed(1)} km remaining</div>
          )}
        </div>
      </div>
    </div>
  );
}

