import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid, isLikertConfigurationValid, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/stress-check-in-test.json", "utf8")) as Questionnaire;

describe("Original monthly stress reflection actual registered callers and public identities", () => {
  it("registers the fixed source and maps real generic-form strings without the generic likert topology", async () => {
    const loaded = await loadQuestionnaire(quiz.slug); expect(loaded).toEqual(quiz);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(isLikertConfigurationValid(quiz)).toBe(false);
    for (const v of ["0", "2", "4"]) {
      const r = scoreQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(q => [q.id, v])));
      expect(r.status).toBe("complete"); expect("total" in r).toBe(true);
      expect(Object.keys(r)).toEqual(["status", "answered", "total", "contributions"]);
    }
  });
  it("emits both entries and two full guide pages with original body, unique SEO, fixed links and exact sitemap membership", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const maps = appendFunSitemapEntries([]); let count = 0;
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/stress-check-in-test`, args = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const m = await entry.generateMetadata(args), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(args));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.querySelector("#questionnaire-results")?.parentElement?.textContent).not.toMatch(/tied combination|并列组合/); expect(m.title).toBe(quiz.seoTitle[locale]); expect(m.description).toBe(quiz.description[locale]);
        if (locale === "en") { expect(dom.textContent).toContain("about 1 minute"); expect(dom.textContent).not.toContain("about 1 minutes"); }
        expect(m.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]);
        const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]'); expect(method?.querySelectorAll("p")).toHaveLength(8);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(method?.textContent).toContain(p[locale]);
        expect(method?.textContent).toContain(locale === "en" ? "Items one and three" : "第一、第三题");
        expect(method?.textContent).toContain(locale === "en" ? "fixed public guide title and URL" : "固定公开指南的标题与地址");
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        expect(maps.filter(e => e.loc === `https://fermatmind.com${path}`)).toHaveLength(1); count++;
        for (const p of quiz.profiles) {
          const publicPath = `${path}/results/${p.id}`, gargs = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) };
          const gmeta = await guide.generateMetadata(gargs); dom.innerHTML = renderToStaticMarkup(await guide.default(gargs));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(gmeta.title).toBe(p.seo!.title[locale]); expect(gmeta.description).toBe(p.seo!.description[locale]);
          expect(gmeta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
          expect(gmeta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/stress-check-in-test/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/stress-check-in-test/results/${p.id}` });
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          expect(dom.querySelector("[data-stress-check-in-total]")).toBeNull();
          expect(dom.querySelector(`a[href='${path}#take-test']`)).not.toBeNull();
          expect(maps.filter(e => e.loc === `https://fermatmind.com${publicPath}`)).toHaveLength(1);
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u); count++;
        }
      }
      expect(count).toBe(4);
      expect(maps.filter(e => e.loc.includes("/tests/explore/stress-check-in-test"))).toHaveLength(4);
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("fails closed at entry, guide metadata and image callers when the fixed original4 source is damaged", async () => {
    const faults: ((q: Questionnaire) => void)[] = [
      q => { q.questions[0].options[0].directionId = "OTHER"; }, q => { q.questions[0].reverse = true; }, q => { delete q.questions[1]; },
      q => { q.questions[0].options[0].score = 1; }, q => { q.profiles[0].sections[0].paragraphs[0].en = ""; },
    ];
    for (const fault of faults) {
      const damaged = structuredClone(quiz); fault(damaged);
      vi.resetModules(); vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => damaged }));
      try {
        const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), { GET } = await import("@/app/og/fun/[slug]/route");
        for (const locale of ["en", "zh"] as const) {
          const args = { params: Promise.resolve({ locale, slug: quiz.slug }) }, gargs = { params: Promise.resolve({ locale, slug: quiz.slug, profile: quiz.profiles[0].id }) };
          expect((await entry.generateMetadata(args)).robots).toMatchObject({ index: false }); expect((await guide.generateMetadata(gargs)).robots).toMatchObject({ index: false });
          await expect(entry.default(args)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/); await expect(guide.default(gargs)).rejects.toThrow(/NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK;404/);
          expect((await GET(new Request(`https://fermatmind.com/og/fun/stress-check-in-test?locale=${locale}`), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
        }
      } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
    }
  });
});
