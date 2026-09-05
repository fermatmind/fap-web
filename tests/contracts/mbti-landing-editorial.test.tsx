import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseLandingFaq, parseMbtiEditorial } from "@/lib/tests/mbtiLandingEditorial";
import { MbtiFaqAnswers, MbtiWhyChoose } from "@/components/tests/MbtiEditorialSections";
import { buildFAQPageJsonLd } from "@/lib/seo/generateSchema";

describe("CMS MBTI editorial", () => {
  it("accepts legacy question/answer and renders actual paragraphs with matching schema text", () => {
    const items = parseLandingFaq([{ question: "Question?", answer: "Direct answer.\n\nExplanation.", id: "faq-free" }]);
    const { container } = render(<MbtiFaqAnswers items={items} locale="zh" />);
    expect(container.querySelectorAll("#faq-free p")).toHaveLength(2);
    const schema = buildFAQPageJsonLd(items.map(({ q, a }) => ({ question: q, answer: a })));
    expect(JSON.stringify(schema)).toContain(JSON.stringify(items[0].a));
  });
  it("rejects unsafe links, empty answers, and duplicate anchors", () => {
    const items = parseLandingFaq([
      { q: "A", a: "Answer", id: "faq-free", references: [{ label: "Bad", href: "javascript:alert(1)" }], related_links: [{ label: "Next", href: "#faq-results" }] },
      { q: "B", a: "Answer", id: "faq-free" }, { q: "Empty", a: "" },
    ]);
    expect(items).toHaveLength(2);
    expect(items[0].references).toEqual([]);
    expect(items[0].related_links).toHaveLength(1);
    expect(items[1].id).toBeUndefined();
  });
  it("does not invent editorial content for missing fields or another locale", () => {
    expect(parseMbtiEditorial({})).toBeNull();
    expect(parseLandingFaq(null)).toEqual([]);
  });
  it("renders a semantic comparison and separates evidence from product links", () => {
    const content = parseMbtiEditorial({ why_choose: { title: "Why", intro: "Intro", items: [{ id: "versions", title: "Versions", body: "Choose", link: { label: "Start", href: "#choose-version" } }] }, version_comparison: { caption: "Comparison", columns: ["Item", "93", "144"], rows: [["Time", "10", "15"]], note: "Estimate" } });
    render(<MbtiWhyChoose content={content!} />);
    expect(screen.getByRole("table", { name: "Comparison" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getByRole("rowheader", { name: "Time" })).toBeInTheDocument();
    render(<MbtiFaqAnswers locale="zh" items={parseLandingFaq([{ q: "Q", a: "A", references: [{ label: "Study", href: "https://pubmed.ncbi.nlm.nih.gov/2709300/" }], related_links: [{ label: "Guide", href: "/zh/articles/mbti-basics" }] }])} />);
    expect(screen.getByText(/参考资料/)).toBeInTheDocument();
    expect(screen.getByText(/产品说明／延伸阅读/)).toBeInTheDocument();
  });
});
