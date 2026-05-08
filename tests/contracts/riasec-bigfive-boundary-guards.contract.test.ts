import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/riasec-bigfive-boundary-guards.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/riasec-bigfive-boundary-guards.md");
const CLAIM_MATRIX_PATH = path.join(ROOT, "docs/claims/generated/public-claim-boundary-matrix.v1.json");
const RECOMMENDATION_GUARD_PATH = path.join(ROOT, "docs/assessment/uasp/generated/recommendation-eligibility-guard.v1.json");
const SCANNER_BASELINE_PATH = path.join(ROOT, "docs/claims/generated/semantic-claim-scanner-baseline.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-scb-state.json");

const CLAIM_STATUSES = ["allowed", "soft_allowed", "needs_disclaimer", "internal_only", "forbidden", "unknown"];
const SCANNER_CATEGORIES = ["forbidden", "soft_boundary", "needs_disclaimer", "allowed_reference", "manual_review"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];
const SCAN_DIRS = ["app", "components", "lib", "docs/seo", "docs/geo", "docs/freemium"];
const TEXT_EXTENSIONS = new Set([".cjs", ".css", ".js", ".json", ".jsx", ".md", ".mdx", ".mjs", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);

type ClaimStatus = (typeof CLAIM_STATUSES)[number];
type ScannerCategory = (typeof SCANNER_CATEGORIES)[number];
type Priority = (typeof PRIORITIES)[number];

type BoundaryGuard = {
  id: string;
  scale_code: "RIASEC" | "BIG5_OCEAN";
  signal_type: "interest" | "trait";
  recommendation_eligible: "candidate_signal" | "explanation_only";
  status: ClaimStatus;
  priority: Priority;
  forbiddenPhrases: string[];
  allowedBoundedPhrases: string[];
  allowedUse: string;
  notAllowedUse: string[];
  runtimeBehaviorChange: "none";
};

type BoundaryArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  claimStatusEnum: ClaimStatus[];
  priorityEnum: Priority[];
  scannerCategories: ScannerCategory[];
  sourceArtifacts: string[];
  guards: BoundaryGuard[];
  softLanguageInventory: Array<{ phrase: string; status: ClaimStatus; category: ScannerCategory; evidence: string }>;
  assertions: Record<string, boolean>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function collectTextFiles(dir: string): string[] {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.relative(ROOT, absolutePath);

    if (entry.isDirectory()) {
      if (entry.name === "generated" || entry.name === "node_modules" || entry.name === ".next") continue;
      files.push(...collectTextFiles(relativePath));
      continue;
    }

    if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
}

function findPhraseHits(phrases: string[]): Array<{ phrase: string; file: string }> {
  const files = SCAN_DIRS.flatMap(collectTextFiles);
  const hits: Array<{ phrase: string; file: string }> = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const phrase of phrases) {
      if (text.includes(phrase)) {
        hits.push({ phrase, file });
      }
    }
  }

  return hits;
}

