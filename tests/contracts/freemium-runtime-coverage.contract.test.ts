import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/freemium/generated/freemium-runtime-coverage.v1.json");
const DOC_PATH = path.join(ROOT, "docs/freemium/freemium-runtime-coverage.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type FreemiumClassification =
  | "full_loop"
  | "backend_ready"
  | "frontend_partial"
  | "MBTI_only"
  | "cross_scale_partial"
  | "blocked"
  | "unknown";

type SourceContract = {
  path: string;
  requiredTokens: string[];
};

type FreemiumRow = {
  id: string;
  capability: string;
  classification: FreemiumClassification;
  scaleCoverage: string[];
  backendRuntimeExists: boolean;
  frontendPublicUiExists: boolean;
  ctaExists: boolean;
  userCanCompleteFlow: boolean;
  eventTrackingExists: boolean;
  entitlementRespected: boolean;
  crossScaleSupport: string;
  reality: string;
  sourceFiles: SourceContract[];
};

type FreemiumArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  commerceBehaviorChanged: boolean;
  classificationEnum: FreemiumClassification[];
  requiredCapabilities: string[];
  mbtiFullLoop: string[];
  explicitFindings: Array<{ id: string; classification: FreemiumClassification; summary: string }>;
  rows: FreemiumRow[];
};

function readArtifact(): FreemiumArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as FreemiumArtifact;
}

describe("freemium runtime coverage matrix", () => {
  it("registers PR-PRAC-06 after PR-PRAC-05 in train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.filter((pr) => pr.id.startsWith("PR-PRAC-")).map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-convergence-train");
    expect(byId.get("PR-PRAC-05")).toMatchObject({ status: "merged" });
    const prac06 = byId.get("PR-PRAC-06");
    expect(prac06).toMatchObject({
      branch: "codex/pr-prac-06-freemium-runtime-coverage",
      depends_on: ["PR-PRAC-05"],
    });
    expect(["in_progress", "merged"]).toContain(prac06?.status);
  });

  it("uses only the frozen freemium classification taxonomy", () => {
    const artifact = readArtifact();
    const allowed = new Set(artifact.classificationEnum);

    expect(artifact.version).toBe("runtime.freemium_runtime_coverage.v1");
    expect(artifact.scope).toBe("PR-PRAC-06");
    expect(artifact.trainName).toBe("public-runtime-authority-convergence-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.commerceBehaviorChanged).toBe(false);
    expect(artifact.classificationEnum).toEqual([
      "full_loop",
      "backend_ready",
      "frontend_partial",
      "MBTI_only",
      "cross_scale_partial",
      "blocked",
      "unknown",
    ]);

    for (const row of artifact.rows) {
      expect(allowed.has(row.classification), row.id).toBe(true);
      expect(row.scaleCoverage.length, row.id).toBeGreaterThan(0);
      expect(row.reality.trim(), row.id).not.toBe("");
      expect(row.sourceFiles.length, row.id).toBeGreaterThan(0);
    }
  });

  it("covers all required freemium capabilities", () => {
    const artifact = readArtifact();
    const capabilities = new Set(artifact.rows.map((row) => row.capability));

    for (const capability of artifact.requiredCapabilities) {
      expect(capabilities.has(capability), capability).toBe(true);
    }
  });

  it("identifies the MBTI full loop and cross-scale partial areas", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));
    const findings = new Map(artifact.explicitFindings.map((finding) => [finding.id, finding]));

    expect(artifact.mbtiFullLoop).toEqual([
      "result_report",
      "locked_full_report",
      "checkout",
      "order_wait",
      "entitlement",
      "report_pdf",
      "history",
    ]);
    expect(findings.get("mbti_result_to_paid_report_loop")).toMatchObject({ classification: "full_loop" });
    expect(findings.get("big5_paywall_coverage")).toMatchObject({ classification: "cross_scale_partial" });
    expect(findings.get("invite_unlock_mbti_vs_big5")).toMatchObject({ classification: "MBTI_only" });
    expect(findings.get("module_bundle_logic")).toMatchObject({ classification: "cross_scale_partial" });
    expect(findings.get("retention_email_lifecycle")).toMatchObject({ classification: "frontend_partial" });

    expect(byId.get("checkout")).toMatchObject({ classification: "MBTI_only", userCanCompleteFlow: true });
    expect(byId.get("invite_unlock")).toMatchObject({ classification: "MBTI_only", crossScaleSupport: "blocked" });
    expect(byId.get("cross_scale_freemium_support")).toMatchObject({
      classification: "cross_scale_partial",
      userCanCompleteFlow: false,
    });
  });

  it("keeps commerce/report/payment runtime untouched by this artifact", () => {
    const artifact = readArtifact();

    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.commerceBehaviorChanged).toBe(false);
    for (const row of artifact.rows) {
      expect(row.reality, row.id).not.toMatch(/changed|modified|rewired/i);
    }
  });

  it("anchors capability rows to current source tokens", () => {
    const artifact = readArtifact();

    for (const row of artifact.rows) {
      for (const source of row.sourceFiles) {
        const absoluteSource = path.join(ROOT, source.path);
        expect(fs.existsSync(absoluteSource), `${row.id}: ${source.path}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");

        for (const token of source.requiredTokens) {
          expect(sourceText, `${row.id}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("documents freemium coverage without changing runtime behavior", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("MBTI result to unlock loop");
    expect(doc).toContain("Big Five paywall coverage");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
