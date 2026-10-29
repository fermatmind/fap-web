import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ANGER20_TOPICS, isAnger20ConfigurationValid, scoreAnger20, type Anger20Questionnaire } from "@/lib/questionnaires/anger20";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/anger-issues-screener.json", "utf8")) as Anger20Questionnaire;
const fixed = (value = "2") => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
function complete(answers: unknown) { const x = scoreAnger20(quiz, answers); if (x.status !== "complete") throw Error("Complete witness rejected"); return x.result; }

describe("original anger20 anger-response reflection", () => {
  it("binds original bilingual items, direct anchors and all four full guides without claiming the professional STAXI-2", () => {
    expect(isAnger20ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(20); expect(quiz.questions.every(q => q.reverse === false)).toBe(true);
    expect(quiz.profiles.map(p => p.id)).toEqual(ANGER20_TOPICS);
    expect(quiz.questions[0].options.map(o => [o.id, o.score])).toEqual([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["na", null]]);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(500);
      for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); }
    }
    expect(quiz.anger20.editionNotice.en).toContain("Not validated"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(readFileSync("public/fonts/noto-sans-sc/anger-issues-screener-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("independently recomputes all 6^5 response vectors in each topic, including zero and explicit NA", () => {
    const choices = ["0", "1", "2", "3", "4", "na"];
    for (const [index, id] of ANGER20_TOPICS.entries()) for (let code = 0; code < 7776; code++) {
      let cursor = code; const answers = fixed(), numeric: number[] = [];
      for (let j = 0; j < 5; j++) { const value = choices[cursor % 6]; cursor = Math.floor(cursor / 6); answers[`ANG_${String(index * 5 + j + 1).padStart(2, "0")}`] = value; if (value !== "na") numeric.push(Number(value)); }
      const result = complete(answers), sum = numeric.reduce((a, b) => a + b, 0);
      expect(result[id]).toEqual({ numericCount: numeric.length, skippedCount: 5 - numeric.length, requiredCount: 5, sum: numeric.length === 5 ? sum : null, mean: numeric.length === 5 ? sum / numeric.length : null });
      for (const other of ANGER20_TOPICS.filter(x => x !== id)) expect(result[other].sum).toBe(10);
    }
  });
  it("reaches all numeric endpoints without totals, winners, bands or scores for all-skip", () => {
    for (const value of ["0", "2", "4"]) for (const x of Object.values(complete(fixed(value)))) { expect(x.sum).toBe(Number(value) * 5); expect(x.mean).toBe(Number(value)); }
    for (const x of Object.values(complete(fixed("na")))) expect(x).toEqual({ numericCount: 0, skippedCount: 5, requiredCount: 5, sum: null, mean: null });
    const example = fixed(); example.ANG_01 = "1"; example.ANG_02 = "2"; example.ANG_03 = "2"; example.ANG_04 = "2";
    expect(complete(example)["anger-occurrence"]).toMatchObject({ sum: 9, mean: 9 / 5, numericCount: 5 });
    const noAnger = Object.fromEntries(quiz.questions.map((q, i) => [q.id, i < 5 ? "0" : "na"]));
    expect(complete(noAnger)["anger-occurrence"].sum).toBe(0);
    for (const id of ANGER20_TOPICS.slice(1)) expect(complete(noAnger)[id]).toMatchObject({ numericCount: 0, skippedCount: 5, sum: null, mean: null });
    expect(Object.keys(complete(fixed()))).toEqual(ANGER20_TOPICS);
    expect(scoreAnger20(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    const partial = fixed(); delete partial.ANG_20; expect(scoreAnger20(quiz, partial)).toEqual({ status: "incomplete", answered: 19 });
  });
  it("rejects malformed responses, hidden keys and edition drift, without a generic score or draft", () => {
    for (const input of [null, [], "2", Object.create({ ANG_01: "2" }), { extra: "2" }, { ANG_01: 2 }, { ANG_01: undefined }, { ANG_01: "" }, { ANG_01: "-1" }, { ANG_01: "5" }, { ANG_01: "2.0" }, { ANG_01: null }, { ...fixed(), [Symbol("private")]: "2" }]) expect(scoreAnger20(quiz, input).status).toBe("invalid");
    const mutations: ((q: Anger20Questionnaire) => void)[] = [q => { q.questions[0].reverse = true; }, q => { q.questions[0].prompt.en += "."; }, q => { q.questions[0].prompt.zh += "。"; }, q => { delete q.questions[3]; }, q => { q.questions[0].options[0].score = 1; }, q => { q.questions[0].options[5].score = 0; }, q => { q.questions[0].options[0].directionId = "outward-expression"; }, q => { q.questions[0].options[3].label.en = "Agree"; }, q => { q.profiles[0].sections[0].paragraphs.pop(); }, q => { q.profiles.pop(); }, q => { q.source.scoringVersion = "unknown"; }, q => { q.source.itemBankSha256 = "0".repeat(64); }, q => { q.anger20.editionNotice.zh = ""; }, q => { q.references!.pop(); }];
    for (const mutate of mutations) { const copy = structuredClone(quiz); mutate(copy); expect(isAnger20ConfigurationValid(copy)).toBe(false); expect(scoreAnger20(copy, fixed()).status).toBe("unavailable"); }
    expect(scoreQuestionnaire(quiz, fixed())).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: fixed() }))).toBeNull();
  });
  it("requires private action opt-in and suppresses ordinary page analytics for entries and guides only", () => {
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const lang of ["en", "zh"]) for (const tail of ["", "/results/anger-occurrence"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/anger-issues-screener${tail}?score=9`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/anger-issues-screener-other")).toBe(false);
  });
  it("renders every guide paragraph and matching metadata, canonical, hreflang, hub and sitemap in both languages", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.anger20.attribution[locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/eq-test-emotional-intelligence-assessment"]`)).not.toBeNull();
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(dom.textContent).toContain(quiz.anger20.attribution[locale]);
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-anger20-result]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "unknown" }) })).rejects.toThrow();
    } finally { vi.unstubAllEnvs(); }
  });
});
