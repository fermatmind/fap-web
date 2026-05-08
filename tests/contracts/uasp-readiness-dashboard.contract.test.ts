import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DASHBOARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/uasp-readiness-dashboard.md");
const SCHEMA_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const SCALE_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const ELIGIBILITY_GUARDS_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json");
const PROFILE_POLICY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1-state.json");

const REQUIRED_DIMENSIONS = [
  "signal_contract_ready",
  "decision_domain_ready",
  "claim_boundary_ready",
  "evidence_ready",
  "report_value_ready",
  "profile_policy_ready",
  "recommendation_eligibility_ready",
  "seo_geo_eligibility_ready",
  "freemium_ready",
  "runtime_authority_ready",
  "fallback_policy_ready",
];

const READINESS_STATUSES = ["ready", "partial", "blocked", "not_applicable", "requires_human_decision", "unknown"];

type ReadinessDashboard = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  futureScalesOnboarded: boolean;
  publicCatalogChanged: boolean;
  seoGeoOutputChanged: boolean;
  freemiumRuntimeChanged: boolean;
  recommendationRuntimeChanged: boolean;
  profileRuntimeChanged: boolean;
  sourceArtifacts: string[];
  uaspEnums: Record<string, string[]>;
  readinessStatuses: string[];
  readinessDimensions: string[];
  scaleReadiness: Array<{
    scale_code: string;
    overallStatus: string;
    signal_type: string;
    result_shape: string;
    careerRecommenderStatus: string;
    monetizationStatus: string;
    dimensions: Record<string, string>;
    requiredEvidence: string[];
    lockedBoundaries: string[];
  }>;
  futureScaleOnboardingGates: Array<{
    gate_id: string;
    requiredForReady: boolean;
    blocksIfMissing: boolean;
    evidenceRequired: string[];
  }>;
  lockedRules: string[];
  mustNotChange: string[];
  finalReadiness: Record<string, string | string[]>;
};

function readDashboard(): ReadinessDashboard {
  return JSON.parse(fs.readFileSync(DASHBOARD_PATH, "utf8")) as ReadinessDashboard;
}

