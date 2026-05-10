import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/self-understanding-result-report-badge-runtime.v1.json"
);
const DOC_PATH = path.join(
  ROOT,
  "docs/assessment/domains/self-understanding-result-report-badge-runtime.md"
);
const BADGE_COMPONENT_PATH = path.join(
  ROOT,
  "components/domains/SelfUnderstandingDomainBadge.tsx"
);

type BadgeArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  phase: string;
  runtimeBehaviorChanged: boolean;
  runtimeChangeType: string;
  allowedDomain: string;
  allowedSurfaces: string[];
  visibleCopyAdded: boolean;
  visibleCopyScope: string;
  visibleCopyText: Record<string, string>;
  badgeType: string;
  badgeComponent: string;
  badgeDataAttributes: string[];
  ctaAllowed: boolean;
  linkAllowed: boolean;
  nextStepAllowed: boolean;
  explanationCopyAllowed: boolean;
  tooltipAllowed: boolean;
  modalAllowed: boolean;
  popoverAllowed: boolean;
  trackedInteractionAllowed: boolean;
  seoGeoChanged: boolean;
  sitemapChanged: boolean;
  llmsChanged: boolean;
  llmsFullChanged: boolean;
  jsonLdChanged: boolean;
  metadataChanged: boolean;
  recommendationChanged: boolean;
  recommendationTriggered: boolean;
  profileMemoryChanged: boolean;
  profileWriteAllowed: boolean;
  memoryWriteAllowed: boolean;
  freemiumChanged: boolean;
  domainBundleAllowed: boolean;
  checkoutChanged: boolean;
  paymentChanged: boolean;
  paywallChanged: boolean;
  reportEntitlementChanged: boolean;
  careerDecisionRuntimeAllowed: boolean;
  workstyleRuntimeAllowed: boolean;
  domainHubAllowed: boolean;
  publicDecisionRouteAllowed: boolean;
  blockedSurfaces: string[];
  mustNotChange: string[];
};

const FORBIDDEN_COPY = [
  "自我诊断", "人格诊断", "人格分析", "人格分析报告",
  "Self-discovery", "Personality insight", "Personal diagnosis",
];

const FORBIDDEN_CTA = [
  "查看自我认知报告", "解锁报告", "了解更多",
];

function readArtifact(): BadgeArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as BadgeArtifact;
}

