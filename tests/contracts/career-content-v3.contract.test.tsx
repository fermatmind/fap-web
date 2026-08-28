import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface, buildCareerDisplayFAQPageJsonLd } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

function v3Fixture(locale: "en" | "zh" = "en", slug = "accountants-and-auditors") {
  const isZh = locale === "zh";
  return {
    contract_version: "career.detail.content.v3",
    locale: isZh ? "zh-CN" : "en",
    subject: {
      canonical_slug: slug,
      name: isZh ? "会计师和审计师" : "Accountants and Auditors",
      summary: isZh ? "核对事实、解释差异并对结论负责。" : "Verify facts, explain differences, and own conclusions.",
    },
    content_state: "enhanced",
    source_content_sha256: "a".repeat(64),
    blocks: [
      {
        id: "risk-primary",
        copy_key: "career.block.risk",
        content_state: "enhanced",
        availability: "available",
        items: [{ id: "risk-prose-1", copy_key: "career.item.career-risk-cards", type: "prose", availability: "available", data: { paragraphs: [isZh ? "截止日和证据复核会形成真实压力。" : "Deadlines and evidence review create real pressure."] } }],
      },
      {
        id: "profile",
        copy_key: "career.block.profile",
        content_state: "enhanced",
        availability: "available",
        items: [{ id: "profile-list-1", copy_key: "career.item.definition-block", type: "list", availability: "available", data: { entries: [isZh ? "复核交易" : "Review transactions", isZh ? "解释异常" : "Explain exceptions"] } }],
      },
      {
        id: "risk-secondary",
        copy_key: "career.block.risk",
        content_state: "enhanced",
        availability: "available",
        items: [{ id: "risk-cards-1", copy_key: "career.item.career-risk-cards", type: "cards", availability: "available", data: { entries: [{ id: "deadline", values: [isZh ? "月末关账压力" : "Month-end close pressure"] }] } }],
      },
      {
        id: "faq",
        copy_key: "career.block.sources",
        content_state: "enhanced",
        availability: "available",
        items: [{ id: "faq-1", copy_key: "career.item.faq-block", type: "faq", availability: "available", data: { entries: [{ id: "faq-entry-1", question_key: "career.faq.accounting.salary", answer: isZh ? "它不是个人收入承诺。" : "It is not a personal income promise." }] } }],
      },
    ],
  };
}

function surfaceFixture(locale: "en" | "zh" = "en", slug = "accountants-and-auditors") {
  const fixture = buildSelectedCareerDisplaySurfaceFixture({
    slug,
    locale,
    titleEn: "Accountants and Auditors",
    titleZh: "会计师和审计师",
    presentationV2: "enhanced",
  }) as ReturnType<typeof buildSelectedCareerDisplaySurfaceFixture> & { content_v3?: unknown; presentation_v2?: unknown };
  fixture.content_v3 = v3Fixture(locale, slug);
  return fixture;
}

