import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildCareerRecommendationFrontendUrl,
  listMbtiCareerRecommendations,
  normalizeCareerRecommendationDetail,
} from "@/lib/cms/career-recommendations";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career recommendation public adapter contract", () => {
  it("requests the backend list endpoint and returns 32-type frontend hrefs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career-recommendations/mbti?");
        expect(url).toContain("locale=zh-CN");
        expect(url).toContain("org_id=0");

        return jsonResponse({
          items: [
            {
              runtime_type_code: "INTJ-A",
              canonical_type_code: "INTJ",
              display_type: "INTJ-A",
              variant_code: "A",
              public_route_slug: "intj-a",
              type_name: "Architect",
              nickname: "Strategic Planner",
              hero_summary: "Assertive architect summary.",
            },
          ],
        });
      })
    );

    const items = await listMbtiCareerRecommendations("zh");

    expect(items).toHaveLength(1);
    expect(items[0]?.displayType).toBe("INTJ-A");
    expect(items[0]?.publicRouteSlug).toBe("intj-a");
    expect(items[0]?.href).toBe("/zh/career/recommendations/mbti/intj-a");
  });

  it("normalizes detail payload from backend authority and keeps seo plus matched jobs/guides", () => {
    const detail = normalizeCareerRecommendationDetail(
      {
        runtime_type_code: "INTJ-A",
        canonical_type_code: "INTJ",
        display_type: "INTJ-A",
        variant_code: "A",
        public_route_slug: "intj-a",
        graph_type_code: "INTJ",
        type_name: "Architect",
        nickname: "Strategic Planner",
        hero_summary: "Assertive architect summary.",
        keywords: ["strategy", "systems"],
        career: {
          summary: {
            title: "Career summary",
            paragraphs: ["Architects thrive in systems work.", "They like long-range leverage."],
          },
          advantages: {
            title: "Advantages",
            items: [{ title: "Systems thinking", description: "They connect moving parts quickly." }],
          },
          weaknesses: {
            title: "Weaknesses",
            items: [{ title: "Patience", description: "They can move faster than group consensus." }],
          },
          preferred_roles: {
            title: "Preferred roles",
            intro: "Architects like strategic ownership.",
            groups: [
              {
                group_title: "Strategy",
                description: "Roles with leverage and direction.",
                examples: ["Product Strategy", "Research Lead"],
              },
            ],
            outro: "They usually want room to design systems.",
          },
          upgrade_suggestions: {
            title: "Upgrade suggestions",
            paragraphs: ["Work on translating complex reasoning."],
            bullets: [{ label: "Communication", content: "Explain the why before the conclusion." }],
          },
        },
        matched_jobs: [
          {
            slug: "product-strategist",
            title: "Product Strategist",
            summary: "Shape product direction and operating decisions.",
            fit_bucket: "primary",
            fit_personality_codes: ["INTJ"],
            mbti_primary_codes: ["INTJ"],
            mbti_secondary_codes: [],
          },
        ],
        matched_guides: [
          {
            slug: "systems-career-playbook",
            title: "Systems Career Playbook",
            summary: "How to choose roles with leverage and clarity.",
            fit_personality_codes: ["INTJ"],
          },
        ],
        seo: {
          title: "INTJ-A Career Recommendations | FermatMind",
          description: "Career recommendations, role fit, and growth paths for Architect.",
          canonical: "/zh/career/recommendations/mbti/intj-a",
          alternates: {
            en: "/en/career/recommendations/mbti/intj-a",
            "zh-CN": "/zh/career/recommendations/mbti/intj-a",
          },
        },
        _meta: {
          public_route_type: "32-type",
          route_mode: "public_variant",
          authority_source: "career_recommendation_service.v1",
        },
        seo_surface_v1: {
          metadata_contract_version: "seo.surface.v1",
          metadata_fingerprint: "career-seo-fingerprint",
          metadata_scope: "public_indexable_detail",
          surface_type: "career_recommendation_public_detail",
          canonical_url: "https://staging.fermatmind.com/zh/career/recommendations/mbti/intj-a",
          robots_policy: "index,follow",
          title: "INTJ-A Career Recommendations | FermatMind",
          description: "Career recommendations, role fit, and growth paths for Architect.",
          og_payload: {
            title: "INTJ-A Career Recommendations | FermatMind",
            description: "Career recommendations, role fit, and growth paths for Architect.",
            type: "article",
            url: "https://staging.fermatmind.com/zh/career/recommendations/mbti/intj-a",
          },
          twitter_payload: {
            card: "summary_large_image",
            title: "INTJ-A Career Recommendations | FermatMind",
            description: "Career recommendations, role fit, and growth paths for Architect.",
          },
          alternates: {
            en: "https://staging.fermatmind.com/en/career/recommendations/mbti/intj-a",
            "zh-CN": "https://staging.fermatmind.com/zh/career/recommendations/mbti/intj-a",
          },
          structured_data_keys: [],
          indexability_state: "indexable",
          sitemap_state: "included",
          llms_exposure_state: "allow",
        },
        landing_surface_v1: {
          landing_contract_version: "landing.surface.v1",
          landing_scope: "public_indexable_detail",
          entry_surface: "career_recommendation_detail",
          entry_type: "career_recommendation",
          cta_bundle: [
            { key: "matched_job", label: "View matching job", href: "/zh/career/jobs/product-strategist" },
          ],
        },
        answer_surface_v1: {
          answer_contract_version: "answer.surface.v1",
          answer_scope: "public_indexable_detail",
          surface_type: "career_recommendation_public_detail",
          summary_blocks: [
            {
              key: "career_summary",
              body: "Architects thrive in systems work.",
            },
          ],
          faq_blocks: [
            {
              key: "faq_0",
              question: "Which roles fit first?",
              answer: "Start with the highest-fit structured roles.",
            },
          ],
          compare_blocks: [
            {
              key: "graph_route_alignment",
              title: "Graph key",
              body: "Graph matching still follows INTJ.",
            },
          ],
          next_step_blocks: [
            {
              key: "matched_job",
              title: "View matching job",
              href: "/zh/career/jobs/product-strategist",
            },
          ],
        },
      },
      "zh"
    );

    expect(detail).not.toBeNull();
    expect(detail?.graphTypeCode).toBe("INTJ");
    expect(detail?.matchedJobs[0]?.fitBucket).toBe("primary");
    expect(detail?.matchedJobs[0]?.href).toBe("/zh/career/jobs/product-strategist");
    expect(detail?.matchedGuides[0]?.href).toBe("/zh/career/guides/systems-career-playbook");
    expect(detail?.career.preferredRoles.groups[0]?.groupTitle).toBe("Strategy");
    expect(detail?.seo.meta.canonical).toBe("http://localhost:3000/zh/career/recommendations/mbti/intj-a");
    expect(detail?.seo.meta.alternates.en).toBe("http://localhost:3000/en/career/recommendations/mbti/intj-a");
    expect(detail?.seo.meta.og.title).toBe("INTJ-A Career Recommendations | FermatMind");
    expect(detail?.seo.surface?.metadataContractVersion).toBe("seo.surface.v1");
    expect(detail?.seo.surface?.surfaceType).toBe("career_recommendation_public_detail");
    expect(detail?.landingSurface?.entrySurface).toBe("career_recommendation_detail");
    expect(detail?.landingSurface?.ctaBundle[0]?.href).toBe("/zh/career/jobs/product-strategist");
    expect(detail?.answerSurface?.surfaceType).toBe("career_recommendation_public_detail");
    expect(detail?.answerSurface?.faqBlocks[0]?.question).toBe("Which roles fit first?");
    expect(buildCareerRecommendationFrontendUrl("en", "INTJ-A")).toBe("/en/career/recommendations/mbti/intj-a");
  });

  it("career recommendation detail page redirects legacy 4-letter routes to the returned public slug and avoids local velite authority", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain("getMbtiCareerRecommendationByType");
    expect(source).toContain("parseMbtiContinuityQuery");
    expect(source).toContain("mbti-career-continuity-entry");
    expect(source).toContain("permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug))");
    expect(source).toContain("const canonicalPath = buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug);");
    expect(source).toContain("const canonical = canonicalUrl(canonicalPath);");
    expect(source).toContain("url: canonical,");
    expect(source).toContain("seoSurface: detail.seo.surface");
    expect(source).toContain("landingSurface?.ctaBundle");
    expect(source).toContain("detail.answerSurface");
    expect(source).toContain("career-recommendation-answer-surface");
    expect(source).not.toContain("getMbtiRecommendation");
    expect(source).not.toContain("getCareerJobBySlug");
    expect(source).not.toContain("listMbtiRecommendationTypes");
  });
});
