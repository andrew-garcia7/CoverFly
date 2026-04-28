import type { PricingBreakdown, VehicleType } from "@coverfly/common";

const paise = (amount: number) => Math.max(0, Math.round(amount));

const VEHICLE_MULTIPLIER: Record<VehicleType, number> = {
  BIKE: 0.7,
  MINI: 1.0,
  SUV: 1.35,
  LUXURY: 1.9,
  ELECTRIC: 1.1
};

export function estimateDistanceKm(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) {
  // Haversine-lite (good enough for demo; prod: route distance via Maps Directions API)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(dropoff.lat - pickup.lat);
  const dLng = toRad(dropoff.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(dropoff.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.4, R * c);
}

export function computePricing(params: {
  vehicleType: VehicleType;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  surgeMultiplier?: number;
  ecoRideSuggestion?: boolean;
}): PricingBreakdown {
  const distanceKm = estimateDistanceKm(params.pickup, params.dropoff);
  const durationMin = Math.max(3, distanceKm * 3.2 + 4); // heuristic

  const multiplier = VEHICLE_MULTIPLIER[params.vehicleType];
  const surge = params.surgeMultiplier ?? (distanceKm > 12 ? 1.15 : 1.0);

  const baseFare = 4500 * multiplier; // ₹45
  const distanceFare = distanceKm * 1700 * multiplier; // ₹17/km
  const timeFare = durationMin * 220 * multiplier; // ₹2.2/min
  const platformFee = 1200; // ₹12
  const discount = params.vehicleType === "ELECTRIC" ? 800 : 0; // ₹8 off

  const subtotal = (baseFare + distanceFare + timeFare) * surge + platformFee - discount;
  const taxes = subtotal * 0.05; // 5% demo tax
  const total = subtotal + taxes;

  const ecoSuggestion =
    params.ecoRideSuggestion && params.vehicleType !== "ELECTRIC"
      ? {
          suggestedVehicle: "ELECTRIC" as const,
          co2SavedGramsEstimate: Math.round(distanceKm * 70)
        }
      : undefined;

  return {
    baseFare: { currency: "INR", amountPaise: paise(baseFare) },
    distanceFare: { currency: "INR", amountPaise: paise(distanceFare) },
    timeFare: { currency: "INR", amountPaise: paise(timeFare) },
    surgeMultiplier: surge,
    platformFee: { currency: "INR", amountPaise: paise(platformFee) },
    taxes: { currency: "INR", amountPaise: paise(taxes) },
    discount: { currency: "INR", amountPaise: paise(discount) },
    total: { currency: "INR", amountPaise: paise(total) },
    estimatedDistanceKm: Math.round(distanceKm * 100) / 100,
    estimatedDurationMin: Math.round(durationMin),
    ecoSuggestion
  };
}

