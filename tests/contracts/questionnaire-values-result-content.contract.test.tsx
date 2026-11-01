import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/values.json";
import content from "@/lib/questionnaires/result-content/values.json";
import { valuesResultProfile } from "@/lib/questionnaires/result-content/values";
import { QuestionnaireValuesReport } from "@/components/questionnaires/QuestionnaireValuesReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Ten value-goal choice reviews and conversations", () => {
  it("preserves30items and ten identities while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(30); expect(quiz.profiles).toHaveLength(10);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = valuesResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(10);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(valuesResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without raw or relative attempt scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-values-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-values-facet], [data-values-relative], [data-values-baseline]")).toBeNull();
      for (const s of valuesResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("keeps all ten full %s bodies, unrounded relative arithmetic and explicit missing values", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["equalLow", "equalHigh", "insufficient", "oneNA", "firstHigh", "unrounded"] as const) {
      const ratings = quiz.questions.map((q, i) => mode === "insufficient" || (mode === "oneNA" && i === 0) ? null
        : mode === "equalLow" ? 1 : mode === "equalHigh" ? 5 : mode === "firstHigh" ? (q.options[0].directionId === quiz.directions[0].id ? 5 : 1)
          : mode === "unrounded" ? (i === 0 ? 1 : 2) : 3);
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const baseline = ratings.every(n => n !== null) ? ratings.reduce<number>((sum, n) => sum + (n ?? 0), 0) / 30 : null;
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireValuesReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-values-result-reading]")).toHaveLength(10); expect(root.querySelectorAll("h4")).toHaveLength(110);
      expect(root.querySelector("[data-values-baseline]")?.textContent).toBe(baseline === null ? missing : baseline.toFixed(2));
      for (const d of quiz.directions) {
        const part = ratings.filter((_, i) => quiz.questions[i].options[0].directionId === d.id);
        const mean = part.every(n => n !== null) ? part.reduce<number>((s, n) => s + (n ?? 0), 0) / 3 : null;
        const relative = baseline === null || mean === null ? null : mean - baseline;
        const display = relative === null ? missing : `${relative > 0 ? "+" : ""}${(Math.abs(relative) < 0.0000001 ? 0 : relative).toFixed(2)}`;
        expect(root.querySelector(`[data-values-facet="${d.id}"] [data-values-mean]`)?.textContent).toBe(mean === null ? missing : `${mean.toFixed(2)} / 5`);
        expect(root.querySelector(`[data-values-facet="${d.id}"] [data-values-relative]`)?.textContent).toBe(display);
      }
      expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
