import mongoose, { Schema } from "mongoose";

export type DriverLocationDoc = {
  driverId: string;
  rideId?: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKmph?: number;
  updatedAt: Date;
  createdAt: Date;
};

const DriverLocationSchema = new Schema<DriverLocationDoc>(
  {
    driverId: { type: String, required: true, index: true },
    rideId: { type: String, required: false, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    heading: { type: Number, required: false },
    speedKmph: { type: Number, required: false }
  },
  { timestamps: true }
);

DriverLocationSchema.index({ driverId: 1, updatedAt: -1 });

export const DriverLocationModel = mongoose.model<DriverLocationDoc>(
  "DriverLocation",
  DriverLocationSchema
);

