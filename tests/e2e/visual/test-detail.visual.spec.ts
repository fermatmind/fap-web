import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage } from "./visual-helpers";

test("test detail visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en/tests/big-five-personality-test");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("test-detail-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
  });
});
