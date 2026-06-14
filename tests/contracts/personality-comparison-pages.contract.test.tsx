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
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

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
          compare_blocks: [{ key: "at_difference", title: "A/T difference", body: "Backend compare block." }],
          next_step_blocks: [{ key: "assertive_detail", title: "INTJ-A", href: "/en/personality/intj-a" }],
        },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const comparison = await getPersonalityComparisonBySlug("intj-a-vs-intj-t", "en");

    expect(comparison?.comparisonSlug).toBe("intj-a-vs-intj-t");
    expect(comparison?.publicRouteType).toBe("at-comparison");
    expect(comparison?.variants.a.publicRouteSlug).toBe("intj-a");
    expect(comparison?.variants.t.publicRouteSlug).toBe("intj-t");
    expect(comparison?.comparisonBlocks[0]?.variants.a).toBe("INTJ-A trusts the plan sooner.");
    expect(comparison?.jsonld).toMatchObject({ "@type": "CollectionPage", mainEntity: { "@type": "ItemList" } });
    expect(comparison?.seoSurface?.surfaceType).toBe("mbti_personality_at_comparison");
    expect(comparison?.seoSurface?.structuredDataKeys).toEqual(
      expect.arrayContaining(["CollectionPage", "ItemList", "BreadcrumbList"])
    );
    expect(comparison?.landingSurface?.entrySurface).toBe("personality_comparison");
    expect(comparison?.answerSurface?.surfaceType).toBe("personality_comparison_public_detail");
  });

  it("wires the comparison page, sitemap, and llms to backend authority instead of frontend content", () => {
    const pageSource = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const adapterSource = read("lib/cms/personality.ts");
    const sitemapSource = read("next-sitemap.config.js");
    const generatedSitemap = read("public/sitemap.xml");
    const llmsSource = read("app/llms.txt/route.ts");
    const llmsFullSource = read("app/llms-full.txt/route.ts");

    expect(pageSource).toContain("isPersonalityComparisonSlug(type)");
    expect(pageSource).toContain("getPersonalityComparisonBySlug(type, locale)");
    expect(pageSource).toContain('data-testid="personality-comparison-page"');
    expect(pageSource).toContain("comparison.jsonld");
    expect(pageSource).toContain("personality-comparison-breadcrumb");
    expect(pageSource).toContain("comparison.comparisonBlocks.map");

    expect(adapterSource).toContain("/v0.5/personality/comparisons/");
    expect(adapterSource).toContain("comparison_public_projection_v1");
    expect(adapterSource).toContain("normalizeAnswerSurface(response.answer_surface_v1");

    expect(sitemapSource).toContain("buildPersonalityComparisonPathsFromAuthority");
    expect(sitemapSource).toContain("include_variants: 1");
    expect(sitemapSource).toContain("shouldKeepPersonalityComparisonPath");
    expect(generatedSitemap).toContain("https://fermatmind.com/en/personality/intj-a-vs-intj-t");
    expect(generatedSitemap).toContain("https://fermatmind.com/zh/personality/intj-a-vs-intj-t");

    expect(llmsSource).toContain("buildPersonalityComparisonSlugsFromProfiles");
    expect(llmsFullSource).toContain("buildPersonalityComparisonSlugsFromProfiles");
    expect(llmsFullSource).toContain("getPersonalityComparisonBySlug(slug, entry.locale)");
  });

  it("keeps the current PR scoped to comparison frontend consumer files", () => {
    const allowed = changedFiles().filter((file) => !isCurrentRiasecPack12AllowedFile(file));

    expect(allowed).toEqual([]);
  });
});
