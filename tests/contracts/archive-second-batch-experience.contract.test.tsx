import { fireEvent, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { ArchiveGuideShare } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { archive90Topic, archiveTopic } from "@/lib/entertainment/archive90";
import { archiveSecondBatch } from "@/lib/entertainment/archiveSecondBatch";
import { getArchiveExperience } from "@/lib/entertainment/archiveExperience";
import { quizPath, resultPath } from "@/lib/entertainment/guides";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { loadTraditionalBespokeStory } from "@/lib/i18n/zh-TW/bespokeStories";
import { loadTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStories";
import { hasTraditionalBespokeStory } from "@/lib/i18n/traditionalLegacyStoryPaths";
import questionnaires from "@/lib/questionnaires/catalog.json";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isArchivedEntertainmentPath } from "@/lib/seo/discoverabilityExposurePolicy";

const locales = ["en", "zh", "zh-TW"] as const;

function choices(quiz: FunQuiz, variation: number) {
  const answers: Answers = {};
  let result = resolveFunQuiz(quiz, answers);
  while (!result.complete) {
    const question = quiz.questions.find(q => q.id === result.path.at(-1))!;
    answers[question.id] = question.options[variation % question.options.length].id;
    result = resolveFunQuiz(quiz, answers);
  }
  return { answers, result };
}

describe("second archive experience cohort", () => {
  it("uses existing archived routes and preserves scores and guide identities in all three locales", async () => {
    const ids = Object.keys(archiveSecondBatch);
    expect(ids).toHaveLength(100);
    let nativeCount = 0, tallyCount = 0, branchCount = 0;
    for (const slug of ids) {
      expect(archive90Topic(slug)).toBeUndefined();
      expect(getArchiveExperience(slug)).toBeUndefined();
      const native = questionnaires.find(row => row.slug === slug);
      const story = !native ? await loadFunQuiz(slug) : null;
      if (native) nativeCount++;
      else {
        expect(story).not.toBeNull();
        if (story!.mechanism === "tally") tallyCount++;
        else branchCount++;
        const taiwan = hasTraditionalBespokeStory(slug)
          ? await loadTraditionalBespokeStory(slug)
          : (await loadTraditionalLegacyStory(slug))?.quiz;
        expect(taiwan).toBeDefined();
        for (const variation of [0, 1, 2]) {
          const { answers, result } = choices(story!, variation);
          expect(resolveFunQuiz(taiwan!, answers)).toEqual(result);
        }
      }
      const profiles = native?.resultSlugs ?? story!.results.map(p => p.id);
      for (const locale of locales) {
        const landing = native ? questionnairePath(locale, slug) : quizPath(locale, slug);
        expect(isArchivedEntertainmentPath(landing)).toBe(true);
        expect(archiveTopic(slug)?.label[locale]).toBeTruthy();
        for (const id of profiles) {
          const path = native ? questionnaireGuidePath(locale, slug, id) : resultPath(locale, slug, id);
          expect(isArchivedEntertainmentPath(path)).toBe(true);
          const guide = renderToStaticMarkup(<ArchiveGuideShare slug={slug} id={path.split("/").at(-1)!} locale={locale} story={!!story} />);
          expect(guide.match(/data-public-guide-share/g)).toHaveLength(1);
        }
      }
    }
    expect([nativeCount, tallyCount, branchCount]).toEqual([44, 45, 11]);
  });

  it.each(["story-ending", "board-game-table"])("keeps the result, share payload and one optional assessment for %s", async slug => {
    const quiz = (await loadFunQuiz(slug))!;
    const { answers, result } = choices(quiz, 0);
    const copy = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: copy } });
    const { container, getByRole } = render(<FunQuizClient quiz={quiz} locale="en" />);
    const start = getByRole("button", { name: "Start quiz" });
    await waitFor(() => expect(start).toBeEnabled());
    expect(container.querySelector("[data-archive-next-step]")).toBeNull();
    fireEvent.click(start);
    for (const qid of result.path) {
      expect(container.querySelector("[data-archive-next-step]")).toBeNull();
      fireEvent.click(container.querySelector<HTMLInputElement>(`input[type="radio"][name="${qid}"][value="${answers[qid]}"]`)!);
      fireEvent.click(container.querySelector("[data-questionnaire-next]")!);
    }
    const report = container.querySelector("[data-story-result-readings]")!;
    const next = container.querySelector("[data-archive-next-step]")!;
    expect(report.querySelectorAll("article")).toHaveLength(result.resultIds.length);
    expect(report.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(next.querySelectorAll("a")).toHaveLength(1);
    expect(next.querySelector("a")).toHaveAttribute("href", `/en/tests/${archiveTopic(quiz.slug)?.slug}`);
    expect(getByRole("button", { name: "Copy result and link" })).toBeVisible();
    fireEvent.click(getByRole("button", { name: "Copy result and link" }));
    await waitFor(() => expect(copy).toHaveBeenCalledTimes(1));
    for (const id of result.resultIds) expect(copy.mock.calls).toEqual([[expect.stringContaining(`https://fermatmind.com${resultPath("en", slug, id)}`)]]);
    fireEvent.click(getByRole("button", { name: "Retake quiz" }));
    expect(container.querySelector("[data-archive-next-step]")).toBeNull();
  });
});
