import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/phase-4d-final-dashboard.v1.json");

const REQUIRED_BLOCKED = [
  "new_domain_hub_pages", "public_decision_routes",
  "visible_domain_copy_beyond_approved_badge", "domain_owned_cta_runtime",
  "seo_geo_expansion", "sitemap_llms_widening", "generalized_recommendation",
  "riasec_recommender", "big_five_career_matcher", "career_decision_runtime",
  "workstyle_public_module", "profile_memory", "saved_careers_promotion",
  "sensitive_signal_persistence", "domain_freemium_bundle",
  "checkout_payment_changes", "report_entitlement_changes", "scoring_changes",
  "new_test_onboarding", "new_scale_onboarding", "topic_graph_expansion",
  "career_pseo_expansion", "long_term_profile", "b2b",
];

type DashboardArtifact = {
  version: string; scope: string; trainName: string; dependsOn: string[];
  phase: string; status: string;
  runtimeBehaviorChanged: boolean; runtimeChangeType: string;
  visibleCopyAdded: boolean; visibleCopyScope: string;
  visibleCopyText: Record<string, string>;
  ctaRuntimeChanged: boolean; seoGeoChanged: boolean;
  sitemapChanged: boolean; llmsChanged: boolean; llmsFullChanged: boolean;
  jsonLdChanged: boolean; metadataChanged: boolean;
  recommendationChanged: boolean; profileMemoryChanged: boolean;
  freemiumChanged: boolean; scoringChanged: boolean;
  newRoutesAdded: boolean; domainHubAdded: boolean;
  completedPRs: string[];
  domains: {
    self_understanding: {
      domainStatus: string; runtimeMode: string; visibleRuntime: boolean;
      allowedSurfaces: string[]; ctaAllowed: boolean; linkAllowed: boolean;
      recommendationTriggered: boolean; profileWriteAllowed: boolean;
    };
    career_decision: { domainStatus: string; runtimeMode: string; visibleRuntime: boolean; };
    workstyle_decision: { domainStatus: string; runtimeMode: string; visibleRuntime: boolean; };
  };
  blocked: string[];
  nextRecommendedStep: string;
  nextRuntimeExpansionAllowed: boolean;
  mustNotChange: string[];
};

function a(): DashboardArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DashboardArtifact;
}

describe("phase 4d final dashboard", () => {
  it("artifact exists", () => { expect(fs.existsSync(ARTIFACT_PATH)).toBe(true); });
  it("version", () => { expect(a().version).toBe("phase_4d.final_dashboard.v1"); });
  it("status", () => { expect(a().status).toBe("completed_minimal_visible_badge_runtime"); });
  it("runtime changed", () => { expect(a().runtimeBehaviorChanged).toBe(true); });
  it("change type", () => { expect(a().runtimeChangeType).toBe("minimal_visible_domain_label"); });
  it("copy added", () => { expect(a().visibleCopyAdded).toBe(true); });
  it("copy scope", () => { expect(a().visibleCopyScope).toBe("self_understanding_badge_only"); });
  it("copy zh", () => { expect(a().visibleCopyText["zh-CN"]).toBe("自我认知"); });
  it("copy en", () => { expect(a().visibleCopyText.en).toBe("Self-understanding"); });

  it("all runtime flags false except copy", () => {
    const d = a();
    expect(d.ctaRuntimeChanged).toBe(false); expect(d.seoGeoChanged).toBe(false);
    expect(d.sitemapChanged).toBe(false); expect(d.llmsChanged).toBe(false);
    expect(d.llmsFullChanged).toBe(false); expect(d.jsonLdChanged).toBe(false);
    expect(d.metadataChanged).toBe(false); expect(d.recommendationChanged).toBe(false);
    expect(d.profileMemoryChanged).toBe(false); expect(d.freemiumChanged).toBe(false);
    expect(d.scoringChanged).toBe(false); expect(d.newRoutesAdded).toBe(false);
    expect(d.domainHubAdded).toBe(false);
  });

  it("completed PRs", () => { expect(a().completedPRs).toEqual(["PR-4D-00","PR-4D-01","PR-4D-02","PR-4D-03"]); });

  it("self_understanding status", () => {
    const su = a().domains.self_understanding;
    expect(su.domainStatus).toBe("minimal_visible_runtime_integrated");
    expect(su.runtimeMode).toBe("self_understanding_result_report_badge_only");
    expect(su.visibleRuntime).toBe(true);
    expect(su.allowedSurfaces).toEqual(["mbti_result_report","big_five_result_report","enneagram_result_report"]);
    expect(su.ctaAllowed).toBe(false); expect(su.linkAllowed).toBe(false);
    expect(su.recommendationTriggered).toBe(false); expect(su.profileWriteAllowed).toBe(false);
  });

  it("career blocked", () => {
    expect(a().domains.career_decision.domainStatus).toBe("blocked_for_visible_runtime");
    expect(a().domains.career_decision.runtimeMode).toBe("guard_only");
    expect(a().domains.career_decision.visibleRuntime).toBe(false);
  });

  it("workstyle deferred", () => {
    expect(a().domains.workstyle_decision.domainStatus).toBe("deferred");
    expect(a().domains.workstyle_decision.runtimeMode).toBe("artifact_only");
    expect(a().domains.workstyle_decision.visibleRuntime).toBe(false);
  });

  it("blocked list", () => {
    for (const item of REQUIRED_BLOCKED) expect(a().blocked).toContain(item);
  });

  it("next step and expansion", () => {
    expect(a().nextRecommendedStep).toBe("phase_4d_final_verification_scan");
    expect(a().nextRuntimeExpansionAllowed).toBe(false);
  });
});
