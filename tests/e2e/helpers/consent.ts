import type { Page } from "@playwright/test";

export async function seedAnalyticsConsent(page: Page, analytics: "denied" | "granted" = "denied") {
  await page.addInitScript(analytics => {
    localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics, updatedAt: new Date().toISOString() }));
  }, analytics);
}
