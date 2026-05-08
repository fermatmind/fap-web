import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/claims/generated/seo-geo-llms-claim-guards.v1.json");
const DOC_PATH = path.join(ROOT, "docs/claims/seo-geo-llms-claim-guards.md");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-scb-state.json");

type Artifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  sourceArtifacts: string[];
  forbiddenPhrases: string[];
  allowedBoundaries: string[];
  guardRules: Array<{ id: string; status: string; priority: string; rule: string }>;
  nonRuntimeChangeGuarantees: Record<string, boolean>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

describe("SEO GEO llms claim guards", () => {
  it("defines contract-only SEO/GEO claim boundaries", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.version).toBe("claims.seo_geo_llms_claim_guards.v1");
    expect(artifact.scope).toBe("PR-SCB-05");
    expect(artifact.trainName).toBe("semantic-claim-boundary-enforcement-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.forbiddenPhrases).toEqual(
      expect.arrayContaining(["sitemap equals graph", "llms equals graph", "JSON-LD proves graph", "FAQ-only is evidence-ready", "hidden schema is evidence", "AI answerability equals AI planning"])
    );
    expect(artifact.allowedBoundaries).toEqual(
      expect.arrayContaining(["sitemap = discoverability surface", "llms = AI/GEO entry surface", "JSON-LD = structured data, not graph proof", "Evidence Container = visible content + source/evidence alignment"])
    );
  });

  it("anchors source artifacts and train state", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const state = readJson<{ prs: Array<{ id: string; status: string; pr_url: string | null; merge_sha: string | null }> }>(TRAIN_STATE_PATH);

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }
    expect(state.prs.find((pr) => pr.id === "PR-SCB-04")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/733",
      merge_sha: "92d5d62bf2d291eab25ebf5e0244e32f528eec9c",
    });
    expect(state.prs.find((pr) => pr.id === "PR-SCB-05")).toMatchObject({ status: "in_progress" });
  });

  it("keeps FAQ hidden schema and llms-full evidence boundaries explicit", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);

    expect(artifact.guardRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "faq_only_not_evidence_ready", status: "forbidden", priority: "P0" }),
        expect.objectContaining({ id: "hidden_schema_not_evidence", status: "forbidden", priority: "P0" }),
        expect.objectContaining({ id: "llms_full_requires_visible_evidence_claim_source", status: "forbidden", priority: "P0" }),
        expect.objectContaining({ id: "seo_geo_guard_no_exposure_widening", status: "forbidden", priority: "P0" }),
      ])
    );
  });

  it("documents no sitemap llms JSON-LD metadata or Evidence runtime changes", () => {
    const artifact = readJson<Artifact>(ARTIFACT_PATH);
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(Object.values(artifact.nonRuntimeChangeGuarantees).every((value) => value === false)).toBe(true);
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("This PR is contract guard only.");
    expect(doc).toContain("SEO/GEO exposure widened: no");
  });
});
