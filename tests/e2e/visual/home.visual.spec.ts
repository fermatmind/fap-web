import { expect, test } from "@playwright/test";
import { getStableMasks, prepareVisualPage, waitForVisualStability } from "./visual-helpers";

test("home visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const stableMasks = getStableMasks(page);
  const sections = [
    { testId: "home-hero-section", snapshot: "home-hero-en.png", maxDiffPixelRatio: 0.03 },
    { testId: "home-value-props-section", snapshot: "home-value-props-en.png", maxDiffPixelRatio: 0.02 },
    { testId: "home-highlighted-tests-section", snapshot: "home-highlighted-tests-en.png", maxDiffPixelRatio: 0.03 },
    { testId: "home-social-proof-section", snapshot: "home-social-proof-en.png", maxDiffPixelRatio: 0.02 },
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

test("home footer visual baseline", async ({ page }) => {
  await prepareVisualPage(page);
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await waitForVisualStability(page);

  const footer = page.locator("footer").first();
  await footer.scrollIntoViewIfNeeded();
  await waitForVisualStability(page);

  await expect(footer).toHaveScreenshot("home-footer-en.png", {
    mask: getStableMasks(page),
    maxDiffPixelRatio: 0.02,
  });
});
