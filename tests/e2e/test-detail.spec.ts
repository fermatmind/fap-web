import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";
import { expect, test } from "@playwright/test";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

for (const locale of ["en", "zh"] as const) {
  test(`${locale} Big Five landing exposes both free versions and the illustrated OCEAN hero`, async ({ page }) => {
    const slug = "big-five-personality-test-ocean-model";
    await page.goto(`/${locale}/tests/${slug}`);
    const hero = page.locator("main section#what-it-is");
    await expect(hero.getByRole("heading", { level: 1, name: locale === "en" ? "Free Big Five Personality Test" : "大五人格免费测试（Big Five）", exact: true })).toBeVisible();
    for (const [count, form] of [[120, "big5_120"], [90, "big5_90"]] as const) {
      const link = hero.getByRole("link", { name: new RegExp(`${count}.*${locale === "en" ? "question" : "题"}`) });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", `/${locale}/tests/${slug}/take?form=${form}`);
    }
    const artwork = hero.getByTestId("assessment-hero-artwork");
    await expect(artwork).toBeVisible();
    await expect(artwork).toHaveAttribute("data-theme", "big-five");
    await expect(artwork).toHaveAttribute("aria-hidden", "true");
    expect((await artwork.textContent())?.replace(/\s/g, "")).toContain("OCEAN");
  });
}
