import { afterEach, describe, expect, it, vi } from "vitest";

import {
  parseArgs,
  verifyPublicArticleRelease,
} from "../../scripts/seo/verify-public-article-release.mjs";

const ARTICLE_URL = "https://fermatmind.com/zh/articles/gaokao-score-major-shortlist-riasec-checklist";
const ARTICLE_PATH = "/zh/articles/gaokao-score-major-shortlist-riasec-checklist";
const ARTICLE_EN_URL = "https://fermatmind.com/en/articles/gaokao-score-major-shortlist-riasec-checklist";
const ARTICLE_HREFLANG_CLUSTER = {
  en: ARTICLE_EN_URL,
  "zh-CN": ARTICLE_URL,
  "x-default": ARTICLE_EN_URL,
};
const BODY_VISUAL_URL = "https://assets.fermatmind.com/storage/media-library/body-visual.jpg";

function articleHtml(
  overrides: { jsonLd?: string; hreflang?: string; canonical?: string; body?: string; headExtra?: string } = {}
): string {
  return `<!doctype html>
  <html>
    <head>
      <title>高考分数出来后，怎么筛选专业？霍兰德和专业清单</title>
      <meta name="description" content="用高考分数、位次和霍兰德职业兴趣测试，把专业选择缩小到可验证清单。" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="${overrides.canonical || ARTICLE_URL}" />
      ${overrides.hreflang || ""}
      ${overrides.headExtra || ""}
      <script type="application/ld+json">
        ${
          overrides.jsonLd ||
          JSON.stringify([
            { "@context": "https://schema.org", "@type": "Article", headline: "高考分数出来后" },
            { "@context": "https://schema.org", "@type": "BreadcrumbList" },
          ])
        }
      </script>
    </head>
    <body>${overrides.body || "ok"}</body>
  </html>`;
}

function hreflangCluster(overrides: Partial<Record<keyof typeof ARTICLE_HREFLANG_CLUSTER | "fr", string>> = {}): string {
  const cluster = { ...ARTICLE_HREFLANG_CLUSTER, ...overrides };
  return Object.entries(cluster)
    .map(([hreflang, href]) => `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`)
    .join("\n");
}

