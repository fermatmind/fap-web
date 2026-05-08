import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/self-understanding-surface-metadata-policy.v1.json"
);
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/self-understanding-surface-metadata-policy.md");
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

type PolicyArtifact = {
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
  sourceArtifacts: string[];
  allowedSignals: Array<{ scale_code: string; role: string; policy: string }>;
  surfaceCandidates: Array<{
    surface: string;
    route: string;
    componentEvidence: string[];
    status: string;
    runtimeRecommendation: string;
    policy: string;
  }>;
  guardRules: string[];
  claimBoundaries: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("self-understanding existing surface metadata policy", () => {
  it("depends on PR-4B-02 and records PR-4B-03 train state", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string; merge_sha?: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    const pr4b02 = byId.get("PR-4B-02");
    expect(pr4b02).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/743",
    });
    expect(pr4b02?.merge_sha).toMatch(/^[0-9a-f]{40}$/);

    const pr4b03 = byId.get("PR-4B-03");
    expect(pr4b03).toMatchObject({
      branch: "codex/pr-4b-03-self-understanding-surface-metadata-policy",
      depends_on: ["PR-4B-02"],
    });
    expect(["in_progress", "merged"]).toContain(pr4b03?.status);
  });

  it("defines self_understanding as existing-surface-only metadata policy", () => {
    const artifact = readJson<PolicyArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("decision_domain.self_understanding_surface_metadata_policy.v1");
    expect(artifact.scope).toBe("PR-4B-03");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-train");
    expect(artifact.dependsOn).toEqual(["PR-4B-02"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.domain).toBe("self_understanding");
    expect(artifact.runtimeReadiness).toBe("partial");
    expect(artifact.runtimeRecommendation).toBe("existing_result_report_only");
    expect(artifact.phase4bDecision).toContain("no runtime surface changes");
    expect(artifact.statusEnum).toEqual(STATUS_ENUM);
    expect(artifact.runtimeRecommendationEnum).toEqual(RUNTIME_RECOMMENDATION_ENUM);
  });

  it("locks approved signal roles without making RIASEC primary", () => {
    const artifact = readJson<PolicyArtifact>(ARTIFACT_PATH);
    const roleBySignal = new Map(artifact.allowedSignals.map((signal) => [signal.scale_code, signal.role]));

    expect(roleBySignal.get("MBTI")).toBe("primary");
    expect(roleBySignal.get("BIG5_OCEAN")).toBe("primary");
    expect(roleBySignal.get("ENNEAGRAM")).toBe("supporting");
    expect(roleBySignal.get("RIASEC")).toBe("supporting");
    expect(artifact.allowedSignals.find((signal) => signal.scale_code === "RIASEC")?.policy).toContain("not primary");
  });

  it("covers only existing surfaces with evidence paths that exist", () => {
    const artifact = readJson<PolicyArtifact>(ARTIFACT_PATH);

    expect(artifact.surfaceCandidates.map((surface) => surface.surface)).toEqual([
      "result_report",
      "personality_detail",
      "topic_detail",
      "article_detail",
      "test_detail",
    ]);
    for (const surface of artifact.surfaceCandidates) {
      expect(["partial", "safe_to_defer"]).toContain(surface.status);
      expect(RUNTIME_RECOMMENDATION_ENUM).toContain(surface.runtimeRecommendation);
      expect(surface.policy).toContain("no");
      for (const evidence of surface.componentEvidence) {
        expect(fs.existsSync(path.join(ROOT, evidence)), evidence).toBe(true);
      }
    }
  });

  it("forbids hubs, routes, copy, CTA, SEO/GEO expansion, and frontend fallback authority", () => {
    const artifact = readJson<PolicyArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.guardRules).toEqual(
      expect.arrayContaining([
        "no_new_hub",
        "no_new_public_route",
        "no_visible_copy",
        "no_visible_domain_badge",
        "no_new_cta",
        "no_seo_geo_expansion",
        "no_sitemap_llms_url_set_change",
        "frontend_fallback_not_domain_authority",
      ])
    );
    expect(artifact.claimBoundaries).toEqual([
      "no determinism",
      "no diagnosis",
      "no destiny framing",
      "no personality entertainment framing",
    ]);
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "personality pages",
        "topic pages",
        "test pages",
        "article pages",
        "result/report runtime",
        "CTA runtime",
        "SEO metadata",
        "sitemap output",
        "llms output",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("No new hub");
    expect(doc).toContain("No new public route");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
