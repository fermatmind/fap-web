import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/love-languages.json";
import content from "@/lib/questionnaires/result-content/love-languages.json";
import { loveLanguagesResultProfile } from "@/lib/questionnaires/result-content/love-languages";
import { getResultReading, prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireReport } from "@/components/questionnaires/QuestionnaireReport";
import { QuestionnaireAffectionReport } from "@/components/questionnaires/QuestionnaireAffectionReport";
import { scoreAffectionQuestionnaire } from "@/lib/questionnaires/affection";
import type { Questionnaire } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
beforeAll(() => Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() }));
afterAll(() => {
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});
afterEach(cleanup);

describe("Love language separate-role result readings", () => {
  it("preserves every source section, paired identity and scoring description", () => {
    const before = JSON.stringify(quiz);
    expect(Object.keys(content).sort()).toEqual(quiz.profiles.map(p => p.id).sort());
    for (const profile of quiz.profiles) {
      const reading = loveLanguagesResultProfile(profile);
      expect(reading.sections.slice(0, 9)).toEqual(profile.sections);
      expect(reading.directionIds).toEqual(profile.directionIds);
      expect(reading.scoreReading).toEqual(profile.scoreReading);
      expect(reading.sections).toHaveLength(12);
      expect(new Set(reading.sections.map(s => s.id)).size).toBe(12);
    }
    expect(JSON.stringify(quiz)).toBe(before);
  });

  it("leaves unknown products and profile identities on the original report path", () => {
    const profile = quiz.profiles[0];
    for (const slug of ["unknown-product", "__proto__", "constructor"]) {
      expect(getResultReading(slug, profile)).toBeNull();
      expect(renderToStaticMarkup(<QuestionnaireResultReading quizSlug={slug} profile={profile} locale="en" />)).toBe(renderToStaticMarkup(<QuestionnaireReport profile={profile} locale="en" />));
    }
    for (const slug of ["disc", "response-color", quiz.slug]) for (const id of ["unknown-profile", "__proto__", "constructor"]) {
      const unknown = { ...profile, id };
      expect(loveLanguagesResultProfile(unknown)).toBe(unknown);
      expect(getResultReading(slug, unknown)).toBeNull();
    }
  });

  it.each(["zh", "en"] as const)("renders five public %s guides without means or attempt data", async locale => {
    const guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    for (const profile of quiz.profiles) {
      const root = document.createElement("div");
      root.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }));
      expect(root.querySelector("[data-love-languages-result-reading]")).not.toBeNull();
      expect(root.querySelector("[data-affection-mean], [data-affection-facet]")).toBeNull();
      for (const section of content[profile.id as keyof typeof content]) {
        for (const p of section.paragraphs) expect(root.querySelector(`#report-${section.id}`)?.textContent).toContain(p[locale]);
      }
      if (locale === "en") expect(root.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it.each(["zh", "en"] as const)("keeps asymmetric, low, equal and insufficient %s ratings separate with all five readings", locale => {
    for (const mode of ["asymmetric", "low", "equal", "insufficient"] as const) {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, mode === "insufficient" ? "na" : mode === "low" ? "1" : mode === "equal" ? "5" : q.options[0].directionId!.startsWith("giving_") ? "5" : "1"]));
      const result = scoreAffectionQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Complete source-based attempt required");
      for (const [id, facet] of Object.entries(result.affectionFacets)) expect(facet.mean).toBe(mode === "insufficient" ? null : mode === "low" ? 1 : mode === "equal" || id.startsWith("giving_") ? 5 : 1);
      expect(result).not.toHaveProperty("leaders"); expect(result).not.toHaveProperty("total");
      const root = document.createElement("div"); root.innerHTML = renderToStaticMarkup(<QuestionnaireAffectionReport quiz={prepareQuestionnaireResultReadings(quiz)} result={result} locale={locale} />);
      expect(root.querySelectorAll("[data-love-languages-result-reading]")).toHaveLength(5);
      expect(root.querySelectorAll("[data-affection-mean]")).toHaveLength(10);
      expect(root.querySelectorAll("[data-affection-insufficient]")).toHaveLength(mode === "insufficient" ? 1 : 0);
      const ids = [...root.querySelectorAll("[id]")].map(el => el.id); expect(new Set(ids).size).toBe(ids.length);
      for (const link of root.querySelectorAll('nav a[href^="#report-"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
      for (const profile of quiz.profiles) for (const section of content[profile.id as keyof typeof content]) for (const p of section.paragraphs) expect(root.querySelector(`#report-${profile.id}-${section.id}`)?.textContent).toContain(p[locale]);
    }
  });

  it.each(["zh", "en"] as const)("copies the public entry only for both rated and unscored %s attempts", async locale => {
    const previousClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      for (const value of ["3", "na"]) {
        const { container, unmount } = render(<QuestionnaireClient quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />);
        await waitFor(() => expect(screen.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test" })).toBeEnabled());
        fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "开始测试" : "Start test" }));
        for (let index = 0; index < quiz.questions.length; index++) {
          fireEvent.click(container.querySelector(`input[type="radio"][value="${value}"]`)!);
          fireEvent.click(screen.getByRole("button", { name: index === quiz.questions.length - 1 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next") }));
        }
        await waitFor(() => expect(container.querySelectorAll("[data-affection-profile]")).toHaveLength(5));
        expect(container.querySelectorAll("[data-affection-profile]")).toHaveLength(5);
        await act(async () => { fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "复制公开入口" : "Copy public entry" })); });
        expect(writeText).toHaveBeenLastCalledWith(`${quiz.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${quiz.slug}`);
        expect(container.textContent).toContain(locale === "zh" ? "已复制公开标题与入口链接，不含个人答案或次数。" : "Copied the public title and entry link, without personal answers or counts.");
        unmount();
      }
    } finally {
      if (previousClipboard) Object.defineProperty(navigator, "clipboard", previousClipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});
