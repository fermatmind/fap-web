import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPersonalityComparisonBySlug,
  type CmsPersonalityProfileSummary,
} from "@/lib/cms/personality";
import {
  buildPersonalityComparisonSlugsFromProfiles,
  isPersonalityComparisonSlug,
} from "@/lib/mbti/personalityComparison";
import { buildPublicSitemapEntries } from "@/lib/seo/publicSitemap";
import {
  isCurrentRiasecPack12AllowedFile,
  isPersonalityComparisonV1FromAssetsAllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function variantProfile(
  baseTypeCode: string,
  variantCode: "A" | "T",
  overrides: Partial<CmsPersonalityProfileSummary> = {}
): CmsPersonalityProfileSummary {
  const runtimeTypeCode = `${baseTypeCode}-${variantCode}`;
  const slug = runtimeTypeCode.toLowerCase();

  return {
    id: null,
    variantId: null,
    profileId: null,
    orgId: 0,
    scaleCode: "MBTI",
    typeCode: runtimeTypeCode,
    baseTypeCode,
    runtimeTypeCode,
    variantCode,
    displayType: runtimeTypeCode,
    publicRouteSlug: slug,
    publicRouteType: "32-type",
    slug,
    baseSlug: baseTypeCode.toLowerCase(),
    locale: "en",
    title: runtimeTypeCode,
    subtitle: "",
    excerpt: `${runtimeTypeCode} summary.`,
    heroImageUrl: null,
    status: "published",
    isPublic: true,
    isIndexable: true,
    publishedAt: null,
    updatedAt: null,
    seoMeta: null,
    ...overrides,
  };
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI and local worktree shapes differ; use whichever diff source is available.
    }
  }
  return [...files].sort();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PERSONALITY-COMPARISON-PAGES-01", () => {
  it("derives comparison routes only from complete backend A/T variant pairs", () => {
    expect(isPersonalityComparisonSlug("intj-a-vs-intj-t")).toBe(true);
    expect(isPersonalityComparisonSlug("intj-vs-intp")).toBe(true);
    expect(isPersonalityComparisonSlug("intj-a-vs-intp-t")).toBe(false);

    const slugs = buildPersonalityComparisonSlugsFromProfiles([
      variantProfile("INTJ", "A"),
      variantProfile("INTJ", "T"),
      variantProfile("ENTP", "A"),
      variantProfile("ENTJ", "A", { isIndexable: false }),
      variantProfile("ENTJ", "T"),
    ]);

    expect(slugs).toEqual(["intj-a-vs-intj-t"]);
  });

  it("consumes backend cross-type comparison detail without frontend editorial fallback", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      expect(url).toContain("/api/v0.5/personality/comparisons/intj-vs-intp?");
      expect(url).toContain("locale=zh-CN");

      return jsonResponse({
        ok: true,
        comparison_public_projection_v1: {
          comparison_contract_version: "mbti.cross_type_comparison.public.v1",
          authority_contract_version: "mbti.cross_type_comparison.authority.v1",
          readmodel_contract_version: "mbti.cross_type_comparison.readmodel.v1",
          comparison_slug: "intj-vs-intp",
          comparison_type: "mbti_cross_type",
          public_route_type: "cross-type-comparison",
          scale_code: "MBTI",
          locale: "zh-CN",
          left_type: "INTJ",
          right_type: "INTP",
          base_type_codes: ["INTJ", "INTP"],
          title: "INTJ 与 INTP 的区别：战略收敛与模型探索",
          description: "Backend cross-type SEO description.",
          summary: "INTJ 和 INTP 都重视逻辑、独立思考和复杂问题。",
          canonical_url: "https://fermatmind.com/zh/personality/intj-vs-intp",
          sections: [
            {
              id: "quick_answer",
              title: "快速结论：INTJ 和 INTP 最大区别是什么",
              body: ["INTJ 更偏战略收敛，INTP 更偏模型探索。"],
            },
            {
              id: "work_style",
              title: "工作方式差异",
              body: ["INTJ 更重视路径推进，INTP 更重视前提检验。"],
            },
          ],
          faq: [{ question: "INTJ 和 INTP 最大区别是什么？", answer: "一个偏收敛，一个偏探索。" }],
          internal_links: [{ label: "INTJ 人格", href: "/zh/personality/intj", reason: "继续查看 INTJ 画像" }],
          claim_boundary: "这是人格线索对比，不是诊断或职业结论。",
          source_notes: ["operator reviewed draft package"],
          source_refs: [
            "mbti-cross-type-comparison-content-assets-draft-20260702",
            "mbti.cross_type_comparison.authority.v1",
          ],
          is_public: true,
          is_indexable: false,
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const comparison = await getPersonalityComparisonBySlug("intj-vs-intp", "zh");

    expect(comparison?.comparisonSlug).toBe("intj-vs-intp");
    expect(comparison?.comparisonType).toBe("mbti_cross_type");
    expect(comparison?.publicRouteType).toBe("cross-type-comparison");
    expect(comparison?.leftType).toBe("INTJ");
    expect(comparison?.rightType).toBe("INTP");
    expect(comparison?.variants).toBeNull();
    expect(comparison?.isIndexable).toBe(false);
    expect(comparison?.crossTypeSections[0]).toMatchObject({
      id: "quick_answer",
      title: "快速结论：INTJ 和 INTP 最大区别是什么",
      body: ["INTJ 更偏战略收敛，INTP 更偏模型探索。"],
    });
    expect(comparison?.crossTypeFaq[0]?.question).toBe("INTJ 和 INTP 最大区别是什么？");
    expect(comparison?.crossTypeInternalLinks[0]?.href).toBe("/zh/personality/intj");
    expect(comparison?.claimBoundary).toBe("这是人格线索对比，不是诊断或职业结论。");
    expect(comparison?.sourceRefs).toContain("mbti.cross_type_comparison.authority.v1");
  });

  it("consumes the backend comparison API and preserves SEO, JSON-LD, and answer surfaces", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      expect(url).toContain("/api/v0.5/personality/comparisons/intj-a-vs-intj-t?");
      expect(url).toContain("locale=en");
      expect(url).toContain("org_id=0");
      expect(url).toContain("scale_code=MBTI");

      return jsonResponse({
        ok: true,
        comparison_public_projection_v1: {
          comparison_contract_version: "mbti.at_comparison.v1",
          comparison_slug: "intj-a-vs-intj-t",
          base_type_code: "INTJ",
          scale_code: "MBTI",
          locale: "en",
          public_route_type: "at-comparison",
          title: "INTJ-A vs INTJ-T: Traits, Careers, Love & Rarity",
          description: "Backend comparison description.",
          canonical_url: "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
          alternates: {
            en: "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
            "zh-CN": "https://fermatmind.com/zh/personality/intj-a-vs-intj-t",
          },
          variants: {
            a: {
              profile_id: 1,
              variant_id: 101,
              base_type_code: "INTJ",
              runtime_type_code: "INTJ-A",
              variant_code: "A",
              public_route_slug: "intj-a",
              display_type: "INTJ-A",
              type_name: "Architect Assertive",
              nickname: "Assertive strategist",
              hero_summary: "Assertive summary.",
              keywords: ["assertive"],
              summary_card: { summary: "Assertive card summary." },
              seo: { description: "INTJ-A SEO." },
            },
            t: {
              profile_id: 1,
              variant_id: 102,
              base_type_code: "INTJ",
              runtime_type_code: "INTJ-T",
              variant_code: "T",
              public_route_slug: "intj-t",
              display_type: "INTJ-T",
              type_name: "Architect Turbulent",
              nickname: "Self-auditing strategist",
              hero_summary: "Turbulent summary.",
              keywords: ["turbulent"],
              summary_card: { summary: "Turbulent card summary." },
              seo: { description: "INTJ-T SEO." },
            },
          },
          comparison_blocks: [
            {
              key: "at_difference",
              title: "INTJ-A vs INTJ-T: what is the difference?",
              source: "section_pair",
              variants: {
                a: "INTJ-A trusts the plan sooner.",
                t: "INTJ-T stress-tests the plan longer.",
              },
              body_md: "A: INTJ-A trusts the plan sooner.\n\nT: INTJ-T stress-tests the plan longer.",
            },
          ],
          source_refs: ["comparison_public_projection_v1", "personality_variant_sections"],
        },
        seo_meta: {
          seo_title: "INTJ-A vs INTJ-T: Traits, Careers, Love & Rarity",
          seo_description: "Backend comparison description.",
          canonical_url: "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          mainEntity: {
            "@type": "ItemList",
          },
        },
        seo_surface_v1: {
          surface_type: "mbti_personality_at_comparison",
          canonical_url: "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
          robots_policy: "index,follow",
          title: "INTJ-A vs INTJ-T: Traits, Careers, Love & Rarity",
          description: "Backend comparison description.",
          structured_data_keys: ["CollectionPage", "ItemList", "BreadcrumbList"],
        },
        landing_surface_v1: {
          landing_contract_version: "landing.surface.v1",
          entry_surface: "personality_comparison",
          entry_type: "mbti_at_pair",
          cta_bundle: [{ key: "assertive_detail", label: "INTJ-A", href: "/en/personality/intj-a" }],
        },
        answer_surface_v1: {
          answer_contract_version: "answer.surface.v1",
          surface_type: "personality_comparison_public_detail",
          summary_blocks: [{ key: "comparison_summary", title: "INTJ comparison", body: "Backend answer summary." }],
          compare_blocks: [{ key: "at_difference", title: "A/T difference", body: "Backend compare block." }],
          faq_blocks: [{ key: "faq-1", question: "Which one is better?", answer: "Neither variant is a ranking." }],
          next_step_blocks: [{ key: "assertive_detail", title: "INTJ-A", href: "/en/personality/intj-a" }],
          evidence_refs: ["comparison_public_projection_v1"],
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const comparison = await getPersonalityComparisonBySlug("intj-a-vs-intj-t", "en");

    expect(comparison?.comparisonSlug).toBe("intj-a-vs-intj-t");
    expect(comparison?.publicRouteType).toBe("at-comparison");
    expect(comparison?.variants).not.toBeNull();
    expect(comparison?.variants?.a.publicRouteSlug).toBe("intj-a");
    expect(comparison?.variants?.t.publicRouteSlug).toBe("intj-t");
    expect(comparison?.comparisonBlocks[0]?.variants.a).toBe("INTJ-A trusts the plan sooner.");
    expect(comparison?.jsonld).toMatchObject({ "@type": "CollectionPage", mainEntity: { "@type": "ItemList" } });
    expect(comparison?.seoSurface?.surfaceType).toBe("mbti_personality_at_comparison");
    expect(comparison?.seoSurface?.structuredDataKeys).toEqual(
      expect.arrayContaining(["CollectionPage", "ItemList", "BreadcrumbList"])
    );
    expect(comparison?.landingSurface?.entrySurface).toBe("personality_comparison");
    expect(comparison?.answerSurface?.surfaceType).toBe("personality_comparison_public_detail");
    expect(comparison?.answerSurface?.summaryBlocks[0]?.body).toBe("Backend answer summary.");
    expect(comparison?.answerSurface?.faqBlocks[0]?.answer).toBe("Neither variant is a ranking.");
    expect(comparison?.answerSurface?.evidenceRefs).toContain("comparison_public_projection_v1");
  });

  it("wires the comparison page, sitemap, and llms to backend authority instead of frontend content", () => {
    const pageSource = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const adapterSource = read("lib/cms/personality.ts");
    const sitemapSource = read("next-sitemap.config.js");
    const llmsSource = read("app/llms.txt/route.ts");
    const llmsFullSource = read("app/llms-full.txt/route.ts");
    const dynamicSitemapEntries = buildPublicSitemapEntries({
      items: [
        { loc: "https://fermatmind.com/en/personality/intj-a-vs-intj-t" },
        { loc: "https://fermatmind.com/zh/personality/intj-a-vs-intj-t" },
      ],
    });

    expect(pageSource).toContain("isPersonalityComparisonSlug(type)");
    expect(pageSource).toContain("getPersonalityComparisonBySlug(type, locale)");
    expect(pageSource).toContain("const effectiveMetadataTitle = comparison.seoSurface?.title || title");
    expect(pageSource).toContain("applyPersonalityMetadataTitleTemplateGuard");
    expect(pageSource).toContain('data-testid="personality-comparison-page"');
    expect(pageSource).toContain('data-testid="personality-comparison-asset-nav"');
    expect(pageSource).toContain('data-testid="personality-comparison-method-boundary"');
    expect(pageSource).toContain("comparison.jsonld");
    expect(pageSource).toContain("personality-comparison-breadcrumb");
    expect(pageSource).toContain("comparison.comparisonBlocks.map");
    expect(pageSource).toContain("comparison.answerSurface?.nextStepBlocks");
    expect(pageSource).toContain("hideSummaryBlocks");
    expect(pageSource).toContain("comparisonBoundaryCopy(locale)");
    expect(pageSource).toContain("frontend editorial fallback");
    expect(pageSource).toContain("isCrossTypeComparison(comparison)");
    expect(pageSource).toContain('data-testid="personality-cross-type-sections"');
    expect(pageSource).toContain('data-testid="personality-cross-type-bases"');
    expect(pageSource).toContain("CrossTypeInternalLinks");

    expect(adapterSource).toContain("/v0.5/personality/comparisons/");
    expect(adapterSource).toContain("comparison_public_projection_v1");
    expect(adapterSource).toContain('"mbti_cross_type"');
    expect(adapterSource).toContain("crossTypeSections");
    expect(adapterSource).toContain("normalizeAnswerSurface(response.answer_surface_v1");

    expect(sitemapSource).toContain("buildPersonalityComparisonPathsFromAuthority");
    expect(sitemapSource).toContain("include_variants: 1");
    expect(sitemapSource).toContain("shouldKeepPersonalityComparisonPath");
    expect(dynamicSitemapEntries.map((entry) => entry.loc)).toEqual(
      expect.arrayContaining([
        "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
        "https://fermatmind.com/zh/personality/intj-a-vs-intj-t",
      ])
    );

    expect(llmsSource).toContain("buildPersonalityComparisonSlugsFromProfiles");
    expect(llmsFullSource).toContain("buildPersonalityComparisonSlugsFromProfiles");
    expect(llmsFullSource).toContain("getPersonalityComparisonBySlug(slug, entry.locale)");
  });

  it("keeps the current PR scoped to comparison frontend consumer files", () => {
    const allowed = changedFiles().filter(
      (file) => !isCurrentRiasecPack12AllowedFile(file) && !isPersonalityComparisonV1FromAssetsAllowedFile(file)
    );

    expect(allowed).toEqual([]);
  });
});
