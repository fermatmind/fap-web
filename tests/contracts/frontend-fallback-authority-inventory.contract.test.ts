import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/runtime/generated/frontend-fallback-authority-inventory.v1.json");
const DOC_PATH = path.join(ROOT, "docs/runtime/frontend-fallback-authority-inventory.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type FallbackClassification =
  | "safe_static"
  | "product_code_only"
  | "compatibility_wrapper"
  | "watchlist"
  | "migration_required"
  | "forbidden";

type FallbackRow = {
  id: string;
  surface: string;
  sources: string[];
  requiredSourceTokens: string[];
  classification: FallbackClassification;
  canBecomePublicTruth: boolean;
  seoGeoRisk: boolean;
  graphRisk: boolean;
  recommendationRisk: boolean;
  claimBoundaryRisk: boolean;
  expansionGate: string;
  requiredFinalAuthority: string;
  currentAllowance: string;
  blocksWhen: string;
};

type FallbackArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  fallbackClassificationEnum: FallbackClassification[];
  hardRules: string[];
  requiredFallbacks: string[];
  rows: FallbackRow[];
};

function readArtifact(): FallbackArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as FallbackArtifact;
}

describe("frontend fallback authority inventory", () => {
  it("registers PR-PRAC-03 after PR-PRAC-02 in train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-convergence-train");
    expect(byId.get("PR-PRAC-02")).toMatchObject({ status: "merged" });
    const prac03 = byId.get("PR-PRAC-03");
    expect(prac03).toMatchObject({
      branch: "codex/pr-prac-03-fallback-authority-lockdown",
      depends_on: ["PR-PRAC-02"],
    });
    expect(["in_progress", "merged"]).toContain(prac03?.status);
  });

  it("uses only the frozen fallback classification taxonomy", () => {
    const artifact = readArtifact();
    const allowed = new Set(artifact.fallbackClassificationEnum);

    expect(artifact.version).toBe("runtime.frontend_fallback_authority_inventory.v1");
    expect(artifact.scope).toBe("PR-PRAC-03");
    expect(artifact.trainName).toBe("public-runtime-authority-convergence-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.fallbackClassificationEnum).toEqual([
      "safe_static",
      "product_code_only",
      "compatibility_wrapper",
      "watchlist",
      "migration_required",
      "forbidden",
    ]);

    for (const row of artifact.rows) {
      expect(allowed.has(row.classification), row.id).toBe(true);
      expect(row.surface.trim(), row.id).not.toBe("");
      expect(row.sources.length, row.id).toBeGreaterThan(0);
      expect(row.expansionGate.trim(), row.id).not.toBe("");
      expect(row.requiredFinalAuthority.trim(), row.id).not.toBe("");
      expect(row.currentAllowance.trim(), row.id).not.toBe("");
      expect(row.blocksWhen.trim(), row.id).not.toBe("");
    }
  });

  it("covers the required fallback gates", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    for (const required of artifact.requiredFallbacks) {
      expect(byId.has(required), required).toBe(true);
    }

    expect(byId.get("test_metadata_faq_cta_fallback")).toMatchObject({
      classification: "migration_required",
      expansionGate: "no_new_test_or_scale_fallback_without_backend_authority",
    });
    expect(byId.get("topic_cta_fallback")).toMatchObject({
      classification: "migration_required",
      expansionGate: "no_topic_expansion_with_frontend_cta_truth",
    });
    expect(byId.get("personality_fallback_projection")).toMatchObject({
      classification: "migration_required",
    });
    expect(byId.get("article_jsonld_fallback")).toMatchObject({
      classification: "migration_required",
    });
    expect(byId.get("llms_topic_fallback")).toMatchObject({
      classification: "migration_required",
    });
    expect(byId.get("static_sitemap_layer")).toMatchObject({
      classification: "compatibility_wrapper",
    });
    expect(byId.get("local_recommendation_engine_placeholder")).toMatchObject({
      classification: "forbidden",
      canBecomePublicTruth: false,
    });
  });

  it("anchors tracked fallbacks to current source tokens", () => {
    const artifact = readArtifact();

    for (const row of artifact.rows) {
      for (const source of row.sources) {
        const absoluteSource = path.join(ROOT, source);
        expect(fs.existsSync(absoluteSource), `${row.id}: ${source}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");

        for (const token of row.requiredSourceTokens) {
          expect(sourceText, `${row.id}: ${source} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("enforces migration-required and forbidden fallback rules as contract data", () => {
    const artifact = readArtifact();

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "migration_required fallback cannot be silently added for new scale/test/page family",
        "forbidden fallback blocks merge when it becomes public authority",
        "frontend fallback cannot become SEO truth",
        "frontend fallback cannot become graph truth",
        "frontend fallback cannot become recommendation truth",
      ])
    );

    const forbiddenRows = artifact.rows.filter((row) => row.classification === "forbidden");
    expect(forbiddenRows.length).toBeGreaterThanOrEqual(2);
    for (const row of forbiddenRows) {
      expect(row.canBecomePublicTruth, row.id).toBe(false);
      expect(row.blocksWhen.toLowerCase(), row.id).toMatch(/public|frontend|authority|recommendation|graph/);
    }

    const migrationRows = artifact.rows.filter((row) => row.classification === "migration_required");
    expect(migrationRows.length).toBeGreaterThanOrEqual(5);
    for (const row of migrationRows) {
      expect(row.expansionGate, row.id).toMatch(/^no_|^must_/);
    }
  });

  it("documents fallback lockdown without changing runtime behavior", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Fallback Inventory");
    expect(doc).toContain("migration_required");
    expect(doc).toContain("forbidden");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("must remove existing fallbacks");
  });
});
