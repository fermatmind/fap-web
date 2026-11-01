import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/color-season.json";
import content from "@/lib/questionnaires/result-content/color-season.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isArchetypeConfigurationValid, scoreArchetypeQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireArchetypeReport } from "@/components/questionnaires/QuestionnaireArchetypeReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
describe("Four original bilingual palette readings", () => {
  it("preserves every source paragraph, all twenty-four swatches and the exact choice model", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(isArchetypeConfigurationValid(prepared)).toBe(true);
    expect(prepared.questions).toBe(quiz.questions);
    expect(prepared.directions).toBe(quiz.directions);
    for (const [i, p] of prepared.profiles.entries()) {
      expect(p.paletteSwatches).toBe(quiz.profiles[i].paletteSwatches);
      expect(p.sections).toHaveLength(9);
      for (const [j, s] of p.sections.entries()) expect(s.paragraphs.slice(0, quiz.profiles[i].sections[j].paragraphs.length)).toEqual(quiz.profiles[i].sections[j].paragraphs);
    }
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
  });
  it("recalculates the stated opaque sRGB contrast examples without rounding a failing pair into a pass", () => {
    const luminance = (hex: string) => {
      const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      return channels.reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    };
    const contrast = (a: string, b: string) => { const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y); return (high + .05) / (low + .05); };
    expect(contrast("#657B96", "#E4DFE8")).toBeCloseTo(3.318697487, 6);
    expect(contrast("#21334E", "#E4DFE8")).toBeCloseTo(9.719099236, 6);
    expect(contrast("#755749", "#DECEAB")).toBeCloseTo(4.204929777, 6);
    expect(contrast("#755749", "#DECEAB")).toBeLessThan(4.5);
    expect(contrast("#21334E", "#F2F2EE")).toBeCloseTo(11.35226911, 6);
  });
  it.each(["zh", "en"] as const)("opens all full public %s readings with unchanged swatches and no personal counts", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(dom.querySelector(`[data-color-season-result-reading="${p.id}"]`)).not.toBeNull();
      expect(dom.querySelector("[data-archetype-count], [data-archetype-match]")).toBeNull();
      expect([...dom.querySelectorAll("[data-palette-colour]")].map(el => el.getAttribute("data-palette-colour"))).toEqual(p.paletteSwatches!.map(s => s.hex));
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["zh", "en"] as const)("keeps all fifteen feasible highest sets complete in %s", locale => {
    const prepared = prepareQuestionnaireResultReadings(quiz);
    for (let mask = 1; mask < 16; mask++) {
      const selected = quiz.directions.filter((_, i) => mask & (1 << i)), k = selected.length;
      const counts = Object.fromEntries(quiz.directions.map(d => [d.id, selected.includes(d) ? Math.floor(16 / k) : k === 3 ? 1 : 0]));
      const targets = quiz.directions.flatMap(d => Array<string>(counts[d.id]).fill(d.id));
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options.find(o => o.directionId === targets[i])!.id]));
      const result = scoreArchetypeQuestionnaire(quiz, answers);
      expect(scoreArchetypeQuestionnaire(prepared, answers)).toEqual(result);
      if (result.status !== "complete") throw Error("Complete palette witness required");
      expect(result.profileIds).toEqual(selected.map(d => d.id));
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireArchetypeReport quiz={prepared} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-color-season-result-reading]")).toHaveLength(k);
      expect(dom.querySelectorAll("h4")).toHaveLength(k * 9);
      expect(dom.querySelectorAll("[data-palette-colour]")).toHaveLength(k * 6);
      for (const id of result.profileIds) for (const s of content[id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${id}-${s.id}`)?.textContent).toContain(text[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of dom.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