describe("self-understanding result report badge runtime", () => {
  it("artifact exists with correct version", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
    const a = readArtifact();
    expect(a.version).toBe("self_understanding.result_report_badge_runtime.v1");
    expect(a.scope).toBe("PR-4D-01");
    expect(a.dependsOn).toEqual(["PR-4D-00"]);
  });

  it("runtimeBehaviorChanged is true with correct type", () => {
    const a = readArtifact();
    expect(a.runtimeBehaviorChanged).toBe(true);
    expect(a.runtimeChangeType).toBe("minimal_visible_domain_label");
  });

  it("allowedDomain is self_understanding only", () => {
    expect(readArtifact().allowedDomain).toBe("self_understanding");
  });

  it("allowedSurfaces are only result reports", () => {
    expect(readArtifact().allowedSurfaces).toEqual([
      "mbti_result_report",
      "big_five_result_report",
      "enneagram_result_report",
    ]);
  });

  it("visibleCopyAdded is true with correct scope and text", () => {
    const a = readArtifact();
    expect(a.visibleCopyAdded).toBe(true);
    expect(a.visibleCopyScope).toBe("self_understanding_badge_only");
    expect(a.visibleCopyText["zh-CN"]).toBe("自我认知");
    expect(a.visibleCopyText.en).toBe("Self-understanding");
  });

  it("badgeType is non_interactive_domain_label", () => {
    const a = readArtifact();
    expect(a.badgeType).toBe("non_interactive_domain_label");
    expect(a.badgeComponent).toBe("components/domains/SelfUnderstandingDomainBadge.tsx");
    expect(a.badgeDataAttributes).toEqual([
      "data-domain-id",
      "data-domain-badge",
      "data-domain-badge-type",
      "data-domain-visible-copy-scope",
    ]);
  });

  it("badge component exists on disk", () => {
    expect(fs.existsSync(BADGE_COMPONENT_PATH)).toBe(true);
  });

  it("all interaction flags are false", () => {
    const a = readArtifact();
    expect(a.ctaAllowed).toBe(false);
    expect(a.linkAllowed).toBe(false);
    expect(a.nextStepAllowed).toBe(false);
    expect(a.explanationCopyAllowed).toBe(false);
    expect(a.tooltipAllowed).toBe(false);
    expect(a.modalAllowed).toBe(false);
    expect(a.popoverAllowed).toBe(false);
    expect(a.trackedInteractionAllowed).toBe(false);
  });

  it("all SEO/GEO flags are false", () => {
    const a = readArtifact();
    expect(a.seoGeoChanged).toBe(false);
    expect(a.sitemapChanged).toBe(false);
    expect(a.llmsChanged).toBe(false);
    expect(a.llmsFullChanged).toBe(false);
    expect(a.jsonLdChanged).toBe(false);
    expect(a.metadataChanged).toBe(false);
  });

  it("all recommendation/profile/freemium flags are false", () => {
    const a = readArtifact();
    expect(a.recommendationChanged).toBe(false);
    expect(a.recommendationTriggered).toBe(false);
    expect(a.profileMemoryChanged).toBe(false);
    expect(a.profileWriteAllowed).toBe(false);
    expect(a.memoryWriteAllowed).toBe(false);
    expect(a.freemiumChanged).toBe(false);
    expect(a.domainBundleAllowed).toBe(false);
    expect(a.checkoutChanged).toBe(false);
    expect(a.paymentChanged).toBe(false);
    expect(a.paywallChanged).toBe(false);
    expect(a.reportEntitlementChanged).toBe(false);
  });

  it("career and workstyle are blocked", () => {
    const a = readArtifact();
    expect(a.careerDecisionRuntimeAllowed).toBe(false);
    expect(a.workstyleRuntimeAllowed).toBe(false);
    expect(a.domainHubAllowed).toBe(false);
    expect(a.publicDecisionRouteAllowed).toBe(false);
  });

  it("blockedSurfaces include all non-result-report surfaces", () => {
    const a = readArtifact();
    expect(a.blockedSurfaces).toEqual(
      expect.arrayContaining([
        "career_decision", "workstyle_decision", "riasec",
        "career_pages", "topic_pages", "article_pages",
        "test_detail_pages", "personality_pages",
        "domain_hub", "public_decision_routes",
      ])
    );
  });

  it("badge component does not contain forbidden copy", () => {
    const source = fs.readFileSync(BADGE_COMPONENT_PATH, "utf8");
    for (const phrase of FORBIDDEN_COPY) {
      expect(source, `forbidden copy: ${phrase}`).not.toContain(phrase);
    }
    for (const phrase of FORBIDDEN_CTA) {
      expect(source, `forbidden CTA: ${phrase}`).not.toContain(phrase);
    }
  });

  it("badge component has no link, button, or onClick", () => {
    const source = fs.readFileSync(BADGE_COMPONENT_PATH, "utf8");
    expect(source).not.toContain("href");
    expect(source).not.toContain("button");
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("Link");
    expect(source).not.toContain("onClick");
  });

  it("badge component contains correct data attributes", () => {
    const source = fs.readFileSync(BADGE_COMPONENT_PATH, "utf8");
    expect(source).toContain('data-domain-id="self_understanding"');
    expect(source).toContain('data-domain-badge="self_understanding"');
    expect(source).toContain('data-domain-badge-type="non_interactive_domain_label"');
    expect(source).toContain('data-domain-visible-copy-scope="self_understanding_badge_only"');
  });

  it("documents the badge runtime position", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    expect(doc).toContain("Runtime behavior changed: yes");
    expect(doc).toContain("minimal visible domain label only");
    expect(doc).toContain("自我认知");
    expect(doc).toContain("Self-understanding");
    expect(doc).toContain("non-interactive");
  });
});
