import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARDS_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/uasp-eligibility-guards.md");
const SCHEMA_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const SCALE_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const CLAIM_MATRIX_PATH = path.join(ROOT, "docs/claims/generated/public-claim-boundary-matrix.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1-state.json");

type EligibilityGuards = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  claimCopyChanged: boolean;
  recommendationRuntimeChanged: boolean;
  seoGeoOutputChanged: boolean;
  freemiumRuntimeChanged: boolean;
  sourceArtifacts: string[];
  defaults: Record<string, string>;
  claimGuards: Array<{ id: string; status: string; rule: string; blocksWhen: string }>;
  recommendationGuards: Array<{ id: string; rule: string; requiredProof?: string[]; blocksWhen: string }>;
  seoGeoGuards: Array<{ id: string; rule: string; requiredProof?: string[]; blocksWhen: string }>;
  freemiumGuards: Array<{ id: string; rule: string; requiredProof?: string[]; blocksWhen: string }>;
  firstBatchEligibility: Array<Record<string, string>>;
  mustNotChange: string[];
};

function readGuards(): EligibilityGuards {
  return JSON.parse(fs.readFileSync(GUARDS_PATH, "utf8")) as EligibilityGuards;
}

describe("UASP eligibility guards", () => {
  it("registers PR-UASP-04 after PR-UASP-03 in the UASP train ledger", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("universal-assessment-signal-platform-v1-train");
    expect(byId.get("PR-UASP-03")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP-04")).toMatchObject({
      branch: "codex/pr-uasp-04-eligibility-guards",
      depends_on: ["PR-UASP-03"],
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP-04")?.status);
  });

  it("uses schema-approved defaults and keeps source artifacts present", () => {
    const guards = readGuards();
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")) as {
      defaultsForFutureScale: Record<string, string>;
      enums: Record<string, string[]>;
    };

    expect(guards.version).toBe("uasp.eligibility_guards.v1");
    expect(guards.scope).toBe("PR-UASP-04");
    expect(guards.trainName).toBe("universal-assessment-signal-platform-v1-train");
    expect(guards.dependsOn).toEqual(["PR-UASP-03"]);
    expect(guards.runtimeBehaviorChanged).toBe(false);
    expect(guards.defaults).toMatchObject({
      recommendation_eligible: schema.defaultsForFutureScale.recommendation_eligible,
      seo_geo_eligible: schema.defaultsForFutureScale.seo_geo_eligible,
      freemium_status: schema.defaultsForFutureScale.freemium_status,
      claim_level: schema.defaultsForFutureScale.claim_level,
    });

    for (const [field, value] of Object.entries(guards.defaults)) {
      expect(schema.enums[field]?.includes(value), `${field}: ${value}`).toBe(true);
    }
    for (const artifactPath of guards.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }
  });

  it("keeps forbidden public claim baseline locked", () => {
    const guards = readGuards();
    const claimMatrix = JSON.parse(fs.readFileSync(CLAIM_MATRIX_PATH, "utf8")) as {
      rows: Array<{ id: string; status: string }>;
    };
    const forbiddenRows = new Map(claimMatrix.rows.filter((row) => row.status === "forbidden").map((row) => [row.id, row.status]));

    expect(forbiddenRows.get("riasec_precise_best_career_recommendation")).toBe("forbidden");
    expect(forbiddenRows.get("big5_precise_career_match")).toBe("forbidden");
    expect(forbiddenRows.get("ai_precise_career_planning")).toBe("forbidden");

    expect(guards.claimGuards.map((guard) => guard.id)).toEqual(
      expect.arrayContaining([
        "forbidden_claims_remain_forbidden",
        "riasec_precise_recommender_forbidden",
        "big5_career_matching_forbidden",
        "ai_precise_career_planning_forbidden",
      ])
    );
    for (const guard of guards.claimGuards) {
      expect(guard.status, guard.id).toBe("locked");
      expect(guard.blocksWhen.trim(), guard.id).not.toBe("");
    }
  });

  it("does not convert candidate signals, domain mappings, offer cards, or SKUs into readiness", () => {
    const guards = readGuards();
    const recommendation = new Map(guards.recommendationGuards.map((guard) => [guard.id, guard]));
    const seo = new Map(guards.seoGeoGuards.map((guard) => [guard.id, guard]));
    const freemium = new Map(guards.freemiumGuards.map((guard) => [guard.id, guard]));

    expect(recommendation.get("candidate_signal_not_recommender")?.rule).toContain("not a recommender");
    expect(recommendation.get("eligible_with_guard_requires_proof")?.requiredProof).toEqual([
      "visible_evidence",
      "graph_or_backend_runtime",
      "claim_boundary",
      "public_runtime_consumer",
    ]);
    expect(seo.get("llms_full_requires_evidence_claim_authority")?.requiredProof).toEqual([
      "visible_evidence",
      "claim_boundary",
      "source_authority",
      "discoverability_authority",
    ]);
    expect(freemium.get("full_loop_requires_parity_proof")?.requiredProof).toContain("checkout");
    expect(freemium.get("offer_card_not_full_loop")?.rule).toContain("not proof of full loop");
    expect(freemium.get("backend_sku_not_public_funnel")?.rule).toContain("not proof of public funnel");
  });

  it("keeps first-batch eligibility consistent with existing scale mappings", () => {
    const guards = readGuards();
    const scaleRegistry = JSON.parse(fs.readFileSync(SCALE_REGISTRY_PATH, "utf8")) as {
      entries: Array<Record<string, string>>;
    };
    const byScale = new Map(scaleRegistry.entries.map((entry) => [entry.scale_code, entry]));

    for (const row of guards.firstBatchEligibility) {
      const mapped = byScale.get(row.scale_code);
      expect(mapped, row.scale_code).toBeDefined();
      expect(row.claim_level, row.scale_code).toBe(mapped?.claim_level);
      expect(row.recommendation_eligible, row.scale_code).toBe(mapped?.recommendation_eligible);
      expect(row.seo_geo_eligible, row.scale_code).toBe(mapped?.seo_geo_eligible);
      expect(row.freemium_status, row.scale_code).toBe(mapped?.freemium_status);
    }
    expect(guards.firstBatchEligibility.find((row) => row.scale_code === "RIASEC")?.guardStatus).toBe(
      "candidate_signal_not_recommender"
    );
  });

  it("documents guards without changing runtime behavior", () => {
    const guards = readGuards();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(guards.claimCopyChanged).toBe(false);
    expect(guards.recommendationRuntimeChanged).toBe(false);
    expect(guards.seoGeoOutputChanged).toBe(false);
    expect(guards.freemiumRuntimeChanged).toBe(false);
    expect(guards.mustNotChange).toEqual(
      expect.arrayContaining([
        "public copy",
        "runtime claims",
        "recommendation runtime",
        "SEO/GEO output",
        "freemium runtime",
        "payment/report access",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("candidate_signal does not equal recommender");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
