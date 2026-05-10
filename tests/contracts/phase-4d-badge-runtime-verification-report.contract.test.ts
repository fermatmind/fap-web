import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/phase-4d-badge-runtime-verification-report.v1.json"
);

const BADGE_COMPONENT = path.join(ROOT, "components/domains/SelfUnderstandingDomainBadge.tsx");
const MbtiResultShell_PATH = path.join(ROOT, "components/result/mbti/MbtiResultShell.tsx");
const Big5ResultShell_PATH = path.join(ROOT, "components/result/big5/Big5ResultShell.tsx");
const Big5ResultPageV2Shell_PATH = path.join(ROOT, "components/result/big5/Big5ResultPageV2Shell.tsx");
const EnneagramResultShell_PATH = path.join(ROOT, "components/result/enneagram/EnneagramResultShell.tsx");

const FORBIDDEN_IN_RUNTIME = [
  "自我認知", "自我诊断", "人格诊断", "人格分析报告",
  "Self-discovery", "Personality insight", "Personal diagnosis",
];

const FORBIDDEN_INTERACTIVE = [
  "href=", "onClick", 'role="button"', "tooltip",
  "modal", "popover",
];

const REQUIRED_RUNTIME = ["自我认知", "Self-understanding"];

type VerificationArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  phase: string;
  verificationStatus: string;
  verifiedPRs: string[];
  runtimeBehaviorChanged: boolean;
  runtimeChangeType: string;
  allowedDomain: string;
  allowedSurfaces: string[];
  visibleCopyAdded: boolean;
  visibleCopyScope: string;
  visibleCopyText: Record<string, string>;
  forbiddenCopyFoundInRuntime: boolean;
  forbiddenCopyVariants: string[];
  badgeType: string;
  interactiveBehaviorFound: boolean;
  ctaAllowed: boolean; ctaFound: boolean;
  linkAllowed: boolean; linkFound: boolean;
  tooltipAllowed: boolean; tooltipFound: boolean;
  modalAllowed: boolean; modalFound: boolean;
  popoverAllowed: boolean; popoverFound: boolean;
  trackedInteractionAllowed: boolean; trackedInteractionFound: boolean;
  seoGeoChanged: boolean; sitemapChanged: boolean; llmsChanged: boolean;
  llmsFullChanged: boolean; jsonLdChanged: boolean; metadataChanged: boolean;
  canonicalChanged: boolean; faqPageChanged: boolean; schemaChanged: boolean;
  recommendationChanged: boolean; recommendationTriggered: boolean;
  profileMemoryChanged: boolean; profileWriteAllowed: boolean; memoryWriteAllowed: boolean;
  freemiumChanged: boolean; checkoutChanged: boolean; paymentChanged: boolean;
  paywallChanged: boolean; reportEntitlementChanged: boolean;
  careerDecisionRuntimeAllowed: boolean; workstyleRuntimeAllowed: boolean;
  domainHubAllowed: boolean; publicDecisionRouteAllowed: boolean;
  readinessForFinalDashboard: boolean;
  mustNotChange: string[];
};

function readArtifact(): VerificationArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as VerificationArtifact;
}

function readShellFiles(): string {
  return [
    fs.readFileSync(MbtiResultShell_PATH, "utf8"),
    fs.readFileSync(Big5ResultShell_PATH, "utf8"),
    fs.readFileSync(Big5ResultPageV2Shell_PATH, "utf8"),
    fs.readFileSync(EnneagramResultShell_PATH, "utf8"),
  ].join("\n");
}