function productionIsomorphicV3Fixture(locale: "en" | "zh") {
  const content = v3Fixture(locale);
  const prose = (id: string, copyKey: string) => ({ id, copy_key: copyKey, type: "prose", availability: "available", data: { paragraphs: [`${id} body`] } });
  const list = (id: string, copyKey: string) => ({ id, copy_key: copyKey, type: "list", availability: "available", data: { entries: [`${id} entry`] } });
  content.blocks = [
    { id: "quick-decision", copy_key: "career.block.quick-decision", content_state: "enhanced", availability: "available", items: [prose("decision-1", "career.item.fermat-decision-card"), prose("fit-check-1", "career.item.fit-decision-checklist")] },
    { id: "profile", copy_key: "career.block.profile", content_state: "enhanced", availability: "available", items: [prose("definition-1", "career.item.definition-block"), list("responsibilities-1", "career.item.responsibilities-block"), prose("context-1", "career.item.work-context-block"), prose("quick-answers-1", "career.item.career-quick-answers-block"), prose("onet-1", "career.item.onet-structured-fields-block")] },
    { id: "direction-comparison", copy_key: "career.block.direction-comparison", content_state: "enhanced", availability: "available", items: [prose("comparison-1", "career.item.adjacent-career-comparison-table")] },
    { id: "ai-impact", copy_key: "career.block.ai-impact", content_state: "enhanced", availability: "available", items: [prose("ai-1", "career.item.ai-impact-table")] },
    { id: "china-salary", copy_key: "career.block.china-salary", content_state: "enhanced", availability: "available", items: [prose("china-salary-1", "career.item.career-snapshot-primary-locale")] },
    { id: "us-salary", copy_key: "career.block.us-salary", content_state: "enhanced", availability: "available", items: [prose("us-salary-1", "career.item.career-snapshot-secondary-locale")] },
    { id: "fit", copy_key: "career.block.fit", content_state: "enhanced", availability: "available", items: [prose("riasec-1", "career.item.riasec-fit-block"), prose("personality-1", "career.item.personality-fit-block")] },
    { id: "risk", copy_key: "career.block.risk", content_state: "enhanced", availability: "available", items: [prose("risk-1", "career.item.career-risk-cards")] },
    { id: "path", copy_key: "career.block.path", content_state: "enhanced", availability: "available", items: [prose("path-1", "career.item.career-path-block")] },
    { id: "market-signals", copy_key: "career.block.market-signals", content_state: "enhanced", availability: "available", items: [prose("market-1", "career.item.market-signal-card")] },
    { id: "sources", copy_key: "career.block.sources", content_state: "enhanced", availability: "available", items: [{ id: "faq-1", copy_key: "career.item.faq-block", type: "faq", availability: "available", data: { entries: [{ id: "faq-entry-1", question_key: "career.faq.accounting.salary", answer: "Visible v3 FAQ answer." }] } }, prose("source-card-1", "career.item.source-card"), list("boundary-1", "career.item.boundary-notice")] },
    { id: "source-register", copy_key: "career.block.source-register", content_state: "enhanced", availability: "available", items: [{ id: "published-sources", copy_key: "career.item.published-sources", type: "sources", availability: "available", data: { entries: [{ id: "onet", name: "O*NET", url: "https://www.onetonline.org/" }] } }] },
  ] as ReturnType<typeof v3Fixture>["blocks"];
  return content;
}

