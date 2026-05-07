import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/runtime/generated/page-family-runtime-coverage.v1.json");
const DOC_PATH = path.join(ROOT, "docs/runtime/page-family-runtime-coverage.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type RuntimeStatus =
  | "production_grade"
  | "operational"
  | "partial"
  | "shallow_asset"
  | "frontend_illusion"
  | "backend_only"
  | "blocked"
  | "dangerous"
  | "unknown";

type CoverageRow = {
  id: string;
  pageFamily: string;
  routePatterns: string[];
  routeExists: boolean;
  rendererExists: boolean;
  rendererSources: string[];
  backendApiConsumed: boolean;
  backendEvidence: string[];
  cmsDataConsumed: boolean;
  seoSurfaceConsumed: boolean;
  answerSurfaceConsumed: boolean;
  landingSurfaceConsumed: boolean;
  graphContractConsumed: boolean;
  freemiumContractConsumed: boolean;
  jsonLdAuthority: string;
  faqAuthority: string;
  ctaAuthority: string;
  fallbackState: string;
  runtimeStatus: RuntimeStatus;
  evidence: string[];
  notes: string;
};

type CoverageArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  runtimeStatusEnum: RuntimeStatus[];
  requiredPageFamilies: string[];
  rows: CoverageRow[];
  highRiskSurfaces: Array<{ pageFamily: string; risk: string; runtimeStatus: RuntimeStatus }>;
};

function readArtifact(): CoverageArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CoverageArtifact;
}

describe("page family runtime coverage matrix", () => {
  it("registers PR-PRAC-02 after PR-PRAC-01 in train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-convergence-train");
    expect(byId.get("PR-PRAC-01")).toMatchObject({ status: "merged" });
    const prac02 = byId.get("PR-PRAC-02");
    expect(prac02).toMatchObject({
      branch: "codex/pr-prac-02-page-family-runtime-coverage",
      depends_on: ["PR-PRAC-01"],
    });
    expect(["in_progress", "merged"]).toContain(prac02?.status);
  });

  it("covers every required page family with the frozen runtime status enum", () => {
    const artifact = readArtifact();
    const statuses = new Set(artifact.runtimeStatusEnum);
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    expect(artifact.version).toBe("runtime.page_family_runtime_coverage.v1");
    expect(artifact.scope).toBe("PR-PRAC-02");
    expect(artifact.trainName).toBe("public-runtime-authority-convergence-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.runtimeStatusEnum).toEqual([
      "production_grade",
      "operational",
      "partial",
      "shallow_asset",
      "frontend_illusion",
      "backend_only",
      "blocked",
      "dangerous",
      "unknown",
    ]);

    for (const family of artifact.requiredPageFamilies) {
      expect(byId.has(family), family).toBe(true);
    }

    for (const row of artifact.rows) {
      expect(statuses.has(row.runtimeStatus), row.id).toBe(true);
      expect(row.routePatterns.length, row.id).toBeGreaterThan(0);
      expect(row.rendererSources.length, row.id).toBeGreaterThan(0);
      expect(row.evidence.length, row.id).toBeGreaterThan(0);
      expect(row.jsonLdAuthority.trim(), row.id).not.toBe("");
      expect(row.faqAuthority.trim(), row.id).not.toBe("");
      expect(row.ctaAuthority.trim(), row.id).not.toBe("");
      expect(row.fallbackState.trim(), row.id).not.toBe("");
      expect(row.notes.trim(), row.id).not.toBe("");
    }
  });

  it("anchors every frontend renderer source to an existing repository file", () => {
    const artifact = readArtifact();

    for (const row of artifact.rows) {
      for (const source of row.rendererSources) {
        expect(fs.existsSync(path.join(ROOT, source)), `${row.id}: ${source}`).toBe(true);
      }
    }
  });

  it("classifies core authority surfaces and known runtime risks", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));
    const risks = new Set(artifact.highRiskSurfaces.map((risk) => risk.pageFamily));

    expect(byId.get("career_job_detail")).toMatchObject({
      backendApiConsumed: true,
      seoSurfaceConsumed: true,
      answerSurfaceConsumed: true,
      graphContractConsumed: true,
      runtimeStatus: "operational",
    });
    expect(byId.get("career_recommendation_detail")).toMatchObject({
      backendApiConsumed: true,
      graphContractConsumed: true,
      runtimeStatus: "operational",
    });
    expect(byId.get("test_detail")).toMatchObject({
      fallbackState: "migration_required",
      freemiumContractConsumed: true,
    });
    expect(byId.get("personality_detail")).toMatchObject({
      fallbackState: "migration_required",
      runtimeStatus: "partial",
    });
    expect(byId.get("article_detail")).toMatchObject({
      jsonLdAuthority: "backend_jsonld_or_frontend_fallback",
      fallbackState: "migration_required",
    });
    expect(byId.get("paywall_order_payment")).toMatchObject({
      freemiumContractConsumed: true,
      runtimeStatus: "operational",
    });

    expect(risks).toEqual(
      new Set([
        "test_detail",
        "topic_detail",
        "personality_detail",
        "article_detail",
        "career_recommendation_detail",
        "paywall_order_payment",
      ])
    );
  });

  it("documents the matrix without proposing runtime behavior changes", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Coverage Matrix");
    expect(doc).toContain("career recommendation detail");
    expect(doc).toContain("Snapshot-based direction support");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("implementation plan");
  });
});
