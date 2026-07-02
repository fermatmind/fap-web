import { execFileSync } from "node:child_process";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { collectPathDecisions } from "@/app/api/content-release/revalidate/route";
import { normalizeAnswerSurface } from "@/lib/answer/answerSurface";
import { getCmsArticle, normalizeArticleSeoPayload } from "@/lib/cms/articles";
import { sanitizeCmsHtml, sanitizeCmsUrl } from "@/lib/cms/sanitizeCmsRichText";
import { normalizeLandingSurface } from "@/lib/landing/landingSurface";
import { isSecurity122Web05AllowedFile } from "./helpers/currentPrScope";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  clearLlmsFullResponseCache: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/seo/llmsFullResponseCache", () => ({
  clearLlmsFullResponseCache: mocks.clearLlmsFullResponseCache,
}));

const ROOT = process.cwd();
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/answer/answerSurface.ts",
  "lib/cms/articles.ts",
  "lib/cms/sanitizeCmsRichText.ts",
  "lib/landing/landingSurface.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-05-cms-url-field-guards.contract.test.ts",
];

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }
  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files.length > 0 || process.env.GITHUB_ACTIONS !== "true" ? files : CI_DIFF_FALLBACK_FILES;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("SECURITY-122-WEB-05 CMS URL and field guards", () => {
  it("allows only safe mailto headers and rejects body/header injection", () => {
    expect(sanitizeCmsUrl("mailto:support@fermatmind.com?subject=Help")).toBe("mailto:support@fermatmind.com?subject=Help");
    expect(sanitizeCmsUrl("mailto:support@fermatmind.com?body=https://private.example/result/abc")).toBeNull();
    expect(sanitizeCmsUrl("mailto:support@fermatmind.com%0D%0ABcc:leak@example.com")).toBeNull();
    expect(sanitizeCmsUrl("mailto:not-an-email")).toBeNull();

    const html = sanitizeCmsHtml(
      [
        '<a href="mailto:support@fermatmind.com?subject=Help">safe</a>',
        '<a href="mailto:support@fermatmind.com?body=https://private.example/result/abc">unsafe</a>',
      ].join("")
    );

    expect(html).toContain('href="mailto:support@fermatmind.com?subject=Help"');
    expect(html).toContain(">unsafe</a>");
    expect(html).not.toContain("private.example");
    expect(html).not.toContain("body=");
  });

  it("normalizes article CMS bodies and media URLs fail-closed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v0.5/articles/cms-guards?");

        return jsonResponse({
          ok: true,
          article: {
            id: 17,
            slug: "cms-guards",
            locale: "en",
            title: "CMS Guards",
            excerpt: "",
            content_md: { privatePath: "/orders/order_1" },
            content_html: ["<p>unsafe object body</p>"],
            status: "published",
            is_public: true,
            is_indexable: true,
            published_revision_id: 9,
            cover_image_url: "javascript:alert(1)",
            cover_image_variants: {
              hero: { url: "https://assets.fermatmind.com/articles/cms-guards/hero.webp", width: 1200, height: 630 },
              og: { url: "https://evil.example/private-og.png" },
              thumbnail: "https://api.fermatmind.com/media/articles/cms-guards-thumb.webp",
            },
            body_visual: {
              image_url: "javascript:alert(1)",
              fallback_authorized: true,
            },
          },
        });
      })
    );

    const article = await getCmsArticle("cms-guards", "en");

    expect(article).not.toBeNull();
    expect(article?.contentMd).toBe("");
    expect(article?.contentHtml).toBe("");
    expect(article?.excerpt).toBe("");
    expect(article?.coverImageUrl).toBe("https://assets.fermatmind.com/articles/cms-guards/hero.webp");
    expect(article?.coverImageVariants.hero?.url).toBe("https://assets.fermatmind.com/articles/cms-guards/hero.webp");
    expect(article?.coverImageVariants.og).toBeNull();
    expect(article?.coverImageVariants.thumbnail?.url).toBe("https://api.fermatmind.com/media/articles/cms-guards-thumb.webp");
    expect(article?.bodyVisual).toBeNull();
  });

  it("keeps article SEO JSON-LD bounded and sanitizes CMS media images", () => {
    const cyclic: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      url: "https://staging.fermatmind.com/en/articles/cms-guards",
    };
    cyclic.self = cyclic;

    const normalized = normalizeArticleSeoPayload(
      {
        meta: {
          title: "CMS Guards",
          description: "CMS guard contract.",
          canonical: "https://staging.fermatmind.com/en/articles/cms-guards",
          alternates: {},
          og: {
            title: "CMS Guards",
            description: "CMS guard contract.",
            image: "javascript:alert(1)",
          },
          twitter: {
            image: "https://assets.fermatmind.com/articles/cms-guards/twitter.webp",
          },
        },
        jsonld: cyclic,
      },
      "zh",
      "cms-guards"
    );

    expect(normalized?.meta.og.image).toBeNull();
    expect(normalized?.meta.twitter.image).toBe("https://assets.fermatmind.com/articles/cms-guards/twitter.webp");
    expect((normalized?.jsonld as Record<string, unknown>).url).toBe("http://localhost:3000/zh/articles/cms-guards");
    expect((normalized?.jsonld as Record<string, unknown>).self).toBeNull();
  });

  it("consumes only allowlisted landing and answer block fields", () => {
    const landing = normalizeLandingSurface({
      version: "landing.surface.v1",
      cta_bundle: [
        {
          key: "start",
          label: "Start",
          href: "/tests/mbti-personality-test-16-personality-types",
          url: "https://evil.example/private",
        },
        {
          label: "External",
          url: "/tests/mbti-personality-test-16-personality-types",
        },
        {
          label: "Unsafe",
          href: "javascript:alert(1)",
        },
      ],
      discoverability_items: [
        {
          title: "Topic",
          href: "/topics/mbti",
          private_url: "https://evil.example/private",
        },
      ],
    });
    const answer = normalizeAnswerSurface({
      version: "answer.surface.v1",
      compare_blocks: [
        {
          key: "compare",
          title: "Compare",
          body: "Visible comparison",
          href: "/articles/cms-guards",
          private_href: "https://evil.example/private",
        },
      ],
      faq_blocks: [
        {
          question: "Visible?",
          answer: "Only allowlisted fields render.",
          private_answer: "secret",
        },
      ],
      next_step_blocks: [
        {
          title: "Continue",
          href: "https://evil.example/private",
        },
      ],
    });

    expect(landing?.ctaBundle).toHaveLength(1);
    expect(landing?.ctaBundle[0]?.href).toBe("/tests/mbti-personality-test-16-personality-types");
    expect(landing?.discoverabilityItems[0]?.href).toBe("/topics/mbti");
    expect(answer?.compareBlocks).toEqual([
      {
        key: "compare",
        title: "Compare",
        body: "Visible comparison",
        href: "/articles/cms-guards",
        kind: null,
      },
    ]);
    expect(answer?.faqBlocks[0]?.answer).toBe("Only allowlisted fields render.");
    expect(answer?.nextStepBlocks[0]?.href).toBeNull();
  });

  it("keeps article release revalidation on public article and llms paths only", () => {
    const request = new NextRequest("https://fermatmind.com/api/content-release/revalidate");
    const decisions = collectPathDecisions(
      {
        content: {
          type: "article",
          slug: "cms-guards",
          locale: "en",
        },
        cache_signal: {
          urls: [
            "https://fermatmind.com/en/articles/cms-guards",
            "https://fermatmind.com/orders/order_1",
            "https://evil.example/en/articles/cms-guards",
          ],
        },
      },
      request.nextUrl.origin
    );

    expect(decisions.accepted).toEqual([
      "/en/articles/cms-guards",
      "/zh/articles",
      "/en/articles",
      "/zh/articles/cms-guards",
      "/llms.txt",
      "/llms-full.txt",
    ]);
    expect(decisions.rejected).toEqual([
      { path: "/orders/order_1", reason: "private_or_api_path" },
      { path: "", reason: "malformed_or_external_url" },
    ]);
  });

  it("keeps the WEB-05 diff inside the declared CMS URL and rendered-content guard scope", () => {
    expect(changedFiles()).not.toHaveLength(0);
    expect(changedFiles().filter((file) => !isSecurity122Web05AllowedFile(file))).toEqual([]);
  });
});
