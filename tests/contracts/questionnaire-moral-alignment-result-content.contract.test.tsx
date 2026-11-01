import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/moral-alignment.json";
import content from "@/lib/questionnaires/result-content/moral-alignment.json";
import { moralAlignmentResultProfile } from "@/lib/questionnaires/result-content/moral-alignment";
import { QuestionnaireAlignmentReport } from "@/components/questionnaires/QuestionnaireAlignmentReport";
import { scoreAlignmentQuestionnaire } from "@/lib/questionnaires/alignment";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
function answersFor(order: number, good: number) {
  let orderItems = 0, goodItems = 0;
  return Object.fromEntries(quiz.questions.map(q => {
    const isOrder = q.options.some(o => o.directionId === "lawful");
    const selected = isOrder ? (++orderItems <= order ? "lawful" : "chaotic") : (++goodItems <= good ? "good" : "evil");
    return [q.id, q.options.find(o => o.directionId === selected)!.id];
  }));
}

describe("Moral Alignment authored fictional scenes and boundary readings", () => {
  it("preserves original nine reports, attribution and identities with individually authored additions", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = moralAlignmentResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds); expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(12);
      expect(reading.sections.find(s => s.id === "scope")!.paragraphs[1]).toEqual(profile.sections.find(s => s.id === "scope")!.paragraphs[1]);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(moralAlignmentResultProfile(unknown)).toBe(unknown);
  });

  it.each(["zh", "en"] as const)("renders all nine public %s readings without a personal grid or counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-moral-alignment-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-alignment-count], [data-alignment-match]")).toBeNull();
      for (const section of moralAlignmentResultProfile(profile).sections) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("keeps one neutral or four adjacent %s readings with the original exact grid and unique anchors", locale => {
    for (const [order, good, count] of [[6, 6, 1], [4, 4, 4], [4, 8, 4], [8, 4, 4], [8, 8, 4]]) {
      const result = scoreAlignmentQuestionnaire(quiz, answersFor(order, good));
      expect(result.status).toBe("complete");
      if (result.status !== "complete") throw new Error("Complete synthetic axis witness required");
      expect(result.alignmentIds).toHaveLength(count);
      expect(result.counts).toEqual({ lawful: order, chaotic: 12 - order, good, evil: 12 - good });
      if (count === 1) expect(result.alignmentIds).toEqual(["true-neutral"]);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireAlignmentReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-alignment-cell]")).toHaveLength(9);
      expect(root.querySelectorAll("[data-alignment-count]")).toHaveLength(4);
      expect(root.querySelectorAll("[data-moral-alignment-result-reading]")).toHaveLength(count);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
      for (const id of result.alignmentIds) for (const section of content[id as keyof typeof content])
        for (const paragraph of section.paragraphs) expect(root.querySelector(`#report-${id}-${section.id}`)?.textContent).toContain(paragraph[locale]);
    }
  });
});
