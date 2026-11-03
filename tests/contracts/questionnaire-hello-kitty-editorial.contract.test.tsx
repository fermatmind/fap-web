import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/hello-kitty.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { helloKittyLandingSummary } from "@/components/questionnaires/HelloKittyLandingEditorial";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual seven-character editorial", () => {
  it("reproduces the exact public two-character tie example from actual options", () => {
    const ids = ["B","D","D","A","B","B","D","A","C","D","D","C","D","A","C","D","B","D","B","A","D"];
    const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id,ids[i]]));
    const result = scoreArchetypeQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if(result.status!=="complete")throw new Error("Complete public example rejected");
    expect(Object.values(result.counts)).toEqual([1,2,3,3,2,5,5]);
    expect([...result.profileIds].sort()).toEqual(["cinnamoroll","pompompurin"]);
  });
  it("renders fixed-sum examples, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => helloKittyLandingSummary(profile,locale));
      expect(new Set(summaries).size).toBe(7);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(7);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "七位三丽鸥角色" : "Seven Sanrio character");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#hello-kitty-reference-8"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "1、2、3、3、2、5、5" : "1, 2, 3, 3, 2, 5, 5");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
