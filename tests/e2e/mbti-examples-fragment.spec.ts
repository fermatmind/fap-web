import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import publicFixtures from "../fixtures/public-content/marketing-public.json";

let stopFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => {
  const slug = "free-personality-tests-results-compared";
  const responses: Record<string, unknown> = {
    ...publicFixtures,
    [`/v0.5/articles/${slug}?locale=en`]: {
      ok: true,
      article: {
        id: 283, slug, locale: "en", title: "Compare free personality results", status: "published",
        is_public: true, is_indexable: true, published_revision_id: 1057,
        content_md: "## Inspect an example\n\n[Two synthetic preference examples](/en/tests/mbti-personality-test-16-personality-types#result-examples) are teaching examples, not personal reports.",
      },
      landing_surface_v1: null, answer_surface_v1: null,
    },
  };
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1:8000");
    const pathname = url.pathname.replace(/^\/api(?=\/)/, "");
    const locale = url.searchParams.get("locale")?.startsWith("zh") ? "zh-CN" : "en";
    const query = new URLSearchParams();
    if (pathname.endsWith("/lookup")) query.set("slug", url.searchParams.get("slug") ?? "");
    query.set("locale", locale);
    if (pathname.includes("/landing-surfaces/")) query.set("org_id", "0");
    const body = req.method === "GET" || req.method === "HEAD" ? responses[`${pathname}?${query}`] : undefined;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.statusCode = body ? 200 : 404;
    res.end(JSON.stringify(body ?? { ok: false, error_code: "UNMOCKED_PUBLIC_REQUEST" }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(8000, "127.0.0.1", () => { server.off("error", reject); resolve(); });
  });
  stopFixture = () => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections();
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

test("Chinese MBTI landing opens its localized preference examples on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/tests/mbti-personality-test-16-personality-types");
  await page.getByRole("link", { name: "看两个偏好结果示例" }).click();
  await expect(page).toHaveURL(/#result-examples$/);
  const examples = page.getByRole("region", { name: "答题前，先看两个结果示例" });
  await expect(examples.getByRole("article")).toHaveCount(2);
  await expect(examples).toContainText("虚构教学示例");
  await expect(examples).toContainText("I 51% / E 49%");
  await expect(examples.getByRole("link", { name: "阅读结果解读指南" }))
    .toHaveAttribute("href", "/zh/articles/mbti-full-report-career-relationship-communication");
  await expect(examples.getByRole("link", { name: "选择 93 题或 144 题" })).toHaveAttribute("href", "#choose-version");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
