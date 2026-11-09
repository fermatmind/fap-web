import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/dungeons-dragons-class.json";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual twelve-class editorial", () => {
  it("reproduces the exact public two-character tie example from actual options", () => {
    const ids = ["C","B","D","B","D","A","C","A","B","A","B","C","D","C","B","C","B","D","D","A","B","B","B","A"];
    const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id,ids[i]]));
    const result = scoreArchetypeQuestionnaire(quiz, answers);
    expect(result.status).toBe("complete");
    if(result.status!=="complete")throw new Error("Complete public example rejected");
    expect(Object.values(result.counts)).toEqual([1,0,2,2,2,2,2,2,1,4,2,4]);
    expect([...result.profileIds].sort()).toEqual(["sorcerer","wizard"]);
  });
  it("renders fixed-sum examples, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(12);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(12);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "十二类D&D职业" : "Twelve D&D class");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      expect(body).toContain("This work includes material from the System Reference Document 5.2.1");
      expect(body).toContain("https://creativecommons.org/licenses/by/4.0/legalcode");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|24 hours|opt-in tab progress|optional tab progress/i);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#dungeons-dragons-class-reference-4"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "1、0、2、2、2、2、2、2、1、4、2、4" : "1, 0, 2, 2, 2, 2, 2, 2, 1, 4, 2, 4");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
