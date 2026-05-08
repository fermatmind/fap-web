import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/career-fit-graph-ai-claim-guards.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/career-fit-graph-ai-claim-guards.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-scb-state.json");
const SCAN_DIRS = ["app", "components", "lib", "docs/seo", "docs/geo", "docs/freemium"];
const TEXT_EXTENSIONS = new Set([".cjs", ".css", ".js", ".json", ".jsx", ".md", ".mdx", ".mjs", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);

type Artifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  sourceArtifacts: string[];
  guards: Array<{ id: string; status: string; category: string; priority: string; forbiddenPhrases: string[]; runtimeBehaviorChange: string }>;
  manualReviewTerms: Array<{ term: string; status: string; category: string; publicPrimaryPhraseAllowed: boolean; evidence: string }>;
  preferredAlternatives: string[];
  allowedBoundaryOccurrences: Array<{ phrase: string; file: string; reason: string }>;
  assertions: Record<string, boolean>;
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
  return SCAN_DIRS.flatMap(collectTextFiles).flatMap((file) => {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    return phrases.filter((phrase) => text.includes(phrase)).map((phrase) => ({ phrase, file }));
  });
}

describe("career fit graph and AI claim guards", () => {
  it("defines contract-only guards with no runtime behavior change", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.career_fit_graph_ai_claim_guards.v1");
    expect(artifact.scope).toBe("PR-SCB-04");
    expect(artifact.trainName).toBe("semantic-claim-boundary-enforcement-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.guards.map((guard) => guard.id)).toEqual([
      "career_fit_no_success_or_placement_guarantee",
      "confidence_no_certainty_claim",
      "graph_no_true_graph_overclaim",
      "ai_no_precise_career_planning_claim",
    ]);
    expect(artifact.guards.every((guard) => guard.status === "forbidden" && guard.category === "forbidden" && guard.priority === "P0")).toBe(true);
    expect(artifact.guards.every((guard) => guard.runtimeBehaviorChange === "none")).toBe(true);
  });

  it("anchors source artifacts and SCB train state", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const state = readJson<{ prs: Array<{ id: string; status: string; pr_url: string | null; merge_sha: string | null }> }>(TRAIN_STATE_PATH);

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }
    expect(state.prs.find((pr) => pr.id === "PR-SCB-03")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/732",
      merge_sha: "4f2f5aaff96412a4bb1817393f0e8b2ba666a887",
    });
    expect(["in_progress", "merged"]).toContain(state.prs.find((pr) => pr.id === "PR-SCB-04")?.status);
  });

  it("blocks exact unbounded career fit, confidence, graph, and AI overclaims", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const forbiddenPhrases = artifact.guards.flatMap((guard) => guard.forbiddenPhrases);
    const hits = findPhraseHits(forbiddenPhrases);
    const unboundedHits = hits.filter(
      (hit) => !artifact.allowedBoundaryOccurrences.some((allowed) => allowed.phrase === hit.phrase && allowed.file === hit.file)
    );

    expect(forbiddenPhrases).toEqual(expect.arrayContaining(["fit score guarantees success", "置信度等于保证", "完整语义知识图谱", "AI 精准职业规划"]));
    expect(unboundedHits).toEqual([]);
    expect(artifact.allowedBoundaryOccurrences).toEqual(expect.arrayContaining([expect.objectContaining({ phrase: "placement guarantee", file: "docs/geo/evidence-container-spec.md" })]));
  });

  it("classifies 岗位诊断 and role-fit diagnostics as manual decision terms", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.manualReviewTerms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ term: "岗位诊断", status: "needs_disclaimer", category: "needs_disclaimer", publicPrimaryPhraseAllowed: false, evidence: "lib/marketing/socialProof.ts" }),
        expect.objectContaining({ term: "role-fit diagnostics", status: "manual_review", category: "manual_review", publicPrimaryPhraseAllowed: false, evidence: "lib/marketing/socialProof.ts" }),
      ])
    );
    expect(artifact.preferredAlternatives).toEqual(expect.arrayContaining(["岗位适配分析", "职业方向分析", "职业适配参考", "岗位匹配参考", "职业探索建议"]));
  });

  it("documents no public copy or runtime change", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.assertions).toMatchObject({
      careerFitDoesNotGuaranteeSuccess: true,
      confidenceDoesNotMeanCertainty: true,
      sitemapLlmsSchemaDoesNotEqualTrueGraph: true,
      aiGeoIsNotAiCareerPlanning: true,
      roleFitDiagnosticsIsManualReviewUnlessBounded: true,
      publicCopyChanged: false,
      careerScoringChanged: false,
      explainabilityChanged: false,
      graphRuntimeChanged: false,
      aiGeoRuntimeChanged: false,
    });
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract guard plus manual-decision enforcement only.");
  });
});
