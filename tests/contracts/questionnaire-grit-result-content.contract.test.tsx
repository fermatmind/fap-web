import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/grit-test.json";
import content from "@/lib/questionnaires/result-content/grit.json";
import { gritResultProfile } from "@/lib/questionnaires/result-content/grit";
import { QuestionnaireGritReport } from "@/components/questionnaires/QuestionnaireGritReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Two long-goal practice reviews and conversations", () => {
  it("preserves 16 original items and two identities while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(16); expect(quiz.profiles).toHaveLength(2);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = gritResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(2);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(gritResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without personal facet means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-grit-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-grit-facet], [data-grit-mean]")).toBeNull();
      for (const s of gritResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains both full %s bodies and separate means across the completeness boundary", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["low", "high", "insufficient", "boundary", "mixed", "exactSix"] as const) {
      const ratings = quiz.questions.map(q => {
        const partIndex = quiz.questions.filter(x => x.options[0].directionId === q.options[0].directionId).findIndex(x => x.id === q.id);
        const directionIndex = quiz.directions.findIndex(d => d.id === q.options[0].directionId);
        if (mode === "insufficient" || (mode === "boundary" && partIndex >= directionIndex + 5) || (mode === "exactSix" && partIndex >= 6)) return null;
        const keyed = mode === "low" ? 1 : mode === "high" ? 5 : mode === "mixed" ? (directionIndex === 0 ? 1 : 5) : mode === "exactSix" ? (partIndex < 2 ? 1 : 2) : 3;
        return q.reverse ? 6 - keyed : keyed;
      });
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireGritReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-grit-result-reading]")).toHaveLength(2); expect(root.querySelectorAll("h4")).toHaveLength(22);
      for (const d of quiz.directions) {
        const keyed = quiz.questions.flatMap((q, i) => q.options[0].directionId !== d.id || ratings[i] === null ? [] : [q.reverse ? 6 - ratings[i]! : ratings[i]!]);
        const mean = keyed.length >= 6 ? keyed.reduce((s, n) => s + n, 0) / keyed.length : null;
        const facet = root.querySelector(`[data-grit-facet="${d.id}"]`)!;
        expect(facet.querySelector("[data-grit-mean]")?.textContent).toBe(mean === null ? missing : `${mean.toFixed(2)} / 5`);
        expect(facet.querySelector("[data-grit-rated]")?.textContent).toContain(`${keyed.length} / 8`);
      }
      expect(root.querySelectorAll("[data-grit-insufficient]")).toHaveLength(mode === "insufficient" ? 1 : 0);
      expect(result).not.toHaveProperty("total");
      expect(result).not.toHaveProperty("leaders");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
