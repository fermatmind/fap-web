import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { isNineStarYearConfigurationValid, type NineStarYearQuestionnaire } from "@/lib/questionnaires/nineStarYear";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nine-star-ki.json", "utf8")) as NineStarYearQuestionnaire;
describe("Nine Star real public route and source boundaries", () => {
  it("registers the cultural calculator and does not turn it into generic questions, scores or a draft", async () => {
    const loaded = await loadQuestionnaire(quiz.slug); expect(loaded).toEqual(quiz); expect(isNineStarYearConfigurationValid(loaded)).toBe(true);
    expect(scoreQuestionnaire(loaded!, { year: "2025", side: "uncertain" })).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(loaded!, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: { year: "2025", side: "uncertain" } }))).toBeNull();
  });
  it("emits all20 bilingual entry/guide identities with complete bodies, distinct metadata and exact sitemap links", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]); let count = 0;
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/nine-star-ki`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const meta = await entry.generateMetadata(args), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.querySelector("[data-nine-star-client]")).not.toBeNull();
        expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.description).toBe(quiz.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        expect(dom.textContent).toContain(quiz.instructions[locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
        const card = directory.querySelector(`a[href="${path}"]`)?.closest("article"); expect(card).not.toBeNull();
        expect(card?.textContent).toContain(locale === "zh" ? "年份与立春界点 · 九篇完整文化指南" : "Year & Spring boundary · Nine complete cultural guides"); expect(card?.textContent).not.toMatch(/0\s*题|0 questions/); expect(maps.filter(e => e.loc === `https://fermatmind.com${path}`)).toHaveLength(1); count++;
        for (const p of quiz.profiles) {
          const publicPath = `${path}/results/${p.id}`, gargs = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          const gm = await guide.generateMetadata(gargs); dom.innerHTML = renderToStaticMarkup(await guide.default(gargs));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(gm.title).toBe(p.seo.title[locale]); expect(gm.description).toBe(p.seo.description[locale]);
          expect(gm.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(gm.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/nine-star-ki/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/nine-star-ki/results/${p.id}` });
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(dom.querySelector("input, [data-nine-star-result], [data-facet-score]")).toBeNull();
          expect(dom.querySelector(`a[href='${path}']`)).not.toBeNull(); expect(maps.filter(e => e.loc === `https://fermatmind.com${publicPath}`)).toHaveLength(1);
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u); count++;
        }
      }
      expect(count).toBe(20); expect(maps.filter(e => e.loc.includes("/tests/explore/nine-star-ki"))).toHaveLength(20);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("withholds entry/guide metadata, rendering and images when the adopted year or cultural source drifts", async () => {
    const faults: ((q: NineStarYearQuestionnaire) => void)[] = [
      q => { q.nineStarYear.maxYear = 2027 as never; }, q => { q.source.itemBankVersion = "unknown"; },
      q => { q.profiles[0].star = 9; }, q => { q.profiles[0].sections[5].paragraphs[0].en = ""; },
    ];
    for (const fault of faults) {
      const damaged = structuredClone(quiz); fault(damaged);
      vi.resetModules(); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => damaged as unknown as Questionnaire }));
      try {
        const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), { GET } = await import("@/app/og/fun/[slug]/route");
        for (const locale of ["en", "zh"] as const) {
          const args = { params: Promise.resolve({ locale, slug: quiz.slug }) }, gargs = { params: Promise.resolve({ locale, slug: quiz.slug, profile: quiz.profiles[0].id }) };
          expect((await entry.generateMetadata(args)).robots).toMatchObject({ index: false }); expect((await guide.generateMetadata(gargs)).robots).toMatchObject({ index: false });
          await expect(entry.default(args)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/); await expect(guide.default(gargs)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          expect((await GET(new Request(`https://fermatmind.com/og/fun/nine-star-ki?locale=${locale}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
        }
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  });
});
