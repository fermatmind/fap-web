import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DOMAIN_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/decision-domain-registry.md");
const SCHEMA_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const SCALE_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1-state.json");

const REQUIRED_DOMAINS = [
  "self_understanding",
  "career_decision",
  "workstyle_decision",
  "relationship_decision",
  "learning_growth",
  "emotional_state",
  "ability_growth",
  "team_communication",
  "leadership_growth",
  "life_direction",
] as const;

type DomainRegistry = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  domains: Array<{
    domain_id: string;
    user_problem: string;
    allowed_signal_types: string[];
    prohibited_signal_types: string[];
    claim_boundary_notes: string;
    evidence_requirement: string;
    recommendation_policy: string;
    seo_geo_policy: string;
    profile_policy: string;
  }>;
  scaleDomainMappings: Array<{
    scale_code: string;
    decision_domains: string[];
    recommendationGrantedByDomain: boolean;
    seoGeoGrantedByDomain: boolean;
    freemiumGrantedByDomain: boolean;
  }>;
  hardRules: string[];
  mustNotChange: string[];
};

function readDomainRegistry(): DomainRegistry {
  return JSON.parse(fs.readFileSync(DOMAIN_REGISTRY_PATH, "utf8")) as DomainRegistry;
}

describe("UASP decision domain registry", () => {
  it("registers PR-UASP-03 after PR-UASP-02 in the UASP train ledger", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("universal-assessment-signal-platform-v1-train");
    expect(byId.get("PR-UASP-02")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP-03")).toMatchObject({
      branch: "codex/pr-uasp-03-decision-domain-registry",
      depends_on: ["PR-UASP-02"],
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP-03")?.status);
  });

  it("defines exactly the approved decision domains", () => {
    const registry = readDomainRegistry();
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")) as { enums: { decision_domain: string[]; signal_type: string[] } };
    const allowedSignalTypes = new Set(schema.enums.signal_type);

    expect(registry.version).toBe("uasp.decision_domain_registry.v1");
    expect(registry.scope).toBe("PR-UASP-03");
    expect(registry.trainName).toBe("universal-assessment-signal-platform-v1-train");
    expect(registry.dependsOn).toEqual(["PR-UASP-02"]);
    expect(registry.runtimeBehaviorChanged).toBe(false);
    expect(registry.domains.map((domain) => domain.domain_id)).toEqual([...REQUIRED_DOMAINS]);
    expect(registry.domains.map((domain) => domain.domain_id)).toEqual(schema.enums.decision_domain);

    for (const domain of registry.domains) {
      expect(domain.user_problem.trim(), domain.domain_id).not.toBe("");
      expect(domain.claim_boundary_notes.trim(), domain.domain_id).not.toBe("");
      expect(domain.evidence_requirement.trim(), domain.domain_id).not.toBe("");
      expect(domain.recommendation_policy.trim(), domain.domain_id).not.toBe("");
      expect(domain.seo_geo_policy.trim(), domain.domain_id).not.toBe("");
      expect(domain.profile_policy.trim(), domain.domain_id).not.toBe("");
      for (const signalType of domain.allowed_signal_types) {
        expect(allowedSignalTypes.has(signalType), `${domain.domain_id}: ${signalType}`).toBe(true);
      }
      for (const signalType of domain.prohibited_signal_types) {
        expect(allowedSignalTypes.has(signalType), `${domain.domain_id}: ${signalType}`).toBe(true);
      }
    }
  });

  it("maps first-batch scales to the approved domains without granting eligibility automatically", () => {
    const registry = readDomainRegistry();
    const scaleRegistry = JSON.parse(fs.readFileSync(SCALE_REGISTRY_PATH, "utf8")) as {
      entries: Array<{ scale_code: string; decision_domains: string[] }>;
    };
    const scaleDomains = new Map(scaleRegistry.entries.map((entry) => [entry.scale_code, entry.decision_domains]));
    const mappings = new Map(registry.scaleDomainMappings.map((mapping) => [mapping.scale_code, mapping]));

    expect(mappings.get("MBTI")?.decision_domains).toEqual(["self_understanding", "career_decision", "workstyle_decision"]);
    expect(mappings.get("BIG5_OCEAN")?.decision_domains).toEqual(["self_understanding", "workstyle_decision", "career_decision"]);
    expect(mappings.get("RIASEC")?.decision_domains).toEqual(["career_decision", "self_understanding"]);
    expect(mappings.get("ENNEAGRAM")?.decision_domains).toEqual(["self_understanding", "relationship_decision", "workstyle_decision"]);

    for (const mapping of registry.scaleDomainMappings) {
      expect(mapping.decision_domains, mapping.scale_code).toEqual(scaleDomains.get(mapping.scale_code));
      expect(mapping.recommendationGrantedByDomain, mapping.scale_code).toBe(false);
      expect(mapping.seoGeoGrantedByDomain, mapping.scale_code).toBe(false);
      expect(mapping.freemiumGrantedByDomain, mapping.scale_code).toBe(false);
    }
  });

  it("locks sensitive defaults for emotional and ability domains", () => {
    const registry = readDomainRegistry();
    const byId = new Map(registry.domains.map((domain) => [domain.domain_id, domain]));

    expect(byId.get("emotional_state")).toMatchObject({
      recommendation_policy: "not_eligible by default.",
      seo_geo_policy: "private_noindex by default for mental-health-sensitive signals.",
      profile_policy: "ephemeral or sensitive_opt_in only.",
    });
    expect(byId.get("emotional_state")?.claim_boundary_notes).toContain("must not be diagnostic");

    expect(byId.get("ability_growth")).toMatchObject({
      recommendation_policy: "explanation_only by default.",
    });
    expect(byId.get("ability_growth")?.claim_boundary_notes).toContain("must not evaluate human worth");
  });

  it("documents the registry without changing runtime behavior", () => {
    const registry = readDomainRegistry();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(registry.hardRules).toEqual(
      expect.arrayContaining([
        "career_decision does not imply recommendation eligibility.",
        "domain mapping does not grant SEO/GEO eligibility automatically.",
        "domain mapping does not grant freemium eligibility automatically.",
        "domain mapping does not grant profile contribution automatically.",
      ])
    );
    expect(registry.mustNotChange).toEqual(
      expect.arrayContaining(["result pages", "CTA routing", "recommendation", "profile", "SEO pages"])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Decision Domains");
    expect(doc).toContain("career_decision does not imply recommendation eligibility");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
