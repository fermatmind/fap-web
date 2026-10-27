import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/natal-chart.json", "utf8")) as NatalChartQuestionnaire;

describe("T199 real public callers and fixed editorial identity", () => {
  it("registers the calculator without routing birth inputs through questionnaire scoring or storage", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    const registered = quiz as unknown as Questionnaire;
    expect(isQuestionnaireConfigurationValid(registered)).toBe(true);
    expect(scoreQuestionnaire(registered, {})).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(registered, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: { date: "2001-06-15" } }))).toBeNull();
  });

  it("serves26 full bilingual pages with unique metadata, fixed alternates and exact sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]); let pages = 0;
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/natal-chart`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const metadata = await entry.generateMetadata(args), dom = document.createElement("div");
        dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.querySelector("[data-natal-client]")).not.toBeNull(); expect(dom.querySelector("form")).toBeNull();
        const houses = dom.querySelector("[data-natal-house-guide]");
        expect(houses).not.toBeNull(); expect(houses?.hasAttribute("open")).toBe(false);
        expect(houses?.querySelectorAll("[data-natal-house-reference]")).toHaveLength(12);
        for (const house of quiz.natalChart.houseContexts) {
          const reference = houses?.querySelector(`[data-natal-house-reference="${house.number}"]`);
          expect(reference?.querySelector("h3")?.textContent).toBe(`${locale === "zh" ? `第${house.number}宫` : `House ${house.number}`} · ${house.topic[locale]}`);
          expect(reference?.querySelector("p")?.textContent).toBe(house.reading[locale]);
        }
        expect(dom.textContent).not.toContain("full-comparison backlog"); expect(dom.textContent).not.toContain("完整对标的待办");
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
        const hub = document.createElement("div"); hub.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
        const card = hub.querySelector(`a[href="${path}"]`)?.closest("article");
        expect(card).not.toBeNull(); expect(card?.textContent).toContain(locale === "zh" ? "已知时间与地点" : "Known time and place");
        expect(card?.textContent).not.toMatch(/0 questions|0 题/);
        expect(maps.filter(row => row.loc === `https://fermatmind.com${path}`)).toHaveLength(1); pages += 1;
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, params = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const m = await guide.generateMetadata(params); dom.innerHTML = renderToStaticMarkup(await guide.default(params));
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(dom.querySelector("[data-natal-result]")).toBeNull(); expect(dom.querySelector("input")).toBeNull();
          expect(m.title).toBe(profile.seo.title[locale]); expect(m.description).toBe(profile.seo.description[locale]); expect(m.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(m.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/natal-chart/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/natal-chart/results/${profile.id}` });
          for (const section of profile.sections) for (const p of section.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(maps.filter(row => row.loc === `https://fermatmind.com${publicPath}`)).toHaveLength(1);
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
          pages += 1;
        }
      }
      expect(pages).toBe(26); expect(maps.filter(row => row.loc.includes("/tests/explore/natal-chart"))).toHaveLength(26);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });

  it("fails closed at actual page, guide, metadata and image callers when core identity or content is damaged", async () => {
    for (const mutate of [
      (q: NatalChartQuestionnaire) => { q.natalChart.engine = "other" as never; },
      (q: NatalChartQuestionnaire) => { delete q.natalChart.bodyRoles[0]; },
      (q: NatalChartQuestionnaire) => { q.profiles[0].sections[2].paragraphs[0].zh = ""; },
    ]) {
      const damaged = structuredClone(quiz); mutate(damaged); vi.resetModules();
      vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => damaged }));
      try {
        const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), image = await import("@/app/og/fun/[slug]/route");
        for (const locale of ["en", "zh"] as const) {
          const args = { params: Promise.resolve({ locale, slug: quiz.slug }) }, params = { params: Promise.resolve({ locale, slug: quiz.slug, profile: "aries" }) };
          expect((await entry.generateMetadata(args)).robots).toMatchObject({ index: false }); expect((await guide.generateMetadata(params)).robots).toMatchObject({ index: false });
          await expect(entry.default(args)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/); await expect(guide.default(params)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          expect((await image.GET(new Request(`https://fermatmind.com/og/fun/natal-chart?locale=${locale}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
        }
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  });
});
