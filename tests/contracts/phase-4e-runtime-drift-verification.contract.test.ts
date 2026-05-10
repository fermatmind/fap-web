import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/phase-4e-runtime-drift-verification.v1.json");

const REQ_HUMAN = [
  "any_new_visible_domain_copy_beyond_badge", "any_domain_cta", "any_domain_section",
  "any_domain_bundle", "any_domain_hub", "any_public_decision_route",
  "any_seo_geo_expansion", "career_decision_unblocking", "workstyle_unblocking",
  "recommendation_runtime_work", "profile_memory_work",
];

const REQ_BLOCKED = [
  "visible_runtime_expansion", "result_report_section", "domain_cta",
  "domain_hub", "public_decision_routes", "seo_geo_expansion",
  "sitemap_llms_widening", "generalized_recommendation", "career_decision_runtime",
  "workstyle_runtime", "profile_memory", "freemium_domain_bundle",
  "checkout_payment_changes", "report_entitlement_changes", "scoring_changes",
  "new_test_onboarding", "new_scale_onboarding", "topic_graph_expansion",
  "career_pseo_expansion", "long_term_profile", "b2b",
];

type V = Record<string, unknown>;

function a(): V { return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as V; }

describe("phase 4e runtime drift verification", () => {
  it("exists", () => { expect(fs.existsSync(ARTIFACT_PATH)).toBe(true); });
  it("version", () => { expect(a().version).toBe("phase_4e.runtime_drift_verification.v1"); });
  it("verificationStatus", () => { expect(a().verificationStatus).toBe("verified_clean"); });
  it("source pr", () => { expect(a().sourceDecisionPr).toBe("PR-4E-00"); });
  it("source pr number", () => { expect(a().sourceDecisionPrNumber).toBe(757); });
  it("execute ready", () => { expect(a().executeReady).toBe(false); });
  it("expansion", () => { expect(a().visibleRuntimeExpansionAllowed).toBe(false); });
  it("badge only", () => { expect(a().selfUnderstandingMode).toBe("badge_only"); });
  it("section", () => { expect(a().resultReportSectionAllowed).toBe(false); });
  it("label", () => { expect(a().personalityTestTopicArticleVisibleLabelAllowed).toBe(false); });
  it("cta", () => { expect(a().domainCtaAllowed).toBe(false); });
  it("freemium", () => { expect(a().reportFreemiumPackagingAllowed).toBe(false); });
  it("hub", () => { expect(a().domainHubAllowed).toBe(false); });
  it("route", () => { expect(a().publicDecisionRouteAllowed).toBe(false); });
  it("seo geo", () => { expect(a().seoGeoExpansionAllowed).toBe(false); });
  it("sitemap llms", () => { expect(a().sitemapLlmsWideningAllowed).toBe(false); });
  it("career status", () => { expect(a().careerDecisionStatus).toBe("blocked_for_visible_runtime"); });
  it("workstyle status", () => { expect(a().workstyleStatus).toBe("deferred_artifact_only"); });
  it("career runtime", () => { expect(a().careerDecisionRuntimeAllowed).toBe(false); });
  it("workstyle runtime", () => { expect(a().workstyleRuntimeAllowed).toBe(false); });
  it("rec", () => { expect(a().recommendationRuntimeAllowed).toBe(false); });
  it("profile", () => { expect(a().profileMemoryAllowed).toBe(false); });
  it("freemium chg", () => { expect(a().freemiumRuntimeChangeAllowed).toBe(false); });
  it("checkout", () => { expect(a().checkoutPaymentChangeAllowed).toBe(false); });
  it("report ent", () => { expect(a().reportEntitlementChangeAllowed).toBe(false); });
  it("scoring", () => { expect(a().scoringChangeAllowed).toBe(false); });
  it("next expansion", () => { expect(a().nextRuntimeExpansionAllowed).toBe(false); });
  it("runtime drift", () => { expect(a().runtimeDriftFound).toBe(false); });
  it("copy drift", () => { expect(a().visibleCopyDriftFound).toBe(false); });
  it("cta drift", () => { expect(a().ctaDriftFound).toBe(false); });
  it("seo drift", () => { expect(a().seoGeoDriftFound).toBe(false); });
  it("rec drift", () => { expect(a().recommendationDriftFound).toBe(false); });
  it("profile drift", () => { expect(a().profileMemoryDriftFound).toBe(false); });
  it("freemium drift", () => { expect(a().freemiumDriftFound).toBe(false); });
  it("hub drift", () => { expect(a().domainHubDriftFound).toBe(false); });
  it("route drift", () => { expect(a().publicRouteDriftFound).toBe(false); });
  it("blocked", () => { for (const b of REQ_BLOCKED) expect((a().blocked as string[])).toContain(b); });
  it("human", () => { for (const h of REQ_HUMAN) expect((a().requiresHumanApproval as string[])).toContain(h); });
  it("execution allowed", () => { expect(a().phase4EExecutionAllowed).toBe(false); });
});
