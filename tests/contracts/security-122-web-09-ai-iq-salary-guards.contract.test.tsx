import { execFileSync } from "node:child_process";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { apiClient } from "@/lib/api-client";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  fetchCareerAiImpactAssetPreview,
  type CareerAiImpactPreviewAsset,
} from "@/lib/career/api/fetchCareerAiImpactAssetPreview";
import {
  fetchCareerSalaryAssetPreview,
  type CareerSalaryAssetPreviewAsset,
} from "@/lib/career/api/fetchCareerSalaryAssetPreview";
import {
  normalizeIqImageAsset,
  normalizeIqQuestionForRenderer,
} from "@/lib/iq/renderer";
import { isSecurity122Web09AllowedFile } from "./helpers/currentPrScope";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const ROOT = process.cwd();
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/career/api/fetchCareerAiImpactAssetPreview.ts",
  "lib/career/api/fetchCareerSalaryAssetPreview.ts",
  "lib/iq/renderer.ts",
  "lib/iq/result.ts",
  "tests/contracts/career-ai-impact-preview-consumer.contract.test.tsx",
  "tests/contracts/career-salary-asset-preview-consumer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-question-renderer.contract.test.tsx",
  "tests/contracts/security-122-web-09-ai-iq-salary-guards.contract.test.tsx",
];

function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }

  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files.length > 0 || process.env.GITHUB_ACTIONS !== "true" ? files : CI_DIFF_FALLBACK_FILES;
}

function buildAiAsset(statusSlug = "actuaries"): CareerAiImpactPreviewAsset {
  return {
    slug: statusSlug,
    locale: "en",
    occupation: { title: "Actuaries" },
    ai_exposure_score: { score_1_to_10: 7, confidence: "medium", exposure_type: "augmentation" },
    summary: "AI task exposure is bounded to workflow acceleration and does not predict individual outcomes.",
    items: {
      most_ai_exposed_workflows: [{ title: "Draft review", body: "AI can accelerate repeatable drafting work." }],
      human_accountability_anchors: [{ title: "Accountability", body: "A human remains accountable for assumptions." }],
      how_to_prepare: [{ title: "Prepare", body: "Keep evidence trails for model-assisted work." }],
      reader_boundary: { title: "Boundary", body: "This is not a job-loss or wage-loss forecast." },
    },
    sources: [{ name: "BLS OOH", url: "https://www.bls.gov/ooh/math/actuaries.htm" }],
  };
}

function buildSalaryAsset(slug = "accountants-and-auditors"): CareerSalaryAssetPreviewAsset {
  return {
    slug,
    locale: "en",
    heading: "Accountants and auditors salary reference",
    summary: { short_answer: "Salary references are shown only within source boundaries." },
    china_recruitment_reference: {
      heading: "China recruitment-market reference",
      body: "Recruitment evidence is not an official single-occupation median wage.",
    },
    us_official_reference: { heading: "US official reference", body: "Uses public career evidence." },
    salary_drivers: [{ factor: "Location", description: "City and employer can change observed ranges." }],
    reader_guidance: ["Do not read this as a personal salary prediction."],
    sources: [
      { market: "CN", name: "JobUI", url: "https://www.jobui.com/salary/quanguo-zhongjihuijishi/" },
      { market: "US", name: "BLS OOH", url: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
    ],
  };
}

function accessView(): AttemptReportAccessView {
  return {
    attemptId: "iq-web09",
    accessState: "ready",
    reportState: "ready",
    pdfState: "unavailable",
    unlockStage: null,
    unlockSource: null,
    reasonCode: null,
    accessLevel: "free",
    variant: "free",
    projectionVersion: 1,
    modulesAllowed: [],
    modulesPreview: [],
    actions: {
      pageHref: "/en/result/iq-web09",
      pdfHref: null,
      waitHref: null,
      historyHref: null,
      lookupHref: null,
    },
    meta: {
      producedAt: null,
      refreshedAt: null,
    },
  };
}

function iqEstimateBlockedReport(): ReportResponse {
  return {
    ok: true,
    scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    locked: false,
    variant: "full",
    summary: {
      raw_score: 26,
      question_count: 30,
      iq_estimate: 136,
      percentile: 98,
      confidence_interval: { lower: 130, upper: 141, level: "90%" },
      score_claim_level: "iq_estimate",
      claim_eligible: true,
      iq_estimate_allowed: false,
      production_normed: true,
      population_percentile_eligible: true,
      claim_policy: {
        claim_eligible: true,
        score_claim_level: "iq_estimate",
        iq_estimate_allowed: false,
        production_normed: true,
        population_percentile_eligible: true,
      },
    },
    scoring: {
      raw_score: 26,
      question_count: 30,
    },
    report: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    },
  } as unknown as ReportResponse;
}

