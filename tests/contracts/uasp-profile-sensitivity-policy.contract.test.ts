import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/profile-contribution-sensitivity-policy.md");
const SCHEMA_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json");
const SCALE_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const ELIGIBILITY_GUARDS_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp-v1-state.json");

type ProfileSensitivityPolicy = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  profileRuntimeChanged: boolean;
  sensitivePersistenceImplemented: boolean;
  authUserModelChanged: boolean;
  attemptStorageChanged: boolean;
  privacyRuntimeChanged: boolean;
  reportAccessChanged: boolean;
  recommendationRuntimeChanged: boolean;
  sourceArtifacts: string[];
  retentionCategories: string[];
  disclaimerCategories: string[];
  sensitivityPolicy: Array<{
    sensitivity: string;
    allowedProfileContributions: string[];
    defaultProfileContribution: string;
    allowedRetention: string[];
    defaultRetention: string;
    defaultDisclaimer: string;
    recommendationDefault: string;
    lockedRules: string[];
  }>;
  profileContributionPolicy: Array<{
    profile_contribution: string;
    allowedRetention: string[];
    requiresFutureConsentPolicy: boolean;
  }>;
  decisionDomainDefaults: Array<{
    decision_domain: string;
    defaultProfileContribution: string;
    allowedProfileContributions: string[];
    defaultSensitivity: string;
  }>;
  firstBatchBindings: Array<{
    scale_code: string;
    sensitivity: string;
    profile_contribution: string;
    retentionCategory: string;
    disclaimerCategory: string;
  }>;
  protectedExamples: Array<Record<string, unknown>>;
  lockedRules: string[];
  mustNotChange: string[];
};

function readPolicy(): ProfileSensitivityPolicy {
  return JSON.parse(fs.readFileSync(POLICY_PATH, "utf8")) as ProfileSensitivityPolicy;
}

