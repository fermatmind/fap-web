import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/past-life.json";
import content from "@/lib/questionnaires/result-content/past-life.json";
import { pastLifeResultProfile } from "@/lib/questionnaires/result-content/past-life";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("past-life result reviews and conversations", () => {
  it("supplements the actual 24-question eight-theme edition without changing source identity", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(8);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = pastLifeResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds); expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(11);
      expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(pastLifeResultProfile(unknown)).toBe(unknown);
  });

  it.each(["zh", "en"] as const)("renders all eight public %s readings with original and new content, without private counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-past-life-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-archetype-count]")).toBeNull();
      for (const section of pastLifeResultProfile(profile).sections) for (const p of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("keeps all eight highest ties and uniquely addressed full readings in %s", locale => {
    const result = scoreArchetypeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, "A"])));
    expect(result.status).toBe("complete");
    if (result.status !== "complete") throw new Error("Complete all-tie witness required");
    expect(result.counts).toEqual(Object.fromEntries(quiz.directions.map(d => [d.id, 3])));
    expect(result.profileIds).toHaveLength(8);
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
    expect(root.querySelectorAll("[data-archetype-count]")).toHaveLength(8);
    expect(root.querySelectorAll("[data-past-life-result-reading]")).toHaveLength(8);
    const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
    for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
    for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content])
      for (const p of section.paragraphs) expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(p[locale]);
  });
});
