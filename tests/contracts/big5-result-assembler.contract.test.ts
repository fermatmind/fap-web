import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { BIG5_V1_SECTION_MICROCOPY } from "@/lib/big5/microcopy";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import { BIG5_V1_SECTION_BLUEPRINTS, BIG5_V1_SECTION_KEYS } from "@/lib/big5/sectionBlueprint";
import reportReadyProjectionFixture from "@/tests/fixtures/big5/report_ready.projection.json";
import normsRichFixture from "@/tests/fixtures/big5/report_norms_rich.projection.json";

function buildGate(overrides?: Partial<{
  isFreeVariant: boolean;
  modulesAllowed: Set<string>;
  modulesPreview: Set<string>;
  freeSections: Set<string> | null;
}>) {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
    ...overrides,
  };
}

function createReportFixture(): ReportResponse {
  return structuredClone(reportReadyProjectionFixture) as ReportResponse;
}

describe("big5 result assembler contract", () => {
  it("plans all blueprint sections in canonical order when source fields are complete", () => {
    const reportData = createReportFixture();
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    expect(assembled.plannedSections.map((section) => section.key)).toEqual([...BIG5_V1_SECTION_KEYS]);
    expect(assembled.plannedSections.map((section) => section.page_slot)).toEqual(
      BIG5_V1_SECTION_BLUEPRINTS.map((blueprint) => blueprint.page_slot)
    );
    expect(assembled.visibleSections.map((section) => section.key)).toEqual([...BIG5_V1_SECTION_KEYS]);
    expect(assembled.lockedSections).toHaveLength(0);
  });

  it("splits visible and locked sections by access level in free gate mode", () => {
    const reportData = createReportFixture();
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate({
        isFreeVariant: true,
        modulesAllowed: new Set(["big5_core"]),
        freeSections: new Set(["hero_summary", "domains_overview", "methodology_and_access"]),
      }),
    });

    expect(assembled.visibleSections.map((section) => section.key)).toEqual([
      "hero_summary",
      "domains_overview",
      "methodology_and_access",
    ]);
    expect(assembled.lockedSections.length).toBeGreaterThan(0);
    assembled.lockedSections.forEach((section) => {
      expect(section.access_level).toBe("paid");
      expect(typeof section.locked_preview_policy).toBe("string");
      expect(String(section.locked_preview_description ?? "").trim().length).toBeGreaterThan(0);
    });
  });

  it("uses locked preview policy metadata from blueprint at runtime", () => {
    const reportData = createReportFixture();
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    const deepDive = assembled.plannedSections.find((section) => section.key === "domain_deep_dive");
    const corePortrait = assembled.plannedSections.find((section) => section.key === "core_portrait");
    const methodology = assembled.plannedSections.find((section) => section.key === "methodology_and_access");

    expect(deepDive?.locked_preview_policy).toBe("teaser_card");
    expect(corePortrait?.locked_preview_policy).toBe("mask_and_cta");
    expect(methodology?.locked_preview_policy).toBe("none");
  });

  it("falls back to microcopy title when payload title is missing", () => {
    const reportData = createReportFixture();
    if (!Array.isArray(reportData.report?.sections)) {
      throw new Error("Expected report.sections array in fixture");
    }
    const heroSection = reportData.report.sections.find((section) => section.key === "hero_summary");
    if (!heroSection) {
      throw new Error("Expected hero_summary in fixture");
    }
    heroSection.title = "";

    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    const resolvedHero = assembled.plannedSections.find((section) => section.key === "hero_summary");
    expect(resolvedHero?.title).toBe(BIG5_V1_SECTION_MICROCOPY.hero_summary.title);
  });

  it("filters unsupported block kinds via blueprint allowlist", () => {
    const reportData = createReportFixture();
    if (!Array.isArray(reportData.report?.sections)) {
      throw new Error("Expected report.sections array in fixture");
    }
    reportData.report.sections.push({
      key: "action_plan",
      title: "Action Plan",
      access_level: "paid",
      blocks: [
        { kind: "paragraph", body: "allowed body" },
        { kind: "unknown_widget", body: "should be removed" },
      ],
    });

    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    const actionSection = assembled.plannedSections.find((section) => section.key === "action_plan");
    expect(actionSection).toBeDefined();
    expect(actionSection?.blocks.some((block) => block.kind === "unknown_widget")).toBe(false);
    expect(actionSection?.blocks.some((block) => block.kind === "paragraph" || block.kind === "bullets")).toBe(true);
  });

  it("omits sections when source fields do not meet the minimum dependency", () => {
    const reportData = createReportFixture();
    reportData.quality = undefined;
    reportData.norms = undefined;
    reportData.modules_allowed = [];
    reportData.modules_preview = [];

    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    expect(assembled.plannedSections.some((section) => section.key === "methodology_and_access")).toBe(false);
  });

  it("prevents traits.overview legacy alias from feeding both core_portrait and domain_deep_dive", () => {
    const reportData = createReportFixture();
    if (!Array.isArray(reportData.report?.sections)) {
      throw new Error("Expected report.sections array in fixture");
    }
    reportData.report.sections.push({
      key: "traits.overview",
      title: "Traits Overview",
      access_level: "paid",
      blocks: [{ kind: "paragraph", body: "legacy overlap copy" }],
    });

    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    const corePortrait = assembled.plannedSections.find((section) => section.key === "core_portrait");
    const domainDeepDive = assembled.plannedSections.find((section) => section.key === "domain_deep_dive");
    const coreHasLegacy = corePortrait?.blocks.some((block) => String(block.body ?? "").includes("legacy overlap copy")) ?? false;
    const deepDiveHasLegacy = domainDeepDive?.blocks.some((block) => String(block.body ?? "").includes("legacy overlap copy")) ?? false;

    expect(coreHasLegacy).toBe(true);
    expect(deepDiveHasLegacy).toBe(false);
  });

  it("keeps methodology_and_access in product language instead of status-string concatenation", () => {
    const reportData = createReportFixture();
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });
    const methodology = assembled.plannedSections.find((section) => section.key === "methodology_and_access");
    expect(methodology).toBeDefined();
    const text = methodology?.blocks.map((block) => `${block.title ?? ""} ${block.body ?? ""}`).join(" ");
    expect(text).not.toContain("Quality A · Norms CALIBRATED");
  });

  it("renders norms_comparison as a multi-block explanation instead of a single thin callout", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: structuredClone(normsRichFixture) as ReportResponse,
      gate: buildGate(),
    });

    const norms = assembled.plannedSections.find((section) => section.key === "norms_comparison");
    expect(norms).toBeDefined();
    expect(norms?.blocks.filter((block) => block.kind === "paragraph").length).toBeGreaterThanOrEqual(2);
    expect(norms?.blocks.some((block) => block.kind === "metric_card")).toBe(true);
    expect(norms?.blocks.some((block) => block.kind === "callout")).toBe(true);
  });

  it("keeps the output shape aligned to existing Big5 shell inputs", () => {
    const reportData = createReportFixture();
    const assembled = assembleBig5ResultViewModel({
      locale: "zh",
      reportData,
      gate: buildGate(),
    });

    expect(Array.isArray(assembled.dimensions)).toBe(true);
    expect(Array.isArray(assembled.visibleSections)).toBe(true);
    expect(Array.isArray(assembled.lockedSections)).toBe(true);
    expect(typeof assembled.normsStatus).toBe("string");
    expect(typeof assembled.qualityLevel).toBe("string");
    if (assembled.formSummaryLabel) {
      expect(assembled.formSummaryLabel).toContain("Big Five");
    } else {
      expect(assembled.formSummaryLabel).toBeNull();
    }
  });
});
