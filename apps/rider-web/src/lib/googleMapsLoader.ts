import { useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES = ["places", "geometry"] as const;

/** Single loader config for map + Places + distance (geometry). */
export function useCoverflyGoogleMaps() {
  return useJsApiLoader({
    id: "coverfly-google-maps",
    googleMapsApiKey: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ?? "",
    // Must be stable to avoid script reload warnings.
    libraries: LIBRARIES as unknown as any
  });
}

// NOTE: Autocomplete requires Google Places API enabled for the VITE_GOOGLE_MAPS_API_KEY.
// Reverse geocoding (“use current location”) requires the Geocoding API enabled too.

export function getMapsApiKey(): string {
  const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? "";

  return key;
}
