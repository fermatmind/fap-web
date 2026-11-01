import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/chinese-zodiac.json";
import reference from "@/tests/fixtures/questionnaires/chinese-zodiac-reference.json";
import content from "@/lib/questionnaires/result-content/chinese-zodiac.json";
import { chineseZodiacResultProfile } from "@/lib/questionnaires/result-content/chinese-zodiac";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Twelve bilingual chinese-zodiac revision readings", () => {
  it("preserves the actual source guides and provides distinct bilingual review examples", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const prepared = chineseZodiacResultProfile(p);
      expect(prepared.sections.slice(0, 7)).toEqual(p.sections);
      expect(prepared.sections).toHaveLength(9);
      expect(new Set(prepared.sections.map(s => s.id)).size).toBe(9);
    }
    for (const locale of ["en", "zh"] as const)
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(12);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(chineseZodiacResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders each public %s guide without personal answers or counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-chinese-zodiac-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-practice-correct], [data-practice-question]")).toBeNull();
      for (const s of chineseZodiacResultProfile(p).sections) for (const text of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["zh", "en"] as const)("keeps all 79 solo and pair or twelve-way %s tie complete", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz);
    for (const witness of reference.witnesses) {
      const answers = witness.answers;
      const result = scoreQuestionnaire(quiz, answers);
      expect(scoreQuestionnaire(prepared, answers)).toEqual(result);
      if (result.status !== "complete" || !("profileIds" in result)) throw Error("Complete archetype witness required");
      expect(result.profileIds).toEqual(witness.winners);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepared} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-archetype-count]")).toHaveLength(12);
      expect(root.querySelectorAll("[data-chinese-zodiac-result-reading]")).toHaveLength(result.profileIds.length);
      expect(root.querySelectorAll("h4")).toHaveLength(result.profileIds.length * 9);
      for (const id of result.profileIds) for (const section of content[id as keyof typeof content]) for (const text of section.paragraphs)
        expect(root.querySelector(`#report-${id}-${section.id}`)?.textContent).toContain(text[locale]);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
