import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Landing, { generateMetadata as landingMetadata } from "@/app/(traditional)/zh-TW/tests/play/[slug]/page";
import Portrait, { generateMetadata as portraitMetadata } from "@/app/(traditional)/zh-TW/tests/play/[slug]/results/[portrait]/page";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { resultPath, resultSlug } from "@/lib/entertainment/guides";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import type { Answers } from "@/lib/entertainment/types";
import { traditionalLegacyStorySlugs, traditionalBespokeStorySlugs } from "@/lib/i18n/traditionalLegacyStoryPaths";
import { traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import generated from "@/lib/i18n/zh-TW/legacy-stories.generated.json";
import { loadTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStories";
import { loadTraditionalBespokeStory } from "@/lib/i18n/zh-TW/bespokeStories";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/entertainment/activity", () => ({ recordEntertainmentActivity: vi.fn() }));
afterEach(() => { cleanup(); sessionStorage.clear(); });

function scoreExample(quiz: NonNullable<Awaited<ReturnType<typeof loadFunQuiz>>>) {
  const answers: Answers = {};
  let state = resolveFunQuiz(quiz, answers);
  for (let count = 0; !state.complete && count < quiz.questions.length; count++) {
    const next = quiz.questions.find((question) => question.id === state.path.find((id) => !answers[id]))!;
    answers[next.id] = next.options[0].id;
    state = resolveFunQuiz(quiz, answers);
  }
  expect(state.complete).toBe(true);
  return { answers, state };
}

it("binds all 60 readers to current source and keeps all 181 result identities and scores", async () => {
  for (const [source, digest] of Object.entries(generated.sourceHashes)) {
    expect(createHash("sha256").update(readFileSync(source)).digest("hex"), source).toBe(digest);
  }
  expect(traditionalLegacyStorySlugs).toHaveLength(60);
  let portraits = 0;
  for (const slug of traditionalLegacyStorySlugs) {
    const original = (await loadFunQuiz(slug))!;
    const { quiz } = (await loadTraditionalLegacyStory(slug))!;
    const { answers, state } = scoreExample(original);
    expect(quiz.title.en).toBe(original.title.en);
    expect(resolveFunQuiz(quiz, answers)).toEqual(state);
    expect(quiz.results.map((result) => result.id)).toEqual(original.results.map((result) => result.id));
    for (const result of quiz.results) {
      expect(traditionalPath(resultPath("zh", slug, result.id))).toBe(resultPath("zh-TW", slug, result.id));
      expect(traditionalEquivalent(resultPath("zh", slug, result.id))).toBeNull();
      portraits++;
    }
  }
  expect(portraits).toBe(181);
  expect(traditionalPath("/zh/tests/play/changan-history-quiz")).toBe("/zh-TW/tests/play/changan-history-quiz");
  expect(traditionalPath("/zh/tests/play/changan-history-quiz/results/not-real")).toBeNull();
  expect(traditionalPath("/zh/tests/play/woodland-animal/results/not-real")).toBeNull();
});

it.each(["woodland-animal", "house-of-doors"])("renders and completes the Taiwan story %s in the existing client", async (slug) => {
  const { quiz, editorial } = (await loadTraditionalLegacyStory(slug))!;
  const original = (await loadFunQuiz(slug))!;
  const { state } = scoreExample(original);
  const result = quiz.results.find((portrait) => portrait.id === state.resultIds[0])!;
  const params = Promise.resolve({ slug });
  const portrait = Promise.resolve({ slug, portrait: resultSlug(result.id) });
  expect(await landingMetadata({ params })).toMatchObject({ robots: { index: false } });
  expect(await portraitMetadata({ params: portrait })).toMatchObject({ robots: { index: false } });
  render(await Landing({ params }));
  expect(screen.getByRole("heading", { name: quiz.title.zh })).toBeVisible();
  expect(screen.getByText(editorial.sections[0].paragraphs[0].zh)).toBeVisible();
  const startForm = screen.getByRole("button", { name: "開始測驗" }).closest("form");
  expect(startForm).toHaveAttribute("action", `/zh-TW/tests/play/${slug}/take`);
  expect(startForm?.querySelector('input[name="start"]')).toHaveValue("1");
  cleanup();
  render(await Portrait({ params: portrait }));
  expect(screen.getByRole("heading", { name: result.title.zh })).toBeVisible();
  expect(screen.getByText(result.experiment.zh)).toBeVisible();
  cleanup();

  const copy = await loadTraditionalAssessmentText();
  render(<TraditionalQuestionnaireCopy><FunQuizClient quiz={quiz} locale="zh" /></TraditionalQuestionnaireCopy>);
  fireEvent.click(await screen.findByRole("button", { name: copy("开始测试") }));
  for (const [index, questionId] of state.path.entries()) {
    const question = quiz.questions.find((item) => item.id === questionId)!;
    expect(screen.getByRole("heading", { name: question.prompt.zh })).toBeVisible();
    fireEvent.click(screen.getAllByRole("radio")[0]);
    fireEvent.click(screen.getByRole("button", { name: copy(index === state.path.length - 1 ? "查看完整结果" : "下一题") }));
  }
  expect(screen.getAllByRole("link").some((link) => link.getAttribute("href") === resultPath("zh-TW", slug, result.id))).toBe(true);
});

it.each(traditionalBespokeStorySlugs)("keeps the original editorial, scoring and references for Taiwan %s", async (slug) => {
  const original = (await loadFunQuiz(slug))!;
  const quiz = (await loadTraditionalBespokeStory(slug))!;
  const { answers, state } = scoreExample(original);
  expect(quiz.questions.map(question => question.id)).toEqual(original.questions.map(question => question.id));
  expect(resolveFunQuiz(quiz, answers)).toEqual(state);
  expect(quiz.results.map(result => result.id)).toEqual(original.results.map(result => result.id));
  const params = Promise.resolve({ slug });
  expect(await landingMetadata({ params })).toMatchObject({ robots: { index: false } });
  render(await Landing({ params }));
  expect(screen.getByRole("heading", { name: quiz.title.zh })).toBeVisible();
  const form = screen.getByRole("button", { name: "開始測驗" }).closest("form");
  expect(form).toHaveAttribute("action", `/zh-TW/tests/play/${slug}/take`);
  const links = screen.getAllByRole("link").map(link => link.getAttribute("href"));
  expect(links.filter(href => href?.startsWith("https://")).length).toBeGreaterThanOrEqual(2);
  for (const result of quiz.results) {
    const path = resultPath("zh-TW", slug, result.id);
    expect(links).toContain(path);
    expect(traditionalPath(path)).toBe(path);
  }
  expect(traditionalPath(`/zh-TW/tests/play/${slug}/results/not-real`)).toBeNull();
});
