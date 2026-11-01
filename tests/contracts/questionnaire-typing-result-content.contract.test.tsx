import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/typing-speed.json";
import content from "@/lib/questionnaires/result-content/typing-speed.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isTypingConfigurationValid, scoreTypingRound } from "@/lib/questionnaires/typing";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("Two bilingual typing result readings", () => {
  it("keeps source passages and scoring fields while preparing both valid, complete readings", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(prepared.typing).toBe(quiz.typing);
    expect(prepared.questions).toBe(quiz.questions);
    expect(isTypingConfigurationValid(prepared)).toBe(true);
    for (const [i, p] of prepared.profiles.entries()) {
      expect(p.sections.slice(0, 7)).toEqual(quiz.profiles[i].sections);
      expect(p.sections).toHaveLength(9);
    }
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    expect(JSON.stringify(quiz)).toBe(before);
  });
  it("checks the fresh positional examples and keeps Chinese output separate from English WPM", () => {
    const en = { ...quiz.typing!.rounds[0], passage: "red fox" };
    expect(scoreTypingRound(en, "redfox", 60000)).toMatchObject({ typedCharacters: 6, correctCharacters: 3, incorrectCharacters: 3, accuracy: 50, grossWpm: 1.2, correctWpm: .6 });
    expect(scoreTypingRound(en, "red fox", 60000)).toMatchObject({ accuracy: 100, grossWpm: 1.4, correctWpm: 1.4 });
    const zh = { ...quiz.typing!.rounds[1], passage: "春风，慢行。" };
    expect(scoreTypingRound(zh, "春风,慢行。", 60000)).toMatchObject({ targetCharacters: 6, typedCharacters: 6, correctCharacters: 5, grossWpm: null });
    expect(scoreTypingRound(zh, "春风慢行。", 60000)).toMatchObject({ typedCharacters: 5, correctCharacters: 2, accuracy: 40, correctWpm: null });
    expect(scoreTypingRound(zh, "", 60000)).toMatchObject({ accuracy: null, cpm: 0 });
  });
  it.each(["zh", "en"] as const)("renders the whole public %s reading without input or scores", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(dom.querySelector(`[data-typing-result-reading="${p.id}"]`)).not.toBeNull();
      expect(dom.querySelector("[data-typing-result], #typing-input, [data-typing-cpm]")).toBeNull();
      for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs)
        expect(dom.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(el => el.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of dom.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
    }
  });
});
