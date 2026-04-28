import { z } from "zod";
import { PAYMENT_METHODS, RIDE_STATUS, VEHICLE_TYPES } from "./constants.js";
export const zLatLng = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
});
export const zVehicleType = z.enum(VEHICLE_TYPES);
export const zPaymentMethod = z.enum(PAYMENT_METHODS);
export const zRideStatus = z.enum(RIDE_STATUS);
export const zMoneyINR = z.object({
    currency: z.literal("INR"),
    amountPaise: z.number().int().nonnegative()
});
export const zPricingBreakdown = z.object({
    baseFare: zMoneyINR,
    distanceFare: zMoneyINR,
    timeFare: zMoneyINR,
    surgeMultiplier: z.number().min(1).max(4),
    platformFee: zMoneyINR,
    taxes: zMoneyINR,
    discount: zMoneyINR,
    total: zMoneyINR,
    estimatedDistanceKm: z.number().nonnegative(),
    estimatedDurationMin: z.number().nonnegative(),
    ecoSuggestion: z
        .object({
        suggestedVehicle: zVehicleType,
        co2SavedGramsEstimate: z.number().int().nonnegative()
    })
        .optional()
});
export const zRideCreateRequest = z.object({
    vehicleType: zVehicleType,
    pickup: z.object({ address: z.string().min(1), location: zLatLng }),
    dropoff: z.object({ address: z.string().min(1), location: zLatLng }),
    payment: z.object({
        method: zPaymentMethod,
        split: z
            .object({
            enabled: z.boolean(),
            participants: z
                .array(z.object({
                name: z.string().min(1),
                phone: z.string().optional(),
                sharePercent: z.number().min(1).max(100)
            }))
                .max(6)
        })
            .optional()
    }),
    features: z
        .object({
        aiSmartMatch: z.boolean().optional(),
        predictiveSuggestions: z.boolean().optional(),
        ecoRideSuggestion: z.boolean().optional()
    })
        .optional()
});