describe("UASP profile contribution and sensitivity policy", () => {
  it("registers PR-UASP-05 after PR-UASP-04 in the UASP train ledger", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("universal-assessment-signal-platform-v1-train");
    expect(byId.get("PR-UASP-04")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP-05")).toMatchObject({
      branch: "codex/pr-uasp-05-profile-sensitivity-policy",
      depends_on: ["PR-UASP-04"],
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP-05")?.status);
  });

  it("uses only approved UASP sensitivity and profile contribution enums", () => {
    const policy = readPolicy();
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")) as {
      enums: Record<string, string[]>;
    };

    expect(policy.version).toBe("uasp.profile_sensitivity_policy.v1");
    expect(policy.scope).toBe("PR-UASP-05");
    expect(policy.trainName).toBe("universal-assessment-signal-platform-v1-train");
    expect(policy.dependsOn).toEqual(["PR-UASP-04"]);
    expect(policy.runtimeBehaviorChanged).toBe(false);

    for (const row of policy.sensitivityPolicy) {
      expect(schema.enums.sensitivity.includes(row.sensitivity), row.sensitivity).toBe(true);
      expect(row.allowedProfileContributions.length, row.sensitivity).toBeGreaterThan(0);
      for (const contribution of row.allowedProfileContributions) {
        expect(schema.enums.profile_contribution.includes(contribution), `${row.sensitivity}:${contribution}`).toBe(true);
      }
      expect(schema.enums.profile_contribution.includes(row.defaultProfileContribution), row.sensitivity).toBe(true);
      expect(policy.retentionCategories.includes(row.defaultRetention), row.sensitivity).toBe(true);
      expect(policy.disclaimerCategories.includes(row.defaultDisclaimer), row.sensitivity).toBe(true);
    }

    for (const row of policy.profileContributionPolicy) {
      expect(schema.enums.profile_contribution.includes(row.profile_contribution), row.profile_contribution).toBe(true);
      expect(row.allowedRetention.length, row.profile_contribution).toBeGreaterThan(0);
      for (const retention of row.allowedRetention) {
        expect(policy.retentionCategories.includes(retention), `${row.profile_contribution}:${retention}`).toBe(true);
      }
    }
  });

  it("keeps source artifacts present and policy layered on eligibility guards", () => {
    const policy = readPolicy();

    expect(fs.existsSync(ELIGIBILITY_GUARDS_PATH)).toBe(true);
    for (const artifactPath of policy.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }
  });

  it("protects mental-health-sensitive, ability-sensitive, emotional-state, and blocked profile paths", () => {
    const policy = readPolicy();
    const bySensitivity = new Map(policy.sensitivityPolicy.map((row) => [row.sensitivity, row]));
    const byContribution = new Map(policy.profileContributionPolicy.map((row) => [row.profile_contribution, row]));
    const byDomain = new Map(policy.decisionDomainDefaults.map((row) => [row.decision_domain, row]));

    const mentalHealth = bySensitivity.get("mental_health_sensitive");
    expect(mentalHealth?.defaultProfileContribution).not.toBe("longitudinal");
    expect(mentalHealth?.allowedProfileContributions).not.toContain("longitudinal");
    expect(mentalHealth?.recommendationDefault).toBe("not_eligible");
    expect(mentalHealth?.defaultDisclaimer).toBe("mental_health");

    const ability = bySensitivity.get("ability_sensitive");
    expect(ability?.lockedRules.join(" ")).toContain("human worth");
    expect(ability?.lockedRules.join(" ")).toContain("employment suitability");

    const emotionalState = byDomain.get("emotional_state");
    expect(emotionalState?.allowedProfileContributions).toEqual(["ephemeral", "sensitive_opt_in"]);
    expect(["ephemeral", "sensitive_opt_in"]).toContain(emotionalState?.defaultProfileContribution);

    expect(byContribution.get("sensitive_opt_in")?.requiresFutureConsentPolicy).toBe(true);
    expect(byContribution.get("blocked")?.allowedRetention).toEqual(["blocked_storage"]);
  });

  it("keeps first-batch profile contribution consistent with approved signal mappings", () => {
    const policy = readPolicy();
    const scaleRegistry = JSON.parse(fs.readFileSync(SCALE_REGISTRY_PATH, "utf8")) as {
      entries: Array<Record<string, string>>;
    };
    const byScale = new Map(scaleRegistry.entries.map((entry) => [entry.scale_code, entry]));

    expect(policy.firstBatchBindings.map((row) => row.scale_code).sort()).toEqual([
      "BIG5_OCEAN",
      "ENNEAGRAM",
      "MBTI",
      "RIASEC",
    ]);
    for (const row of policy.firstBatchBindings) {
      const mapped = byScale.get(row.scale_code);
      expect(mapped, row.scale_code).toBeDefined();
      expect(row.sensitivity, row.scale_code).toBe(mapped?.sensitivity);
      expect(row.profile_contribution, row.scale_code).toBe(mapped?.profile_contribution);
    }
    expect(policy.firstBatchBindings.find((row) => row.scale_code === "ENNEAGRAM")).toMatchObject({
      sensitivity: "sensitive",
      profile_contribution: "summary_only",
      retentionCategory: "summary_storage",
      disclaimerCategory: "sensitive_result",
    });
  });

  it("keeps SDS/Clinical protected and IQ/Raven ability-sensitive without runtime onboarding", () => {
    const policy = readPolicy();
    const byScale = new Map(policy.protectedExamples.map((row) => [row.scale_code, row]));

    expect(byScale.get("SDS20")).toMatchObject({
      sensitivity: "mental_health_sensitive",
      profile_contribution: "sensitive_opt_in",
      recommendation_eligible: "not_eligible",
      runtimeOnboarded: false,
    });
    expect(byScale.get("CLINICAL_COMBO_68")).toMatchObject({
      sensitivity: "mental_health_sensitive",
      profile_contribution: "sensitive_opt_in",
      recommendation_eligible: "not_eligible",
      runtimeOnboarded: false,
    });
    expect(byScale.get("IQ_RAVEN")).toMatchObject({
      sensitivity: "ability_sensitive",
      profile_contribution: "summary_only",
      runtimeOnboarded: false,
    });
    expect(byScale.get("IQ_RAVEN")?.forbiddenClaims).toEqual(
      expect.arrayContaining(["human worth", "employment suitability", "hiring suitability"])
    );
  });

  it("documents policy without changing profile, privacy, report, or recommendation runtime", () => {
    const policy = readPolicy();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(policy.profileRuntimeChanged).toBe(false);
    expect(policy.sensitivePersistenceImplemented).toBe(false);
    expect(policy.authUserModelChanged).toBe(false);
    expect(policy.attemptStorageChanged).toBe(false);
    expect(policy.privacyRuntimeChanged).toBe(false);
    expect(policy.reportAccessChanged).toBe(false);
    expect(policy.recommendationRuntimeChanged).toBe(false);
    expect(policy.mustNotChange).toEqual(
      expect.arrayContaining([
        "profile memory runtime",
        "sensitive signal persistence",
        "auth/user model",
        "attempt storage",
        "privacy runtime",
        "report access",
        "recommendation runtime",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("mental_health_sensitive");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
