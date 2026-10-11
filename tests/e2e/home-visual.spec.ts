import { expect, test, type Page } from "@playwright/test";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function expectHomeSections(page: Page, locale: "en" | "zh") {
  const main = page.locator("main.fm-homepage");
  await expect(main.getByRole("heading", { level: 1, name: locale === "en" ? "Know yourself, move with clarity" : "看清自己，走好每一步" })).toBeVisible();
  const core = main.locator('section[aria-labelledby="homepage-core-tests-title"]');
  const families = main.locator('section[aria-labelledby="homepage-family-title"]');
  await expect(core).toBeVisible();
  await expect(families).toBeVisible();
  const hero = main.locator("section").first();
  const [heroBox, coreBox, familiesBox] = await Promise.all([hero.boundingBox(), core.boundingBox(), families.boundingBox()]);
  expect(heroBox).not.toBeNull();
  expect(coreBox).not.toBeNull();
  expect(familiesBox).not.toBeNull();
  expect(coreBox!.y).toBeGreaterThanOrEqual(heroBox!.y + heroBox!.height - 1);
  expect(familiesBox!.y).toBeGreaterThanOrEqual(coreBox!.y + coreBox!.height - 1);
  await expect(core.locator("article")).toHaveCount(6);
  for (const slug of ["mbti-personality-test-16-personality-types", "big-five-personality-test-ocean-model", "iq-test-intelligence-quotient-assessment", "eq-test-emotional-intelligence-assessment", "enneagram-personality-test-nine-types", "holland-career-interest-test-riasec"]) {
    await expect(core.locator(`a[href="/${locale}/tests/${slug}"]`)).toBeVisible();
  }
  await expect(core.locator('a[href*="clinical-depression"], a[href*="depression-screening"]')).toHaveCount(0);
  await expect(main.getByText(/BIG5_OCEAN|SDS_20|IQ_RAVEN|EQ_60|CLINICAL_COMBO_68/)).toHaveCount(0);
  await expect(hero.getByRole("link", { name: locale === "en" ? "Take a free test" : "免费测试", exact: true })).toHaveAttribute("href", `/${locale}/tests/mbti-personality-test-16-personality-types`);
}

for (const locale of ["en", "zh"] as const) {
  test(`${locale} home exposes the complete public assessment set and ordered sections`, async ({ page }) => {
    await page.goto(locale === "zh" ? "/" : "/en");
    await expectNoHorizontalOverflow(page);
    await expectHomeSections(page, locale);
  });
}

test("mobile bilingual home keeps hero and assessment sections separate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ["en", "zh"] as const) {
    await page.goto(locale === "zh" ? "/" : "/en");
    await expectHomeSections(page, locale);
    await expectNoHorizontalOverflow(page);
  }
});

test("home has no horizontal overflow across representative widths", async ({ page }) => {
  for (const width of [390, 768, 1024, 1100, 1180, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const pathname of ["/en", "/"]) {
      await page.goto(pathname);
      await expect(page.locator("main.fm-homepage h1")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  }
});

test("desktop hero preserves its complete title, primary entry, and image", async ({ page }) => {
  for (const width of [1024, 1100, 1180, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const locale of ["en", "zh"] as const) {
      await page.goto(locale === "zh" ? "/" : "/en");
      const hero = page.locator("main.fm-homepage section").first();
      await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(hero.getByRole("link", { name: locale === "en" ? "Take a free test" : "免费测试", exact: true })).toBeVisible();
      await expect(hero.locator('img[src*="/home/top.png"]')).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  }
});
