import { defineConfig, devices } from "@playwright/test";

const visualSnapshotTemplate =
  "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-linux{ext}";

export default defineConfig({
  testDir: "./tests/e2e/visual",
  timeout: 120000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  snapshotPathTemplate: visualSnapshotTemplate,
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "HOST=127.0.0.1 PORT=3000 node .next/standalone/server.js",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
