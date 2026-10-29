import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DVMSQ18_GUIDES, isDvmsq18ConfigurationValid, scoreDvmsq18, type Dvmsq18Questionnaire } from "@/lib/questionnaires/dvmsq18";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/misophonia-screener.json", "utf8")) as Dvmsq18Questionnaire;
const id = (n: number) => `DV_${String(n).padStart(2, "0")}`;
const symptom = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11], impairment = [12, 13, 14, 15, 16, 17, 18];
const fixed = (value = "2") => ({ DV_S1: "yes", ...Object.fromEntries(Array.from({ length: 18 }, (_, i) => [id(i + 1), value])) });
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
function complete(answers: unknown) { const x = scoreDvmsq18(quiz, answers); if (x.status !== "complete") throw Error("Complete witness rejected"); return x.result; }
function independent(answers: Record<string, string>) {
  const part = (nums: number[]) => { const values = nums.map(n => answers[id(n)]).filter(x => x !== "na").map(Number); return { rated: values.length, skipped: nums.length - values.length, required: nums.length, maximum: nums.length * 4, sum: values.length === nums.length ? values.reduce((a, b) => a + b, 0) : null }; };
  const a = part(symptom), b = part(impairment); return { parts: { symptom: a, impairment: b }, total: a.sum !== null && b.sum !== null ? a.sum + b.sum : null };
}
describe("DVMSQ v1.5 gated source-form raw scoring adaptation", () => {
  it("binds all19 bilingual source/adapted prompts, anchors, source-version rights and three full guides", () => {
    expect(isDvmsq18ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(19); expect(quiz.profiles.map(p => p.id)).toEqual(DVMSQ18_GUIDES);
    expect(quiz.questions.every(q => q.reverse === false)).toBe(true);
    expect(quiz.questions[0].options.map(o => o.id)).toEqual(["yes", "no", "unsure", "na"]);
    expect(quiz.questions[1].options.map(o => [o.id, o.score])).toEqual([["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["na", null]]);
    expect(quiz.questions[3].options[0].directionId).toBe("fear-unscored");
    expect(quiz.dvmsq18.attribution.en).toContain("Copyright © 2022 Zachary J. Williams."); expect(quiz.dvmsq18.attribution.en).toContain("CC BY-SA 4.0");
    expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true);
      expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(500);
      for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); }
    }
    expect(readFileSync("public/fonts/noto-sans-sc/misophonia-screener-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("retains the source early-no zero and added uncertain/decline exits, without unadministered subscores", () => {
    for (const gate of ["no", "unsure", "na"]) {
      const x = scoreDvmsq18(quiz, { DV_S1: gate }); expect(x.status).toBe("complete");
      expect(complete({ DV_S1: gate })).toEqual({ gate, total: gate === "no" ? 0 : null, parts: null, responses: [{ questionId: "DV_S1", choice: gate }] });
      expect(scoreDvmsq18(quiz, { DV_S1: gate, DV_01: "0" }).status).toBe("invalid");
    }
    expect(scoreDvmsq18(quiz, {}).status).toBe("incomplete"); expect(scoreDvmsq18(quiz, { DV_S1: "yes" })).toEqual({ status: "incomplete", answered: 1 });
    expect(scoreDvmsq18(quiz, { DV_01: "0" }).status).toBe("invalid");
  });
  it("independently recomputes each item’s six choices, excluded fear, partial sums and all-skip", () => {
    for (let n = 1; n <= 18; n++) for (const choice of ["0", "1", "2", "3", "4", "na"]) {
      const answers = { ...fixed(), [id(n)]: choice }, x = complete(answers), expected = independent(answers);
      expect(x.parts).toEqual(expected.parts); expect(x.total).toBe(expected.total);
      expect(x.responses).toHaveLength(19); expect(x.responses[n]).toEqual({ questionId: id(n), choice });
      if (n === 3) expect(x.total).toBe(34);
    }
    for (const value of ["0", "2", "4", "na"]) {
      const x = complete(fixed(value)), expected = independent(fixed(value)); expect(x.parts).toEqual(expected.parts); expect(x.total).toBe(expected.total);
      expect(Object.keys(x).sort()).toEqual(["gate", "parts", "responses", "total"]);
    }
    const missing = fixed(); delete (missing as Record<string, string>).DV_18; expect(scoreDvmsq18(quiz, missing)).toEqual({ status: "incomplete", answered: 18 });
  });
  it("reaches every raw total0..68 with source-key witnesses, not an exhaustive18-answer-sheet or clinical validation claim", () => {
    for (let total = 0; total <= 68; total++) {
      const answers = fixed("0"); let remaining = total;
      for (const n of [...symptom, ...impairment]) { const value = Math.min(4, remaining); (answers as Record<string, string>)[id(n)] = String(value); remaining -= value; }
      expect(remaining).toBe(0); const x = complete(answers); expect(x.total).toBe(total); expect(x.parts).toEqual(independent(answers).parts);
    }
  });
  it("rejects malformed/hidden answers and source drift; generic scoring and drafts remain disabled", () => {
    for (const input of [null, [], "yes", Object.create({ DV_S1: "yes" }), { DV_S1: "YES" }, { DV_S1: null }, { DV_S1: 1 }, { DV_S1: "yes", DV_01: undefined }, { DV_S1: "yes", DV_01: "5" }, { DV_S1: "yes", DV_01: "-1" }, { DV_S1: "yes", DV_01: "2.0" }, { DV_S1: "yes", extra: "0" }, { ...fixed(), [Symbol("hidden")]: "2" }]) expect(scoreDvmsq18(quiz, input).status).toBe("invalid");
    const mutations: ((q: Dvmsq18Questionnaire) => void)[] = [q => { q.questions[0].prompt.en += "."; }, q => { q.questions[3].reverse = true; }, q => { delete q.questions[2]; }, q => { q.questions[3].options[0].directionId = "symptom"; }, q => { q.questions[1].options[5].score = 0; }, q => { q.questions[12].options[3].label.en = "Often"; }, q => { q.dvmsq18.interferenceContext.en = "In the past month"; }, q => { q.dvmsq18.gateClarification.zh = "任意声音"; }, q => { q.dvmsq18.attribution.en = "Copyright removed"; }, q => { q.profiles[0].sections.pop(); }, q => { q.source.itemBankSha256 = "0".repeat(64); }, q => { q.references!.pop(); }];
    for (const mutate of mutations) { const q = structuredClone(quiz); mutate(q); expect(isDvmsq18ConfigurationValid(q)).toBe(false); expect(scoreDvmsq18(q, fixed()).status).toBe("unavailable"); }
    expect(scoreQuestionnaire(quiz, fixed())).toEqual({ status: "unavailable", answered: 0 }); expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: fixed() }))).toBeNull();
  });
  it("suppresses ordinary entry/guide analytics and requires explicit opt-in for bounded actions", () => {
    expect(entertainmentActivityCatalog.find(x => x.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
    for (const l of ["en", "zh"]) for (const tail of ["", "/results/overall"]) expect(isAnalyticsDisabledQuestionnaireUrl(`/${l}/tests/explore/${quiz.slug}${tail}`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/misophonia-screener-other")).toBe(false);
  });
  it("renders every guide paragraph and matching metadata, canonical, hreflang, hub and sitemap in both languages", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    try {
      const entry = await import("@/components/questionnaires/QuestionnairePage"), guide = await import("@/components/questionnaires/QuestionnaireGuide"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const base = `/${locale}/tests/explore/${quiz.slug}`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) };
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.dvmsq18.attribution[locale]); expect(dom.querySelector('a[href="https://creativecommons.org/licenses/by-sa/4.0/"]')).not.toBeNull();
        for (const s of quiz.guide) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        for (const f of quiz.faq) expect(dom.textContent).toContain(f.answer[locale]);
        const meta = await entry.generateMetadata(props); expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/explore/sensory-processing-test"]`)).not.toBeNull();
        expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${base}"`);
        for (const p of quiz.profiles) {
          const props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, path = `${base}/results/${p.id}`;
          dom.innerHTML = renderToStaticMarkup(await guide.default(props));
          expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(dom.textContent).toContain(quiz.dvmsq18.attribution[locale]); expect(dom.querySelector('a[href="https://creativecommons.org/licenses/by-sa/4.0/"]')).not.toBeNull();
          for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
          const meta = await guide.generateMetadata(props); expect(meta.title).toBe(p.seo?.title[locale]); expect(meta.description).toBe(p.seo?.description[locale]);
          expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
          expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}` });
          expect(maps.filter(x => x.loc === `https://fermatmind.com${path}`)).toHaveLength(1);
          expect(dom.querySelector("[data-dvmsq18-result]")).toBeNull();
          if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
        }
        expect(maps.filter(x => x.loc === `https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({ params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "unknown" }) })).rejects.toThrow();
    } finally { vi.unstubAllEnvs(); }
  });
});
