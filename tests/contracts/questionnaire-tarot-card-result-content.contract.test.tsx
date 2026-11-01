import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/which-tarot-card-are-you.json";
import content from "@/lib/questionnaires/result-content/tarot-card.json";
import { tarotCardResultProfile } from "@/lib/questionnaires/result-content/tarot-card";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Tarot symbolic result reviews and conversations", () => {
  it("supplements the actual twenty-two-question symbolic edition without changing source identity", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(22); expect(quiz.profiles).toHaveLength(22);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = tarotCardResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds); expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(11);
      expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(tarotCardResultProfile(unknown)).toBe(unknown);
  });

  it.each(["zh", "en"] as const)("renders all twenty-two public %s readings with original and new content, without private counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-tarot-card-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-archetype-count]")).toBeNull();
      for (const section of tarotCardResultProfile(profile).sections) for (const p of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("keeps all twenty-two highest ties and uniquely addressed full readings in %s", locale => {
    const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, "A"])));
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Complete all-tie witness required");
    expect(result.counts).toEqual(Object.fromEntries(quiz.directions.map(d => [d.id, 1])));
    expect(result.profileIds).toHaveLength(22);
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
    expect(root.querySelectorAll("[data-archetype-count]")).toHaveLength(22);
    expect(root.querySelectorAll("[data-tarot-card-result-reading]")).toHaveLength(22);
    const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
    for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
    for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content])
      for (const p of section.paragraphs) expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(p[locale]);
  });
});
