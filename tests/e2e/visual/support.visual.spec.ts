import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage, waitForVisualStability } from "./visual-helpers";

test("help page visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en/help");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  await expect(page).toHaveScreenshot("help-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
  });
});
