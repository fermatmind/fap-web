import { expect, test } from "@playwright/test";
import { startPublicContentApiFixture } from "./helpers/public-content-api-fixture";

let stopFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => {
  const slug = "free-personality-tests-results-compared";
  stopFixture = await startPublicContentApiFixture({
    [`/v0.5/articles/${slug}?locale=en`]: {
      ok: true,
      article: {
        id: 283, slug, locale: "en", title: "Compare free personality results", status: "published",
        is_public: true, is_indexable: true, published_revision_id: 1057,
        content_md: "## Inspect an example\n\n[Two synthetic preference examples](/en/tests/mbti-personality-test-16-personality-types#result-examples) are teaching examples, not personal reports.",
      },
      landing_surface_v1: null, answer_surface_v1: null,
    },
  });
});
test.afterAll(async () => { await stopFixture?.(); });

test("existing MBTI examples remain the fragment destination after direct load and refresh", async ({ page }) => {
  await page.goto("/en/tests/mbti-personality-test-16-personality-types#result-examples");
  const examples = page.getByTestId("mbti-result-examples");
  const top = () => examples.evaluate((node) => node.getBoundingClientRect().top);
  const waitForExampleLayout = async () => {
    await expect(examples).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
  };
  await waitForExampleLayout();
  await expect(examples).toContainText("two synthetic examples");
  await expect.poll(top).toBeGreaterThanOrEqual(70);
  await expect.poll(top).toBeLessThan(120);
  await page.reload();
  await waitForExampleLayout();
  await expect.poll(top).toBeGreaterThanOrEqual(70);
  await expect.poll(top).toBeLessThan(120);
  await expect(examples.getByRole("article")).toHaveCount(2);
  await expect(examples).toContainText("not scored attempts, real user reports, or your result");
});

test("article CMS example link preserves attribution and reaches the examples on click", async ({ page }) => {
  await page.goto("/en/articles/free-personality-tests-results-compared?utm_source=example_navigation");
  const link = page.getByRole("link", { name: "Two synthetic preference examples", exact: true });
  await expect(link).toHaveAttribute("data-seo-cta-attributed", "true");
  await link.click();
  await expect(page).toHaveURL(/\?[^#]+#result-examples$/);
  const url = new URL(page.url());
  expect(url.searchParams.get("utm_source")).toBe("example_navigation");
  expect(url.searchParams.get("content_id")).toBe("283");
  const examples = page.getByTestId("mbti-result-examples");
  await expect(examples).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const top = () => examples.evaluate((node) => node.getBoundingClientRect().top);
  await expect.poll(top).toBeGreaterThanOrEqual(70);
  await expect.poll(top).toBeLessThan(120);
  await expect(examples.getByRole("article")).toHaveCount(2);
});
