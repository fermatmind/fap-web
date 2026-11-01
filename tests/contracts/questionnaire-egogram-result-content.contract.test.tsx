import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/egogram.json";
import content from "@/lib/questionnaires/result-content/egogram.json";
import { egogramResultProfile } from "@/lib/questionnaires/result-content/egogram";
import { QuestionnaireEgogramReport } from "@/components/questionnaires/QuestionnaireEgogramReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Five functional-stance reviews and conversations", () => {
  it("preserves 20 items and five identities while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(5);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = egogramResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(5);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(egogramResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without personal facet means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-egogram-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-ego-facet], [data-ego-mean]")).toBeNull();
      for (const s of egogramResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains all five full %s bodies and separate means across the completeness boundary", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["low", "high", "uncertain", "insufficient", "oneNA", "mixed", "exactQuarter"] as const) {
      const ratings = quiz.questions.map(q => {
        const partIndex = quiz.questions.filter(x => x.options[0].directionId === q.options[0].directionId).findIndex(x => x.id === q.id);
        const directionIndex = quiz.directions.findIndex(d => d.id === q.options[0].directionId);
        if (mode === "insufficient" || (mode === "oneNA" && directionIndex === 0 && partIndex === 3)) return null;
        return mode === "low" ? 1 : mode === "high" ? 5 : mode === "mixed" ? directionIndex + 1 : mode === "exactQuarter" ? [1, 2, 3, 3][partIndex] : 3;
      });
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireEgogramReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-egogram-result-reading]")).toHaveLength(5); expect(root.querySelectorAll("h4")).toHaveLength(55);
      for (const d of quiz.directions) {
        const part = ratings.filter((_, i) => quiz.questions[i].options[0].directionId === d.id).filter((n): n is number => n !== null);
        const mean = part.length === 4 ? part.reduce((s, n) => s + n, 0) / 4 : null;
        const facet = root.querySelector(`[data-ego-facet="${d.id}"]`)!;
        expect(facet.querySelector("[data-ego-total]")?.textContent).toBe(mean === null ? missing : String(part.reduce((s, n) => s + n, 0)));
        expect(facet.querySelectorAll("[data-ego-bar]")).toHaveLength(mean === null ? 0 : 1);
        expect(facet.querySelector("[data-ego-mean]")?.textContent).toBe(mean === null ? missing : `${mean.toFixed(2)} / 5`);
        expect(facet.querySelector("[data-ego-rated]")?.textContent).toContain(`${part.length} / 4`);
      }
      expect(root.querySelectorAll("[data-ego-insufficient]")).toHaveLength(mode === "insufficient" ? 5 : mode === "oneNA" ? 1 : 0);
      expect(result).not.toHaveProperty("total");
      expect(result).not.toHaveProperty("leaders");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
