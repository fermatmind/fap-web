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

function productionOutlookFixture(locale: "en" | "zh") {
  const isZh = locale === "zh";
  return {
    schema_version: "career.outlook_transitions.v1",
    heading: isZh ? "职业前景与转向" : "Career outlook and transitions",
    direct_answer: isZh ? "三种口径需要分开阅读。" : "Read the three measures separately.",
    outlook_evidence: ["United States", "Global employer survey", "Global research"].map((geography, index) => ({
      geography: isZh ? ["美国", "全球雇主调查", "全球研究"][index] : geography,
      occupation_scope: isZh ? "会计与审计" : "Accounting and audit",
      horizon: "2030",
      metric: isZh ? "指标" : "Metric",
      value: `${index + 1}`,
      interpretation: isZh ? "脱敏的公开生产形状样例。" : "Sanitized public-production-shape evidence.",
      limitation: isZh ? "不是个人就业承诺。" : "Not an individual employment promise.",
    })),
    context_links: [{ label: isZh ? "查看口径" : "View methodology", href: "#career-visual-group-market-signals" }],
    transitions: Array.from({ length: 8 }, (_, index) => ({
      target_slug: `career-transition-${index + 1}`,
      target_title: isZh ? `转向职业 ${index + 1}` : `Transition career ${index + 1}`,
      target_href: `/${locale}/career/jobs/career-transition-${index + 1}`,
      shared_capabilities: isZh ? "证据复核" : "Evidence review",
      capability_gaps: isZh ? "新领域知识" : "Domain knowledge",
      transition_distance: isZh ? "中等" : "Moderate",
    })),
    source_links: Array.from({ length: 4 }, (_, index) => ({
      id: `source-${index + 1}`,
      label: `Source ${index + 1}`,
      href: `https://example.com/source-${index + 1}`,
      scope: isZh ? "脱敏范围" : "Sanitized scope",
    })),
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
  (fixture.page.content as Record<string, unknown>).market_signal_card = productionOutlookFixture(locale);
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
    { id: "sources", copy_key: "career.block.sources", content_state: "enhanced", availability: "available", items: [{ id: "faq-1", copy_key: "career.item.faq-block", type: "faq", availability: "available", data: { entries: [{ id: "faq-entry-1", question_key: "career.faq.accounting.salary", answer: "Visible v3 FAQ answer." }] } }, prose("source-card-1", "career.item.source-card"), prose("review-1", "career.item.review-validity-card"), list("boundary-1", "career.item.boundary-notice"), prose("final-1", "career.item.final-cta")] },
    { id: "source-register", copy_key: "career.block.source-register", content_state: "enhanced", availability: "available", items: [{ id: "published-sources", copy_key: "career.item.published-sources", type: "sources", availability: "available", data: { entries: [{ id: "onet", name: "O*NET", url: "https://www.onetonline.org/" }] } }] },
  ] as ReturnType<typeof v3Fixture>["blocks"];
  return content;
}

