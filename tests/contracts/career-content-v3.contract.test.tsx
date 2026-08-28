import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { CareerContentV3Surface } from "@/components/career/display/CareerContentV3Surface";
import { adaptCareerDisplaySurface, buildCareerDisplayFAQPageJsonLd } from "@/lib/career/displaySurface";
import { normalizeCareerContentV3 } from "@/lib/career/contentV3";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

function v3Fixture(locale: "en" | "zh" = "en") {
  const isZh = locale === "zh";
  return {
    contract_version: "career.detail.content.v3",
    locale: isZh ? "zh-CN" : "en",
    subject: {
      canonical_slug: "accountants-and-auditors",
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

function surfaceFixture(locale: "en" | "zh" = "en") {
  const fixture = buildSelectedCareerDisplaySurfaceFixture({
    slug: "accountants-and-auditors",
    locale,
    titleEn: "Accountants and Auditors",
    titleZh: "会计师和审计师",
    presentationV2: "enhanced",
  }) as ReturnType<typeof buildSelectedCareerDisplaySurfaceFixture> & { content_v3?: unknown };
  fixture.content_v3 = v3Fixture(locale);
  return fixture;
}

describe("career content v3 contract", () => {
  it("renders arbitrary block order and repeated semantics through the universal registry", () => {
    const surface = adaptCareerDisplaySurface(surfaceFixture("en"), "en");
    render(<CareerDisplaySurface surface={surface} />);

    const page = screen.getByTestId("career-content-v3-surface");
    expect(page).toHaveTextContent("Accountants and Auditors");
    const headings = within(page).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(headings).toEqual([
      "Work pressure, risks and boundaries",
      "Career profile",
      "Work pressure, risks and boundaries",
      "Questions and sources",
    ]);
    expect(within(page).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Career risks", "Career definition", "Career risks", "Frequently asked questions",
    ]);
    expect(within(page).getByRole("heading", { level: 4, name: "Detail 1" })).toBeInTheDocument();
    const toc = screen.getByTestId("career-content-v3-toc");
    expect(within(toc).getAllByRole("link")).toHaveLength(4);
  });

  it("closes unknown copy keys and unknown primitives without crashing the page or TOC", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks.splice(1, 0,
      { ...content.blocks[0], id: "unknown-copy", copy_key: "career.block.not-in-catalog" },
      { ...content.blocks[0], id: "unknown-item-copy", items: [{ ...content.blocks[0].items[0], id: "unknown-item-copy-1", copy_key: "career.item.not-in-catalog" }] } as never,
      { ...content.blocks[0], id: "unknown-primitive", items: [{ id: "raw-1", copy_key: "career.item.career-risk-cards", type: "raw-html", availability: "available", data: { html: "<h2>unsafe</h2>" } }] } as never,
    );

    const surface = adaptCareerDisplaySurface(fixture, "en");
    render(<CareerDisplaySurface surface={surface} />);

    expect(document.querySelectorAll("[data-nosnippet='true']")).toHaveLength(3);
    expect(screen.getByTestId("career-content-v3-toc").querySelectorAll("a")).toHaveLength(4);
    expect(screen.queryByText("unsafe")).not.toBeInTheDocument();
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
    expect(screen.getByTestId("career-content-v3-toc").querySelectorAll("a")).toHaveLength(3);
    expect(document.querySelectorAll("[data-nosnippet='true']")).toHaveLength(1);
  });

  it("keeps available body copy when an optional subitem is missing", () => {
    const fixture = surfaceFixture("en");
    const content = fixture.content_v3 as ReturnType<typeof v3Fixture>;
    content.blocks[0].items.push({ id: "optional-missing", copy_key: "career.item.career-risk-cards", type: "notice", availability: "missing", data: {} } as never);

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "en")} />);

    expect(screen.getAllByRole("heading", { name: "Work pressure, risks and boundaries" })).toHaveLength(2);
    expect(screen.getByText("Deadlines and evidence review create real pressure.")).toBeInTheDocument();
    expect(document.querySelectorAll("[data-nosnippet='true']")).toHaveLength(0);
  });

  it("falls back to presentation v2 when the v3 root is invalid", () => {
    const fixture = surfaceFixture("zh");
    (fixture.content_v3 as Record<string, unknown>).locale = "fr";
    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.queryByTestId("career-content-v3-surface")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-display-hero")).toBeInTheDocument();
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

  it("renders the same bilingual template for all 1046 slug identities", () => {
    for (let index = 1; index <= 1046; index += 1) {
      const slug = `career-role-${index}`;
      for (const locale of ["en", "zh"] as const) {
        const raw = v3Fixture(locale);
        raw.subject.canonical_slug = slug;
        raw.subject.name = locale === "zh" ? `职业 ${index}` : `Career role ${index}`;
        const content = normalizeCareerContentV3(raw, locale);
        expect(content).not.toBeNull();
        const html = renderToStaticMarkup(<CareerContentV3Surface content={content!} ctaHref={`/${locale}/tests/holland-career-interest-test-riasec`} />);
        expect(html).toContain(`data-content-contract="career.detail.content.v3"`);
        expect(html).toContain(`id="career-content-risk-primary"`);
        expect(html).not.toContain("overflow-x:hidden");
      }
    }
  });
});
