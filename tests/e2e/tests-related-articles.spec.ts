import { expect, test } from "@playwright/test";

const EXPECTED_PLACEMENT: Record<string, [string, string, string]> = {
  "mbti-personality-test-16-personality-types": [
    "mbti-basics",
    "mbti-growth-guide",
    "mbti-narrative-portrait",
  ],
  "big-five-personality-test-ocean-model": [
    "big-five-tool-guide",
    "big-five-growth-guide",
    "big-five-narrative-portrait",
  ],
  "clinical-depression-anxiety-assessment-professional-edition": [
    "clinical-depression-anxiety-pro-tool-guide",
    "clinical-depression-anxiety-pro-growth-guide",
    "clinical-depression-anxiety-pro-narrative-portrait",
  ],
  "depression-screening-test-standard-edition": [
    "depression-screening-standard-tool-guide",
    "depression-screening-standard-growth-guide",
    "depression-screening-standard-narrative-portrait",
  ],
  "iq-test-intelligence-quotient-assessment": [
    "iq-test-tool-guide",
    "iq-test-growth-guide",
    "iq-test-narrative-portrait",
  ],
  "eq-test-emotional-intelligence-assessment": [
    "eq-test-tool-guide",
    "eq-test-growth-guide",
    "eq-test-narrative-portrait",
  ],
};

test("each test detail page exposes exactly three mapped related articles", async ({ page }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const [testSlug, articleSlugs] of Object.entries(EXPECTED_PLACEMENT)) {
      await page.goto(`/${locale}/tests/${testSlug}`);

      const section = page.getByTestId("tests-related-articles-section");
      await expect(section).toBeVisible();

      const links = section.locator('a[href*="/articles/"]');
      await expect(links).toHaveCount(3);

      const hrefs = await links.evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href") || "")
      );
      expect(hrefs).toEqual(articleSlugs.map((slug) => `/${locale}/articles/${slug}`));
    }
  }
});
