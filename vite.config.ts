/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/table-for-trouble/" : "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsDir: "./",
  },
  test: {
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
  },
}));
