import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const GUARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/seo-geo-eligibility-guard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/seo-geo-eligibility-guard.md");
const UASP_ELIGIBILITY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json");
const REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const DISCOVERABILITY_PATH = path.join(ROOT, "docs/seo/generated/discoverability-authority-matrix.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp2b-state.json");

type SeoGeoGuard = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  sitemapOutputChanged: boolean;
  llmsOutputChanged: boolean;
  llmsFullOutputChanged: boolean;
  jsonLdOutputChanged: boolean;
  metadataOutputChanged: boolean;
  canonicalHreflangChanged: boolean;
  sourceArtifacts: string[];
  runtimeOwners: Array<{ surface: string; owner: string; evidence: string[] }>;
  guardRules: Array<{ id: string; rule: string; requiredProof?: string[]; blocksWhen: string }>;
  firstBatchSeoGeoStatus: Array<{
    scale_code: string;
    seo_geo_eligible: string;
    guardStatus: string;
    runtimeExposureChange: string;
  }>;
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("UASP SEO/GEO eligibility guard", () => {
  it("registers PR-UASP2B-03 after result/report metadata guard", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; mode: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-UASP2B-02")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP2B-03")).toMatchObject({
      branch: "codex/pr-uasp2b-03-seo-geo-eligibility-guard",
      depends_on: ["PR-UASP2B-02"],
      mode: "contract_only",
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP2B-03")?.status);
  });

  it("is contract-only and records zero discoverability output changes", () => {
    const guard = readJson<SeoGeoGuard>(GUARD_PATH);

    expect(guard.version).toBe("uasp.seo_geo_eligibility_guard.v1");
    expect(guard.scope).toBe("PR-UASP2B-03");
    expect(guard.trainName).toBe("uasp-runtime-metadata-integration-train");
    expect(guard.dependsOn).toEqual(["PR-UASP2B-02"]);
    expect(guard.runtimeBehaviorChanged).toBe(false);
    expect(guard.executionMode).toBe("contract_only");
    expect(guard.sitemapOutputChanged).toBe(false);
    expect(guard.llmsOutputChanged).toBe(false);
    expect(guard.llmsFullOutputChanged).toBe(false);
    expect(guard.jsonLdOutputChanged).toBe(false);
    expect(guard.metadataOutputChanged).toBe(false);
    expect(guard.canonicalHreflangChanged).toBe(false);
  });

  it("keeps source artifacts and runtime owner evidence present", () => {
    const guard = readJson<SeoGeoGuard>(GUARD_PATH);

    for (const artifactPath of guard.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }

    expect(fs.existsSync(UASP_ELIGIBILITY_PATH)).toBe(true);
    expect(fs.existsSync(DISCOVERABILITY_PATH)).toBe(true);
    expect(guard.runtimeOwners.map((owner) => owner.surface)).toEqual(["sitemap", "llms", "llms_full"]);
    for (const owner of guard.runtimeOwners) {
      expect(owner.owner).toBe("existing_discoverability_runtime");
      for (const evidencePath of owner.evidence) {
        expect(fs.existsSync(path.join(ROOT, evidencePath)), evidencePath).toBe(true);
      }
    }
  });

  it("inherits UASP SEO/GEO proof requirements without widening exposure", () => {
    const guard = readJson<SeoGeoGuard>(GUARD_PATH);
    const uaspEligibility = readJson<{
      seoGeoGuards: Array<{ id: string; requiredProof?: string[] }>;
    }>(UASP_ELIGIBILITY_PATH);
    const ruleById = new Map(guard.guardRules.map((rule) => [rule.id, rule]));

    expect(ruleById.get("not_eligible_is_not_public_ready")?.blocksWhen).toContain("not_eligible");
    expect(ruleById.get("private_noindex_excluded")?.blocksWhen).toContain("public discoverability");
    expect(ruleById.get("llms_full_requires_proof")?.requiredProof).toEqual([
      "visible_evidence",
      "claim_boundary",
      "source_authority",
      "discoverability_authority",
    ]);
    expect(ruleById.get("llms_full_requires_proof")?.requiredProof).toEqual(
      uaspEligibility.seoGeoGuards.find((rule) => rule.id === "llms_full_requires_evidence_claim_authority")
        ?.requiredProof
    );
    expect(ruleById.get("sensitive_scales_no_llms_full_by_default")?.blocksWhen).toContain("sensitive scale");
    expect(ruleById.get("future_scale_default_not_eligible")?.rule).toContain("Future scales default");
    expect(ruleById.get("schema_is_not_true_graph")?.rule).toContain("does not prove a true graph");
  });

  it("keeps first-batch statuses consistent with the UASP signal registry", () => {
    const guard = readJson<SeoGeoGuard>(GUARD_PATH);
    const registry = readJson<{ entries: Array<{ scale_code: string; seo_geo_eligible: string }> }>(REGISTRY_PATH);
    const registryByScale = new Map(registry.entries.map((entry) => [entry.scale_code, entry.seo_geo_eligible]));

    for (const row of guard.firstBatchSeoGeoStatus.filter((row) => row.scale_code !== "FUTURE_SCALE_PLACEHOLDER")) {
      expect(row.seo_geo_eligible, row.scale_code).toBe(registryByScale.get(row.scale_code));
      expect(row.runtimeExposureChange, row.scale_code).toBe("none");
    }

    expect(guard.firstBatchSeoGeoStatus.find((row) => row.scale_code === "FUTURE_SCALE_PLACEHOLDER")).toMatchObject({
      seo_geo_eligible: "not_eligible",
      guardStatus: "blocked_until_proof",
      runtimeExposureChange: "none",
    });
  });

  it("aligns with discoverability authority private-flow and no-widening rules", () => {
    const guard = readJson<SeoGeoGuard>(GUARD_PATH);
    const discoverability = readJson<{
      urlSetChanged: boolean;
      llmsExposureChanged: boolean;
      jsonLdOutputChanged: boolean;
      hardRules: string[];
      privateFlowProtections: { requiredProtections: Record<string, boolean> };
    }>(DISCOVERABILITY_PATH);

    expect(discoverability.urlSetChanged).toBe(false);
    expect(discoverability.llmsExposureChanged).toBe(false);
    expect(discoverability.jsonLdOutputChanged).toBe(false);
    expect(discoverability.hardRules).toEqual(expect.arrayContaining(["no silent discoverability exposure widening"]));
    expect(discoverability.privateFlowProtections.requiredProtections.excludedFromSitemap).toBe(true);
    expect(discoverability.privateFlowProtections.requiredProtections.excludedFromLlms).toBe(true);
    expect(discoverability.privateFlowProtections.requiredProtections.excludedFromLlmsFull).toBe(true);
    expect(guard.mustNotChange).toEqual(
      expect.arrayContaining(["sitemap output", "llms output", "llms-full output", "JSON-LD output"])
    );
  });

  it("documents no runtime SEO/GEO changes", () => {
    const guard = readJson<SeoGeoGuard>(GUARD_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(guard.mustNotChange).toEqual(
      expect.arrayContaining([
        "sitemap output",
        "llms output",
        "llms-full output",
        "JSON-LD output",
        "metadata output",
        "canonical/hreflang",
        "route behavior",
        "public copy",
        "SEO/GEO exposure",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract-only.");
    expect(doc).toContain("Future scales default to `not_eligible`.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