describe("career content v3 contract", () => {
  it("uses the accepted production dossier components for a dual-contract response", () => {
    const fixture = surfaceFixture("zh");
    fixture.content_v3 = productionIsomorphicV3Fixture("zh");
    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-display-surface")).toHaveAttribute("data-career-dossier-plan", "content_v3");
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(11);
    expect(screen.getByTestId("career-published-fermat_decision_card")).toBeInTheDocument();
    expect(screen.getByTestId("career-published-fit_decision_checklist")).toBeInTheDocument();
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("Visible v3 FAQ answer.");
    expect(screen.getByTestId("career-dossier-outlook-transitions").querySelectorAll('[data-career-api-list="market_signal_card.outlook_evidence"] > article')).toHaveLength(3);
    expect(screen.getByTestId("career-dossier-outlook-transitions").querySelectorAll('[data-career-api-list="market_signal_card.transitions"] > a')).toHaveLength(8);
    expect(screen.getByTestId("career-dossier-outlook-transitions").querySelectorAll('footer a')).toHaveLength(4);
    expect(document.querySelectorAll("[data-content-block-id]")).toHaveLength(11);
    expect(surface?.dossierRenderPlan?.source === "content_v3" && surface.dossierRenderPlan.blocks.some((block) => block.copyKey === "career.block.source-register")).toBe(true);
    expect(document.querySelector('[data-content-block-id="source-register"]')).toBeNull();
    expect(screen.getByTestId("career-dossier-toc").querySelector('a[href="#career-content-source-register"]')).toBeNull();
    expect(screen.queryByRole("heading", { name: "使用边界" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "复核有效期" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "下一步行动" })).not.toBeInTheDocument();
    expect(screen.queryByText("Official occupational definition and work-context reference.")).not.toBeInTheDocument();
    expect(screen.queryByText("增强内容")).not.toBeInTheDocument();
    expect(screen.queryByText("Core content")).not.toBeInTheDocument();
  });

  it("folds a distinct review date into the compact source disclosure once", () => {
    const fixture = surfaceFixture("zh");
    fixture.content_v3 = productionIsomorphicV3Fixture("zh");
    fixture.page.content.review_validity_card = {
      last_reviewed: "2026-09-01",
      next_review_due: "2027-01-01",
    };

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getAllByText("2026-09-01")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "复核有效期" })).not.toBeInTheDocument();
  });

  it("renders fact-backed entry decisions without adding a top-level directory item", () => {
    const fixture = surfaceFixture("zh");
    const content = productionIsomorphicV3Fixture("zh") as ReturnType<typeof productionIsomorphicV3Fixture> & {
      fact_register?: unknown;
    };
    content.fact_register = {
      facts: [{
        fact_id: "us-median-wage",
        display_value: "$83,680",
        market: "美国",
        period: "2025 年 5 月",
        measure: "年薪中位数",
        occupation_scope: "Accountants and Auditors",
        source_refs: ["bls-oews-2025"],
        derivation: null,
      }],
    };
    const sourceRegister = content.blocks.find((block) => block.id === "source-register")!;
    (sourceRegister.items[0].data as Record<string, unknown>).entries = [{
      id: "bls-oews-2025",
      name: "BLS 2025 OEWS",
      url: "https://www.bls.gov/news.release/ocwage.t01.htm",
      details: [
        "美国全国职业工资统计",
        "FA01｜北京｜示例雇主｜财务实习生｜在校生／应届生｜本科｜https://example.com/jobs/fa01",
      ],
      publisher: "BLS OEWS",
      market: "美国",
      period: "2025 年 5 月",
      evidence_type: "官方工资统计",
      scope: "Accountants and Auditors",
      limitation: "不是个人起薪或到手工资",
      accessed_at: "2026-08-29",
    }];
    const path = content.blocks.find((block) => block.id === "path")!;
    (path.items as unknown[]).push(
      {
        id: "entry-role-comparison",
        copy_key: "career.item.entry-role-comparison",
        type: "table",
        availability: "available",
        source_refs: ["bls-oews-2025"],
        data: {
          column_keys: ["role", "initial_tasks", "employer_evidence", "no_experience_proof", "distinction"],
          rows: [["审计助理", "执行程序并整理证据", "底稿可复核", "简化审计底稿", "以独立验证为核心"]],
        },
      },
      {
        id: "entry-portfolio",
        copy_key: "career.item.entry-portfolio",
        type: "cards",
        availability: "available",
        fact_refs: ["us-median-wage"],
        data: { entries: [{ id: "reconciliation", values: ["对账表", "定位差异并保留证据索引"] }] },
      },
      {
        id: "seven-day-trial",
        copy_key: "career.item.seven-day-trial",
        type: "timeline",
        availability: "available",
        data: { entries: [{ id: "day-1", values: ["第 1 天", "选择会计、外审或内审方向"] }] },
      },
      {
        id: "credential-boundary",
        copy_key: "career.item.credential-boundary",
        type: "list",
        availability: "available",
        data: { entries: ["考试合格不等于执业注册。"] },
      },
    );
    const faqEntries = (content.blocks.find((block) => block.id === "sources")!.items[0].data as { entries: Array<Record<string, unknown>> }).entries;
    const faq = faqEntries[0];
    faq.fact_refs = ["us-median-wage"];
    fixture.content_v3 = content;

    const presentation = fixture.presentation_v2 as { hero: { stats: Array<Record<string, unknown>> } };
    presentation.hero.stats[0].fact_ref = "us-median-wage";
    const publishedContent = fixture.page.content as Record<string, unknown>;
    const outlook = publishedContent.market_signal_card as { outlook_evidence: Array<Record<string, unknown>> };
    outlook.outlook_evidence[0].source_ref = "bls-oews-2025";
    const aiImpact = publishedContent.ai_impact_table as {
      evidence_rows: Array<Record<string, unknown>>;
      questions: Array<Record<string, unknown>>;
    };
    aiImpact.evidence_rows[0].source_ref = "bls-oews-2025";
    aiImpact.questions[0].source_ref = "bls-oews-2025";
    publishedContent.career_path_block = {
      schema_version: "career.career_progression.v1",
      heading: "怎样成为会计师或审计师？",
      direct_answer: "先用真实任务证明能力，再决定证书投入。",
      boundary: "不存在通用的工作满几年必然晋升路线。",
      locale_requirements: { jurisdiction: "中国大陆", summary: "岗位与单位决定普通企业会计入行条件。", credential_boundary: "执业和签字责任另受法规约束。" },
      tracks: Array.from({ length: 3 }, (_, track) => ({
        id: `track-${track}`,
        title: `发展方向 ${track + 1}`,
        stages: Array.from({ length: 4 }, (_, stage) => ({ role: `岗位 ${track + 1}-${stage + 1}`, responsibility: "完成专业任务", readiness_evidence: "形成可复核成果", credentials: "按岗位需要判断", next_moves: "承担更完整责任" })),
      })),
      competence_ladder: Array.from({ length: 4 }, (_, index) => ({ stage: `能力层级 ${index + 1}`, description: "用工作证据证明胜任。" })),
      source_links: Array.from({ length: 4 }, (_, index) => ({ id: `path-source-${index}`, label: `Path source ${index}`, href: `https://example.com/path-${index}`, scope: "职业发展依据" })),
    };
    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(11);
    expect(screen.getByRole("heading", { name: "应届生／转行者如何验证并入门", level: 3 })).toBeInTheDocument();
    expect(screen.getByTestId("career-entry-decisions")).toHaveTextContent("常见入门岗位");
    expect(screen.getByTestId("career-entry-decisions")).toHaveTextContent("考试合格不等于执业注册");
    expect(screen.getAllByRole("link", { name: "BLS OEWS｜美国｜2025 年 5 月｜年薪中位数" }).length).toBeGreaterThan(0);
    expect(screen.getByTestId("source-list")).toHaveTextContent("不是个人起薪或到手工资");
    expect(screen.getByTestId("source-list").querySelectorAll("details")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "查看 FA01 原始职位" })).toHaveAttribute("href", "https://example.com/jobs/fa01");
    expect(within(screen.getByTestId("career-dossier-ai-impact")).getAllByTestId("career-near-source")).toHaveLength(2);
    expect(within(screen.getByTestId("career-dossier-outlook-transitions")).getByTestId("career-near-source")).toHaveTextContent("BLS OEWS｜美国｜2025 年 5 月｜官方工资统计");
    expect(JSON.stringify(buildCareerDisplayFAQPageJsonLd(surface))).toContain("Visible v3 FAQ answer.");
    expect(surface?.faqItems[0]?.answer).toBe("Visible v3 FAQ answer.");
  });

  it("renders arbitrary block order and repeated semantics through the universal registry", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    for (const index of [0, 2]) {
      content.blocks[index].copy_key = "career.block.market-signals";
      content.blocks[index].items = [{
        id: `market-${index}`,
        copy_key: "career.item.market-signal-card",
        type: "prose",
        availability: "available",
        data: { paragraphs: [`market ${index}`] },
      }];
    }
    const surface = adaptCareerDisplaySurface(fixture, "en");
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
    expect(Array.from(page.querySelectorAll('[data-career-component-id="market_signal_card"]'), (node) => node.id)).toEqual([
      "career-component-market_signal_card-risk-primary-0",
      "career-component-market_signal_card-risk-secondary-2",
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
    expect(document.querySelector('[data-content-block-id="unknown-copy"] h2')).toHaveTextContent("Additional career information");
    expect(document.querySelector('[data-content-block-id="unknown-item-copy"] [data-nosnippet="true"]')).not.toBeNull();
    expect(document.querySelector('[data-content-block-id="unknown-primitive"] [data-nosnippet="true"]')).not.toBeNull();
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(6);
    expect(screen.queryByText("Deadlines and evidence review create real pressure.")).not.toBeInTheDocument();
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

  it("retains a reordered source register for resolution without visible DOM or TOC", () => {
    const fixture = surfaceFixture("en");
    const content = productionIsomorphicV3Fixture("en");
    const sourceRegister = content.blocks.pop();
    content.blocks.splice(4, 0, sourceRegister!);
    fixture.content_v3 = content;

    const surface = adaptCareerDisplaySurface(fixture, "en");
    render(<CareerDisplaySurface surface={surface} />);

    const blockIds = Array.from(document.querySelectorAll("[data-content-block-id]"), (node) => node.getAttribute("data-content-block-id"));
    expect(blockIds).not.toContain("source-register");
    expect(surface?.dossierRenderPlan?.source === "content_v3" ? surface.dossierRenderPlan.blocks[4]?.id : null).toBe("source-register");
    expect(screen.getByTestId("career-dossier-toc").querySelectorAll("a")).toHaveLength(11);
    expect(screen.getByTestId("career-dossier-toc").querySelector('a[href="#career-content-source-register"]')).toBeNull();
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
    expect(document.querySelectorAll('[data-career-v3-block-copy-key="career.block.sources"] [data-nosnippet="true"]')).toHaveLength(1);
  });

  it("isolates a damaged known FAQ authority while keeping it out of JSON-LD", () => {
    const fixture = surfaceFixture("en");
    (fixture.page.content as Record<string, unknown>).faq_block = { items: [{ question: "Broken FAQ", answer: "" }] };
    const surface = adaptCareerDisplaySurface(fixture, "en");

    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByText("How much do accountants and auditors earn?")).not.toBeInTheDocument();
    expect(buildCareerDisplayFAQPageJsonLd(surface)).toBeNull();
    expect(document.querySelector('[data-content-block-id="faq"] [data-nosnippet="true"]')).not.toBeNull();
  });

  it("keeps the rich known component and marks an optional missing subitem", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks[0].items.push({ id: "optional-missing", copy_key: "career.item.career-risk-cards", type: "notice", availability: "missing", data: {} } as never);

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    expect(screen.getAllByRole("heading", { name: "Work pressure, risks and boundaries" })).toHaveLength(2);
    expect(screen.queryByText("Deadlines and evidence review create real pressure.")).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-content-block-id="risk-primary"] [data-nosnippet="true"]').length).toBeGreaterThan(0);
  });

  it("keeps registered legacy semantics off the raw primitive path", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.content_state = "legacy";
    content.blocks[0].content_state = "legacy";
    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    expect(screen.queryByText("Deadlines and evidence review create real pressure.")).not.toBeInTheDocument();
    expect(document.querySelector('[data-content-block-id="risk-primary"] [data-nosnippet="true"]')).not.toBeNull();
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
