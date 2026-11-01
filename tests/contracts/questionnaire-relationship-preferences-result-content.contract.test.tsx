import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/relationship-preferences.json";
import reference from "../fixtures/questionnaires/relationship-preferences-reference.json";
import content from "@/lib/questionnaires/result-content/relationship-preferences.json";
import { relationshipPreferencesResultProfile } from "@/lib/questionnaires/result-content/relationship-preferences";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnairePairedDimensionsReport } from "@/components/questionnaires/QuestionnairePairedDimensionsReport";
import { scorePairedDimensionsQuestionnaire } from "@/lib/questionnaires/pairedDimensions";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
describe("Six separate relationship-preference readings", () => {
  it("preserves every source module and identity while adding distinct scenes and discussion prompts", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.questions).toBe(quiz.questions);
    expect(prepared.pairedDimensions).toBe(quiz.pairedDimensions);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = relationshipPreferencesResultProfile(profile);
      expect(reading.sections.map(s => s.id)).toEqual(profile.sections.map(s => s.id));
      expect(reading.title).toEqual(profile.title);
      expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections.flatMap(s => s.paragraphs).length).toBe(profile.sections.flatMap(s => s.paragraphs).length + 3);
      for (const section of profile.sections) expect(reading.sections.find(s => s.id === section.id)!.paragraphs.slice(0, section.paragraphs.length)).toEqual(section.paragraphs);
    }
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(Object.values(content).map(s => s[0].paragraphs[0][locale])).size).toBe(6);
      expect(new Set(Object.values(content).map(s => s[1].paragraphs[0][locale])).size).toBe(6);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(relationshipPreferencesResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("preserves all169 counts and renders all9 separate %s patterns without combining types", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz), seen = new Set<string>();
    for (const row of reference.source_count_vectors) {
      const answers = Object.fromEntries(quiz.questions.map((q,i) => [q.id,row.option_codes[i]]));
      const result = scorePairedDimensionsQuestionnaire(prepared, answers);
      expect(result).toEqual(scorePairedDimensionsQuestionnaire(quiz, answers));
      if (result.status !== "complete") throw Error("Complete paired record required");
      const key = result.pairedProfileIds.join("|"); if (seen.has(key)) continue; seen.add(key);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnairePairedDimensionsReport quiz={prepared} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-relationship-preferences-result-reading]")).toHaveLength(2);
      expect(root.querySelectorAll("h4")).toHaveLength(16);
      for (const axis of result.pairedDimensions) {
        const node = root.querySelector(`[data-paired-dimension="${axis.id}"]`)!;
        for (const [pole,count] of Object.entries(axis.counts)) expect(node.querySelector(`[data-paired-pole="${pole}"] dd`)?.textContent).toBe(`${count} / 12`);
        for (const section of content[axis.profileId as keyof typeof content]) for (const p of section.paragraphs)
          expect(node.querySelector(`#paired-report-${axis.id}-${section.id}`)?.textContent).toContain(p[locale]);
      }
      const ids = [...root.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll("nav a")) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
    expect(seen.size).toBe(9);
  });
  it.each(["zh", "en"] as const)("renders all six complete public %s guides without personal raw counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-relationship-preferences-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-paired-dimension], [data-paired-pole]")).toBeNull();
      for (const section of content[profile.id as keyof typeof content]) for (const p of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
    }
  });
});
