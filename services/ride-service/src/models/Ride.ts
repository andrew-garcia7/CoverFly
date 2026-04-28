import mongoose, { Schema } from "mongoose";
import type { PaymentMethod, RideStatus, VehicleType } from "@coverfly/common";

export type RideDoc = {
  riderUserId: string;
  driverUserId?: string;
  status: RideStatus;
  vehicleType: VehicleType;
  pickup: { address: string; location: { lat: number; lng: number } };
  dropoff: { address: string; location: { lat: number; lng: number } };
  pricing: {
    baseFare: { currency: "INR"; amountPaise: number };
    distanceFare: { currency: "INR"; amountPaise: number };
    timeFare: { currency: "INR"; amountPaise: number };
    surgeMultiplier: number;
    platformFee: { currency: "INR"; amountPaise: number };
    taxes: { currency: "INR"; amountPaise: number };
    discount: { currency: "INR"; amountPaise: number };
    total: { currency: "INR"; amountPaise: number };
    estimatedDistanceKm: number;
    estimatedDurationMin: number;
    ecoSuggestion?: { suggestedVehicle: VehicleType; co2SavedGramsEstimate: number };
  };
  payment: {
    method: PaymentMethod;
    split?: {
      enabled: boolean;
      participants: Array<{ name: string; phone?: string; sharePercent: number }>;
    };
  };
  safety: { shareLinkToken?: string; isSafetyModeOn: boolean };
  createdAt: Date;
  updatedAt: Date;
};

const MoneySchema = new Schema(
  { currency: { type: String, required: true }, amountPaise: { type: Number, required: true } },
  { _id: false }
);

const LatLngSchema = new Schema({ lat: Number, lng: Number }, { _id: false });

const RideSchema = new Schema<RideDoc>(
  {
    riderUserId: { type: String, required: true, index: true },
    driverUserId: { type: String, required: false, index: true },
    status: {
      type: String,
      required: true,
      enum: [
        "REQUESTED",
        "MATCHING",
        "ASSIGNED",
        "DRIVER_ARRIVING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED"
      ],
      index: true
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["BIKE", "MINI", "SUV", "LUXURY", "ELECTRIC"],
      index: true
    },
    pickup: {
      address: { type: String, required: true },
      location: { type: LatLngSchema, required: true }
    },
    dropoff: {
      address: { type: String, required: true },
      location: { type: LatLngSchema, required: true }
    },
    pricing: {
      baseFare: { type: MoneySchema, required: true },
      distanceFare: { type: MoneySchema, required: true },
      timeFare: { type: MoneySchema, required: true },
      surgeMultiplier: { type: Number, required: true },
      platformFee: { type: MoneySchema, required: true },
      taxes: { type: MoneySchema, required: true },
      discount: { type: MoneySchema, required: true },
      total: { type: MoneySchema, required: true },
      estimatedDistanceKm: { type: Number, required: true },
      estimatedDurationMin: { type: Number, required: true },
      ecoSuggestion: {
        suggestedVehicle: { type: String, required: false },
        co2SavedGramsEstimate: { type: Number, required: false }
      }
    },
    payment: {
      method: { type: String, required: true, enum: ["CASH", "UPI", "CARD"] },
      split: {
        enabled: { type: Boolean, required: false },
        participants: { type: Array, required: false }
      }
    },
    safety: {
      shareLinkToken: { type: String, required: false, index: true },
      isSafetyModeOn: { type: Boolean, required: true, default: false }
    }
  },
  { timestamps: true }
);

RideSchema.index({ status: 1, createdAt: -1 });

export const RideModel = mongoose.model<RideDoc>("Ride", RideSchema);

