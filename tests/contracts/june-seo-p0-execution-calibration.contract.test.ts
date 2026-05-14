import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train-seo-june.yaml");
const STATE_PATH = path.join(ROOT, "docs/codex/pr-train-seo-june-state.json");
const DOC_PATH = path.join(ROOT, "docs/seo/june-seo-p0-execution-calibration.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/june-seo-p0-execution-calibration.v1.json");

type CalibrationArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  sourceOfTruth: {
    primaryFrontendRuntime: string;
    backendAuthorityRepository: string;
    ignoredNestedFrontend: string;
  };
  requiredGithubChecks: string[];
  prScopes: Array<{
    id: string;
    repo: "fap-web" | "fap-api";
    scopeType: string;
    runtimeChangeAllowed: boolean;
    urlSetExpansionAllowed?: boolean;
    fallbackContentAllowed?: boolean;
  }>;
  backendChangePolicy: {
    separateBackendPrRequired: boolean;
    backendPrId: string;
    mixedFrontendBackendPrAllowed: boolean;
  };
  frozenExpansion: string[];
  blockedClaims: string[];
  allowedClaimLanguage: string[];
  mustNotChange: string[];
};

type TrainState = {
  train_name: string;
  pr_namespace: string;
  required_github_checks: string[];
  production_frontend_source_of_truth: {
    primary_public_runtime: string;
    backend_authority_repo: string;
    nested_skeleton_or_stale: string;
  };
  train_policy: Record<string, boolean>;
  prs: Array<{
    id: string;
    repo: "fap-web" | "fap-api";
    branch: string;
    depends_on: string[];
    status: string;
    commit_sha?: string | null;
    pr_url?: string | null;
  }>;
};

function readArtifact(): CalibrationArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CalibrationArtifact;
}

function readState(): TrainState {
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as TrainState;
}

