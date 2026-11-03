import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/death-note.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
import { deathNoteLandingSummary } from "@/components/questionnaires/DeathNoteLandingEditorial";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual eight-character editorial", () => {
  it("reproduces the exact public two-character tie example from actual options", () => {
    const ids = ["B","A","C","B","A","B","A","B","B","C","A","B","D","C","D","C","A","C","C","D","C","A","C","A"];
    const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id,ids[i]]));
    const result = scoreArchetypeQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if(result.status!=="complete")throw new Error("Complete public example rejected");
    expect(Object.values(result.counts)).toEqual([3,5,1,2,5,1,4,3]);
    expect([...result.profileIds].sort()).toEqual(["l","near"]);
  });
  it("renders fixed-sum examples, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => deathNoteLandingSummary(profile,locale));
      expect(new Set(summaries).size).toBe(8);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(8);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "八位角色" : "Eight character");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#death-note-reference-4"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "3、5、1、2、5、1、4、3" : "3, 5, 1, 2, 5, 1, 4, 3");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
