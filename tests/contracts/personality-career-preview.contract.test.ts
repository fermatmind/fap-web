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
    expect(radar?.axes.some((axis) => axis.value > 0)).toBe(true);
  });

  it("keeps radar renderable when some structural axes are zero", () => {
    const radar = buildMiniStrainRadarData(
      {
        derived_signals: {
          autonomy_level: 0,
          people_intensity: 2,
          variability_level: 0,
          closure_demand: 5,
          cadence_rigidity: 0,
        },
      } as never,
      "en"
    );

    expect(radar).not.toBeNull();
    expect(radar?.axes).toHaveLength(5);
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

  it("keeps career preview helpers available while the current page stays on compact inventory", () => {
    const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).toContain("<TypeGroupBrowse");
    expect(pageSource).toContain("hubPayload.familyGroups");
    expect(pageSource).not.toContain('from "@/components/personality/CareerIntelligencePreview"');
    expect(pageSource).not.toContain("buildPersonalityCareerPreview({");
  });

  it("keeps a longer preview seed and fills cards until three valid previews are produced", () => {
    const adapterPath = path.join(process.cwd(), "lib/mbti/personalityHub.adapter.ts");
    const previewPath = path.join(process.cwd(), "lib/mbti/personalityCareerPreview.ts");
    const adapterSource = fs.readFileSync(adapterPath, "utf8");
    const previewSource = fs.readFileSync(previewPath, "utf8");

    expect(adapterSource).toContain("for (const card of stableGrouped)");
    expect(adapterSource).toContain("for (const card of nonStableGrouped)");
    expect(previewSource).toContain("if (cards.length >= 3)");
    expect(previewSource).toContain("for (const detail of details)");
  });
});