describe("June SEO P0 execution calibration", () => {
  it("registers a dedicated June SEO train without touching the existing default train", () => {
    const manifest = fs.readFileSync(MANIFEST_PATH, "utf8");
    const state = readState();

    expect(manifest).toContain("train_name: seo-june-p0-fix-train");
    expect(manifest).toContain("pr_namespace: PR-SEO-JUNE-*");
    expect(manifest).toContain("codex/pr-seo-june-00-train-manifest-calibration");
    expect(state.train_name).toBe("seo-june-p0-fix-train");
    expect(state.pr_namespace).toBe("PR-SEO-JUNE-*");
    expect(state.prs.map((pr) => pr.id)).toEqual([
      "PR-SEO-JUNE-00",
      "PR-SEO-JUNE-01",
      "PR-SEO-JUNE-01B",
      "PR-SEO-JUNE-02",
      "PR-SEO-JUNE-03",
      "PR-SEO-JUNE-04",
      "PR-SEO-JUNE-05",
      "PR-SEO-JUNE-06",
    ]);
  });

  it("locks the production frontend and backend evidence boundaries", () => {
    const artifact = readArtifact();
    const state = readState();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.version).toBe("seo.june_p0_execution_calibration.v1");
    expect(artifact.scope).toBe("PR-SEO-JUNE-00");
    expect(artifact.trainName).toBe("seo-june-p0-fix-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.sourceOfTruth.primaryFrontendRuntime).toBe("/Users/rainie/Desktop/GitHub/fap-web");
    expect(artifact.sourceOfTruth.backendAuthorityRepository).toBe("/Users/rainie/Desktop/GitHub/fap-api");
    expect(artifact.sourceOfTruth.ignoredNestedFrontend).toBe("/Users/rainie/Desktop/GitHub/fap-api/fap-web");
    expect(state.production_frontend_source_of_truth.primary_public_runtime).toBe(
      artifact.sourceOfTruth.primaryFrontendRuntime
    );
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("Ignore for production frontend runtime judgments");
  });

  it("keeps PR-SEO-JUNE-01 through PR-SEO-JUNE-06 scopes explicit and dependency ordered", () => {
    const artifact = readArtifact();
    const state = readState();
    const manifest = fs.readFileSync(MANIFEST_PATH, "utf8");
    const prById = new Map(state.prs.map((pr) => [pr.id, pr]));
    const scopesById = new Map(artifact.prScopes.map((scope) => [scope.id, scope]));

    for (const id of ["PR-SEO-JUNE-01", "PR-SEO-JUNE-02", "PR-SEO-JUNE-03", "PR-SEO-JUNE-04", "PR-SEO-JUNE-05", "PR-SEO-JUNE-06"]) {
      expect(prById.has(id), id).toBe(true);
      expect(scopesById.has(id), id).toBe(true);
      expect(manifest).toContain(id);
    }

    expect(prById.get("PR-SEO-JUNE-01")?.depends_on).toEqual(["PR-SEO-JUNE-00"]);
    expect(prById.get("PR-SEO-JUNE-02")?.depends_on).toEqual(["PR-SEO-JUNE-01"]);
    expect(prById.get("PR-SEO-JUNE-03")?.depends_on).toEqual(["PR-SEO-JUNE-02"]);
    expect(prById.get("PR-SEO-JUNE-04")?.depends_on).toEqual(["PR-SEO-JUNE-03"]);
    expect(prById.get("PR-SEO-JUNE-05")?.depends_on).toEqual(["PR-SEO-JUNE-04"]);
    expect(prById.get("PR-SEO-JUNE-06")?.depends_on).toEqual(["PR-SEO-JUNE-05"]);
  });

  it("requires backend attribution/API changes to use a separate backend PR", () => {
    const artifact = readArtifact();
    const state = readState();
    const manifest = fs.readFileSync(MANIFEST_PATH, "utf8");
    const backendPr = state.prs.find((pr) => pr.id === "PR-SEO-JUNE-01B");

    expect(artifact.backendChangePolicy).toEqual({
      separateBackendPrRequired: true,
      backendPrId: "PR-SEO-JUNE-01B",
      mixedFrontendBackendPrAllowed: false,
    });
    expect(backendPr).toMatchObject({
      id: "PR-SEO-JUNE-01B",
      repo: "fap-api",
    });
    expect(["planned_if_required", "merged"]).toContain(backendPr?.status);
    if (backendPr?.status === "merged") {
      expect(backendPr.pr_url).toContain("github.com/fermatmind/fap-api/pull/");
      expect(backendPr.commit_sha).toMatch(/^[0-9a-f]{40}$/);
    }
    expect(manifest).toContain("separate_backend_pr_required: true");
    expect(manifest).toContain("backend_change_policy: separate_pr_only");
  });

  it("keeps pSEO expansion and high-risk recommendation surfaces frozen", () => {
    const artifact = readArtifact();
    const state = readState();

    expect(state.train_policy.no_pseo_generation).toBe(true);
    expect(state.train_policy.no_career_decision_runtime).toBe(true);
    expect(state.train_policy.no_riasec_career_recommender).toBe(true);
    expect(state.train_policy.no_bigfive_career_matcher).toBe(true);
    expect(state.train_policy.no_mbti_live_personalized_recommender).toBe(true);
    expect(artifact.frozenExpansion).toEqual(
      expect.arrayContaining([
        "MBTI x career pSEO",
        "Big Five trait x career pSEO",
        "RIASEC code x career pSEO",
        "career recommendation pSEO",
        "Career Decision runtime",
        "RIASEC career recommendation runtime",
        "Big Five trait-to-career matching runtime",
        "MBTI live individualized recommendation runtime",
      ])
    );
  });

  it("keeps unsafe claim categories blocked while documenting allowed language", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.blockedClaims).toEqual(
      expect.arrayContaining([
        "precise career recommendation",
        "best career",
        "guaranteed career success",
        "career success prediction",
        "AI career planning",
        "Big Five trait-to-career matching",
        "RIASEC recommendation engine",
        "MBTI individualized recommendation engine",
        "hiring suitability",
        "diagnosis",
        "personality diagnosis",
      ])
    );
    expect(artifact.allowedClaimLanguage).toEqual(
      expect.arrayContaining([
        "career direction reference",
        "exploration suggestion",
        "interest signal",
        "workplace behavior tendency",
        "snapshot-based support",
        "evidence-backed explanation",
      ])
    );
    expect(doc).toContain("Allowed language remains limited");
  });

  it("documents the June train hard boundaries without changing runtime behavior", () => {
    const artifact = readArtifact();
    const state = readState();

    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "checkout/payment/report entitlement logic",
        "assessment scoring",
        "profile or memory",
        "report pricing",
        "paid report product policy",
        "public route set",
        "sitemap URL set expansion",
        "llms exposure expansion",
      ])
    );
    expect(state.train_policy.no_checkout_payment_report_entitlement_changes).toBe(true);
    expect(state.train_policy.no_scoring_changes).toBe(true);
    expect(state.train_policy.no_profile_or_memory_changes).toBe(true);
    expect(state.train_policy.no_report_pricing_changes).toBe(true);
    expect(state.train_policy.no_sitemap_url_expansion).toBe(true);
    expect(state.train_policy.no_llms_expansion).toBe(true);
  });
});
