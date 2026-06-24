import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import {
  buildActorsDisplaySurfaceFixture,
  buildDisplaySurfaceClaimPermissions,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

const D5_SELECTED_DISPLAY_SLUGS = [
  ["actuaries", "Actuaries"],
  ["financial-analysts", "Financial Analysts"],
  ["high-school-teachers", "High School Teachers"],
  ["market-research-analysts", "Market Research Analysts"],
  ["architectural-and-engineering-managers", "Architectural and Engineering Managers"],
  ["civil-engineers", "Civil Engineers"],
  ["biomedical-engineers", "Biomedical Engineers"],
  ["dentists", "Dentists"],
] as const;

const D8_ACTIVE_DISPLAY_SLUGS = [
  ["web-developers", "Web Developers"],
  ["marketing-managers", "Marketing Managers"],
  ["lawyers", "Lawyers"],
  ["pharmacists", "Pharmacists"],
  ["acupuncturists", "Acupuncturists"],
  ["business-intelligence-analysts", "Business Intelligence Analysts"],
  ["clinical-data-managers", "Clinical Data Managers"],
  ["budget-analysts", "Budget Analysts"],
  ["human-resources-managers", "Human Resources Managers"],
  ["administrative-services-managers", "Administrative Services Managers"],
  ["advertising-and-promotions-managers", "Advertising and Promotions Managers"],
  ["architects", "Architects"],
  ["air-traffic-controllers", "Air Traffic Controllers"],
  ["airline-and-commercial-pilots", "Airline and Commercial Pilots"],
  ["chemists-and-materials-scientists", "Chemists and Materials Scientists"],
  ["clinical-laboratory-technologists-and-technicians", "Clinical Laboratory Technologists and Technicians"],
  ["community-health-workers", "Community Health Workers"],
  ["compensation-and-benefits-managers", "Compensation and Benefits Managers"],
  ["career-and-technical-education-teachers", "Career and Technical Education Teachers"],
] as const;

describe("career display surface contract", () => {
  it("adapts and renders the valid Actors display surface", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    expect(surface?.subject.canonicalSlug).toBe("actors");
    expect(surface?.locale).toBe("en");
    expect(surface?.componentOrder).toContain("market_signal_card");
    expect(surface?.faqItems).toHaveLength(2);
    expect(surface?.claimPermissions.integrityState).toBe("full");
    expect(surface?.claimPermissions.allowAiStrategy).toBe(true);

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("Actors");
    expect(screen.getByTestId("fermat-decision-card")).toHaveTextContent("Fermat Quick Fit");
    expect(screen.getByTestId("career-snapshot-primary")).toHaveTextContent("Career Snapshot: U.S. Reference");
    expect(screen.getByTestId("career-snapshot-secondary")).toHaveTextContent("Mainland China Reference");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("How to Decide Whether Acting Fits You");
    expect(screen.getByTestId("riasec-fit-block")).toHaveTextContent("RIASEC Fit");
    expect(screen.getByTestId("personality-fit-block")).toHaveTextContent("Personality Fit");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("What Do Actors Do?");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("Core Responsibilities");
    expect(screen.getByTestId("work-context-block")).toHaveTextContent("Where Do Actors Work?");
    expect(screen.getByTestId("comparison-block")).toHaveTextContent("Actors Compared With Adjacent Roles");
    expect(screen.getByTestId("ai-impact-block")).toHaveTextContent("Will AI Replace Actors?");
    expect(screen.getByTestId("career-risks-block")).toHaveTextContent("What Are the Biggest Risks of Acting?");
    expect(screen.getByTestId("contract-risks-block")).toHaveTextContent("Contract and Project Risks");
    expect(screen.getByTestId("career-decision-action-block")).toHaveTextContent("Next: verify fit with FermatMind tests");
    expect(screen.queryByTestId("next-steps-block")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("FAQ");
    expect(screen.getByTestId("career-source-disclosure")).toHaveTextContent("Sources and update notes");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET");
    expect(screen.queryByTestId("related-next-pages")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-display-cta")).not.toBeInTheDocument();
  });

  it.each([
    ["data-scientists", "Data Scientists"],
    ["registered-nurses", "Registered Nurses"],
    ["accountants-and-auditors", "Accountants and Auditors"],
  ] as const)("adapts selected pilot display surfaces for %s", (slug, titleEn) => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn }),
      "en"
    );

    expect(surface?.subject.canonicalSlug).toBe(slug);
    expect(surface?.subject.path).toBe(`/en/career/jobs/${slug}`);
    expect(surface?.subject.title).toBe(titleEn);
    expect(surface?.componentOrder).toHaveLength(24);
    expect(surface?.sections.find((section) => section.component === "CareerFAQBlock")?.faqItems).toHaveLength(2);
    expect(surface?.sources).toHaveLength(2);
    expect(surface?.reviewValidity?.lastReviewed).toBe("2026-05-03");
    expect(surface?.claimPermissions.allowStrongClaim).toBe(true);

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent(titleEn);
    expect(screen.getByTestId("fermat-decision-card")).toHaveTextContent("Fermat Quick Fit");
    expect(screen.getByTestId("career-snapshot-primary")).toHaveTextContent("Career Snapshot: U.S. Reference");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent(`Is ${titleEn} a good career fit?`);
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET Online");
    expect(screen.getByTestId("career-source-disclosure")).toHaveTextContent("Last reviewed: 2026-05-03");
  });

  it("renders preview salary, AI risk, and Fermat test action in the page assembly order", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "accountants-and-auditors",
        titleEn: "Accountants and Auditors",
      }),
      "en"
    );

    render(
      <CareerDisplaySurface
        surface={surface}
        salarySlot={<section data-testid="salary-preview-slot">Salary preview</section>}
        aiImpactSlot={<section data-testid="ai-impact-preview-slot">AI impact preview</section>}
      />
    );

    const salaryPreview = screen.getByTestId("salary-preview-slot");
    const riskGroup = screen.getByTestId("career-display-group-risks-and-change");
    const aiPreview = screen.getByTestId("ai-impact-preview-slot");
    const decisionAction = screen.getByTestId("career-decision-action-block");

    expect(riskGroup).toContainElement(aiPreview);
    expect(salaryPreview.compareDocumentPosition(riskGroup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(riskGroup.compareDocumentPosition(decisionAction) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(D5_SELECTED_DISPLAY_SLUGS)("adapts D5 selected display surfaces for %s", (slug, titleEn) => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn }),
      "en"
    );

    expect(surface?.subject.canonicalSlug).toBe(slug);
    expect(surface?.componentOrder).toHaveLength(24);
    expect(surface?.sections.find((section) => section.component === "CareerFAQBlock")?.faqItems).toHaveLength(2);
    expect(surface?.claimPermissions.evidenceBasis.crosswalk).toBe("direct");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent(titleEn);
    expect(screen.getByTestId("career-decision-action-block")).toHaveTextContent("Measure my career interests");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent(`Is ${titleEn} a good career fit?`);
  });

  it("keeps English display surface CTAs and subtitles locale-safe when backend copy contains Chinese fallbacks", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      titleEn: "Accountants and Auditors",
    });
    (fixture.page.content.hero as { subtitle?: string }).subtitle = "会计师和审计师";
    fixture.page.content.primary_cta.label =
      "Test whether your career interests fit accounting and auditing / 测我的职业兴趣是否适合会计与审计";
    fixture.page.content.primary_cta.href =
      "/en/tests/holland-career-interest-test-riasec | /zh/tests/holland-career-interest-test-riasec";

    const surface = adaptCareerDisplaySurface(
      fixture,
      "en",
      undefined,
      "accountants-and-auditors",
      "Accountants and Auditors"
    );

    expect(surface?.hero.subtitle).toBeUndefined();
    expect(surface?.hero.primaryCta.label).toBe("Measure my career interests");
    expect(surface?.hero.primaryCta.href).toBe("/en/tests/holland-career-interest-test-riasec");

    render(<CareerDisplaySurface surface={surface} />);

    const hero = screen.getByTestId("career-display-hero");
    expect(hero).toHaveTextContent("Accountants and Auditors");
    expect(hero).toHaveTextContent("Measure my career interests");
    expect(hero).not.toHaveTextContent("会计");
    expect(hero).not.toHaveTextContent("测我的职业兴趣");
  });

  it("adapts real backend component-keyed selected payloads for Chinese locale", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "data-scientists",
      locale: "zh",
      titleEn: "Data Scientists",
      titleZh: "数据科学家",
    });
    fixture.page.content.primary_cta.label = "Take the Holland / RIASEC Career Interest Test";
    fixture.page.content.primary_cta.href = "/en/tests/holland-career-interest-test-riasec";
    fixture.page.content.final_cta.label = "Take the Holland / RIASEC Career Interest Test";
    fixture.page.content.final_cta.href = "/en/tests/holland-career-interest-test-riasec";

    const surface = adaptCareerDisplaySurface(
      fixture,
      "zh-CN"
    );

    expect(surface?.subject.canonicalSlug).toBe("data-scientists");
    expect(surface?.locale).toBe("zh");
    expect(surface?.subject.path).toBe("/zh/career/jobs/data-scientists");
    expect(surface?.hero.primaryCta.href).toBe("/zh/tests/holland-career-interest-test-riasec");
    expect(surface?.faqItems[0]?.question).toBe("数据科学家 适合普通人探索吗？");

    if (!surface) {
      throw new Error("Expected Chinese display surface fixture to adapt");
    }

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByText("Take the Holland / RIASEC Career Interest Test")).not.toBeInTheDocument();
    expect(screen.queryByText("下一步页面")).not.toBeInTheDocument();

    const localizedCtas = screen.getAllByRole("link", { name: "测我的职业兴趣是否匹配" });
    expect(localizedCtas.length).toBeGreaterThanOrEqual(2);
    localizedCtas.forEach((cta) => {
      const href = cta.getAttribute("href") ?? "";
      expect(href).toMatch(/^\/zh\/tests\/holland-career-interest-test-riasec(?:\?|$)/);
      expect(href).not.toContain("/en/");
    });
  });

  it("adapts component-keyed AI explanation objects without accepting unsafe schema", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists" });
    (fixture.page.content.ai_impact_table as { explanation: unknown }).explanation = {
      summary: "AI may change some tasks, but this remains a task-level interpretation.",
    };
    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.sections.find((section) => section.component === "AIImpactTable")?.body).toBe(
      "AI may change some tasks, but this remains a task-level interpretation."
    );
  });

  it("fails safe when display claim permissions are missing", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists" });
    delete (fixture as { claim_permissions?: unknown }).claim_permissions;
    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface).toBeNull();
  });

  it("enforces backend claim permissions for AI, market, salary, and strong claims", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.claim_permissions = buildDisplaySurfaceClaimPermissions({
      integrity_state: "restricted",
      allow_strong_claim: false,
      allow_ai_strategy: false,
      allow_salary_comparison: false,
      allow_market_signal: false,
      blocked_claims: ["salary_missing", "ai_exposure_missing", "market_signal_missing", "proxy_crosswalk"],
    });
    const surface = adaptCareerDisplaySurface(fixture, "en");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("claim-permission-notice-integrity")).toHaveTextContent("evidence-limited");
    expect(screen.queryByTestId("fermat-decision-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("market-signal-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ai-impact-block")).not.toBeInTheDocument();
    expect(screen.getByTestId("claim-permission-notice-salary")).toHaveTextContent("Direct salary comparison is hidden");
    expect(screen.queryByText("Median hourly wage")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-source-disclosure")).toHaveTextContent("Sources and update notes");
    expect(screen.getByTestId("career-decision-action-block")).toHaveTextContent("Measure my career interests");
  });

  it("rejects unsafe backend CTA hrefs before they reach Link sinks", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists" });
    fixture.page.content.primary_cta.href = "javascript:alert(1)";

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("drops unsafe display-surface section CTA and source URLs", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists" });
    fixture.page.content.next_steps_block.cta.href = "data:text/html,alert(1)";
    fixture.sources.references[0].url = "javascript:alert(1)";
    fixture.sources.references[1].url = "https://www.onetonline.org/";

    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.sections.find((section) => section.component === "NextStepsBlock")?.cta).toBeUndefined();
    expect(surface?.sources).toEqual([
      expect.objectContaining({ label: "O*NET Online: Data Scientists" }),
      expect.objectContaining({ label: "FermatMind interpretation", url: "https://www.onetonline.org/" }),
    ]);
    expect(surface?.sources[0]).not.toHaveProperty("url");
  });

  it("removes salary claims from all visible display-surface fields when salary comparison is blocked", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists" });
    fixture.claim_permissions = buildDisplaySurfaceClaimPermissions({
      allow_salary_comparison: false,
      blocked_claims: ["salary_missing"],
    });
    fixture.page.content.personality_fit_block.answer = "Salary should not render from answer fields.";
    fixture.page.content.fermat_decision_card.summary = "Salary should not render from fit titles.";
    fixture.page.content.faq_block.items[0] = {
      question: "What salary can I expect?",
      answer: "Salary should not render from FAQ fields.",
    };

    const surface = adaptCareerDisplaySurface(fixture, "en");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("claim-permission-notice-salary")).toHaveTextContent("Direct salary comparison is hidden");
    expect(screen.queryByText(/Salary should not render/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/What salary can I expect/i)).not.toBeInTheDocument();
  });

  it("suppresses legacy salary and search-intent metadata when a salary asset is rendered", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "accountants-and-auditors",
        titleEn: "Accountants and Auditors",
      }),
      "en"
    );

    render(<CareerDisplaySurface surface={surface} suppressLegacySalaryMetadata />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("Accountants and Auditors");
    expect(screen.queryByText("Search intent")).not.toBeInTheDocument();
    expect(screen.queryByText("career_exploration")).not.toBeInTheDocument();
    expect(screen.queryByText("career_fit")).not.toBeInTheDocument();
    expect(screen.queryByText("Salary data type")).not.toBeInTheDocument();
    expect(screen.queryByText("official_reference")).not.toBeInTheDocument();
  });

  it.each(D8_ACTIVE_DISPLAY_SLUGS)("adapts D8 validator-eligible display surfaces for %s", (slug, titleEn) => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn }),
      "en"
    );

    expect(surface?.subject.canonicalSlug).toBe(slug);
    expect(surface?.componentOrder).toHaveLength(24);
    expect(surface?.claimPermissions.integrityState).toBe("full");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent(titleEn);
    expect(screen.getByTestId("career-decision-action-block")).toHaveTextContent("Measure my career interests");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent(`Is ${titleEn} a good career fit?`);
  });

  it("returns null for manual-hold subjects even when the payload is otherwise valid", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "software-developers" });

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("returns null when the display surface slug does not match the route slug", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "web-developers", titleEn: "Web Developers" });

    expect(adaptCareerDisplaySurface(fixture, "en", undefined, "marketing-managers")).toBeNull();
  });

  it("returns null when the nested asset slug does not match the canonical slug", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "web-developers", titleEn: "Web Developers" });
    fixture.asset.slug = "marketing-managers";

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("returns null for non-ready display status", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.status = "draft";

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("strips forbidden governance fields recursively", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");
    const serialized = JSON.stringify(surface);

    expect(serialized).not.toContain("release_gate");
    expect(serialized).not.toContain("release_gates");
    expect(serialized).not.toContain("qa_risk");
    expect(serialized).not.toContain("admin_review_state");
    expect(serialized).not.toContain("tracking_json");
    expect(serialized).not.toContain("raw_ai_exposure_score");
  });

  it("rejects unknown component_order ids", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.component_order = [...fixture.component_order, "unknown_component"];

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("rejects payloads that contain Product schema", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists" });
    (fixture.structured_data_from_visible_content as Record<string, unknown>).product = {
      "@type": "Product",
      name: "unsafe",
    };

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("renders market signal captured, expiry, and sample-only boundaries", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("Captured at");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("2026-05-02");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("Expires at");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("2026-08-02");
    expect(screen.getByTestId("market-signal-card")).toHaveTextContent("Example only, not market-wide statistics");
  });

  it("normalizes English and Chinese locales", () => {
    expect(adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en")?.locale).toBe("en");
    expect(adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "zh-CN")?.locale).toBe("zh");
    expect(adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "zh")?.subject.path).toBe("/zh/career/jobs/actors");
  });

  it("renders a validator-eligible slug without a hardcoded selected allowlist entry", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "writers" });
    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.subject.canonicalSlug).toBe("writers");
  });

});
