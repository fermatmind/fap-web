import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/runtime/generated/fallback-owner-gates.v1.json");
const DOC_PATH = path.join(ROOT, "docs/runtime/fallback-owner-gates.md");
const PHASE_1A_INVENTORY_PATH = path.join(ROOT, "docs/runtime/generated/frontend-fallback-authority-inventory.v1.json");
const PHASE_1B_MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train-phase-1b.yaml");
const PHASE_1B_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-phase-1b-state.json");

const STATUS_ENUM = [
  "complete",
  "ready_for_remediation",
  "partial",
  "blocked",
  "not_ready",
  "safe_to_defer",
  "dangerous_if_expanded",
  "requires_human_decision",
  "unknown",
] as const;

const PRIORITY_ENUM = ["P0", "P1", "P2", "P3"] as const;

const FALLBACK_CLASSIFICATION_ENUM = [
  "safe_static",
  "product_code_only",
  "compatibility_wrapper",
  "watchlist",
  "migration_required",
  "forbidden",
] as const;

const REQUIRED_FALLBACK_IDS = [
  "test_metadata_faq_cta_fallback",
  "topic_cta_fallback",
  "llms_topic_fallback",
  "personality_fallback_projection",
  "article_jsonld_fallback",
  "static_sitemap_layer",
  "local_recommendation_engine_placeholder",
  "test_catalog_seed_fallback",
  "homepage_forced_items",
] as const;

type Status = (typeof STATUS_ENUM)[number];
type Priority = (typeof PRIORITY_ENUM)[number];
type FallbackClassification = (typeof FALLBACK_CLASSIFICATION_ENUM)[number];

type SourceFileGate = {
  path: string;
  requiredTokens: string[];
};

type FallbackOwnerGateRow = {
  id: string;
  surface: string;
  currentOwner: string;
  desiredOwner: string;
  classification: FallbackClassification;
  status: Status;
  priority: Priority;
  allowedDuration: string;
  intendedReplacement: string;
  replacementAuthority: string;
  sourceFiles: SourceFileGate[];
  expansionGate: string;
  blocksWhen: string;
  canBecomePublicTruth: boolean;
  blocksUniversalAssessmentSignalPlatform: boolean;
  runtimeBehaviorChangeRequired: boolean;
  risk: string;
};

type SourcePatternGate = {
  source: string;
  requiredTokens: string[];
  coveredByFallbackId: string;
};

type FutureSurfaceGate = {
  id: string;
  appliesTo: string[];
  requiredBeforeMerge: string[];
  blocksWhen: string;
};

type FallbackOwnerGateArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  sourceArtifacts: string[];
  statusEnum: Status[];
  priorityEnum: Priority[];
  fallbackClassificationEnum: FallbackClassification[];
  requiredFallbackIds: string[];
  ownerGateRequiredFields: string[];
  hardRules: string[];
  futureSurfaceGates: FutureSurfaceGate[];
  sourcePatternGates: SourcePatternGate[];
  rows: FallbackOwnerGateRow[];
};

type Phase1AFallbackInventory = {
  rows: Array<{ id: string; classification: FallbackClassification }>;
};

function readArtifact(): FallbackOwnerGateArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as FallbackOwnerGateArtifact;
}

function readPhase1AInventory(): Phase1AFallbackInventory {
  return JSON.parse(fs.readFileSync(PHASE_1A_INVENTORY_PATH, "utf8")) as Phase1AFallbackInventory;
}

function expectNonEmpty(value: string, context: string) {
  expect(value.trim(), context).not.toBe("");
}

