import { prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/introvert-extrovert.json";
import content from "@/lib/questionnaires/result-content/extraversion.json";
import { extraversionResultProfile } from "@/lib/questionnaires/result-content/extraversion";
import { QuestionnaireExtraversionReport } from "@/components/questionnaires/QuestionnaireExtraversionReport";
import { scoreExtraversionQuestionnaire } from "@/lib/questionnaires/extraversion";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
beforeAll(() => Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterAll(() => {
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});
afterEach(() => { cleanup(); sessionStorage.clear(); });
function answersFor(total: number) {
  let remaining = total - 10;
  return Object.fromEntries(quiz.questions.map(q => {
    const extra = Math.min(4, remaining); remaining -= extra;
    const keyed = 1 + extra;
    return [q.id, String(q.reverse ? 6 - keyed : keyed)];
  }));
}

describe("Extraversion reading examples, participation and sharing", () => {
  it("retains every source section and continuous-score identity without mutating the source", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = extraversionResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.sections).toHaveLength(12); expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.scoreReading).toEqual(profile.scoreReading);
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown = { ...quiz.profiles[0], id: "__proto__" }; expect(extraversionResultProfile(unknown)).toBe(unknown);
  });

  it.each(["zh", "en"] as const)("renders every public %s illustration without private score attributes", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector(`[data-extraversion-result-reading="${profile.id}"]`)).not.toBeNull();
      expect(root.querySelector("[data-extraversion-score], [data-extraversion-total], [data-extraversion-match]")).toBeNull();
      for (const section of extraversionResultProfile(profile).sections) for (const paragraph of section.paragraphs)
        expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(paragraph[locale]);
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("preserves valid totals, all three adjacent-boundary pairs and unscored states in %s", locale => {
    for (const [total, count] of [[15, 1], [20, 2], [25, 1], [30, 2], [35, 1], [40, 2], [45, 1]]) {
      const result = scoreExtraversionQuestionnaire(quiz, answersFor(total));
      expect(result.status).toBe("complete");
      if (result.status !== "complete") throw new Error("Complete keyed-score witness required");
      expect(result.total).toBe(total); expect(result.mean).toBe(total / 10);
      expect(result.scaleProfileIds).toHaveLength(count);
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(<QuestionnaireExtraversionReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelector("[data-extraversion-total]")?.textContent).toBe(String(total));
      expect(root.querySelector("[data-extraversion-mean]")?.textContent).toBe((total / 10).toFixed(1));
      expect(root.querySelectorAll("[data-extraversion-result-reading]")).toHaveLength(count);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
      for (const id of result.scaleProfileIds) for (const section of content[id as keyof typeof content])
        for (const paragraph of section.paragraphs) expect(root.querySelector(`#report-${id}-${section.id}`)?.textContent).toContain(paragraph[locale]);
    }
    const answers = answersFor(30); answers[quiz.questions[0].id] = "na";
    const missing = scoreExtraversionQuestionnaire(quiz, answers);
    expect(missing).toMatchObject({ status: "complete", rated: 9, total: null, mean: null, scaleProfileIds: [] });
    if (missing.status !== "complete") throw new Error("Complete missing-response witness required");
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<QuestionnaireExtraversionReport quiz={prepareQuestionnaireResultReadings(quiz)} result={missing} locale={locale} />);
    expect(root.querySelector("[data-extraversion-insufficient]")).not.toBeNull();
    expect(root.querySelectorAll("[data-extraversion-result-reading], [data-extraversion-total]")).toHaveLength(0);
    expect(root.querySelectorAll("a")).toHaveLength(4);
  });

  it.each(["zh", "en"] as const)("copies only a public entry when %s responses cannot produce a score", async locale => {
    const previousClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      for (const missing of [true, false]) {
        const { container, unmount } = render(<QuestionnaireClient quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />);
        fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test" }));
        for (let index = 0; index < 10; index++) {
          fireEvent.click(container.querySelector(`input[type="radio"][value="${missing && index === 0 ? "na" : "3"}"]`)!);
          fireEvent.click(screen.getByRole("button", { name: index === 9 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next") }));
        }
        if (missing) expect(container.querySelector("[data-extraversion-insufficient]")).not.toBeNull();
        else expect(container.querySelector("[data-extraversion-total]")?.textContent).toBe("30");
        const label = missing ? (locale === "zh" ? "复制公开入口" : "Copy public entry") : (locale === "zh" ? "复制结果与链接" : "Copy result and link");
        await act(async () => { fireEvent.click(screen.getByRole("button", { name: label })); });
        if (missing) {
          expect(writeText).toHaveBeenLastCalledWith(`${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/introvert-extrovert`);
          expect(container.textContent).toContain(locale === "zh" ? "已复制公开标题与入口链接，不含个人答案或次数。" : "Copied the public title and entry link, without personal answers or counts.");
        } else {
          const labels = quiz.profiles.filter(p => p.id === "ambivert-intro" || p.id === "ambivert-extro").map(p => p.title[locale]).join(locale === "zh" ? "、" : ", ");
          expect(writeText).toHaveBeenLastCalledWith(`${quiz.title[locale]}\n${labels}\nhttps://fermatmind.com/${locale}/tests/explore/introvert-extrovert`);
        }
        unmount();
      }
    } finally {
      if (previousClipboard) Object.defineProperty(navigator, "clipboard", previousClipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});
