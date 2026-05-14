import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/june-seo-p0-pseo-freeze-claim-guard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/june-seo-p0-pseo-freeze-claim-guard.md");
const CALIBRATION_ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/june-seo-p0-execution-calibration.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-seo-june-state.json");

type FrozenDimension = {
  id: string;
  label: string;
  status: "frozen";
  priority: "P0";
  requiresBeforeUnfreeze: string[];
};

type ManualReviewItem = {
  phrase: string;
  action: "manual_review_only";
  status: string;
  publicCopyRewriteAllowed: boolean;
  approvedReplacement: null;
};

type PseoFreezeArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  publicCopyChanged: boolean;
  routeSetChanged: boolean;
  sitemapExposureChanged: boolean;
  llmsExposureChanged: boolean;
  pseoExpansionAllowed: boolean;
  frozenPseoDimensions: FrozenDimension[];
  blockedClaimCategories: string[];
  allowedLanguage: string[];
  manualReviewQueue: ManualReviewItem[];
  sourceArtifacts: string[];
  mustNotChange: string[];
};

type CalibrationArtifact = {
  frozenExpansion: string[];
  blockedClaims: string[];
  allowedClaimLanguage: string[];
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("June SEO P0 pSEO freeze and claim guard", () => {
  it("registers PR-SEO-JUNE-06 as governance-only with no runtime exposure changes", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);
    const state = readJson<{
      train_name: string;
      train_policy: Record<string, boolean>;
      prs: Array<{ id: string; status: string; depends_on: string[]; branch: string }>;
    }>(TRAIN_STATE_PATH);
    const pr06 = state.prs.find((pr) => pr.id === "PR-SEO-JUNE-06");

    expect(artifact.version).toBe("claims.june_p0_pseo_freeze_claim_guard.v1");
    expect(artifact.scope).toBe("PR-SEO-JUNE-06");
    expect(artifact.trainName).toBe("seo-june-p0-fix-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.publicCopyChanged).toBe(false);
    expect(artifact.routeSetChanged).toBe(false);
    expect(artifact.sitemapExposureChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.pseoExpansionAllowed).toBe(false);
    expect(state.train_policy.no_pseo_generation).toBe(true);
    expect(state.train_policy.no_public_route_expansion).toBe(true);
    expect(state.train_policy.no_sitemap_url_expansion).toBe(true);
    expect(state.train_policy.no_llms_expansion).toBe(true);
    expect(pr06).toMatchObject({
      branch: "codex/pr-seo-june-06-pseo-freeze-claim-guard",
      depends_on: ["PR-SEO-JUNE-05"],
    });
    expect(["in_progress", "local_checks_passed", "committed", "pr_open", "merged"]).toContain(pr06?.status);
  });

  it("freezes every June P0 pSEO expansion dimension", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);
    const labels = artifact.frozenPseoDimensions.map((dimension) => dimension.label);

    expect(labels).toEqual([
      "MBTI x career pSEO",
      "Big Five trait x career pSEO",
      "RIASEC code x career pSEO",
      "trait x problem pSEO",
      "career recommendation pSEO",
    ]);

    for (const dimension of artifact.frozenPseoDimensions) {
      expect(dimension.status, dimension.id).toBe("frozen");
      expect(dimension.priority, dimension.id).toBe("P0");
      expect(dimension.requiresBeforeUnfreeze, dimension.id).toEqual(
        expect.arrayContaining([
          "backend/CMS indexability approval",
          "visible evidence requirements",
          "manual review workflow",
          "sitemap and llms eligibility gates",
        ])
      );
    }
  });

  it("blocks the high-risk claim categories required by the June train", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);

    expect(artifact.blockedClaimCategories).toEqual(
      expect.arrayContaining([
        "precise career recommendation",
        "best career",
        "guaranteed career success",
        "career success prediction",
        "AI career planning",
        "Big Five career matching",
        "RIASEC recommender",
        "MBTI personalized recommender",
        "hiring suitability",
        "diagnosis",
        "personality diagnosis",
      ])
    );
  });

  it("keeps only bounded allowed language for SEO copy governance", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);

    expect(artifact.allowedLanguage).toEqual([
      "career direction reference",
      "exploration suggestion",
      "interest signal",
      "workplace behavior tendency",
      "snapshot-based support",
      "evidence-backed explanation",
    ]);
  });

  it("routes risky phrases to manual review without approving rewrites", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);
    const byPhrase = new Map(artifact.manualReviewQueue.map((item) => [item.phrase, item]));

    for (const phrase of [
      "岗位诊断",
      "role-fit diagnostics",
      "职业适配度",
      "best career",
      "precise recommendation",
      "guarantee",
      "AI planning",
      "hiring suitability",
    ]) {
      const item = byPhrase.get(phrase);
      expect(item, phrase).toBeDefined();
      expect(item?.action, phrase).toBe("manual_review_only");
      expect(item?.publicCopyRewriteAllowed, phrase).toBe(false);
      expect(item?.approvedReplacement, phrase).toBeNull();
    }
  });

  it("stays aligned with the June execution calibration artifact and existing claim guards", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);
    const calibration = readJson<CalibrationArtifact>(CALIBRATION_ARTIFACT_PATH);

    expect(calibration.frozenExpansion).toEqual(expect.arrayContaining(artifact.frozenPseoDimensions.map((item) => item.label)));
    expect(calibration.blockedClaims).toEqual(
      expect.arrayContaining([
        "precise career recommendation",
        "best career",
        "guaranteed career success",
        "career success prediction",
        "AI career planning",
        "hiring suitability",
        "diagnosis",
        "personality diagnosis",
      ])
    );
    expect(calibration.allowedClaimLanguage).toEqual(expect.arrayContaining(artifact.allowedLanguage));

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }
  });

  it("documents the freeze without adding public routes, sitemap, llms, or public copy changes", () => {
    const artifact = readJson<PseoFreezeArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "public route set",
        "sitemap URL set",
        "llms exposure",
        "runtime recommendation behavior",
        "checkout/payment/report entitlement logic",
        "assessment scoring",
        "profile or memory",
        "public copy without exact approved replacement",
      ])
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Public copy changed: no");
    expect(doc).toContain("pSEO expansion allowed: no");
    expect(doc).toContain("This PR does not rewrite them because no exact approved replacements were provided");
    expect(doc).toContain("Repository Rule Impact");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
