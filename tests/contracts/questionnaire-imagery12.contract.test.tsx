import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { IMAGERY12_TOPICS, isImagery12ConfigurationValid, scoreImagery12, type Imagery12Questionnaire } from "@/lib/questionnaires/imagery12";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/aphantasia-test.json", "utf8")) as Imagery12Questionnaire;
const fixed = (value = "2") => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
function complete(answers: unknown) { const x = scoreImagery12(quiz, answers); if (x.status !== "complete") throw Error("Complete witness rejected"); return x.result; }

describe("original imagery12 voluntary visual self-observation", () => {
  it("binds original bilingual items, direct anchors and all four full guides without claiming VVIQ", () => {
    expect(isImagery12ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(12); expect(quiz.questions.every(q => q.reverse === false)).toBe(true);
    expect(quiz.profiles.map(p => p.id)).toEqual(IMAGERY12_TOPICS);
    expect(quiz.questions[0].options.map(o => [o.id, o.score])).toEqual([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["na", null]]);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(500);
      for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); }
    }
    expect(quiz.imagery12.editionNotice.en).toContain("Not VVIQ"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(readFileSync("public/fonts/noto-sans-sc/aphantasia-test-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("independently recomputes all 6^3 response vectors in each topic, including zero and explicit NA", () => {
    const choices = ["0", "1", "2", "3", "4", "na"];
    for (const [index, id] of IMAGERY12_TOPICS.entries()) for (let code = 0; code < 216; code++) {
      let cursor = code; const answers = fixed(), numeric: number[] = [];
      for (let j = 0; j < 3; j++) { const value = choices[cursor % 6]; cursor = Math.floor(cursor / 6); answers[`IMG_${String(index * 3 + j + 1).padStart(2, "0")}`] = value; if (value !== "na") numeric.push(Number(value)); }
      const result = complete(answers), sum = numeric.reduce((a, b) => a + b, 0);
      expect(result[id]).toEqual({ numericCount: numeric.length, skippedCount: 3 - numeric.length, requiredCount: 3, sum: numeric.length === 3 ? sum : null, mean: numeric.length === 3 ? sum / numeric.length : null });
      for (const other of IMAGERY12_TOPICS.filter(x => x !== id)) expect(result[other].sum).toBe(6);
    }
  });
  it("reaches all numeric endpoints without totals, winners, bands or scores for all-skip", () => {
    for (const value of ["0", "2", "4"]) for (const x of Object.values(complete(fixed(value)))) { expect(x.sum).toBe(Number(value) * 3); expect(x.mean).toBe(Number(value)); }
    for (const x of Object.values(complete(fixed("na")))) expect(x).toEqual({ numericCount: 0, skippedCount: 3, requiredCount: 3, sum: null, mean: null });
    const example = fixed(); example.IMG_01 = "1"; example.IMG_02 = "2"; example.IMG_03 = "2";
    expect(complete(example).objects).toMatchObject({ sum: 5, mean: 5 / 3, numericCount: 3 });
    expect(Object.keys(complete(fixed()))).toEqual(IMAGERY12_TOPICS);
    expect(scoreImagery12(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    const partial = fixed(); delete partial.IMG_12; expect(scoreImagery12(quiz, partial)).toEqual({ status: "incomplete", answered: 11 });
  });
  it("rejects malformed responses, hidden keys and edition drift, without a generic score or draft", () => {
    for (const input of [null, [], "2", Object.create({ IMG_01: "2" }), { extra: "2" }, { IMG_01: 2 }, { IMG_01: undefined }, { IMG_01: "" }, { IMG_01: "-1" }, { IMG_01: "5" }, { IMG_01: "2.0" }, { IMG_01: null }, { ...fixed(), [Symbol("private")]: "2" }]) expect(scoreImagery12(quiz, input).status).toBe("invalid");
    const mutations: ((q: Imagery12Questionnaire) => void)[] = [q => { q.questions[0].reverse = true; }, q => { q.questions[0].prompt.en += "."; }, q => { q.questions[0].prompt.zh += "。"; }, q => { delete q.questions[3]; }, q => { q.questions[0].options[0].score = 1; }, q => { q.questions[0].options[5].score = 0; }, q => { q.questions[0].options[0].directionId = "faces"; }, q => { q.questions[0].options[3].label.en = "Agree"; }, q => { q.profiles[0].sections[0].paragraphs.pop(); }, q => { q.profiles.pop(); }, q => { q.source.scoringVersion = "unknown"; }, q => { q.source.itemBankSha256 = "0".repeat(64); }, q => { q.imagery12.editionNotice.zh = ""; }, q => { q.references!.pop(); }];
    for (const mutate of mutations) { const copy = structuredClone(quiz); mutate(copy); expect(isImagery12ConfigurationValid(copy)).toBe(false); expect(scoreImagery12(copy, fixed()).status).toBe("unavailable"); }
    expect(scoreQuestionnaire(quiz, fixed())).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: fixed() }))).toBeNull();
  });
  it("requires private action opt-in and suppresses ordinary page analytics for entries and guides only", () => {
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const lang of ["en", "zh"]) for (const tail of ["", "/results/objects"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/aphantasia-test${tail}?score=9`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/aphantasia-test-other")).toBe(false);
  });
  it("renders every guide paragraph and matching metadata, canonical, hreflang, hub and sitemap in both languages", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.imagery12.attribution[locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/big-five-personality-test-ocean-model"]`)).not.toBeNull();
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(dom.textContent).toContain(quiz.imagery12.attribution[locale]);
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-imagery12-result]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "unknown" }) })).rejects.toThrow();
    } finally { vi.unstubAllEnvs(); }
  });
});
