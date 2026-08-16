import { defineConfig, devices } from "@playwright/test";

const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER === "1";
const productionServerMode = process.env.PLAYWRIGHT_SERVER_MODE === "production";
const localApiOrigin =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (productionServerMode ? "https://api.fermatmind.com" : "http://127.0.0.1:8000");

process.env.NEXT_PUBLIC_API_URL = localApiOrigin;
if (productionServerMode && !process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
  process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
}

const optionalPreviewSpecs = [
  {
    env: "PHASE1A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase1b-rendered-preview.spec.ts",
  },
  {
    env: "PHASE2A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase2b-1rc-low-resonance-rendered-preview.spec.ts",
  },
  {
    env: "PHASE3A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase3b-1rd-partial-resonance-rendered-preview.spec.ts",
  },
  {
    env: "PHASE4A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase4b-1re-diffuse-convergence-rendered-preview.spec.ts",
  },
  {
    env: "PHASE5A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase5b-1rf-close-call-pair-rendered-preview.spec.ts",
  },
  {
    env: "PHASE6A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase6b-1rg-scene-localization-rendered-preview.spec.ts",
  },
  {
    env: "PHASE7A_PREVIEW_PAYLOAD_DIR",
    pattern: "**/enneagram-phase7b-1rh-fc144-recommendation-rendered-preview.spec.ts",
  },
];

const testIgnore = [
  "**/visual/**",
  ...optionalPreviewSpecs
    .filter(({ env }) => !process.env[env]?.trim())
    .map(({ pattern }) => pattern),
];

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore,
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
    command: productionServerMode
      ? "pnpm build && HOSTNAME=127.0.0.1 PORT=3000 node .next/standalone/server.js"
      : "pnpm exec next dev -p 3000 -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: productionServerMode ? false : reuseExistingServer,
    timeout: productionServerMode ? 300000 : 180000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
