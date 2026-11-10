import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { ArchetypeQuestionnairePage, traditionalArchetypeMetadata } from "@/components/i18n/zh-TW/ArchetypeQuestionnairePage";
import { colorSeasonLandingReferences } from "@/components/questionnaires/ColorSeasonLandingEditorial";
import { sakeTypeLandingReferences } from "@/components/questionnaires/SakeTypeLandingEditorial";
import { everydayMixupsLandingReferences } from "@/components/questionnaires/EverydayMixupsLandingEditorial";
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
    const references = slug === "color-season" ? colorSeasonLandingReferences
      : slug === "sake-type" ? sakeTypeLandingReferences
        : slug === "stupidity-test" ? everydayMixupsLandingReferences : source.references ?? [];
    if (slug === "euphoria-character-quiz" || !references.length) expect(citations).toHaveLength(0);
    else expect(citations.length).toBeGreaterThan(0);
    for (const link of citations) expect(container.querySelector(link.getAttribute("href")!)).not.toBeNull();
    const destinations = [...container.querySelectorAll(`[id^="${slug}-reference-"] > a`)];
    expect(destinations.map(link => link.getAttribute("href"))).toEqual(references.map(item => item.url));
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

it.each(["found-family-role-test", "chinese-zodiac", "zodiac-sign-quiz", "male-archetype-test", "wojak"])(
  "keeps stale draft promises out of the Taiwan %s landing and result guides", async slug => {
    const staleDraft = /24小時.{0,22}(?:草稿|恢復)|草稿.{0,25}24小時/;
    render(await ArchetypeQuestionnairePage({ slug }));
    expect(screen.getAllByText(/不儲存答題進度/).length).toBeGreaterThan(0);
    expect(screen.queryByText(staleDraft)).not.toBeInTheDocument();
    const quiz = (await loadTraditionalArchetype(slug))!;
    const paragraphs = quiz.profiles.flatMap(profile =>
      profile.sections.flatMap(section => section.paragraphs.map(paragraph => paragraph.zh)));
    expect(paragraphs.join("\n")).not.toMatch(staleDraft);
  },
);

it.each([
  ["hogwarts-house-quiz", "/zh-TW/tests/explore/harry-potter-character"],
  ["hello-kitty", "/zh-TW/tests/explore/chiikawa"],
  ["hazbin-hotel-character-quiz", null],
])("restores the Taiwan comparison links and illustrations for %s", async (slug, related) => {
  const { container } = render(await ArchetypeQuestionnairePage({ slug }));
  const overview = container.querySelector("[data-eight-quiz-overview]");
  expect(overview).not.toBeNull();
  expect(overview?.querySelector("img")).not.toBeNull();
  const guides = [...overview!.querySelectorAll('a[href*="/results/"]')];
  expect(guides.length).toBeGreaterThan(0);
  expect(guides.every(link => link.getAttribute("href")?.startsWith(`/zh-TW/tests/explore/${slug}/results/`))).toBe(true);
  if (related) expect(overview?.querySelector(`a[href="${related}"]`)).not.toBeNull();
});

it.each(["spirit-animal", "flower"])("uses the current Taiwan %s privacy copy", async slug => {
  const { container } = render(await ArchetypeQuestionnairePage({ slug }));
  expect(screen.getAllByText(/重新整理、切換語言或離開/).length).toBeGreaterThan(0);
  expect(screen.queryByText(/24小時.{0,15}草稿|24小時內恢復/)).not.toBeInTheDocument();
  if (slug === "spirit-animal") {
    expect(container.querySelector('#spirit-animal-reference-1 a')?.getAttribute("href"))
      .toBe("https://americanindian.si.edu/nk360/informational/native-american-spirit-animal");
    expect(container.querySelectorAll("[data-eight-quiz-overview] [data-quiz-artwork]")).toHaveLength(9);
  }
});


it("keeps the six source palette colors and the localized contrast source on Taiwan public guides", async () => {
  const slug = "color-season";
  const source = (await loadQuestionnaire(slug))!;
  const profile = source.profiles[0];
  const { container } = render(await ArchetypeQuestionnairePage({ slug, profile: profile.id }));
  const colors = [...container.querySelectorAll("[data-palette-colour]")];
  expect(colors.map(color => color.getAttribute("data-palette-colour"))).toEqual(profile.paletteSwatches?.map(color => color.hex));
  expect(screen.getByText("本組原創示例色")).toBeVisible();
  expect(screen.getByRole("link", { name: /W3C：文字對比說明/ })).toHaveAttribute("href", "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html");
});

it("keeps both synthetic Taiwan aura results and their public comparison routes", async () => {
  const slug = "aura-color";
  const { container } = render(await ArchetypeQuestionnairePage({ slug }));
  const examples = container.querySelector("#aura-examples")!;
  expect(examples.querySelectorAll("article")).toHaveLength(2);
  expect([...examples.querySelectorAll('a[href*="/results/"]')].map(link => link.getAttribute("href"))).toEqual([
    "/zh-TW/tests/explore/aura-color/results/blue",
    "/zh-TW/tests/explore/aura-color/results/yellow",
    "/zh-TW/tests/explore/aura-color/results/green",
  ]);
  cleanup();
  const { container: guide } = render(await ArchetypeQuestionnairePage({ slug, profile: "blue" }));
  expect(guide.querySelector('[data-quiz-artwork="blue"]')).not.toBeNull();
  expect(screen.getByRole("link", { name: "對照七種光環顏色" })).toHaveAttribute("href", "/zh-TW/tests/explore/aura-color#questionnaire-results");
});

it("keeps all eight Taiwan moon phase links, diagrams and three example outcomes", async () => {
  const slug = "moon-phase";
  const { container } = render(await ArchetypeQuestionnairePage({ slug }));
  const comparison = container.querySelector("#moon-phase-comparison")!;
  expect(comparison.querySelectorAll("img")).toHaveLength(8);
  expect([...comparison.querySelectorAll("a")].every(link =>
    link.getAttribute("href")?.startsWith("/zh-TW/tests/explore/moon-phase/results/"))).toBe(true);
  expect(screen.getByRole("heading", { name: /^眉月$/ })).toBeVisible();
  expect(screen.getByRole("heading", { name: /^殘月$/ })).toBeVisible();
  expect(container.querySelectorAll("[data-moon-phase-example]")).toHaveLength(3);
  cleanup();
  const { container: guide } = render(await ArchetypeQuestionnairePage({ slug, profile: "waning-crescent" }));
  expect(guide.querySelector("[data-moon-phase-public-diagram] img")).not.toBeNull();
});
