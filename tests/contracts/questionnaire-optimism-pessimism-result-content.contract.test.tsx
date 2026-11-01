import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/optimism-pessimism.json";
import content from "@/lib/questionnaires/result-content/optimism-pessimism.json";
import { optimismPessimismResultProfile } from "@/lib/questionnaires/result-content/optimism-pessimism";
import { QuestionnaireOptimismReport } from "@/components/questionnaires/QuestionnaireOptimismReport";
import { scoreOptimismQuestionnaire } from "@/lib/questionnaires/optimism";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("IPIP Optimism contextual reviews and conversations", () => {
  it("preserves the ten source items and five identities while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(10); expect(quiz.profiles).toHaveLength(5);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = optimismPessimismResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(5);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(optimismPessimismResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders all five public %s guides without attempt scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-optimism-pessimism-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-optimism-score], [data-optimism-total]")).toBeNull();
      for (const s of optimismPessimismResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains every matched %s body across all41totals and withholds missing interpretations", locale => {
    for (let total = 10; total <= 50; total++) {
      let extra = total - 10;
      const answers = Object.fromEntries(quiz.questions.map(q => {
        const keyed = 1 + Math.min(4, extra); extra -= keyed - 1;
        return [q.id, String(q.reverse ? 6 - keyed : keyed)];
      }));
      const result = scoreOptimismQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete actual-item witness required");
      expect(result.total).toBe(total); expect(result.mean).toBe(total / 10);
      const ids = quiz.profiles.map(p => p.id).filter((_, i) => total >= [10, 18, 26, 34, 42][i] && total <= [18, 26, 34, 42, 50][i]);
      expect(result.outlookProfileIds).toEqual(ids);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireOptimismReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-optimism-pessimism-result-reading]")).toHaveLength(ids.length);
      expect(root.querySelectorAll("h4")).toHaveLength(ids.length * 11);
      const anchors = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(anchors).size).toBe(anchors.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(anchors).toContain(a.getAttribute("href")!.slice(1));
      for (const id of ids) for (const s of content[id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
    for (const count of [0, 9]) {
      const result = scoreOptimismQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, i < count ? "3" : "na"])));
      if (result.status !== "complete") throw new Error("Complete NA attempt required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireOptimismReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(result.total).toBeNull(); expect(root.querySelector("[data-optimism-pessimism-result-reading], [data-optimism-total]")).toBeNull();
      expect(root.querySelector("[data-optimism-insufficient]")).not.toBeNull(); expect(root.querySelectorAll("a")).toHaveLength(5);
    }
  });
});
