import { defineConfig, devices } from "@playwright/test";

// Figma 시안 기준 1920×1080 고정 — 반응형 미고려. DOM 실측 정합 게이트.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    // 측정 안정화 — 모션 축소(레이아웃 애니메이션 정착 대기 최소화). 이 버전은 contextOptions 경유
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
