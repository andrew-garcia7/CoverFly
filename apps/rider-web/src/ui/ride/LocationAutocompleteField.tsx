import { Crosshair, MapPin } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.ts";
import type { SavedPlace } from "./locationStorage.ts";

export type LatLng = { lat: number; lng: number };

type Props = {
  id?: string;
  label: string;
  value: string;
  onAddressChange: (address: string) => void;
  onPlaceResolved: (place: { address: string; location: LatLng }) => void;
  mapsReady: boolean;
  /** Pickup-only: show “use current location” */
  showCurrentLocation?: boolean;
  onRecentPick?: (p: SavedPlace) => void;
  shortcuts?: Array<{ label: string; place: SavedPlace | null }>;
  placeholder?: string;
};

export function LocationAutocompleteField({
  id: baseId,
  label,
  value,
  onAddressChange,
  onPlaceResolved,
  mapsReady,
  showCurrentLocation,
  onRecentPick,
  shortcuts,
  placeholder = "Search for a place…"
}: Props) {
  const reactId = useId();
  const inputId = baseId ?? `loc-${reactId}`;

  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Used to avoid running fallback Geocoder after a successful autocomplete selection.
  const selectedFromAutocompleteRef = useRef(false);
  const lastGeocodeQueryRef = useRef<string | null>(null);
  const manualGeocodingInFlightRef = useRef(false);

  const debouncedManualQuery = useDebouncedValue(value, 450);
  const manualQuery = useMemo(() => debouncedManualQuery.trim(), [debouncedManualQuery]);

  const geocodeAddressNow = useCallback(
    (query: string) => {
      if (!mapsReady) return;
      if (typeof google === "undefined") return;

      const q = query.trim();
      if (!q) return;
      if (selectedFromAutocompleteRef.current) return;
      const geocoder = geocoderRef.current;
      if (!geocoder) return;
      if (manualGeocodingInFlightRef.current) return;
      if (lastGeocodeQueryRef.current === q) return;

      manualGeocodingInFlightRef.current = true;
      lastGeocodeQueryRef.current = q;

      geocoder.geocode({ address: q }, (results, status) => {
        manualGeocodingInFlightRef.current = false;

        if (status !== "OK" || !results?.[0] || !results[0].geometry?.location) {
          // eslint-disable-next-line no-console
          console.error("Geocoder fallback failed:", { status, query: q, results });
          setGeoMsg(
            status === "ZERO_RESULTS" ? "Could not find that location. Try a nearby landmark." : `Geocoding error: ${status}`
          );
          return;
        }

        const best = results[0]!;
        const loc = best.geometry.location;
        const resolvedAddress = best.formatted_address ?? q;

        setGeoMsg(null);
        selectedFromAutocompleteRef.current = true;
        lastGeocodeQueryRef.current = resolvedAddress;

        onAddressChange(resolvedAddress);
        onPlaceResolved({ address: resolvedAddress, location: { lat: loc.lat(), lng: loc.lng() } });
      });
    },
    [mapsReady, onAddressChange, onPlaceResolved]
  );

  // Attach Google Places Autocomplete to the input.
  useEffect(() => {
    if (!mapsReady) return;
    if (typeof google === "undefined") return;
    if (!inputRef.current) return;

    // IMPORTANT: Autocomplete requires Google Places API enabled for your key.
    geocoderRef.current = new google.maps.Geocoder();

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "in" }
    });

    // Restrict fields for performance (available in newer Maps JS API).
    try {
      ac.setFields?.(["formatted_address", "geometry", "name"]);
    } catch {
      /* ignore */
    }

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place?.geometry?.location;

      const formatted = place?.formatted_address ?? place?.name ?? inputRef.current?.value ?? value;

      selectedFromAutocompleteRef.current = true;
      lastGeocodeQueryRef.current = manualQuery;

      // Validate place.geometry exists before using.
      if (!loc) {
        // eslint-disable-next-line no-console
        console.error("Autocomplete place_changed: missing place.geometry.location", place);
        setGeoMsg("Select a place suggestion from the dropdown.");
        return;
      }

      setGeoMsg(null);
      onAddressChange(formatted);
      onPlaceResolved({
        address: formatted,
        location: { lat: loc.lat(), lng: loc.lng() }
      });
      onRecentPick?.({ address: formatted, lat: loc.lat(), lng: loc.lng() });
    });

    return () => {
      if (listener && typeof listener.remove === "function") listener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady]);

  // When user types manually, reset the “selected” flag so fallback geocoding can run.
  const onTypedChange = useCallback(
    (next: string) => {
      selectedFromAutocompleteRef.current = false;
      onAddressChange(next);
    },
    [onAddressChange]
  );

  // Fallback geocoding: if user types without selecting a suggestion,
  // convert address -> lat/lng using Geocoder.
  useEffect(() => {
    if (!mapsReady) return;
    if (typeof google === "undefined") return;
    if (!manualQuery) return;
    if (selectedFromAutocompleteRef.current) return;
    geocodeAddressNow(manualQuery);
  }, [mapsReady, manualQuery, geocodeAddressNow]);

  const useCurrentLocation = useCallback(() => {
    setGeoMsg(null);
    if (!mapsReady) {
      setGeoMsg("Maps is not ready yet.");
      return;
    }
    if (typeof google === "undefined") return;
    if (!("geolocation" in navigator)) {
      setGeoMsg("Location is not supported in this browser.");
      return;
    }

    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const geocoder = geocoderRef.current ?? new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          setGeoBusy(false);

          if (status !== "OK" || !results?.[0] || !results[0].geometry?.location) {
            // eslint-disable-next-line no-console
            console.error("Reverse geocoding failed:", { status, results, lat, lng });
            setGeoMsg(
              status === "ZERO_RESULTS"
                ? "Could not resolve your current location to an address."
                : `Could not resolve current location: ${status}`
            );
            return;
          }

          const address = results[0].formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          selectedFromAutocompleteRef.current = true;
          onAddressChange(address);
          onPlaceResolved({ address, location: { lat, lng } });
        });
      },
      (err) => {
        setGeoBusy(false);
        // eslint-disable-next-line no-console
        console.error("Geolocation error:", err);
        if (err?.code === 1) setGeoMsg("Location permission denied. Enable location in browser settings.");
        else setGeoMsg("Could not get your current location. Try again.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  }, [mapsReady, onAddressChange, onPlaceResolved]);

  return (
    <div className="text-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-white/70">{label}</span>
        {showCurrentLocation && (
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={geoBusy || !mapsReady}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15 disabled:opacity-50"
          >
            <Crosshair className="h-3.5 w-3.5" aria-hidden />
            {geoBusy ? "Locating…" : "Use current location"}
          </button>
        )}
      </div>

      {geoMsg && (
        <div className="mb-2 rounded-xl bg-rose-500/15 px-3 py-2 text-xs text-rose-100 ring-1 ring-rose-400/30">
          {geoMsg}
        </div>
      )}

      {shortcuts && shortcuts.some((s) => s.place) && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {shortcuts.map(({ label: L, place }) =>
            place ? (
              <button
                key={L}
                type="button"
                onClick={() => {
                  selectedFromAutocompleteRef.current = true;
                  onAddressChange(place.address);
                  onPlaceResolved({ address: place.address, location: { lat: place.lat, lng: place.lng } });
                  onRecentPick?.(place);
                  setGeoMsg(null);
                }}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15 hover:bg-white/15"
              >
                {L}
              </button>
            ) : null
          )}
        </div>
      )}

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-white/45" aria-hidden />
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => onTypedChange(e.target.value)}
          onBlur={() => geocodeAddressNow(value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              geocodeAddressNow(value);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-white placeholder:text-white/40 outline-none ring-0 transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/35"
        />
      </div>
    </div>
  );
}

export function LocationTextFallback({
  label,
  value,
  onChange,
  placeholder,
  hint
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="text-sm">
      <div className="mb-1 text-white/70">{label}</div>
      {hint && (
        <div className="mb-2 rounded-xl bg-amber-500/15 px-3 py-2 text-xs text-amber-50 ring-1 ring-amber-400/25">
          {hint}
        </div>
      )}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-blue-400/40"
        />
      </div>
    </label>
  );
}

