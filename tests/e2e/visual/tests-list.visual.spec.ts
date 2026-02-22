import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage } from "./visual-helpers";

test("tests list visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en/tests");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("tests-list-en.png", {
    fullPage: true,
    mask: getStableMasks(page),
  });
});
