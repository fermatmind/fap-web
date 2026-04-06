import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildDefaultPublicPersonalitySlug,
  buildPersonalityFrontendUrl,
  getPersonalityProjectionDetailBySlugOrType,
  getPersonalityProfileBySlugOrType,
  listPersonalityProfiles,
  mapFrontendLocaleToPersonalityApiLocale,
  normalizePersonalitySeoPayload,
  normalizePersonalitySlug,
  type CmsPersonalityProfile,
} from "@/lib/cms/personality";
import { extractPersonalityFaqItems, getRenderablePersonalitySections } from "@/lib/cms/personality-sections";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const BASE_PROFILE: CmsPersonalityProfile = {
  id: 1,
  orgId: 0,
  scaleCode: "MBTI",
  typeCode: "INTJ",
  slug: "intj",
  locale: "en",
  title: "INTJ - Architect",
  subtitle: "Independent, strategic, and future-oriented.",
  excerpt: "INTJs tend to value competence, systems, and long-range thinking.",
  status: "published",
  isPublic: true,
  isIndexable: true,
  publishedAt: "2026-03-08T10:00:00Z",
  updatedAt: "2026-03-08T10:30:00Z",
  heroKicker: "The Strategist",
  heroQuote: "",
  heroImageUrl: null,
  seoMeta: {
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    ogTitle: null,
    ogDescription: null,
    ogImageUrl: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImageUrl: null,
    robots: null,
    jsonldOverrides: null,
  },
  sections: [],
};
const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("personality cms adapter contract", () => {
  it("maps frontend locale and slug to the expected api and frontend conventions", () => {
    expect(mapFrontendLocaleToPersonalityApiLocale("en")).toBe("en");
    expect(mapFrontendLocaleToPersonalityApiLocale("zh")).toBe("zh-CN");
    expect(normalizePersonalitySlug(" INTJ ")).toBe("intj");
    expect(buildDefaultPublicPersonalitySlug(" INTJ ")).toBe("intj-a");
    expect(buildPersonalityFrontendUrl("en", "INTJ")).toBe("/en/personality/intj");
    expect(buildPersonalityFrontendUrl("zh", "INTJ")).toBe("/zh/personality/intj");
  });

  it("requests the list endpoint with the backend locale mapping", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      expect(url).toContain("/api/v0.5/personality?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("org_id=0");
      expect(url).toContain("scale_code=MBTI");

      return jsonResponse({
        ok: true,
        items: [
          {
            id: 1,
            org_id: 0,
            scale_code: "MBTI",
            type_code: "INTJ",
            slug: "intj",
            locale: "zh-CN",
            title: "INTJ 人格画像",
            subtitle: "独立、战略、面向未来。",
            excerpt: "示例摘要",
            status: "published",
            is_public: true,
            is_indexable: true,
            published_at: "2026-03-08T10:00:00Z",
            updated_at: "2026-03-08T10:30:00Z",
            seo_meta: {
              seo_title: "INTJ 人格画像",
              seo_description: "示例 SEO 描述",
            },
          },
        ],
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 1,
          last_page: 1,
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await listPersonalityProfiles({ locale: "zh" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.locale).toBe("zh-CN");
    expect(result.items[0]?.slug).toBe("intj");
    expect(result.pagination.total).toBe(1);
  });

  it("normalizes detail payload and keeps only known sections", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          profile: {
            id: 1,
            org_id: 0,
            scale_code: "MBTI",
            type_code: "INTJ",
            slug: "intj",
            locale: "en",
            title: "INTJ - Architect",
            subtitle: "Independent, strategic, and future-oriented.",
            excerpt: "INTJs tend to value competence, systems, and long-range thinking.",
            hero_kicker: "The Strategist",
            hero_quote: "See the pattern. Build the system.",
            hero_image_url: null,
            status: "published",
            is_public: true,
            is_indexable: true,
            published_at: "2026-03-08T10:00:00Z",
            updated_at: "2026-03-08T10:30:00Z",
          },
          sections: [
            {
              section_key: "core_snapshot",
              title: "Core snapshot",
              render_variant: "rich_text",
              body_md: "Overview body",
              body_html: null,
              payload_json: null,
              sort_order: 10,
              is_enabled: true,
            },
            {
              section_key: "unknown_future_section",
              title: "Unknown",
              render_variant: "rich_text",
              body_md: "Should be ignored by the renderer layer",
              body_html: null,
              payload_json: null,
              sort_order: 20,
              is_enabled: true,
            },
          ],
          seo_meta: null,
        })
      )
    );

    const profile = await getPersonalityProfileBySlugOrType("INTJ", "en");

    expect(profile).not.toBeNull();
    expect(profile?.slug).toBe("intj");
    expect(profile?.typeCode).toBe("INTJ");
    expect(profile?.sections).toHaveLength(2);
    expect(getRenderablePersonalitySections(profile?.sections ?? [])).toHaveLength(1);
  });

  it("builds a projection-first detail view model while keeping wrapper compatibility fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          profile: {
            id: 1,
            org_id: 0,
            scale_code: "MBTI",
            type_code: "INTJ",
            slug: "intj",
            locale: "en",
            title: "Wrapper title should not drive the page",
            subtitle: "Wrapper subtitle",
            excerpt: "Wrapper excerpt should not drive the page",
            hero_kicker: "The strategist",
            hero_quote: "See the pattern. Build the system.",
            hero_image_url: "https://cdn.example.com/intj.jpg",
            status: "published",
            is_public: true,
            is_indexable: true,
            published_at: "2026-03-08T10:00:00Z",
            updated_at: "2026-03-08T10:30:00Z",
          },
          sections: [
            {
              section_key: "faq",
              title: "FAQ",
              render_variant: "faq",
              body_md: "",
              body_html: null,
              payload_json: {
                items: [{ question: "What defines INTJ?", answer: "Pattern logic and long-range planning." }],
              },
              sort_order: 90,
              is_enabled: true,
            },
            {
              section_key: "related_content",
              title: "Related content",
              render_variant: "links",
              body_md: "",
              body_html: null,
              payload_json: {
                items: [{ title: "ENTJ", slug: "entj", summary: "Compare neighboring strategy styles." }],
              },
              sort_order: 100,
              is_enabled: true,
            },
          ],
          seo_meta: {
            seo_title: "INTJ Personality Type",
            seo_description: "Projection-backed seo description.",
          },
          landing_surface_v1: {
            landing_contract_version: "landing.surface.v1",
            landing_scope: "public_indexable_detail",
            entry_surface: "personality_detail",
            entry_type: "personality_profile",
            cta_bundle: [
              { key: "start_test", label: "Start test", href: "/en/tests/mbti-personality-test-16-personality-types" },
            ],
          },
          answer_surface_v1: {
            answer_contract_version: "answer.surface.v1",
            answer_scope: "public_indexable_detail",
            surface_type: "personality_public_detail",
            summary_blocks: [
              {
                key: "hero_summary",
                title: "Quick summary",
                body: "Answer contract summary.",
              },
            ],
            faq_blocks: [
              {
                key: "faq_0",
                question: "What defines INTJ?",
                answer: "Pattern logic and long-range planning.",
              },
            ],
            compare_blocks: [
              {
                key: "EI",
                title: "Energy",
                body: "Leans inward before acting.",
              },
            ],
            next_step_blocks: [
              {
                key: "start_test",
                title: "Start test",
                href: "/en/tests/mbti-personality-test-16-personality-types",
              },
            ],
          },
          mbti_public_projection_v1: {
            runtime_type_code: null,
            canonical_type_code: "INTJ",
            display_type: "INTJ",
            variant_code: null,
            profile: {
              type_name: "Architect",
              nickname: "Systems builder",
              rarity: "About 2%",
              keywords: ["strategy", "independence"],
              hero_summary: "Projection hero summary.",
            },
            summary_card: {
              title: "INTJ - Architect",
              subtitle: "Independent, strategic, and future-oriented.",
              summary: "Projection summary card body.",
            },
            dimensions: [
              {
                id: "EI",
                name: "Energy",
                axis_left: "Extraversion",
                axis_right: "Introversion",
                summary: "Leans inward before acting.",
                description: "Prefers solitary synthesis before social output.",
              },
            ],
            sections: [
              {
                key: "overview",
                title: "Overview",
                render: "rich_text",
                body_md: "Projection overview body",
                payload: null,
                is_enabled: true,
                source: "base",
              },
              {
                key: "career.summary",
                title: "Career summary",
                render: "rich_text",
                body_md: "Projection career summary",
                payload: null,
                is_enabled: true,
                source: "base",
              },
            ],
            seo: {
              title: "INTJ Personality Type",
              description: "Projection-backed seo description.",
            },
            offer_set: [],
            _meta: {
              authority_source: "personality_cms_v2",
              route_mode: "base",
              public_route_type: "16-type",
              schema_version: "v2",
            },
          },
        })
      )
    );

    const detail = await getPersonalityProjectionDetailBySlugOrType("INTJ", "en");

    expect(detail).not.toBeNull();
    expect(detail?.canonicalTypeCode).toBe("INTJ");
    expect(detail?.displayType).toBe("INTJ");
    expect(detail?.title).toBe("INTJ - Architect");
    expect(detail?.subtitle).toBe("Independent, strategic, and future-oriented.");
    expect(detail?.summary).toBe("Projection summary card body.");
    expect(detail?.typeName).toBe("Architect");
    expect(detail?.nickname).toBe("Systems builder");
    expect(detail?.rarity).toBe("About 2%");
    expect(detail?.keywords).toEqual(["strategy", "independence"]);
    expect(detail?.heroSummary).toBe("Projection hero summary.");
    expect(detail?.projection.sections).toHaveLength(2);
    expect(detail?.projection.sections[0]?.key).toBe("overview");
    expect(detail?.projection.meta.publicRouteType).toBe("16-type");
    expect(detail?.slug).toBe("intj");
    expect(detail?.routeSlug).toBe("intj");
    expect(detail?.locale).toBe("en");
    expect(detail?.heroKicker).toBe("The strategist");
    expect(detail?.heroQuote).toBe("See the pattern. Build the system.");
    expect(detail?.heroImageUrl).toBe("https://cdn.example.com/intj.jpg");
    expect(detail?.faqSections).toHaveLength(1);
    expect(detail?.supplementalSections).toHaveLength(1);
    expect(detail?.seoMeta?.seoTitle).toBe("INTJ Personality Type");
    expect(detail?.landingSurface?.entrySurface).toBe("personality_detail");
    expect(detail?.landingSurface?.ctaBundle[0]?.href).toBe("/en/tests/mbti-personality-test-16-personality-types");
    expect(detail?.answerSurface?.surfaceType).toBe("personality_public_detail");
    expect(detail?.answerSurface?.summaryBlocks[0]?.body).toBe("Answer contract summary.");
    expect(detail?.answerSurface?.faqBlocks[0]?.question).toBe("What defines INTJ?");
  });

  it("personality routes consume landing surface instead of inventing local CTA truth", () => {
    expect(read("app/(localized)/[locale]/personality/page.tsx")).toContain("personality-index-landing-cta");
    expect(read("app/(localized)/[locale]/personality/[type]/page.tsx")).toContain("personality-detail-landing-cta");
    expect(read("app/(localized)/[locale]/personality/[type]/page.tsx")).toContain("detail.landingSurface");
    expect(read("app/(localized)/[locale]/personality/[type]/page.tsx")).toContain("detail.answerSurface");
    expect(read("app/(localized)/[locale]/personality/[type]/page.tsx")).toContain("personality-detail-answer-surface");
  });

  it("normalizes canonical and jsonld urls to locale-aware frontend personality urls", () => {
    const normalized = normalizePersonalitySeoPayload(
      {
        surface: null,
        meta: {
          title: "INTJ Personality Type",
          description: "Explore INTJ traits.",
          canonical: "https://staging.fermatmind.com/en/personality/intj-a",
          alternates: {
            en: "https://staging.fermatmind.com/en/personality/intj-a",
            "zh-CN": "https://staging.fermatmind.com/zh/personality/intj-a",
          },
          og: {
            title: "INTJ Personality Type",
            description: "Explore INTJ traits.",
            image: null,
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: "INTJ Personality Type",
            description: "Explore INTJ traits.",
            image: null,
          },
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          mainEntityOfPage: "https://staging.fermatmind.com/en/personality/intj-a",
        },
      },
      BASE_PROFILE,
      "en"
    );

    expect(normalized.meta.canonical).toBe("http://localhost:3000/en/personality/intj-a");
    expect(normalized.meta.alternates.en).toBe("http://localhost:3000/en/personality/intj-a");
    expect(normalized.meta.alternates["zh-CN"]).toBe("http://localhost:3000/zh/personality/intj-a");
    expect(normalized.surface).toBeNull();
    expect(
      (normalized.jsonld as Record<string, unknown>).mainEntityOfPage
    ).toBe("http://localhost:3000/en/personality/intj-a");
    expect((normalized.jsonld as Record<string, unknown>)["@type"]).toBe("AboutPage");
  });

  it("falls back to cms profile fields without reviving local personality content", () => {
    const normalized = normalizePersonalitySeoPayload(
      null,
      {
        ...BASE_PROFILE,
        locale: "zh-CN",
        title: "INTJ 建筑师",
        subtitle: "独立、战略、面向未来。",
        excerpt: "INTJ 倾向于重视系统、能力和长期规划。",
      },
      "zh"
    );

    expect(normalized.meta.title).toBe("INTJ 建筑师");
    expect(normalized.meta.description).toBe("INTJ 倾向于重视系统、能力和长期规划。");
    expect(normalized.meta.canonical).toBe("http://localhost:3000/zh/personality/intj-a");
    expect(normalized.meta.alternates.en).toBe("http://localhost:3000/en/personality/intj-a");
    expect(normalized.meta.alternates["zh-CN"]).toBe("http://localhost:3000/zh/personality/intj-a");
    expect(normalized.surface).toBeNull();
    expect(
      (normalized.jsonld as Record<string, unknown>).mainEntityOfPage
    ).toBe("http://localhost:3000/zh/personality/intj-a");
    expect((normalized.jsonld as Record<string, unknown>)["@type"]).toBe("AboutPage");
  });

  it("converts stale person-shaped jsonld into an about page with locale-aware mainEntityOfPage", () => {
    const normalized = normalizePersonalitySeoPayload(
      {
        surface: null,
        meta: {
          title: "INTJ Personality Guide",
          description: "Discover INTJ traits.",
          canonical: "https://staging.fermatmind.com/en/personality/intj-a",
          alternates: {
            en: "https://staging.fermatmind.com/en/personality/intj-a",
            "zh-CN": "https://staging.fermatmind.com/zh/personality/intj-a",
          },
          og: {
            title: "INTJ Personality Guide",
            description: "Discover INTJ traits.",
            image: null,
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: "INTJ Personality Guide",
            description: "Discover INTJ traits.",
            image: null,
          },
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": "https://staging.fermatmind.com/en/personality/intj-a#person",
          url: "https://staging.fermatmind.com/en/personality/intj-a",
          mainEntityOfPage: "https://staging.fermatmind.com/en/personality/intj-a",
        },
      },
      BASE_PROFILE,
      "en"
    );

    expect((normalized.jsonld as Record<string, unknown>)["@type"]).toBe("AboutPage");
    expect(
      (normalized.jsonld as Record<string, unknown>).mainEntityOfPage
    ).toBe("http://localhost:3000/en/personality/intj-a");
  });

  it("extracts FAQ items from cms faq sections for FAQ schema parity", () => {
    const items = extractPersonalityFaqItems([
      {
        sectionKey: "faq",
        title: "FAQ",
        renderVariant: "faq",
        bodyMd: "",
        bodyHtml: "",
        payloadJson: {
          items: [
            {
              question: "What does INTJ optimize for?",
              answer: "Long-range clarity, leverage, and structured execution.",
            },
          ],
        },
        sortOrder: 10,
        isEnabled: true,
      },
    ]);

    expect(items).toEqual([
      {
        question: "What does INTJ optimize for?",
        answer: "Long-range clarity, leverage, and structured execution.",
      },
    ]);
  });

  it("personality detail page redirects legacy 4-letter routes while keeping cms seo wiring and faq schema hooks", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain("alternatesByLocale");
    expect(source).toContain("seoSurface: normalizedSeo.surface");
    expect(source).toContain("redirectLegacyBaseRouteIfNeeded");
    expect(source).toContain("getPersonalityProjectionDetailBySlugOrType");
    expect(source).toContain('en: normalizedSeo.meta.alternates.en ?? buildPersonalityFrontendUrl("en", detail.routeSlug)');
    expect(source).toContain('zh: normalizedSeo.meta.alternates["zh-CN"] ?? buildPersonalityFrontendUrl("zh", detail.routeSlug)');
    expect(source).toContain("detail.displayType");
    expect(source).toContain("extractPersonalityFaqItems");
    expect(source).toContain("detail.answerSurface?.faqBlocks.length");
    expect(source).toContain("AnswerSurfaceSection");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("renderProjectionSections");
    expect(source).toContain("const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);");
    expect(source).toContain("const canonical = canonicalUrl(canonicalPath);");
    expect(source).toContain("url: canonical,");
    expect(source).toContain('robots: "noindex,nofollow"');
    expect(source).toContain("isIndexable: false");
    expect(source).toContain("const isFallbackRoute =");
    expect(source).toContain("!isFallbackRoute ? <JsonLd");
  });
});
