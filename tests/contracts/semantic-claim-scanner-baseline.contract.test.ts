import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/semantic-claim-scanner-baseline.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/semantic-claim-scanner-baseline.md");
const TRAIN_MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train-scb.yaml");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-scb-state.json");
const WORKSTATION_PATH_REDACTION_FILES = [
  "docs/claims/generated/semantic-claim-scanner-baseline.v1.json",
  "docs/claims/semantic-claim-scanner-baseline.md",
  "docs/codex/pr-train-scb-state.json",
  "docs/codex/pr-train-scb.yaml",
  "docs/codex/pr-train-uasp2b-state.json",
  "docs/codex/pr-train-uasp2b.yaml",
  "docs/mbti-desktop-first-screen-convergence.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
];

const CLAIM_STATUSES = ["allowed", "soft_allowed", "needs_disclaimer", "internal_only", "forbidden", "unknown"];
const SCANNER_CATEGORIES = ["forbidden", "soft_boundary", "needs_disclaimer", "allowed_reference", "manual_review"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];

type ScannerCategory = (typeof SCANNER_CATEGORIES)[number];
type ClaimStatus = (typeof CLAIM_STATUSES)[number];
type Priority = (typeof PRIORITIES)[number];

type PhraseFixture = {
  id: string;
  category: ScannerCategory;
  status: ClaimStatus;
  priority: Priority;
  phrases: string[];
};

type ScannerBaseline = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  manualDecisionSources: string[];
  claimStatusEnum: ClaimStatus[];
  priorityEnum: Priority[];
  scannerCategories: ScannerCategory[];
  scanScope: {
    repoLocal: string[];
    externalEvidenceOnly: string[];
    ciExternalPresenceRequired: boolean;
  };
  ignoredGeneratedFilePolicy: {
    ignoreFixtureAndGuardFiles: boolean;
    paths: string[];
    reason: string;
  };
  manualDecisionTerms: Array<{
    term: string;
    defaultStatus: ClaimStatus;
    category: ScannerCategory;
    publicMainTermAllowed: boolean;
  }>;
  fixtures: PhraseFixture[];
  sourceFileInventory: Array<{ path: string; type: string; required: boolean }>;
  nonRuntimeChangeGuarantees: Record<string, boolean>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function phrasesForCategory(artifact: ScannerBaseline, category: ScannerCategory): string[] {
  return artifact.fixtures
    .filter((fixture) => fixture.category === category)
    .flatMap((fixture) => fixture.phrases);
}

