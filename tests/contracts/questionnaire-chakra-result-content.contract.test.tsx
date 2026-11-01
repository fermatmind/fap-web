import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/chakra.json";
import content from "@/lib/questionnaires/result-content/chakra.json";
import { chakraResultProfile } from "@/lib/questionnaires/result-content/chakra";
import { QuestionnaireChakraReport } from "@/components/questionnaires/QuestionnaireChakraReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Seven symbolic-theme reviews and conversations", () => {
  it("preserves 28 items and seven identities while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(28); expect(quiz.profiles).toHaveLength(7);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = chakraResultProfile(p);
      expect(reading.sections.slice(0, 6)).toEqual(p.sections); expect(reading.sections).toHaveLength(9);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(9);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [1, 2])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(7);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(chakraResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without personal facet means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-chakra-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-chakra-group], [data-chakra-mean]")).toBeNull();
      for (const s of chakraResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains all seven full %s bodies and separate means across the completeness boundary", locale => {
    const missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of ["low", "high", "uncertain", "insufficient", "oneNA", "twoNA", "mixed", "workedExample", "workedMissing"] as const) {
      const ratings = quiz.questions.map(q => {
        const partIndex = quiz.questions.filter(x => x.options[0].directionId === q.options[0].directionId).findIndex(x => x.id === q.id);
        const directionIndex = quiz.directions.findIndex(d => d.id === q.options[0].directionId);
        if (mode === "insufficient" || ((mode === "oneNA" || mode === "twoNA" || mode === "workedMissing") && directionIndex === 0 && partIndex === 2) || (mode === "twoNA" && directionIndex === 0 && partIndex === 1)) return null;
        return mode === "low" ? 1 : mode === "high" ? 5 : mode === "mixed" ? directionIndex % 5 + 1 : (mode === "workedExample" || mode === "workedMissing") ? [2, 4, 5, 2][partIndex] : 3;
      });
      const result = scoreLikertQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((q, i) => [q.id, ratings[i] === null ? "na" : String(ratings[i])])));
      if (result.status !== "complete") throw new Error("Actual-item witness required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireChakraReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-chakra-result-reading]")).toHaveLength(7); expect(root.querySelectorAll("h4")).toHaveLength(63);
      for (const d of quiz.directions) {
        const part = ratings.flatMap((raw, i) => quiz.questions[i].options[0].directionId !== d.id || raw === null ? [] : [quiz.questions[i].reverse ? 6 - raw : raw]);
        const sum = part.reduce((s, n) => s + n, 0);
        const mean = part.length >= 3 ? Math.round(sum / part.length * 10) / 10 : null;
        const facet = root.querySelector(`[data-chakra-group="${d.id}"]`)!;
        expect(facet.querySelector("[data-chakra-sum]")?.textContent).toBe(mean === null ? missing : String(sum));
        expect(facet.querySelector("[data-chakra-mean]")?.textContent).toBe(mean === null ? missing : `${mean.toFixed(1)} / 5`);
        expect(facet.querySelector("[data-chakra-rated]")?.textContent).toContain(`${part.length} / 4`);
      }
      expect(root.querySelectorAll("[data-chakra-insufficient]")).toHaveLength(mode === "insufficient" ? 7 : mode === "twoNA" ? 1 : 0);
      expect(result).not.toHaveProperty("total");
      expect(result).not.toHaveProperty("leaders");
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const s of content[profile.id as keyof typeof content]) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${s.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
