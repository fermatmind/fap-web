import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import entry, { generateMetadata as entryMetadata } from "@/components/questionnaires/QuestionnairePage";
import guide, { generateMetadata as guideMetadata } from "@/components/questionnaires/QuestionnaireGuide";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { miniVirtuesDefinitions, scoreMiniVirtuesQuestionnaire } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsChineseGuideProfile } from "@/lib/questionnaires/sevenSinsChineseSeo";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { SevenSinsTraditionalPage, sevenSinsTraditionalMetadata } from "@/components/i18n/zh-TW/SevenSinsPage";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const parse = (html: string) => {
  const node = document.createElement("div");
  node.innerHTML = html;
  return node;
};

it("connects Chinese test, virtue-only and result-reading intents to existing sections", async () => {
  const props = { params: Promise.resolve({ locale: "zh", slug: quiz.slug }) };
  const dom = parse(renderToStaticMarkup(await entry(props)));
  const metadata = await entryMetadata(props);
  expect(String(metadata.title)).toContain("七宗罪测试与七美德测试");
  expect(metadata.description).toContain("28道原创题");
  expect(dom.querySelectorAll("h1")).toHaveLength(1);
  const navigation = dom.querySelector('nav[aria-label="七宗罪测试阅读导航"]')!;
  expect(navigation).not.toBeNull();
  for (const a of navigation.querySelectorAll("a")) {
    expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
  }
  expect(dom.querySelector("#questionnaire-faq")?.closest("section")?.textContent).toContain("没有另一套单独的七美德题本");
  expect(dom.querySelector("#questionnaire-faq")?.closest("section")?.textContent).toContain("不是人群排名或发生概率");
  expect(dom.querySelector("#questionnaire-faq")?.closest("section")?.textContent).toContain("它不是MBTI");
  for (const axis of miniVirtuesDefinitions) {
    const link = dom.querySelector(`#questionnaire-results + p ~ ul a[href$="/results/${axis.profileId}"]`)
      ?? dom.querySelector(`a[href="/zh/tests/explore/${quiz.slug}/results/${axis.profileId}"]`);
    expect(link?.textContent).toContain(`${axis.sin.zh}与${axis.virtue.zh}`);
  }
});

it("names every Chinese guide consistently in search, its H1 and sibling links without rewriting source results", async () => {
  const before = JSON.stringify(quiz.profiles);
  const neutral = Object.fromEntries(quiz.questions.map(question => [question.id, "3"]));
  const scores = scoreMiniVirtuesQuestionnaire(quiz, neutral);
  for (const axis of miniVirtuesDefinitions) {
    const profile = quiz.profiles.find(profile => profile.id === axis.profileId)!;
    const props = { params: Promise.resolve({ locale: "zh", slug: quiz.slug, profile: profile.id }) };
    const dom = parse(renderToStaticMarkup(await guide(props)));
    const metadata = await guideMetadata(props);
    const pair = `${axis.sin.zh}与${axis.virtue.zh}`;
    expect(String(metadata.title)).toContain(pair);
    expect(metadata.description).toContain(pair);
    expect(dom.querySelector("h1")?.textContent).toContain(pair);
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(`/zh/tests/explore/${quiz.slug}/results/${profile.id}`);
    for (const sibling of miniVirtuesDefinitions.filter(part => part.id !== axis.id)) {
      const a = dom.querySelector(`a[href="/zh/tests/explore/${quiz.slug}/results/${sibling.profileId}"]`);
      expect(a?.textContent).toContain(`${sibling.sin.zh}与${sibling.virtue.zh}`);
    }
    for (const section of profile.sections) for (const text of section.paragraphs) {
      expect(dom.textContent).toContain(text.zh);
    }
    expect(sevenSinsChineseGuideProfile(quiz.slug, "en", profile)).toBe(profile);
    expect(sevenSinsChineseGuideProfile("another-test", "zh", profile)).toBe(profile);
  }
  expect(JSON.stringify(quiz.profiles)).toBe(before);
  expect(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex")).toBe(quiz.source.resultContentSha256);
  expect(scoreMiniVirtuesQuestionnaire(quiz, neutral)).toEqual(scores);
});

it("uses the existing Traditional conversion for the same seven public headings and metadata", () => {
  const entryPath = "/zh-TW/tests/explore/seven-sins-virtues-test";
  for (const axis of miniVirtuesDefinitions) {
    const path = `${entryPath}/results/${axis.profileId}`;
    const dom = parse(renderToStaticMarkup(<SevenSinsTraditionalPage path={path} />));
    const metadata = sevenSinsTraditionalMetadata(path);
    const pair = `${sevenSinsDisplay(axis.sin.zh, "zh-TW")}與${sevenSinsDisplay(axis.virtue.zh, "zh-TW")}`;
    expect(dom.querySelector("h1")?.textContent).toContain(pair);
    expect(String(metadata.title)).toContain(pair);
    expect(String(metadata.description)).toContain(pair);
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(path);
  }
});
