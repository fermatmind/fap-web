import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("personality mobile contract", () => {
  it("keeps a lightweight mobile decision bar tied to the main CTA and quick locate trigger", () => {
    const source = read("components/personality/PersonalityMobileDecisionBar.tsx");

    expect(source).toContain('"use client"');
    expect(source).toContain("window.scrollY > 520");
    expect(source).toContain('data-testid="personality-mobile-decision-bar"');
    expect(source).toContain("TrackedEntryCtaLink");
    expect(source).toContain("quickLocateHref");
  });

  it("reduces mobile density without removing key hub sections or SSR inventory", () => {
    const heroSource = read("components/personality/PersonalityHeroExecutiveSummary.tsx");
    const matrixSource = read("components/personality/ScenarioIntelligenceMatrix.tsx");
    const workbenchSource = read("components/personality/TypeNavigatorWorkbench.tsx");
    const methodologySource = read("components/personality/PersonalityMethodology.tsx");
    const faqSource = read("components/personality/PersonalityFaq.tsx");

    expect(heroSource).toContain('data-testid="personality-hero-more-links"');
    expect(matrixSource).toContain("sm:hidden");
    expect(workbenchSource).toContain("showAllMobile");
    expect(workbenchSource).toContain('data-testid="personality-workbench-show-all"');
    expect(workbenchSource).toContain("hidden md:block");
    expect(methodologySource).toContain('data-testid="personality-methodology-more"');
    expect(faqSource).toContain('data-testid="personality-faq-mobile"');
  });

  it("keeps quick locate and full workbench inventory wired on the page", () => {
    const pageSource = read("app/(localized)/[locale]/personality/page.tsx");
    const quickLocateSource = read("components/personality/PersonalityQuickLocateBar.tsx");
    const stickySource = read("components/personality/PersonalityMobileDecisionBar.tsx");

    expect(pageSource).toContain('<PersonalityMobileDecisionBar');
    expect(pageSource).toContain("pb-28 md:pb-10");
    expect(pageSource).toContain("<TypeNavigatorWorkbench");
    expect(pageSource).toContain("<CareerIntelligencePreview");
    expect(pageSource).toContain("<PersonalityMethodology");
    expect(pageSource).toContain("<PersonalityFaq");
    expect(quickLocateSource).toContain('id="personality-quick-locate"');
    expect(quickLocateSource).toContain("scroll-mt-24");
    expect(stickySource).toContain("env(safe-area-inset-bottom)");
  });
});
