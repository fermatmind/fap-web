import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/written-language-context-reflection.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isWrittenLanguage20ConfigurationValid, recordWrittenLanguage20, writtenLanguageCategories } from "../../lib/questionnaires/writtenLanguage20";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { WrittenLanguageReport, WrittenLanguageSupport } from "../../components/questionnaires/WrittenLanguageReport";
import { WrittenLanguagePage, WrittenLanguageGuidePage } from "../../components/questionnaires/WrittenLanguagePage";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
import { SITE_URL } from "../../lib/site";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (value: unknown) => {
  const result = recordWrittenLanguage20(quiz, value); expect(result.status).toBe("complete");
  if (result.status !== "complete") throw Error("Expected complete observations");
  return result.records;
};
describe("Original written-language context observation categories, never a clinical score", () => {
  it("binds all20originalobservations and all4fullbilingualguides", () => {
    expect(isWrittenLanguage20ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [field, body] of [["itemBankSha256", quiz.questions], ["resultContentSha256", quiz.profiles]] as const) {
      expect(quiz.source[field]).toBe(createHash("sha256").update(JSON.stringify(body)).digest("hex"));
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(20);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(6); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7);
      const paras = p.sections.flatMap(s => s.paragraphs); expect(paras).toHaveLength(14);
      expect(paras.every(p => p.en.trim() && p.zh.trim())).toBe(true);
      expect(paras.map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(900);
    }
  });
  it("keeps every response category separate including0versusunscored, without totals or means", () => {
    for (const c of writtenLanguageCategories) for (const r of complete(answers(c.id))) {
      expect(r.counts[c.id]).toBe(5); expect(Object.values(r.counts).reduce((a, b) => a + b)).toBe(5);
      expect(r.observations).toHaveLength(5); expect(r.observations.every(o => o.category === c.id)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
    }
    expect(scoreQuestionnaire(quiz, answers("4"))).toEqual({ status: "unavailable", answered: 0 });
  });
  it("retains exact per-item categories rather than thresholds or an implicit missing-as-zero rule", () => {
    const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, writtenLanguageCategories[i % 6].id]));
    const result = complete(a);
    expect(result.map(r => Object.values(r.counts))).toEqual([[1,1,1,1,1,0],[1,1,1,1,0,1],[1,1,1,0,1,1],[1,1,0,1,1,1]]);
    for (const r of result) for (const o of r.observations) expect(o.category).toBe(a[o.questionId]);
    const missing = answers("0"); delete missing.WLC_20;
    expect(recordWrittenLanguage20(quiz, missing)).toEqual({ status: "incomplete", answered: 19 });
    expect(recordWrittenLanguage20(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
  });
  it("rejects fabricated keys, numericvalues, unknowncategories and malformed configurations", () => {
    for (const a of [null, [], "4", 4, { ...answers("0"), WLC_01: 0 }, { ...answers("0"), WLC_01: "5" }, { ...answers("0"), unknown: "0" }]) expect(recordWrittenLanguage20(quiz, a).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { q.version = "other"; },
      (q: Questionnaire) => { q.source.scoringVersion = "clinical_type"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions[0].options[5].label.en = "Not at all"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "sensations-and-thoughts"; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.minimumRatedItems = 4; },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isWrittenLanguage20ConfigurationValid(bad)).toBe(false); expect(recordWrittenLanguage20(bad, answers("0"))).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("shows all individual observations, allNAand0separately, and unconditional support in both locales", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const category of ["na", "0", "4"]) {
        const html = renderToStaticMarkup(<WrittenLanguageReport quiz={quiz} records={complete(answers(category))} locale={locale} />);
        expect((html.match(/data-written-language-theme=/g) ?? [])).toHaveLength(4);
        expect((html.match(/data-written-language-observation=/g) ?? [])).toHaveLength(20);
        expect((html.match(/data-written-language-unscored=/g) ?? [])).toHaveLength(category === "na" ? 4 : 0);
        expect(html).toContain("data-written-language-support"); expect(html).toContain(locale === "zh" ? "没有总分" : "no total");
      }
      const support = renderToStaticMarkup(<WrittenLanguageSupport locale={locale} />);
      expect(support).toContain(locale === "zh" ? "不必达到计数" : "without a count, proof of childhood difficulty or a completed record");
      expect(support).toContain(locale === "zh" ? "类别不建立阅读障碍" : "Categories cannot establish dyslexia");
      expect(support).toContain(locale === "zh" ? "不评估医疗需要或紧急程度" : "cannot assess healthcare need or urgency");
      expect(support).toContain(locale === "zh" ? "辅助方式不是追加症状" : "access methods are not additional symptoms");
      expect(support).toContain(locale === "zh" ? "无需撤掉有用辅助" : "no removal of useful aids");
      expect(support).toContain(locale === "zh" ? "中英文测量等值尚未建立" : "English and Chinese measurement equivalence is not established");
    }
  });
  it("makes the full same56paragraphs public before answers and on their own guide pages", () => {
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<WrittenLanguagePage quiz={quiz} locale={locale} />);
      expect((html.match(/data-written-language-full-guide=/g) ?? [])).toHaveLength(4);
      expect(html).not.toContain("data-written-language-result");
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
      for (const p of quiz.profiles) {
        const guide = renderToStaticMarkup(<WrittenLanguageGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(guide).toContain("data-written-language-support");
        for (const s of p.sections) for (const t of s.paragraphs) {
          const encoded = renderToStaticMarkup(<p>{t[locale]}</p>).slice(3,-4);
          expect(html).toContain(encoded); expect(guide).toContain(encoded);
        }
      }
    }
  });
  it("loads exact identity, publishes10stableENZHURLs and disables analytics on entryandguides", async () => {
    expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);
    const map = appendFunSitemapEntries([]);
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...quiz.profiles.map(p => `/results/${p.id}`)]) {
      const path = `/${locale}/tests/explore/${quiz.slug}${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(path)).toBe(true);
      expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);
      expect(map.some(e => e.loc === `https://fermatmind.com${path}`)).toBe(true);
    }
    expect(entertainmentActivityCatalog.find(c => c.slug === quiz.slug)?.privacy).toBe("explicit_opt_in");
  });
  it("binds entryandguidemetadata to localealternates rather than private answers", async () => {
    const page = await import("../../components/questionnaires/QuestionnairePage");
    const guide = await import("../../components/questionnaires/QuestionnaireGuide");
    for (const locale of ["en", "zh"]) {
      const root = `/${locale}/tests/explore/${quiz.slug}`;
      const entry = await page.generateMetadata({ params: Promise.resolve({ locale, slug: quiz.slug }) });
      expect(entry.alternates?.canonical).toBe(`${SITE_URL}${root}`);
      for (const p of quiz.profiles) {
        const m = await guide.generateMetadata({ params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) });
        expect(m.alternates?.canonical).toBe(`${SITE_URL}${root}/results/${p.id}`);
        expect(m.alternates?.languages?.en).toBe(`${SITE_URL}/en/tests/explore/${quiz.slug}/results/${p.id}`);
        expect(m.alternates?.languages?.["zh-CN"]).toBe(`${SITE_URL}/zh/tests/explore/${quiz.slug}/results/${p.id}`);
      }
    }
  });
  it("exposes the real MoreTests entry in both locales through an existing category", async () => {
    const { MoreTests } = await import("../../components/entertainment/MoreTests");
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
      const entry = dom.querySelector(`a[href="/${locale}/tests/explore/${quiz.slug}"]`);
      expect(entry?.textContent).toBe(quiz.title[locale]);
    }
  });
});
