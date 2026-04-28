import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function coverflyDevLog(port: number) {
  return {
    name: "coverfly:dev-log",
    configureServer(server: any) {
      server.httpServer?.once("listening", () => {
        console.log(`Running on http://localhost:${port}`);
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), coverflyDevLog(5173)],
  envDir: "./",

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    proxy: {
      "/api/auth": {
        target: "http://auth_service:4001",
        changeOrigin: true
      },

      "/api/users": {
        target: "http://user_service:4003",
        changeOrigin: true
      },

      "/api/rides": {
        target: "http://ride_service:4002",
        changeOrigin: true
      },

      "/api/payments": {
        target: "http://payment_service:4004",
        changeOrigin: true
      },

      "/api/realtime": {
        target: "http://realtime_service:4010",
        changeOrigin: true
      }
    }
  }
});