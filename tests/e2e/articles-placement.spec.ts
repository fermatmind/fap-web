import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
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

type ArticleFixture = {
  id: number;
  slug: string;
  locale: "en" | "zh-CN";
  title: string;
  excerpt: string;
  content_md: string;
  related_test_slug: string;
  related_test_slugs: string[];
  test_edges: Array<{
    test_slug: string;
    role: "primary";
    locale: "en" | "zh-CN";
    sort_order: number;
    visibility: "public";
  }>;
  voice: "tool" | "growth" | "portrait";
  voice_order: number;
  status: "published";
  is_public: true;
  is_indexable: true;
  published_revision_id: number;
  published_at: string;
  updated_at: string;
};

let mockApiServer: ReturnType<typeof createServer> | null = null;

function articleFixtures(locale: "en" | "zh-CN"): ArticleFixture[] {
  return Object.entries(EXPECTED_PLACEMENT).flatMap(([testSlug, slugs], groupIndex) =>
    slugs.map((slug, articleIndex) => ({
      id: groupIndex * 10 + articleIndex + 1,
      slug,
      locale,
      title: locale === "zh-CN" ? `${slug} 中文标题` : `${slug} fixture title`,
      excerpt: locale === "zh-CN" ? "用于稳定端到端验证的已发布文章摘要。" : "Published article fixture for deterministic end-to-end coverage.",
      content_md:
        locale === "zh-CN"
          ? "## 确定性正文\n\n这是测试内固定的已发布文章正文。"
          : "## Deterministic body\n\nThis published article body is owned by the test fixture.",
      related_test_slug: testSlug,
      related_test_slugs: [testSlug],
      test_edges: [
        {
          test_slug: testSlug,
          role: "primary",
          locale,
          sort_order: (articleIndex + 1) * 10,
          visibility: "public",
        },
      ],
      voice: (["tool", "growth", "portrait"] as const)[articleIndex],
      voice_order: articleIndex + 1,
      status: "published",
      is_public: true,
      is_indexable: true,
      published_revision_id: groupIndex * 10 + articleIndex + 101,
      published_at: "2026-08-01T00:00:00.000Z",
      updated_at: "2026-08-01T00:00:00.000Z",
    }))
  );
}

function writeJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function handleMockApiRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1:8000");
  const pathname = requestUrl.pathname.startsWith("/api")
    ? requestUrl.pathname.slice(4)
    : requestUrl.pathname;
  const locale = requestUrl.searchParams.get("locale") === "zh-CN" ? "zh-CN" : "en";
  const fixtures = articleFixtures(locale);

  if (pathname === "/v0.5/articles") {
    writeJson(res, 200, {
      ok: true,
      items: fixtures,
      pagination: {
        current_page: 1,
        per_page: 20,
        total: fixtures.length,
        last_page: 1,
      },
    });
    return;
  }

  const detailMatch = pathname.match(/^\/v0\.5\/articles\/([^/]+?)(\/seo)?$/);
  if (detailMatch) {
    const slug = decodeURIComponent(detailMatch[1]);
    const article = fixtures.find((candidate) => candidate.slug === slug);
    if (!article) {
      writeJson(res, 404, { ok: false, message: "not found" });
      return;
    }

    if (detailMatch[2] === "/seo") {
      const localizedPrefix = locale === "zh-CN" ? "zh" : "en";
      writeJson(res, 200, {
        meta: {
          title: article.title,
          description: article.excerpt,
          canonical: `https://fermatmind.com/${localizedPrefix}/articles/${article.slug}`,
          alternates: {
            en: `/en/articles/${article.slug}`,
            "zh-CN": `/zh/articles/${article.slug}`,
          },
          robots: "index,follow",
        },
        jsonld: null,
        seo_surface_v1: null,
      });
      return;
    }

    writeJson(res, 200, {
      ok: true,
      article,
      landing_surface_v1: null,
      answer_surface_v1: null,
    });
    return;
  }

  writeJson(res, 200, { ok: true, items: [] });
}

test.beforeAll(async () => {
  mockApiServer = createServer(handleMockApiRequest);
  await new Promise<void>((resolve) => {
    mockApiServer?.listen(8000, "127.0.0.1", resolve);
  });
});

test.afterAll(async () => {
  if (!mockApiServer) {
    return;
  }

  await new Promise<void>((resolve) => {
    mockApiServer?.close(() => resolve());
  });
  mockApiServer = null;
});

test("articles page preserves deterministic three-card placement for each related test", async ({ page }) => {
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}/articles`);
    const cards = page.locator('[data-testid^="articles-card-"]');
    const expectedSlugs = Object.values(EXPECTED_PLACEMENT).flat();
    await expect(cards).toHaveCount(expectedSlugs.length);

    const hrefs = await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.querySelector<HTMLAnchorElement>('a[href*="/articles/"]')?.getAttribute("href") || "")
    );
    expect(hrefs).toEqual(expectedSlugs.map((slug) => `/${locale}/articles/${slug}`));
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
