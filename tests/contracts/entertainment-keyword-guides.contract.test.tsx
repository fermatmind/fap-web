import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { entertainmentGuideProfile } from "@/lib/questionnaires/entertainmentGuideSeo";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const bank = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;

describe("existing entertainment guide keyword intent", () => {
  beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); });
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
  it("keeps question/result authority and personal readings independent of search presentation", () => {
    for (const slug of ["cyberpunk-edgerunners", "chiikawa", "aura-color", "adult-age-preferences", "philosopher-personality-test", "space-marine-chapter", "bleach", "moon-phase"]) {
      const quiz = bank(slug), snapshot = structuredClone(quiz);
      for (const profile of quiz.profiles) for (const locale of ["zh", "en"]) {
        const display = entertainmentGuideProfile(slug, locale, profile);
        expect(display.id).toBe(profile.id);
        expect(display.directionIds).toBe(profile.directionIds);
        expect(display.sections).toBe(profile.sections);
        expect(display.scoreReading).toBe(profile.scoreReading);
        expect(display.summary).toBe(profile.summary);
      }
      expect(quiz).toEqual(snapshot);
    }
    for (const slug of ["seven-sins-virtues-test", "disc", "mental-age"]) {
      const profile = bank(slug).profiles[0];
      expect(entertainmentGuideProfile(slug, "en", profile)).toBe(profile);
    }
  });

  it("serves all bilingual age-scenario guides with the subject, full reading and original canonical", async () => {
    const { default: Page, generateMetadata } = await import("@/components/questionnaires/QuestionnaireGuide");
    const quiz = bank("adult-age-preferences");
    for (const locale of ["zh", "en"] as const) for (const profile of quiz.profiles) {
      const args = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
      const meta = await generateMetadata(args), dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await Page(args));
      const subject = locale === "zh" ? "年上年下" : "Dating Age Preference Quiz";
      expect(meta.title).toContain(subject);
      expect(dom.querySelector("h1")?.textContent).toContain(subject);
      expect(meta.openGraph?.title).toBe(meta.title);
      const entry = `/${locale}/tests/explore/${quiz.slug}`;
      expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${entry}/results/${profile.id}`);
      expect(dom.querySelector(`a[href='${entry}#take-test']`)?.textContent).toContain(subject);
      for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    }
  });

  it("keeps Traditional Chiikawa guide titles aligned without renaming personal results", async () => {
    const { default: Page, generateMetadata } = await import("@/app/(traditional)/zh-TW/[[...path]]/page");
    for (const id of ["chiikawa", "hachiware", "usagi", "momonga", "kurimanju", "rakko"]) {
      const args = { params: Promise.resolve({ path: ["tests", "explore", "chiikawa", "results", id] }) };
      const meta = await generateMetadata(args), dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await Page(args));
      expect(meta.title).toContain("吉伊卡哇測試結果");
      expect(dom.querySelector("h1")?.textContent).toBe(meta.title);
      expect(meta.openGraph?.title).toBe(meta.title);
      expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/zh-TW/tests/explore/chiikawa/results/${id}`);
    }
  });
});
