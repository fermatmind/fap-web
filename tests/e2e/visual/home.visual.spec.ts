import { expect, test } from "@playwright/test";
import { fitPageViewportForScreenshot, getStableMasks, prepareVisualPage } from "./visual-helpers";

test("home visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await fitPageViewportForScreenshot(page, { quantum: 16 });

  await expect(page).toHaveScreenshot("home-en.png", {
    mask: getStableMasks(page),
    // Home includes dense gradient/vector cards; allow small cross-OS rasterization drift.
    maxDiffPixelRatio: 0.05,
  });
});
