import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-runtime-readiness-dashboard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/domain-runtime-readiness-dashboard.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-4b-state.json");

const DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];
const RUNTIME_READINESS = [
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
const RUNTIME_RECOMMENDATION = [
  "no_runtime",
  "metadata_only",
  "data_attribute_only",
  "existing_surface_only",
  "existing_result_report_only",
  "existing_cta_guard_only",
  "future_runtime_candidate",
  "blocked",
];

type DashboardEntry = {
  domain_id: string;
  runtime_readiness: string;
  runtime_recommendation: string;
  phase_4b_decision: string;
  no_hub?: boolean;
  no_visible_copy?: boolean;
  no_recommender?: boolean;
  no_new_runtime?: boolean;
  no_public_module?: boolean;
  data_attributes_deferred?: boolean;
  signals: Array<{ scale_code: string; role: string }>;
  allowed_surfaces: string[];
  source_prs: string[];
  human_decision_required: string[];
};

type DashboardArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domains: string[];
  phase: string;
  runtimeReadinessEnum: string[];
  runtimeRecommendationEnum: string[];
  dashboard: DashboardEntry[];
  blockedAreas: string[];
  trainCompletion: Record<string, string>;
  nextPhaseRecommendation: {
    phase: string;
    decision: string;
    recommended_next_safe_step: string;
    runtime_changes_allowed_now: boolean;
  };
  mustNotChange: string[];
};

function readArtifact(): DashboardArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DashboardArtifact;
}

