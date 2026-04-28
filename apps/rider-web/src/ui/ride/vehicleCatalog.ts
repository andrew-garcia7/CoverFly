export type VehicleKey = "BIKE" | "MINI" | "SEDAN" | "SUV" | "LUXURY" | "ELECTRIC";

export type VehicleCatalogItem = {
  key: VehicleKey;
  title: string;
  subtitle: string;
  seats: number;
  etaMin: number;
  imageUrl: string;
  multiplierHint: string;
};

export const VEHICLES: VehicleCatalogItem[] = [
  {
    key: "BIKE",
    title: "Bike",
    subtitle: "Quick, agile, low-cost",
    seats: 1,
    etaMin: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1558981001-5864b3250a69?auto=format&fit=crop&w=900&q=80",
    multiplierHint: "Saver"
  },
  {
    key: "MINI",
    title: "Mini",
    subtitle: "Everyday city rides",
    seats: 4,
    etaMin: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    multiplierHint: "Balanced"
  },
  {
    key: "SEDAN",
    title: "Sedan",
    subtitle: "Comfort + smooth",
    seats: 4,
    etaMin: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    multiplierHint: "Comfort"
  },
  {
    key: "SUV",
    title: "SUV",
    subtitle: "Space for family",
    seats: 6,
    etaMin: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
    multiplierHint: "Roomy"
  },
  {
    key: "LUXURY",
    title: "Luxury",
    subtitle: "Premium experience",
    seats: 4,
    etaMin: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    multiplierHint: "Premium"
  },
  {
    key: "ELECTRIC",
    title: "Electric",
    subtitle: "Quiet, eco-friendly",
    seats: 4,
    etaMin: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
    multiplierHint: "Eco"
  }
];

