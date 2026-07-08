import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    // integration 테스트는 대상 도메인 옆에 co-locate(`*.integration.test.*`)
    include: ["src/**/*.integration.test.{ts,tsx}"],
    setupFiles: ["./src/test/integration-setup.ts"],
    passWithNoTests: true,
  },
});
