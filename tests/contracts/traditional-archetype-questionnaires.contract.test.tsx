import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { ArchetypeQuestionnairePage, traditionalArchetypeMetadata } from "@/components/i18n/zh-TW/ArchetypeQuestionnairePage";
import { hasFilmEditorial } from "@/components/i18n/zh-TW/FilmQuestionnaireLanding";
import { archetypeLandingSummary, loadTraditionalArchetype } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import members from "@/lib/i18n/zh-TW/archetype-questionnaire-members.generated.json";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { proxy } from "@/proxy";

afterEach(cleanup);

it.each(Object.entries(members))("preserves the true questions, scoring and full public guides for Taiwan %s", async (slug, profileIds) => {
  const source = (await loadQuestionnaire(slug))!;
  const quiz = (await loadTraditionalArchetype(slug))!;
  expect(quiz.profiles.map(profile => profile.id)).toEqual(profileIds);
  const selected = Object.fromEntries(source.questions.map(question => [question.id, question.interaction === "rank" ? JSON.stringify(question.options.map(option => option.id)) : question.options[0].id]));
  expect(scoreQuestionnaire(quiz, selected)).toMatchObject({ status: "complete" });
  expect(scoreQuestionnaire(quiz, selected)).toEqual(scoreQuestionnaire(source, selected));
  expect(quiz.questions.map(question => [question.id, ...question.options.map(option => option.id)]))
    .toEqual(source.questions.map(question => [question.id, ...question.options.map(option => option.id)]));
  const route = questionnairePath("zh-TW", slug);
  expect(traditionalPath(questionnairePath("zh", slug))).toBe(route);
  expect((await proxy(new NextRequest("https://fermatmind.com" + route + "/take"))).status).toBe(200);
  expect((await proxy(new NextRequest("https://fermatmind.com" + route + "/results/unknown"))).status).toBe(404);
  expect(await traditionalArchetypeMetadata({ slug })).toMatchObject({ robots: { index: false }, alternates: { canonical: route } });

  const { container } = render(await ArchetypeQuestionnairePage({ slug }));
  if (hasFilmEditorial(slug)) {
    const citations = [...container.querySelectorAll(`a[href^="#${slug}-reference-"]`)];
    if (slug === "euphoria-character-quiz") expect(citations).toHaveLength(0);
    else expect(citations.length).toBeGreaterThan(0);
    for (const link of citations) expect(container.querySelector(link.getAttribute("href")!)).not.toBeNull();
    const destinations = [...container.querySelectorAll(`[id^="${slug}-reference-"] > a`)];
    expect(destinations.map(link => link.getAttribute("href"))).toEqual(source.references?.map(item => item.url));
  }
  expect(screen.getByRole("heading", { name: quiz.title.zh })).toBeVisible();
  const start = screen.getByRole("button", { name: "開始測驗" }).closest("form");
  expect(start).toHaveAttribute("action", route + "/take");
  expect(start?.querySelector('input[name="start"]')).toHaveValue("1");
  for (const profile of quiz.profiles) {
    expect(screen.getAllByRole("link", { name: profile.title.zh }).every(link => link.getAttribute("href") === questionnaireGuidePath("zh-TW", slug, profile.id))).toBe(true);
    const original = prepareResultProfile(slug, source.profiles.find(item => item.id === profile.id)!);
    expect(profile.sections.map(section => [section.id, section.paragraphs.length])).toEqual(original.sections.map(section => [section.id, section.paragraphs.length]));
    expect(profile.sections.flatMap(section => section.paragraphs.map(paragraph => paragraph.en)))
      .toEqual(original.sections.flatMap(section => section.paragraphs.map(paragraph => paragraph.en)));
  }
  cleanup();
  const profile = quiz.profiles[0];
  render(await ArchetypeQuestionnairePage({ slug, profile: profile.id }));
  expect(screen.getByRole("heading", { name: profile.title.zh })).toBeVisible();
  expect(screen.getAllByText(profile.sections.at(-1)!.paragraphs[0].zh).length).toBeGreaterThan(0);
});


it("renders the Taiwan Disney roster with all 13 dedicated editorial summaries", async () => {
  const slug = "disney-princess";
  const quiz = (await loadTraditionalArchetype(slug))!;
  render(await ArchetypeQuestionnairePage({ slug }));
  expect(quiz.profiles).toHaveLength(13);
  for (const profile of quiz.profiles) {
    const summary = archetypeLandingSummary(slug, profile.id);
    expect(summary).not.toEqual(profile.summary.zh);
    expect(screen.getByText(summary)).toBeVisible();
  }
  expect(screen.getByRole("link", { name: /^莫娜：/ })).toBeVisible();
});

it.each(["jungian-archetype", "temperament", "leadership-style", "travel-personality-test",
  "aesthetic-core-test", "tsundere-dere-type", "hogwarts-house-quiz"])(
  "projects the current no-draft landing copy for Taiwan %s", async slug => {
    render(await ArchetypeQuestionnairePage({ slug }));
    expect(screen.getAllByText(/不儲存答題進度/)).toHaveLength(2);
    expect(screen.queryByText(/24小時.{0,15}草稿|24小時內恢復/)).not.toBeInTheDocument();
  },
);
