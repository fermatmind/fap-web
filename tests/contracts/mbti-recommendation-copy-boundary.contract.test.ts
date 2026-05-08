import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/mbti-recommendation-copy-boundary.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/mbti-recommendation-copy-boundary.md");
const RECOMMENDATION_GUARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/recommendation-eligibility-guard.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-scb-state.json");
const SCAN_DIRS = ["app", "components", "lib", "docs/seo", "docs/geo", "docs/freemium"];
const TEXT_EXTENSIONS = new Set([".cjs", ".css", ".js", ".json", ".jsx", ".md", ".mdx", ".mjs", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);
const CLAIM_STATUSES = ["allowed", "soft_allowed", "needs_disclaimer", "internal_only", "forbidden", "unknown"];
const SCANNER_CATEGORIES = ["forbidden", "soft_boundary", "needs_disclaimer", "allowed_reference", "manual_review"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];

type MbtiBoundaryArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  claimStatusEnum: string[];
  priorityEnum: string[];
  scannerCategories: string[];
  sourceArtifacts: string[];
  guard: {
    scale_code: "MBTI";
    signal_type: "identity";
    recommendation_eligible: "next_step_only";
    forbiddenPhrases: string[];
    allowedBoundedPhrases: string[];
    allowedUse: string;
    notAllowedUse: string[];
    runtimeBehaviorChange: "none";
  };
  softBoundaryPhrases: string[];
  softLanguageInventory: Array<{ phrase: string; status: string; category: string; evidence: string }>;
  allowedBoundaryOccurrences: Array<{ phrase: string; file: string; reason: string }>;
  assertions: Record<string, boolean | string>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function collectTextFiles(dir: string): string[] {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.relative(ROOT, absolutePath);

    if (entry.isDirectory()) {
      if (entry.name === "generated" || entry.name === "node_modules" || entry.name === ".next") return [];
      return collectTextFiles(relativePath);
    }

    return entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [relativePath] : [];
  });
}

function findPhraseHits(phrases: string[]): Array<{ phrase: string; file: string }> {
  const files = SCAN_DIRS.flatMap(collectTextFiles);
  const hits: Array<{ phrase: string; file: string }> = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const phrase of phrases) {
      if (text.includes(phrase)) hits.push({ phrase, file });
    }
  }

  return hits;
}

describe("MBTI recommendation copy boundary", () => {
  it("defines a contract-only MBTI recommendation boundary with approved enums", () => {
    const artifact = readJson<MbtiBoundaryArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.mbti_recommendation_copy_boundary.v1");
    expect(artifact.scope).toBe("PR-SCB-03");
    expect(artifact.trainName).toBe("semantic-claim-boundary-enforcement-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_guard_only");
    expect(artifact.claimStatusEnum).toEqual(CLAIM_STATUSES);
    expect(artifact.priorityEnum).toEqual(PRIORITIES);
    expect(artifact.scannerCategories).toEqual(SCANNER_CATEGORIES);
    expect(artifact.guard.runtimeBehaviorChange).toBe("none");
  });

  it("anchors source artifacts and SCB train state", () => {
    const artifact = readJson<MbtiBoundaryArtifact>(ARTIFACT_PATH);
    const state = readJson<{ prs: Array<{ id: string; status: string; pr_url: string | null; merge_sha: string | null }> }>(TRAIN_STATE_PATH);

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }

    expect(state.prs.find((pr) => pr.id === "PR-SCB-02")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/731",
      merge_sha: "017f8cbbc0daf59d91f2a5908cd881eb7451b93e",
    });
    expect(["in_progress", "merged"]).toContain(state.prs.find((pr) => pr.id === "PR-SCB-03")?.status);
  });

  it("keeps MBTI recommendation as next_step_only snapshot direction support", () => {
    const artifact = readJson<MbtiBoundaryArtifact>(ARTIFACT_PATH);
    const recommendationGuard = readJson<{
      firstBatchRecommendationStatus: Array<{ scale_code: string; uaspRecommendationEligible: string; allowedUse: string; notAllowedUse: string[] }>;
    }>(RECOMMENDATION_GUARD_PATH);
    const mbti = recommendationGuard.firstBatchRecommendationStatus.find((item) => item.scale_code === "MBTI");

    expect(artifact.guard).toMatchObject({
      scale_code: "MBTI",
      signal_type: "identity",
      recommendation_eligible: "next_step_only",
      allowedUse: "snapshot_based_career_direction_support",
    });
    expect(mbti).toMatchObject({
      uaspRecommendationEligible: "next_step_only",
      allowedUse: "snapshot_based_career_direction_support",
    });
    expect(mbti?.notAllowedUse).toEqual(expect.arrayContaining(["live_personalized_recommender", "career_success_predictor", "precise_career_recommendation"]));
    expect(artifact.assertions).toMatchObject({
      mbtiRecommendationEligible: "next_step_only",
      mbtiRecommendationIsSnapshotDirectionSupport: true,
      snapshotRecommendationIsNotLivePersonalizedRecommender: true,
      mbtiDoesNotPredictCareerSuccess: true,
    });
  });

  it("contains the required forbidden and allowed phrase fixtures", () => {
    const artifact = readJson<MbtiBoundaryArtifact>(ARTIFACT_PATH);

    expect(artifact.guard.forbiddenPhrases).toEqual(
      expect.arrayContaining([
        "live personalized recommender",
        "实时个性化职业推荐",
        "精准职业推荐",
        "精准匹配职业",
        "最佳职业预测",
        "最适合职业",
        "职业成功预测",
        "MBTI predicts career success",
      ])
    );
    expect(artifact.guard.allowedBoundedPhrases).toEqual(
      expect.arrayContaining(["职业方向参考", "探索路径", "职业探索建议", "snapshot-based direction support", "基于当前公开快照的方向支持", "decision support", "next step"])
    );
    expect(artifact.softBoundaryPhrases).toEqual(expect.arrayContaining(["career recommendation", "职业推荐", "recommendations", "match best", "高匹配方向"]));
  });

  it("fails if exact forbidden MBTI recommendation claims appear in runtime scan scope", () => {
    const artifact = readJson<MbtiBoundaryArtifact>(ARTIFACT_PATH);
    const hits = findPhraseHits(artifact.guard.forbiddenPhrases);
    const unboundedHits = hits.filter(
      (hit) => !artifact.allowedBoundaryOccurrences.some((allowed) => allowed.phrase === hit.phrase && allowed.file === hit.file)
    );

    expect(unboundedHits).toEqual([]);
    expect(artifact.allowedBoundaryOccurrences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phrase: "live personalized recommender",
          file: "lib/geo/evidenceContainer.ts",
        }),
      ])
    );
  });

  it("inventories soft-boundary recommendation terms without rewriting visible copy", () => {
    const artifact = readJson<MbtiBoundaryArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.softLanguageInventory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phrase: "高匹配方向", status: "needs_disclaimer", category: "needs_disclaimer" }),
        expect.objectContaining({ phrase: "match best", status: "needs_disclaimer", category: "needs_disclaimer" }),
        expect.objectContaining({ phrase: "career recommendation / 职业推荐", status: "soft_allowed", category: "soft_boundary" }),
      ])
    );
    expect(artifact.assertions).toMatchObject({
      softBoundaryPhrasesInventoriedNotRewritten: true,
      visibleCopyChanged: false,
      recommendationRuntimeChanged: false,
      careerRecommendationBundleChanged: false,
      matchedJobsChanged: false,
      scoringChanged: false,
      explainabilityChanged: false,
    });
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR does not alter the MBTI recommendation runtime");
  });
});
