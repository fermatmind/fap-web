import { expect, test } from "@playwright/test";
import publicFixtures from "../fixtures/public-content/marketing-public.json";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

for (const locale of ["en", "zh"] as const) {
  test(`${locale} tests hub keeps its complete assessment cards readable and aligned`, async ({ page }) => {
    await page.goto(`/${locale}/tests`);
    const hub = page.locator('main section[aria-labelledby="tests-hub-title"]');
    const published = locale === "en"
      ? publicFixtures["/v0.5/landing-surfaces/tests?locale=en&org_id=0"]
      : publicFixtures["/v0.5/landing-surfaces/tests?locale=zh-CN&org_id=0"];
    await expect(hub.getByRole("heading", { level: 1, name: published.surface.payload_json.hero.title })).toBeVisible();
    const core = hub.locator("#core-tests");
    const cards = core.locator("article");
    const coreSlugs = [
      "mbti-personality-test-16-personality-types", "big-five-personality-test-ocean-model",
      "holland-career-interest-test-riasec", "enneagram-personality-test-nine-types",
      "iq-test-intelligence-quotient-assessment", "eq-test-emotional-intelligence-assessment",
      "disc-behavioral-style-test", "career-planning-and-work-style-test",
    ];
    await expect(cards).toHaveCount(coreSlugs.length);
    for (const slug of coreSlugs) {
      await expect(core.locator(`article a[href="/${locale}/tests/${slug}"]`)).toHaveCount(1);
    }
    for (const card of await cards.all()) {
      await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(card.getByRole("link")).toHaveAttribute("href", new RegExp(`^/${locale}/tests/`));
    }
    const texts = await cards.getByRole("heading", { level: 3 }).allTextContents();
    expect(texts.every((text) => text.trim() && !text.includes("…") && !text.includes("..."))).toBe(true);
    await expect(hub.locator('a[href*="clinical-depression"],a[href*="depression-screening"]')).toHaveCount(0);
    const positions = await cards.evaluateAll(nodes => nodes.slice(0, 3).map(node => node.getBoundingClientRect().y));
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
    const metrics = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth]);
    expect(metrics[1]).toBeLessThanOrEqual(metrics[0] + 1);
  });
}
