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
      const chineseMbti = locale === "zh" && slug === illustratedSlugs[0];
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
      const editorial = page.locator(chineseMbti ? '[aria-labelledby="assessment-deliverables"]' : "#how-it-works");
      await expect(editorial.locator("article").first()).toBeVisible();
      const faq = page.locator(chineseMbti ? "#assessment-faq" : "#faq");
      await expect(faq.locator("details summary").first()).toBeVisible();
      await expect(faq.locator("details[open] p").first()).not.toBeEmpty();
      const method = page.locator(chineseMbti ? "#method-and-evidence" : "#trio-method");
      await expect(method.locator("article a").first()).toBeVisible();
      if (chineseMbti) await page.locator("summary").getByText("开始免费测试", { exact: true }).click();
      const start = page.locator(chineseMbti ? 'main details[open] a[href*="/take"]' : '#what-it-is a[href*="/take"]').first();
      await expect(start).toBeVisible();
      await expect(page.getByTestId("tests-related-articles-section")).toHaveCount(0);
    });
  }
  for (const slug of [clinicalSlug, sdsSlug]) {
    test(`${locale} held ${slug} remains unavailable without fabricated related articles`, async ({ page }) => {
      const response = await page.goto(`/${locale}/tests/${slug}`);
      expect(response?.status()).toBe(200);
      const unavailable = locale === "en" ? "Assessment temporarily unavailable" : "测评暂不可用";
      await expect(page.getByRole("status").filter({ hasText: unavailable })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.getByTestId("tests-related-articles-section")).toHaveCount(0);
      await expect(page.locator('main a[href*="/articles/"]')).toHaveCount(0);
      await expect(page.locator('main a[href*="/take"]')).toHaveCount(0);
    });
  }
}
