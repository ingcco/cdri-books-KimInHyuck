import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/integration/**/*.integration.test.{ts,tsx}"],
    setupFiles: ["./src/__tests__/integration/setup.ts"],
    passWithNoTests: true,
  },
});
