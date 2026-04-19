import { defineConfig, devices } from "@playwright/test";

const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER === "1";
const localApiOrigin = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://127.0.0.1:8000";

process.env.NEXT_PUBLIC_API_URL = localApiOrigin;

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["**/visual/**"],
  timeout: 120000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec next dev -p 3000 -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer,
    timeout: 180000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