describe("fallback owner gates", () => {
  it("registers the additive Phase 1B train without overwriting the Phase 1A ledger", () => {
    const manifest = fs.readFileSync(PHASE_1B_MANIFEST_PATH, "utf8");
    const state = JSON.parse(fs.readFileSync(PHASE_1B_STATE_PATH, "utf8")) as {
      train_name: string;
      pr_namespace: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };

    expect(manifest).toContain("train_name: public-runtime-authority-phase-1b-remediation-train");
    expect(manifest).toContain("pr_namespace: PR-PRA1B-*");
    expect(manifest).toContain("codex/pr-pra1b-01-fallback-owner-gates");
    expect(state.train_name).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(state.pr_namespace).toBe("PR-PRA1B-*");
    expect(state.prs.map((pr) => pr.id)).toEqual([
      "PR-PRA1B-01",
      "PR-PRA1B-02",
      "PR-PRA1B-03",
      "PR-PRA1B-04",
      "PR-PRA1B-05",
      "PR-PRA1B-06",
    ]);
    expect(state.prs[0]).toMatchObject({
      branch: "codex/pr-pra1b-01-fallback-owner-gates",
      depends_on: [],
      status: "in_progress",
    });
  });

  it("uses only the frozen Phase 1B status, priority, and fallback taxonomies", () => {
    const artifact = readArtifact();
    const allowedStatuses = new Set(artifact.statusEnum);
    const allowedPriorities = new Set(artifact.priorityEnum);
    const allowedClassifications = new Set(artifact.fallbackClassificationEnum);

    expect(artifact.version).toBe("runtime.fallback_owner_gates.v1");
    expect(artifact.scope).toBe("PR-PRA1B-01");
    expect(artifact.trainName).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.statusEnum).toEqual([...STATUS_ENUM]);
    expect(artifact.priorityEnum).toEqual([...PRIORITY_ENUM]);
    expect(artifact.fallbackClassificationEnum).toEqual([...FALLBACK_CLASSIFICATION_ENUM]);

    for (const row of artifact.rows) {
      expect(allowedStatuses.has(row.status), row.id).toBe(true);
      expect(allowedPriorities.has(row.priority), row.id).toBe(true);
      expect(allowedClassifications.has(row.classification), row.id).toBe(true);
    }
  });

  it("covers all required Phase 1B fallback owner gates", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    expect(artifact.requiredFallbackIds).toEqual([...REQUIRED_FALLBACK_IDS]);
    for (const required of REQUIRED_FALLBACK_IDS) {
      expect(byId.has(required), required).toBe(true);
    }

    expect(byId.get("test_metadata_faq_cta_fallback")).toMatchObject({
      classification: "migration_required",
      status: "dangerous_if_expanded",
      priority: "P0",
      expansionGate: "no_new_test_or_scale_fallback_without_backend_authority",
    });
    expect(byId.get("topic_cta_fallback")).toMatchObject({
      classification: "migration_required",
      expansionGate: "no_topic_expansion_with_frontend_cta_truth",
    });
    expect(byId.get("llms_topic_fallback")).toMatchObject({
      classification: "migration_required",
      expansionGate: "no_silent_llms_topic_exposure_widening",
    });
    expect(byId.get("static_sitemap_layer")).toMatchObject({
      classification: "compatibility_wrapper",
    });
    expect(byId.get("local_recommendation_engine_placeholder")).toMatchObject({
      classification: "forbidden",
      canBecomePublicTruth: false,
      blocksUniversalAssessmentSignalPlatform: true,
    });
  });

  it("requires owner, risk, replacement, allowed duration, and blocking conditions for every fallback", () => {
    const artifact = readArtifact();

    expect(artifact.ownerGateRequiredFields).toEqual(
      expect.arrayContaining([
        "id",
        "surface",
        "currentOwner",
        "desiredOwner",
        "classification",
        "status",
        "priority",
        "allowedDuration",
        "intendedReplacement",
        "expansionGate",
        "blocksWhen",
        "sourceFiles",
      ])
    );

    for (const row of artifact.rows) {
      expectNonEmpty(row.id, "id");
      expectNonEmpty(row.surface, row.id);
      expectNonEmpty(row.currentOwner, row.id);
      expectNonEmpty(row.desiredOwner, row.id);
      expectNonEmpty(row.allowedDuration, row.id);
      expectNonEmpty(row.intendedReplacement, row.id);
      expectNonEmpty(row.replacementAuthority, row.id);
      expectNonEmpty(row.expansionGate, row.id);
      expectNonEmpty(row.blocksWhen, row.id);
      expectNonEmpty(row.risk, row.id);
      expect(row.sourceFiles.length, row.id).toBeGreaterThan(0);
      expect(row.allowedDuration.toLowerCase(), row.id).not.toBe("permanent");
    }
  });

  it("anchors every fallback and source pattern gate to current source files and tokens", () => {
    const artifact = readArtifact();
    const rowIds = new Set(artifact.rows.map((row) => row.id));

    for (const row of artifact.rows) {
      for (const sourceFile of row.sourceFiles) {
        const absoluteSource = path.join(ROOT, sourceFile.path);
        expect(fs.existsSync(absoluteSource), `${row.id}: ${sourceFile.path}`).toBe(true);
        const sourceText = fs.readFileSync(absoluteSource, "utf8");

        for (const token of sourceFile.requiredTokens) {
          expect(sourceText, `${row.id}: ${sourceFile.path} missing ${token}`).toContain(token);
        }
      }
    }

    for (const sourceGate of artifact.sourcePatternGates) {
      expect(rowIds.has(sourceGate.coveredByFallbackId), sourceGate.coveredByFallbackId).toBe(true);
      const absoluteSource = path.join(ROOT, sourceGate.source);
      expect(fs.existsSync(absoluteSource), sourceGate.source).toBe(true);
      const sourceText = fs.readFileSync(absoluteSource, "utf8");

      for (const token of sourceGate.requiredTokens) {
        expect(sourceText, `${sourceGate.source} missing ${token}`).toContain(token);
      }
    }
  });

  it("carries every Phase 1A fallback inventory row into the Phase 1B owner gate ledger", () => {
    const phase1A = readPhase1AInventory();
    const phase1BGates = readArtifact();
    const phase1BById = new Map(phase1BGates.rows.map((row) => [row.id, row]));

    for (const phase1ARow of phase1A.rows) {
      const phase1BRow = phase1BById.get(phase1ARow.id);
      expect(phase1BRow, phase1ARow.id).toBeDefined();
      expect(phase1BRow?.classification, phase1ARow.id).toBe(phase1ARow.classification);
    }
  });

  it("makes migration-required and forbidden fallback expansion fail-closed as contract data", () => {
    const artifact = readArtifact();

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "migration_required fallback cannot expand to a new scale, new test, new page family, new topic, new personality, new article, or new recommendation surface.",
        "forbidden fallback fails contract when it can become public SEO, graph, recommendation, or claim authority.",
        "local recommendation placeholder cannot become public authority.",
        "Future Universal Assessment Signal Platform surfaces cannot use unclassified fallback.",
        "Fallback additions must include owner, risk, intended replacement, and allowed duration.",
      ])
    );

    const migrationRows = artifact.rows.filter((row) => row.classification === "migration_required");
    expect(migrationRows.length).toBeGreaterThanOrEqual(5);
    for (const row of migrationRows) {
      expect(row.expansionGate, row.id).toMatch(/^no_|^must_/);
      expect(row.status, row.id).toMatch(/ready_for_remediation|dangerous_if_expanded/);
      expect(row.canBecomePublicTruth, row.id).toBe(false);
      expect(row.desiredOwner.toLowerCase(), row.id).not.toContain("frontend");
    }

    const forbiddenRows = artifact.rows.filter((row) => row.classification === "forbidden");
    expect(forbiddenRows.length).toBeGreaterThanOrEqual(2);
    for (const row of forbiddenRows) {
      expect(row.canBecomePublicTruth, row.id).toBe(false);
      expect(row.status, row.id).toBe("dangerous_if_expanded");
      expect(row.blocksUniversalAssessmentSignalPlatform, row.id).toBe(true);
      expect(row.blocksWhen.toLowerCase(), row.id).toMatch(/public|authority|recommendation|graph/);
    }
  });

  it("requires future fallback additions to declare owner, risk, replacement, duration, classification, and contract coverage", () => {
    const artifact = readArtifact();
    const gate = artifact.futureSurfaceGates.find((entry) => entry.id === "future_uasp_surface_requires_declared_fallback_owner");

    expect(gate).toBeDefined();
    expect(gate?.appliesTo).toEqual(
      expect.arrayContaining([
        "new_scale",
        "new_test",
        "new_page_family",
        "new_topic",
        "new_personality",
        "new_article",
        "new_recommendation_surface",
      ])
    );
    expect(gate?.requiredBeforeMerge).toEqual(
      expect.arrayContaining([
        "owner",
        "risk",
        "intendedReplacement",
        "allowedDuration",
        "classification",
        "contractCoverage",
      ])
    );
    expect(gate?.blocksWhen).toContain("unclassified fallback");
  });

  it("documents the fallback owner gates without changing runtime behavior", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).toContain("Fallback additions must include owner, risk, intended replacement, and allowed");
    expect(doc).toContain("Fallback Owner Gate Matrix");
    expect(doc).toContain("local_recommendation_engine_placeholder");
    expect(doc).toContain("must_not_become_public_authority");
    expect(doc).toContain("This PR does not remediate fallback");
  });
});
