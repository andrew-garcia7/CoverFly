export type ServiceEnv = {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    MONGODB_URI: string;
    SERVICE_NAME: string;
    CORS_ORIGIN: string;
};
export declare function envString(name: string, fallback?: string): string;
export declare function envNumber(name: string, fallback?: number): number;
export declare function loadServiceEnv(serviceName: string, defaultPort: number): ServiceEnv;
//# sourceMappingURL=index.d.ts.map