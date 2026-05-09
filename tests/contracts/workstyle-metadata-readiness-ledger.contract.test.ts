import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/workstyle-metadata-readiness-ledger.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/workstyle-metadata-readiness-ledger.md");
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
const ROLE_ENUM = ["primary", "secondary", "supporting", "future", "blocked"];

type ReadinessLedgerArtifact = {
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
  signalRoles: Array<{ scale_code: string; role: string; boundary: string }>;
  deferredDataAttributes: string[];
  deferredDataAttributesPolicy: string;
  surfaceLedger: Array<{
    surface: string;
    route: string;
    componentEvidence: string[];
    status: string;
    runtimeRecommendation: string;
    guardPolicy: string;
  }>;
  surfaceLedgerNote: string;
  guardRules: string[];
  forbiddenClaims: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("workstyle metadata readiness ledger", () => {
  it("depends on PR-4B-04 and records PR-4B-05 train state", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string; merge_sha?: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    const pr4b04 = byId.get("PR-4B-04");
    expect(pr4b04).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/745",
    });
    expect(pr4b04?.merge_sha).toMatch(/^[0-9a-f]{40}$/);

    const pr4b05 = byId.get("PR-4B-05");
    expect(pr4b05).toMatchObject({
      branch: "codex/pr-4b-05-workstyle-metadata-readiness-ledger",
      depends_on: ["PR-4B-04"],
    });
    expect(["in_progress", "merged"]).toContain(pr4b05?.status);
  });

  it("keeps Workstyle Decision artifact_only and data_attribute_only", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("decision_domain.workstyle_metadata_readiness_ledger.v1");
    expect(artifact.scope).toBe("PR-4B-05");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-train");
    expect(artifact.dependsOn).toEqual(["PR-4B-04"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_ledger_only");
    expect(artifact.domain).toBe("workstyle_decision");
    expect(artifact.runtimeReadiness).toBe("artifact_only");
    expect(artifact.runtimeRecommendation).toBe("data_attribute_only");
    expect(artifact.phase4bDecision).toContain("deferred");
    expect(artifact.statusEnum).toEqual(STATUS_ENUM);
    expect(artifact.runtimeRecommendationEnum).toEqual(RUNTIME_RECOMMENDATION_ENUM);
  });

  it("locks signal roles: Big Five primary, MBTI secondary, Enneagram supporting, RIASEC blocked", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);
    const bySignal = new Map(artifact.signalRoles.map((signal) => [signal.scale_code, signal]));
    const expectedRoles = [
      ["BIG5_OCEAN", "primary"],
      ["MBTI", "secondary"],
      ["ENNEAGRAM", "supporting"],
      ["RIASEC", "blocked"],
      ["future_DISC", "future"],
      ["future_EQ", "future"],
      ["future_career_values", "blocked"],
      ["future_ability_tests", "blocked"],
    ] as const;
    for (const [scaleCode, role] of expectedRoles) {
      expect(bySignal.get(scaleCode)).toMatchObject({ role });
    }
    for (const signal of artifact.signalRoles) {
      expect(ROLE_ENUM).toContain(signal.role);
    }
  });

  it("locks Big Five, MBTI, and Enneagram boundaries", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);
    const bySignal = new Map(artifact.signalRoles.map((signal) => [signal.scale_code, signal]));

    expect(bySignal.get("BIG5_OCEAN")).toMatchObject({
      role: "primary",
      boundary: "trait/workstyle explanation only; not employment suitability",
    });
    expect(bySignal.get("MBTI")).toMatchObject({
      role: "secondary",
      boundary: "identity/preference explanation only; not workplace performance",
    });
    expect(bySignal.get("ENNEAGRAM")).toMatchObject({
      role: "supporting",
      boundary: "motivation/team-pattern explanation only; not HR screening",
    });
    expect(bySignal.get("RIASEC")).toMatchObject({
      role: "blocked",
      boundary: "cannot enter workstyle_decision",
    });
  });

  it("contains no existing surfaces: workstyle has no public module", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);

    expect(artifact.surfaceLedger).toEqual([]);
    expect(artifact.surfaceLedgerNote).toContain("No workstyle public module");
  });

  it("deferrs data attributes until payload-backed metadata exists", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);

    expect(artifact.deferredDataAttributes).toEqual([
      "data-domain-id",
      "data-domain-role",
      "data-domain-envelope-state",
    ]);
    expect(artifact.deferredDataAttributesPolicy).toContain("frontend artifact inference");
    expect(artifact.deferredDataAttributesPolicy).toContain("backend/CMS/runtime payload");
  });

  it("forbids employment suitability, HR screening, workplace prediction, and Big Five career matching", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.guardRules).toEqual(
      expect.arrayContaining([
        "no_workstyle_public_module",
        "no_workstyle_public_page",
        "no_workstyle_public_route",
        "no_workplace_performance_prediction",
        "no_employment_suitability",
        "no_hr_screening_claim",
        "no_big_five_career_matching",
        "no_new_cta",
        "no_cta_copy_change",
        "no_seo_geo_expansion",
        "no_sitemap_llms_url_set_change",
        "no_recommendation_trigger",
        "no_profile_write",
        "no_freemium_domain_bundle",
        "no_scoring_change",
        "data_attributes_deferred_until_payload_backed_metadata",
        "frontend_fallback_not_domain_authority",
      ])
    );
    expect(artifact.forbiddenClaims).toEqual(
      expect.arrayContaining([
        "employment suitability",
        "workplace performance prediction",
        "HR screening claim",
        "Big Five career matching",
        "precise workplace recommendation",
        "team placement guarantee",
        "leadership prediction",
        "communication style diagnosis",
      ])
    );
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "result/report runtime",
        "personality surfaces",
        "test surfaces",
        "career surfaces",
        "CTA runtime",
        "recommendation runtime",
        "profile runtime",
        "freemium runtime",
        "checkout/payment",
        "report entitlement",
        "SEO/GEO output",
        "scoring",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("`workstyle_decision` remains `artifact_only`");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });

  it("forbids runtime surface changes", () => {
    const artifact = readJson<ReadinessLedgerArtifact>(ARTIFACT_PATH);

    expect(artifact.guardRules).toEqual(
      expect.arrayContaining([
        "no_result_report_layout_change",
        "no_report_entitlement_change",
        "no_checkout_payment_change",
      ])
    );
    // No CTA, recommendation, or profile runtime changes
    for (const rule of ["no_new_cta", "no_recommendation_trigger", "no_profile_write"]) {
      expect(artifact.guardRules).toContain(rule);
    }
  });
});
