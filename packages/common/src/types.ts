import type { PaymentMethod, RideStatus, VehicleType } from "./constants.js";

export type LatLng = { lat: number; lng: number };

export type MoneyINR = {
  currency: "INR";
  amountPaise: number;
};

export type PricingBreakdown = {
  baseFare: MoneyINR;
  distanceFare: MoneyINR;
  timeFare: MoneyINR;
  surgeMultiplier: number;
  platformFee: MoneyINR;
  taxes: MoneyINR;
  discount: MoneyINR;
  total: MoneyINR;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  ecoSuggestion?: {
    suggestedVehicle: VehicleType;
    co2SavedGramsEstimate: number;
  };
};

export type User = {
  _id: string;
  role: "RIDER" | "DRIVER" | "ADMIN";
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
};

export type DriverProfile = {
  _id: string;
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
  lastLocation?: LatLng;
};

export type Ride = {
  _id: string;
  riderUserId: string;
  driverUserId?: string;
  status: RideStatus;
  vehicleType: VehicleType;
  pickup: { address: string; location: LatLng };
  dropoff: { address: string; location: LatLng };
  pricing: PricingBreakdown;
  payment: {
    method: PaymentMethod;
    split?: {
      enabled: boolean;
      participants: Array<{ name: string; phone?: string; sharePercent: number }>;
    };
  };
  safety: {
    shareLinkToken?: string;
    isSafetyModeOn: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

