import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import source from "../../lib/questionnaires/data/time-of-year-context-reflection.json";
import additions from "../../lib/questionnaires/result-content/time-of-year-context-reflection.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { prepareResultProfile } from "../../lib/questionnaires/result-content/readings";
import { isSeasonContext16ConfigurationValid, recordSeasonContext16 } from "../../lib/questionnaires/seasonContext16";
import { SeasonContextGuidePage, SeasonContextPage } from "../../components/questionnaires/SeasonContextPage";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const assets = additions as Record<string, { id: string; paragraphs: { en: string; zh: string }[] }[]>;
function dom(html: string) { const root = document.createElement("div"); root.innerHTML = html; return root; }
describe("Cycle-context result readings retain categorical records and public access", () => {
  it("preserves strict source identity and every original paragraph while enriching only guides", () => {
    const before = JSON.stringify(quiz);
    expect(isSeasonContext16ConfigurationValid(quiz)).toBe(true);
    for (const p of quiz.profiles) {
      const prepared = prepareResultProfile(quiz.slug, p);
      expect(prepared.directionIds).toEqual(p.directionIds);
      expect(prepared.sections.map(s => s.id)).toEqual(p.sections.map(s => s.id));
      expect(prepared.sections.flatMap(s => s.paragraphs)).toHaveLength(17);
      for (const [i, s] of p.sections.entries()) expect(prepared.sections[i].paragraphs.slice(0, 2)).toEqual(s.paragraphs);
      expect(prepareResultProfile(quiz.slug, prepared)).toBe(prepared);
    }
    expect(prepareResultProfile(quiz.slug, { ...quiz.profiles[0], id: "unknown" }).resultReading).toBeUndefined();
    expect(JSON.stringify(quiz)).toBe(before);
    expect(isSeasonContext16ConfigurationValid(quiz)).toBe(true);
  });
  it("renders all original and added text on all eight standalone public guides with safe navigation", () => {
    for (const locale of ["zh", "en"] as const) for (const p of quiz.profiles) {
      const root = dom(renderToStaticMarkup(<SeasonContextGuidePage quiz={quiz} profile={p} locale={locale} />));
      const reading = root.querySelector(`[data-season-context-result-reading="${p.id}"]`)!;
      expect(reading).not.toBeNull(); expect(reading.querySelectorAll("h2")).toHaveLength(7);
      expect(reading.querySelector("details")?.hasAttribute("open")).toBe(false);
      for (const s of [...p.sections, ...assets[p.id]]) for (const t of s.paragraphs) expect(reading.textContent).toContain(t[locale]);
      for (const a of reading.querySelectorAll<HTMLAnchorElement>("nav a")) expect(root.querySelector(a.hash)).not.toBeNull();
      expect(root.querySelector("[data-season-context-result]")).toBeNull();
      expect(root.querySelector("[data-season-context-support]")).not.toBeNull();
    }
  });
  it("keeps all four guides and anchors available in the live page before any response", () => {
    for (const locale of ["zh", "en"] as const) {
      const root = dom(renderToStaticMarkup(<SeasonContextPage quiz={quiz} locale={locale} />));
      expect(root.querySelectorAll("[data-season-context-result-reading]")).toHaveLength(4);
      expect(root.querySelectorAll("[data-season-context-full-guide] h3")).toHaveLength(28);
      for (const p of quiz.profiles) {
        expect(root.querySelector(`#season-context-public-${p.directionIds[0]}`)).not.toBeNull();
        for (const s of assets[p.id]) for (const t of s.paragraphs) expect(root.textContent).toContain(t[locale]);
      }
      expect(root.querySelector("[data-season-context-result]")).toBeNull();
    }
  });
  it("keeps six labels, four-item denominators and individual observations without numeric outcomes", () => {
    for (let shift = 0; shift < 6; shift++) {
      const categories = ["0", "1", "2", "3", "4", "na"];
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, categories[(i + shift) % 6]]));
      const result = recordSeasonContext16(quiz, answers);
      expect(result.status).toBe("complete");
      if (result.status !== "complete") throw Error("Expected complete");
      for (const [i, r] of result.records.entries()) {
        expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
        expect(Object.values(r.counts).reduce((a, b) => a + b, 0)).toBe([4, 4, 4, 4][i]);
        for (const o of r.observations) expect(o.category).toBe(answers[o.questionId]);
      }
    }
  });
});
