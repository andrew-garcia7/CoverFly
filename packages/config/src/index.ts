export type ServiceEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  MONGODB_URI: string;
  SERVICE_NAME: string;
  CORS_ORIGIN: string;
};

export function envString(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function envNumber(name: string, fallback?: number): number {
  const raw = process.env[name];
  const v = raw === undefined ? fallback : Number(raw);
  if (v === undefined || Number.isNaN(v)) throw new Error(`Invalid env var: ${name}`);
  return v;
}

export function loadServiceEnv(serviceName: string, defaultPort: number): ServiceEnv {
  const NODE_ENV = (process.env.NODE_ENV ?? "development") as ServiceEnv["NODE_ENV"];
  const PORT = envNumber("PORT", defaultPort);
  const MONGODB_URI =
    (process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "mongodb://mongo:27017/coverfly").trim();
  if (!MONGODB_URI) throw new Error("Missing env var: MONGO_URI (or MONGODB_URI)");
  const CORS_ORIGIN = envString("CORS_ORIGIN", "http://localhost:3000");

  return {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    SERVICE_NAME: serviceName,
    CORS_ORIGIN
  };
}

