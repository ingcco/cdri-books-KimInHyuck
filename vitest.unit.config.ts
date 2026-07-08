import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    // unit은 소스 옆 co-location(`Foo.test.ts`). integration(`*.integration.test.*`)은 배제.
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "**/*.integration.test.*"],
    passWithNoTests: true,
  },
});
