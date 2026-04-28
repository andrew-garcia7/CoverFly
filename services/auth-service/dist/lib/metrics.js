import client from "prom-client";
export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });
export const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    registers: [registry],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});
export const metricsMiddleware = (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationSeconds = Number(end - start) / 1e9;
        const route = (req.route?.path ? String(req.route.path) : req.path) || "unknown";
        httpRequestDurationSeconds
            .labels(req.method, route, String(res.statusCode))
            .observe(durationSeconds);
    });
    next();
};