function responseFor(
  url: string,
  options: { staleFirstArticle?: boolean; badArticle?: boolean; hreflang?: string } = {}
): Response {
  if (url.endsWith("/sitemap.xml")) {
    return new Response(`<urlset><url><loc>${ARTICLE_URL}</loc></url></urlset>`, {
      status: 200,
      headers: { "content-type": "application/xml" },
    });
  }

  if (url.endsWith("/llms.txt") || url.endsWith("/llms-full.txt")) {
    return new Response(`# FermatMind\n- ${ARTICLE_PATH}`, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  if (options.badArticle) {
    return new Response(
      articleHtml({
        jsonLd: JSON.stringify({ "@context": "https://schema.org", "@type": ["Article", "FAQPage"] }),
        hreflang: '<link rel="alternate" hreflang="en" href="https://fermatmind.com/en/articles/example" />',
      }),
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  if (options.staleFirstArticle) {
    return new Response(articleHtml({ canonical: "https://fermatmind.com/zh/articles/stale" }), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response(articleHtml({ hreflang: options.hreflang }), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public article release smoke verifier", () => {
  it("passes when public HTML, sitemap, llms, llms-full, and JSON-LD match the closeout contract", async () => {
    const fetchMock = vi.fn(async (url: string) => responseFor(url));
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectTitle: true,
      expectMeta: true,
      expectCanonical: true,
      expectRobots: "index,follow",
      expectSitemap: true,
      expectLlms: true,
      expectLlmsFull: true,
      expectJsonLd: ["Article", "BreadcrumbList"],
      forbidJsonLd: ["FAQPage"],
      forbidHreflang: true,
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.decision).toBe("PUBLIC_ARTICLE_RELEASE_SMOKE_PASSED");
    expect(result.external_search_submission_attempted).toBe(false);
    expect(result.cms_content_write_attempted).toBe(false);
    expect(result.production_write_attempted).toBe(false);
    expect(result.token_output).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("retries through a short cache-window drift before returning a pass", async () => {
    let articleFetches = 0;
    const fetchMock = vi.fn(async (url: string) => {
      if (url === ARTICLE_URL) {
        articleFetches += 1;
        return responseFor(url, { staleFirstArticle: articleFetches === 1 });
      }

      return responseFor(url);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectCanonical: true,
      retry: 2,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0].issues).toEqual([
      { code: "canonical-mismatch", detail: "https://fermatmind.com/zh/articles/stale" },
    ]);
  });

  it("blocks forbidden FAQ JSON-LD and hreflang drift without trying writes or search submission", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => responseFor(url, { badArticle: true })));

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      forbidJsonLd: ["FAQPage"],
      forbidHreflang: true,
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.decision).toBe("BLOCKED_PUBLIC_HTML_DRIFT");
    expect(result.issues.map((issue) => issue.code)).toEqual(["forbidden-jsonld", "forbidden-hreflang"]);
    expect(result.external_search_submission_attempted).toBe(false);
    expect(result.cms_content_write_attempted).toBe(false);
    expect(result.production_write_attempted).toBe(false);
  });

  it("passes when a bilingual article emits the exact expected hreflang cluster", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => responseFor(url, { hreflang: hreflangCluster() })));

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectCanonical: true,
      expectHreflang: ARTICLE_HREFLANG_CLUSTER,
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.attempts[0].checks.html.hreflang_links).toEqual([
      { hreflang: "en", href: ARTICLE_EN_URL },
      { hreflang: "zh-CN", href: ARTICLE_URL },
      { hreflang: "x-default", href: ARTICLE_EN_URL },
    ]);
  });

  it("blocks missing, mismatched, and unexpected hreflang entries", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        responseFor(url, {
          hreflang: hreflangCluster({
            en: "https://fermatmind.com/en/articles/wrong",
            "x-default": "",
            fr: "https://fermatmind.com/fr/articles/example",
          }).replace('<link rel="alternate" hreflang="x-default" href="" />', ""),
        })
      )
    );

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectHreflang: ARTICLE_HREFLANG_CLUSTER,
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual([
      "hreflang-mismatch",
      "missing-hreflang",
      "unexpected-hreflang",
    ]);
  });

  it("parses paste-ready CLI expectations for article closeout smoke checks", () => {
    expect(
      parseArgs([
        "--url",
        ARTICLE_URL,
        "--expect-title",
        "--expect-meta",
        "--expect-canonical",
        "--expect-robots=index,follow",
        "--expect-sitemap",
        "--expect-llms",
        "--expect-llms-full",
        "--expect-jsonld=Article,BreadcrumbList",
        "--forbid-jsonld=FAQPage",
        `--expect-hreflang=en=${ARTICLE_EN_URL},zh-CN=${ARTICLE_URL},x-default=${ARTICLE_EN_URL}`,
        `--expect-body-visual=${BODY_VISUAL_URL}`,
        "--expect-body-anchor=execution-plan",
        "--expect-answer-block=answer-block-execution-plan",
        "--retry=2",
        "--retry-delay-ms=1",
        "--json",
      ])
    ).toMatchObject({
      url: ARTICLE_URL,
      expectTitle: true,
      expectMeta: true,
      expectCanonical: true,
      expectRobots: "index,follow",
      expectSitemap: true,
      expectLlms: true,
      expectLlmsFull: true,
      expectJsonLd: ["Article", "BreadcrumbList"],
      forbidJsonLd: ["FAQPage"],
      expectHreflang: ARTICLE_HREFLANG_CLUSTER,
      expectBodyVisual: BODY_VISUAL_URL,
      expectBodyAnchor: "execution-plan",
      expectAnswerBlock: "answer-block-execution-plan",
      retry: 2,
      retryDelayMs: 1,
      json: true,
    });
  });

  it("passes required body visual parity only from the public article body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          articleHtml({
            body: `<article id="execution-plan" data-testid="article-detail-content"><div id="answer-block-execution-plan"></div><img src="/_next/image?url=${encodeURIComponent(BODY_VISUAL_URL)}&w=1600&q=75" alt="Execution plan" /></article>`,
          }),
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
        )
      )
    );

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectBodyVisual: BODY_VISUAL_URL,
      expectBodyAnchor: "execution-plan",
      expectAnswerBlock: "answer-block-execution-plan",
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(true);
    expect(result).toMatchObject({
      body_visual_required: true,
      body_visual_url: BODY_VISUAL_URL,
      body_visual_public_visible: true,
      body_anchor_match: true,
      answer_block_match: true,
      alt_text_present: true,
      body_visual_url_count: 1,
    });
    expect(result.attempts[0].checks.html.body_visual.ok).toBe(true);
  });

  it("rejects metadata-only visuals, wrong anchors, and missing alt text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          articleHtml({
            headExtra: `<meta property="og:image" content="${BODY_VISUAL_URL}" /><script>window.bodyVisual='${BODY_VISUAL_URL}'</script>`,
            body: `<article id="wrong-anchor" data-testid="article-detail-content"><div id="wrong-answer"></div><img src="${BODY_VISUAL_URL}" alt="" /></article>`,
          }),
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
        )
      )
    );

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectBodyVisual: BODY_VISUAL_URL,
      expectBodyAnchor: "execution-plan",
      expectAnswerBlock: "answer-block-execution-plan",
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual([
      "body-visual-alt-missing",
      "body-anchor-mismatch",
      "answer-block-mismatch",
    ]);
  });

  it("does not accept a body visual URL found only in head metadata or scripts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          articleHtml({
            headExtra: `<meta property="og:image" content="${BODY_VISUAL_URL}" /><script>window.bodyVisual='${BODY_VISUAL_URL}'</script>`,
            body: '<article id="execution-plan" data-testid="article-detail-content"><div id="answer-block-execution-plan"></div></article>',
          }),
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
        )
      )
    );

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectBodyVisual: BODY_VISUAL_URL,
      expectBodyAnchor: "execution-plan",
      expectAnswerBlock: "answer-block-execution-plan",
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(["body-visual-not-public-visible"]);
    expect(result.body_visual_url_count).toBe(0);
  });

  it("rejects a private or local expected body visual URL", async () => {
    const unsafeUrl = "http://localhost:3000/private/body.png?token=secret";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          articleHtml({
            body: `<article data-testid="article-detail-content"><img src="${unsafeUrl}" alt="Private" /></article>`,
          }),
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
        )
      )
    );

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      expectBodyVisual: unsafeUrl,
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("unsafe-body-visual-url");
  });

  it("supports explicitly forbidding the rendered body visual", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          articleHtml({ body: '<article data-testid="article-detail-content"><p>No body visual.</p></article>' }),
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
        )
      )
    );

    const result = await verifyPublicArticleRelease({
      url: ARTICLE_URL,
      forbidBodyVisual: true,
      retry: 1,
      retryDelayMs: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.body_visual_required).toBe(false);
  });
});
