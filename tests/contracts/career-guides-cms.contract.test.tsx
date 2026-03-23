import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adaptCareerGuideDetail,
  buildCareerGuideFrontendUrl,
  getCareerGuideFromCmsBySlug,
  getCareerGuideSeoFromCmsBySlug,
  listCareerGuidesFromCms,
  mapFrontendLocaleToCareerGuideApiLocale,
  normalizeCareerGuideSeoPayload,
} from "@/lib/cms/career-guides";
import { getCareerIndustryBySlug } from "@/lib/content";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career guides cms adapter contract", () => {
  it("maps frontend locale and href conventions", () => {
    expect(mapFrontendLocaleToCareerGuideApiLocale("en")).toBe("en");
    expect(mapFrontendLocaleToCareerGuideApiLocale("zh")).toBe("zh-CN");
    expect(buildCareerGuideFrontendUrl("en", "From-MBTI-To-Job-Fit")).toBe(
      "/en/career/guides/from-mbti-to-job-fit"
    );
    expect(buildCareerGuideFrontendUrl("zh", "From-MBTI-To-Job-Fit")).toBe(
      "/zh/career/guides/from-mbti-to-job-fit"
    );
  });

  it("requests the list endpoint with backend locale mapping and returns localized hrefs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career-guides?");
        expect(url).toContain("locale=zh-CN");
        expect(url).toContain("org_id=0");

        return jsonResponse({
          ok: true,
          items: [
            {
              slug: "from-mbti-to-job-fit",
              locale: "zh-CN",
              title: "从 MBTI 到职业匹配",
              excerpt: "把人格线索转成职业判断。",
              category_slug: "assessment-usage",
            },
          ],
          pagination: {
            current_page: 1,
            per_page: 20,
            total: 1,
            last_page: 1,
          },
        });
      })
    );

    const items = await listCareerGuidesFromCms("zh");

    expect(items).toHaveLength(1);
    expect(items[0]?.href).toBe("/zh/career/guides/from-mbti-to-job-fit");
    expect(items[0]?.category).toBe("assessment-usage");
  });

  it("adapts detail payload with body fields, local industry mapping, and personality hrefs", () => {
    const detail = adaptCareerGuideDetail(
      {
        guide: {
          slug: "from-mbti-to-job-fit",
          locale: "zh-CN",
          title: "从 MBTI 到职业匹配",
          excerpt: "把人格线索转成职业判断。",
          category_slug: "assessment-usage",
          body_md: "# 职业指南\n\n- 先看长期匹配",
          body_html: "<h2>职业指南</h2><p>先看长期匹配</p>",
          is_public: true,
          is_indexable: true,
        },
        related_jobs: [
          {
            slug: "product-manager",
            locale: "zh-CN",
            title: "产品经理",
            excerpt: "连接用户、业务与工程。",
          },
        ],
        related_industries: ["consulting"],
        related_articles: [
          {
            slug: "how-to-read-mbti-results",
            locale: "zh-CN",
            title: "如何理解 MBTI 结果",
            excerpt: "从结果走向行动。",
          },
        ],
        related_personality_profiles: [
          {
            slug: "intj",
            type_code: "INTJ",
            locale: "zh-CN",
            title: "INTJ 人格画像",
            excerpt: "战略、长期、系统化。",
          },
        ],
        landing_surface_v1: {
          landing_contract_version: "landing.surface.v1",
          entry_surface: "career_guide_detail",
          entry_type: "career_guide",
          cta_bundle: [
            { key: "start_test", label: "开始测试", href: "/zh/tests/mbti-personality-test-16-personality-types" },
          ],
        },
        answer_surface_v1: {
          answer_contract_version: "answer.surface.v1",
          answer_scope: "public_indexable_detail",
          surface_type: "career_guide_public_detail",
          summary_blocks: [
            {
              key: "guide_summary",
              body: "把人格线索转成职业判断。",
            },
          ],
          next_step_blocks: [
            {
              key: "start_test",
              title: "开始测试",
              href: "/zh/tests/mbti-personality-test-16-personality-types",
            },
          ],
        },
      },
      "zh"
    );

    const industry = getCareerIndustryBySlug("consulting", "zh");

    expect(detail).not.toBeNull();
    expect(detail?.bodyMd).toContain("# 职业指南");
    expect(detail?.bodyHtml).toContain("<h2>职业指南</h2>");
    expect(detail?.relatedJobs).toEqual([
      {
        slug: "product-manager",
        title: "产品经理",
        summary: "连接用户、业务与工程。",
        href: "/zh/career/jobs/product-manager",
      },
    ]);
    expect(detail?.relatedIndustries).toEqual(
      industry
        ? [
            {
              slug: industry.slug,
              title: industry.title,
              summary: industry.summary,
              href: "/zh/career/industries/consulting",
            },
          ]
        : []
    );
    expect(detail?.relatedArticles).toEqual([
      {
        slug: "how-to-read-mbti-results",
        title: "如何理解 MBTI 结果",
        summary: "从结果走向行动。",
        href: "/zh/articles/how-to-read-mbti-results",
      },
    ]);
    expect(detail?.relatedPersonalityProfiles).toEqual([
      {
        slug: "intj",
        title: "INTJ 人格画像",
        summary: "战略、长期、系统化。",
        href: "/zh/personality/intj",
      },
    ]);
    expect(detail?.landingSurface?.entrySurface).toBe("career_guide_detail");
    expect(detail?.landingSurface?.ctaBundle[0]?.href).toBe("/zh/tests/mbti-personality-test-16-personality-types");
    expect(detail?.answerSurface?.surfaceType).toBe("career_guide_public_detail");
    expect(detail?.answerSurface?.summaryBlocks[0]?.body).toBe("把人格线索转成职业判断。");
  });

  it("returns null for 404 detail and seo lookups", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          {
            message: "Not found.",
            error_code: "NOT_FOUND",
          },
          404
        )
      )
    );

    await expect(getCareerGuideFromCmsBySlug("missing-guide", "en")).resolves.toBeNull();
    await expect(getCareerGuideSeoFromCmsBySlug("missing-guide", "en")).resolves.toBeNull();
  });

  it("normalizes canonical, alternates, and jsonld to localized frontend urls", () => {
    const guide = adaptCareerGuideDetail(
      {
        guide: {
          slug: "from-mbti-to-job-fit",
          locale: "en",
          title: "From MBTI to Job Fit",
          excerpt: "Translate personality insights into career decisions.",
          category_slug: "assessment-usage",
          body_md: "# Guide body",
          is_public: true,
          is_indexable: true,
        },
      },
      "en"
    );

    expect(guide).not.toBeNull();

    const normalized = normalizeCareerGuideSeoPayload(
      {
        surface: null,
        meta: {
          title: "From MBTI to Job Fit | FermatMind",
          description: "Translate personality insights into practical career decisions.",
          canonical: "https://staging.fermatmind.com/en/career/guides/from-mbti-to-job-fit",
          alternates: {
            en: "https://staging.fermatmind.com/en/career/guides/from-mbti-to-job-fit",
            "zh-CN": "https://staging.fermatmind.com/zh/career/guides/from-mbti-to-job-fit",
          },
          og: {
            title: "From MBTI to Job Fit",
            description: "Translate personality insights into practical career decisions.",
            image: null,
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: "From MBTI to Job Fit",
            description: "Translate personality insights into practical career decisions.",
            image: null,
          },
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: "https://staging.fermatmind.com/en/career/guides/from-mbti-to-job-fit",
          "@id": "https://staging.fermatmind.com/en/career/guides/from-mbti-to-job-fit#webpage",
          mainEntityOfPage: "https://staging.fermatmind.com/en/career/guides/from-mbti-to-job-fit",
        },
      },
      guide!,
      "zh"
    );

    const jsonld = normalized.jsonld as Record<string, unknown>;

    expect(normalized.meta.canonical).toBe(
      "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit"
    );
    expect(normalized.meta.alternates.en).toBe(
      "http://localhost:3000/en/career/guides/from-mbti-to-job-fit"
    );
    expect(normalized.meta.alternates["zh-CN"]).toBe(
      "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit"
    );
    expect(normalized.surface).toBeNull();
    expect(jsonld.url).toBe("http://localhost:3000/zh/career/guides/from-mbti-to-job-fit");
    expect(jsonld["@id"]).toBe(
      "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit#webpage"
    );
    expect(jsonld.mainEntityOfPage).toBe(
      "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit"
    );
  });
});

