import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/character-strengths.json";
import content from "@/lib/questionnaires/result-content/character-strengths.json";
import { characterStrengthsResultProfile } from "@/lib/questionnaires/result-content/character-strengths";
import { QuestionnaireCharacterStrengthsReport } from "@/components/questionnaires/QuestionnaireCharacterStrengthsReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("IPIP-VIA-R contextual review and voluntary sharing", () => {
  it("retains all96items,24identities and original sections with distinct bilingual additions", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(96); expect(quiz.profiles).toHaveLength(24);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = characterStrengthsResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds); expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(11); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(sections => sections[index].paragraphs[0][locale])).size).toBe(24);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(characterStrengthsResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders all24public %s guides with source attribution and without private scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-character-strengths-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-character-mean], [data-character-sum], [data-character-facet]")).toBeNull();
      expect(root.querySelector('[data-character-source] a')?.getAttribute('href')).toBe('https://ipip.ori.org/IPIP-VIA-R_Key.html');
      for (const section of characterStrengthsResultProfile(profile).sections) for (const p of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("keeps all24 %s bodies when ratings differ or any part lacks four valid items", locale => {
    const first = quiz.directions[0].id;
    for (const mode of ["mixed", "low", "equal", "insufficient", "oneNA", "threeRated", "straight"] as const) {
      let firstRatings = 0;
      const answers = Object.fromEntries(quiz.questions.map((q, index) => {
        const selected = q.options[0].directionId === first;
        const valid = mode !== "insufficient" && !(mode === "mixed" && !selected) && !(mode === "oneNA" && index === 0) && !(mode === "threeRated" && (!selected || ++firstRatings > 3));
        const value = mode === "low" ? 1 : 3;
        return [q.id, valid ? mode === "straight" ? "5" : String(q.reverse ? 6 - value : value) : "na"];
      }));
      const result = scoreLikertQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete actual-item attempt required");
      for (const [id, facet] of Object.entries(result.facets)) {
        const insufficient = mode === "insufficient" || mode === "threeRated" || (mode === "mixed" && id !== first) || (mode === "oneNA" && id === first);
        expect(facet.mean).toBe(insufficient ? null : mode === "low" ? 1 : 3);
        if (!insufficient) expect(facet.sum).toBe(mode === "low" ? 4 : 12);
      }
      if (mode === "threeRated") expect(result.facets[first].rated).toBe(3);
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("total");
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(<QuestionnaireCharacterStrengthsReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-character-strengths-result-reading]")).toHaveLength(24);
      expect(root.querySelectorAll("[data-character-mean]")).toHaveLength(24);
      expect(root.querySelectorAll("[data-character-sum]")).toHaveLength(Object.values(result.facets).filter(f => f.mean !== null).length);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content]) for (const p of section.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
