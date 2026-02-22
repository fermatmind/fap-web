import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage } from "./visual-helpers";

test("support page visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en/support");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("support-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
  });
});
