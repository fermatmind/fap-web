import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/public-claim-boundary-matrix.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/public-claim-boundary-matrix.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type ClaimStatus = "allowed" | "soft_allowed" | "needs_disclaimer" | "internal_only" | "forbidden";

type ClaimSource = {
  path: string;
  requiredTokens: string[];
};

type ClaimRow = {
  id: string;
  claimArea: string;
  claimText: string;
  status: ClaimStatus;
  pageFamilies: string[];
  sourceFiles: ClaimSource[];
  backendSupport: string;
  runtimeEvidence: string;
  frontendInvented: boolean;
  riskLevel: string;
  boundaryRule: string;
  blocksWhen: string;
  requiredAuthority: string;
};

type ClaimArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  claimBoundaryEnum: ClaimStatus[];
  requiredClaimAreas: string[];
  hardRules: string[];
  defaultForbiddenClaims: string[];
  allowedWithBoundary: string[];
  rows: ClaimRow[];
};

function readArtifact(): ClaimArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as ClaimArtifact;
}

describe("public claim runtime boundary matrix", () => {
  it("registers PR-PRAC-04 after PR-PRAC-03 in train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      claim_boundary_enum: ClaimStatus[];
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-convergence-train");
    expect(state.claim_boundary_enum).toEqual(["allowed", "soft_allowed", "needs_disclaimer", "internal_only", "forbidden"]);
    expect(byId.get("PR-PRAC-03")).toMatchObject({ status: "merged" });
    const prac04 = byId.get("PR-PRAC-04");
    expect(prac04).toMatchObject({
      branch: "codex/pr-prac-04-claim-runtime-boundary",
      depends_on: ["PR-PRAC-03"],
    });
    expect(["in_progress", "merged"]).toContain(prac04?.status);
  });

  it("uses only the frozen claim boundary taxonomy", () => {
    const artifact = readArtifact();
    const allowed = new Set(artifact.claimBoundaryEnum);

    expect(artifact.version).toBe("runtime.public_claim_boundary_matrix.v1");
    expect(artifact.scope).toBe("PR-PRAC-04");
    expect(artifact.trainName).toBe("public-runtime-authority-convergence-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.claimBoundaryEnum).toEqual([
      "allowed",
      "soft_allowed",
      "needs_disclaimer",
      "internal_only",
      "forbidden",
    ]);

    for (const row of artifact.rows) {
      expect(allowed.has(row.status), row.id).toBe(true);
      expect(row.claimText.trim(), row.id).not.toBe("");
      expect(row.pageFamilies.length, row.id).toBeGreaterThan(0);
      expect(row.sourceFiles.length, row.id).toBeGreaterThan(0);
      expect(row.backendSupport.trim(), row.id).not.toBe("");
      expect(row.runtimeEvidence.trim(), row.id).not.toBe("");
      expect(row.boundaryRule.trim(), row.id).not.toBe("");
      expect(row.blocksWhen.trim(), row.id).not.toBe("");
      expect(row.requiredAuthority.trim(), row.id).not.toBe("");
    }
  });

  it("covers every required claim area", () => {
    const artifact = readArtifact();
    const areas = new Set(artifact.rows.map((row) => row.claimArea));

    for (const area of artifact.requiredClaimAreas) {
      expect(areas.has(area), area).toBe(true);
    }
  });

  it("locks the forbidden claim baseline", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    expect(artifact.defaultForbiddenClaims).toEqual(
      expect.arrayContaining([
        "RIASEC 精准推荐最适合职业",
        "Big Five 精准匹配职业",
        "AI 精准职业规划",
        "career fit score 等于录用/成功保证",
        "snapshot recommendation 等于 personalized recommender",
        "sitemap/llms/schema 等于真实 graph",
        "frontend local ranking 等于 recommendation engine",
      ])
    );

    const forbiddenIds = [
      "riasec_precise_best_career_recommendation",
      "big5_precise_career_match",
      "ai_precise_career_planning",
      "career_fit_success_guarantee",
      "snapshot_as_personalized_recommender",
      "sitemap_llms_schema_as_true_graph",
      "frontend_local_ranking_as_recommendation_engine",
    ];

    for (const id of forbiddenIds) {
      const row = byId.get(id);
      expect(row, id).toBeDefined();
      expect(row?.status, id).toBe("forbidden");
      expect(row?.riskLevel, id).toBe("P0");
      expect(row?.blocksWhen.toLowerCase(), id).toMatch(/public|copy|runtime|schema|recommendation|fit|paywall|sitemap|llms/);
    }
  });

  it("locks allowed and soft-allowed semantic claims with boundaries", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    expect(artifact.allowedWithBoundary).toEqual(
      expect.arrayContaining([
        "RIASEC 描述职业兴趣方向",
        "Big Five 解释行为倾向和职场风格",
        "MBTI 描述偏好、表达风格、身份感",
        "Career Graph 使用职业结构、任务、技能和证据生成评分",
        "MBTI career recommendation 作为 snapshot-based career direction support",
      ])
    );

    expect(byId.get("riasec_interest_direction")).toMatchObject({
      status: "allowed",
      boundaryRule: "interest_direction_only",
    });
    expect(byId.get("big5_workplace_behavior")).toMatchObject({
      status: "allowed",
      boundaryRule: "behavior_tendency_not_career_match",
    });
    expect(byId.get("mbti_preferences_expression_identity")).toMatchObject({
      status: "allowed",
      boundaryRule: "preference_identity_not_destiny",
    });
    expect(byId.get("career_graph_scoring_evidence")).toMatchObject({
      status: "allowed",
      boundaryRule: "backend_claim_permission_required",
    });
    expect(byId.get("mbti_career_snapshot_direction")).toMatchObject({
      status: "soft_allowed",
      boundaryRule: "snapshot_direction_not_live_personalized",
    });
  });

  it("anchors claim rows to current source tokens", () => {
    const artifact = readArtifact();

    for (const row of artifact.rows) {
      if (row.id === "riasec_interest_direction") {
        const catalogSource = fs.readFileSync(path.join(ROOT, "lib/content.ts"), "utf8");
        const iaContractSource = fs.readFileSync(
          path.join(ROOT, "tests/contracts/riasec-public-ia.contract.test.ts"),
          "utf8"
        );

        // PR-PRAC-04 is a frozen historical artifact. Its RIASEC row originally
        // pointed at the removed frontend catalog seed. Current evidence is the
        // backend catalog normalization boundary and its no-fallback contract.
        expect(catalogSource).toContain("apiClient.getPublic");
        expect(catalogSource).toContain("SCALE_CANONICAL_SLUG_MAP[scaleCode]");
        expect(catalogSource).toContain("normalizeSupportedScaleCode");
        expect(catalogSource).not.toContain("FALLBACK_PUBLIC_TEST_SEEDS");
        expect(catalogSource).not.toContain("霍兰德职业兴趣测试（RIASEC）");
        expect(iaContractSource).toContain(
          "keeps backend RIASEC catalog rows normalized to the canonical scale slug"
        );
        expect(iaContractSource).toContain("SCALE_CANONICAL_SLUG_MAP[scaleCode]");
        continue;
      }

      for (const source of row.sourceFiles) {
        const absoluteSource = path.join(ROOT, source.path);
        expect(fs.existsSync(absoluteSource), `${row.id}: ${source.path}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");

        for (const token of source.requiredTokens) {
          expect(sourceText, `${row.id}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("documents claim boundaries without changing runtime behavior", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Explicitly Forbidden Claims");
    expect(doc).toContain("Allowed With Boundary");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
