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

test("articles page is grouped by test and each group exposes three ordered cards", async ({ page }) => {
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}/articles`);
    for (const [testSlug, articleSlugs] of Object.entries(EXPECTED_PLACEMENT)) {
      const group = page.getByTestId(`articles-group-${testSlug}`);
      await expect(group).toBeVisible();

      const links = group.locator('a[href*="/articles/"]');
      await expect(links).toHaveCount(3);

      const hrefs = await links.evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href") || "")
      );
      expect(hrefs).toEqual(articleSlugs.map((slug) => `/${locale}/articles/${slug}`));
    }
  }
});

test("article detail page renders full mdx body instead of placeholder", async ({ page }) => {
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}/articles/mbti-basics`);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const body = page.getByTestId("article-detail-content");
    await expect(body).toBeVisible();
    await expect(body.locator("h2").first()).toBeVisible();

    await expect(page.getByText("Full markdown rendering is intentionally out of scope")).toHaveCount(0);
  }
});