describe("career guides frontend boundary contract", () => {
  it("keeps guide pages on CMS helpers instead of local guide runtime helpers", () => {
    const adapterSource = read("lib/cms/career-guides.ts");
    const listSource = read("app/(localized)/[locale]/career/guides/page.tsx");
    const detailSource = read("app/(localized)/[locale]/career/guides/[slug]/page.tsx");
    const aliasSource = read("app/(localized)/[locale]/career/[slug]/page.tsx");
    const landingSource = read("app/(localized)/[locale]/career/page.tsx");

    expect(adapterSource).toContain("toApiLocale");
    expect(adapterSource).not.toContain("getCareerGuideBySlug");
    expect(listSource).toContain("listCareerGuidesFromCms");
    expect(listSource).not.toContain("listCareerGuides(");
    expect(detailSource).toContain("getCareerGuideFromCmsBySlug");
    expect(detailSource).toContain("getCareerGuideSeoFromCmsBySlug");
    expect(detailSource).toContain("normalizeCareerGuideSeoPayload");
    expect(detailSource).toContain("seoSurface: normalizedSeo.surface");
    expect(detailSource).toContain("guide.landingSurface");
    expect(detailSource).toContain("guide.answerSurface");
    expect(detailSource).toContain("career-guide-answer-surface");
    expect(detailSource).toContain("career-guide-landing-cta");
    expect(detailSource).toContain("renderSimpleMarkdown");
    expect(detailSource).toContain("dangerouslySetInnerHTML");
    expect(detailSource).not.toContain("getCareerGuideBySlug");
    expect(detailSource).not.toContain("listCareerGuideSlugs");
    expect(detailSource).not.toContain("listRelatedArticlesForGuide");
    expect(detailSource).not.toContain("listRelatedTypesForGuide");
    expect(detailSource).not.toContain("renderVeliteMdx");
    expect(aliasSource).toContain("getCareerGuideFromCmsBySlug");
    expect(aliasSource).not.toContain("getCareerGuideBySlug");
    expect(aliasSource).toContain('export const dynamic = "force-dynamic"');
    expect(landingSource).toContain("listCareerGuidesFromCms");
    expect(landingSource).not.toContain("listCareerGuides(");
    expect(landingSource).toContain("perPage: 4");
    expect(landingSource).toContain(".slice(0, 4)");
  });

  it("calls notFound when the cms detail lookup misses", async () => {
    const notFound = vi.fn(() => {
      throw new Error("not-found");
    });
    const getCareerGuideFromCmsBySlugMock = vi.fn(async () => null);
    const getCareerGuideSeoFromCmsBySlugMock = vi.fn(async () => null);

    vi.doMock("next/navigation", () => ({
      notFound,
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      buildCareerGuideFrontendUrl: vi.fn((locale: string, slug: string) => `/${locale}/career/guides/${slug}`),
      getCareerGuideFromCmsBySlug: getCareerGuideFromCmsBySlugMock,
      getCareerGuideSeoFromCmsBySlug: getCareerGuideSeoFromCmsBySlugMock,
      normalizeCareerGuideSeoPayload: vi.fn(),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));

    const { default: CareerGuideDetailPage } = await import(
      "@/app/(localized)/[locale]/career/guides/[slug]/page"
    );

    await expect(
      CareerGuideDetailPage({
        params: Promise.resolve({ locale: "en", slug: "missing-guide" }),
      })
    ).rejects.toThrow("not-found");

    expect(getCareerGuideFromCmsBySlugMock).toHaveBeenCalledWith("missing-guide", "en");
    expect(getCareerGuideSeoFromCmsBySlugMock).toHaveBeenCalledWith("missing-guide", "en");
    expect(notFound).toHaveBeenCalled();
  });

  it("builds detail metadata from adapter-normalized seo payload", async () => {
    const guide = {
      slug: "from-mbti-to-job-fit",
      title: "From MBTI to Job Fit",
      summary: "Translate personality insights into career decisions.",
      isIndexable: true,
      bodyMd: "# Guide body",
      bodyHtml: "",
      category: "assessment-usage",
      updatedAt: "2026-03-05T09:00:00Z",
      relatedJobs: [],
      relatedIndustries: [],
      relatedArticles: [],
      relatedPersonalityProfiles: [],
    };
    const normalizedSeo = {
      meta: {
        title: "From MBTI to Job Fit | FermatMind",
        description: "Translate personality insights into practical career decisions.",
        canonical: "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit",
        alternates: {
          en: "http://localhost:3000/en/career/guides/from-mbti-to-job-fit",
          "zh-CN": "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit",
        },
        og: {
          title: "From MBTI to Job Fit",
          description: "Translate personality insights into practical career decisions.",
          image: null,
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: "From MBTI to Job Fit",
          description: "Translate personality insights into practical career decisions.",
          image: null,
        },
        robots: "index,follow",
      },
      jsonld: {
        "@type": "WebPage",
      },
    };
    const getCareerGuideFromCmsBySlugMock = vi.fn(async () => guide);
    const getCareerGuideSeoFromCmsBySlugMock = vi.fn(async () => ({
      meta: {
        title: "ignored",
        description: "ignored",
        canonical: null,
        alternates: {
          en: null,
          "zh-CN": null,
        },
        og: {
          title: "ignored",
          description: "ignored",
          image: null,
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: "ignored",
          description: "ignored",
          image: null,
        },
        robots: "index,follow",
      },
      jsonld: null,
    }));
    const normalizeCareerGuideSeoPayloadMock = vi.fn(() => normalizedSeo);

    vi.doMock("@/lib/cms/career-guides", () => ({
      buildCareerGuideFrontendUrl: vi.fn((locale: string, slug: string) => `/${locale}/career/guides/${slug}`),
      getCareerGuideFromCmsBySlug: getCareerGuideFromCmsBySlugMock,
      getCareerGuideSeoFromCmsBySlug: getCareerGuideSeoFromCmsBySlugMock,
      normalizeCareerGuideSeoPayload: normalizeCareerGuideSeoPayloadMock,
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "zh"),
    }));

    const { generateMetadata } = await import(
      "@/app/(localized)/[locale]/career/guides/[slug]/page"
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "zh", slug: "from-mbti-to-job-fit" }),
    });

    expect(getCareerGuideFromCmsBySlugMock).toHaveBeenCalledWith(
      "from-mbti-to-job-fit",
      "zh"
    );
    expect(getCareerGuideSeoFromCmsBySlugMock).toHaveBeenCalledWith(
      "from-mbti-to-job-fit",
      "zh"
    );
    expect(normalizeCareerGuideSeoPayloadMock).toHaveBeenCalled();
    expect(String(metadata.alternates?.canonical)).toBe(
      "http://localhost:3000/zh/career/guides/from-mbti-to-job-fit"
    );
    expect(metadata.openGraph?.title).toBe("From MBTI to Job Fit");
    expect(metadata.twitter?.title).toBe("From MBTI to Job Fit");
  });
});
