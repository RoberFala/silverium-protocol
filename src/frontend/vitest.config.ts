import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "@icp-sdk/core"],
  },
  test: {
    environment: "jsdom",
    // Generated bindings re-export ExternalBlob. Transform its extensionless ESM
    // imports through Vite instead of handing them to Node's strict resolver.
    server: { deps: { inline: ["@caffeineai/object-storage"] } },
    pool: "forks",
    maxWorkers: 1,
    minWorkers: 1,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
  },
});
