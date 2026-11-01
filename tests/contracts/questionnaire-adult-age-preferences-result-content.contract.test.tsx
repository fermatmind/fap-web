import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/adult-age-preferences.json";
import reference from "@/tests/fixtures/questionnaires/age-preference-reference.json";
import content from "@/lib/questionnaires/result-content/adult-age-preferences.json";
import { adultAgePreferencesResultProfile } from "@/lib/questionnaires/result-content/adult-age-preferences";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Seven bilingual Adult Age Context result readings", () => {
  it("retains every original paragraph, identity and section while adding distinct scenes", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const prepared = adultAgePreferencesResultProfile(profile);
      expect(prepared.sections.map(s => s.id)).toEqual(profile.sections.map(s => s.id));
      expect(prepared.title).toEqual(profile.title);
      expect(prepared.directionIds).toEqual(profile.directionIds);
      expect(prepared.scoreReading).toEqual(profile.scoreReading);
      for (const section of profile.sections) expect(prepared.sections.find(s => s.id === section.id)!.paragraphs.slice(0, section.paragraphs.length)).toEqual(section.paragraphs);
      expect(prepared.sections.flatMap(s => s.paragraphs)).toHaveLength(profile.sections.flatMap(s => s.paragraphs).length + 3);
    }
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(Object.values(content).map(s => s[0].paragraphs[0][locale])).size).toBe(7);
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(7);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(adultAgePreferencesResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders all seven public %s guides without personal counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-adult-age-preferences-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.textContent).not.toContain("Raw choice counts for this attempt");
      for (const section of content[profile.id as keyof typeof content]) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("preserves all 127 count vectors and renders every single or tied %s reading", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz), seen = new Set<string>();
    for (const witness of reference.source_count_vectors) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, witness.option_codes[i]]));
      const result = scoreDirectionalQuestionnaire(quiz, answers);
      expect(scoreDirectionalQuestionnaire(prepared, answers)).toEqual(result);
      if (result.status !== "complete") throw Error("Complete source witness required");
      expect(quiz.directions.map(d => result.counts[d.id])).toEqual(witness.counts);
      if (seen.has(result.profileId)) continue;
      seen.add(result.profileId);
      const profile = prepared.profiles.find(p => p.id === result.profileId)!;
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} />);
      expect(root.querySelectorAll("h3")).toHaveLength(7);
      for (const section of content[profile.id as keyof typeof content]) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph[locale]);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      expect(prepareResultProfile(quiz.slug, profile)).toBe(profile);
    }
    expect([...seen].sort()).toEqual(quiz.profiles.map(p => p.id).sort());
  });
});
