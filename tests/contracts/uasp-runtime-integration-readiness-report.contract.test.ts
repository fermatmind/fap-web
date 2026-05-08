import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs/assessment/uasp/uasp-runtime-integration-readiness-report.md");
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/uasp/generated/uasp-runtime-integration-readiness-report.v1.json"
);

const REQUIRED_SECTIONS = [
  "Executive Summary",
  "UASP Artifact Reality Matrix",
  "Backend Scale Registry Integration Matrix",
  "Frontend Test Runtime Integration Matrix",
  "Result / Report UASP Integration Matrix",
  "Claim Runtime Integration Matrix",
  "Evidence Runtime Integration Matrix",
  "SEO/GEO UASP Integration Matrix",
  "Freemium UASP Integration Matrix",
  "Profile / Memory UASP Integration Matrix",
  "Recommendation UASP Integration Matrix",
  "Scale-specific Runtime Risk Matrix",
  "UASP Runtime Ownership Matrix",
  "P0 / P1 / P2 / P3 Backlog",
  "Phase 2B Runtime Integration PR Train Proposal",
  "Codex-safe vs Human-decision-required Matrix",
  "What Must Not Be Integrated Yet",
  "Final Phase 2B Readiness Assessment",
];

const ALLOWED_STATUSES = [
  "ready_for_integration",
  "partial",
  "backend_ready",
  "frontend_partial",
  "artifact_only",
  "blocked",
  "dangerous_if_integrated",
  "requires_human_decision",
  "safe_to_defer",
  "unknown",
];

const ALLOWED_PRIORITIES = ["P0", "P1", "P2", "P3"];

type ReportArtifact = {
  version: string;
  trainName: string;
  prNamespace: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  reportPath: string;
  allowedStatuses: string[];
  allowedPriorities: string[];
  sections: string[];
  sourceArtifactIndex: Array<{
    phase: string;
    path: string;
    status: "present" | "missing_artifact";
  }>;
  matrices?: Record<string, Array<Record<string, unknown>>>;
};

function readArtifact(): ReportArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as ReportArtifact;
}

