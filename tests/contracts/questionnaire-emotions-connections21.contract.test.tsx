import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/emotions-connections-reflection.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isEmotionsConnections21ConfigurationValid, recordEmotionsConnections21, emotionsConnectionsCategories } from "../../lib/questionnaires/emotionsConnections21";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { EmotionsConnectionsReport, EmotionsConnectionsSupport } from "../../components/questionnaires/EmotionsConnectionsReport";
import { EmotionsConnectionsPage, EmotionsConnectionsGuidePage } from "../../components/questionnaires/EmotionsConnectionsPage";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
import { SITE_URL } from "../../lib/site";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (value: unknown) => {
  const result = recordEmotionsConnections21(quiz, value); expect(result.status).toBe("complete");
  if (result.status !== "complete") throw Error("Expected complete categories");
  return result.records;
};
describe("Original emotions and connections descriptions without scores or clinical verdicts", () => {
  it("binds twenty-one original statements and seven complete bilingual guides", () => {
    expect(isEmotionsConnections21ConfigurationValid(quiz)).toBe(true);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [field, body] of [["itemBankSha256", { directions: quiz.directions, questions: quiz.questions }], ["resultContentSha256", quiz.profiles]] as const) expect(quiz.source[field]).toBe(createHash("sha256").update(JSON.stringify(body)).digest("hex"));
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(21);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([3, 3, 3, 3, 3, 3, 3]);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(6); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); const paras = p.sections.flatMap(s => s.paragraphs);
      expect(paras).toHaveLength(8); expect(paras.every(p => p.en.trim() && p.zh.trim())).toBe(true);
      expect(paras.map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400);
    }
  });
  it("records all six labels separately in their own seven denominators without points", () => {
    for (const c of emotionsConnectionsCategories) for (const [i, r] of complete(answers(c.id)).entries()) {
      const n = [3, 3, 3, 3, 3, 3, 3][i];
      expect(r.counts[c.id]).toBe(n); expect(Object.values(r.counts).reduce((a, b) => a + b)).toBe(n);
      expect(r.observations).toHaveLength(n); expect(r.observations.every(o => o.category === c.id)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
    }
    expect(scoreQuestionnaire(quiz, answers("fits"))).toEqual({ status: "unavailable", answered: 0 });
  });
  it("retains exact per-item labels through all three-item theme boundaries", () => {
    const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, emotionsConnectionsCategories[i % 6].id]));
    const result = complete(a);
    expect(result.map(r => Object.values(r.counts))).toEqual([[1,1,1,0,0,0],[0,0,0,1,1,1],[1,1,1,0,0,0],[0,0,0,1,1,1],[1,1,1,0,0,0],[0,0,0,1,1,1],[1,1,1,0,0,0]]);
    expect(result.map(r => r.observations.map(o => o.questionId))).toEqual([["ECN_01", "ECN_02", "ECN_03"], ["ECN_04", "ECN_05", "ECN_06"], ["ECN_07", "ECN_08", "ECN_09"], ["ECN_10", "ECN_11", "ECN_12"], ["ECN_13", "ECN_14", "ECN_15"], ["ECN_16", "ECN_17", "ECN_18"], ["ECN_19", "ECN_20", "ECN_21"]]);
    for (const r of result) for (const o of r.observations) expect(o.category).toBe(a[o.questionId]);
    const missing = answers("not-now"); delete missing.ECN_21;
    expect(recordEmotionsConnections21(quiz, missing)).toEqual({ status: "incomplete", answered: 20 });
    expect(recordEmotionsConnections21(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
  });
  it("rejects numeric points, fabricated categories, keys and malformed method boundaries", () => {
    for (const a of [null, [], "fits", 4, { ...answers("fits"), ECN_01: 0 }, { ...answers("fits"), ECN_01: "0" }, { ...answers("fits"), unknown: "fits" }]) expect(recordEmotionsConnections21(quiz, a).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { q.version = "other"; },
      (q: Questionnaire) => { q.source.scoringVersion = "clinical_tier"; },
      (q: Questionnaire) => { q.directions[0].itemCount = 5; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "changing-views"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions[0].options[3].directionId = "changing-views"; },
      (q: Questionnaire) => { q.questions[0].options[3].label.en = "Sometimes"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.minimumRatedItems = 4; },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isEmotionsConnections21ConfigurationValid(bad)).toBe(false); expect(recordEmotionsConnections21(bad, answers("fits"))).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("shows all responses and three distinct unknown categories with support always visible", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const category of emotionsConnectionsCategories) {
        const html = renderToStaticMarkup(<EmotionsConnectionsReport quiz={quiz} records={complete(answers(category.id))} locale={locale} />);
        expect((html.match(/data-emotions-connections-theme=/g) ?? [])).toHaveLength(7);
        expect((html.match(/data-emotions-connections-observation=/g) ?? [])).toHaveLength(21);
        expect((html.match(/data-emotions-connections-unscored=/g) ?? [])).toHaveLength(["unsure", "na", "withheld"].includes(category.id) ? 7 : 0);
        expect(html).toContain("data-emotions-connections-support"); expect(html).toContain(locale === "zh" ? "没有总分" : "no total");
      }
      const support = renderToStaticMarkup(<EmotionsConnectionsSupport locale={locale} />);
      expect(support).toContain(locale === "zh" ? "不以完成题目" : "without completion, a label or a count");
    }
  });
  it("makes all fifty-six paragraphs public before answers and on their own guide pages", () => {
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<EmotionsConnectionsPage quiz={quiz} locale={locale} />);
      expect((html.match(/data-emotions-connections-full-guide=/g) ?? [])).toHaveLength(7); expect(html).not.toContain("data-emotions-connections-result");
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
      for (const p of quiz.profiles) {
        const guide = renderToStaticMarkup(<EmotionsConnectionsGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(guide).toContain("data-emotions-connections-support");
        for (const s of p.sections) for (const t of s.paragraphs) { const encoded = renderToStaticMarkup(<p>{t[locale]}</p>).slice(3,-4); expect(html).toContain(encoded); expect(guide).toContain(encoded); }
      }
    }
  });
  it("loads exact identity, publishes sixteen ENZH URLs and disables analytics on every page", async () => {
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
