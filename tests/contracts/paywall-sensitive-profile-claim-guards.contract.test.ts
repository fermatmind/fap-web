import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/paywall-sensitive-profile-claim-guards.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/paywall-sensitive-profile-claim-guards.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-scb-state.json");

type Artifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  sourceArtifacts: string[];
  guaranteeBoundary: { allowedOnlyFor: string[]; forbiddenForOutcome: string[] };
  sensitiveClinicalBoundary: { forbiddenClaims: string[]; allowedBoundary: string; mentalHealthLongitudinalDefaultAllowed: boolean };
  abilityBoundary: { humanWorthClaimAllowed: boolean; employmentScreeningSuitabilityAllowed: boolean };
  profileBoundary: {
    savedCareersIsUaspProfileMemory: boolean;
    profileContributionMeansAlreadyStored: boolean;
    profileMemoryWritesRemainBlocked: boolean;
    sensitiveSignalPersistenceRemainBlocked: boolean;
  };
  freemiumBoundary: Record<string, string | boolean>;
  nonRuntimeChangeGuarantees: Record<string, boolean>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("paywall sensitive and profile claim guards", () => {
  it("defines contract-only paywall sensitive profile boundaries", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.paywall_sensitive_profile_claim_guards.v1");
    expect(artifact.scope).toBe("PR-SCB-06");
    expect(artifact.trainName).toBe("semantic-claim-boundary-enforcement-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
  });

  it("anchors source artifacts and train state", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const state = readJson<{ prs: Array<{ id: string; status: string; pr_url: string | null; merge_sha: string | null }> }>(TRAIN_STATE_PATH);

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }
    expect(state.prs.find((pr) => pr.id === "PR-SCB-05")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/734",
      merge_sha: "2cfa3974f6e9b272fbd637c85c38283d31d8110f",
    });
    expect(state.prs.find((pr) => pr.id === "PR-SCB-06")).toMatchObject({ status: "in_progress" });
  });

  it("separates access and delivery guarantees from forbidden outcome guarantees", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.guaranteeBoundary.allowedOnlyFor).toEqual(expect.arrayContaining(["访问保障", "报告可查看保障", "支付后交付保障", "access guarantee", "delivery guarantee", "continuity guarantee"]));
    expect(artifact.guaranteeBoundary.forbiddenForOutcome).toEqual(expect.arrayContaining(["结果准确保证", "职业成功保证", "报告结论保证", "career success guarantee", "accuracy guarantee", "outcome guarantee"]));
  });

  it("blocks sensitive clinical ability and profile overclaims", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.sensitiveClinicalBoundary).toMatchObject({
      allowedBoundary: "descriptive self-check only",
      mentalHealthLongitudinalDefaultAllowed: false,
    });
    expect(artifact.sensitiveClinicalBoundary.forbiddenClaims).toEqual(expect.arrayContaining(["diagnosis claims", "treatment claims", "replacing professional help", "employment screening suitability"]));
    expect(artifact.abilityBoundary).toEqual({
      humanWorthClaimAllowed: false,
      employmentScreeningSuitabilityAllowed: false,
    });
    expect(artifact.profileBoundary).toEqual({
      savedCareersIsUaspProfileMemory: false,
      profileContributionMeansAlreadyStored: false,
      profileMemoryWritesRemainBlocked: true,
      sensitiveSignalPersistenceRemainBlocked: true,
    });
  });

  it("keeps freemium status from becoming commerce proof", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.freemiumBoundary).toMatchObject({
      MBTI: "full_loop",
      BIG5_OCEAN: "not_full_loop",
      RIASEC: "not_full_loop",
      skuExistsMeansFullLoop: false,
      offerCardExistsMeansFullLoop: false,
      backendReadyMeansMonetizationReady: false,
    });
  });

  it("documents no commerce profile sensitive runtime or visible copy changes", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(Object.values(artifact.nonRuntimeChangeGuarantees).every((value) => value === false)).toBe(true);
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract guard only.");
    expect(doc).toContain("Saved careers changed: no");
  });
});
