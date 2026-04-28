export const VEHICLE_TYPES = [
  "BIKE",
  "MINI",
  "SUV",
  "LUXURY",
  "ELECTRIC"
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const PAYMENT_METHODS = ["CASH", "UPI", "CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const RIDE_STATUS = [
  "REQUESTED",
  "MATCHING",
  "ASSIGNED",
  "DRIVER_ARRIVING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
] as const;
export type RideStatus = (typeof RIDE_STATUS)[number];

