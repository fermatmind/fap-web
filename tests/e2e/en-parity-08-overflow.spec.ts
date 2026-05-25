import { expect, test, type Locator, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
] as const;

async function expectNoHorizontalScroll(page: Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth, "document should not create horizontal overflow").toBeLessThanOrEqual(
    metrics.clientWidth + 1
  );
}

async function expectLocatorInsideViewport(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box, "target heading should be measurable").not.toBeNull();
  if (!box) return;

  const viewport = locator.page().viewportSize();
  expect(viewport, "viewport should be available").not.toBeNull();
  if (!viewport) return;

  expect(box.x, "heading should not overflow left").toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width, "heading should not overflow right").toBeLessThanOrEqual(viewport.width + 1);
}

async function expectNoTextOverflow(locator: Locator) {
  const metrics = await locator.evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
    whiteSpace: window.getComputedStyle(node).whiteSpace,
  }));

  expect(metrics.whiteSpace, "target heading must be allowed to wrap").not.toBe("nowrap");
  expect(metrics.scrollWidth, "target heading text should fit its rendered box").toBeLessThanOrEqual(
    metrics.clientWidth + 1
  );
}

test.describe("EN-PARITY-08 H1 overflow guard", () => {
  for (const viewport of VIEWPORTS) {
    test(`EN homepage hero H1 fits the ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/en");

      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
      await expectNoTextOverflow(heading);
      await expectLocatorInsideViewport(heading);
      await expectNoHorizontalScroll(page);
    });

    test(`ZH MBTI test detail H1 fits the ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/zh/tests/mbti-personality-test-16-personality-types");

      const heading = page.getByRole("heading", { level: 1, name: "MBTI 性格测试【16型人格】" });
      await expect(heading).toBeVisible();
      await expectNoTextOverflow(heading);
      await expectLocatorInsideViewport(heading);
      await expectNoHorizontalScroll(page);
    });
  }
});
