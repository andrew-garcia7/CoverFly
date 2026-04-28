import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function coverflyDevLog(port: number) {
  return {
    name: "coverfly:dev-log",
    configureServer(server: any) {
      const addr = `http://localhost:${port}`;
      // eslint-disable-next-line no-console
      server.httpServer?.once("listening", () => console.log(`Running on ${addr}`));
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), coverflyDevLog(5175)],
  envDir: "./",
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true
  }
})
