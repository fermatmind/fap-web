import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const slugs = ["disc", "response-color", "social-battery-test", "spirit-animal"];

describe("Result-specific bilingual search assets for the four early complete questionnaires", () => {
  it("gives all43results distinct native titles/descriptions while keeping substantive full report bodies", () => {
    const titles = { en: new Set<string>(), zh: new Set<string>() }, descriptions = { en: new Set<string>(), zh: new Set<string>() };
    let count = 0;
    for (const slug of slugs) {
      const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
      for (const profile of quiz.profiles) {
        count++;
        expect(profile.sections.length).toBeGreaterThanOrEqual(9);
        expect(profile.sections.flatMap(s => s.paragraphs.map(p => p.en)).join(" ").split(/\s+/).length).toBeGreaterThan(300);
        for (const locale of ["en", "zh"] as const) {
          expect(profile.seo).toBeDefined();
          const { title, description } = profile.seo!;
          expect(title[locale].trim().length).toBeGreaterThan(10); expect(description[locale].trim().length).toBeGreaterThan(40);
          expect(title[locale]).not.toBe(`${profile.title[locale]} · ${quiz.title[locale]}`);
          expect(description[locale]).not.toBe(profile.summary[locale]);
          expect(titles[locale].has(title[locale])).toBe(false); expect(descriptions[locale].has(description[locale])).toBe(false);
          titles[locale].add(title[locale]); descriptions[locale].add(description[locale]);
          if (locale === "en") expect(`${title.en} ${description.en}`).not.toMatch(/\p{Script=Han}/u);
          else { expect(title.zh).toMatch(/\p{Script=Han}/u); expect(description.zh).toMatch(/\p{Script=Han}/u); }
        }
      }
    }
    expect(count).toBe(43); expect(titles.en.size).toBe(43); expect(titles.zh.size).toBe(43);
  });

  it("serves all86native metadata sets through the actual play/explore callers with full body, stable canonical and comparison links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const play = await import("@/app/(localized)/[locale]/tests/play/[slug]/results/[portrait]/page");
    const explore = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
    const maps = appendFunSitemapEntries([]);
    try {
      for (const slug of slugs) {
        const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
        const caller = slug === "response-color" ? play : explore;
        for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug, profile: profile.id, portrait: profile.id }) };
          const metadata = await caller.generateMetadata(props), html = renderToStaticMarkup(await caller.default(props));
          const path = questionnaireGuidePath(locale, slug, profile.id), dom = document.createElement("div"); dom.innerHTML = html;
          expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]);
          expect(metadata.openGraph?.title).toBe(profile.seo!.title[locale]); expect(metadata.openGraph?.description).toBe(profile.seo!.description[locale]);
          expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com${questionnaireGuidePath("en", slug, profile.id)}`, "zh-CN": `https://fermatmind.com${questionnaireGuidePath("zh", slug, profile.id)}` });
          expect(maps.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]);
          for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
          const links = Array.from(dom.querySelectorAll("a"), a => a.getAttribute("href"));
          expect(links).toContain(`${questionnairePath(locale, slug)}#take-test`);
          for (const other of quiz.profiles.filter(p => p.id !== profile.id)) expect(links).toContain(questionnaireGuidePath(locale, slug, other.id));
          expect(dom.querySelectorAll("[data-facet-score], [data-archetype-count]")).toHaveLength(0);
        }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
