import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/phase-4c-final-runtime-dashboard.v1.json"
);
const DOC_PATH = path.join(
  ROOT,
  "docs/assessment/domains/phase-4c-final-runtime-dashboard.md"
);

const REQUIRED_BLOCKED = [
  "new_domain_hub_pages",
  "public_decision_routes",
  "visible_domain_copy",
  "domain_owned_cta_runtime",
  "seo_geo_expansion",
  "sitemap_llms_widening",
  "generalized_recommendation",
  "riasec_recommender",
  "big_five_career_matcher",
  "career_decision_runtime",
  "workstyle_public_module",
  "profile_memory",
  "saved_careers_promotion",
  "sensitive_signal_persistence",
  "domain_freemium_bundle",
  "checkout_payment_changes",
  "report_entitlement_changes",
  "scoring_changes",
  "new_test_onboarding",
  "new_scale_onboarding",
  "topic_graph_expansion",
  "career_pseo_expansion",
  "long_term_profile",
  "b2b",
];

type DashboardArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  phase: string;
  status: string;
  runtimeBehaviorChanged: boolean;
  visibleCopyAdded: boolean;
  ctaRuntimeChanged: boolean;
  seoGeoChanged: boolean;
  sitemapChanged: boolean;
  llmsChanged: boolean;
  recommendationChanged: boolean;
  profileMemoryChanged: boolean;
  freemiumChanged: boolean;
  scoringChanged: boolean;
  newRoutesAdded: boolean;
  domainHubAdded: boolean;
  completedPRs: string[];
  domains: {
    self_understanding: {
      domainStatus: string;
      runtimeMode: string;
      visibleRuntime: boolean;
      surfaces: string[];
      noHub: boolean;
      noVisibleCopy: boolean;
      noCTA: boolean;
      noSEOGeoExpansion: boolean;
      noRecommendation: boolean;
      noProfileWrite: boolean;
      noFreemium: boolean;
    };
    career_decision: {
      domainStatus: string;
      runtimeMode: string;
      visibleRuntime: boolean;
      noRecommender: boolean;
      noNewRuntime: boolean;
    };
    workstyle_decision: {
      domainStatus: string;
      runtimeMode: string;
      visibleRuntime: boolean;
      noPublicModule: boolean;
      dataAttributesDeferred: boolean;
    };
  };
  blocked: string[];
  nextRecommendedStep: string;
  phase4DExecutionAllowed: boolean;
  mustNotChange: string[];
};

function readArtifact(): DashboardArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DashboardArtifact;
}

describe("phase 4c final runtime dashboard", () => {
  it("artifact exists with correct version", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
    const artifact = readArtifact();

    expect(artifact.version).toBe("phase_4c.final_runtime_dashboard.v1");
    expect(artifact.scope).toBe("PR-4C-05");
    expect(artifact.phase).toBe("4C");
    expect(artifact.dependsOn).toEqual(["PR-4C-04"]);
  });

  it("status is completed_metadata_only", () => {
    expect(readArtifact().status).toBe("completed_metadata_only");
  });

  it("all runtime flags are false", () => {
    const a = readArtifact();
    expect(a.runtimeBehaviorChanged).toBe(false);
    expect(a.visibleCopyAdded).toBe(false);
    expect(a.ctaRuntimeChanged).toBe(false);
    expect(a.seoGeoChanged).toBe(false);
    expect(a.sitemapChanged).toBe(false);
    expect(a.llmsChanged).toBe(false);
    expect(a.recommendationChanged).toBe(false);
    expect(a.profileMemoryChanged).toBe(false);
    expect(a.freemiumChanged).toBe(false);
    expect(a.scoringChanged).toBe(false);
    expect(a.newRoutesAdded).toBe(false);
    expect(a.domainHubAdded).toBe(false);
  });

  it("completed PRs include PR-4C-01 through PR-4C-05", () => {
    expect(readArtifact().completedPRs).toEqual([
      "PR-4C-01", "PR-4C-02", "PR-4C-03", "PR-4C-04", "PR-4C-05",
    ]);
  });

  it("self_understanding is metadata_runtime_integrated with metadata_only", () => {
    const su = readArtifact().domains.self_understanding;
    expect(su.domainStatus).toBe("metadata_runtime_integrated");
    expect(su.runtimeMode).toBe("metadata_only");
    expect(su.visibleRuntime).toBe(false);
    expect(su.surfaces).toEqual(
      expect.arrayContaining(["result_report", "personality_detail", "test_detail", "topic_article_policy"])
    );
    expect(su.noHub).toBe(true);
    expect(su.noVisibleCopy).toBe(true);
    expect(su.noCTA).toBe(true);
    expect(su.noSEOGeoExpansion).toBe(true);
    expect(su.noRecommendation).toBe(true);
    expect(su.noProfileWrite).toBe(true);
    expect(su.noFreemium).toBe(true);
  });

  it("career_decision is blocked_for_runtime with guard_only", () => {
    const cd = readArtifact().domains.career_decision;
    expect(cd.domainStatus).toBe("blocked_for_runtime");
    expect(cd.runtimeMode).toBe("guard_only");
    expect(cd.visibleRuntime).toBe(false);
    expect(cd.noRecommender).toBe(true);
    expect(cd.noNewRuntime).toBe(true);
  });

  it("workstyle_decision is deferred with artifact_only", () => {
    const ws = readArtifact().domains.workstyle_decision;
    expect(ws.domainStatus).toBe("deferred");
    expect(ws.runtimeMode).toBe("artifact_only");
    expect(ws.visibleRuntime).toBe(false);
    expect(ws.noPublicModule).toBe(true);
    expect(ws.dataAttributesDeferred).toBe(true);
  });

  it("phase4DExecutionAllowed is false", () => {
    expect(readArtifact().phase4DExecutionAllowed).toBe(false);
  });

  it("blocked list contains all 24 required items", () => {
    const artifact = readArtifact();
    for (const item of REQUIRED_BLOCKED) {
      expect(artifact.blocked).toContain(item);
    }
  });

  it("mustNotChange covers all runtime surfaces", () => {
    const artifact = readArtifact();
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "visible copy",
        "CTA runtime",
        "recommendation runtime",
        "profile memory",
        "freemium runtime",
        "checkout/payment",
        "report entitlement",
        "SEO/GEO output",
        "sitemap generation",
        "llms generation",
        "scoring",
      ])
    );
  });

  it("documents the final dashboard position", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("completed_metadata_only");
    expect(doc).toContain("metadata_runtime_integrated");
    expect(doc).toContain("blocked_for_runtime");
    expect(doc).toContain("Phase 4D execution is NOT automatically allowed");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