describe("domain runtime readiness dashboard", () => {
  it("depends on PR-4B-05 and records PR-4B-06 train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string; merge_sha?: string }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    const pr4b05 = byId.get("PR-4B-05");
    expect(pr4b05).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/746",
    });
    expect(pr4b05?.merge_sha).toMatch(/^[0-9a-f]{40}$/);

    const pr4b06 = byId.get("PR-4B-06");
    expect(pr4b06).toMatchObject({
      branch: "codex/pr-4b-06-final-runtime-readiness-dashboard",
      depends_on: ["PR-4B-05"],
    });
    expect(["in_progress", "merged"]).toContain(pr4b06?.status);
  });

  it("defines final Phase 4B dashboard for all three domains with correct enums", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("decision_domain.runtime_readiness_dashboard.v1");
    expect(artifact.scope).toBe("PR-4B-06");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-train");
    expect(artifact.dependsOn).toEqual(["PR-4B-05"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.phase).toBe("Phase 4B");
    expect(artifact.runtimeReadinessEnum).toEqual(RUNTIME_READINESS);
    expect(artifact.runtimeRecommendationEnum).toEqual(RUNTIME_RECOMMENDATION);
    expect(artifact.dashboard.map((entry) => entry.domain_id)).toEqual(DOMAINS);

    for (const entry of artifact.dashboard) {
      expect(RUNTIME_READINESS).toContain(entry.runtime_readiness);
      expect(RUNTIME_RECOMMENDATION).toContain(entry.runtime_recommendation);
      expect(entry.signals.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.human_decision_required.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.source_prs.length, entry.domain_id).toBeGreaterThan(0);
    }
  });

  it("locks self_understanding as partial, existing_result_report_only", () => {
    const byDomain = new Map(readArtifact().dashboard.map((entry) => [entry.domain_id, entry]));
    const su = byDomain.get("self_understanding")!;

    expect(su).toMatchObject({
      domain_id: "self_understanding",
      runtime_readiness: "partial",
      runtime_recommendation: "existing_result_report_only",
      no_hub: true,
      no_visible_copy: true,
    });
    expect(su.phase_4b_decision).toContain("metadata-only");
    expect(su.allowed_surfaces).toEqual(
      expect.arrayContaining(["result_report", "personality_detail", "topic_detail", "article_detail", "test_detail"])
    );
    expect(su.source_prs).toEqual(expect.arrayContaining(["PR-4B-01", "PR-4B-02", "PR-4B-03"]));
    expect(su.signals.map((s) => s.scale_code)).toEqual(
      expect.arrayContaining(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "RIASEC"])
    );
    expect(su.human_decision_required).toEqual(
      expect.arrayContaining(["visible domain copy policy", "domain-owned CTA policy", "domain runtime IA"])
    );
  });

  it("locks career_decision as dangerous_if_integrated, existing_cta_guard_only", () => {
    const byDomain = new Map(readArtifact().dashboard.map((entry) => [entry.domain_id, entry]));
    const cd = byDomain.get("career_decision")!;

    expect(cd).toMatchObject({
      domain_id: "career_decision",
      runtime_readiness: "dangerous_if_integrated",
      runtime_recommendation: "existing_cta_guard_only",
      no_recommender: true,
      no_new_runtime: true,
    });
    expect(cd.phase_4b_decision).toContain("guard ledger only");
    expect(cd.phase_4b_decision).toContain("no recommender");
    expect(cd.allowed_surfaces).toEqual(
      expect.arrayContaining(["career_job_detail", "mbti_career_recommendation", "result_report_career_adjacent", "riasec_result_report"])
    );
    expect(cd.source_prs).toEqual(expect.arrayContaining(["PR-4B-01", "PR-4B-02", "PR-4B-04"]));
    expect(cd.signals.map((s) => s.scale_code)).toEqual(
      expect.arrayContaining(["RIASEC", "MBTI", "BIG5_OCEAN", "Career Graph"])
    );
    expect(cd.human_decision_required).toEqual(
      expect.arrayContaining([
        "career decision runtime framing",
        "recommendation boundary approval",
        "career evidence and explainability policy",
      ])
    );
  });

  it("locks workstyle_decision as artifact_only, data_attribute_only, deferred", () => {
    const byDomain = new Map(readArtifact().dashboard.map((entry) => [entry.domain_id, entry]));
    const ws = byDomain.get("workstyle_decision")!;

    expect(ws).toMatchObject({
      domain_id: "workstyle_decision",
      runtime_readiness: "artifact_only",
      runtime_recommendation: "data_attribute_only",
      no_public_module: true,
      data_attributes_deferred: true,
    });
    expect(ws.phase_4b_decision).toContain("deferred");
    expect(ws.allowed_surfaces).toEqual([]);
    expect(ws.source_prs).toEqual(expect.arrayContaining(["PR-4B-01", "PR-4B-02", "PR-4B-05"]));
    expect(ws.signals.map((s) => s.scale_code)).toEqual(
      expect.arrayContaining(["BIG5_OCEAN", "MBTI", "ENNEAGRAM", "RIASEC"])
    );
    // RIASEC blocked for workstyle
    const riasec = ws.signals.find((s) => s.scale_code === "RIASEC");
    expect(riasec).toMatchObject({ role: "blocked" });
    // Future signals present
    expect(ws.signals.map((s) => s.scale_code)).toEqual(
      expect.arrayContaining(["future_DISC", "future_EQ"])
    );
  });

  it("lists all blocked areas", () => {
    const artifact = readArtifact();

    expect(artifact.blockedAreas).toEqual(
      expect.arrayContaining([
        "new domain hub pages",
        "public decision routes",
        "domain-owned CTA runtime",
        "SEO/GEO expansion",
        "sitemap/llms widening",
        "generalized recommendation runtime",
        "RIASEC recommender",
        "Big Five career matcher",
        "profile memory writes",
        "saved careers promotion",
        "domain freemium bundle",
        "checkout/payment changes",
        "visible domain copy",
        "new tests",
        "new scale onboarding",
        "Topic Graph expansion",
        "Career pSEO",
      ])
    );
  });

  it("marks train completion and Phase 4C gate", () => {
    const artifact = readArtifact();

    expect(artifact.trainCompletion).toEqual({
      "PR-4B-01_decision_domain_metadata_envelope": "ready",
      "PR-4B-02_result_report_domain_metadata_guard": "ready",
      "PR-4B-03_self_understanding_surface_metadata_policy": "ready",
      "PR-4B-04_career_decision_surface_guard_ledger": "ready",
      "PR-4B-05_workstyle_metadata_readiness_ledger": "ready",
      "PR-4B-06_final_runtime_readiness_dashboard": "ready",
    });
    expect(artifact.nextPhaseRecommendation).toMatchObject({
      phase: "Phase 4C",
      recommended_next_safe_step: expect.stringContaining("Phase 4B verification scan"),
      runtime_changes_allowed_now: false,
    });
  });

  it("forbids runtime changes and documents no-runtime-change position", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "domain hub pages",
        "public routes",
        "visible domain copy",
        "CTA runtime",
        "recommendation runtime",
        "profile memory",
        "freemium runtime",
        "saved careers promotion",
        "SEO/GEO output",
        "sitemap generation",
        "llms generation",
        "llms-full generation",
        "domain freemium bundle",
        "checkout/payment",
        "report entitlement",
        "scoring",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Phase 4C should not start unless humans approve");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
