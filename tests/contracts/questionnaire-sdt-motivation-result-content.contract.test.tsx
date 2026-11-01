import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/sdt-motivation.json";
import content from "@/lib/questionnaires/result-content/sdt-motivation.json";
import { sdtMotivationResultProfile } from "@/lib/questionnaires/result-content/sdt-motivation";
import { QuestionnaireSdtNeedsReport } from "@/components/questionnaires/QuestionnaireSdtNeedsReport";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Six separate SDT experience reviews and conversations", () => {
  it("preserves24items, six identities and source sections while adding distinct bilingual readings", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(6);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = sdtMotivationResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds); expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(11); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(sections => sections[index].paragraphs[0][locale])).size).toBe(6);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(sdtMotivationResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders every public %s reading without personal means", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-sdt-motivation-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-sdt-needs-facet], [data-sdt-needs-mean]")).toBeNull();
      for (const section of sdtMotivationResultProfile(profile).sections) for (const p of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("keeps all six full %s bodies across ratings, independent parts and the three-rating boundary", locale => {
    const first = quiz.directions[0].id;
    for (const mode of ["low", "high", "equal", "insufficient", "mixed", "twoRated", "threeRated", "oneNA", "straight"] as const) {
      let firstRatings = 0;
      const answers = Object.fromEntries(quiz.questions.map((q, index) => {
        const selected = q.options[0].directionId === first;
        const bounded = mode === "twoRated" || mode === "threeRated";
        const valid = mode !== "insufficient" && !(mode === "mixed" && !selected)
          && !(mode === "oneNA" && index === 0) && !(bounded && (!selected || ++firstRatings > (mode === "twoRated" ? 2 : 3)));
        const value = mode === "low" ? 1 : mode === "high" ? 5 : 3;
        return [q.id, valid ? mode === "straight" ? "5" : String(q.reverse ? 6 - value : value) : "na"];
      }));
      const result = scoreLikertQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete actual-item attempt required");
      for (const [id, facet] of Object.entries(result.facets)) {
        const missing = mode === "insufficient" || mode === "twoRated" || ((mode === "mixed" || mode === "threeRated") && id !== first);
        expect(facet.mean).toBe(missing ? null : mode === "low" ? 1 : mode === "high" ? 5 : mode === "straight" ? 5 : 3);
      }
      if (mode === "twoRated" || mode === "threeRated") expect(result.facets[first].rated).toBe(mode === "twoRated" ? 2 : 3);
      if (mode === "oneNA") expect(result.facets[first]).toEqual({ sum: 9, rated: 3, total: 4, mean: 3 });
      expect(result).not.toHaveProperty("profileId"); expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total");
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireSdtNeedsReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-sdt-motivation-result-reading]")).toHaveLength(6);
      expect(root.querySelectorAll("[data-sdt-needs-mean]")).toHaveLength(6);
      for (const [id, facet] of Object.entries(result.facets)) {
        const text = root.querySelector(`[data-sdt-needs-facet="${id}"] [data-sdt-needs-mean]`)?.textContent;
        expect(text).toBe(facet.mean === null ? locale === "zh" ? "资料不足" : "Insufficient information" : `${facet.mean.toFixed(1)} / 5`);
      }
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content]) for (const p of section.paragraphs)
        expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
