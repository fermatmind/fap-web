import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/communication-style.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { communicationLandingSummary } from "@/components/questionnaires/CommunicationLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual communication frequency landing editorial", () => {
  it("renders worked means, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => communicationLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(4);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(4);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "四种沟通方式" : "Four full communication guides");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#communication-style-reference-4"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "18÷5＝3.6" : "18÷5 = 3.6");
      expect(quiz.guide.find(section => section.id === "facet-scoring")?.paragraphs[0][locale]).toContain(locale === "zh" ? "无反向" : "none of the 24 items is reverse-scored");
      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
