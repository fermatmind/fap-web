import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LikertQuestionnairePage, traditionalLikertMetadata } from "@/components/i18n/zh-TW/LikertQuestionnairePage";
import { traditionalDirectionalRoute } from "@/lib/i18n/traditionalDirectionalPaths";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { loadTraditionalDirectional } from "@/lib/i18n/zh-TW/directionalQuestionnaires";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";

afterEach(cleanup);

it.each([
  "adult-age-preferences", "disc", "egen-teto", "food-choice", "likable-person-test",
  "love-personality", "relationship-values", "response-color",
])("preserves directional scoring and every public guide for %s", async slug => {
  const original = (await loadQuestionnaire(slug))!;
  const { quiz } = (await loadTraditionalDirectional(slug))!;
  expect(quiz.code).toBe(original.code);
  expect(quiz.version).toBe(original.version);
  expect(quiz.questions.map(({ id, options }) => [id, options.map(option => [option.id, option.directionId, option.score])]))
    .toEqual(original.questions.map(({ id, options }) => [id, options.map(option => [option.id, option.directionId, option.score])]));
  for (const choose of [() => 0, () => 1, (index: number) => index % 2]) {
    const responses = Object.fromEntries(original.questions.map((question, index) => [question.id, question.options[choose(index)].id]));
    const first = original.questions[0].id;
    for (const sample of [responses, { ...responses, [first]: "unknown" }, {}]) {
      expect(scoreDirectionalQuestionnaire(quiz, sample)).toEqual(scoreDirectionalQuestionnaire(original, sample));
    }
  }

  const entry = questionnairePath("zh-TW", slug);
  const suffix = entry.slice("/zh-TW".length);
  const wrong = suffix.includes("/play/") ? suffix.replace("/play/", "/explore/") : suffix.replace("/explore/", "/play/");
  expect(traditionalDirectionalRoute(wrong)).toBeNull();
  expect(traditionalPath(questionnairePath("zh", slug))).toBe(entry);
  expect(traditionalPath(entry + "/results/unknown")).toBeNull();
  expect(await traditionalLikertMetadata({ slug, take: true })).toMatchObject({
    robots: { index: false, follow: false },
    alternates: { canonical: entry },
  });

  const { container } = render(await LikertQuestionnairePage({ slug, take: false }));
  expect(screen.getByRole("heading", { level: 1, name: quiz.title.zh })).toBeVisible();
  expect(container.textContent).not.toMatch(/24小時|二十四小時/);
  expect(quiz.profiles.map(profile => profile.id)).toEqual(original.profiles.map(profile => profile.id));
  for (const [index, profile] of quiz.profiles.entries()) {
    const source = prepareResultProfile(slug, original.profiles[index]);
    expect(profile.sections.map(section => [section.id, section.paragraphs.length]))
      .toEqual(source.sections.map(section => [section.id, section.paragraphs.length]));
    expect(profile.resultReading?.references?.map(reference => reference.url))
      .toEqual(source.resultReading?.references?.map(reference => reference.url));
    expect(container.querySelector(`a[href="${entry}/results/${profile.id}"]`)).toBeTruthy();
  }
  cleanup();
  const profile = quiz.profiles[0];
  render(await LikertQuestionnairePage({ slug, take: false, profile: profile.id }));
  expect(screen.getByRole("heading", { level: 1, name: profile.title.zh })).toBeVisible();
  expect(screen.getAllByText(profile.sections.at(-1)!.paragraphs.at(-1)!.zh, { exact: false }).length).toBeGreaterThan(0);
});
