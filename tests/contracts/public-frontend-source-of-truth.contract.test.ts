import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/runtime/generated/public-frontend-source-of-truth.v1.json");
const DOC_PATH = path.join(ROOT, "docs/runtime/public-frontend-source-of-truth.md");
const TRAIN_MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train.yaml");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type FrontendClassification =
  | "primary_public_runtime"
  | "deploy_source"
  | "backend_proxy"
  | "skeleton_or_stale"
  | "unrelated_worktree"
  | "unknown";

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

type FrontendCandidate = {
  id: string;
  path: string;
  classification: FrontendClassification;
  runtimeStatus: RuntimeStatus;
  evidence: string[];
  auditRule: string;
};

type DeploymentRow = {
  surface: string;
  classification: FrontendClassification;
  evidence: string;
  runtimeMeaning: string;
};

type RouteOwnershipRow = {
  routeFamily: string;
  runtimeSourceOwner: FrontendClassification;
  backendCmsTruthOwner: string;
  notes: string;
};

type SourceOfTruthArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  decision: {
    primaryPublicRuntime: string;
    nonAuthoritativeNestedSkeleton: string;
    auditRule: string;
  };
  allowedClassifications: FrontendClassification[];
  runtimeStatusEnum: RuntimeStatus[];
  frontendCandidates: FrontendCandidate[];
  deploymentSourceMatrix: DeploymentRow[];
  routeOwnershipMatrix: RouteOwnershipRow[];
  mustNotChange: string[];
};

function readArtifact(): SourceOfTruthArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as SourceOfTruthArtifact;
}

describe("public frontend source-of-truth lock", () => {
  it("registers the PRAC train identity before PR-PRAC-01 runtime inventory assertions", () => {
    const manifest = fs.readFileSync(TRAIN_MANIFEST_PATH, "utf8");
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      pr_namespace: string;
      prs: Array<{ id: string; branch: string }>;
    };

    expect(manifest).toContain("train_name: public-runtime-authority-convergence-train");
    expect(manifest).toContain("pr_namespace: PR-PRAC-*");
    expect(manifest).toContain("codex/pr-prac-01-frontend-source-of-truth-lock");
    expect(state.train_name).toBe("public-runtime-authority-convergence-train");
    expect(state.pr_namespace).toBe("PR-PRAC-*");
    expect(state.prs.filter((pr) => pr.id.startsWith("PR-PRAC-")).map((pr) => pr.id)).toEqual([
      "PR-PRAC-01",
      "PR-PRAC-02",
      "PR-PRAC-03",
      "PR-PRAC-04",
      "PR-PRAC-05",
      "PR-PRAC-06",
    ]);
  });

  it("classifies the primary frontend and nested skeleton explicitly", () => {
    const artifact = readArtifact();
    const candidates = new Map(artifact.frontendCandidates.map((candidate) => [candidate.id, candidate]));

    expect(artifact.version).toBe("runtime.public_frontend_source_of_truth.v1");
    expect(artifact.scope).toBe("PR-PRAC-01");
    expect(artifact.trainName).toBe("public-runtime-authority-convergence-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.decision.primaryPublicRuntime).toBe("/Users/rainie/Desktop/GitHub/fap-web");
    expect(artifact.decision.nonAuthoritativeNestedSkeleton).toBe("/Users/rainie/Desktop/GitHub/fap-api/fap-web");
    expect(artifact.decision.auditRule).toContain("Do not treat nested fap-api/fap-web");

    expect(candidates.get("fap_web_primary")).toMatchObject({
      classification: "primary_public_runtime",
      runtimeStatus: "operational",
    });
    expect(candidates.get("nested_fap_api_fap_web")).toMatchObject({
      classification: "skeleton_or_stale",
      runtimeStatus: "dangerous",
    });
  });

  it("keeps all classifications and statuses within the frozen PRAC taxonomies", () => {
    const artifact = readArtifact();
    const allowedClassifications = new Set(artifact.allowedClassifications);
    const allowedStatuses = new Set(artifact.runtimeStatusEnum);

    expect(artifact.allowedClassifications).toEqual(
      expect.arrayContaining([
        "primary_public_runtime",
        "deploy_source",
        "backend_proxy",
        "skeleton_or_stale",
        "unrelated_worktree",
        "unknown",
      ])
    );
    expect(artifact.runtimeStatusEnum).toEqual(
      expect.arrayContaining([
        "production_grade",
        "operational",
        "partial",
        "shallow_asset",
        "frontend_illusion",
        "backend_only",
        "blocked",
        "dangerous",
        "unknown",
      ])
    );

    for (const candidate of artifact.frontendCandidates) {
      expect(allowedClassifications.has(candidate.classification), candidate.id).toBe(true);
      expect(allowedStatuses.has(candidate.runtimeStatus), candidate.id).toBe(true);
      expect(candidate.evidence.length, candidate.id).toBeGreaterThan(0);
      expect(candidate.auditRule.trim(), candidate.id).not.toBe("");
    }

    for (const row of artifact.deploymentSourceMatrix) {
      expect(allowedClassifications.has(row.classification), row.surface).toBe(true);
      expect(row.evidence.trim(), row.surface).not.toBe("");
      expect(row.runtimeMeaning.trim(), row.surface).not.toBe("");
    }

    for (const row of artifact.routeOwnershipMatrix) {
      expect(allowedClassifications.has(row.runtimeSourceOwner), row.routeFamily).toBe(true);
      expect(row.backendCmsTruthOwner.trim(), row.routeFamily).not.toBe("");
      expect(row.notes.trim(), row.routeFamily).not.toBe("");
    }
  });

  it("grounds fap-web evidence in the current repository without requiring the sibling backend repo in CI", () => {
    const artifact = readArtifact();
    const fapWebEvidence = new Set(
      artifact.frontendCandidates
        .filter((candidate) => candidate.id.startsWith("fap_web"))
        .flatMap((candidate) => candidate.evidence)
        .filter((evidence) => !evidence.startsWith("fap-api/") && evidence !== "local worktree naming only")
    );

    for (const evidence of fapWebEvidence) {
      expect(fs.existsSync(path.join(ROOT, evidence)), evidence).toBe(true);
    }

    expect(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).toContain("\"name\": \"fap-web\"");
    expect(fs.readFileSync(path.join(ROOT, "next.config.mjs"), "utf8")).toContain("output: \"standalone\"");
    expect(fs.readFileSync(path.join(ROOT, "ecosystem.config.cjs"), "utf8")).toContain(".next/standalone/server.js");
    expect(fs.readFileSync(path.join(ROOT, "scripts/deploy_web_pm2.sh"), "utf8")).toContain("APP_NAME");
  });

  it("documents the skeleton warning and route ownership matrix without changing runtime behavior", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Frontend Candidate Matrix");
    expect(doc).toContain("Deployment Source Matrix");
    expect(doc).toContain("Route Ownership Matrix");
    expect(doc).toContain("skeleton_or_stale");
    expect(doc).toContain("Do not treat nested fap-api/fap-web as public frontend runtime");

    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "frontend runtime",
        "deployment scripts",
        "sitemap output",
        "robots output",
        "public routes",
      ])
    );
  });
});
