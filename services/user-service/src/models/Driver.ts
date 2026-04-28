import mongoose, { Schema } from "mongoose";
import type { VehicleType } from "@coverfly/common";

export type DriverDoc = {
  userId: string;
  name: string;
  phone: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  cancellationRate: number;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  isOnline: boolean;
  lastLocation?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
};

const DriverSchema = new Schema<DriverDoc>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    rating: { type: Number, required: true },
    totalTrips: { type: Number, required: true },
    acceptanceRate: { type: Number, required: true },
    cancellationRate: { type: Number, required: true },
    vehicleType: {
      type: String,
      required: true,
      enum: ["BIKE", "MINI", "SUV", "LUXURY", "ELECTRIC"]
    },
    vehiclePlate: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    isOnline: { type: Boolean, required: true, index: true },
    lastLocation: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    }
  },
  { timestamps: true }
);

DriverSchema.index({ isOnline: 1, vehicleType: 1, rating: -1 });

export const DriverModel = mongoose.model<DriverDoc>("Driver", DriverSchema);

