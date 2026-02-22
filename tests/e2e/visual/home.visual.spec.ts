import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage } from "./visual-helpers";

test("home visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("home-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
  });
});
