import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";
import { expect, test } from "@playwright/test";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

for (const locale of ["en", "zh"] as const) {
  test(`${locale} Big Five landing exposes the free 90-item form and its OCEAN report preview`, async ({ page }) => {
    const slug = "big-five-personality-test-ocean-model";
    await page.goto(`/${locale}/tests/${slug}`);
    const hero = page.locator("main #what-it-is");
    const title = locale === "en" ? "Free Big Five Personality Test" : "大五人格免费测试（Big Five）";
    await expect(hero.getByRole("heading", { level: 1 })).toContainText(title);
    const start = hero.getByRole("link", { name: locale === "en" ? /90-question test/ : /开始 90 题/ });
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("href", `/${locale}/tests/${slug}/take?form=big5_90`);
    await expect(hero.locator('a[href*="form=big5_120"]')).toHaveCount(0);
    const preview = hero.locator("#scored-report-example");
    await expect(preview).toBeVisible();
    await expect(preview.getByText("OCEAN", { exact: true })).toHaveAttribute("aria-hidden", "true");
    await expect(preview.locator("#trio-report-view li")).toHaveCount(5);
  });
}
