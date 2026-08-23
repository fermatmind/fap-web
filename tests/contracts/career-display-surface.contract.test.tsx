import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { CAREER_DISPLAY_COMPONENT_ORDER, adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import {
  buildActorsDisplaySurfaceFixture,
  buildDisplaySurfaceClaimPermissions,
  buildProductionV42LegacyDisplaySurfaceFixture,
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

function collectPublishedScalarValues(value: unknown): string[] {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value === null || String(value).trim().length === 0 ? [] : [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectPublishedScalarValues);
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(collectPublishedScalarValues);
  }
  return [];
}

describe("career display surface contract", () => {
  it("does not render a display shell without a validated backend surface", () => {
    render(<CareerDisplaySurface surface={null} />);

    expect(screen.queryByTestId("career-display-surface")).not.toBeInTheDocument();
  });

  it("adapts and renders the production v4.2 24-component display surface", () => {
    const surface = adaptCareerDisplaySurface(
      buildProductionV42LegacyDisplaySurfaceFixture({
        slug: "adapted-physical-education-specialists",
        titleEn: "Adapted Physical Education Specialists",
      }),
      "en"
    );

    expect(surface).not.toBeNull();
    expect(surface?.componentOrder).toHaveLength(24);
    expect(surface?.componentOrder).not.toContain("career_ai_description_block");
    expect(surface?.componentOrder).not.toContain("career_path_block");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-hero")).toHaveTextContent(
      "Adapted Physical Education Specialists is a real backend component-keyed display_surface_v1 test page."
    );
    expect(screen.getByTestId("definition-block")).toHaveTextContent(
      "Adapted Physical Education Specialists turns occupational tasks into accountable work outcomes."
    );
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("Analyze task requirements");
    expect(screen.getByTestId("career-snapshot-primary")).toHaveTextContent("Career Snapshot: U.S. Reference");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent(
      "Is Adapted Physical Education Specialists a good career fit?"
    );
  });

  it("adapts and renders the valid Actors display surface", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");

    expect(surface?.subject.canonicalSlug).toBe("actors");
    expect(surface?.locale).toBe("en");
    expect(surface?.componentOrder).toContain("market_signal_card");
    expect(surface?.componentOrder).toContain("career_ai_description_block");
    expect(surface?.componentOrder).toContain("career_path_block");
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
    expect(screen.getByTestId("career-ai-description-block")).toHaveTextContent("AI Career Analysis");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("Core Responsibilities");
    expect(screen.getByTestId("work-context-block")).toHaveTextContent("Where Do Actors Work?");
    expect(screen.getByTestId("comparison-block")).toHaveTextContent("Actors Compared With Adjacent Roles");
    expect(screen.getByTestId("ai-impact-block")).toHaveTextContent("Will AI Replace Actors?");
    expect(screen.getByTestId("career-risks-block")).toHaveTextContent("What Are the Biggest Risks of Acting?");
    expect(screen.getByTestId("career-path-block")).toHaveTextContent("Career Path");
    expect(screen.getByTestId("contract-risks-block")).toHaveTextContent("Contract and Project Risks");
    expect(screen.getByTestId("career-decision-action-block")).toHaveTextContent("Next: verify fit with FermatMind tests");
    expect(screen.queryByTestId("next-steps-block")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("FAQ");
    expect(screen.getByTestId("career-source-disclosure")).toHaveTextContent("Sources and update notes");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET");
    expect(screen.queryByTestId("related-next-pages")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-display-cta")).not.toBeInTheDocument();
  });

  it("supplements legacy Actors sections with keyed AI description and career path blocks", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    const page = fixture.page.en as unknown as Record<string, unknown>;
    const legacySections = page.sections as Array<Record<string, unknown>>;

    page.sections = legacySections.filter(
      (section) => !["CareerAiDescriptionBlock", "CareerPathBlock"].includes(String(section.component))
    );
    page.career_ai_description_block = legacySections.find(
      (section) => section.component === "CareerAiDescriptionBlock"
    );
    page.career_path_block = legacySections.find((section) => section.component === "CareerPathBlock");

    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.sections.filter((section) => section.component === "CareerAiDescriptionBlock")).toHaveLength(1);
    expect(surface?.sections.filter((section) => section.component === "CareerPathBlock")).toHaveLength(1);

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-ai-description-block")).toHaveTextContent("AI Career Analysis");
    expect(screen.getByTestId("career-path-block")).toHaveTextContent("Career Path");
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
    expect(surface?.componentOrder).toHaveLength(26);
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

  it.each(["en", "zh"] as const)("maps the published accountants boundary array and renders the official hero chrome for %s", (locale) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale,
      titleEn: "Accountants and Auditors",
      titleZh: "会计与审计人员",
    });
    const surface = adaptCareerDisplaySurface(fixture, locale);

    expect(surface?.boundaryNotice).toHaveLength(2);
    expect(surface?.componentOrder).toEqual(CAREER_DISPLAY_COMPONENT_ORDER);

    render(<CareerDisplaySurface surface={surface} />);

    if (locale === "zh") {
      expect(screen.getByTestId("career-published-primary-locale-china")).toHaveTextContent("薪资信息不是个人收入承诺");
      expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
      expect(screen.getByTestId("career-production-hero-stats")).toHaveTextContent("7/10");
      expect(screen.getByTestId("career-published-primary-locale-china")).toHaveTextContent("7/10，较高");
      expect(screen.getByTestId("career-production-hero-stats")).toHaveTextContent("$100,000");
      expect(screen.getByTestId("career-display-hero")).toHaveTextContent("SOC 15-0000 · O*NET 15-0000.00");
      expect(screen.queryByRole("columnheader", { name: "说明" })).not.toBeInTheDocument();
      expect(screen.getAllByRole("columnheader", { name: "数据说明" }).length).toBeGreaterThan(0);
      expect(document.querySelector('main [data-career-component-id="breadcrumb"]')).not.toBeInTheDocument();
      expect(document.querySelectorAll("[data-career-visual-group]")).toHaveLength(12);
    } else {
      expect(screen.getByTestId("career-production-hero-stats").children).toHaveLength(3);
      expect(screen.getByTestId("career-display-hero")).not.toHaveTextContent("SOC 15-0000");
      expect(screen.getByTestId("career-display-hero")).toHaveClass("px-6");
      expect(screen.getByTestId("career-display-surface")).toHaveClass("px-4");
      expect(document.querySelector('main [data-career-component-id="breadcrumb"]')).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "相关职业" })).not.toBeInTheDocument();
    }
    expect(screen.getByTestId("career-production-assessment-rail")).toBeInTheDocument();
  });

  it("keeps a narrative China AI row out of the compact hero gauge", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "actuaries",
      locale: "zh",
      titleZh: "精算师",
    });
    const page = fixture.page.content as Record<string, unknown>;
    const snapshot = page.career_snapshot_primary_locale as { salary: { china_ai_row: string } };
    const narrative = "国内已上自动报表与 AI 定价，初级核算被吞，模型与合规终审仍人工。";
    snapshot.salary.china_ai_row = narrative;
    delete (fixture as Record<string, unknown>).presentation_v1;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-display-hero")).not.toHaveTextContent(narrative);
    expect(screen.getByTestId("career-published-primary-locale-china")).toHaveTextContent(narrative);
  });

  it("uses the production renderer for any complete zh Current projection without a slug allowlist", () => {
    const slug = "precision-agriculture-technicians";
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug,
        locale: "zh",
        titleEn: "Precision Agriculture Technicians",
        titleZh: "精准农业技术人员",
      }),
      "zh",
      undefined,
      slug
    );

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-surface")).toHaveAttribute(
      "data-career-production-template",
      "career-production-v1"
    );
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(26);
  });

  it("preserves published zh Current copy instead of applying local claim regex rewrites", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "financial-examiners",
      locale: "zh",
      titleEn: "Financial Examiners",
      titleZh: "金融审查员",
    });
    const page = fixture.page.content as unknown as Record<string, unknown>;
    page.career_ai_description_block = {
      heading: "后端原文",
      body: ["这段后端已发布正文原样包含薪资预测与收入预测边界词。"],
    };
    fixture.claim_permissions = {
      ...buildDisplaySurfaceClaimPermissions(),
      integrity_state: "restricted",
      allow_strong_claim: false,
      allow_ai_strategy: false,
      allow_salary_comparison: false,
      allow_market_signal: false,
    };

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getByText("这段后端已发布正文原样包含薪资预测与收入预测边界词。")).toBeInTheDocument();
    expect(screen.queryByText("此组件受已发布证据权限约束；当前不展示未经授权的声明。")).not.toBeInTheDocument();
  });

  it("renders every published scalar and preserves API array cardinality for a Current zh projection", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    });
    (fixture.sources.references[0] as { usage: string | string[] }).usage = [
      "官方职业定义",
      "工作场景参考",
    ];
    const page = fixture.page.content as Record<string, unknown>;
    const surface = adaptCareerDisplaySurface(fixture, "zh");

    render(<CareerDisplaySurface surface={surface} />);

    const attributeValues = [...document.querySelectorAll("*")]
      .flatMap((element) => [...element.attributes].map((attribute) => attribute.value));
    const domProjection = [document.body.textContent ?? "", ...attributeValues].join("\n");
    const expectedValues = CAREER_DISPLAY_COMPONENT_ORDER
      .flatMap((componentId) => collectPublishedScalarValues(page[componentId]));

    for (const expected of expectedValues) {
      expect(domProjection, `missing published scalar: ${expected}`).toContain(expected);
    }
    const expectedSourceValues = fixture.sources.references.flatMap(({ label, url, usage }) => [
      label,
      ...(url ? [url] : []),
      ...(Array.isArray(usage) ? usage : [usage]),
    ]);
    for (const expected of expectedSourceValues) {
      expect(domProjection, `missing published source scalar: ${expected}`).toContain(expected);
    }
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(26);
    expect(document.querySelectorAll('[data-career-api-list="responsibilities_block"] > li')).toHaveLength(
      (page.responsibilities_block as unknown[]).length
    );
    expect(document.querySelectorAll("#career-component-faq_block details")).toHaveLength(
      ((page.faq_block as { items: unknown[] }).items).length
    );
    expect(document.querySelectorAll("#career-component-related_next_pages [data-related-career-slug]")).toHaveLength(
      ((page.related_next_pages as { links: unknown[] }).links).length
    );
    expect(document.querySelectorAll('[data-testid="source-list"] > li')).toHaveLength(fixture.sources.references.length);
    expect(document.body).not.toHaveTextContent("[object Object]");
  });

  it("renders the Current FAQ collapsed and keeps API field keys out of the visual heading hierarchy", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    });

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    const details = [...document.querySelectorAll("#career-component-faq_block details")];
    expect(details.length).toBeGreaterThan(0);
    expect(details.every((item) => !item.hasAttribute("open"))).toBe(true);
    const visibleHeadings = [...document.querySelectorAll("h2,h3,h4")].map((item) => item.textContent?.trim());
    expect(visibleHeadings).not.toContain("标题");
    expect(visibleHeadings).not.toContain("正文");
    expect(visibleHeadings).not.toContain("说明");
    expect(visibleHeadings).not.toContain("结论");
    expect(screen.getByRole("complementary", { name: "页面目录" })).toHaveTextContent("AI 影响");
    expect(screen.getByRole("complementary", { name: "页面目录" })).not.toHaveTextContent(
      "这不是录用、收入或长期发展保证。"
    );
  });

  it("renders every canonical Current source without applying legacy trust filtering", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "zh", titleZh: "演员" });
    fixture.sources = {
      onet: {
        label: "O*NET 演员职业资料",
        url: "https://www.onetonline.org/link/details/27-2011.00",
        usage: "职业定义与任务",
      },
      linkedin: {
        label: "LinkedIn Skills on the Rise 2025",
        url: "https://www.linkedin.com/business/talent/blog/learning-and-development/skills-on-the-rise",
        usage: "通用技能趋势参考",
      },
      union: {
        label: "SAG-AFTRA membership eligibility",
        url: "https://www.sagaftra.org/membership-benefits/steps-join",
        usage: ["工会资格背景", "非市场统计"],
      },
      military: {
        label: "军用职业 O*NET URL",
        url: "not_applicable_for_military_specific_onet_occupation",
        usage: "该职业没有对应的民用 O*NET URL",
      },
    } as unknown as typeof fixture.sources;

    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(document.querySelectorAll('[data-testid="source-list"] > li')).toHaveLength(4);
    expect(screen.getByRole("link", { name: "LinkedIn Skills on the Rise 2025" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/business/talent/blog/learning-and-development/skills-on-the-rise"
    );
    expect(screen.getByText("非市场统计")).toBeInTheDocument();
    expect(screen.getByText(/not_applicable_for_military_specific_onet_occupation/)).toBeInTheDocument();
  });

  it("fails closed when a canonical Current source URL is unsafe", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "zh", titleZh: "演员" });
    fixture.sources.references[0].url = "javascript:alert(1)";

    expect(adaptCareerDisplaySurface(fixture, "zh")).toBeNull();
  });

  it.each(CAREER_DISPLAY_COMPONENT_ORDER)("fails closed when Current component %s is missing", (componentId) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "financial-examiners", locale: "zh" });
    delete (fixture.page.content as Record<string, unknown>)[componentId];

    expect(adaptCareerDisplaySurface(fixture, "zh")).toBeNull();
  });

  it("fails closed when a nested Current table row has an unknown object shape", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "financial-examiners", locale: "zh" });
    const page = fixture.page.content as Record<string, unknown>;
    (page.ai_impact_table as { ai_s6_tools: unknown }).ai_s6_tools = [{ unexpected: "must fail closed" }];

    expect(adaptCareerDisplaySurface(fixture, "zh")).toBeNull();
  });

  it.each(["asset_role", "related_next_pages", "review_validity_card", "boundary_notice"])(
    "fails closed for a non-accountants zh Current projection when %s is invalid or missing",
    (field) => {
      const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "financial-examiners", locale: "zh" });
      if (field === "asset_role") {
        fixture.asset_role = "draft";
      } else {
        delete (fixture.page.content as Record<string, unknown>)[field];
      }

      expect(adaptCareerDisplaySurface(fixture, "zh")).toBeNull();
    }
  );

  it.each([
    "related_next_pages",
    "review_validity_card",
    "boundary_notice",
    "career_ai_description_block",
  ])("fails closed for accountants when required API projection field %s is missing", (field) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      titleEn: "Accountants and Auditors",
    });
    const page = fixture.page.content as Record<string, unknown>;
    delete page[field];

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("fails closed for the retired related-page structure instead of injecting local fallbacks", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      titleEn: "Accountants and Auditors",
    });
    (fixture.page.content as Record<string, unknown>).related_next_pages = {
      primary_test: "/en/tests/holland-career-interest-test-riasec",
      related_jobs: [],
      secondary_tests: [],
    };

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("consumes the Current related-page contract without synthesizing hrefs or labels", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "financial-examiners",
      locale: "zh",
      titleZh: "金融审查员",
    });
    (fixture.page.content as Record<string, unknown>).related_next_pages = {
      intro: "从后端发布的相邻职业继续探索。",
      links: [
        {
          slug: "financial-analysts",
          source: "lookup",
          nofollow: false,
          title_en: "Financial Analysts",
        },
      ],
    };

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getByText("从后端发布的相邻职业继续探索。")).toBeInTheDocument();
    expect(screen.getByText("Financial Analysts")).toHaveClass("sr-only");
    expect(screen.getByText("中文标题暂不可用").closest("a")).toHaveAttribute("href", "/zh/career/jobs/financial-analysts");
  });

  it.each(["intro", "links", "slug", "source", "nofollow", "title_en"])(
    "fails closed when Current related-page field %s is missing",
    (field) => {
      const fixture = buildSelectedCareerDisplaySurfaceFixture({
        slug: "financial-examiners",
        locale: "zh",
      });
      const related = (fixture.page.content as Record<string, unknown>).related_next_pages as {
        intro?: unknown;
        links?: Array<Record<string, unknown>>;
      };
      if (field === "intro" || field === "links") {
        delete related[field];
      } else {
        delete related.links?.[0]?.[field];
      }

      expect(adaptCareerDisplaySurface(fixture, "zh")).toBeNull();
    }
  );

  it("fails closed when a Current related-page source is outside the API contract", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "financial-examiners",
      locale: "zh",
    });
    const related = (fixture.page.content as Record<string, unknown>).related_next_pages as {
      links: Array<Record<string, unknown>>;
    };
    related.links[0].source = "frontend_inference";

    expect(adaptCareerDisplaySurface(fixture, "zh")).toBeNull();
  });

  it("fails closed for accountants when published sources are missing", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      titleEn: "Accountants and Auditors",
    });
    delete (fixture as { sources?: unknown }).sources;

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it.each([
    ["en", "Accountants and Auditors", "Work takes place across corporate finance teams", "U.S. figures are a market reference", "Evidence gaps and deadline pressure", "Confirm scope, evidence, and sign-off responsibility"],
    ["zh", "会计与审计人员", "工作主要发生在企业财务部门", "美国数据只用于观察市场结构", "证据缺口与截止期限压力", "先确认范围、证据和签字责任"],
  ] as const)("renders complete keyed career sections for %s", (locale, title, workBody, snapshotBody, riskIntro, contractCheck) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale,
      titleEn: "Accountants and Auditors",
      titleZh: "会计与审计人员",
    });
    const page = fixture.page.content as Record<string, unknown>;
    const isZh = locale === "zh";

    page.work_context_block = isZh ? workBody : {
      id: "work_context",
      component: "WorkContextBlock",
      heading: isZh ? "工作场景" : "Work Context",
      body: workBody,
      contexts: isZh ? ["企业财务", "事务所审计"] : ["corporate finance", "public accounting"],
      entry_table: [[isZh ? "企业财务" : "Corporate finance", isZh ? "月结、报表与内控" : "Close, reporting, and controls"]],
      source_key: "onet_accountants",
    };
    page.career_ai_description_block = isZh ? {
      heading: "AI 职业解读",
      body: ["工具可以加速对账和底稿整理，关键判断仍需追溯证据并由专业人员负责。"],
    } : {
      id: "career_ai_description",
      component: "CareerAiDescriptionBlock",
      heading: isZh ? "AI 职业解读" : "AI Career Analysis",
      intro: isZh ? "AI 改变的是任务组合。" : "AI changes the task mix.",
      body: [isZh ? "工具可以加速对账和底稿整理，关键判断仍需追溯证据并由专业人员负责。" : "Tools can accelerate reconciliations and workpaper summaries, while professionals remain accountable for evidence and judgment."],
      source_key: "onet_accountants",
    };
    page.career_snapshot_secondary_locale = isZh ? {
      bls_table: [{ 指标: "数据边界", 数值: snapshotBody, 说明: "不等于个人收入" }],
      growth: "5%",
      median: snapshotBody,
    } : {
      id: "secondary_reference",
      component: "CareerSnapshotCard",
      heading: isZh ? "海外参考" : "Mainland China Reference",
      body: snapshotBody,
      rows: [[isZh ? "数据边界" : "Data boundary", isZh ? "不等于个人收入" : "Not individual earnings"]],
      source_key: isZh ? "bls_accountants_ooh" : "nbs_2024_wage",
    };
    page.career_risk_cards = isZh ? {
      badge: "证据 · 截止压力",
      callout: "这是风险识别，不是结果预测。",
      fact: riskIntro,
      risks: ["错报与合规责任"],
    } : {
      id: "career_risks",
      component: "CareerRiskCards",
      heading: isZh ? "职业风险" : "Career Risks",
      intro: riskIntro,
      career_risks: [isZh ? "错报与合规责任" : "Misstatement and compliance exposure"],
      caveat: isZh ? "这是风险识别，不是结果预测。" : "This identifies risks; it does not predict outcomes.",
    };
    page.contract_project_risk_block = isZh ? contractCheck : {
      id: "contract_risks",
      component: "ContractRiskBlock",
      heading: isZh ? "合同与项目风险" : "Contract and Project Risks",
      checks: [contractCheck],
      warning: isZh ? "范围变化必须书面确认。" : "Scope changes require written confirmation.",
    };

    const surface = adaptCareerDisplaySurface(fixture, locale);

    expect(surface?.subject.title).toBe(title);
    render(<CareerDisplaySurface surface={surface} />);

    const testId = (legacy: string, component: string) => isZh ? `career-published-${component}` : legacy;
    expect(screen.getByTestId(testId("work-context-block", "work_context_block"))).toHaveTextContent(workBody);
    expect(screen.getByTestId(testId("work-context-block", "work_context_block"))).not.toHaveTextContent("career_exploration");
    expect(screen.getByTestId(testId("career-ai-description-block", "career_ai_description_block"))).toHaveTextContent(isZh ? "工具可以加速对账和底稿整理" : "Tools can accelerate reconciliations");
    expect(screen.getByTestId(testId("career-snapshot-secondary", "career_snapshot_secondary_locale"))).toHaveTextContent(snapshotBody);
    expect(screen.getByTestId(testId("career-risks-block", "career_risk_cards"))).toHaveTextContent(riskIntro);
    expect(screen.getByTestId(testId("career-risks-block", "career_risk_cards"))).toHaveTextContent(isZh ? "错报与合规责任" : "Misstatement and compliance exposure");
    expect(screen.getByTestId(testId("contract-risks-block", "contract_project_risk_block"))).toHaveTextContent(contractCheck);
  });

  it("renders a legacy career-risk caveat once without promoting it to a risk item", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "accountants-and-auditors",
        titleEn: "Accountants and Auditors",
      }),
      "en"
    );

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getAllByText("This page is not an income forecast.")).toHaveLength(1);
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
    expect(surface?.componentOrder).toHaveLength(26);
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
    fixture.page.content.primary_cta.label = "测量我的职业兴趣";
    fixture.page.content.final_cta.label = "测量我的职业兴趣";

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

    expect(screen.queryByText("下一步页面")).not.toBeInTheDocument();

    const localizedCtas = screen.getAllByRole("link", { name: "测量我的职业兴趣" });
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
      expect.objectContaining({ label: "FermatMind interpretation" }),
    ]);
    expect(surface?.sources[0]).not.toHaveProperty("url");
    expect(surface?.sources[1]).not.toHaveProperty("url");
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

  it("renders WorkBuddy AI Markdown without raw markers or images", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    const aiDescription = fixture.page.en.sections.find(
      (section) => section.component === "CareerAiDescriptionBlock"
    );
    if (!aiDescription) {
      throw new Error("Expected AI description fixture");
    }
    aiDescription.body = [
      "## Role-specific analysis",
      "> Treat this as a bounded interpretation.",
      "- **Review** the work context",
      "- [Compare evidence](https://example.com/evidence)",
      "![Hidden image](https://example.com/hidden.png)",
    ];

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    const block = screen.getByTestId("career-ai-description-block");
    expect(block).not.toHaveTextContent("##");
    expect(block).not.toHaveTextContent(">");
    expect(block).not.toHaveTextContent("**");
    expect(block.querySelector("h3")).toHaveTextContent("Role-specific analysis");
    expect(block.querySelector("blockquote")).toHaveTextContent("Treat this as a bounded interpretation.");
    expect(block.querySelector("strong")).toHaveTextContent("Review");
    expect(screen.getByRole("link", { name: "Compare evidence" })).toHaveAttribute(
      "href",
      "https://example.com/evidence"
    );
    expect(block.querySelector("img")).toBeNull();
  });

  it.each([
    [true, true],
    [false, false],
  ] as const)("shows the WorkBuddy salary cell only when salary comparison is %s", (allowSalaryComparison, showsSalary) => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.claim_permissions = buildDisplaySurfaceClaimPermissions({
      allow_salary_comparison: allowSalaryComparison,
      blocked_claims: allowSalaryComparison ? [] : ["salary_comparison"],
    });
    const careerPath = fixture.page.en.sections.find(
      (section) => section.component === "CareerPathBlock"
    );
    if (!careerPath) {
      throw new Error("Expected career path fixture");
    }
    careerPath.rows = [
      ["Entry", "0-2 years", "Support scoped delivery", "Salary: $40,000-$55,000"],
      ["Mid", "3-5 years", "Own independent delivery", "Salary: $55,000-$75,000"],
      ["Senior", "6-10 years", "Lead complex delivery", "Salary: $75,000-$100,000"],
      ["Expert", "10+ years", "Set professional standards", "Salary: $100,000+"],
    ];

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    const pathBlock = screen.getByTestId("career-path-block");
    expect(pathBlock).toHaveTextContent("Entry");
    expect(pathBlock).toHaveTextContent("0-2 years");
    expect(pathBlock).toHaveTextContent("Support scoped delivery");
    if (showsSalary) {
      expect(pathBlock).toHaveTextContent("Salary: $40,000-$55,000");
    } else {
      expect(pathBlock).not.toHaveTextContent("Salary: $40,000-$55,000");
      expect(screen.getByTestId("claim-permission-notice-salary")).toBeInTheDocument();
    }
  });

  it("suppresses legacy salary and search-intent metadata when a salary asset is rendered", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({
        slug: "data-scientists",
        titleEn: "Data Scientists",
      }),
      "en"
    );

    render(<CareerDisplaySurface surface={surface} suppressLegacySalaryMetadata />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("Data Scientists");
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
    expect(surface?.componentOrder).toHaveLength(26);
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

  it("rejects a 25-component mixed v4.2 order", () => {
    const fixture = buildProductionV42LegacyDisplaySurfaceFixture();
    fixture.component_order.splice(10, 0, "career_ai_description_block");

    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("rejects duplicate and incorrectly ordered component ids", () => {
    const duplicate = buildProductionV42LegacyDisplaySurfaceFixture();
    duplicate.component_order[23] = duplicate.component_order[22];

    const outOfOrder = buildProductionV42LegacyDisplaySurfaceFixture();
    [outOfOrder.component_order[10], outOfOrder.component_order[11]] = [
      outOfOrder.component_order[11],
      outOfOrder.component_order[10],
    ];

    expect(adaptCareerDisplaySurface(duplicate, "en")).toBeNull();
    expect(adaptCareerDisplaySurface(outOfOrder, "en")).toBeNull();
  });

  it("rejects 24-component surfaces with mismatched locale, version, status, or slug", () => {
    const localeMismatch = buildProductionV42LegacyDisplaySurfaceFixture();
    const versionMismatch = buildProductionV42LegacyDisplaySurfaceFixture();
    const statusMismatch = buildProductionV42LegacyDisplaySurfaceFixture();
    const slugMismatch = buildProductionV42LegacyDisplaySurfaceFixture();

    versionMismatch.asset_version = "v4.1";
    statusMismatch.status = "draft";
    slugMismatch.asset.slug = "another-career";

    expect(adaptCareerDisplaySurface(localeMismatch, "zh")).toBeNull();
    expect(adaptCareerDisplaySurface(versionMismatch, "en")).toBeNull();
    expect(adaptCareerDisplaySurface(statusMismatch, "en")).toBeNull();
    expect(adaptCareerDisplaySurface(slugMismatch, "en")).toBeNull();
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
    const zhCurrent = buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "zh", titleZh: "演员" });
    expect(adaptCareerDisplaySurface(zhCurrent, "zh-CN")?.locale).toBe("zh");
    expect(adaptCareerDisplaySurface(zhCurrent, "zh")?.subject.path).toBe("/zh/career/jobs/actors");
  });

  it("renders a validator-eligible slug without a hardcoded selected allowlist entry", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "writers" });
    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.subject.canonicalSlug).toBe("writers");
  });

});
