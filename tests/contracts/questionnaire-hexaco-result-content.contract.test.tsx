import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/hexaco.json";
import content from "@/lib/questionnaires/result-content/hexaco.json";
import { hexacoResultProfile } from "@/lib/questionnaires/result-content/hexaco";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireHexacoReport } from "@/components/questionnaires/QuestionnaireHexacoReport";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const modes = ["middle", "all-na", "one-h-na", "keyed-low", "keyed-high", "rounding", "one-x-change"] as const;
function answersFor(mode: typeof modes[number]): QuestionnaireAnswers {
  const answers = Object.fromEntries(quiz.questions.map(q => [q.id, mode === "all-na" ? "na" : mode === "keyed-low" ? (q.reverse ? "5" : "1") : mode === "keyed-high" ? (q.reverse ? "1" : "5") : "3"]));
  if (mode === "one-h-na") answers.HEX_001 = "na";
  if (mode === "one-x-change") answers.HEX_081 = "5";
  if (mode === "rounding") {
    for (const q of quiz.questions.filter(q => q.options[0].directionId === "C")) answers[q.id] = q.reverse ? "4" : "2";
    answers.HEX_161 = "5";
  }
  return answers;
}

describe("Six bilingual preliminary IPIP HEXACO domain readings", () => {
  it("keeps all original identity, source paragraphs and eight modules with distinct counterexamples", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    expect(prepared.questions).toBe(quiz.questions);
    expect(prepared.minimumRatedItems).toBe(40);
    for (const profile of quiz.profiles) {
      const reading = hexacoResultProfile(profile);
      expect(reading.sections.map(s => s.id)).toEqual(profile.sections.map(s => s.id));
      expect(reading.title).toEqual(profile.title);
      expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.scoreReading).toEqual(profile.scoreReading);
      for (const section of profile.sections) expect(reading.sections.find(s => s.id === section.id)!.paragraphs.slice(0, section.paragraphs.length)).toEqual(section.paragraphs);
      expect(reading.sections.flatMap(s => s.paragraphs)).toHaveLength(11);
    }
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(Object.values(content).map(s => s[0].paragraphs[0][locale])).size).toBe(6);
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(6);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(hexacoResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders all six public %s guides without personal means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-hexaco-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-hexaco-mean], [data-hexaco-sum], [data-hexaco-domain]")).toBeNull();
      for (const section of content[profile.id as keyof typeof content]) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("retains all six complete %s readings through ratings, NA and exact display rounding", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz), missing = locale === "zh" ? "资料不足" : "Insufficient information";
    for (const mode of modes) {
      const answers = answersFor(mode), result = scoreQuestionnaire(prepared, answers);
      expect(result).toEqual(scoreQuestionnaire(quiz, answers));
      if (result.status !== "complete" || !("facets" in result)) throw Error("Complete domain record required");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireHexacoReport quiz={prepared} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-hexaco-domain]")).toHaveLength(6);
      expect(root.querySelectorAll("[data-hexaco-result-reading]")).toHaveLength(6);
      expect(root.querySelectorAll("h4")).toHaveLength(48);
      expect(root.querySelectorAll("[data-hexaco-insufficient]")).toHaveLength(mode === "all-na" ? 6 : mode === "one-h-na" ? 1 : 0);
      for (const profile of quiz.profiles) {
        const domain = profile.directionIds[0], facet = result.facets[domain], el = root.querySelector(`[data-hexaco-domain="${domain}"]`)!;
        expect(el.querySelector("[data-hexaco-mean]")?.textContent).toBe(facet.rated === 40 ? `${(facet.sum / 40).toFixed(2)} / 5` : missing);
        expect(el.querySelector("[data-hexaco-sum]")?.textContent).toBe(facet.rated === 40 ? String(facet.sum) : missing);
        for (const section of content[profile.id as keyof typeof content]) for (const paragraph of section.paragraphs)
          expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(paragraph[locale]);
      }
      if (mode === "rounding") {
        expect(result.facets.C.sum).toBe(83);
        expect(result.facets.C.mean).toBe(2.1);
        expect(root.querySelector('[data-hexaco-domain="C"] [data-hexaco-mean]')?.textContent).toBe("2.08 / 5");
      }
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
