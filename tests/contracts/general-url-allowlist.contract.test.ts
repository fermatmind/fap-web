import { describe, expect, it } from "vitest";
import { CANONICAL_MEDIA_ASSET_ORIGIN, cmsManagedMediaUrl } from "@/lib/cms/media";
import { normalizeAnswerSurface } from "@/lib/answer/answerSurface";
import { normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { normalizeLandingSurface } from "@/lib/landing/landingSurface";
import { buildRelationshipIndexViewModel } from "@/lib/mbti/relationshipIndex";
import { normalizeInternalHref, normalizeMediaAssetUrl } from "@/lib/url/safeContentUrls";

describe("general content URL allowlists", () => {
  it("allows same-site links while rejecting unsafe schemes and arbitrary external hrefs", () => {
    expect(normalizeInternalHref("/en/topics/mbti?from=topic#start")).toBe("/en/topics/mbti?from=topic#start");
    expect(normalizeInternalHref("https://fermatmind.com/zh/articles/read-me")).toBe("/zh/articles/read-me");
    expect(normalizeInternalHref("#overview")).toBe("#overview");
    expect(normalizeInternalHref("topics/mbti")).toBeNull();
    expect(normalizeInternalHref("https://example.org/phish")).toBeNull();
    expect(normalizeInternalHref("javascript:alert(1)")).toBeNull();
    expect(normalizeInternalHref("data:text/html,hello")).toBeNull();
    expect(normalizeInternalHref("//example.org/phish")).toBeNull();
  });

  it("keeps media on first-party or configured CDN origins only", () => {
    expect(cmsManagedMediaUrl(`${CANONICAL_MEDIA_ASSET_ORIGIN}/article/card.webp`)).toBe(
      `${CANONICAL_MEDIA_ASSET_ORIGIN}/article/card.webp`
    );
    expect(cmsManagedMediaUrl("content/article/card.webp")).toBe("/content/article/card.webp");
    expect(cmsManagedMediaUrl("https://cdn.example.com/article/card.webp")).toBeNull();
    expect(cmsManagedMediaUrl("https://fermatmind-1316873116.cos.ap-shanghai.myqcloud.com/article/card.webp")).toBeNull();
    expect(cmsManagedMediaUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeMediaAssetUrl("https://cdn.example.com/article/card.webp", {
      allowedOrigins: ["https://cdn.example.com"],
    })).toBe("https://cdn.example.com/article/card.webp");
  });

  it("redacts unsafe CMS landing and answer-surface hrefs before rendering", () => {
    const landing = normalizeLandingSurface({
      entry_surface: "topic_detail",
      entry_type: "topic_profile",
      cta_bundle: [
        { key: "safe", label: "Safe CTA", href: "/en/topics/mbti" },
        { key: "bad-scheme", label: "Bad scheme", href: "javascript:alert(1)" },
        { key: "bad-host", label: "Bad host", href: "https://example.org/phish" },
      ],
      discoverability_items: [
        { key: "safe-item", title: "Safe item", href: "https://fermatmind.com/en/articles/guide" },
        { key: "bad-item", title: "Bad item", url: "data:text/html,hello" },
      ],
    });

    expect(landing?.ctaBundle.map((item) => item.key)).toEqual(["safe"]);
    expect(landing?.ctaBundle[0]?.href).toBe("/en/topics/mbti");
    expect(landing?.discoverabilityItems.map((item) => item.key)).toEqual(["safe-item"]);
    expect(landing?.discoverabilityItems[0]?.href).toBe("/en/articles/guide");

    const answer = normalizeAnswerSurface({
      surface_type: "article_public_detail",
      summary_blocks: [
        { key: "summary", title: "Summary", href: "https://example.org/summary" },
      ],
      scene_summary_blocks: [
        { key: "safe-scene", title: "Safe scene", href: "/en/topics/mbti" },
        { key: "bad-scene", title: "Bad scene", href: "javascript:alert(1)" },
      ],
      next_step_blocks: [
        { key: "safe-next", title: "Safe next", href: "https://fermatmind.com/en/tests" },
        { key: "bad-next", title: "Bad next", href: "https://example.org/next" },
      ],
    });

    expect(answer?.summaryBlocks[0]?.href).toBeNull();
    expect(answer?.sceneSummaryBlocks.map((item) => [item.key, item.href])).toEqual([
      ["safe-scene", "/en/topics/mbti"],
      ["bad-scene", null],
    ]);
    expect(answer?.nextStepBlocks.map((item) => [item.key, item.href])).toEqual([
      ["safe-next", "/en/tests"],
      ["bad-next", null],
    ]);
  });

  it("keeps career and relationship links on internal paths", () => {
    expect(
      normalizeCareerBundleCanonicalPath(
        "en",
        "https://fermatmind.com/career/jobs/backend-architect",
        "/en/career/jobs/fallback"
      )
    ).toBe("/en/career/jobs/backend-architect");
    expect(
      normalizeCareerBundleCanonicalPath(
        "en",
        "https://example.org/career/jobs/backend-architect",
        "/en/career/jobs/fallback"
      )
    ).toBe("/en/career/jobs/fallback");

    const viewModel = buildRelationshipIndexViewModel({
      ok: true,
      scale_code: "MBTI",
      relationship_index_v1: {
        relationship_index_version: "relationship.index.v1",
        relationship_index_fingerprint: "relationship-index-url-guard",
        index_scope: "private_relationship_index",
        items: [
          {
            invite_id: "safe",
            resume_target: "/en/relationships/mbti/safe",
            relationship_resume_v1: null,
          },
          {
            invite_id: "unsafe",
            resume_target: "https://example.org/relationships/mbti/unsafe",
            relationship_resume_v1: null,
          },
        ],
      },
    });

    expect(viewModel?.items.map((item) => item.inviteId)).toEqual(["safe"]);
    expect(viewModel?.items[0]?.resumeTarget).toBe("/en/relationships/mbti/safe");
  });
});