describe("semantic claim scanner baseline", () => {
  it("registers the SCB train manifest and state", () => {
    const manifest = fs.readFileSync(TRAIN_MANIFEST_PATH, "utf8");
    const state = readJson<{
      train_name: string;
      pr_namespace: string;
      prs: Array<{ id: string; branch: string; status: string; depends_on: string[] }>;
    }>(TRAIN_STATE_PATH);

    expect(manifest).toContain("train_name: semantic-claim-boundary-enforcement-train");
    expect(manifest).toContain("pr_namespace: PR-SCB-*");
    expect(state.train_name).toBe("semantic-claim-boundary-enforcement-train");
    expect(state.pr_namespace).toBe("PR-SCB-*");
    expect(state.prs.map((pr) => pr.id)).toEqual(["PR-SCB-01", "PR-SCB-02", "PR-SCB-03", "PR-SCB-04", "PR-SCB-05", "PR-SCB-06"]);
    expect(["in_progress", "merged"]).toContain(state.prs[0]?.status);
    expect(state.prs[0]).toMatchObject({
      branch: "codex/pr-scb-01-claim-scanner-baseline",
      depends_on: [],
    });
  });

  it("uses only approved claim statuses, priorities, and scanner categories", () => {
    const artifact = readJson<ScannerBaseline>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.semantic_claim_scanner_baseline.v1");
    expect(artifact.scope).toBe("PR-SCB-01");
    expect(artifact.trainName).toBe("semantic-claim-boundary-enforcement-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("contract_scanner_only");
    expect(artifact.claimStatusEnum).toEqual(CLAIM_STATUSES);
    expect(artifact.priorityEnum).toEqual(PRIORITIES);
    expect(artifact.scannerCategories).toEqual(SCANNER_CATEGORIES);

    for (const fixture of artifact.fixtures) {
      expect(SCANNER_CATEGORIES).toContain(fixture.category);
      expect(CLAIM_STATUSES).toContain(fixture.status);
      expect(PRIORITIES).toContain(fixture.priority);
      expect(fixture.phrases.length, fixture.id).toBeGreaterThan(0);
    }

    for (const decision of artifact.manualDecisionTerms) {
      expect(CLAIM_STATUSES).toContain(decision.defaultStatus);
      expect(SCANNER_CATEGORIES).toContain(decision.category);
    }
  });

  it("encodes the human-approved manual decisions", () => {
    const artifact = readJson<ScannerBaseline>(ARTIFACT_PATH);
    const byTerm = new Map(artifact.manualDecisionTerms.map((term) => [term.term, term]));

    expect(artifact.manualDecisionSources).toEqual([
      "<external-evidence>/semantic_claim_boundary_manual_decisions_v1.md",
      "<external-evidence>/semantic_claim_boundary_manual_decisions_v1.json",
    ]);
    expect(byTerm.get("岗位诊断")).toMatchObject({
      defaultStatus: "needs_disclaimer",
      category: "needs_disclaimer",
      publicMainTermAllowed: false,
    });
    expect(byTerm.get("职业匹配")).toMatchObject({
      defaultStatus: "soft_allowed",
      category: "soft_boundary",
      publicMainTermAllowed: true,
    });
    expect(byTerm.get("match best / 高匹配方向")).toMatchObject({
      defaultStatus: "needs_disclaimer",
      category: "needs_disclaimer",
      publicMainTermAllowed: false,
    });
    expect(byTerm.get("guarantee / 保证 / 保障")).toMatchObject({
      defaultStatus: "unknown",
      category: "manual_review",
    });
  });

  it("redacts developer workstation paths from scoped claim and train docs", () => {
    for (const relativePath of WORKSTATION_PATH_REDACTION_FILES) {
      const contents = fs.readFileSync(path.join(ROOT, relativePath), "utf8");

      expect(contents, relativePath).not.toMatch(/\/Users\/[A-Za-z0-9._-]+\//);
      expect(contents, relativePath).not.toMatch(/C:\\Users\\[A-Za-z0-9._-]+\\/);
    }
  });

  it("contains required forbidden and soft-boundary phrase fixtures", () => {
    const artifact = readJson<ScannerBaseline>(ARTIFACT_PATH);
    const forbidden = phrasesForCategory(artifact, "forbidden");
    const soft = phrasesForCategory(artifact, "soft_boundary");
    const needsDisclaimer = phrasesForCategory(artifact, "needs_disclaimer");
    const manualReview = phrasesForCategory(artifact, "manual_review");

    expect(forbidden).toEqual(
      expect.arrayContaining([
        "RIASEC 精准推荐最适合职业",
        "Big Five 精准匹配职业",
        "AI 精准职业规划",
        "精准职业匹配",
        "最适合职业匹配",
        "职业成功匹配",
        "职业成功保证",
        "结果准确保证",
        "报告结论保证",
        "live personalized recommender",
        "frontend recommendation engine",
      ])
    );
    expect(soft).toEqual(
      expect.arrayContaining(["职业匹配", "高匹配方向", "match best", "recommendations", "career fit", "fit score", "confidence", "岗位诊断", "role-fit diagnostics", "guarantee"])
    );
    expect(needsDisclaimer).toEqual(expect.arrayContaining(["岗位诊断", "高匹配方向", "career fit", "fit score", "confidence", "guarantee"]));
    expect(manualReview).toEqual(expect.arrayContaining(["诊断", "diagnostic", "AI", "guarantee", "best", "match"]));
  });

  it("defines scanner scope and external evidence policy without requiring sibling repos in CI", () => {
    const artifact = readJson<ScannerBaseline>(ARTIFACT_PATH);

    expect(artifact.scanScope.repoLocal).toEqual(["app/**", "components/**", "lib/**", "docs/seo/**", "docs/geo/**", "docs/freemium/**"]);
    expect(artifact.scanScope.externalEvidenceOnly).toEqual(
      expect.arrayContaining([
        "<workspace>/fap-api/content_packages/**",
        "<workspace>/fap-api/backend/content_packs/**",
      ])
    );
    expect(artifact.scanScope.ciExternalPresenceRequired).toBe(false);
    expect(artifact.ignoredGeneratedFilePolicy.ignoreFixtureAndGuardFiles).toBe(true);
    expect(artifact.ignoredGeneratedFilePolicy.paths).toEqual(expect.arrayContaining(["docs/claims/**", "tests/contracts/**", "docs/codex/**"]));
  });

  it("anchors required source artifacts and records no runtime behavior changes", () => {
    const artifact = readJson<ScannerBaseline>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    for (const source of artifact.sourceFileInventory.filter((item) => item.required)) {
      expect(fs.existsSync(path.join(ROOT, source.path)), source.path).toBe(true);
    }
    expect(Object.values(artifact.nonRuntimeChangeGuarantees).every((value) => value === false)).toBe(true);
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Existing soft-boundary phrases are inventoried, not remediated.");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
