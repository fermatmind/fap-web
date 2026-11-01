import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/locus-of-control.json";
import content from "@/lib/questionnaires/result-content/locus-of-control.json";
import { locusOfControlResultProfile } from "@/lib/questionnaires/result-content/locus-of-control";
import { QuestionnaireLocusReport } from "@/components/questionnaires/QuestionnaireLocusReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Published total-key review and conversation", () => {
  it("preserves 20 published items and one continuous identity while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(1);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = locusOfControlResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(1);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(locusOfControlResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without personal facet means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-locus-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-locus-facet], [data-locus-mean], [data-locus-total]")).toBeNull();
      for (const s of locusOfControlResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains the full %s bodies and separate means across the completeness boundary", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["low", "high", "neutral", "allAgree", "allDisagree", "insufficient", "oneNA", "exact41"] as const) {
      const ratings = quiz.questions.map((q, i) => {
        if (mode === "insufficient" || (mode === "oneNA" && i === 19)) return null;
        if (mode === "allAgree") return 5;
        if (mode === "allDisagree") return 1;
        const keyed = mode === "low" ? 1 : mode === "high" ? 5 : mode === "exact41" ? (i === 0 ? 3 : 2) : 3;
        return q.reverse ? 6 - keyed : keyed;
      });
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireLocusReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-locus-result-reading]")).toHaveLength(1); expect(root.querySelectorAll("h4")).toHaveLength(11);
      const keyed = ratings.flatMap((n, i) => n === null ? [] : [quiz.questions[i].reverse ? 6 - n : n]);
      const total = keyed.length === 20 ? keyed.reduce((s, n) => s + n, 0) : null;
      expect(root.querySelector("[data-locus-total]")?.textContent).toBe(total === null ? missing : String(total));
      expect(root.querySelector("[data-locus-mean]")?.textContent).toBe(total === null ? missing : `${(total / 20).toFixed(2)} / 5`);
      expect(root.querySelector("[data-locus-rated]")?.textContent).toContain(`${keyed.length} / 20`);
      expect(root.querySelectorAll("[data-locus-insufficient]")).toHaveLength(total === null ? 1 : 0);
      expect(result).not.toHaveProperty("total");
      expect(result).not.toHaveProperty("leaders");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
