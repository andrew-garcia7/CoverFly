export function envString(name, fallback) {
    const v = process.env[name] ?? fallback;
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
export function envNumber(name, fallback) {
    const raw = process.env[name];
    const v = raw === undefined ? fallback : Number(raw);
    if (v === undefined || Number.isNaN(v))
        throw new Error(`Invalid env var: ${name}`);
    return v;
}
export function loadServiceEnv(serviceName, defaultPort) {
    const NODE_ENV = (process.env.NODE_ENV ?? "development");
    const PORT = envNumber("PORT", defaultPort);
    const MONGODB_URI = envString("MONGODB_URI", "mongodb://localhost:27017/coverfly");
    const CORS_ORIGIN = envString("CORS_ORIGIN", "http://localhost:3000");
    return {
        NODE_ENV,
        PORT,
        MONGODB_URI,
        SERVICE_NAME: serviceName,
        CORS_ORIGIN
    };
}
