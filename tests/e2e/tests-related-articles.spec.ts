import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";
import { expect, test } from "@playwright/test";
const illustratedSlugs = [
  "mbti-personality-test-16-personality-types",
  "big-five-personality-test-ocean-model",
  "iq-test-intelligence-quotient-assessment",
  "eq-test-emotional-intelligence-assessment",
];
const clinicalSlug = "clinical-depression-anxiety-assessment-professional-edition";
const sdsSlug = "depression-screening-test-standard-edition";

let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startPublicContentApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });

for (const locale of ["en", "zh"] as const) {
  for (const slug of illustratedSlugs) {
    test(`${locale} ${slug} keeps editorial, references and FAQ in its illustrated landing`, async ({ page }) => {
      const response = await page.goto(`/${locale}/tests/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main #what-it-is h1")).toBeVisible();
      await expect(page.locator("#why-choose")).toBeVisible();
      await expect(page.locator("#why-choose article").first()).toBeVisible();
      await expect(page.locator("#faq article").first()).toBeVisible();
      await expect(page.locator("#faq article p").first()).not.toBeEmpty();
      if (slug !== "iq-test-intelligence-quotient-assessment") {
        await expect(page.locator("#faq a").first()).toBeVisible();
      }
      await expect(page.locator('#what-it-is a[href*="/take"]')).not.toHaveCount(0);
      await expect(page.getByTestId("tests-related-articles-section")).toHaveCount(0);
    });
  }
  for (const slug of [clinicalSlug, sdsSlug]) {
    test(`${locale} held ${slug} remains unavailable without fabricated related articles`, async ({ page }) => {
      const response = await page.goto(`/${locale}/tests/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("status")).toContainText(locale === "en"
        ? "Assessment temporarily unavailable" : "测评暂不可用");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.getByTestId("tests-related-articles-section")).toHaveCount(0);
      await expect(page.locator('main a[href*="/articles/"]')).toHaveCount(0);
      await expect(page.locator('main a[href*="/take"]')).toHaveCount(0);
    });
  }
}
