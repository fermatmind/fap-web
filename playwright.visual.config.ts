import { defineConfig, devices } from "@playwright/test";

const visualSnapshotTemplate =
  "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-linux{ext}";
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER === "1";

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
    command: "bash scripts/visual/start_visual_server.sh",
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
