import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/cyberpunk-edgerunners.json";
import content from "@/lib/questionnaires/result-content/cyberpunk-edgerunners.json";
import { cyberpunkEdgerunnersResultProfile } from "@/lib/questionnaires/result-content/cyberpunk-edgerunners";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Seven bilingual cyberpunk-edgerunners revision readings", () => {
  it("preserves the actual source guides and provides distinct bilingual review examples", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const prepared = cyberpunkEdgerunnersResultProfile(p);
      expect(prepared.sections.slice(0, 7)).toEqual(p.sections);
      expect(prepared.sections).toHaveLength(9);
      expect(new Set(prepared.sections.map(s => s.id)).size).toBe(9);
    }
    for (const locale of ["en", "zh"] as const)
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(7);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(cyberpunkEdgerunnersResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders each public %s guide without personal answers or counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-cyberpunk-edgerunners-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-practice-correct], [data-practice-question]")).toBeNull();
      for (const s of cyberpunkEdgerunnersResultProfile(p).sections) for (const text of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["zh", "en"] as const)("keeps all seven sole leads and the seven-way %s tie complete", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz);
    for (const target of [...quiz.directions.map(d => d.id), undefined]) {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, (q.options.find(o => o.directionId === target) ?? q.options[0]).id]));
      const result = scoreQuestionnaire(quiz, answers);
      expect(scoreQuestionnaire(prepared, answers)).toEqual(result);
      if (result.status !== "complete" || !("profileIds" in result)) throw Error("Complete archetype witness required");
      expect(result.profileIds).toHaveLength(target ? 1 : 7);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepared} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-archetype-count]")).toHaveLength(7);
      expect(root.querySelectorAll("[data-cyberpunk-edgerunners-result-reading]")).toHaveLength(result.profileIds.length);
      expect(root.querySelectorAll("h4")).toHaveLength(result.profileIds.length * 9);
      for (const id of result.profileIds) for (const section of content[id as keyof typeof content]) for (const text of section.paragraphs)
        expect(root.querySelector(`#report-${id}-${section.id}`)?.textContent).toContain(text[locale]);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
