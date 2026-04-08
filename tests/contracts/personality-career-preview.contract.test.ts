import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildMiniStrainRadarData, createCareerPreviewCardFromDetail } from "@/lib/mbti/personalityCareerPreview";

describe("personality career preview contract", () => {
  it("builds complete mini radar data from structural career signals", () => {
    const radar = buildMiniStrainRadarData(
      {
        derived_signals: {
          autonomy_level: 4,
          people_intensity: 2,
          variability_level: 3,
          closure_demand: 5,
          cadence_rigidity: 4,
        },
      } as never,
      "en"
    );

    expect(radar).not.toBeNull();
    expect(radar?.axes).toHaveLength(5);
    expect(radar?.axes.every((axis) => axis.value > 0)).toBe(true);
  });

  it("creates preview cards with recommendation primary cta and job secondary cta", () => {
    const detail = {
      displayType: "INTJ-A",
      graphTypeCode: "INTJ",
      publicRouteSlug: "intj-a",
      heroSummary: "Strategic systems role.",
      href: "/en/career/recommendations/mbti/intj-a",
      keywords: ["systems", "strategy"],
      matchedJobs: [
        {
          slug: "product-strategist",
          title: "Product Strategist",
          summary: "Shapes product direction through structure and long-range decisions.",
          fitBucket: "primary",
          fitPersonalityCodes: ["INTJ", "ENTJ"],
          href: "/en/career/jobs/product-strategist",
        },
      ],
      career: {
        summary: { paragraphs: ["Works best when the role rewards systems judgment."] },
        weaknesses: { items: [{ description: "High ambiguity without decision rights creates friction." }] },
        upgradeSuggestions: { paragraphs: ["Use the recommendation detail page to validate pacing and scope."] },
      },
      renderState: {
        canRenderStrongTruth: true,
      },
      protocol: {
        careerAsset: {
          derived_signals: {
            autonomy_level: 4,
            people_intensity: 2,
            variability_level: 3,
            closure_demand: 5,
            cadence_rigidity: 4,
            likely_strain_types: [],
            human_moat_tags: ["Strategic judgment"],
            work_structure_tags: ["Cross-functional systems"],
          },
          scoring: {
            fit_score: { value: 78 },
            strain_score: { value: 34 },
          },
        },
      },
    } as never;

    const jobListMap = new Map([
      [
        "product-strategist",
        {
          slug: "product-strategist",
          title: "Product Strategist",
          summary: "Summary",
          salaryText: "$$",
          href: "/en/career/jobs/product-strategist",
        },
      ],
    ]);

    const card = createCareerPreviewCardFromDetail(detail, jobListMap, "en");

    expect(card).not.toBeNull();
    expect(card?.primaryCta.href).toBe("/en/career/recommendations/mbti/intj-a");
    expect(card?.secondaryCta.href).toBe("/en/career/jobs/product-strategist");
    expect(card?.signals.length).toBeGreaterThanOrEqual(2);
    expect(card?.radar.axes).toHaveLength(5);
  });

  it("wires personality page with career preview after the workbench without replacing inventory", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).toContain('from "@/components/personality/CareerIntelligencePreview"');
    expect(pageSource).toContain('from "@/lib/mbti/personalityCareerPreview"');
    expect(pageSource).toContain("buildPersonalityCareerPreview({");
    expect(pageSource).toContain("seed: hubPayload.careerPreviewSeed");
    expect(pageSource).toContain("<CareerIntelligencePreview");
    expect(pageSource).toContain("<TypeNavigatorWorkbench");
  });
});
