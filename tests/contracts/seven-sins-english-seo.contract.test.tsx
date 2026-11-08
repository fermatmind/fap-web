import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import entry, { generateMetadata as entryMetadata } from "@/components/questionnaires/QuestionnairePage";
import guide, { generateMetadata as guideMetadata } from "@/components/questionnaires/QuestionnaireGuide";
import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import { miniVirtuesDefinitions } from "@/lib/questionnaires/miniVirtues";
import { sevenSinsGuideProfile } from "@/lib/questionnaires/sevenSinsGuideSeo";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;
const parse = (html: string) => {
  const dom = document.createElement("div");
  dom.innerHTML = html;
  return dom;
};

it("connects English test, virtue-only and score-reading intents to reachable sections", async () => {
  const props = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) };
  const dom = parse(renderToStaticMarkup(await entry(props)));
  const metadata = await entryMetadata(props);
  expect(String(metadata.title)).toContain("Free Seven Deadly Sins and Seven Virtues Test");
  expect(dom.querySelectorAll("h1")).toHaveLength(1);
  const links = dom.querySelectorAll('nav[aria-label="Seven sins and virtues reading navigation"] a');
  expect(links).toHaveLength(4);
  for (const link of links) expect(dom.querySelector(link.getAttribute("href")!)).not.toBeNull();
  const faq = dom.querySelector("#questionnaire-faq")?.closest("section")?.textContent;
  for (const text of ["seven virtues test", "Which deadly sin am I?", "not completed psychometric validation", "before display rounding", "own two questions"]) expect(faq).toContain(text);
  for (const axis of miniVirtuesDefinitions) {
    const link = dom.querySelector(`a[href="/en/tests/explore/${quiz.slug}/results/${axis.profileId}"]`);
    expect(link?.textContent).toContain(`${axis.sin.en} and ${axis.virtue.en}`);
  }
});

it("names all seven public guides without changing accepted personal-result bodies", async () => {
  for (const axis of miniVirtuesDefinitions) {
    const profile = quiz.profiles.find(profile => profile.id === axis.profileId)!;
    const props = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: profile.id }) };
    const dom = parse(renderToStaticMarkup(await guide(props)));
    const metadata = await guideMetadata(props);
    const pair = `${axis.sin.en} and ${axis.virtue.en}`;
    expect(String(metadata.title)).toContain(pair);
    expect(dom.querySelector("h1")?.textContent).toContain(pair);
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(`/en/tests/explore/${quiz.slug}/results/${profile.id}`);
    expect(dom.querySelector(`a[href="/en/tests/explore/${quiz.slug}"]`)).not.toBeNull();
    for (const sibling of miniVirtuesDefinitions.filter(part => part.id !== axis.id)) {
      expect(dom.querySelector(`a[href="/en/tests/explore/${quiz.slug}/results/${sibling.profileId}"]`)?.textContent).toContain(`${sibling.sin.en} and ${sibling.virtue.en}`);
    }
    for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph.en);
    expect(sevenSinsGuideProfile("another-test", "en", profile)).toBe(profile);
    expect(sevenSinsGuideProfile(quiz.slug, "en", profile).sections).toBe(profile.sections);
  }
  expect(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex")).toBe(quiz.source.resultContentSha256);
});
