import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/existing-scale-signal-mapping.md");
const SCHEMA_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1-state.json");

type SourceEvidence = {
  path: string;
  requiredTokens: string[];
};

type ScaleSignalEntry = {
  version: string;
  scale_code: string;
  scale_slug: string;
  form_code: string;
  signal_type: string;
  result_shape: string;
  stability: string;
  sensitivity: string;
  decision_domains: string[];
  claim_level: string;
  profile_contribution: string;
  recommendation_eligible: string;
  report_eligible: boolean;
  seo_geo_eligible: string;
  freemium_status: string;
  evidence_required: boolean;
  disclaimer_required: boolean;
  runtime_authority_owner: string;
  frontend_fallback_policy: string;
  locale_support: string[];
  source_authority: string[];
  rollback_policy: string;
  boundaries: string[];
  forbidden_claims: string[];
  sourceEvidence: SourceEvidence[];
};

type RegistryArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  schemaArtifact: string;
  allowedFirstBatchScales: string[];
  entries: ScaleSignalEntry[];
  nonMvpExamples: Array<{ scale_code: string; readinessStatus: string; reason: string }>;
  mustNotChange: string[];
};

type SchemaArtifact = {
  contractFields: string[];
  enums: Record<string, string[]>;
};

function readRegistry(): RegistryArtifact {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8")) as RegistryArtifact;
}

function readSchema(): SchemaArtifact {
  return JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")) as SchemaArtifact;
}

describe("UASP existing scale signal registry", () => {
  it("registers PR-UASP-02 after PR-UASP-01 in the UASP train ledger", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("universal-assessment-signal-platform-v1-train");
    expect(byId.get("PR-UASP-01")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP-02")).toMatchObject({
      branch: "codex/pr-uasp-02-existing-scale-signal-mapping",
      depends_on: ["PR-UASP-01"],
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP-02")?.status);
  });

  it("maps only the approved first-batch scales", () => {
    const registry = readRegistry();

    expect(registry.version).toBe("uasp.existing_scale_signal_registry.v1");
    expect(registry.scope).toBe("PR-UASP-02");
    expect(registry.trainName).toBe("universal-assessment-signal-platform-v1-train");
    expect(registry.dependsOn).toEqual(["PR-UASP-01"]);
    expect(registry.runtimeBehaviorChanged).toBe(false);
    expect(registry.allowedFirstBatchScales).toEqual(["MBTI", "BIG5_OCEAN", "RIASEC", "ENNEAGRAM"]);
    expect(registry.entries.map((entry) => entry.scale_code)).toEqual(["MBTI", "BIG5_OCEAN", "RIASEC", "ENNEAGRAM"]);
  });

  it("keeps every mapping inside the UASP schema and approved enums", () => {
    const registry = readRegistry();
    const schema = readSchema();

    const enumFields = {
      signal_type: "signal_type",
      result_shape: "result_shape",
      stability: "stability",
      sensitivity: "sensitivity",
      claim_level: "claim_level",
      profile_contribution: "profile_contribution",
      recommendation_eligible: "recommendation_eligible",
      seo_geo_eligible: "seo_geo_eligible",
      freemium_status: "freemium_status",
    } as const;

    for (const entry of registry.entries) {
      for (const field of schema.contractFields) {
        expect(Object.prototype.hasOwnProperty.call(entry, field), `${entry.scale_code}: ${field}`).toBe(true);
      }
      for (const [field, enumName] of Object.entries(enumFields)) {
        const value = entry[field as keyof ScaleSignalEntry];
        expect(schema.enums[enumName].includes(String(value)), `${entry.scale_code}: ${field}=${String(value)}`).toBe(true);
      }
      for (const domain of entry.decision_domains) {
        expect(schema.enums.decision_domain.includes(domain), `${entry.scale_code}: ${domain}`).toBe(true);
      }
    }
  });

  it("locks first-batch semantic meanings and claim boundaries", () => {
    const registry = readRegistry();
    const byScale = new Map(registry.entries.map((entry) => [entry.scale_code, entry]));

    expect(byScale.get("MBTI")).toMatchObject({
      signal_type: "identity",
      result_shape: "type",
      recommendation_eligible: "next_step_only",
      freemium_status: "full_loop",
    });
    expect(byScale.get("MBTI")?.forbidden_claims.join(" ")).toMatch(/precise career recommendation/i);

    expect(byScale.get("BIG5_OCEAN")).toMatchObject({
      signal_type: "trait",
      result_shape: "facet_vector",
      recommendation_eligible: "explanation_only",
      freemium_status: "frontend_partial",
    });
    expect(byScale.get("BIG5_OCEAN")?.forbidden_claims.join(" ")).toMatch(/precise career/i);

    expect(byScale.get("RIASEC")).toMatchObject({
      signal_type: "interest",
      result_shape: "vector",
      recommendation_eligible: "candidate_signal",
      freemium_status: "frontend_partial",
    });
    expect(byScale.get("RIASEC")?.boundaries.join(" ")).toContain("candidate signal");

    expect(byScale.get("ENNEAGRAM")).toMatchObject({
      signal_type: "motivation",
      result_shape: "type",
      sensitivity: "sensitive",
      recommendation_eligible: "explanation_only",
      freemium_status: "backend_ready",
    });
    expect(byScale.get("ENNEAGRAM")?.boundaries.join(" ")).toContain("Should not enter career recommendation mainline.");
  });

  it("keeps non-MVP examples blocked or partial and does not mark future scales ready", () => {
    const registry = readRegistry();
    const byScale = new Map(registry.nonMvpExamples.map((entry) => [entry.scale_code, entry]));

    expect(byScale.get("SDS20")).toMatchObject({ readinessStatus: "blocked" });
    expect(byScale.get("CLINICAL_COMBO_68")).toMatchObject({ readinessStatus: "blocked" });
    expect(byScale.get("IQ_RAVEN")).toMatchObject({ readinessStatus: "partial" });
    expect(byScale.get("FUTURE_SCALE_PLACEHOLDER")).toMatchObject({ readinessStatus: "blocked" });

    for (const example of registry.nonMvpExamples) {
      expect(example.readinessStatus, example.scale_code).not.toBe("ready");
      expect(example.reason.trim(), example.scale_code).not.toBe("");
    }
  });

  it("anchors mapped scale evidence to current repo sources", () => {
    const registry = readRegistry();

    for (const entry of registry.entries) {
      expect(entry.sourceEvidence.length, entry.scale_code).toBeGreaterThan(0);
      for (const source of entry.sourceEvidence) {
        const absoluteSource = path.join(ROOT, source.path);
        expect(fs.existsSync(absoluteSource), `${entry.scale_code}: ${source.path}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");
        for (const token of source.requiredTokens) {
          expect(sourceText, `${entry.scale_code}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("documents the mapping without runtime behavior changes", () => {
    const registry = readRegistry();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(registry.mustNotChange).toEqual(
      expect.arrayContaining([
        "public catalog",
        "runtime",
        "claim copy",
        "freemium behavior",
        "recommendation behavior",
        "scoring",
        "report entitlement",
        "checkout/payment",
        "SEO/GEO exposure",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("First Batch Scales");
    expect(doc).toContain("Big Five");
    expect(doc).toContain("RIASEC");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
