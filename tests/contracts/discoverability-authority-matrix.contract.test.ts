import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/discoverability-authority-matrix.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/discoverability-authority-convergence.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-state.json");

type DiscoverabilitySource = {
  path: string;
  requiredTokens: string[];
};

type DiscoverabilityRow = {
  id: string;
  surface: string;
  currentPublicAuthorityOwner: string;
  backendAuthorityAvailable: boolean;
  frontendOverrideRisk: string;
  parityStatus: string;
  runtimeOutput: string;
  sourceOfTruth: string;
  driftRisk: string;
  ciCoverage: string[];
  requiresFixtureForNewExposure: boolean;
  blocksWhen: string;
  sourceFiles: DiscoverabilitySource[];
};

type DiscoverabilityArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  urlSetChanged: boolean;
  llmsExposureChanged: boolean;
  jsonLdOutputChanged: boolean;
  requiredSurfaces: string[];
  privateFlowProtections: {
    paths: string[];
    requiredProtections: Record<string, boolean>;
  };
  hardRules: string[];
  rows: DiscoverabilityRow[];
};

function readArtifact(): DiscoverabilityArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DiscoverabilityArtifact;
}

describe("discoverability authority matrix", () => {
  it("registers PR-PRAC-05 after PR-PRAC-04 in train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-convergence-train");
    expect(byId.get("PR-PRAC-04")).toMatchObject({ status: "merged" });
    const prac05 = byId.get("PR-PRAC-05");
    expect(prac05).toMatchObject({
      branch: "codex/pr-prac-05-discoverability-authority-convergence",
      depends_on: ["PR-PRAC-04"],
    });
    expect(["in_progress", "merged"]).toContain(prac05?.status);
  });

  it("records discoverability authority without runtime output changes", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("seo.discoverability_authority_matrix.v1");
    expect(artifact.scope).toBe("PR-PRAC-05");
    expect(artifact.trainName).toBe("public-runtime-authority-convergence-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.urlSetChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.jsonLdOutputChanged).toBe(false);

    for (const row of artifact.rows) {
      expect(row.currentPublicAuthorityOwner.trim(), row.id).not.toBe("");
      expect(row.frontendOverrideRisk.trim(), row.id).not.toBe("");
      expect(row.parityStatus.trim(), row.id).not.toBe("");
      expect(row.runtimeOutput.trim(), row.id).not.toBe("");
      expect(row.sourceOfTruth.trim(), row.id).not.toBe("");
      expect(row.driftRisk.trim(), row.id).not.toBe("");
      expect(row.ciCoverage.length, row.id).toBeGreaterThan(0);
      expect(row.blocksWhen.trim(), row.id).not.toBe("");
      expect(row.sourceFiles.length, row.id).toBeGreaterThan(0);
    }
  });

  it("covers the required discoverability surfaces", () => {
    const artifact = readArtifact();
    const ids = new Set(artifact.rows.map((row) => row.id));
    const surfaces = new Set(artifact.rows.map((row) => row.surface));

    for (const surface of artifact.requiredSurfaces) {
      expect(surfaces.has(surface) || ids.has(surface), surface).toBe(true);
    }

    expect([...ids]).toEqual(
      expect.arrayContaining([
        "sitemap_authority_owner",
        "backend_sitemap_source_consumption",
        "frontend_static_sitemap_paths",
        "llms_authority_owner",
        "llms_full_authority_owner",
        "topic_fallback_exposure",
        "json_ld_authority",
        "faq_page_authority",
        "evidence_container_authority",
        "private_flow_exclusions",
        "canonical_hreflang_authority",
        "no_silent_exposure_widening",
      ])
    );
  });

  it("enforces no silent sitemap, llms, JSON-LD, FAQ, or Evidence exposure widening", () => {
    const artifact = readArtifact();
    const byId = new Map(artifact.rows.map((row) => [row.id, row]));

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "sitemap/llms new exposure requires fixture",
        "llms topic fallback must remain governed",
        "JSON-LD fallback must be classified",
        "FAQPage must come from visible FAQ or answer surface",
        "Evidence Container must be visible and grounded",
        "private flows remain excluded",
        "no silent discoverability exposure widening",
      ])
    );

    for (const id of [
      "sitemap_authority_owner",
      "llms_authority_owner",
      "llms_full_authority_owner",
      "topic_fallback_exposure",
      "json_ld_authority",
      "faq_page_authority",
      "evidence_container_authority",
      "no_silent_exposure_widening",
    ]) {
      expect(byId.get(id)?.requiresFixtureForNewExposure, id).toBe(true);
      expect(byId.get(id)?.blocksWhen.toLowerCase(), id).toMatch(/fixture|visible|private|authority|exposure|json-ld|faq/);
    }
  });

  it("keeps protected private flows fully excluded", () => {
    const artifact = readArtifact();
    const privateRow = artifact.rows.find((row) => row.id === "private_flow_exclusions");

    expect(artifact.privateFlowProtections.paths).toEqual(
      expect.arrayContaining([
        "/tests/*/take",
        "/result/*",
        "/results/*",
        "/orders/*",
        "/share/*",
        "/pay/*",
        "/payment/*",
      ])
    );
    expect(artifact.privateFlowProtections.requiredProtections).toEqual({
      noindex: true,
      nofollow: true,
      xRobotsTag: true,
      excludedFromSitemap: true,
      excludedFromLlms: true,
      excludedFromLlmsFull: true,
      noPublicJsonLd: true,
    });
    expect(privateRow).toMatchObject({
      frontendOverrideRisk: "blocked",
      parityStatus: "production_grade",
      requiresFixtureForNewExposure: true,
    });
  });

  it("anchors rows to current source tokens", () => {
    const artifact = readArtifact();

    for (const row of artifact.rows) {
      if (["llms_authority_owner", "llms_full_authority_owner"].includes(row.id)) {
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

  it("documents discoverability convergence without changing runtime behavior", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Authority Matrix");
    expect(doc).toContain("Hard Gates");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
