import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/ten-key-test.json";
import content from "@/lib/questionnaires/result-content/ten-key-test.json";
import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { tenKeyResultProfile } from "@/lib/questionnaires/result-content/ten-key-test";
import { isTenKeyConfigurationValid, scoreTenKeyRound } from "@/lib/questionnaires/tenKey";
import { TenKeyClient } from "@/components/questionnaires/TenKeyClient";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/components/entertainment/useEntertainmentMetrics", () => ({ useEntertainmentMetrics: () => ({ start: () => {}, complete: () => {}, view: () => {}, consent: null }), useEntertainmentResultView: () => {} }));
const quiz = source as Questionnaire;
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Three numeric-entry revision readings", () => {
  it("preserves the seven-section configuration, sources, original paragraphs and idempotent preparation", () => {
    const before = JSON.stringify(quiz), prepared = prepareQuestionnaireResultReadings(quiz);
    expect(Object.keys(content)).toEqual(quiz.profiles.map(p => p.id));
    expect(isTenKeyConfigurationValid(prepared)).toBe(true);
    expect(prepared.tenKey).toBe(quiz.tenKey); expect(prepared.questions).toBe(quiz.questions);
    expect(prepareQuestionnaireResultReadings(prepared)).toBe(prepared);
    for (const p of quiz.profiles) {
      const result = tenKeyResultProfile(p);
      expect(result.sections).toHaveLength(7);
      expect(result.sections.map(s => ({ ...s, paragraphs: s.paragraphs.slice(0, 1) }))).toEqual(p.sections);
      expect(new Set(result.sections.map(s => s.id)).size).toBe(7);
    }
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(tenKeyResultProfile(unknown)).toBe(unknown);
    expect(JSON.stringify(quiz)).toBe(before);
  });
  it("recomputes all three new worked minutes with the actual scoring function", () => {
    const cases = [
      { mode: 0, sources: ["2854", "389"], entered: ["2854", "398"], confirmedKph: 540, exactEntryKph: 300, matching: 5, compared: 7 },
      { mode: 1, sources: ["6.20", "14.08"], entered: ["6.2", "14.08"], confirmedKph: 600, exactEntryKph: 360, matching: 8, compared: 9 },
      { mode: 2, sources: ["001527", "004890"], entered: ["001572", "004890"], confirmedKph: 840, exactEntryKph: 420, matching: 10, compared: 12 },
    ];
    for (const c of cases) {
      const round = structuredClone(quiz.tenKey!.rounds[c.mode]); round.values.splice(0, 2, ...c.sources);
      const result = scoreTenKeyRound(round, c.entered.map((text, i) => ({ text, atMs: (i + 1) * 1000 })), 60_000);
      expect(result).toMatchObject({ status: "complete", confirmedEntries: 2, correctEntries: 1, confirmedKph: c.confirmedKph, exactEntryKph: c.exactEntryKph, entryErrorRate: 50, correctCharacters: c.matching, comparedCharacters: c.compared });
    }
  });
  it.each(["en", "zh"] as const)("renders all three public %s guides without round entries", async locale => {
    const page = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const p of quiz.profiles) {
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(await page.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }));
      expect(root.querySelector(`[data-ten-key-test-result-reading="${p.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-ten-key-result], [data-ten-key-review-row]")).toBeNull();
      for (const s of tenKeyResultProfile(p).sections) for (const text of s.paragraphs) expect(root.querySelector(`#report-${s.id}`)?.textContent).toContain(text[locale]);
    }
  });
  it.each(["en", "zh"] as const)("keeps complete %s readings after each timed mode and clears the result on retake", locale => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date", "performance"] });
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    for (const [mode, round] of quiz.tenKey!.rounds.entries()) {
      const view = render(<TenKeyClient quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />);
      fireEvent.click(view.container.querySelector(`input[value="${round.id}"]`)!);
      fireEvent.click(view.getByRole("button", { name: locale === "zh" ? "开始60秒练习" : "Start 60-second practice" }));
      expect(view.container.querySelector("[data-ten-key-test-result-reading]")).toBeNull();
      if (mode !== 0) {
        const input = view.container.querySelector("#ten-key-entry")!;
        for (const text of [round.values[0], "", "0"]) {
          fireEvent.change(input, { target: { value: text } });
          fireEvent.click(view.getByRole("button", { name: locale === "zh" ? "确认本条" : "Confirm entry" }));
        }
        fireEvent.change(input, { target: { value: "999" } });
      }
      act(() => { vi.advanceTimersByTime(60_000); });
      expect(view.container.querySelector("[data-ten-key-result]")).not.toBeNull();
      expect(view.container.querySelectorAll("[data-ten-key-review-row]")).toHaveLength(mode === 0 ? 0 : 3);
      expect(view.container.querySelectorAll("[data-ten-key-test-result-reading]")).toHaveLength(3);
      expect(view.container.querySelectorAll("h4")).toHaveLength(21);
      const ids = [...view.container.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      for (const a of view.container.querySelectorAll('nav a[href^="#ten-key-"]')) expect(ids).toContain(a.getAttribute("href")!.slice(1));
      for (const p of quiz.profiles) for (const s of content[p.id as keyof typeof content]) for (const text of s.paragraphs) expect(view.container.querySelector(`#ten-key-${p.id}-${s.id}`)?.textContent).toContain(text[locale]);
      fireEvent.click(view.getByRole("button", { name: locale === "zh" ? "清空并重新练习" : "Clear and practise again" }));
      expect(view.container.querySelector("[data-ten-key-result]")).toBeNull();
      expect(view.container.querySelector("[data-ten-key-test-result-reading]")).toBeNull();
      cleanup();
    }
  });
});
