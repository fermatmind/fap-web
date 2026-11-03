import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/difficult-person-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { frictionLandingSummary } from "@/components/questionnaires/FrictionLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual interpersonal behaviour landing editorial", () => {
  it("renders worked means, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => frictionLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(7);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(7);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "七类互动行为" : "Seven interaction patterns");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(12);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#difficult-person-test-reference-1"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "7÷3≈2.3" : "7/3≈2.3");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
