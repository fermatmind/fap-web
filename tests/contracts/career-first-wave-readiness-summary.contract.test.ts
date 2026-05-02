import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerFirstWaveReadinessSummary } from "@/lib/career/adapters/adaptCareerFirstWaveReadinessSummary";
import type { CareerJobIndexCardAdapter } from "@/lib/career/adapters/types";
import { fetchCareerFirstWaveReadinessSummary } from "@/lib/career/api/fetchCareerFirstWaveReadinessSummary";
import { isJobFacingCardExposableByFirstWaveSummary } from "@/lib/career/firstWaveReadinessExposurePolicy";

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

describe("career first-wave readiness summary contract", () => {
  it("requests the backend B14 readiness summary endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/readiness?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_first_wave_readiness",
          summary_version: "career.release.first_wave_readiness.v1",
          wave_name: "career_first_wave_10",
          counts: { total: 10, publish_ready: 6 },
          occupations: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveReadinessSummary({ locale: "zh" });

    expect(payload).not.toBeNull();
  });

  it("adapts backend readiness statuses into a slug-keyed machine-readable summary", () => {
    const summary = adaptCareerFirstWaveReadinessSummary({
      payload: {
        summary_kind: "career_first_wave_readiness",
        summary_version: "career.release.first_wave_readiness.v1",
        wave_name: "career_first_wave_10",
        counts: {
          total: 10,
          publish_ready: 6,
          blocked_override_eligible: 2,
          blocked_not_safely_remediable: 2,
          blocked_total: 4,
          partial_raw: 0,
        },
        occupations: [
          {
            occupation_uuid: "occ_ready",
            canonical_slug: "data-scientists",
            canonical_title_en: "Data Scientists",
            status: "publish_ready",
            authority_override_supplied: false,
            review_required: false,
            reviewer_status: "approved",
            index_state: "indexable",
            index_eligible: true,
            reason_codes: ["publish_ready"],
          },
          {
            occupation_uuid: "occ_blocked",
            canonical_slug: "financial-analysts",
            canonical_title_en: "Financial Analysts",
            status: "blocked_override_eligible",
            blocker_type: "missing_crosswalk_source_code",
            remediation_class: "authority_override_possible",
            authority_override_supplied: false,
            review_required: true,
            index_state: "blocked",
            index_eligible: false,
            reason_codes: ["missing_crosswalk_source_code", "authority_override_not_supplied"],
          },
        ],
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.counts.publishReady).toBe(6);
    expect(summary?.occupationsBySlug["data-scientists"]?.status).toBe("publish_ready");
    expect(summary?.occupationsBySlug["financial-analysts"]?.status).toBe("blocked_override_eligible");
    expect(summary?.occupationsBySlug["financial-analysts"]?.reasonCodes).toEqual([
      "missing_crosswalk_source_code",
      "authority_override_not_supplied",
    ]);
  });

  it("uses the backend summary map instead of a hardcoded frontend slug registry", () => {
    const source = read("lib/career/firstWaveReadinessExposurePolicy.ts");

    expect(source).toContain("occupationsBySlug");
    expect(source).not.toContain("software-developers");
    expect(source).not.toContain("financial-analysts");
    expect(source).not.toContain("marketing-managers");
  });

  it("fails closed when readiness is unavailable or the card slug is missing from the summary map", () => {
    const stableCard: CareerJobIndexCardAdapter = {
      dataStatus: "available",
      identity: {
        occupationUuid: "occ_data_scientists",
        canonicalSlug: "data-scientists",
        entityLevel: null,
        familyUuid: null,
      },
      titles: {
        title: "Data Scientists",
        canonicalEn: "Data Scientists",
        canonicalZh: null,
        searchH1Zh: null,
      },
      truthSummary: {
        truthMarket: "US",
        medianPayUsdAnnual: 182000,
        outlookPct20242034: 14,
        outlookDescription: "High-trust systems work.",
        aiExposure: null,
      },
      trustSummary: {
        reviewerStatus: "approved",
        reviewedAt: null,
        contentVersion: null,
        dataVersion: null,
        logicVersion: null,
        editorialPatchRequired: false,
        editorialPatchStatus: null,
        allowStrongClaim: true,
        allowSalaryComparison: true,
        allowAiStrategy: true,
        reasonCodes: [],
      },
      scoreSummary: {
        fitScore: {
          value: 84,
          integrity_state: "full",
          degradation_factor: 1,
          critical_missing_fields: [],
          confidence_cap: null,
          formula_ref: null,
          component_breakdown: {},
          penalties: [],
        },
        confidenceScore: {
          value: 79,
          integrity_state: "full",
          degradation_factor: 1,
          critical_missing_fields: [],
          confidence_cap: null,
          formula_ref: null,
          component_breakdown: {},
          penalties: [],
        },
      },
      seoContract: {
        canonicalPath: "/career/jobs/data-scientists",
        canonicalTarget: null,
        indexState: "index",
        indexEligible: true,
        reasonCodes: [],
        datasetEligible: null,
        articleEligible: null,
      },
      provenanceMeta: {
        contentVersion: "content_v1",
        dataVersion: "data_v1",
        logicVersion: "logic_v1",
        compilerVersion: "compiler_v1",
        compiledAt: null,
        truthMetricId: null,
        trustManifestId: null,
        indexStateId: null,
        compileRunId: null,
        importRunId: null,
        compileRefs: {},
      },
      href: "/en/career/jobs/data-scientists",
      authoritySource: "career_backend_lightweight_index.v0.5",
    };

    expect(isJobFacingCardExposableByFirstWaveSummary(null, stableCard)).toBe(false);

    const summary = adaptCareerFirstWaveReadinessSummary({
      payload: {
        summary_kind: "career_first_wave_readiness",
        summary_version: "career.release.first_wave_readiness.v1",
        wave_name: "career_first_wave_10",
        counts: {
          total: 10,
          publish_ready: 6,
          blocked_override_eligible: 2,
          blocked_not_safely_remediable: 2,
          blocked_total: 4,
          partial_raw: 0,
        },
        occupations: [
          {
            canonical_slug: "financial-analysts",
            status: "blocked_override_eligible",
            reason_codes: ["missing_crosswalk_source_code"],
          },
        ],
      },
    });

    expect(isJobFacingCardExposableByFirstWaveSummary(summary, stableCard)).toBe(false);
  });

  it("normalizes readiness summary slugs before applying the fail-closed exposure gate", () => {
    const stableCard: CareerJobIndexCardAdapter = {
      dataStatus: "available",
      identity: {
        occupationUuid: "occ_data_scientists",
        canonicalSlug: "data-scientists",
        entityLevel: null,
        familyUuid: null,
      },
      titles: {
        title: "Data Scientists",
        canonicalEn: "Data Scientists",
        canonicalZh: null,
        searchH1Zh: null,
      },
      truthSummary: {
        truthMarket: "US",
        medianPayUsdAnnual: 182000,
        outlookPct20242034: 14,
        outlookDescription: "High-trust systems work.",
        aiExposure: null,
      },
      trustSummary: {
        reviewerStatus: "approved",
        reviewedAt: null,
        contentVersion: null,
        dataVersion: null,
        logicVersion: null,
        editorialPatchRequired: false,
        editorialPatchStatus: null,
        allowStrongClaim: true,
        allowSalaryComparison: true,
        allowAiStrategy: true,
        reasonCodes: [],
      },
      scoreSummary: {
        fitScore: {
          value: 84,
          integrity_state: "full",
          degradation_factor: 1,
          critical_missing_fields: [],
          confidence_cap: null,
          formula_ref: null,
          component_breakdown: {},
          penalties: [],
        },
        confidenceScore: {
          value: 79,
          integrity_state: "full",
          degradation_factor: 1,
          critical_missing_fields: [],
          confidence_cap: null,
          formula_ref: null,
          component_breakdown: {},
          penalties: [],
        },
      },
      seoContract: {
        canonicalPath: "/career/jobs/data-scientists",
        canonicalTarget: null,
        indexState: "index",
        indexEligible: true,
        reasonCodes: [],
        datasetEligible: null,
        articleEligible: null,
      },
      provenanceMeta: {
        contentVersion: "content_v1",
        dataVersion: "data_v1",
        logicVersion: "logic_v1",
        compilerVersion: "compiler_v1",
        compiledAt: null,
        truthMetricId: null,
        trustManifestId: null,
        indexStateId: null,
        compileRunId: null,
        importRunId: null,
        compileRefs: {},
      },
      href: "/en/career/jobs/data-scientists",
      authoritySource: "career_backend_lightweight_index.v0.5",
    };

    const summary = adaptCareerFirstWaveReadinessSummary({
      payload: {
        summary_kind: "career_first_wave_readiness",
        summary_version: "career.release.first_wave_readiness.v1",
        wave_name: "career_first_wave_10",
        counts: {
          total: 10,
          publish_ready: 6,
          blocked_override_eligible: 2,
          blocked_not_safely_remediable: 2,
          blocked_total: 4,
          partial_raw: 0,
        },
        occupations: [
          {
            canonical_slug: "DATA-SCIENTISTS",
            status: "publish_ready",
            reason_codes: ["publish_ready"],
          },
        ],
      },
    });

    expect(summary?.occupationsBySlug["data-scientists"]?.status).toBe("publish_ready");
    expect(isJobFacingCardExposableByFirstWaveSummary(summary, stableCard)).toBe(true);
  });
});
