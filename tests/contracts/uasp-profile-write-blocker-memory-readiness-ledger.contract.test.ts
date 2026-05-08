import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const LEDGER_PATH = path.join(
  ROOT,
  "docs/assessment/uasp/generated/profile-write-blocker-memory-readiness-ledger.v1.json"
);
const DOC_PATH = path.join(ROOT, "docs/assessment/uasp/profile-write-blocker-memory-readiness-ledger.md");
const REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");
const POLICY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-uasp2b-state.json");

type MemoryLedger = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  profileRuntimeChanged: boolean;
  memoryWritesEnabled: boolean;
  sensitiveSignalStorageEnabled: boolean;
  savedCareersPromotedToUaspProfile: boolean;
  attemptHistoryPromotedToUaspProfile: boolean;
  mbtiLongitudinalMemoryGeneralized: boolean;
  authUserModelChanged: boolean;
  privacyRuntimeChanged: boolean;
  reportHistoryChanged: boolean;
  recommendationSnapshotsChanged: boolean;
  sourceArtifacts: string[];
  backendEvidencePaths: string[];
  phase2bRuntimePolicy: Record<string, string>;
  blockerRules: Array<{ id: string; rule: string; blocksWhen: string }>;
  firstBatchRuntimeStorageStatus: Array<{
    scale_code: string;
    mappedProfileContribution: string;
    sensitivity: string;
    phase2bRuntimeStorage: string;
    guardStatus: string;
  }>;
  protectedExamples: Array<{
    scale_code: string;
    sensitivity: string;
    profile_contribution: string;
    phase2bRuntimeStorage: string;
    requiredFuturePolicy?: string[];
    forbiddenClaims?: string[];
  }>;
  memoryReadinessLedger: Array<{
    surface: string;
    currentRole: string;
    uaspBoundary: string;
    phase2bStatus: string;
    evidence: string;
  }>;
  futurePrerequisitesBeforeProfileWrites: string[];
  mustNotChange: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("UASP profile write blocker and memory readiness ledger", () => {
  it("registers PR-UASP2B-06 after recommendation guard", () => {
    const state = readJson<{
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; mode: string }>;
    }>(TRAIN_STATE_PATH);
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-UASP2B-05")).toMatchObject({ status: "merged" });
    expect(byId.get("PR-UASP2B-06")).toMatchObject({
      branch: "codex/pr-uasp2b-06-profile-write-blocker-memory-ledger",
      depends_on: ["PR-UASP2B-05"],
      mode: "ledger_blocker_only",
    });
    expect(["in_progress", "merged"]).toContain(byId.get("PR-UASP2B-06")?.status);
  });

  it("is ledger/blocker only and records zero profile, memory, and privacy runtime changes", () => {
    const ledger = readJson<MemoryLedger>(LEDGER_PATH);

    expect(ledger.version).toBe("uasp.profile_write_blocker_memory_readiness_ledger.v1");
    expect(ledger.scope).toBe("PR-UASP2B-06");
    expect(ledger.trainName).toBe("uasp-runtime-metadata-integration-train");
    expect(ledger.dependsOn).toEqual(["PR-UASP2B-05"]);
    expect(ledger.runtimeBehaviorChanged).toBe(false);
    expect(ledger.executionMode).toBe("ledger_blocker_only");
    expect(ledger.profileRuntimeChanged).toBe(false);
    expect(ledger.memoryWritesEnabled).toBe(false);
    expect(ledger.sensitiveSignalStorageEnabled).toBe(false);
    expect(ledger.savedCareersPromotedToUaspProfile).toBe(false);
    expect(ledger.attemptHistoryPromotedToUaspProfile).toBe(false);
    expect(ledger.mbtiLongitudinalMemoryGeneralized).toBe(false);
    expect(ledger.authUserModelChanged).toBe(false);
    expect(ledger.privacyRuntimeChanged).toBe(false);
    expect(ledger.reportHistoryChanged).toBe(false);
    expect(ledger.recommendationSnapshotsChanged).toBe(false);
  });

  it("keeps source artifacts present and backend evidence references recorded", () => {
    const ledger = readJson<MemoryLedger>(LEDGER_PATH);

    for (const artifactPath of ledger.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, artifactPath)), artifactPath).toBe(true);
    }

    expect(ledger.backendEvidencePaths).toEqual(
      expect.arrayContaining([
        "backend/app/Services/V0_3/Me/MeAttemptsService.php",
        "backend/app/Services/V0_3/Me/MeProfileService.php",
        "backend/app/Services/Attempts/UserDataLifecycleService.php",
        "backend/app/Services/Memory/MemoryService.php",
        "backend/app/Http/Controllers/API/V0_5/Career/CareerShortlistController.php",
      ])
    );
    for (const backendPath of ledger.backendEvidencePaths) {
      expect(backendPath.startsWith("backend/"), backendPath).toBe(true);
      expect(backendPath.endsWith(".php"), backendPath).toBe(true);
    }
  });

  it("blocks runtime profile storage even when first-batch mappings have profile contribution values", () => {
    const ledger = readJson<MemoryLedger>(LEDGER_PATH);
    const registry = readJson<{
      entries: Array<{ scale_code: string; sensitivity: string; profile_contribution: string }>;
    }>(REGISTRY_PATH);
    const registryByScale = new Map(registry.entries.map((entry) => [entry.scale_code, entry]));

    expect(ledger.phase2bRuntimePolicy).toMatchObject({
      profileContributionMeaning: "readiness_blocker_only",
      runtimeStorageDecision: "blocked_for_phase_2b",
      profilePersistence: "blocked",
      sensitivePersistence: "blocked",
    });

    for (const row of ledger.firstBatchRuntimeStorageStatus) {
      const mapped = registryByScale.get(row.scale_code);
      expect(row.mappedProfileContribution, row.scale_code).toBe(mapped?.profile_contribution);
      expect(row.sensitivity, row.scale_code).toBe(mapped?.sensitivity);
      expect(row.phase2bRuntimeStorage, row.scale_code).toBe("blocked_for_phase_2b");
      expect(row.guardStatus, row.scale_code).toContain("metadata_only_no_write");
    }
  });

  it("inherits sensitive defaults and protected examples from profile/sensitivity policy", () => {
    const ledger = readJson<MemoryLedger>(LEDGER_PATH);
    const policy = readJson<{
      sensitivityPolicy: Array<{ sensitivity: string; defaultProfileContribution: string; lockedRules: string[] }>;
      decisionDomainDefaults: Array<{ decision_domain: string; allowedProfileContributions: string[] }>;
      protectedExamples: Array<{ scale_code: string; sensitivity: string; profile_contribution: string }>;
    }>(POLICY_PATH);
    const sensitivityById = new Map(policy.sensitivityPolicy.map((row) => [row.sensitivity, row]));
    const ledgerExamplesByScale = new Map(ledger.protectedExamples.map((row) => [row.scale_code, row]));

    expect(sensitivityById.get("mental_health_sensitive")?.lockedRules).toEqual(
      expect.arrayContaining(["Must not default to longitudinal."])
    );
    expect(policy.decisionDomainDefaults.find((row) => row.decision_domain === "emotional_state")?.allowedProfileContributions).toEqual(
      expect.arrayContaining(["ephemeral", "sensitive_opt_in"])
    );

    for (const protectedExample of policy.protectedExamples) {
      const ledgerExample = ledgerExamplesByScale.get(protectedExample.scale_code);
      expect(ledgerExample?.sensitivity, protectedExample.scale_code).toBe(protectedExample.sensitivity);
      expect(ledgerExample?.profile_contribution, protectedExample.scale_code).toBe(
        protectedExample.profile_contribution
      );
      expect(ledgerExample?.phase2bRuntimeStorage, protectedExample.scale_code).toBe("blocked_for_phase_2b");
    }
    expect(ledgerExamplesByScale.get("IQ_RAVEN")?.forbiddenClaims).toEqual(
      expect.arrayContaining(["human worth", "employment suitability", "hiring suitability"])
    );
  });

  it("documents attempts, saved careers, memory services, and DSAR boundaries", () => {
    const ledger = readJson<MemoryLedger>(LEDGER_PATH);
    const bySurface = new Map(ledger.memoryReadinessLedger.map((row) => [row.surface, row]));

    expect(bySurface.get("/v0.3/me/attempts")).toMatchObject({
      currentRole: "attempt_report_history",
      uaspBoundary: "not_uasp_profile_memory",
      phase2bStatus: "read_only_history_not_profile",
    });
    expect(bySurface.get("MeProfileService")).toMatchObject({
      uaspBoundary: "does_not_return_uasp_signal_profile",
      phase2bStatus: "blocked",
    });
    expect(bySurface.get("saved_careers")).toMatchObject({
      currentRole: "visitor_key_preference_store",
      uaspBoundary: "not_uasp_profile_memory",
      phase2bStatus: "do_not_promote",
    });
    expect(bySurface.get("memory_services")).toMatchObject({
      uaspBoundary: "not_uasp_governed_durable_memory",
      phase2bStatus: "blocked_until_contract_lifecycle",
    });
    expect(bySurface.get("dsar_lifecycle")).toMatchObject({
      uaspBoundary: "does_not_yet_cover_all_uasp_memory_candidates",
      phase2bStatus: "blocked",
    });
  });

  it("locks blocker rules, future prerequisites, and no-runtime-change documentation", () => {
    const ledger = readJson<MemoryLedger>(LEDGER_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const ruleById = new Map(ledger.blockerRules.map((rule) => [rule.id, rule]));

    expect(ruleById.get("profile_contribution_readiness_only")?.rule).toContain("readiness field only");
    expect(ruleById.get("no_profile_persistence")?.rule).toContain("No UASP profile persistence");
    expect(ruleById.get("saved_careers_not_profile_memory")?.rule).toContain("preference storage");
    expect(ruleById.get("attempts_not_profile_memory")?.rule).toContain("attempt/report history");
    expect(ruleById.get("no_mbti_longitudinal_memory_generalization")?.rule).toContain("must not be generalized");
    expect(ruleById.get("sensitive_opt_in_requires_future_consent")?.rule).toContain("future explicit consent");
    expect(ledger.futurePrerequisitesBeforeProfileWrites).toEqual(
      expect.arrayContaining([
        "human_approved_profile_product_policy",
        "explicit_sensitive_signal_consent_model",
        "deletion_and_dsar_coverage_for_memory_targets",
        "backend_owned_profile_memory_contract",
      ])
    );
    expect(ledger.mustNotChange).toEqual(
      expect.arrayContaining([
        "profile runtime",
        "memory writes",
        "saved careers",
        "attempts",
        "auth/user model",
        "privacy runtime",
        "sensitive storage",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is ledger/blocker only.");
    expect(doc).toContain("Not UASP profile memory.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