describe("RIASEC and Big Five claim boundary guards", () => {
  it("defines contract-only boundary guards with approved enums", () => {
    const artifact = readJson<BoundaryArtifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.riasec_bigfive_boundary_guards.v1");
    expect(artifact.scope).toBe("PR-SCB-02");
    expect(artifact.trainName).toBe("semantic-claim-boundary-enforcement-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_guard_only");
    expect(artifact.claimStatusEnum).toEqual(CLAIM_STATUSES);
    expect(artifact.priorityEnum).toEqual(PRIORITIES);
    expect(artifact.scannerCategories).toEqual(SCANNER_CATEGORIES);

    for (const guard of artifact.guards) {
      expect(CLAIM_STATUSES).toContain(guard.status);
      expect(PRIORITIES).toContain(guard.priority);
      expect(guard.runtimeBehaviorChange).toBe("none");
      expect(guard.forbiddenPhrases.length).toBeGreaterThan(0);
      expect(guard.allowedBoundedPhrases.length).toBeGreaterThan(0);
    }
  });

  it("anchors required source artifacts and SCB train state", () => {
    const artifact = readJson<BoundaryArtifact>(ARTIFACT_PATH);
    const state = readJson<{ prs: Array<{ id: string; status: string; pr_url: string | null; merge_sha: string | null }> }>(TRAIN_STATE_PATH);

    expect(fs.existsSync(CLAIM_MATRIX_PATH)).toBe(true);
    expect(fs.existsSync(RECOMMENDATION_GUARD_PATH)).toBe(true);
    expect(fs.existsSync(SCANNER_BASELINE_PATH)).toBe(true);
    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }

    const pr1 = state.prs.find((pr) => pr.id === "PR-SCB-01");
    const pr2 = state.prs.find((pr) => pr.id === "PR-SCB-02");
    expect(pr1).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/730",
      merge_sha: "a3b7536591cdd92dca691393d69b27d77eadf340",
    });
    expect(["in_progress", "merged"]).toContain(pr2?.status);
  });

  it("keeps RIASEC as candidate_signal and not a recommender", () => {
    const artifact = readJson<BoundaryArtifact>(ARTIFACT_PATH);
    const recommendationGuard = readJson<{
      firstBatchRecommendationStatus: Array<{ scale_code: string; uaspRecommendationEligible: string; guardStatus: string; allowedUse: string; notAllowedUse: string[] }>;
    }>(RECOMMENDATION_GUARD_PATH);
    const guard = artifact.guards.find((item) => item.scale_code === "RIASEC");
    const uasp = recommendationGuard.firstBatchRecommendationStatus.find((item) => item.scale_code === "RIASEC");

    expect(guard).toMatchObject({
      signal_type: "interest",
      recommendation_eligible: "candidate_signal",
      allowedUse: "career_interest_direction_candidate_signal",
    });
    expect(guard?.forbiddenPhrases).toEqual(
      expect.arrayContaining([
        "RIASEC 精准推荐最适合职业",
        "RIASEC 精准职业推荐",
        "RIASEC 最适合职业",
        "RIASEC 自动匹配最佳工作",
        "RIASEC precise recommender",
        "RIASEC best-career recommendation",
      ])
    );
    expect(guard?.allowedBoundedPhrases).toEqual(expect.arrayContaining(["career interest direction", "职业兴趣方向", "职业探索方向", "candidate signal"]));
    expect(uasp).toMatchObject({
      uaspRecommendationEligible: "candidate_signal",
      guardStatus: "candidate_signal_not_recommender",
      allowedUse: "career_interest_direction_candidate_signal",
    });
    expect(uasp?.notAllowedUse).toEqual(expect.arrayContaining(["precise_best_career_recommendation", "complete_career_recommender"]));
  });

  it("keeps Big Five as explanation_only and not a career recommender", () => {
    const artifact = readJson<BoundaryArtifact>(ARTIFACT_PATH);
    const recommendationGuard = readJson<{
      firstBatchRecommendationStatus: Array<{ scale_code: string; uaspRecommendationEligible: string; guardStatus: string; allowedUse: string; notAllowedUse: string[] }>;
    }>(RECOMMENDATION_GUARD_PATH);
    const guard = artifact.guards.find((item) => item.scale_code === "BIG5_OCEAN");
    const uasp = recommendationGuard.firstBatchRecommendationStatus.find((item) => item.scale_code === "BIG5_OCEAN");

    expect(guard).toMatchObject({
      signal_type: "trait",
      recommendation_eligible: "explanation_only",
      allowedUse: "trait_and_workplace_behavior_explanation",
    });
    expect(guard?.forbiddenPhrases).toEqual(
      expect.arrayContaining([
        "Big Five 精准匹配职业",
        "大五人格 精准匹配职业",
        "Big Five career matcher",
        "Big Five career recommender",
        "Big Five precise career match",
      ])
    );
    expect(guard?.allowedBoundedPhrases).toEqual(expect.arrayContaining(["trait explanation", "workplace behavior", "职场行为倾向", "人格特质解释"]));
    expect(uasp).toMatchObject({
      uaspRecommendationEligible: "explanation_only",
      guardStatus: "not_recommender",
      allowedUse: "trait_and_workplace_behavior_explanation",
    });
    expect(uasp?.notAllowedUse).toEqual(expect.arrayContaining(["precise_career_matching"]));
  });

  it("fails if exact forbidden RIASEC or Big Five recommender phrases appear in runtime scan scope", () => {
    const artifact = readJson<BoundaryArtifact>(ARTIFACT_PATH);
    const forbiddenPhrases = artifact.guards.flatMap((guard) => guard.forbiddenPhrases);
    const hits = findPhraseHits(forbiddenPhrases);

    expect(hits).toEqual([]);
  });

  it("documents soft language as inventory rather than auto-remediation", () => {
    const artifact = readJson<BoundaryArtifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.softLanguageInventory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phrase: "Big Five career direction", status: "soft_allowed", category: "soft_boundary" }),
        expect.objectContaining({ phrase: "大五人格职业方向", status: "soft_allowed", category: "soft_boundary" }),
      ])
    );
    expect(artifact.assertions).toMatchObject({
      riasecIsCandidateSignalNotRecommender: true,
      bigFiveIsExplanationOnlyNotRecommender: true,
      forbiddenPhrasesFailRuntimeScan: true,
      softLanguageInventoriedNotRewritten: true,
      visibleCopyChanged: false,
      recommendationRuntimeChanged: false,
      scoringChanged: false,
      seoGeoExposureChanged: false,
    });
    expect(doc).toContain("Existing soft language is inventoried, not rewritten in this PR.");
    expect(doc).toContain("Runtime behavior changed: no");
  });
});
