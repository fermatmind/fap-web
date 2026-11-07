import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/space-marine-chapter.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { chapterChoiceReasons, chapterPortraitPath } from "@/lib/questionnaires/spaceMarineChapters";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { SpaceMarineChapterGuideIntro } from "@/components/questionnaires/SpaceMarineChapterGuideIntro";

const quiz = source as Questionnaire;
const witnesses = [Array(18).fill("A"), ["A","A","A","A","A","A","A","A","A","A","A","B","A","A","D","D","D","C"], ["A","A","A","D","C","B","A","A","A","D","C","B","A","C","B","D","C","B"]];
describe("Space Marine personal reasons and public illustration boundary", () => {
  it.each(["en", "zh"] as const)("quotes only actual selected source scenes for every highest %s Chapter", locale => {
    for (const values of witnesses) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, values[i]]));
      const result = scoreArchetypeQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("Incomplete witness");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} answers={answers} locale={locale} />);
      expect(dom.querySelectorAll("[data-space-marine-reasons]")).toHaveLength(result.profileIds.length);
      for (const id of result.profileIds) {
        const expected = quiz.questions.flatMap(q => { const o = q.options.find(o => o.id === answers[q.id] && o.directionId === id); return o ? [{q, o}] : []; }).slice(0, 2);
        const block = dom.querySelector(`[data-space-marine-reasons="${id}"]`)!;
        expect(block.querySelectorAll("q")).toHaveLength(expected.length);
        for (const {q, o} of expected) { expect(block.textContent).toContain(q.prompt[locale]); expect(block.textContent).toContain(o.label[locale]); }
      }
      expect(dom.querySelectorAll("[data-archetype-match] h4")).toHaveLength(result.profileIds.length * 9);
      expect(dom.querySelector("[data-space-marine-personal-card]")).not.toBeNull();
    }
  });
  it("does not invent reasons without answers or accept an unknown portrait identity", () => {
    expect(chapterChoiceReasons(quiz, "ultramarines")).toEqual([]);
    expect(chapterChoiceReasons(quiz, "unknown", {SMC_01: "A"})).toEqual([]);
    expect(chapterPortraitPath("../private")).toBeUndefined();
    expect(chapterChoiceReasons(quiz, "ultramarines", {SMC_01: "B"})).toEqual([]);
  });
  it.each(["en", "zh"] as const)("keeps all six %s public guides free of personal reasons and counts", locale => {
    for (const profile of quiz.profiles) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<SpaceMarineChapterGuideIntro profile={profile} locale={locale} />);
      expect(dom.querySelector("img")?.getAttribute("src")).toBe(chapterPortraitPath(profile.id));
      expect(dom.querySelector("[data-space-marine-reasons]")).toBeNull();
      expect(dom.querySelector("[data-space-marine-personal-card]")).toBeNull();
      expect(dom.textContent).toContain(locale === "zh" ? "纸模型展示" : "paper-model display");
    }
  });
});
