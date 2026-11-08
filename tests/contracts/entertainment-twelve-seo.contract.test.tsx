import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { entertainmentGuideProfile } from "@/lib/questionnaires/entertainmentGuideSeo";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { EightQuizOverview } from "@/components/questionnaires/EightQuizOverview";
import { FantasyRoster } from "@/components/questionnaires/FantasyRoster";
import { directoryDescription } from "@/lib/entertainment/directory";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const bank = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
const dom = (html: string) => { const element = document.createElement("div"); element.innerHTML = html; return element; };

describe("twelve-test search intent: existing guides and distinct related themes", () => {
  beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it.each(["en", "zh"] as const)("serves specific public meaning guides in %s without changing full source readings", async locale => {
    const { default: Page, generateMetadata } = await import("@/components/questionnaires/QuestionnaireGuide");
    for (const slug of ["soldier-poet-king-quiz", "rice-purity-test"]) {
      const quiz = bank(slug), snapshot = structuredClone(quiz);
      for (const profile of quiz.profiles) {
        const args = { params: Promise.resolve({ locale, slug, profile: profile.id }) };
        const page = dom(renderToStaticMarkup(await Page(args))), meta = await generateMetadata(args);
        const display = entertainmentGuideProfile(slug, locale, profile);
        const subject = slug === "rice-purity-test" ? "Rice Purity" : locale === "en" ? "Soldier Poet King" : "士兵诗人国王";
        expect(page.querySelectorAll("h1")).toHaveLength(1);
        expect(page.querySelector("h1")?.textContent).toBe(display.title[locale]);
        expect(meta.title).toContain(subject);
        expect(meta.description).toBe(display.seo!.description[locale]);
        expect(meta.openGraph?.title).toBe(meta.title);
        expect(meta.openGraph?.description).toBe(meta.description);
        expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${questionnaireGuidePath(locale, slug, profile.id)}`);
        expect(page.querySelector("h1")?.nextElementSibling?.textContent).toBe(display.summary[locale]);
        expect(page.querySelector(`a[href='${questionnairePath(locale, slug)}#take-test']`)?.textContent).toContain(slug === "rice-purity-test" ? "Rice Purity" : subject);
        for (const section of profile.sections) {
          expect(page.querySelector(`#report-${section.id}`)).not.toBeNull();
          for (const paragraph of section.paragraphs) expect(page.textContent).toContain(paragraph[locale]);
        }
        expect(display.sections).toBe(profile.sections);
        expect(display.directionIds).toBe(profile.directionIds);
        expect(display.scoreReading).toBe(profile.scoreReading);
      }
      expect(quiz).toEqual(snapshot);
    }
  });

  it.each(["en", "zh"] as const)("links only independent public entries in %s from the actual overview and fantasy roster", locale => {
    const pairs: Record<string, string[]> = {
      "hogwarts-house-quiz": ["patronus-quiz"],
      "spirit-animal": ["patronus-quiz"],
      "patronus-quiz": ["hogwarts-house-quiz", "spirit-animal"],
      "avatar-bender-quiz": ["what-element-am-i"],
    };
    for (const [slug, targets] of Object.entries(pairs)) {
      const quiz = bank(slug), overview = ["hogwarts-house-quiz", "spirit-animal"].includes(slug);
      const page = dom(renderToStaticMarkup(overview ? <EightQuizOverview quiz={quiz} locale={locale} /> : <FantasyRoster quiz={quiz} locale={locale} />));
      const nav = page.querySelector("nav"); expect(nav).not.toBeNull();
      for (const target of targets) {
        const link = nav!.querySelector(`a[href='${questionnairePath(locale, target)}']`);
        expect(link?.getAttribute("target")).toBe("_blank");
        expect(link?.getAttribute("rel")).toContain("noopener");
        expect(link?.textContent).toContain(locale === "en" ? "separate" : "另做");
      }
      const result = dom(renderToStaticMarkup(overview ? <EightQuizOverview quiz={quiz} locale={locale} compact /> : <FantasyRoster quiz={quiz} locale={locale} preserveResult />));
      expect(result.querySelector("nav")).toBeNull();
    }
    expect(renderToStaticMarkup(<FantasyRoster quiz={bank("soldier-poet-king-quiz")} locale={locale} />)).not.toContain("jungian-archetype");
  });

  it.each(["en", "zh"] as const)("keeps Love Type's H1, code guides and directory while making its 16-combination edition explicit in %s metadata", async locale => {
    const quiz = bank("love-type-16");
    const { default: Page, generateMetadata } = await import("@/components/questionnaires/QuestionnairePage");
    const args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
    const page = dom(renderToStaticMarkup(await Page(args))), meta = await generateMetadata(args);
    expect(meta.title).toContain("Love Type 16"); expect(meta.title).toContain("32");
    expect(meta.description).toBe(quiz.description[locale]); expect(meta.openGraph?.description).toBe(meta.description);
    expect(page.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
    expect(directoryDescription(quiz)[locale]).toContain(locale === "en" ? "Love Type 16" : "16");
    for (const profile of quiz.profiles) expect(page.querySelector(`a[href='${questionnaireGuidePath(locale, quiz.slug, profile.id)}']`)).not.toBeNull();
  });
});
