import type { VehicleType } from "@coverfly/common";

type SeedDriver = {
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
  lastLocation: { lat: number; lng: number };
};

const BLR = { lat: 12.9716, lng: 77.5946 };
const jitter = (v: number, amount: number) => v + (Math.random() - 0.5) * amount;

const mk = (i: number, overrides: Partial<SeedDriver> = {}): SeedDriver => {
  const names = [
    "Arjun Nair",
    "Meera Iyer",
    "Rohit Shetty",
    "Aisha Khan",
    "Vikram Rao",
    "Neha Sharma",
    "Kunal Mehta",
    "Priya Menon",
    "Sanjay Gupta",
    "Divya Reddy",
    "Nikhil Joshi",
    "Sonia Kapoor",
    "Harsh Patel",
    "Ananya Das",
    "Sameer Ali",
    "Kavya Singh",
    "Ishaan Verma",
    "Riya Bose",
    "Aditya Kulkarni",
    "Pooja Jain",
    "Farhan Siddiqui",
    "Lavanya Rao",
    "Rahul Nambiar",
    "Sneha Pillai",
    "Manish Chawla",
    "Tanya Bhatia",
    "Zoya Mirza",
    "Aman Srivastava",
    "Suresh Krishnan",
    "Bhavna Sethi"
  ];

  const vehicles: Array<{ type: VehicleType; model: string }> = [
    { type: "BIKE", model: "TVS Ntorq 125" },
    { type: "MINI", model: "Maruti Swift" },
    { type: "SUV", model: "Hyundai Creta" },
    { type: "LUXURY", model: "Toyota Camry" },
    { type: "ELECTRIC", model: "Tata Nexon EV" }
  ];

  const v = vehicles[i % vehicles.length];
  const name = names[i % names.length];

  return {
    userId: `seed-driver-${i + 1}`,
    name,
    phone: `+91${9000000000 + i}`,
    rating: Math.round((4.2 + Math.random() * 0.7) * 10) / 10,
    totalTrips: 200 + Math.floor(Math.random() * 2400),
    acceptanceRate: Math.round((0.78 + Math.random() * 0.2) * 1000) / 10,
    cancellationRate: Math.round((0.01 + Math.random() * 0.06) * 1000) / 10,
    vehicleType: v.type,
    vehiclePlate: `KA-0${(i % 9) + 1}-${String(1000 + i).slice(-4)}`,
    vehicleModel: v.model,
    isOnline: Math.random() > 0.25,
    lastLocation: { lat: jitter(BLR.lat, 0.18), lng: jitter(BLR.lng, 0.18) },
    ...overrides
  };
};

export const seedDrivers: SeedDriver[] = Array.from({ length: 30 }, (_, i) => mk(i));

