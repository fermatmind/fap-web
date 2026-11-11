import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LikertQuestionnairePage, traditionalLikertMetadata } from "@/components/i18n/zh-TW/LikertQuestionnairePage";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { TraditionalCognitiveFunctionsPage } from "@/components/i18n/zh-TW/TraditionalCognitiveFunctionsPage";
import { scoreJung56 } from "@/lib/questionnaires/jung56";
import originalJungBank from "@/lib/questionnaires/jung56Bank.json";
import { loadTraditionalCognitive, loadTraditionalLikert } from "@/lib/i18n/zh-TW/likertQuestionnaires";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";

afterEach(cleanup);

it.each(["locus-of-control", "empathy", "social-intelligence-test", "character-strengths", "hexaco", "work-traits-reflection", "growth-mindset-fixed-mindset", "grit-test", "tech-savvy", "time-management", "procrastinator-type-test", "everyday-control-style", "apology-language", "conflict-styles", "love-fight-style", "friendship-compatibility", "relationship-worry-habits", "relationship-habits", "dating-outlook", "intimacy-values", "relationship-commitment", "work-activity-interests", "work-ethics", "culture-fit", "competency-test", "interpersonal-preferences", "social-attitudes-reflection", "cultural-dimensions", "social-battery-test", "people-pleaser", "trust-issues-test", "toxic-positivity-test", "toxic-trait", "difficult-person-test", "egogram", "type-ab", "learning-style", "multiple-intelligences", "hsp-sensitivity-quiz", "energy-flow", "deep-desire", "light-triad-test", "maturity-test", "sdt-motivation", "sternberg-love", "jealousy-scale", "wholesome-partner", "freudian-personality", "eras-of-you-test", "rizz-test", "feminine-energy", "music-taste-test", "dark-triad", "dark-tetrad-sd4", "values", "morality-6", "libertarian", "humor-style-test"])("preserves source scoring, readings and citations for Taiwan %s", async slug => {
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

it("keeps both Taiwan cognitive editions and their separate public readings", async () => {
  const slug = "cognitive-functions-test";
  const translated = (await loadTraditionalCognitive())!;
  const original = (await loadQuestionnaire(slug))!;
  const { quiz, paired } = translated;
  expect(quiz.questions).toHaveLength(32);
  expect(paired.bank.questions).toHaveLength(56);
  const ratings = Object.fromEntries(quiz.questions.map(q => [q.id, q.reverse ? "2" : "4"]));
  expect(scoreQuestionnaire(quiz, ratings)).toEqual(scoreQuestionnaire(original, ratings));
  const choices = { edition: paired.bank.edition, answers: Object.fromEntries(paired.bank.questions.map(q => [q.id, "A"])) };
  const pairedResult = scoreJung56(paired.bank, choices);
  expect(pairedResult).toEqual(scoreJung56(originalJungBank, choices));
  expect(pairedResult).toMatchObject({ status: "complete", result: { topDirectionIds: expect.arrayContaining(paired.content.cards.map(card => card.id)) } });

  const entry = questionnairePath("zh-TW", slug);
  const landing = render(await TraditionalCognitiveFunctionsPage({ take: false }));
  for (const [name, method] of [["開始 32 題自評", "ratings32"], ["開始 56 題二選一", "paired56"]]) {
    const form = landing.getByRole("button", { name }).closest("form");
    expect(form).toHaveAttribute("action", entry + "/take");
    expect(form?.querySelector("input[name=edition]")).toHaveValue(method);
  }
  cleanup();

  for (const profile of quiz.profiles) {
    expect(traditionalPath(questionnaireGuidePath("zh", slug, profile.id))).toBe(questionnaireGuidePath("zh-TW", slug, profile.id));
    const guide = render(await TraditionalCognitiveFunctionsPage({ take: false, profile: profile.id }));
    expect(guide.container.querySelector("#ratings32 [data-cognitive-functions-result-reading]")).toBeInTheDocument();
    expect(guide.container.querySelector(`#paired56 [data-jung56-reading="${profile.id}"]`)).toBeInTheDocument();
    expect(guide.container.querySelector("[data-jung56-counts], [data-cognitive-mean]")).toBeNull();
    cleanup();
  }
});
