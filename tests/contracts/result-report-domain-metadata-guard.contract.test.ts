import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/result-report-domain-metadata-guard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/result-report-domain-metadata-guard.md");
const ENVELOPE_PATH = path.join(ROOT, "docs/assessment/domains/generated/decision-domain-runtime-metadata-envelope.v1.json");
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

type GuardArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  envelopeArtifact: string;
  runtimePayloadEnvelopeAvailable: boolean;
  actualRuntimeAttributesAdded: boolean;
  visibleCopyAdded: boolean;
  statusEnum: string[];
  runtimeRecommendationEnum: string[];
  reservedDataAttributes: Array<{
    attribute: string;
    status: string;
    allowedOnlyWhen: string;
    frontendArtifactInferenceAllowed: boolean;
  }>;
  surfaces: Array<{
    surface: string;
    status: string;
    runtimeRecommendation: string;
    dataAttributes: string;
    domainSupport?: string[];
    componentEvidence: string[];
  }>;
  guardRules: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("result/report decision domain metadata guard", () => {
  it("depends on PR-4B-01 and updates train state for PR-4B-02", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string; merge_sha?: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-4B-01")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/742",
    });
    const pr4b02 = byId.get("PR-4B-02");
    expect(pr4b02).toMatchObject({
      branch: "codex/pr-4b-02-result-report-domain-metadata-guard",
      depends_on: ["PR-4B-01"],
    });
    expect(["in_progress", "merged"]).toContain(pr4b02?.status);
    if (pr4b02?.status === "merged") {
      expect(pr4b02.pr_url).toBe("https://github.com/fermatmind/fap-web/pull/743");
      expect(pr4b02.merge_sha).toMatch(/^[0-9a-f]{40}$/);
    }
  });

  it("defines a contract-only guard and approved enums", () => {
    const artifact = readJson<GuardArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("decision_domain.result_report_metadata_guard.v1");
    expect(artifact.scope).toBe("PR-4B-02");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-train");
    expect(artifact.dependsOn).toEqual(["PR-4B-01"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_only_deferred_data_attributes");
    expect(artifact.statusEnum).toEqual(STATUS_ENUM);
    expect(artifact.runtimeRecommendationEnum).toEqual(RUNTIME_RECOMMENDATION_ENUM);
    expect(fs.existsSync(path.join(ROOT, artifact.envelopeArtifact))).toBe(true);
    expect(fs.existsSync(ENVELOPE_PATH)).toBe(true);
  });

  it("defers data attributes unless a runtime payload carries decision_domain_v1", () => {
    const artifact = readJson<GuardArtifact>(ARTIFACT_PATH);

    expect(artifact.runtimePayloadEnvelopeAvailable).toBe(false);
    expect(artifact.actualRuntimeAttributesAdded).toBe(false);
    expect(artifact.visibleCopyAdded).toBe(false);
    expect(artifact.reservedDataAttributes.map((entry) => entry.attribute)).toEqual([
      "data-domain-id",
      "data-domain-role",
      "data-domain-envelope-state",
    ]);
    for (const attribute of artifact.reservedDataAttributes) {
      expect(attribute.status).toBe("safe_to_defer");
      expect(attribute.allowedOnlyWhen).toContain("runtime payload");
      expect(attribute.frontendArtifactInferenceAllowed).toBe(false);
    }
    for (const surface of artifact.surfaces) {
      expect(surface.dataAttributes).toBe("safe_to_defer");
      expect(STATUS_ENUM).toContain(surface.status);
      expect(RUNTIME_RECOMMENDATION_ENUM).toContain(surface.runtimeRecommendation);
    }
  });

  it("covers required result/report surfaces without creating visible copy or runtime authority", () => {
    const artifact = readJson<GuardArtifact>(ARTIFACT_PATH);
    const surfaces = artifact.surfaces.map((surface) => surface.surface);

    expect(surfaces).toEqual([
      "result_report_page",
      "mbti_result_report",
      "big5_result_report",
      "enneagram_result_report",
      "riasec_result_report",
    ]);
    expect(artifact.surfaces.find((surface) => surface.surface === "riasec_result_report")).toMatchObject({
      status: "dangerous_if_integrated",
      runtimeRecommendation: "existing_cta_guard_only",
    });
    for (const surface of artifact.surfaces) {
      for (const evidence of surface.componentEvidence) {
        expect(fs.existsSync(path.join(ROOT, evidence)), evidence).toBe(true);
      }
    }
  });

  it("locks no-runtime-change and no-visible-copy rules", () => {
    const artifact = readJson<GuardArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.guardRules).toEqual(
      expect.arrayContaining([
        "no_visible_badge",
        "no_translated_copy",
        "no_result_report_layout_change",
        "no_report_prose_change",
        "no_paywall_copy_change",
        "no_entitlement_change",
        "no_profile_write",
        "no_recommendation_trigger",
        "no_seo_geo_exposure_change",
        "no_frontend_artifact_synthesis_as_authority",
      ])
    );
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "result/report layout",
        "result/report visible copy",
        "paywall copy",
        "report entitlement",
        "PDF output",
        "API clients",
        "profile runtime",
        "recommendation runtime",
        "SEO/GEO output",
        "freemium runtime",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("does not yet carry a payload-backed `decision_domain_v1` envelope");
    expect(doc).toContain("This PR does not touch `app/`, `components/`, runtime adapters");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
