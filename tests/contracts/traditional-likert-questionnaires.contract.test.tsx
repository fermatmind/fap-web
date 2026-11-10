import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LikertQuestionnairePage, traditionalLikertMetadata } from "@/components/i18n/zh-TW/LikertQuestionnairePage";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { loadTraditionalLikert } from "@/lib/i18n/zh-TW/likertQuestionnaires";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";

afterEach(cleanup);

it.each(["locus-of-control", "empathy", "social-intelligence-test"])("preserves source scoring, readings and citations for Taiwan %s", async slug => {
  const original = (await loadQuestionnaire(slug))!;
  const { quiz } = (await loadTraditionalLikert(slug))!;
  const identity = (item: typeof original) => item.questions.map(question => [
    question.id, question.reverse, question.options.map(option => [option.id, option.score]),
  ]);
  expect(identity(quiz)).toEqual(identity(original));
  const full = Object.fromEntries(original.questions.map((question, index) => [question.id, String(index % 5 + 1)]));
  const first = original.questions[0].id;
  const missing = { ...full };
  delete missing[first];
  for (const sample of [full, missing, { ...full, [first]: "na" }, { ...full, [first]: "unknown" }]) {
    expect(scoreQuestionnaire(quiz, sample)).toEqual(scoreQuestionnaire(original, sample));
  }
  const sourceProfile = prepareResultProfile(slug, original.profiles[0]);
  const profile = quiz.profiles[0];
  expect(profile.id).toBe(sourceProfile.id);
  expect(profile.sections.map(section => [section.id, section.paragraphs.length]))
    .toEqual(sourceProfile.sections.map(section => [section.id, section.paragraphs.length]));
  const entry = questionnairePath("zh-TW", slug);
  const guide = questionnaireGuidePath("zh-TW", slug, profile.id);
  expect(traditionalPath(questionnairePath("zh", slug))).toBe(entry);
  expect(traditionalPath(guide)).toBe(guide);
  expect(traditionalPath(guide.replace(profile.id, "unknown"))).toBeNull();
  expect(await traditionalLikertMetadata({ slug, take: true })).toMatchObject({ robots: { index: false, follow: false }, alternates: { canonical: entry } });

  const { container } = render(await LikertQuestionnairePage({ slug, take: false }));
  expect(screen.getByRole("heading", { level: 1, name: quiz.title.zh })).toBeVisible();
  expect(screen.getByRole("link", { name: profile.title.zh })).toHaveAttribute("href", guide);
  const destinations = [...container.querySelectorAll(`[id^="${slug}-reference-"] > a`)];
  expect(destinations.map(link => link.getAttribute("href"))).toEqual(original.references!.map(reference => reference.url));
  expect(container.textContent).not.toContain("24小時");
  cleanup();
  render(await LikertQuestionnairePage({ slug, take: false, profile: profile.id }));
  expect(screen.getByRole("heading", { level: 1, name: profile.title.zh })).toBeVisible();
  expect(screen.getByText(profile.sections.at(-1)!.paragraphs.at(-1)!.zh, { exact: false })).toBeVisible();
});
