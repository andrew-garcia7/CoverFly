export const LS_LAST_RIDE = "coverfly_last_ride";
export const LS_PAYMENTS = "coverfly_payments";
export const LS_RIDES = "coverfly_rides";
export const LS_PENDING_CHECKOUT = "coverfly_pending_checkout";
export const LS_CARD = "coverfly_demo_card";
export const LS_PAYMENT_METHODS = "coverfly_payment_methods";

export type StoredPayment = {
  transactionId: string;
  rideId: string;
  amountPaise: number;
  method: "UPI" | "CARD" | "CASH";
  status: "success" | "failed";
  provider: "razorpay" | "mock";
  createdAt: string;
};

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function appendPayment(item: StoredPayment) {
  const existing = readJson<StoredPayment[]>(LS_PAYMENTS, []);
  writeJson(LS_PAYMENTS, [item, ...existing].slice(0, 50));
}

export function appendRide(item: unknown) {
  const existing = readJson<any[]>(LS_RIDES, []);
  writeJson(LS_RIDES, [item, ...existing].slice(0, 50));
}

export function getPaymentMethods() {
  return readJson<string[]>(LS_PAYMENT_METHODS, ["UPI", "CASH"]);
}

export function savePaymentMethods(items: string[]) {
  writeJson(LS_PAYMENT_METHODS, items);
}

