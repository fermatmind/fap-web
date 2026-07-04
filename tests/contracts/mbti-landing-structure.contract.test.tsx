import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MbtiLandingSurfaceSections } from "@/components/tests/MbtiLandingSurfaceSections";
import { normalizeLandingSurface } from "@/lib/landing/landingSurface";

const PAGE_PATH = path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/page.tsx");
const COMPONENT_PATH = path.join(process.cwd(), "components/tests/MbtiLandingSurfaceSections.tsx");

describe("ANALYTICS-SEO-P1-06 MBTI landing structure contract", () => {
  it("renders MBTI landing modules only from backend landing_surface_v1 blocks and links", () => {
    const surface = normalizeLandingSurface({
      version: "landing.surface.v1",
      entry_surface: "test_detail",
      entry_type: "mbti",
      summary_blocks: [
        {
          key: "mbti_16_type_overview",
          kind: "16_type_overview",
          title: "Backend 16 type overview",
          body: "Backend-owned type overview body.",
        },
        {
          key: "mbti_career_direction",
          kind: "career_direction",
          title: "Backend career directions",
          body: "Backend-owned career direction body.",
        },
        {
          key: "mbti_big_five_holland_comparison",
          kind: "comparison",
          title: "Backend comparison module",
          body: "Backend-owned comparison body.",
        },
      ],
      discoverability_items: [
        {
          key: "mbti_personality_hub",
          kind: "personality_hub",
          title: "Backend personality hub",
          summary: "Backend-owned hub link summary.",
          href: "/zh/personality",
          badge_label: "Hub",
        },
        {
          key: "infj_type_profile",
          kind: "personality_type",
          title: "INFJ backend profile",
          summary: "Backend-owned type link summary.",
          href: "/zh/personality/infj-a",
          badge_label: "MBTI",
        },
        {
          key: "entj_vs_intj",
          kind: "personality_comparison",
          title: "ENTJ vs INTJ backend comparison",
          summary: "Backend-owned comparison link summary.",
          href: "/zh/personality/entj-vs-intj",
          badge_label: "Compare",
        },
      ],
    });

    const html = renderToStaticMarkup(<MbtiLandingSurfaceSections surface={surface} />);

    expect(html).toContain('data-authority-source="landing_surface_v1"');
    expect(html).toContain('data-testid="mbti-landing-types-overview"');
    expect(html).toContain("Backend 16 type overview");
    expect(html).toContain('data-testid="mbti-landing-career-direction"');
    expect(html).toContain("Backend career directions");
    expect(html).toContain('data-testid="mbti-landing-comparisons"');
    expect(html).toContain("Backend comparison module");
    expect(html).toContain('data-testid="mbti-landing-personality-hub-links"');
    expect(html).toContain("/zh/personality");
    expect(html).toContain("Backend personality hub");
    expect(html).toContain('data-testid="mbti-landing-type-internal-links"');
    expect(html).toContain("/zh/personality/infj-a");
    expect(html).toContain("INFJ backend profile");
    expect(html).toContain('data-testid="mbti-landing-comparison-internal-links"');
    expect(html).toContain("/zh/personality/entj-vs-intj");
    expect(html).toContain("ENTJ vs INTJ backend comparison");
  });

  it("does not invent frontend editorial fallback modules when the backend surface is absent", () => {
    const html = renderToStaticMarkup(<MbtiLandingSurfaceSections surface={null} />);
    const componentSource = fs.readFileSync(COMPONENT_PATH, "utf8");

    expect(html).toBe("");
    expect(componentSource).toContain("return null");
    expect(componentSource).not.toContain("16 型人格");
    expect(componentSource).not.toContain("职业方向");
    expect(componentSource).not.toContain("MBTI 与");
  });

  it("wires the MBTI test detail page to render backend-authoritative landing surface sections", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('import { MbtiLandingSurfaceSections } from "@/components/tests/MbtiLandingSurfaceSections";');
    expect(source).toContain("{showsMbtiActions ? <MbtiLandingSurfaceSections surface={landingSurface} /> : null}");
    expect(source).toContain("const faqItems = parseFaq(langNode.faq)");
    expect(source).toContain("const mergedFaq = faqItems.length > 0");
    expect(source).toContain('{faqJsonLd ? <JsonLd id={`test-faq-${test.slug}`} data={faqJsonLd} /> : null}');
  });
});
