import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import TraditionalCareerJobPage from "@/app/(traditional)/zh-TW/career/jobs/[slug]/page";
import { normalizeCareerPage, type CareerPage } from "@/lib/career/careerPage";
import type { CareerContentV3Block, CareerContentV3Item } from "@/lib/career/contentV3";
import { canonicalUrl } from "@/lib/site";

vi.mock("@/lib/career/api/fetchCareerJobBundle", () => ({
  fetchCareerJobBundle: async () => ({ seo_contract: { index_eligible: true } }),
}));
vi.mock("@/lib/career/api/fetchCareerLinkTargets", () => ({ fetchCareerLinkTargets: async () => ({}) }));
vi.mock("@/lib/tests/traditionalAssessmentDisplay", () => ({ loadTraditionalAssessmentText: async () => null }));
vi.mock("@/components/career/FixedComparisonPreviewEntry", () => ({ FixedComparisonPreviewEntry: () => null }));
vi.mock("@/components/career/CareerRiasecExploreLink", () => ({ CareerRiasecExploreLink: () => null }));
vi.mock("@/lib/career/careerPage", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/career/careerPage")>(),
  normalizeCareerPage: vi.fn(),
  validateCareerPageAuthority: vi.fn(),
}));

const slug = "interpreters-and-translators";
const title = "口譯與筆譯人員";
const path = `/zh-TW/career/jobs/${slug}`;
const sample = "保留原稿的時間戳記，再把兩個用詞差異交給審校人。";
const faq = [
  { question: "交件前要核對什麼？", answer: "比對委託範圍及術語表。" },
  { question: "誰負責最後審校？", answer: "由譯稿流程指定的審校人複核。" },
];

function fixture(showFaq: boolean): CareerPage {
  const item = (fields: Pick<CareerContentV3Item, "id" | "copyKey" | "type" | "data">): CareerContentV3Item => ({
    availability: "available", factRefs: [], sourceRefs: [], ...fields,
  });
  const sources: CareerContentV3Block = {
    id: "sources", copyKey: "career.block.sources", renderable: true, contentState: "enhanced", availability: "available",
    items: [item({ id: "faq", copyKey: "career.item.faq-block", type: "faq", data: { entries: faq } })],
  };
  const entry: CareerContentV3Block = {
    id: "entry-exercise", copyKey: "career.block.additional", renderable: true, contentState: "enhanced", availability: "available",
    items: [{
      ...item({ id: `${slug}.entry-work-sample-data.2`, copyKey: "career.item.entry-work-sample-data", type: "notice", data: { paragraphs: [sample] } }),
      title: "紙面試做樣答",
    }],
  };
  const components = {
    definition_block: "依工作情境完成口語或書面轉譯。",
    ...(showFaq ? { faq_block: { items: faq } } : {}),
  };
  return {
    displayLocale: "zh-TW",
    display: {
      contract_version: "career.detail.display.v1", path,
      component_order: Object.keys(components), components,
      section_titles: { sources: "常見問題", "entry-exercise": "入行練習" },
    },
    hero: { badges: [], metrics: [], ai: { key: "ai", label: "AI 影響", availability: "missing", fact: null } },
    seo: { title: null, description: null },
    content: {
      contractVersion: "career.detail.content.v3", locale: "zh", contentState: "enhanced",
      sourceContentSha256: "a".repeat(64), subject: { canonicalSlug: slug, name: title, summary: null },
      facts: [], sources: [], blocks: [sources, entry],
    },
  };
}

async function renderCareerPage(showFaq = true) {
  vi.mocked(normalizeCareerPage).mockReturnValue(fixture(showFaq));
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(await TraditionalCareerJobPage({ params: Promise.resolve({ slug }) }));
  return root;
}

describe("Traditional Chinese career detail JSON-LD", () => {
  it("emits a Traditional Chinese breadcrumb and the exact rendered FAQ without the work-sample answer", async () => {
    const root = await renderCareerPage();
    const schemas = Array.from(root.querySelectorAll('script[type="application/ld+json"]'), (node) => JSON.parse(node.textContent!));
    expect(schemas.map((node) => node["@type"])).toEqual(["BreadcrumbList", "FAQPage"]);
    expect(schemas[0]).toEqual({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "首頁", item: canonicalUrl("/zh-TW") },
        { "@type": "ListItem", position: 2, name: "職涯探索", item: canonicalUrl("/zh-TW/career") },
        { "@type": "ListItem", position: 3, name: title, item: canonicalUrl(path) },
      ],
    });

    const visible = [...root.querySelectorAll('[data-testid="career-display-faq"] details')].map((node) => ({
      question: node.querySelector("summary")?.textContent,
      answer: node.querySelector('[data-career-api-field$=".answer"]')?.textContent,
    }));
    expect(visible).toEqual(faq);
    expect(schemas[1]).toEqual({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: visible.map(({ question, answer }) => ({
        "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
    expect(root.querySelector("#career-content-entry-exercise")?.textContent).toContain(sample);
    expect(JSON.stringify(schemas[1])).not.toContain(sample);
    expect(JSON.stringify(schemas[1])).not.toContain("紙面試做樣答");
  });

  it("does not emit FAQPage when the display has no FAQ component", async () => {
    const root = await renderCareerPage(false);
    expect(root.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(root.querySelector('[data-testid="career-display-faq"]')).toBeNull();
  });
});