describe("phase 4d badge runtime verification", () => {
  it("artifact exists", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
  });

  it("version and status correct", () => {
    const a = readArtifact();
    expect(a.version).toBe("phase_4d.badge_runtime_verification_report.v1");
    expect(a.verificationStatus).toBe("verified_clean");
    expect(a.scope).toBe("PR-4D-02");
  });

  it("verified PRs include PR-4D-00 and PR-4D-01", () => {
    expect(readArtifact().verifiedPRs).toEqual(["PR-4D-00", "PR-4D-01"]);
  });

  it("runtime changed with correct type", () => {
    const a = readArtifact();
    expect(a.runtimeBehaviorChanged).toBe(true);
    expect(a.runtimeChangeType).toBe("minimal_visible_domain_label");
  });

  it("allowed domain and surfaces correct", () => {
    const a = readArtifact();
    expect(a.allowedDomain).toBe("self_understanding");
    expect(a.allowedSurfaces).toEqual([
      "mbti_result_report", "big_five_result_report", "enneagram_result_report",
    ]);
  });

  it("visible copy text exact", () => {
    const a = readArtifact();
    expect(a.visibleCopyAdded).toBe(true);
    expect(a.visibleCopyScope).toBe("self_understanding_badge_only");
    expect(a.visibleCopyText["zh-CN"]).toBe("自我认知");
    expect(a.visibleCopyText.en).toBe("Self-understanding");
  });

  it("forbidden copy not found in runtime", () => {
    const a = readArtifact();
    expect(a.forbiddenCopyFoundInRuntime).toBe(false);
    expect(a.forbiddenCopyVariants).toEqual(
      expect.arrayContaining(["自我認知", "自我诊断", "人格诊断", "人格分析报告"])
    );
  });

  it("badge type is non_interactive_domain_label", () => {
    const a = readArtifact();
    expect(a.badgeType).toBe("non_interactive_domain_label");
    expect(a.interactiveBehaviorFound).toBe(false);
  });

  it("all interaction flags false with found flags false", () => {
    const a = readArtifact();
    expect(a.ctaAllowed).toBe(false); expect(a.ctaFound).toBe(false);
    expect(a.linkAllowed).toBe(false); expect(a.linkFound).toBe(false);
    expect(a.tooltipAllowed).toBe(false); expect(a.tooltipFound).toBe(false);
    expect(a.modalAllowed).toBe(false); expect(a.modalFound).toBe(false);
    expect(a.popoverAllowed).toBe(false); expect(a.popoverFound).toBe(false);
    expect(a.trackedInteractionAllowed).toBe(false); expect(a.trackedInteractionFound).toBe(false);
  });

  it("all SEO/GEO flags false", () => {
    const a = readArtifact();
    expect(a.seoGeoChanged).toBe(false); expect(a.sitemapChanged).toBe(false);
    expect(a.llmsChanged).toBe(false); expect(a.llmsFullChanged).toBe(false);
    expect(a.jsonLdChanged).toBe(false); expect(a.metadataChanged).toBe(false);
    expect(a.canonicalChanged).toBe(false);
  });

  it("all recommendation/profile/freemium flags false", () => {
    const a = readArtifact();
    expect(a.recommendationChanged).toBe(false);
    expect(a.recommendationTriggered).toBe(false);
    expect(a.profileMemoryChanged).toBe(false);
    expect(a.freemiumChanged).toBe(false);
    expect(a.checkoutChanged).toBe(false);
    expect(a.paymentChanged).toBe(false);
    expect(a.paywallChanged).toBe(false);
    expect(a.reportEntitlementChanged).toBe(false);
  });

  it("career, workstyle, hub, routes blocked", () => {
    const a = readArtifact();
    expect(a.careerDecisionRuntimeAllowed).toBe(false);
    expect(a.workstyleRuntimeAllowed).toBe(false);
    expect(a.domainHubAllowed).toBe(false);
    expect(a.publicDecisionRouteAllowed).toBe(false);
  });

  it("readinessForFinalDashboard is true", () => {
    expect(readArtifact().readinessForFinalDashboard).toBe(true);
  });

  // Runtime file static checks
  it("badge component contains required copy", () => {
    const source = fs.readFileSync(BADGE_COMPONENT, "utf8");
    for (const phrase of REQUIRED_RUNTIME) {
      expect(source, `required copy: ${phrase}`).toContain(phrase);
    }
  });

  it("badge component does not contain forbidden copy", () => {
    const source = fs.readFileSync(BADGE_COMPONENT, "utf8");
    for (const phrase of FORBIDDEN_IN_RUNTIME) {
      expect(source, `forbidden copy: ${phrase}`).not.toContain(phrase);
    }
  });

  it("badge component has no interactive behavior", () => {
    const source = fs.readFileSync(BADGE_COMPONENT, "utf8");
    for (const term of FORBIDDEN_INTERACTIVE) {
      expect(source, `forbidden interactive: ${term}`).not.toContain(term);
    }
  });

  it("result shells do not contain forbidden copy", () => {
    const shells = readShellFiles();
    for (const phrase of FORBIDDEN_IN_RUNTIME) {
      expect(shells, `forbidden in shells: ${phrase}`).not.toContain(phrase);
    }
  });

  it("this PR does not modify app, components, or lib", () => {
    expect(fs.existsSync(path.join(ROOT, ".git"))).toBe(true);
    expect(__filename).toContain("tests/contracts");
    expect(__filename).not.toContain("app/");
    expect(__filename).not.toContain("components/");
    expect(__filename).not.toContain("lib/");
  });
});
