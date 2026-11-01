import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/arabic-personality-compass.json";
import content from "@/lib/questionnaires/result-content/compass.json";
import { compassResultProfile } from "@/lib/questionnaires/result-content/compass";
import { QuestionnaireCompassReport } from "@/components/questionnaires/QuestionnaireCompassReport";
import { scoreCompassQuestionnaire } from "@/lib/questionnaires/compass";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const directions = ["north", "south", "east", "west"];
const witness = (counts: number[]) => {
  const choices = directions.flatMap((id, i) => Array<string>(counts[i]).fill(id));
  return Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options.find(o => o.directionId === choices[i])!.id]));
};
const reportCases = new Map<string, number[]>();
for (let n = 0; n <= 36; n++) for (let s = 0; s <= 36 - n; s++) for (let e = 0; e <= 36 - n - s; e++) {
  const counts = [n, s, e, 36 - n - s - e], highest = Math.max(...counts);
  const ids = directions.flatMap((id, i) => {
    if (counts[i] !== highest) return [];
    const [a, b] = i < 2 ? [2, 3] : [0, 1];
    return [counts[a] === counts[b] ? id : `${id}-${directions[counts[a] > counts[b] ? a : b]}`];
  }).sort();
  if (!reportCases.has(ids.join("|"))) reportCases.set(ids.join("|"), counts);
}

describe("Ordered compass arrangement reviews and conversations", () => {
  it("preserves36items, twelve ordered identities and source sections while adding distinct bilingual modules", () => {
    const before = JSON.stringify(quiz);
    expect(quiz.questions).toHaveLength(36); expect(quiz.profiles).toHaveLength(12);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const p of quiz.profiles) {
      const reading = compassResultProfile(p);
      expect(reading.sections.slice(0, 9)).toEqual(p.sections); expect(reading.sections).toHaveLength(11);
      expect(reading.directionIds).toEqual(p.directionIds); expect(new Set(reading.sections.map(s => s.id)).size).toBe(11);
    }
    for (const locale of ["en", "zh"] as const) for (const index of [0, 1])
      expect(new Set(Object.values(content).map(s => s[index].paragraphs[0][locale])).size).toBe(12);
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(compassResultProfile(unknown)).toBe(unknown);
  });
  it.each(["zh", "en"] as const)("renders all twelve public %s readings without attempt counts or leaders", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-compass-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-compass-count], [data-compass-leader]")).toBeNull();
      for (const s of compassResultProfile(profile).sections) for (const p of s.paragraphs)
        expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(p[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh", "en"] as const)("keeps complete %s bodies across all27highest-neighbour report sets", locale => {
    expect(reportCases.size).toBe(27);
    const covered = new Set<string>();
    for (const [key, counts] of reportCases) {
      const result = scoreCompassQuestionnaire(quiz, witness(counts));
      if (result.status !== "complete") throw new Error("Complete actual-item witness required");
      const wanted = key.split("|"); expect([...result.compassProfileIds].sort()).toEqual(wanted);
      expect(directions.map(id => result.counts[id])).toEqual(counts);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireCompassReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-compass-result-reading]")).toHaveLength(wanted.length);
      expect(root.querySelectorAll("h4")).toHaveLength(wanted.length * 11);
      expect([...root.querySelectorAll("[data-compass-match]")].map(e => e.getAttribute("data-compass-match")).sort()).toEqual(wanted);
      for (const [i, id] of directions.entries()) expect(root.querySelector(`[data-compass-count="${id}"] dd`)?.textContent).toBe(`${counts[i]} / 36`);
      const ids = [...root.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const id of wanted) {
        covered.add(id);
        for (const s of content[id as keyof typeof content]) for (const p of s.paragraphs)
          expect(root.querySelector(`#report-${id}-${s.id}`)?.textContent).toContain(p[locale]);
      }
    }
    expect([...covered].sort()).toEqual(quiz.profiles.map(p => p.id).sort());
  });
});
