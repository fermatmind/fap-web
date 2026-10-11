import { expect, test } from "@playwright/test";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

for (const locale of ["en", "zh"] as const) {
  test(`${locale} tests hub keeps its complete assessment cards readable and aligned`, async ({ page }) => {
    await page.goto(`/${locale}/tests`);
    const hub = page.locator('main section[aria-labelledby="tests-hub-title"]');
    await expect(hub.getByRole("heading", { level: 1, name: locale === "en" ? "Free assessments" : "免费测试" })).toBeVisible();
    const cards = hub.locator("article");
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      await expect(card.getByRole("heading", { level: 2 })).toBeVisible();
      await expect(card.getByRole("link")).toHaveAttribute("href", new RegExp(`^/${locale}/tests/`));
    }
    const texts = await cards.getByRole("heading", { level: 2 }).allTextContents();
    expect(texts.every((text) => text.trim() && !text.includes("…") && !text.includes("..."))).toBe(true);
    await expect(hub.locator('a[href*="clinical-depression"],a[href*="depression-screening"]')).toHaveCount(0);
    const boxes = await Promise.all([0, 1, 2].map((i) => cards.nth(i).boundingBox()));
    expect(boxes.every(Boolean)).toBe(true);
    const positions = boxes.map((box) => box!.y);
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
    const metrics = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth]);
    expect(metrics[1]).toBeLessThanOrEqual(metrics[0] + 1);
  });
}
