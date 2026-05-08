import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/decision-domain-runtime-metadata-envelope.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/decision-domain-runtime-metadata-envelope.md");
const TRAIN_MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train-4b.yaml");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-4b-state.json");
const CDD_DASHBOARD_PATH = path.join(ROOT, "docs/assessment/domains/generated/core-decision-domain-readiness-dashboard.v1.json");

const DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];
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

type EnvelopeArtifact = {
  version: string;
  scope: string;
  trainName: string;
  envelopeKey: string;
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domains: string[];
  statusEnum: string[];
  runtimeRecommendationEnum: string[];
  envelopeFields: string[];
  readOnlyRules: string[];
  authorityPolicy: Record<string, boolean>;
  sourceArtifacts: string[];
  entries: Array<{
    domain_id: string;
    signal_roles: Array<{ scale_code: string; role: string }>;
    claim_boundary: string[];
    runtime_recommendation: string;
    runtime_status: string;
    readiness_status: string;
    profile_policy: string;
    seo_geo_policy: string;
    cta_policy: string;
    frontend_fallback_policy: string;
  }>;
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("decision_domain_v1 runtime metadata envelope", () => {
  it("registers the Phase 4B train identity and PR-4B-01 state", () => {
    const manifest = fs.readFileSync(TRAIN_MANIFEST_PATH, "utf8");
    const state = readJson<{
      train_name: string;
      pr_namespace: string;
      policy: Record<string, boolean>;
      prs: Array<{ id: string; branch: string; status: string; depends_on: string[]; pr_url?: string; merge_sha?: string }>;
    }>(TRAIN_STATE_PATH);

    expect(manifest).toContain("train_name: domain-runtime-metadata-integration-train");
    expect(manifest).toContain("pr_namespace: PR-4B-*");
    expect(state.train_name).toBe("domain-runtime-metadata-integration-train");
    expect(state.pr_namespace).toBe("PR-4B-*");
    expect(state.policy.artifact_json_contract_only).toBe(true);
    expect(state.policy.runtime_behavior_changed).toBe(false);
    expect(state.prs.map((pr) => pr.id)).toEqual(["PR-4B-01", "PR-4B-02", "PR-4B-03", "PR-4B-04", "PR-4B-05", "PR-4B-06"]);
    const pr4b01 = state.prs[0];
    expect(pr4b01).toMatchObject({
      id: "PR-4B-01",
      branch: "codex/pr-4b-01-decision-domain-metadata-envelope",
      depends_on: [],
    });
    expect(["in_progress", "merged"]).toContain(pr4b01.status);
    if (pr4b01.status === "merged") {
      expect(pr4b01.pr_url).toBe("https://github.com/fermatmind/fap-web/pull/742");
      expect(pr4b01.merge_sha).toMatch(/^[0-9a-f]{40}$/);
    }
  });

  it("defines exactly the approved domain envelope fields, domains, and status enums", () => {
    const artifact = readJson<EnvelopeArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("decision_domain.runtime_metadata_envelope.v1");
    expect(artifact.scope).toBe("PR-4B-01");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-train");
    expect(artifact.envelopeKey).toBe("decision_domain_v1");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_only");
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.entries.map((entry) => entry.domain_id)).toEqual(DOMAINS);
    expect(artifact.statusEnum).toEqual(STATUS_ENUM);
    expect(artifact.runtimeRecommendationEnum).toEqual(RUNTIME_RECOMMENDATION_ENUM);
    expect(artifact.envelopeFields).toEqual([
      "domain_id",
      "domain_role",
      "user_problem",
      "signal_roles",
      "claim_boundary",
      "evidence_requirement",
      "cta_policy",
      "report_value_status",
      "seo_geo_policy",
      "profile_policy",
      "runtime_recommendation",
      "runtime_status",
      "readiness_status",
      "version",
      "source_authority",
      "frontend_fallback_policy",
      "rollback_policy",
    ]);
  });

  it("preserves the Phase 4B readiness decisions from the dashboard", () => {
    const artifact = readJson<EnvelopeArtifact>(ARTIFACT_PATH);
    const dashboard = readJson<{
      dashboard: Array<{ domain_id: string; runtime_readiness: string }>;
    }>(CDD_DASHBOARD_PATH);
    const envelopeByDomain = new Map(artifact.entries.map((entry) => [entry.domain_id, entry]));
    const readinessByDomain = new Map(dashboard.dashboard.map((entry) => [entry.domain_id, entry.runtime_readiness]));

    expect(envelopeByDomain.get("self_understanding")).toMatchObject({
      runtime_status: "partial",
      runtime_recommendation: "existing_result_report_only",
      readiness_status: "ready_for_metadata_only",
    });
    expect(envelopeByDomain.get("career_decision")).toMatchObject({
      runtime_status: "dangerous_if_integrated",
      runtime_recommendation: "existing_cta_guard_only",
      readiness_status: "partial",
    });
    expect(envelopeByDomain.get("workstyle_decision")).toMatchObject({
      runtime_status: "artifact_only",
      runtime_recommendation: "data_attribute_only",
      readiness_status: "ready_for_metadata_only",
    });
    expect(readinessByDomain.get("self_understanding")).toBe("partial");
    expect(readinessByDomain.get("career_decision")).toBe("dangerous_if_expanded");
    expect(readinessByDomain.get("workstyle_decision")).toBe("artifact_only");
  });

  it("locks domain boundaries and prevents recommendation, profile, SEO/GEO, CTA, and freemium triggers", () => {
    const artifact = readJson<EnvelopeArtifact>(ARTIFACT_PATH);
    const byDomain = new Map(artifact.entries.map((entry) => [entry.domain_id, entry]));

    expect(byDomain.get("self_understanding")?.claim_boundary).toEqual(
      expect.arrayContaining(["no determinism", "no diagnosis", "no destiny framing", "no personality entertainment framing"])
    );
    expect(byDomain.get("career_decision")?.claim_boundary).toEqual(
      expect.arrayContaining([
        "no precise recommender",
        "no best-career prediction",
        "no success guarantee",
        "no Big Five/RIASEC career matcher",
        "no AI planning claim",
        "no snapshot recommendation equals personalized recommender",
      ])
    );
    expect(byDomain.get("workstyle_decision")?.claim_boundary).toEqual(
      expect.arrayContaining(["no employment suitability", "no workplace performance prediction", "no HR screening claim", "no Big Five career matching"])
    );

    for (const entry of artifact.entries) {
      expect(STATUS_ENUM).toContain(entry.runtime_status);
      expect(STATUS_ENUM).toContain(entry.readiness_status);
      expect(RUNTIME_RECOMMENDATION_ENUM).toContain(entry.runtime_recommendation);
      expect(entry.profile_policy).toContain("does not imply profile write");
      expect(entry.seo_geo_policy).toMatch(/No SEO\/GEO expansion|Guard-only/);
      expect(entry.cta_policy).not.toMatch(/new runtime CTA/i);
      expect(entry.frontend_fallback_policy).toContain("forbidden");
    }
  });

  it("is contract-only and does not authorize runtime imports or behavior changes", () => {
    const artifact = readJson<EnvelopeArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }
    expect(artifact.authorityPolicy).toMatchObject({
      backendAuthorityPreferred: true,
      cmsAuthorityAllowed: true,
      artifactGovernedUntilRuntimeSourceExists: true,
      frontendArtifactPermanentAuthority: false,
      frontendFallbackPermanentAuthority: false,
    });
    expect(artifact.readOnlyRules).toEqual(
      expect.arrayContaining([
        "metadata_only",
        "no_new_domain_hub_page",
        "no_new_public_route",
        "no_runtime_cta",
        "no_recommendation_trigger",
        "no_profile_write",
        "no_seo_geo_exposure_change",
        "no_sitemap_llms_url_set_change",
      ])
    );
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "app routes",
        "components runtime",
        "runtime payloads",
        "result/report UI",
        "recommendation runtime",
        "profile runtime",
        "freemium runtime",
        "checkout/payment",
        "report entitlement",
        "scoring",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract-only");
    expect(doc).toContain("It does not import the envelope into `app/`, `components/`, or runtime `lib/` code.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
