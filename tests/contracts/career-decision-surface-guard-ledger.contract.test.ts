import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/career-decision-surface-guard-ledger.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/career-decision-surface-guard-ledger.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-4b-state.json");

const STATUS_ENUM = [
  "ready_for_runtime_v1",
  "ready_for_metadata_only",
  "partial",
  "artifact_only",
  "backend_ready",
  "frontend_partial",
  "blocked",
  "dangerous_if_integrated",
  "requires_human_decision",
  "safe_to_defer",
  "unknown",
];
const RUNTIME_RECOMMENDATION_ENUM = [
  "no_runtime",
  "metadata_only",
  "data_attribute_only",
  "existing_surface_only",
  "existing_result_report_only",
  "existing_cta_guard_only",
  "future_runtime_candidate",
  "blocked",
];

type GuardLedgerArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domain: string;
  runtimeReadiness: string;
  runtimeRecommendation: string;
  phase4bDecision: string;
  statusEnum: string[];
  runtimeRecommendationEnum: string[];
  signalRoles: Array<{ scale_code: string; role: string; recommendation_eligible: string; boundary: string }>;
  surfaceLedger: Array<{
    surface: string;
    route: string;
    componentEvidence: string[];
    status: string;
    runtimeRecommendation: string;
    guardPolicy: string;
  }>;
  guardRules: string[];
  forbiddenClaims: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("career decision existing surface guard ledger", () => {
  it("depends on PR-4B-03 and records PR-4B-04 train state", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string; merge_sha?: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    const pr4b03 = byId.get("PR-4B-03");
    expect(pr4b03).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/744",
    });
    expect(pr4b03?.merge_sha).toMatch(/^[0-9a-f]{40}$/);

    const pr4b04 = byId.get("PR-4B-04");
    expect(pr4b04).toMatchObject({
      branch: "codex/pr-4b-04-career-decision-surface-guard-ledger",
      depends_on: ["PR-4B-03"],
    });
    expect(["in_progress", "merged"]).toContain(pr4b04?.status);
  });

  it("keeps Career Decision dangerous and guard-ledger-only", () => {
    const artifact = readJson<GuardLedgerArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("decision_domain.career_decision_surface_guard_ledger.v1");
    expect(artifact.scope).toBe("PR-4B-04");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-train");
    expect(artifact.dependsOn).toEqual(["PR-4B-03"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_ledger_only");
    expect(artifact.domain).toBe("career_decision");
    expect(artifact.runtimeReadiness).toBe("dangerous_if_integrated");
    expect(artifact.runtimeRecommendation).toBe("existing_cta_guard_only");
    expect(artifact.phase4bDecision).toContain("no recommender");
    expect(artifact.statusEnum).toEqual(STATUS_ENUM);
    expect(artifact.runtimeRecommendationEnum).toEqual(RUNTIME_RECOMMENDATION_ENUM);
  });

  it("locks signal recommendation boundaries", () => {
    const artifact = readJson<GuardLedgerArtifact>(ARTIFACT_PATH);
    const bySignal = new Map(artifact.signalRoles.map((signal) => [signal.scale_code, signal]));

    expect(bySignal.get("RIASEC")).toMatchObject({
      role: "primary",
      recommendation_eligible: "candidate_signal",
      boundary: "not recommender",
    });
    expect(bySignal.get("MBTI")).toMatchObject({
      role: "supporting",
      recommendation_eligible: "next_step_only",
    });
    expect(bySignal.get("BIG5_OCEAN")).toMatchObject({
      role: "supporting",
      recommendation_eligible: "explanation_only",
      boundary: "not career matcher",
    });
    expect(bySignal.get("Career Graph")?.boundary).toContain("evidence substrate");
  });

  it("covers existing surfaces with component evidence only", () => {
    const artifact = readJson<GuardLedgerArtifact>(ARTIFACT_PATH);

    expect(artifact.surfaceLedger.map((surface) => surface.surface)).toEqual([
      "career_job_detail",
      "mbti_career_recommendation",
      "result_report_career_adjacent",
      "riasec_result_report",
    ]);
    for (const surface of artifact.surfaceLedger) {
      expect(STATUS_ENUM).toContain(surface.status);
      expect(surface.runtimeRecommendation).toBe("existing_cta_guard_only");
      expect(surface.guardPolicy).not.toMatch(/precise recommender|success guarantee|placement guarantee/i);
      for (const evidence of surface.componentEvidence) {
        expect(fs.existsSync(path.join(ROOT, evidence)), evidence).toBe(true);
      }
    }
  });

  it("forbids recommendation, claim, graph, CTA, and SEO/GEO expansion", () => {
    const artifact = readJson<GuardLedgerArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.guardRules).toEqual(
      expect.arrayContaining([
        "career_decision_does_not_trigger_recommendation_runtime",
        "riasec_not_recommender",
        "big_five_not_career_matcher",
        "mbti_snapshot_not_personalized_recommender",
        "career_fit_no_success_or_placement_guarantee",
        "no_ai_planning_claim",
        "no_best_career_prediction",
        "no_new_career_decision_page",
        "no_new_cta_runtime",
        "no_graph_edge_expansion",
        "no_seo_geo_exposure_change",
      ])
    );
    expect(artifact.forbiddenClaims).toEqual(
      expect.arrayContaining([
        "precise recommender",
        "best-career prediction",
        "success guarantee",
        "placement guarantee",
        "Big Five/RIASEC career matcher",
        "AI planning claim",
      ])
    );
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "career recommendation pages",
        "career job pages",
        "scoring",
        "recommendation bundles",
        "companion links",
        "graph edges",
        "CTA copy",
        "SEO/GEO exposure",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("`career_decision` remains `dangerous_if_integrated`");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
