import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT, "docs/assessment/domains/generated/phase-4e-visible-runtime-planning-decision.v1.json"
);

type DecisionArtifact = {
  version: string; scope: string; trainName: string; phase: string;
  runtimeBehaviorChanged: boolean;
  planningStatus: string; executeReady: boolean;
  visibleRuntimeExpansionAllowed: boolean;
  selfUnderstandingMode: string;
  resultReportSectionAllowed: boolean;
  personalityTestTopicArticleVisibleLabelAllowed: boolean;
  domainCtaAllowed: boolean;
  reportFreemiumPackagingAllowed: boolean;
  domainHubAllowed: boolean;
  seoGeoExpansionAllowed: boolean;
  careerDecisionStatus: string; workstyleStatus: string;
  careerDecisionRuntimeAllowed: boolean; workstyleRuntimeAllowed: boolean;
  recommendationRuntimeAllowed: boolean; profileMemoryAllowed: boolean;
  freemiumRuntimeChangeAllowed: boolean;
  nextRuntimeExpansionAllowed: boolean;
  codexSafeNextSteps: string[];
  requiresHumanApproval: string[];
  blocked: string[];
};

const REQUIRED_HUMAN_APPROVAL = [
  "any_new_visible_domain_copy_beyond_badge",
  "any_domain_cta", "any_domain_section", "any_domain_bundle",
  "any_domain_hub", "any_public_decision_route",
  "any_seo_geo_expansion", "career_decision_unblocking",
  "workstyle_unblocking", "recommendation_runtime_work", "profile_memory_work",
];

const REQUIRED_BLOCKED = [
  "visible_runtime_expansion", "result_report_section",
  "domain_cta", "domain_hub", "public_decision_routes",
  "seo_geo_expansion", "sitemap_llms_widening",
  "generalized_recommendation", "career_decision_runtime",
  "workstyle_runtime", "profile_memory", "freemium_domain_bundle",
  "checkout_payment_changes", "report_entitlement_changes", "scoring_changes",
  "new_test_onboarding", "new_scale_onboarding",
  "topic_graph_expansion", "career_pseo_expansion",
];

function a(): DecisionArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DecisionArtifact;
}

describe("phase 4e visible runtime planning decision", () => {
  it("artifact exists", () => { expect(fs.existsSync(ARTIFACT_PATH)).toBe(true); });
  it("version", () => { expect(a().version).toBe("phase_4e.visible_runtime_planning_decision.v1"); });
  it("planning complete", () => { expect(a().planningStatus).toBe("complete"); });
  it("execute ready false", () => { expect(a().executeReady).toBe(false); });
  it("expansion not allowed", () => { expect(a().visibleRuntimeExpansionAllowed).toBe(false); });
  it("badge only", () => { expect(a().selfUnderstandingMode).toBe("badge_only"); });
  it("no section", () => { expect(a().resultReportSectionAllowed).toBe(false); });
  it("no visible label expansion", () => { expect(a().personalityTestTopicArticleVisibleLabelAllowed).toBe(false); });
  it("no cta", () => { expect(a().domainCtaAllowed).toBe(false); });
  it("no freemium", () => { expect(a().reportFreemiumPackagingAllowed).toBe(false); });
  it("no hub", () => { expect(a().domainHubAllowed).toBe(false); });
  it("no seo geo", () => { expect(a().seoGeoExpansionAllowed).toBe(false); });
  it("career blocked", () => { expect(a().careerDecisionStatus).toBe("blocked_for_visible_runtime"); });
  it("workstyle deferred", () => { expect(a().workstyleStatus).toBe("deferred_artifact_only"); });
  it("career runtime blocked", () => { expect(a().careerDecisionRuntimeAllowed).toBe(false); });
  it("workstyle runtime blocked", () => { expect(a().workstyleRuntimeAllowed).toBe(false); });
  it("rec blocked", () => { expect(a().recommendationRuntimeAllowed).toBe(false); });
  it("profile blocked", () => { expect(a().profileMemoryAllowed).toBe(false); });
  it("freemium blocked", () => { expect(a().freemiumRuntimeChangeAllowed).toBe(false); });
  it("next expansion false", () => { expect(a().nextRuntimeExpansionAllowed).toBe(false); });
  it("codex steps", () => {
    expect(a().codexSafeNextSteps).toEqual(["train_ledger_closure", "runtime_drift_verification_scan"]);
  });
  it("human approval items", () => {
    for (const item of REQUIRED_HUMAN_APPROVAL) expect(a().requiresHumanApproval).toContain(item);
  });
  it("blocked items", () => {
    for (const item of REQUIRED_BLOCKED) expect(a().blocked).toContain(item);
  });
  it("runtime not changed", () => { expect(a().runtimeBehaviorChanged).toBe(false); });
});