describe("UASP readiness dashboard", () => {
  it("registers PR-UASP-06 after PR-UASP-05 in the UASP train ledger", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("universal-assessment-signal-platform-v1-train");
    expect(byId.get("PR-UASP-05")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP-06")).toMatchObject({
      branch: "codex/pr-uasp-06-readiness-dashboard-matrix",
      depends_on: ["PR-UASP-05"],
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP-06")?.status);
  });

  it("copies all approved UASP v1 enums exactly from the signal contract schema", () => {
    const dashboard = readDashboard();
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")) as {
      enums: Record<string, string[]>;
    };

    expect(dashboard.version).toBe("uasp.readiness_dashboard.v1");
    expect(dashboard.scope).toBe("PR-UASP-06");
    expect(dashboard.trainName).toBe("universal-assessment-signal-platform-v1-train");
    expect(dashboard.dependsOn).toEqual(["PR-UASP-05"]);
    expect(dashboard.uaspEnums).toEqual(schema.enums);
    expect(dashboard.readinessStatuses).toEqual(READINESS_STATUSES);
    expect(dashboard.readinessDimensions).toEqual(REQUIRED_DIMENSIONS);
  });

  it("keeps all source artifacts present", () => {
    const dashboard = readDashboard();

    expect(fs.existsSync(SCALE_REGISTRY_PATH)).toBe(true);
    expect(fs.existsSync(ELIGIBILITY_GUARDS_PATH)).toBe(true);
    expect(fs.existsSync(PROFILE_POLICY_PATH)).toBe(true);
    for (const artifactPath of dashboard.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }
  });

  it("classifies required first-batch and blocked/example scales with valid readiness values", () => {
    const dashboard = readDashboard();
    const byScale = new Map(dashboard.scaleReadiness.map((row) => [row.scale_code, row]));

    expect([...byScale.keys()].sort()).toEqual([
      "BIG5_OCEAN",
      "CLINICAL_COMBO_68",
      "ENNEAGRAM",
      "EQ_60",
      "FUTURE_SCALE_PLACEHOLDER",
      "IQ_RAVEN",
      "MBTI",
      "RIASEC",
      "SDS20",
    ]);
    expect(byScale.get("MBTI")?.overallStatus).toBe("ready");
    expect(byScale.get("BIG5_OCEAN")?.overallStatus).toBe("partial");
    expect(byScale.get("RIASEC")?.overallStatus).toBe("partial");
    expect(byScale.get("ENNEAGRAM")?.overallStatus).toBe("partial");
    expect(byScale.get("FUTURE_SCALE_PLACEHOLDER")?.overallStatus).toBe("blocked");

    for (const row of dashboard.scaleReadiness) {
      expect(READINESS_STATUSES.includes(row.overallStatus), row.scale_code).toBe(true);
      expect(Object.keys(row.dimensions)).toEqual(REQUIRED_DIMENSIONS);
      for (const [dimension, status] of Object.entries(row.dimensions)) {
        expect(READINESS_STATUSES.includes(status), `${row.scale_code}:${dimension}:${status}`).toBe(true);
      }
    }
  });

  it("keeps dashboard scale meanings aligned with existing scale signal registry", () => {
    const dashboard = readDashboard();
    const scaleRegistry = JSON.parse(fs.readFileSync(SCALE_REGISTRY_PATH, "utf8")) as {
      entries: Array<Record<string, string>>;
    };
    const registryByScale = new Map(scaleRegistry.entries.map((entry) => [entry.scale_code, entry]));
    const firstBatch = ["MBTI", "BIG5_OCEAN", "RIASEC", "ENNEAGRAM"];

    for (const scaleCode of firstBatch) {
      const dashboardRow = dashboard.scaleReadiness.find((row) => row.scale_code === scaleCode);
      const registryRow = registryByScale.get(scaleCode);
      expect(dashboardRow, scaleCode).toBeDefined();
      expect(registryRow, scaleCode).toBeDefined();
      expect(dashboardRow?.signal_type, scaleCode).toBe(registryRow?.signal_type);
      expect(dashboardRow?.result_shape, scaleCode).toBe(registryRow?.result_shape);
    }
  });

  it("does not mark Big Five, RIASEC, or future scales as career recommenders", () => {
    const dashboard = readDashboard();
    const byScale = new Map(dashboard.scaleReadiness.map((row) => [row.scale_code, row]));

    expect(byScale.get("BIG5_OCEAN")?.careerRecommenderStatus).toBe("not_recommender_explanation_only");
    expect(byScale.get("RIASEC")?.careerRecommenderStatus).toBe("candidate_signal_not_recommender");
    expect(byScale.get("FUTURE_SCALE_PLACEHOLDER")?.careerRecommenderStatus).toBe("not_eligible");
    expect(dashboard.lockedRules.join(" ")).toContain("cannot mark Big Five as career recommender");
    expect(dashboard.lockedRules.join(" ")).toContain("cannot mark RIASEC as precise career recommender");
  });

  it("prevents future scales from becoming ready or monetization-ready without gate evidence", () => {
    const dashboard = readDashboard();
    const future = dashboard.scaleReadiness.find((row) => row.scale_code === "FUTURE_SCALE_PLACEHOLDER");

    expect(future?.overallStatus).toBe("blocked");
    expect(future?.monetizationStatus).toBe("blocked_without_freemium_proof");
    expect(future?.dimensions.freemium_ready).toBe("blocked");
    expect(future?.requiredEvidence).toEqual(expect.arrayContaining(["freemium parity gate", "signal gate"]));

    const requiredGates = dashboard.futureScaleOnboardingGates.filter((gate) => gate.requiredForReady);
    expect(requiredGates.length).toBeGreaterThanOrEqual(10);
    for (const gate of requiredGates) {
      expect(gate.blocksIfMissing, gate.gate_id).toBe(true);
      expect(gate.evidenceRequired.length, gate.gate_id).toBeGreaterThan(0);
    }
  });

  it("documents the dashboard without changing runtime, catalog, SEO/GEO, freemium, recommendation, or profile behavior", () => {
    const dashboard = readDashboard();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(dashboard.runtimeBehaviorChanged).toBe(false);
    expect(dashboard.futureScalesOnboarded).toBe(false);
    expect(dashboard.publicCatalogChanged).toBe(false);
    expect(dashboard.seoGeoOutputChanged).toBe(false);
    expect(dashboard.freemiumRuntimeChanged).toBe(false);
    expect(dashboard.recommendationRuntimeChanged).toBe(false);
    expect(dashboard.profileRuntimeChanged).toBe(false);
    expect(dashboard.mustNotChange).toEqual(
      expect.arrayContaining([
        "future scale onboarding",
        "runtime",
        "catalog",
        "SEO/GEO output",
        "freemium runtime",
        "recommendation runtime",
        "profile runtime",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Future scales cannot be marked `ready` without all required gate evidence.");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
