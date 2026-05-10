import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/phase-4d-visible-domain-badge-manual-decision.v1.json"
);
const DOC_PATH = path.join(
  ROOT,
  "docs/assessment/domains/phase-4d-visible-domain-badge-manual-decision.md"
);

type DecisionArtifact = {
  version: string;
  scope: string;
  trainName: string;
  phase: string;
  decisionStatus: string;
  runtimeBehaviorChanged: boolean;
  visibleDomainRuntimeAllowed: boolean;
  visibleRuntimeScope: string;
  allowedDomain: string;
  allowedSurfaces: string[];
  blockedSurfaces: string[];
  visibleCopyAllowed: boolean;
  visibleCopyScope: string;
  visibleCopyText: Record<string, string>;
  forbiddenCopyVariants: string[];
  badgeType: string;
  badgeNature: string[];
  ctaAllowed: boolean;
  linkAllowed: boolean;
  nextStepAllowed: boolean;
  domainOwnedCtaAllowed: boolean;
  explanationCopyAllowed: boolean;
  tooltipAllowed: boolean;
  modalAllowed: boolean;
  popoverAllowed: boolean;
  dropdownAllowed: boolean;
  hoverExplanationAllowed: boolean;
  trackedInteractionAllowed: boolean;
  clickHandlerAllowed: boolean;
  forbiddenCtaPhrases: string[];
  seoGeoChanged: boolean;
  sitemapChanged: boolean;
  llmsChanged: boolean;
  llmsFullChanged: boolean;
  jsonLdChanged: boolean;
  metadataChanged: boolean;
  canonicalChanged: boolean;
  faqPageChanged: boolean;
  schemaChanged: boolean;
  forbiddenSeoInjections: string[];
  recommendationChanged: boolean;
  recommendationTriggered: boolean;
  careerRecommendationTriggered: boolean;
  nextTestRecommendationTriggered: boolean;
  localRankingAllowed: boolean;
  forbiddenRecommendations: string[];
  profileMemoryChanged: boolean;
  profileWriteAllowed: boolean;
  memoryWriteAllowed: boolean;
  savedCareersPromotionAllowed: boolean;
  longTermProfileChanged: boolean;
  forbiddenProfileActions: string[];
  freemiumChanged: boolean;
  domainBundleAllowed: boolean;
  checkoutChanged: boolean;
  paymentChanged: boolean;
  paywallChanged: boolean;
  skuChanged: boolean;
  offerChanged: boolean;
  reportEntitlementChanged: boolean;
  reportAccessChanged: boolean;
  forbiddenFreemiumActions: string[];
  careerDecisionRuntimeAllowed: boolean;
  workstyleRuntimeAllowed: boolean;
  careerDecisionBadgeAllowed: boolean;
  workstyleBadgeAllowed: boolean;
  careerDecisionBlockedReasons: string[];
  workstyleBlockedReasons: string[];
  domainHubAllowed: boolean;
  publicDecisionRouteAllowed: boolean;
  phase4DExecutionBeyondBadgeRequiresHumanApproval: boolean;
  mustNotChange: string[];
};

function readArtifact(): DecisionArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DecisionArtifact;
}

