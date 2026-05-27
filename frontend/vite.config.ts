/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: process.env.VITEST ? [tailwindcss()] : [tailwindcss(), reactRouter()],
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}"],
    setupFiles: "./app/test/setup.ts",
  },
  resolve: {
    tsconfigPaths: true,
  },
});
