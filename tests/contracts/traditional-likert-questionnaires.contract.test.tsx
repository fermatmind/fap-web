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

it.each(["locus-of-control", "empathy", "social-intelligence-test", "character-strengths", "hexaco", "work-traits-reflection", "growth-mindset-fixed-mindset", "grit-test", "tech-savvy", "time-management", "procrastinator-type-test", "everyday-control-style", "apology-language", "conflict-styles", "love-fight-style", "friendship-compatibility", "relationship-worry-habits", "relationship-habits", "dating-outlook", "intimacy-values", "relationship-commitment"])("preserves source scoring, readings and citations for Taiwan %s", async slug => {
  const original = (await loadQuestionnaire(slug))!;
  const { quiz, extraReferences } = (await loadTraditionalLikert(slug))!;
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
  expect(quiz.profiles.map(profile => profile.id)).toEqual(original.profiles.map(profile => profile.id));
  for (const [index, profile] of quiz.profiles.entries()) {
    const sourceProfile = prepareResultProfile(slug, original.profiles[index]);
    expect(profile.sections.map(section => [section.id, section.paragraphs.length]))
      .toEqual(sourceProfile.sections.map(section => [section.id, section.paragraphs.length]));
  }
  const profile = quiz.profiles[0];
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
  expect(destinations.map(link => link.getAttribute("href"))).toEqual([...(original.references ?? []), ...extraReferences].map(reference => reference.url));
  expect(container.textContent).not.toMatch(/24小時|二十四小時/);
  cleanup();
  render(await LikertQuestionnairePage({ slug, take: false, profile: profile.id }));
  expect(screen.getByRole("heading", { level: 1, name: profile.title.zh })).toBeVisible();
  expect(screen.getByText(profile.sections.at(-1)!.paragraphs.at(-1)!.zh, { exact: false })).toBeVisible();
});

it("keeps all 24 Taiwan character strengths guides public and scores each part independently", async () => {
  const { quiz, summaries } = (await loadTraditionalLikert("character-strengths"))!;
  expect(quiz.questions).toHaveLength(96);
  expect(quiz.profiles).toHaveLength(24);
  expect(Object.keys(summaries).sort()).toEqual(quiz.profiles.map(profile => profile.id).sort());
  const first = quiz.questions[0];
  const answers = Object.fromEntries(quiz.questions.map(question => [question.id, question.id === first.id ? "na" : "3"]));
  const result = scoreQuestionnaire(quiz, answers);
  expect(result.status).toBe("complete");
  if (result.status !== "complete" || !("facets" in result)) throw new Error("Expected individual strength readings");
  for (const [id, facet] of Object.entries(result.facets)) {
    if (id === first.options[0].directionId) expect(facet).toMatchObject({ rated: 3, mean: null });
    else expect(facet).toMatchObject({ rated: 4, mean: 3, sum: 12 });
  }
  for (const profile of quiz.profiles) {
    const guide = questionnaireGuidePath("zh-TW", quiz.slug, profile.id);
    expect(traditionalPath(guide)).toBe(guide);
    const { container } = render(await LikertQuestionnairePage({ slug: quiz.slug, take: false, profile: profile.id }));
    expect(container.querySelector("[data-character-strengths-result-reading]")).toHaveAttribute("data-character-strengths-result-reading", profile.id);
    expect(container.querySelector("[data-character-mean], [data-character-sum]")).toBeNull();
    expect(container.querySelector("[data-character-source] a")).toHaveAttribute("href", quiz.references![0].url);
    expect(container.textContent).toContain(profile.sections.at(-1)!.paragraphs.at(-1)!.zh);
    cleanup();
  }
});
