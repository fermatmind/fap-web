import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage, waitForVisualStability } from "./visual-helpers";

test("tests list visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en/tests");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const stableMasks = getStableMasks(page);
  const sections = [
    { testId: "tests-list-hero-section", snapshot: "tests-list-hero-en.png", maxDiffPixelRatio: 0.02 },
    { testId: "tests-list-grid-section", snapshot: "tests-list-grid-en.png", maxDiffPixelRatio: 0.03 },
  ] as const;

  for (const section of sections) {
    const locator = page.getByTestId(section.testId);
    await locator.scrollIntoViewIfNeeded();
    await waitForVisualStability(page);
    await expect(locator).toHaveScreenshot(section.snapshot, {
      mask: stableMasks,
      maxDiffPixelRatio: section.maxDiffPixelRatio,
    });
  }
});

test("tests list footer visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en/tests");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const footer = page.locator("footer").first();
  await footer.scrollIntoViewIfNeeded();
  await waitForVisualStability(page);

  await expect(footer).toHaveScreenshot("tests-list-footer-en.png", {
    mask: getStableMasks(page),
    maxDiffPixelRatio: 0.02,
  });
});
