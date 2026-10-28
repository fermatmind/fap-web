import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CATQ25_PART_KEYS, CATQ25_PARTS, CATQ25_REVERSE, isCatQ25ConfigurationValid, scoreCatQ25, type CatQ25Questionnaire } from "@/lib/questionnaires/catq25";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/masking-test.json", "utf8")) as CatQ25Questionnaire;
const fixed = (value = "4") => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
function complete(answers: unknown) { const x = scoreCatQ25(quiz, answers); if (x.status !== "complete") throw Error("Complete witness rejected"); return x.result; }
const reverse = new Set<number>([3, 12, 19, 22, 24]);

describe("original CAT-Q25 self-reflection edition", () => {
  it("binds original source order, seven anchors, reverse keys, attribution and all four complete bilingual readings", () => {
    expect(isCatQ25ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash({ directions: quiz.directions, questions: quiz.questions })).toBe(quiz.source.itemBankSha256);
    expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(CATQ25_REVERSE).toEqual([3, 12, 19, 22, 24]);
    expect(quiz.questions).toHaveLength(25);
    const keys = { compensation: [1, 4, 5, 8, 11, 14, 17, 20, 23], masking: [2, 6, 9, 12, 15, 18, 21, 24], assimilation: [3, 7, 10, 13, 16, 19, 22, 25] };
    expect(CATQ25_PART_KEYS).toEqual(keys);
    for (const [part, numbers] of Object.entries(keys)) for (const n of numbers) {
      expect(quiz.questions[n - 1].options.every(o => o.directionId === part)).toBe(true);
      expect(quiz.questions[n - 1].reverse).toBe(reverse.has(n));
    }
    expect(quiz.questions[0].options.map(o => [o.id, o.score])).toEqual([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["na", null]]);
    expect(quiz.questions[0].options[3].label).toEqual({ en: "Neither Agree nor Disagree", zh: "既不赞同，也不反对" });
    expect(quiz.questions[5].prompt.en).toContain("interested by"); expect(quiz.questions[14].prompt.en).toContain("interested by");
    expect(quiz.questions[1].prompt.en).toContain("monitor"); expect(quiz.questions[20].prompt.en).toContain("adjust");
    expect(quiz.questions[24].prompt.en).toContain("‘normal’");
    expect(quiz.instructions?.en).toBe("Please read each statement below and choose the answer that best fits your experiences during social interactions.");
    expect(quiz.catq25.attribution.en).toContain("CC BY 4.0"); expect(quiz.catq25.editionNotice.en).toContain("working translation");
    expect(quiz.profiles.map(p => p.id)).toEqual(["overall", "compensation", "masking", "assimilation"]);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(600);
      for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); }
    }
    expect(readFileSync("public/fonts/noto-sans-sc/masking-test-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("recomputes every response on every source item, including unequal part weighting", () => {
    for (let n = 1; n <= 25; n++) for (let value = 1; value <= 7; value++) {
      const answers = { ...fixed(), [`CATQ_${String(n).padStart(2, "0")}`]: String(value) };
      const result = complete(answers), expected = reverse.has(n) ? 8 - value : value;
      expect(result.total.sum).toBe(96 + expected); expect(result.total.mean).toBe((96 + expected) / 25);
      for (const id of CATQ25_PARTS) expect(result.parts[id].sum).toBe(CATQ25_PART_KEYS[id].includes(n as never) ? (CATQ25_PART_KEYS[id].length - 1) * 4 + expected : CATQ25_PART_KEYS[id].length * 4);
    }
    const mixed = fixed(); mixed.CATQ_01 = "5"; mixed.CATQ_02 = "3";
    expect(complete(mixed).total.sum).toBe(100);
    const unequal = Object.fromEntries(quiz.questions.map(q => [q.id, q.options[0].directionId === "compensation" ? "7" : q.reverse ? "7" : "1"]));
    const x = complete(unequal); expect(x.total.sum).toBe(79); expect(x.total.mean).toBe(79 / 25);
    expect(x.total.mean).not.toBe(Object.values(x.parts).reduce((s, p) => s + p.mean!, 0) / 3);
  });
  it("reaches both raw endpoints, and all-one/all-seven are not those endpoints", () => {
    expect(complete(fixed("1")).total.sum).toBe(55); expect(complete(fixed("7")).total.sum).toBe(145);
    expect(complete(fixed("1")).parts.masking.sum).toBe(20); expect(complete(fixed("7")).parts.masking.sum).toBe(44);
    expect(complete(fixed("1")).parts.assimilation.sum).toBe(26); expect(complete(fixed("7")).parts.assimilation.sum).toBe(38);
    for (const high of [false, true]) {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(reverse.has(i + 1) === high ? 1 : 7)]));
      const x = complete(answers); expect(x.total.sum).toBe(high ? 175 : 25); expect(x.total.mean).toBe(high ? 7 : 1);
      for (const id of CATQ25_PARTS) expect(x.parts[id].sum).toBe(CATQ25_PART_KEYS[id].length * (high ? 7 : 1));
    }
    expect(complete(fixed()).total).toEqual({ numericCount: 25, skippedCount: 0, requiredCount: 25, sum: 100, mean: 4 });
    expect(complete(fixed())).not.toHaveProperty("diagnosis"); expect(complete(fixed())).not.toHaveProperty("profileId");
  });
  it("withholds only the skipped part plus total; all-skip finishes without any numeric invention", () => {
    for (const q of quiz.questions) {
      const x = complete({ ...fixed(), [q.id]: "na" }), id = q.options[0].directionId;
      expect(x.total).toMatchObject({ numericCount: 24, skippedCount: 1, sum: null, mean: null });
      for (const part of CATQ25_PARTS) expect(x.parts[part].sum).toBe(part === id ? null : CATQ25_PART_KEYS[part].length * 4);
    }
    const all = complete(fixed("na"));
    for (const part of [all.total, ...Object.values(all.parts)]) { expect(part.sum).toBeNull(); expect(part.mean).toBeNull(); expect(part.numericCount).toBe(0); }
    expect(scoreCatQ25(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    const partial = fixed(); delete partial.CATQ_25; expect(scoreCatQ25(quiz, partial)).toEqual({ status: "incomplete", answered: 24 });
  });
  it("rejects malformed input and source drift, with no generic draft or one-choice fallback", () => {
    for (const value of [null, [], "4", Object.create({ CATQ_01: "4" }), { extra: "4" }, { CATQ_01: 4 }, { CATQ_01: undefined }, { CATQ_01: "" }, { CATQ_01: "0" }, { CATQ_01: "8" }, { CATQ_01: "4.0" }, { CATQ_01: null }, { ...fixed(), [Symbol("private")]: "4" }]) expect(scoreCatQ25(quiz, value).status).toBe("invalid");
    const mutations: ((q: CatQ25Questionnaire) => void)[] = [q => { q.questions[2].reverse = false; }, q => { q.questions[0].prompt.en += "."; }, q => { delete q.questions[3]; }, q => { q.questions[0].options[0].score = 0; }, q => { q.questions[0].options[7].score = 4; }, q => { q.questions[0].options[0].directionId = "masking"; }, q => { q.questions[0].options[3].label.en = "Neutral"; }, q => { q.profiles[0].sections[0].paragraphs.pop(); }, q => { q.profiles.pop(); }, q => { q.source.scoringVersion = "unknown"; }, q => { q.source.itemBankSha256 = "0".repeat(64); }, q => { q.catq25.editionNotice.zh = ""; }, q => { q.references!.pop(); }];
    for (const mutate of mutations) { const copy = structuredClone(quiz); mutate(copy); expect(isCatQ25ConfigurationValid(copy)).toBe(false); expect(scoreCatQ25(copy, fixed()).status).toBe("unavailable"); }
    expect(scoreQuestionnaire(quiz, fixed())).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: fixed() }))).toBeNull();
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const lang of ["en", "zh"]) for (const tail of ["", "/results/overall"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/masking-test${tail}?score=100`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/masking-test-other")).toBe(false);
  });
  it("renders every original reading, attribution, metadata, hreflang, hub and sitemap entry in both languages", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.catq25.attribution[locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/big-five-personality-test-ocean-model"]`)).not.toBeNull();
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(dom.textContent).toContain(quiz.catq25.attribution[locale]);
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-catq25-result]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "unknown" }) })).rejects.toThrow();
    } finally { vi.unstubAllEnvs(); }
  });
});