describe("phase 4d visible domain badge manual decision", () => {
  it("artifact exists with correct version", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
    const a = readArtifact();
    expect(a.version).toBe("phase_4d.visible_domain_badge_manual_decision.v1");
    expect(a.scope).toBe("PR-4D-00");
    expect(a.phase).toBe("4D");
  });

  it("decisionStatus is human_approved", () => {
    expect(readArtifact().decisionStatus).toBe("human_approved");
  });

  it("visibleDomainRuntimeAllowed is true with correct scope", () => {
    const a = readArtifact();
    expect(a.visibleDomainRuntimeAllowed).toBe(true);
    expect(a.visibleRuntimeScope).toBe("self_understanding_result_report_badge_only");
    expect(a.runtimeBehaviorChanged).toBe(false);
  });

  it("allowedDomain is self_understanding only", () => {
    expect(readArtifact().allowedDomain).toBe("self_understanding");
  });

  it("allowedSurfaces are only result_reports", () => {
    const a = readArtifact();
    expect(a.allowedSurfaces).toEqual([
      "mbti_result_report",
      "big_five_result_report",
      "enneagram_result_report",
    ]);
  });

  it("blockedSurfaces include career, workstyle, riasec, and others", () => {
    const a = readArtifact();
    expect(a.blockedSurfaces).toEqual(
      expect.arrayContaining([
        "career_decision", "workstyle_decision", "riasec",
        "career_pages", "topic_pages", "article_pages",
        "test_detail_pages", "personality_pages",
        "domain_hub", "public_decision_routes",
        "home", "orders", "pay", "share", "take", "private_flows",
      ])
    );
  });

  it("visible copy text is exactly prescribed", () => {
    const a = readArtifact();
    expect(a.visibleCopyAllowed).toBe(true);
    expect(a.visibleCopyScope).toBe("self_understanding_badge_only");
    expect(a.visibleCopyText["zh-CN"]).toBe("自我认知");
    expect(a.visibleCopyText["en"]).toBe("Self-understanding");
  });

  it("forbidden copy variants are listed", () => {
    const a = readArtifact();
    expect(a.forbiddenCopyVariants).toEqual(
      expect.arrayContaining([
        "自我诊断", "人格诊断", "人格分析",
        "Self-discovery", "Personality insight",
      ])
    );
  });

  it("badgeType is non_interactive_domain_label", () => {
    const a = readArtifact();
    expect(a.badgeType).toBe("non_interactive_domain_label");
    expect(a.badgeNature).toEqual(
      expect.arrayContaining([
        "domain label",
        "not interpretation copy",
        "not CTA",
        "not recommendation",
        "not report value claim",
        "not SEO content",
        "not profile signal",
        "not diagnosis",
        "not career advice",
      ])
    );
  });

  it("all CTA flags are false", () => {
    const a = readArtifact();
    expect(a.ctaAllowed).toBe(false);
    expect(a.linkAllowed).toBe(false);
    expect(a.nextStepAllowed).toBe(false);
    expect(a.domainOwnedCtaAllowed).toBe(false);
    expect(a.explanationCopyAllowed).toBe(false);
  });

  it("all interaction flags are false", () => {
    const a = readArtifact();
    expect(a.tooltipAllowed).toBe(false);
    expect(a.modalAllowed).toBe(false);
    expect(a.popoverAllowed).toBe(false);
    expect(a.dropdownAllowed).toBe(false);
    expect(a.hoverExplanationAllowed).toBe(false);
    expect(a.trackedInteractionAllowed).toBe(false);
    expect(a.clickHandlerAllowed).toBe(false);
  });

  it("forbidden CTA phrases are listed", () => {
    const a = readArtifact();
    expect(a.forbiddenCtaPhrases).toEqual(
      expect.arrayContaining([
        "查看自我认知报告", "继续探索自我", "解锁报告", "了解更多",
      ])
    );
  });

  it("all SEO/GEO flags are false", () => {
    const a = readArtifact();
    expect(a.seoGeoChanged).toBe(false);
    expect(a.sitemapChanged).toBe(false);
    expect(a.llmsChanged).toBe(false);
    expect(a.llmsFullChanged).toBe(false);
    expect(a.jsonLdChanged).toBe(false);
    expect(a.metadataChanged).toBe(false);
    expect(a.canonicalChanged).toBe(false);
    expect(a.faqPageChanged).toBe(false);
    expect(a.schemaChanged).toBe(false);
  });

  it("forbidden SEO injections are listed", () => {
    const a = readArtifact();
    expect(a.forbiddenSeoInjections).toEqual(
      expect.arrayContaining([
        "metadata title", "metadata description", "JSON-LD",
        "llms", "llms-full", "sitemap",
      ])
    );
  });

  it("all recommendation flags are false", () => {
    const a = readArtifact();
    expect(a.recommendationChanged).toBe(false);
    expect(a.recommendationTriggered).toBe(false);
    expect(a.careerRecommendationTriggered).toBe(false);
    expect(a.nextTestRecommendationTriggered).toBe(false);
    expect(a.localRankingAllowed).toBe(false);
  });

  it("all profile/memory flags are false", () => {
    const a = readArtifact();
    expect(a.profileMemoryChanged).toBe(false);
    expect(a.profileWriteAllowed).toBe(false);
    expect(a.memoryWriteAllowed).toBe(false);
    expect(a.savedCareersPromotionAllowed).toBe(false);
    expect(a.longTermProfileChanged).toBe(false);
  });

  it("all freemium/paywall flags are false", () => {
    const a = readArtifact();
    expect(a.freemiumChanged).toBe(false);
    expect(a.domainBundleAllowed).toBe(false);
    expect(a.checkoutChanged).toBe(false);
    expect(a.paymentChanged).toBe(false);
    expect(a.paywallChanged).toBe(false);
    expect(a.skuChanged).toBe(false);
    expect(a.offerChanged).toBe(false);
    expect(a.reportEntitlementChanged).toBe(false);
    expect(a.reportAccessChanged).toBe(false);
  });

  it("career and workstyle runtime are blocked", () => {
    const a = readArtifact();
    expect(a.careerDecisionRuntimeAllowed).toBe(false);
    expect(a.workstyleRuntimeAllowed).toBe(false);
    expect(a.careerDecisionBadgeAllowed).toBe(false);
    expect(a.workstyleBadgeAllowed).toBe(false);
    expect(a.careerDecisionBlockedReasons).toEqual(
      expect.arrayContaining([
        "no precise recommender",
        "no Big Five/RIASEC career matcher",
        "no AI planning claim",
      ])
    );
  });

  it("domain hub and public decision routes are blocked", () => {
    const a = readArtifact();
    expect(a.domainHubAllowed).toBe(false);
    expect(a.publicDecisionRouteAllowed).toBe(false);
  });

  it("phase4DExecutionBeyondBadgeRequiresHumanApproval is true", () => {
    expect(readArtifact().phase4DExecutionBeyondBadgeRequiresHumanApproval).toBe(true);
  });

  it("mustNotChange covers all runtime surfaces", () => {
    const a = readArtifact();
    expect(a.mustNotChange).toEqual(
      expect.arrayContaining([
        "app routes", "components runtime", "lib runtime",
        "visible copy beyond badge text",
        "CTA runtime", "recommendation runtime", "profile memory",
        "freemium runtime", "checkout/payment", "report entitlement",
        "SEO/GEO output", "sitemap generation", "llms generation", "scoring",
      ])
    );
  });

  it("documents the decision-lock position", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("human-approved scope");
    expect(doc).toContain("自我认知");
    expect(doc).toContain("Self-understanding");
    expect(doc).toContain("non_interactive_domain_label");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
