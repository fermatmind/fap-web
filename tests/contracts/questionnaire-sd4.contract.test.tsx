import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isSd4ConfigurationValid } from "@/lib/questionnaires/sd4";
import { scoreLikertQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireSd4Report } from "@/components/questionnaires/QuestionnaireSd4Report";
import { QuestionnaireSd4Client } from "@/components/questionnaires/QuestionnaireSd4Client";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/dark-tetrad-sd4.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/sd4-published-reference.json");
const reference = JSON.parse(bytes.toString()) as { items: { number: number; english: string; group: string }[]; anchors: string[]; subscaleOrder: string[]; reverseItems: number[]; originalRecallWindow: null; all28LexicallyEqual: boolean; licenseScope: string };
const unscored = (): QuestionnaireAnswers => Object.fromEntries(quiz.questions.map(q => [q.id, "na"]));

describe("Published SD4 28, separate from the owned Mini 18", () => {
  it("retains author English, order, anchors and four direct seven-item keys against the independently parsed source", () => {
    expect(isSd4ConfigurationValid(quiz)).toBe(true);
    expect(reference.items).toHaveLength(28); expect(reference.all28LexicallyEqual).toBe(true);
    expect(reference.reverseItems).toEqual([]); expect(reference.originalRecallWindow).toBeNull();
    expect(reference.licenseScope).toContain("inPublicDomain/withoutpermission");
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(reference.subscaleOrder);
    for (const [i, item] of reference.items.entries()) {
      const q = quiz.questions[i]; expect(q.id).toBe(`SD4_${String(item.number).padStart(3, "0")}`);
      expect(q.prompt.en).toBe(item.english); expect(q.reverse).toBe(false);
      expect(q.options.slice(0, 5).map(o => o.label.en)).toEqual(reference.anchors);
      expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
      expect(q.options.every(o => o.directionId === item.group)).toBe(true);
    }
    expect(quiz.questions[18].prompt.zh).toBe("我曾遇到过法律方面的麻烦。");
    expect(quiz.questions[24].prompt.zh).toBe("我喜欢观看暴力性体育运动。");
  });

  it("rejects a missing item, swapped group, reverse key, midpoint change or weakened seven-item completeness rule", () => {
    const cases: ((q: Questionnaire) => void)[] = [q => q.questions.pop(), q => { q.questions[7].options.forEach(o => { o.directionId = "machiavellianism"; }); }, q => { q.questions[1].reverse = true; }, q => { q.questions[0].options[2].label.en = "Uncertain"; }, q => { q.minimumRatedItems = 6; }, q => { q.directions.reverse(); }];
    for (const mutate of cases) { const q = structuredClone(quiz); mutate(q); expect(isSd4ConfigurationValid(q)).toBe(false); }
  });

  it("checks all 480 independent count/sum witnesses without imputing missing ratings", () => {
    let states = new Map<string, string[]>([["0|0", []]]);
    for (let i = 0; i < 7; i++) {
      const next = new Map<string, string[]>();
      for (const values of states.values()) for (const value of ["na", "1", "2", "3", "4", "5"]) {
        const v = [...values, value], rated = v.filter(x => x !== "na").length, sum = v.reduce((n, x) => n + (x === "na" ? 0 : Number(x)), 0);
        next.set(`${rated}|${sum}`, v);
      }
      states = next;
    }
    expect(states.size).toBe(120);
    for (const direction of reference.subscaleOrder) for (const [key, values] of states) {
      const answers = unscored(), [rated, sum] = key.split("|").map(Number);
      reference.items.filter(item => item.group === direction).forEach((item, i) => { answers[`SD4_${String(item.number).padStart(3, "0")}`] = values[i]; });
      const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("source witness rejected");
      expect(result.facets[direction]).toEqual({ sum, rated, total: 7, mean: rated === 7 ? Math.round(sum / 7 * 10) / 10 : null });
      for (const other of reference.subscaleOrder.filter(id => id !== direction)) expect(result.facets[other]).toEqual({ sum: 0, rated: 0, total: 7, mean: null });
      expect(result).not.toHaveProperty("total"); expect(result).not.toHaveProperty("profileId");
    }
    const partial = unscored(); delete partial.SD4_028;
    expect(scoreLikertQuestionnaire(quiz, partial).status).toBe("incomplete");
    expect(scoreLikertQuestionnaire(quiz, { ...unscored(), SD4_001: "unknown" }).status).toBe("invalid");
  });

  it("shows means from unrounded sums, withholding only incomplete subscales and keeping all32 full sections", () => {
    const answers = unscored(); quiz.questions.slice(0, 7).forEach(q => { answers[q.id] = "1"; }); answers.SD4_001 = "2";
    quiz.questions.slice(7, 14).forEach(q => { answers[q.id] = "3"; }); answers.SD4_014 = "na";
    const result = scoreLikertQuestionnaire(quiz, answers); if (result.status !== "complete") throw new Error("complete witness rejected");
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireSd4Report quiz={quiz} result={result} locale="en" />);
    expect(dom.querySelector('[data-sd4-facet="machiavellianism"] [data-sd4-mean]')?.textContent).toBe("1.14 / 5");
    expect(dom.querySelector('[data-sd4-facet="machiavellianism"] [data-sd4-sum]')?.textContent).toContain("8 / 7");
    expect(dom.querySelector('[data-sd4-facet="narcissism"] [data-sd4-mean]')?.textContent).toBe("Insufficient information");
    expect(dom.querySelectorAll("[data-sd4-profile] h4")).toHaveLength(32);
    for (const profile of quiz.profiles) for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph.en);
    const allNA = scoreLikertQuestionnaire(quiz, unscored()); if (allNA.status !== "complete") throw new Error("all-NA rejected");
    expect(renderToStaticMarkup(<QuestionnaireSd4Report quiz={quiz} result={allNA} locale="zh" />)).toContain("没有生成个人均值");
  });

  it("keeps a memory-only client and blocks public analytics at entry/guide paths", () => {
    const html = renderToStaticMarkup(<QuestionnaireSd4Client quiz={quiz} locale="en" />);
    expect(html).toContain("no quiz-flow statistics are sent"); expect(html).not.toContain('type="checkbox"');
    const source = readFileSync("components/questionnaires/QuestionnaireSd4Client.tsx", "utf8");
    expect(source).not.toMatch(/sessionStorage|localStorage|clipboard|recordEntertainmentActivity|useEntertainmentMetrics/);
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${locale}/tests/explore/${quiz.slug}${suffix}`)).toBe(true);
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });

  it("renders all10 public bilingual pages with published-version attribution, body, metadata and directory/sitemap visibility", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page");
      const maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const html = renderToStaticMarkup(await entry.default(props)); const dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.querySelector("[data-sd4-source]")).not.toBeNull();
        expect(dom.textContent).toContain(locale === "en" ? "Published SD4 28" : "SD4发表版28题"); expect(html).not.toContain('type="checkbox"');
        const directory = document.createElement("div"); directory.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
        expect(directory.querySelector(`a[href="${path}"]`)).not.toBeNull();
        for (const profile of quiz.profiles) {
          const publicPath = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) };
          const html = renderToStaticMarkup(await guide.default(gp)), meta = await guide.generateMetadata(gp); dom.innerHTML = html;
          expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); expect(dom.querySelector("[data-sd4-source]")).not.toBeNull();
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.title).toBe(profile.seo?.title[locale]);
          expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true);
          for (const section of profile.sections) for (const p of section.paragraphs) expect(dom.textContent).toContain(p[locale]);
          expect(dom.querySelector("[data-sd4-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
      }
      const walk = (x: unknown): void => { if (!x || typeof x !== "object") return; const o = x as Record<string, unknown>; if ("en" in o && "zh" in o) { expect(String(o.en)).not.toMatch(/\p{Script=Han}/u); expect(String(o.zh)).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(walk); };
      walk(quiz);
      for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.reduce((n, s) => n + s.paragraphs.map(p => p.en).join(" ").split(/\s+/).length, 0)).toBeGreaterThan(500); }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