describe("career content v3 contract", () => {
  it("uses the accepted production dossier components for a dual-contract response", () => {
    const fixture = surfaceFixture("zh");
    fixture.content_v3 = productionIsomorphicV3Fixture("zh");
    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getByTestId("career-display-surface")).toHaveAttribute("data-career-dossier-plan", "content_v3");
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(11);
    expect(screen.getByTestId("career-published-fermat_decision_card")).toBeInTheDocument();
    expect(screen.getByTestId("career-published-fit_decision_checklist")).toBeInTheDocument();
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("Visible v3 FAQ answer.");
    expect(document.querySelectorAll("[data-content-block-id]")).toHaveLength(12);
    const sources = document.querySelector('[data-content-block-id="sources"]');
    const sourceRegister = document.querySelector('[data-content-block-id="source-register"]');
    expect(sources).toContainElement(sourceRegister as HTMLElement);
    expect(sourceRegister).toHaveTextContent("O*NET");
    expect(screen.getByTestId("career-dossier-toc").querySelector('a[href="#career-content-source-register"]')).toBeNull();
    expect(screen.queryByText("增强内容")).not.toBeInTheDocument();
    expect(screen.queryByText("Core content")).not.toBeInTheDocument();
  });

  it("renders arbitrary block order and repeated semantics through the universal registry", () => {
    const surface = adaptCareerDisplaySurface(surfaceFixture("en"), "en");
    render(<CareerDisplaySurface surface={surface} />);

    const page = screen.getByTestId("career-display-surface");
    expect(page).toHaveAttribute("data-career-production-template", "career-production-v1");
    expect(page).toHaveAttribute("data-career-dossier-plan", "content_v3");
    expect(page).toHaveAttribute("data-content-contract", "career.detail.content.v3");
    expect(page).toHaveTextContent("Accountants and Auditors");
    expect(screen.queryByTestId("career-content-v3-surface")).not.toBeInTheDocument();
    expect(Array.from(page.querySelectorAll("[data-content-block-id]")).map((node) => node.getAttribute("data-content-block-id"))).toEqual([
      "risk-primary", "profile", "risk-secondary", "faq",
    ]);
    const toc = screen.getByTestId("career-dossier-toc");
    expect(within(toc).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "#career-content-risk-primary", "#career-content-profile", "#career-content-risk-secondary", "#career-content-faq",
    ]);
  });

  it("renders unknown semantics through generic primitives and isolates a damaged primitive", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks.splice(1, 0,
      { ...content.blocks[0], id: "unknown-copy", copy_key: "career.block.not-in-catalog", items: [{ ...content.blocks[0].items[0], id: "unknown-copy-1", data: { paragraphs: ["Future block body"] } }] },
      { ...content.blocks[0], id: "unknown-item-copy", items: [{ ...content.blocks[0].items[0], id: "unknown-item-copy-1", copy_key: "career.item.not-in-catalog" }] } as never,
      { ...content.blocks[0], id: "unknown-primitive", items: [{ id: "raw-1", copy_key: "career.item.career-risk-cards", type: "raw-html", availability: "available", data: { html: "<h2>unsafe</h2>" } }] } as never,
    );

    const surface = adaptCareerDisplaySurface(fixture, "en");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByText("Future block body")).toBeInTheDocument();
    expect(screen.getAllByText("Additional career information")).toHaveLength(2);
    expect(screen.getByText("Additional content")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-nosnippet='true']")).toHaveLength(1);
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(6);
    expect(screen.queryByText("unsafe")).not.toBeInTheDocument();
  });

  it("keeps an unknown table renderable with localized generic column labels", () => {
    const fixture = surfaceFixture("zh");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks = [{
      id: "future-table",
      copy_key: "career.block.future-evidence",
      content_state: "enhanced",
      availability: "available",
      items: [{
        id: "future-table-1",
        copy_key: "career.item.future-table",
        type: "table",
        availability: "available",
        data: { column_keys: ["future_label", "future_value"], rows: [["甲", "乙"]] },
      }],
    }] as never;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getByRole("columnheader", { name: "字段 1" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "字段 2" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "乙" })).toBeInTheDocument();
  });

  it("keeps a non-adjacent source register as its own ordered section", () => {
    const fixture = surfaceFixture("en");
    const content = productionIsomorphicV3Fixture("en");
    const sourceRegister = content.blocks.pop();
    content.blocks.splice(4, 0, sourceRegister!);
    fixture.content_v3 = content;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    const blockIds = Array.from(document.querySelectorAll("[data-content-block-id]"), (node) => node.getAttribute("data-content-block-id"));
    expect(blockIds[4]).toBe("source-register");
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(12);
    expect(screen.getByTestId("career-dossier-toc").querySelector('a[href="#career-content-source-register"]')).not.toBeNull();
    expect(document.querySelector('[data-content-block-id="sources"]')).not.toContainElement(document.querySelector('[data-content-block-id="source-register"]') as HTMLElement);
  });

  it("preserves dynamic additions and deletions without a fixed block-count whitelist", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks.splice(1, 2);
    content.blocks.push({
      id: "future-note",
      copy_key: "career.block.future-note",
      content_state: "enhanced",
      availability: "available",
      items: [{ id: "future-note-1", copy_key: "career.item.future-note", type: "notice", availability: "available", data: { paragraphs: ["Future declared note"] } }],
    } as never);

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    expect(Array.from(document.querySelectorAll("[data-content-block-id]"), (node) => node.getAttribute("data-content-block-id"))).toEqual([
      "risk-primary", "faq", "future-note",
    ]);
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(3);
    expect(screen.getByText("Future declared note")).toBeInTheDocument();
    expect(screen.queryByText("Review transactions")).not.toBeInTheDocument();
  });

  it("keeps a damaged block out of visible content, TOC, and FAQ structured data", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks[3].items.push({
      id: "broken-prose",
      copy_key: "career.item.faq-block",
      type: "prose",
      availability: "available",
      data: { paragraphs: [] },
    } as never);

    const surface = adaptCareerDisplaySurface(fixture, "en");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByText("How much do accountants and auditors earn?")).not.toBeInTheDocument();
    expect(JSON.stringify(buildCareerDisplayFAQPageJsonLd(surface))).not.toContain("personal income promise");
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(3);
    expect(document.querySelectorAll("[data-nosnippet='true']")).toHaveLength(1);
  });

  it("keeps available body copy when an optional subitem is missing", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks[0].items.push({ id: "optional-missing", copy_key: "career.item.career-risk-cards", type: "notice", availability: "missing", data: {} } as never);

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    expect(screen.getAllByRole("heading", { name: "Work pressure, risks and boundaries" })).toHaveLength(2);
    expect(screen.getByText("Deadlines and evidence review create real pressure.")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-nosnippet='true']")).toHaveLength(1);
  });

  it("keeps legacy v3 body authoritative without leaking undeclared v2 components", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.content_state = "legacy";
    content.blocks[0].content_state = "legacy";
    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    expect(screen.getByText("Deadlines and evidence review create real pressure.")).toBeInTheDocument();
    expect(screen.queryByText("Analyze task requirements")).not.toBeInTheDocument();
  });

  it("falls back to presentation v2 when the v3 root is invalid", () => {
    const fixture = surfaceFixture("zh");
    (fixture.content_v3 as Record<string, unknown>).locale = "fr";
    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-surface")).toHaveAttribute("data-career-production-template", "career-production-v1");
    expect(screen.getByTestId("career-display-surface")).not.toHaveAttribute("data-career-dossier-plan", "content_v3");
    expect(screen.getByTestId("career-display-hero")).toBeInTheDocument();
    expect(surface?.dossierRenderPlan?.source).toBe("presentation_v2");
  });

  it("fails closed when both declared root contracts are invalid", () => {
    const fixture = surfaceFixture("en");
    (fixture.content_v3 as Record<string, unknown>).locale = "fr";
    (fixture.presentation_v2 as Record<string, unknown>).locale = "fr";
    expect(adaptCareerDisplaySurface(fixture, "en")).toBeNull();
  });

  it("uses only frontend catalog text for headings, CTA, FAQ questions, and JSON-LD", () => {
    const fixture = surfaceFixture("zh");
    const page = fixture.page.content as Record<string, unknown>;
    page.definition_block = { heading: "API 标题不得显示", body: "API 正文仍可显示" };
    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByText("API 标题不得显示")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "开始职业兴趣测试" })).toBeInTheDocument();
    expect(screen.getByText("会计师和审计师工资一般多少？")).toBeInTheDocument();
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);
    expect(JSON.stringify(faqJsonLd)).toContain("会计师和审计师工资一般多少？");
    expect(JSON.stringify(faqJsonLd)).not.toContain("API 标题不得显示");
  });

  it("preserves CTA attribution while localizing the v3 button in the frontend catalog", () => {
    const surface = adaptCareerDisplaySurface(surfaceFixture("en"), "en");
    render(<CareerDisplaySurface
      surface={surface}
      ctaLandingPath="/en/career/jobs/accountants-and-auditors"
      ctaAttributionParams={{ utm_source: "contract" }}
    />);

    const cta = screen.getByRole("link", { name: "Start the career interest test" });
    expect(cta).toHaveAttribute("href", expect.stringContaining("subject_key=accountants-and-auditors"));
    expect(cta).toHaveAttribute("href", expect.stringContaining("utm_source=contract"));
  });

  it("renders the same bilingual template for all 1046 slug identities", () => {
    for (let index = 1; index <= 1046; index += 1) {
      const slug = `career-role-${index}`;
      for (const locale of ["en", "zh"] as const) {
        const fixture = surfaceFixture(locale, slug);
        const raw = fixture.content_v3 as ReturnType<typeof v3Fixture>;
        raw.subject.name = locale === "zh" ? `职业 ${index}` : `Career role ${index}`;
        raw.blocks.forEach((block) => { block.content_state = "legacy"; });
        const surface = adaptCareerDisplaySurface(fixture, locale, undefined, slug);
        expect(surface).not.toBeNull();
        const html = renderToStaticMarkup(
          <CareerDisplaySurface surface={surface} rendererRelease="content-v3-test-release" />,
        );
        expect(html).toContain('data-career-renderer-release="content-v3-test-release"');
        expect(html).toContain(`data-content-contract="career.detail.content.v3"`);
        expect(html).toContain('data-career-production-template="career-production-v1"');
        expect(html).toContain(`id="career-content-risk-primary"`);
        expect(html).not.toContain("career-content-v3-surface");
        expect(html).not.toContain("overflow-x:hidden");
      }
    }
  });
});
