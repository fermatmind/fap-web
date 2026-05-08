import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ENVELOPE_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-runtime-metadata-envelope.v1.json");
const ENVELOPE_DOC_PATH = path.join(ROOT, "docs/assessment/uasp/uasp-runtime-metadata-envelope.md");
const SCHEMA_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp2b-state.json");

type SchemaArtifact = {
  contractFields: string[];
  enums: Record<string, string[]>;
  defaultsForFutureScale: Record<string, string | boolean>;
};

type RegistryArtifact = {
  allowedFirstBatchScales: string[];
  entries: Array<{ scale_code: string }>;
};

type EnvelopeArtifact = {
  version: string;
  scope: string;
  trainName: string;
  envelopeKey: string;
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  schemaArtifact: string;
  scaleRegistryArtifact: string;
  runtimeReadinessArtifact: string;
  envelopeFields: string[];
  enums: Record<string, string[]>;
  defaultsForUnknownScale: Record<string, string | boolean>;
  firstBatchReferences: Array<{
    scale_code: string;
    envelopeStatus: string;
    runtimeInjection: string;
  }>;
  readOnlyRules: string[];
  authorityPolicy: {
    backendAuthorityPreferred: boolean;
    frontendArtifactPermanentAuthority: boolean;
    frontendArtifactAllowedAsTemporaryContractFixture: boolean;
  };
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("UASP runtime metadata envelope contract", () => {
  it("registers PR-UASP2B-01 in the runtime metadata train ledger", () => {
    const state = readJson<{
      train_name: string;
      pr_namespace: string;
      prs: Array<{ id: string; branch: string; mode: string; artifacts: string[] }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("uasp-runtime-metadata-integration-train");
    expect(state.pr_namespace).toBe("PR-UASP2B-*");
    expect(byId.get("PR-UASP2B-01")).toMatchObject({
      branch: "codex/pr-uasp2b-01-runtime-metadata-envelope",
      mode: "contract_only",
    });
    expect(byId.get("PR-UASP2B-01")?.artifacts).toEqual([
      "docs/assessment/uasp/uasp-runtime-metadata-envelope.md",
      "docs/assessment/uasp/generated/uasp-runtime-metadata-envelope.v1.json",
      "tests/contracts/uasp-runtime-metadata-envelope.contract.test.ts",
    ]);
  });

  it("defines a read-only uasp_signal_v1 envelope with the exact UASP contract fields", () => {
    const envelope = readJson<EnvelopeArtifact>(ENVELOPE_PATH);
    const schema = readJson<SchemaArtifact>(SCHEMA_PATH);

    expect(envelope.version).toBe("uasp.runtime_metadata_envelope.v1");
    expect(envelope.scope).toBe("PR-UASP2B-01");
    expect(envelope.trainName).toBe("uasp-runtime-metadata-integration-train");
    expect(envelope.envelopeKey).toBe("uasp_signal_v1");
    expect(envelope.runtimeBehaviorChanged).toBe(false);
    expect(envelope.executionMode).toBe("contract_only");
    expect(envelope.envelopeFields).toEqual(schema.contractFields);
  });

  it("reuses approved UASP enums and does not invent runtime metadata values", () => {
    const envelope = readJson<EnvelopeArtifact>(ENVELOPE_PATH);
    const schema = readJson<SchemaArtifact>(SCHEMA_PATH);

    expect(Object.keys(envelope.enums).sort()).toEqual(Object.keys(schema.enums).sort());
    for (const [enumName, values] of Object.entries(schema.enums)) {
      expect(envelope.enums[enumName], enumName).toEqual(values);
    }

    const serialized = JSON.stringify(envelope.enums);
    expect(serialized).not.toContain("career_match_signal");
    expect(serialized).not.toContain("runtime_ready");
    expect(serialized).not.toContain("profile_write_ready");
    expect(serialized).not.toContain("recommendation_ready");
  });

  it("keeps future and unknown scale envelopes fail-closed", () => {
    const envelope = readJson<EnvelopeArtifact>(ENVELOPE_PATH);
    const schema = readJson<SchemaArtifact>(SCHEMA_PATH);

    expect(envelope.defaultsForUnknownScale).toMatchObject(schema.defaultsForFutureScale);
    expect(envelope.defaultsForUnknownScale).toMatchObject({
      recommendation_eligible: "not_eligible",
      seo_geo_eligible: "not_eligible",
      profile_contribution: "none",
      freemium_status: "blocked",
      claim_level: "descriptive",
      stability: "unknown",
      report_eligible: false,
      evidence_required: true,
      disclaimer_required: false,
      frontend_fallback_policy: "forbidden_for_new_surface",
    });
  });

  it("references only approved first-batch scales without injecting runtime metadata", () => {
    const envelope = readJson<EnvelopeArtifact>(ENVELOPE_PATH);
    const registry = readJson<RegistryArtifact>(REGISTRY_PATH);

    expect(envelope.firstBatchReferences.map((entry) => entry.scale_code)).toEqual(registry.allowedFirstBatchScales);
    expect(registry.entries.map((entry) => entry.scale_code)).toEqual(registry.allowedFirstBatchScales);

    for (const reference of envelope.firstBatchReferences) {
      expect(reference.envelopeStatus).toBe("reference_only");
      expect(reference.runtimeInjection).toBe("not_injected_by_this_pr");
    }
  });

  it("locks no-runtime-trigger rules for scoring, commerce, SEO, recommendations, and profile memory", () => {
    const envelope = readJson<EnvelopeArtifact>(ENVELOPE_PATH);
    const doc = fs.readFileSync(ENVELOPE_DOC_PATH, "utf8");

    expect(envelope.readOnlyRules).toEqual(
      expect.arrayContaining([
        "metadata_only",
        "no_scoring_impact",
        "no_report_entitlement_impact",
        "no_checkout_payment_commerce_trigger",
        "no_recommendation_runtime_trigger",
        "no_seo_geo_exposure_trigger",
        "no_sitemap_llms_url_set_change",
        "no_profile_write",
        "no_sensitive_signal_persistence",
        "no_frontend_fallback_authority",
      ])
    );
    expect(envelope.authorityPolicy).toMatchObject({
      backendAuthorityPreferred: true,
      frontendArtifactPermanentAuthority: false,
      frontendArtifactAllowedAsTemporaryContractFixture: true,
    });
    expect(envelope.mustNotChange).toEqual(
      expect.arrayContaining([
        "runtime payloads",
        "result/report UI",
        "API clients",
        "backend",
        "scoring",
        "report entitlement",
        "checkout/payment",
        "profile runtime",
        "recommendation runtime",
        "sitemap output",
        "llms output",
        "SEO/GEO exposure",
        "public copy",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract-only");
    expect(doc).toContain("not_injected_by_this_pr");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
