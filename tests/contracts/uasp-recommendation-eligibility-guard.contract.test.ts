import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/recommendation-eligibility-guard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/recommendation-eligibility-guard.md");
const REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const UASP_ELIGIBILITY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json");
const CLAIM_BOUNDARY_PATH = path.join(ROOT, "docs/claims/generated/public-claim-boundary-matrix.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp2b-state.json");

type RecommendationGuard = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  recommendationRuntimeChanged: boolean;
  careerRecommendationBundleChanged: boolean;
  scoringChanged: boolean;
  graphEdgesChanged: boolean;
  companionLinksChanged: boolean;
  localRecommendationEngineChanged: boolean;
  visibleRecommendationCopyChanged: boolean;
  resultReportBehaviorChanged: boolean;
  seoGeoExposureChanged: boolean;
  sourceArtifacts: string[];
  defaults: {
    futureScaleRecommendationEligible: string;
    guardMode: string;
    candidateSignalMeansRecommender: boolean;
    frontendLocalRankingAuthority: string;
  };
  eligibleWithGuardRequiredProof: string[];
  guardRules: Array<{ id: string; rule: string; blocksWhen: string }>;
  firstBatchRecommendationStatus: Array<{
    scale_code: string;
    signal_type: string;
    uaspRecommendationEligible: string;
    guardStatus: string;
    allowedUse: string;
    notAllowedUse: string[];
    runtimeBehaviorChange: string;
  }>;
  forbiddenClaimBaseline: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("UASP recommendation eligibility guard", () => {
  it("registers PR-UASP2B-05 after freemium guard", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; mode: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-UASP2B-04")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP2B-05")).toMatchObject({
      branch: "codex/pr-uasp2b-05-recommendation-guard",
      depends_on: ["PR-UASP2B-04"],
      mode: "contract_only",
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP2B-05")?.status);
  });

  it("is contract-only and records zero recommendation/runtime behavior changes", () => {
    const guard = readJson<RecommendationGuard>(GUARD_PATH);

    expect(guard.version).toBe("uasp.recommendation_eligibility_guard.v1");
    expect(guard.scope).toBe("PR-UASP2B-05");
    expect(guard.trainName).toBe("uasp-runtime-metadata-integration-train");
    expect(guard.dependsOn).toEqual(["PR-UASP2B-04"]);
    expect(guard.runtimeBehaviorChanged).toBe(false);
    expect(guard.executionMode).toBe("contract_only");
    expect(guard.recommendationRuntimeChanged).toBe(false);
    expect(guard.careerRecommendationBundleChanged).toBe(false);
    expect(guard.scoringChanged).toBe(false);
    expect(guard.graphEdgesChanged).toBe(false);
    expect(guard.companionLinksChanged).toBe(false);
    expect(guard.localRecommendationEngineChanged).toBe(false);
    expect(guard.visibleRecommendationCopyChanged).toBe(false);
    expect(guard.resultReportBehaviorChanged).toBe(false);
    expect(guard.seoGeoExposureChanged).toBe(false);
  });

  it("keeps source artifacts present and inherits UASP recommendation proof requirements", () => {
    const guard = readJson<RecommendationGuard>(GUARD_PATH);
    const eligibility = readJson<{ recommendationGuards: Array<{ id: string; requiredProof?: string[] }> }>(
      UASP_ELIGIBILITY_PATH
    );

    for (const artifactPath of guard.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }

    expect(guard.eligibleWithGuardRequiredProof).toEqual(
      expect.arrayContaining(["visible_evidence", "graph_or_backend_recommendation_runtime", "claim_boundary"])
    );
    expect(eligibility.recommendationGuards.find((rule) => rule.id === "eligible_with_guard_requires_proof")?.requiredProof).toEqual(
      expect.arrayContaining(["visible_evidence", "graph_or_backend_runtime", "claim_boundary", "public_runtime_consumer"])
    );
  });

  it("keeps first-batch recommendation status aligned with UASP mapping", () => {
    const guard = readJson<RecommendationGuard>(GUARD_PATH);
    const registry = readJson<{
      entries: Array<{ scale_code: string; signal_type: string; recommendation_eligible: string }>;
    }>(REGISTRY_PATH);
    const registryByScale = new Map(registry.entries.map((entry) => [entry.scale_code, entry]));

    for (const row of guard.firstBatchRecommendationStatus.filter(
      (row) => row.scale_code !== "FUTURE_SCALE_PLACEHOLDER"
    )) {
      const mapped = registryByScale.get(row.scale_code);
      expect(mapped?.recommendation_eligible, row.scale_code).toBe(row.uaspRecommendationEligible);
      expect(mapped?.signal_type, row.scale_code).toBe(row.signal_type);
      expect(row.runtimeBehaviorChange, row.scale_code).toBe("none");
    }
  });

  it("locks MBTI/RIASEC/Big Five/Enneagram recommendation boundaries", () => {
    const guard = readJson<RecommendationGuard>(GUARD_PATH);
    const byScale = new Map(guard.firstBatchRecommendationStatus.map((row) => [row.scale_code, row]));

    expect(byScale.get("MBTI")).toMatchObject({
      uaspRecommendationEligible: "next_step_only",
      guardStatus: "snapshot_next_step_support",
      allowedUse: "snapshot_based_career_direction_support",
    });
    expect(byScale.get("MBTI")?.notAllowedUse).toEqual(
      expect.arrayContaining(["live_personalized_recommender", "precise_career_recommendation"])
    );

    expect(byScale.get("BIG5_OCEAN")).toMatchObject({
      uaspRecommendationEligible: "explanation_only",
      guardStatus: "not_recommender",
    });
    expect(byScale.get("BIG5_OCEAN")?.notAllowedUse).toContain("precise_career_matching");

    expect(byScale.get("RIASEC")).toMatchObject({
      uaspRecommendationEligible: "candidate_signal",
      guardStatus: "candidate_signal_not_recommender",
    });
    expect(byScale.get("RIASEC")?.notAllowedUse).toContain("precise_best_career_recommendation");

    expect(byScale.get("ENNEAGRAM")).toMatchObject({
      uaspRecommendationEligible: "explanation_only",
      guardStatus: "not_recommender",
    });
    expect(byScale.get("FUTURE_SCALE_PLACEHOLDER")).toMatchObject({
      uaspRecommendationEligible: "not_eligible",
      guardStatus: "blocked_until_guard_proof",
    });
  });

  it("preserves forbidden claim baseline for recommendation overreach", () => {
    const guard = readJson<RecommendationGuard>(GUARD_PATH);
    const claims = readJson<{ rows: Array<{ id: string; status: string; boundaryRule: string }> }>(CLAIM_BOUNDARY_PATH);
    const claimsById = new Map(claims.rows.map((row) => [row.id, row]));

    expect(claimsById.get("mbti_career_snapshot_direction")).toMatchObject({
      status: "soft_allowed",
      boundaryRule: "snapshot_direction_not_live_personalized",
    });
    expect(claimsById.get("snapshot_as_personalized_recommender")?.status).toBe("forbidden");
    expect(claimsById.get("frontend_local_ranking_as_recommendation_engine")?.status).toBe("forbidden");
    expect(claimsById.get("riasec_precise_best_career_recommendation")?.status).toBe("forbidden");
    expect(claimsById.get("big5_precise_career_match")?.status).toBe("forbidden");
    expect(guard.forbiddenClaimBaseline).toEqual(
      expect.arrayContaining([
        "RIASEC precise best-career recommendation",
        "Big Five precise career matching",
        "snapshot recommendation as live personalized recommender",
        "frontend local ranking as recommendation engine",
      ])
    );
  });

  it("documents guard-only recommendation policy and no runtime changes", () => {
    const guard = readJson<RecommendationGuard>(GUARD_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const ruleById = new Map(guard.guardRules.map((rule) => [rule.id, rule]));

    expect(guard.defaults).toMatchObject({
      futureScaleRecommendationEligible: "not_eligible",
      guardMode: "guard_only",
      candidateSignalMeansRecommender: false,
      frontendLocalRankingAuthority: "forbidden",
    });
    expect(ruleById.get("candidate_signal_not_recommender")?.rule).toContain("cannot be rendered");
    expect(ruleById.get("frontend_local_ranking_forbidden")?.rule).toContain("forbidden");
    expect(ruleById.get("snapshot_not_live_personalized")?.rule).toContain("live personalized");
    expect(guard.mustNotChange).toEqual(
      expect.arrayContaining([
        "recommendation runtime",
        "career recommendation bundle",
        "scoring",
        "graph edges",
        "companion links",
        "local recommendation engine",
        "visible recommendation copy",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract-only.");
    expect(doc).toContain("Frontend local ranking is forbidden as recommendation authority.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
