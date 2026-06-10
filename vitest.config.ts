import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests de lógica pura (sin DOM). Resuelve el alias "@/..." igual que tsconfig.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