describe("UASP runtime integration readiness report", () => {
  it("creates one canonical report and one canonical JSON artifact", () => {
    const artifact = readArtifact();

    expect(fs.existsSync(REPORT_PATH)).toBe(true);
    expect(artifact.version).toBe("uasp.runtime_integration_readiness_report.v1");
    expect(artifact.trainName).toBe("uasp-runtime-integration-readiness-report-train");
    expect(artifact.prNamespace).toBe("PR-UASP2B-RPT-*");
    expect(artifact.reportPath).toBe("docs/assessment/uasp/uasp-runtime-integration-readiness-report.md");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
  });

  it("keeps the report section list complete and in order", () => {
    const artifact = readArtifact();
    const report = fs.readFileSync(REPORT_PATH, "utf8");

    expect(artifact.sections).toEqual(REQUIRED_SECTIONS);
    for (const [index, section] of REQUIRED_SECTIONS.entries()) {
      expect(report).toContain(`## ${index + 1}. ${section}`);
    }
  });

  it("uses only approved report status and priority enums", () => {
    const artifact = readArtifact();

    expect(artifact.allowedStatuses).toEqual(ALLOWED_STATUSES);
    expect(artifact.allowedPriorities).toEqual(ALLOWED_PRIORITIES);
  });

  it("indexes all required source artifacts and marks any missing file explicitly", () => {
    const artifact = readArtifact();
    const requiredPaths = [
      "docs/runtime/public-frontend-source-of-truth.md",
      "docs/runtime/generated/public-frontend-source-of-truth.v1.json",
      "docs/runtime/page-family-runtime-coverage.md",
      "docs/runtime/generated/page-family-runtime-coverage.v1.json",
      "docs/runtime/frontend-fallback-authority-inventory.md",
      "docs/runtime/generated/frontend-fallback-authority-inventory.v1.json",
      "docs/claims/public-claim-boundary-matrix.md",
      "docs/claims/generated/public-claim-boundary-matrix.v1.json",
      "docs/seo/discoverability-authority-convergence.md",
      "docs/seo/generated/discoverability-authority-matrix.v1.json",
      "docs/freemium/freemium-runtime-coverage.md",
      "docs/freemium/generated/freemium-runtime-coverage.v1.json",
      "docs/runtime/fallback-owner-gates.md",
      "docs/runtime/generated/fallback-owner-gates.v1.json",
      "docs/geo/evidence-container-runtime-baseline.md",
      "docs/geo/generated/evidence-container-runtime-baseline.v1.json",
      "docs/freemium/freemium-cross-scale-parity-ledger.md",
      "docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json",
      "docs/assessment/uasp/uasp-signal-contract-schema.md",
      "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json",
      "docs/assessment/uasp/existing-scale-signal-mapping.md",
      "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json",
      "docs/assessment/uasp/decision-domain-registry.md",
      "docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json",
      "docs/assessment/uasp/uasp-eligibility-guards.md",
      "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json",
      "docs/assessment/uasp/profile-contribution-sensitivity-policy.md",
      "docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json",
      "docs/assessment/uasp/uasp-readiness-dashboard.md",
      "docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json",
    ];
    const byPath = new Map(artifact.sourceArtifactIndex.map((entry) => [entry.path, entry]));

    expect([...byPath.keys()].sort()).toEqual([...requiredPaths].sort());
    for (const requiredPath of requiredPaths) {
      const entry = byPath.get(requiredPath);
      expect(entry, requiredPath).toBeDefined();
      const exists = fs.existsSync(path.join(ROOT, requiredPath));
      expect(entry?.status, requiredPath).toBe(exists ? "present" : "missing_artifact");
    }
  });

  it("documents report-only scope without runtime implementation", () => {
    const report = fs.readFileSync(REPORT_PATH, "utf8");

    expect(report).toContain("Runtime behavior changed: no.");
    expect(report).toContain("does not implement UASP runtime");
    expect(report).toContain("does not onboard new tests");
    expect(report).not.toContain("Runtime behavior changed: yes");
  });

  it("completes PR-UASP2B-RPT-02 artifact/backend/frontend matrices with approved statuses and evidence", () => {
    const artifact = readArtifact();
    const report = fs.readFileSync(REPORT_PATH, "utf8");
    const matrixKeys = [
      "uaspArtifactReality",
      "backendScaleRegistryIntegration",
      "frontendTestRuntimeIntegration",
    ];

    for (const key of matrixKeys) {
      const rows = artifact.matrices?.[key];
      expect(rows, key).toBeDefined();
      expect(rows?.length, key).toBeGreaterThan(0);
      for (const row of rows ?? []) {
        expect(ALLOWED_STATUSES).toContain(row.status);
        expect(Array.isArray(row.evidence), `${key} evidence`).toBe(true);
        expect((row.evidence as unknown[]).length, `${key} evidence length`).toBeGreaterThan(0);
      }
    }

    expect(report).toContain("| UASP signal contract schema | `artifact_only` |");
    expect(report).toContain("| `signal_type`, `result_shape`, `stability` |");
    expect(report).toContain("| Frontend fallback seeds |");
    expect(JSON.stringify(artifact.matrices?.backendScaleRegistryIntegration)).toContain("uasp_signal_v1");
    expect(JSON.stringify(artifact.matrices?.frontendTestRuntimeIntegration)).toContain("Future scale additions must fail");
  });

  it("completes PR-UASP2B-RPT-03 result/report, claim, and evidence matrices with locked boundaries", () => {
    const artifact = readArtifact();
    const report = fs.readFileSync(REPORT_PATH, "utf8");
    const matrixKeys = [
      "resultReportUaspIntegration",
      "claimRuntimeIntegration",
      "evidenceRuntimeIntegration",
    ];

    for (const key of matrixKeys) {
      const rows = artifact.matrices?.[key];
      expect(rows, key).toBeDefined();
      expect(rows?.length, key).toBeGreaterThan(0);
      for (const row of rows ?? []) {
        expect(ALLOWED_STATUSES).toContain(row.status);
        expect(Array.isArray(row.evidence), `${key} evidence`).toBe(true);
        expect((row.evidence as unknown[]).length, `${key} evidence length`).toBeGreaterThan(0);
      }
    }

    const resultReport = JSON.stringify(artifact.matrices?.resultReportUaspIntegration);
    const claims = JSON.stringify(artifact.matrices?.claimRuntimeIntegration);
    const evidence = JSON.stringify(artifact.matrices?.evidenceRuntimeIntegration);

    expect(resultReport).toContain("read-only uasp_signal_v1");
    expect(resultReport).toContain("must not persist profile signals");
    expect(resultReport).toContain("never trigger recommender");
    expect(claims).toContain("cannot predict career success");
    expect(claims).toContain("cannot claim precise career matching");
    expect(claims).toContain("cannot claim full or precise recommender runtime");
    expect(claims).toContain("private/noindex");
    expect(evidence).toContain("visible-only rule");
    expect(evidence).toContain("do not generate new evidence content");
    expect(evidence).toContain("Do not add hidden schema or FAQ stuffing");
    expect(report).toContain("| Attempt result payload |");
    expect(report).toContain("| MBTI claim boundary |");
    expect(report).toContain("| Visible Evidence Container baseline |");
  });

  it("completes PR-UASP2B-RPT-04 SEO/GEO and freemium matrices without exposure or commerce widening", () => {
    const artifact = readArtifact();
    const report = fs.readFileSync(REPORT_PATH, "utf8");
    const matrixKeys = ["seoGeoUaspIntegration", "freemiumUaspIntegration"];

    for (const key of matrixKeys) {
      const rows = artifact.matrices?.[key];
      expect(rows, key).toBeDefined();
      expect(rows?.length, key).toBeGreaterThan(0);
      for (const row of rows ?? []) {
        expect(ALLOWED_STATUSES).toContain(row.status);
        expect(Array.isArray(row.evidence), `${key} evidence`).toBe(true);
        expect((row.evidence as unknown[]).length, `${key} evidence length`).toBeGreaterThan(0);
      }
    }

    const seoGeo = JSON.stringify(artifact.matrices?.seoGeoUaspIntegration);
    const freemium = JSON.stringify(artifact.matrices?.freemiumUaspIntegration);

    expect(seoGeo).toContain("non-widening guard");
    expect(seoGeo).toContain("must not silently add URLs");
    expect(seoGeo).toContain("Sensitive scales cannot default to llms_full_eligible");
    expect(freemium).toContain("do not alter commerce runtime");
    expect(freemium).toContain("Cannot claim monetization-ready without parity evidence");
    expect(freemium).toContain("Do not infer full_loop from SKU existence");
    expect(freemium).toContain("Future scale cannot be monetization-ready without freemium parity proof");
    expect(report).toContain("| `seo_geo_eligible` |");
    expect(report).toContain("| `freemium_status` |");
  });

  it("completes PR-UASP2B-RPT-05 profile, recommendation, risk, and ownership matrices with write blocks", () => {
    const artifact = readArtifact();
    const report = fs.readFileSync(REPORT_PATH, "utf8");
    const evidenceMatrixKeys = [
      "profileMemoryUaspIntegration",
      "recommendationUaspIntegration",
      "scaleSpecificRuntimeRisk",
    ];

    for (const key of evidenceMatrixKeys) {
      const rows = artifact.matrices?.[key];
      expect(rows, key).toBeDefined();
      expect(rows?.length, key).toBeGreaterThan(0);
      for (const row of rows ?? []) {
        expect(ALLOWED_STATUSES).toContain(row.status);
        expect(Array.isArray(row.evidence), `${key} evidence`).toBe(true);
        expect((row.evidence as unknown[]).length, `${key} evidence length`).toBeGreaterThan(0);
      }
    }

    const ownershipRows = artifact.matrices?.uaspRuntimeOwnership;
    expect(ownershipRows?.length).toBeGreaterThan(0);
    for (const row of ownershipRows ?? []) {
      expect(ALLOWED_STATUSES).toContain(row.status);
      expect(row).toHaveProperty("sourceOfTruthOwner");
      expect(row).toHaveProperty("storageRecommendation");
      expect(row).toHaveProperty("runtimeConsumer");
    }

    const profile = JSON.stringify(artifact.matrices?.profileMemoryUaspIntegration);
    const recommendation = JSON.stringify(artifact.matrices?.recommendationUaspIntegration);
    const risk = JSON.stringify(artifact.matrices?.scaleSpecificRuntimeRisk);
    const ownership = JSON.stringify(artifact.matrices?.uaspRuntimeOwnership);

    expect(profile).toContain("not UASP Profile");
    expect(profile).toContain("not UASP profile memory");
    expect(profile).toContain("profile_contribution = blocked for runtime storage");
    expect(recommendation).toContain("next-step only");
    expect(recommendation).toContain("Candidate signal only");
    expect(recommendation).toContain("recommendation_eligible = guard-only");
    expect(recommendation).toContain("Must not become recommendation engine");
    expect(risk).toContain("SDS20");
    expect(risk).toContain("SDS_20");
    expect(ownership).toContain("no runtime storage");
    expect(ownership).toContain("not recommender runtime");
    expect(report).toContain("| `profile_contribution` | Policy says first-batch scales may contribute");
    expect(report).toContain("| Frontend local ranking | Forbidden as authority.");
    expect(report).toContain("| SDS code mismatch | UASP artifact uses `SDS20`; backend uses `SDS_20`.");
  });
});
