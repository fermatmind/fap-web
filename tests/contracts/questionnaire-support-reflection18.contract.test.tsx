import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/considering-support-reflection.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isSupportReflection18ConfigurationValid, recordSupportReflection18, supportReflectionCategories } from "../../lib/questionnaires/supportReflection18";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { SupportReflectionReport, SupportReflectionSupport } from "../../components/questionnaires/SupportReflectionReport";
import { SupportReflectionPage, SupportReflectionGuidePage } from "../../components/questionnaires/SupportReflectionPage";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
import { SITE_URL } from "../../lib/site";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (value: unknown) => {
  const result = recordSupportReflection18(quiz, value); expect(result.status).toBe("complete");
  if (result.status !== "complete") throw Error("Expected complete categories");
  return result.records;
};
describe("Original support consideration categories without a readiness or clinical verdict", () => {
  it("binds eighteen original statements and four complete bilingual guides", () => {
    expect(isSupportReflection18ConfigurationValid(quiz)).toBe(true);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [field, body] of [["itemBankSha256", quiz.questions], ["resultContentSha256", quiz.profiles]] as const) expect(quiz.source[field]).toBe(createHash("sha256").update(JSON.stringify(body)).digest("hex"));
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(18);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([4, 4, 5, 5]);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(6); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); const paras = p.sections.flatMap(s => s.paragraphs);
      expect(paras).toHaveLength(14); expect(paras.every(p => p.en.trim() && p.zh.trim())).toBe(true);
      expect(paras.map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(900);
    }
  });
  it("records all six labels separately in their own four/five denominators without points", () => {
    for (const c of supportReflectionCategories) for (const [i, r] of complete(answers(c.id)).entries()) {
      const n = [4, 4, 5, 5][i];
      expect(r.counts[c.id]).toBe(n); expect(Object.values(r.counts).reduce((a, b) => a + b)).toBe(n);
      expect(r.observations).toHaveLength(n); expect(r.observations.every(o => o.category === c.id)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
    }
    expect(scoreQuestionnaire(quiz, answers("fits"))).toEqual({ status: "unavailable", answered: 0 });
  });
  it("retains exact per-item labels through all uneven theme boundaries", () => {
    const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, supportReflectionCategories[i % 6].id]));
    const result = complete(a);
    expect(result.map(r => Object.values(r.counts))).toEqual([[1,1,1,1,0,0],[1,1,0,0,1,1],[1,0,1,1,1,1],[0,1,1,1,1,1]]);
    expect(result.map(r => r.observations.map(o => o.questionId))).toEqual([
      ["SUP_01","SUP_02","SUP_03","SUP_04"], ["SUP_05","SUP_06","SUP_07","SUP_08"],
      ["SUP_09","SUP_10","SUP_11","SUP_12","SUP_13"], ["SUP_14","SUP_15","SUP_16","SUP_17","SUP_18"],
    ]);
    for (const r of result) for (const o of r.observations) expect(o.category).toBe(a[o.questionId]);
    const missing = answers("not-now"); delete missing.SUP_18;
    expect(recordSupportReflection18(quiz, missing)).toEqual({ status: "incomplete", answered: 17 });
    expect(recordSupportReflection18(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
  });
  it("rejects numeric points, fabricated categories, keys and malformed method boundaries", () => {
    for (const a of [null, [], "fits", 4, { ...answers("fits"), SUP_01: 0 }, { ...answers("fits"), SUP_01: "0" }, { ...answers("fits"), unknown: "fits" }]) expect(recordSupportReflection18(quiz, a).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { q.version = "other"; },
      (q: Questionnaire) => { q.source.scoringVersion = "readiness_tier"; },
      (q: Questionnaire) => { q.directions[0].itemCount = 5; },
      (q: Questionnaire) => { q.questions[4].options[0].directionId = "concerns-carried"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions[0].options[3].directionId = "concerns-carried"; },
      (q: Questionnaire) => { q.questions[0].options[3].label.en = "Sometimes"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.minimumRatedItems = 4; },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isSupportReflection18ConfigurationValid(bad)).toBe(false); expect(recordSupportReflection18(bad, answers("fits"))).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("shows all responses and three distinct unknown categories with support always visible", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const category of supportReflectionCategories) {
        const html = renderToStaticMarkup(<SupportReflectionReport quiz={quiz} records={complete(answers(category.id))} locale={locale} />);
        expect((html.match(/data-support-reflection-theme=/g) ?? [])).toHaveLength(4);
        expect((html.match(/data-support-reflection-observation=/g) ?? [])).toHaveLength(18);
        expect((html.match(/data-support-reflection-unscored=/g) ?? [])).toHaveLength(["unsure", "na", "withheld"].includes(category.id) ? 4 : 0);
        expect(html).toContain("data-support-reflection-support"); expect(html).toContain(locale === "zh" ? "没有总分" : "no total");
      }
      const support = renderToStaticMarkup(<SupportReflectionSupport locale={locale} />);
      expect(support).toContain(locale === "zh" ? "不必完成练习" : "No completion or count is required");
    }
  });
  it("makes all fifty-six paragraphs public before answers and on their own guide pages", () => {
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<SupportReflectionPage quiz={quiz} locale={locale} />);
      expect((html.match(/data-support-reflection-full-guide=/g) ?? [])).toHaveLength(4); expect(html).not.toContain("data-support-reflection-result");
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
      for (const p of quiz.profiles) {
        const guide = renderToStaticMarkup(<SupportReflectionGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(guide).toContain("data-support-reflection-support");
        for (const s of p.sections) for (const t of s.paragraphs) { const encoded = renderToStaticMarkup(<p>{t[locale]}</p>).slice(3,-4); expect(html).toContain(encoded); expect(guide).toContain(encoded); }
      }
    }
  });
  it("loads exact identity, publishes ten ENZH URLs and disables analytics on every page", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz); const map = appendFunSitemapEntries([]);
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) {
      const path = `/${locale}/tests/explore/${quiz.slug}${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(path)).toBe(true); expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);
      expect(map.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
    }
    expect(entertainmentActivityCatalog.find(c => c.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });
  it("binds entry and guide metadata to public locale pairs", async () => {
    const page = await import("../../components/questionnaires/QuestionnairePage"); const guide = await import("../../components/questionnaires/QuestionnaireGuide");
    for (const locale of ["en", "zh"]) {
      const root = `/${locale}/tests/explore/${quiz.slug}`;
      const entry = await page.generateMetadata({ params: Promise.resolve({ locale, slug: quiz.slug }) }); expect(entry.alternates?.canonical).toBe(`${SITE_URL}${root}`);
      for (const p of quiz.profiles) {
        const m = await guide.generateMetadata({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) });
        expect(m.alternates?.canonical).toBe(`${SITE_URL}${root}/results/${p.id}`);
        expect(m.alternates?.languages?.en).toBe(`${SITE_URL}/en/tests/explore/${quiz.slug}/results/${p.id}`);
        expect(m.alternates?.languages?.["zh-CN"]).toBe(`${SITE_URL}/zh/tests/explore/${quiz.slug}/results/${p.id}`);
      }
    }
  });
});
