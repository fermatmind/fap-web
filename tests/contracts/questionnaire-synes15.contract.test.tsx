import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SYNES15_TOPICS, isSynes15ConfigurationValid, scoreSynes15, type Synes15Questionnaire } from "@/lib/questionnaires/synes15";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/synesthesia-test.json", "utf8")) as Synes15Questionnaire;
const fixed = (value = "yes") => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
function complete(answers: unknown) { const x = scoreSynes15(quiz, answers); if (x.status !== "complete") throw Error("Complete witness rejected"); return x.result; }

describe("original synes15 literal experience record", () => {
  it("binds original bilingual descriptions and all five full guides without a measurement claim", () => {
    expect(isSynes15ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(15); expect(quiz.questions.every(q => q.reverse === false)).toBe(true);
    expect(quiz.profiles.map(p => p.id)).toEqual(SYNES15_TOPICS);
    expect(quiz.questions[0].options.map(o => [o.id, o.score])).toEqual([["yes", 1], ["no", 0], ["unsure", null], ["na", null]]);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(500);
      for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); }
    }
    expect(quiz.synes15.editionNotice.en).toContain("Not validated"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(readFileSync("public/fonts/noto-sans-sc/synesthesia-test-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("independently preserves all 4^3 response vectors in all five families and every chosen item", () => {
    const choices = ["yes", "no", "unsure", "na"];
    for (const [index, id] of SYNES15_TOPICS.entries()) for (let code = 0; code < 64; code++) {
      let cursor = code; const answers = fixed(), expected = { yes: 0, no: 0, unsure: 0, na: 0 }, responses: { questionId: string; choice: string }[] = [];
      for (let j = 0; j < 3; j++) {
        const choice = choices[cursor % 4] as keyof typeof expected; cursor = Math.floor(cursor / 4);
        const questionId = `SYX_${String(index * 3 + j + 1).padStart(2, "0")}`;
        answers[questionId] = choice; expected[choice]++; responses.push({ questionId, choice });
      }
      const result = complete(answers);
      expect(result[id]).toEqual({ counts: expected, responses, requiredCount: 3 });
      expect(Object.values(result[id].counts).reduce((a, b) => a + b, 0)).toBe(3);
      for (const other of SYNES15_TOPICS.filter(x => x !== id)) expect(result[other].counts).toEqual({ yes: 3, no: 0, unsure: 0, na: 0 });
    }
  });
  it("finishes all-yes, all-no, all-uncertain and all-skip without a total, strength or classification", () => {
    for (const choice of ["yes", "no", "unsure", "na"] as const) {
      const result = complete(fixed(choice)); expect(Object.keys(result)).toEqual(SYNES15_TOPICS);
      for (const part of Object.values(result)) {
        expect(part.counts).toEqual(Object.fromEntries(["yes", "no", "unsure", "na"].map(x => [x, x === choice ? 3 : 0])));
        expect(part.responses.every(x => x.choice === choice)).toBe(true);
        expect(Object.keys(part).sort()).toEqual(["counts", "requiredCount", "responses"]);
      }
    }
    expect(scoreSynes15(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
    const partial = fixed(); delete partial.SYX_15; expect(scoreSynes15(quiz, partial)).toEqual({ status: "incomplete", answered: 14 });
  });
  it("rejects malformed and hidden responses or edition drift; generic scores and persistent drafts remain unavailable", () => {
    for (const input of [null, [], "yes", Object.create({ SYX_01: "yes" }), { extra: "yes" }, { SYX_01: 1 }, { SYX_01: undefined }, { SYX_01: "" }, { SYX_01: "0" }, { SYX_01: "YES" }, { SYX_01: "2.0" }, { SYX_01: null }, { ...fixed(), [Symbol("private")]: "yes" }]) expect(scoreSynes15(quiz, input).status).toBe("invalid");
    const mutations: ((q: Synes15Questionnaire) => void)[] = [q => { q.questions[0].reverse = true; }, q => { q.questions[0].prompt.en += "."; }, q => { q.questions[0].prompt.zh += "。"; }, q => { delete q.questions[3]; }, q => { q.questions[0].options[0].score = 0; }, q => { q.questions[0].options[2].score = 0; }, q => { q.questions[0].options[0].directionId = "personification"; }, q => { q.questions[0].options[3].label.en = "Agree"; }, q => { q.profiles[0].sections[0].paragraphs.pop(); }, q => { q.profiles.pop(); }, q => { q.source.scoringVersion = "unknown"; }, q => { q.source.itemBankSha256 = "0".repeat(64); }, q => { q.synes15.editionNotice.zh = ""; }, q => { q.references!.pop(); }];
    for (const mutate of mutations) { const copy = structuredClone(quiz); mutate(copy); expect(isSynes15ConfigurationValid(copy)).toBe(false); expect(scoreSynes15(copy, fixed()).status).toBe("unavailable"); }
    expect(scoreQuestionnaire(quiz, fixed())).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: fixed() }))).toBeNull();
  });
  it("requires private action opt-in and suppresses ordinary page analytics for entries and guides only", () => {
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const lang of ["en", "zh"]) for (const tail of ["", "/results/symbol-color"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/synesthesia-test${tail}?score=9`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/synesthesia-test-other")).toBe(false);
  });
  it("renders every guide paragraph and matching metadata, canonical, hreflang, hub and sitemap in both languages", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.synes15.attribution[locale]);
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/big-five-personality-test-ocean-model"]`)).not.toBeNull();
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(dom.textContent).toContain(quiz.synes15.attribution[locale]);
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-synes15-result]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "unknown" }) })).rejects.toThrow();
    } finally { vi.unstubAllEnvs(); }
  });
});