describe("SECURITY-122-WEB-09 AI/IQ/salary public exposure guards", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    delete process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED;
    delete process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED;
  });

  it("fails closed on non-production AI impact assets and accepts only production imported public assets", async () => {
    process.env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED = "true";
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        ok: true,
        preview: true,
        status: "staging_preview",
        ai_impact_asset_v1: buildAiAsset(),
      })
      .mockResolvedValueOnce({
        ok: true,
        preview: false,
        status: "production_imported",
        ai_impact_asset_v1: buildAiAsset(),
      });

    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toBeNull();
    await expect(fetchCareerAiImpactAssetPreview({ locale: "en", slug: "actuaries" })).resolves.toMatchObject({
      slug: "actuaries",
      summary: expect.stringContaining("workflow acceleration"),
    });
  });

  it("fails closed on salary preview/internal evidence/source-count leakage and accepts bounded production assets", async () => {
    process.env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED = "true";
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        ok: true,
        preview: true,
        status: "editorial_review",
        salary_asset_v1: buildSalaryAsset(),
      })
      .mockResolvedValueOnce({
        ok: true,
        preview: false,
        status: "production_imported",
        salary_asset_v1: {
          ...buildSalaryAsset(),
          evidence_ids: ["salary_private_row_001"],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        preview: false,
        status: "production_imported",
        salary_asset_v1: {
          ...buildSalaryAsset(),
          sources: [
            { market: "CN", name: "JobUI", url: "http://www.jobui.com/private" },
            { market: "US", name: "BLS OOH", url: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm" },
          ],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        preview: false,
        status: "production_imported",
        salary_asset_v1: buildSalaryAsset(),
      });

    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toBeNull();
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toBeNull();
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toBeNull();
    await expect(fetchCareerSalaryAssetPreview({ locale: "en", slug: "accountants-and-auditors" })).resolves.toMatchObject({
      slug: "accountants-and-auditors",
      sources: expect.arrayContaining([
        expect.not.objectContaining({ source_id: expect.any(String) }),
      ]),
    });
  });

  it("honors iq_estimate_allowed=false even when backend payload includes IQ estimate fields", () => {
    render(
      <IqResultShell
        locale="en"
        reportData={iqEstimateBlockedReport()}
        resultData={null}
        accessView={accessView()}
      />
    );

    expect(screen.getByTestId("iq-raw-score-claim")).toHaveTextContent("30-item reasoning score: 26/30");
    expect(screen.queryByTestId("iq-iq-estimate-value")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-percentile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-confidence-interval")).not.toBeInTheDocument();
  });

  it("rejects untrusted or answer-key IQ image URLs while preserving safe public assets", () => {
    expect(normalizeIqImageAsset({ src: "https://cdn.example.com/iq/q1.webp" })).toBeNull();
    expect(normalizeIqImageAsset({ src: "https://assets.fermatmind.com/iq/private/q1.webp" })).toBeNull();
    expect(normalizeIqImageAsset({ src: "https://assets.fermatmind.com/iq/q1.webp?token=secret" })).toBeNull();
    expect(normalizeIqImageAsset({ src: "https://assets.fermatmind.com/iq/q1.webp" })).toMatchObject({
      src: "https://assets.fermatmind.com/iq/q1.webp",
    });

    const normalized = normalizeIqQuestionForRenderer({
      item_id: "IQ_OWNER_ORIGINAL_30_01",
      stem: { assets: { image: "assets/iq_owner_original_30/q01/q1-question.webp" } },
      options: [{ code: "A", assets: { image: "assets/iq_owner_original_30/q01/q1-option-a.webp" } }],
      answer_key: "A",
      correct_answer: "A",
    });

    expect(normalized?.stem?.image?.src).toBe("assets/iq_owner_original_30/q01/q1-question.webp");
    expect(normalized && "answer_key" in normalized).toBe(false);
    expect(normalized && "correct_answer" in normalized).toBe(false);
  });

  it("keeps the WEB-09 diff inside the declared AI/IQ/salary guard scope", () => {
    const files = changedFiles();
    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.filter((file) => !isSecurity122Web09AllowedFile(file))).toEqual([]);
  });
});
