import { z } from "zod";
export declare const zLatLng: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, z.core.$strip>;
export declare const zVehicleType: z.ZodEnum<{
    BIKE: "BIKE";
    MINI: "MINI";
    SUV: "SUV";
    LUXURY: "LUXURY";
    ELECTRIC: "ELECTRIC";
}>;
export declare const zPaymentMethod: z.ZodEnum<{
    CASH: "CASH";
    UPI: "UPI";
    CARD: "CARD";
}>;
export declare const zRideStatus: z.ZodEnum<{
    REQUESTED: "REQUESTED";
    MATCHING: "MATCHING";
    ASSIGNED: "ASSIGNED";
    DRIVER_ARRIVING: "DRIVER_ARRIVING";
    IN_PROGRESS: "IN_PROGRESS";
    COMPLETED: "COMPLETED";
    CANCELLED: "CANCELLED";
}>;
export declare const zMoneyINR: z.ZodObject<{
    currency: z.ZodLiteral<"INR">;
    amountPaise: z.ZodNumber;
}, z.core.$strip>;
export declare const zPricingBreakdown: z.ZodObject<{
    baseFare: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    distanceFare: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    timeFare: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    surgeMultiplier: z.ZodNumber;
    platformFee: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    taxes: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    discount: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    total: z.ZodObject<{
        currency: z.ZodLiteral<"INR">;
        amountPaise: z.ZodNumber;
    }, z.core.$strip>;
    estimatedDistanceKm: z.ZodNumber;
    estimatedDurationMin: z.ZodNumber;
    ecoSuggestion: z.ZodOptional<z.ZodObject<{
        suggestedVehicle: z.ZodEnum<{
            BIKE: "BIKE";
            MINI: "MINI";
            SUV: "SUV";
            LUXURY: "LUXURY";
            ELECTRIC: "ELECTRIC";
        }>;
        co2SavedGramsEstimate: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zRideCreateRequest: z.ZodObject<{
    vehicleType: z.ZodEnum<{
        BIKE: "BIKE";
        MINI: "MINI";
        SUV: "SUV";
        LUXURY: "LUXURY";
        ELECTRIC: "ELECTRIC";
    }>;
    pickup: z.ZodObject<{
        address: z.ZodString;
        location: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    dropoff: z.ZodObject<{
        address: z.ZodString;
        location: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    payment: z.ZodObject<{
        method: z.ZodEnum<{
            CASH: "CASH";
            UPI: "UPI";
            CARD: "CARD";
        }>;
        split: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            participants: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                phone: z.ZodOptional<z.ZodString>;
                sharePercent: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    features: z.ZodOptional<z.ZodObject<{
        aiSmartMatch: z.ZodOptional<z.ZodBoolean>;
        predictiveSuggestions: z.ZodOptional<z.ZodBoolean>;
        ecoRideSuggestion: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=zod.d.ts.map