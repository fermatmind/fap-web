import { describe, expect, it } from "vitest";
import type { CareerDatasetMemberAdapter, CareerJobIndexCardAdapter } from "@/lib/career/adapters/types";
import { buildRenderableCareerDatasetMembers } from "@/lib/career/datasetDirectory";

function jobOverride(slug: string, titleEn: string, titleZh: string): CareerJobIndexCardAdapter {
  return {
    authoritySource: "career_backend_lightweight_index.v0.5",
    dataStatus: "available",
    identity: {
      occupationUuid: `occ_${slug}`,
      canonicalSlug: slug,
      entityLevel: "career_job_detail",
      familyUuid: null,
    },
    titles: {
      title: titleZh,
      canonicalEn: titleEn,
      canonicalZh: titleZh,
      searchH1Zh: titleZh,
    },
    truthSummary: {
      truthMarket: "US",
      medianPayUsdAnnual: null,
      outlookPct20242034: null,
      outlookDescription: null,
      aiExposure: null,
    },
    trustSummary: {
      reviewerStatus: "docx_baseline_imported",
      reviewedAt: null,
      contentVersion: "docx_342_career_batch",
      dataVersion: "docx_342_career_batch",
      logicVersion: "career.protocol.job_detail.docx_baseline.v1",
      editorialPatchRequired: false,
      editorialPatchStatus: null,
      allowStrongClaim: true,
      allowSalaryComparison: true,
      allowAiStrategy: true,
      reasonCodes: [],
    },
    scoreSummary: {
      fitScore: {
        value: null,
        integrity_state: "missing_fit_score",
        critical_missing_fields: [],
        confidence_cap: null,
        formula_ref: null,
        component_breakdown: {},
        penalties: [],
        degradation_factor: null,
      },
      confidenceScore: {
        value: null,
        integrity_state: "missing_confidence_score",
        critical_missing_fields: [],
        confidence_cap: null,
        formula_ref: null,
        component_breakdown: {},
        penalties: [],
        degradation_factor: null,
      },
    },
    seoContract: {
      canonicalPath: `/career/jobs/${slug}`,
      canonicalTarget: null,
      indexState: "indexable",
      indexEligible: true,
      reasonCodes: [],
      datasetEligible: null,
      articleEligible: null,
    },
    provenanceMeta: {
      contentVersion: "docx_342_career_batch",
      dataVersion: "docx_342_career_batch",
      logicVersion: "career.protocol.job_detail.docx_baseline.v1",
      compilerVersion: null,
      compiledAt: null,
      truthMetricId: null,
      trustManifestId: null,
      indexStateId: null,
      compileRunId: null,
      importRunId: null,
      compileRefs: {},
    },
    href: `/zh/career/jobs/${slug}`,
  };
}

function datasetMember(overrides: Partial<CareerDatasetMemberAdapter>): CareerDatasetMemberAdapter {
  return {
    memberKind: "career_tracked_occupation",
    canonicalSlug: "database-administrators",
    canonicalTitleEn: "Database Administrators",
    canonicalTitleZh: "其他职业",
    familySlug: "__unknown__",
    publishTrack: "directory_draft",
    batchOrigin: "china_us_occupation_directories_2026",
    releaseCohort: "directory_draft_pending_detail",
    publicIndexState: "noindex",
    strongIndexDecision: "directory_draft_detail_pending",
    includedInPublicDataset: true,
    exclusionReasons: [],
    ...overrides,
  };
}

describe("career dataset directory merge", () => {
  it("uses the detail-ready jobs index title instead of a stale dataset member title", () => {
    const members = buildRenderableCareerDatasetMembers({
      datasetMembers: [datasetMember({})],
      detailReadyJobs: new Map([
        [
          "database-administrators",
          jobOverride("database-administrators", "Database administrators and architects", "数据库管理员与架构师"),
        ],
      ]),
    });

    expect(members[0]).toMatchObject({
      canonicalSlug: "database-administrators",
      canonicalTitleEn: "Database administrators and architects",
      canonicalTitleZh: "数据库管理员与架构师",
      publicIndexState: "indexable",
      strongIndexDecision: "strong_index_ready",
      includedInPublicDataset: true,
    });
  });

  it("does not render dataset-only members that have no meaningful display title", () => {
    const members = buildRenderableCareerDatasetMembers({
      datasetMembers: [
        datasetMember({
          canonicalSlug: "database-administrators-and-architects",
          canonicalTitleEn: "database-administrators-and-architects",
          canonicalTitleZh: null,
          releaseCohort: "public_detail_indexable",
          publicIndexState: "indexable",
          strongIndexDecision: "strong_index_ready",
        }),
      ],
      detailReadyJobs: new Map(),
    });

    expect(members).toEqual([]);
  });

  it("does not render unreviewed directory drafts with obviously broken zh titles", () => {
    const members = buildRenderableCareerDatasetMembers({
      datasetMembers: [
        datasetMember({
          canonicalSlug: "cooks-short-order",
          canonicalTitleEn: "Cooks, Short Order",
          canonicalTitleZh: "简餐订单",
          releaseCohort: "directory_draft_pending_detail",
          publicIndexState: "noindex",
          strongIndexDecision: "directory_draft_detail_pending",
        }),
      ],
      detailReadyJobs: new Map(),
    });

    expect(members).toEqual([]);
  });

  it("strips trailing all-other qualifiers from rendered Chinese draft titles", () => {
    const members = buildRenderableCareerDatasetMembers({
      datasetMembers: [
        datasetMember({
          canonicalSlug: "woodworkers-all-other",
          canonicalTitleEn: "Woodworkers, All Other",
          canonicalTitleZh: "木工、其他",
          familySlug: "production",
          releaseCohort: "directory_draft_pending_detail",
          publicIndexState: "noindex",
          strongIndexDecision: "directory_draft_detail_pending",
        }),
      ],
      detailReadyJobs: new Map(),
    });

    expect(members).toHaveLength(1);
    expect(members[0]?.canonicalTitleZh).toBe("木工");
  });
});
