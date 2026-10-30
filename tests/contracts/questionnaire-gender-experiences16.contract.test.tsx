import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/gender-experiences-reflection.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isGenderExperiences16ConfigurationValid, recordGenderExperiences16, genderExperiencesCategories } from "../../lib/questionnaires/genderExperiences16";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { GenderExperiencesReport, GenderExperiencesSupport } from "../../components/questionnaires/GenderExperiencesReport";
import { GenderExperiencesPage, GenderExperiencesGuidePage } from "../../components/questionnaires/GenderExperiencesPage";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
import { SITE_URL } from "../../lib/site";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (value: unknown) => {
  const result = recordGenderExperiences16(quiz, value); expect(result.status).toBe("complete");
  if (result.status !== "complete") throw Error("Expected complete categories");
  return result.records;
};
describe("Original gender descriptions without scores or clinical verdicts", () => {
  it("binds sixteen original statements and four complete bilingual guides", () => {
    expect(isGenderExperiences16ConfigurationValid(quiz)).toBe(true);
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [field, body] of [["itemBankSha256", { directions: quiz.directions, questions: quiz.questions }], ["resultContentSha256", quiz.profiles]] as const) expect(quiz.source[field]).toBe(createHash("sha256").update(JSON.stringify(body)).digest("hex"));
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(16);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([4, 4, 4, 4]);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(6); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7); const paras = p.sections.flatMap(s => s.paragraphs);
      expect(paras).toHaveLength(8); expect(paras.every(p => p.en.trim() && p.zh.trim())).toBe(true);
      expect(paras.map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400);
    }
  });
  it("records all six labels separately in their own four denominators without points", () => {
    for (const c of genderExperiencesCategories) for (const [i, r] of complete(answers(c.id)).entries()) {
      const n = [4, 4, 4, 4][i];
      expect(r.counts[c.id]).toBe(n); expect(Object.values(r.counts).reduce((a, b) => a + b)).toBe(n);
      expect(r.observations).toHaveLength(n); expect(r.observations.every(o => o.category === c.id)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
    }
    expect(scoreQuestionnaire(quiz, answers("fits"))).toEqual({ status: "unavailable", answered: 0 });
  });
  it("retains exact per-item labels through all four-item theme boundaries", () => {
    const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, genderExperiencesCategories[i % 6].id]));
    const result = complete(a);
    expect(result.map(r => Object.values(r.counts))).toEqual([[1,1,1,1,0,0],[1,1,0,0,1,1],[0,0,1,1,1,1],[1,1,1,1,0,0]]);
    expect(result.map(r => r.observations.map(o => o.questionId))).toEqual([
      ["GEX_01","GEX_02","GEX_03","GEX_04"], ["GEX_05","GEX_06","GEX_07","GEX_08"],
      ["GEX_09","GEX_10","GEX_11","GEX_12"], ["GEX_13","GEX_14","GEX_15","GEX_16"],
    ]);
    for (const r of result) for (const o of r.observations) expect(o.category).toBe(a[o.questionId]);
    const missing = answers("not-now"); delete missing.GEX_16;
    expect(recordGenderExperiences16(quiz, missing)).toEqual({ status: "incomplete", answered: 15 });
    expect(recordGenderExperiences16(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
  });
  it("rejects numeric points, fabricated categories, keys and malformed method boundaries", () => {
    for (const a of [null, [], "fits", 4, { ...answers("fits"), GEX_01: 0 }, { ...answers("fits"), GEX_01: "0" }, { ...answers("fits"), unknown: "fits" }]) expect(recordGenderExperiences16(quiz, a).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { q.version = "other"; },
      (q: Questionnaire) => { q.source.scoringVersion = "clinical_tier"; },
      (q: Questionnaire) => { q.directions[0].itemCount = 5; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "embodied-experience"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions[0].options[3].directionId = "embodied-experience"; },
      (q: Questionnaire) => { q.questions[0].options[3].label.en = "Sometimes"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.minimumRatedItems = 4; },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isGenderExperiences16ConfigurationValid(bad)).toBe(false); expect(recordGenderExperiences16(bad, answers("fits"))).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("shows all responses and three distinct unknown categories with support always visible", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const category of genderExperiencesCategories) {
        const html = renderToStaticMarkup(<GenderExperiencesReport quiz={quiz} records={complete(answers(category.id))} locale={locale} />);
        expect((html.match(/data-gender-experiences-theme=/g) ?? [])).toHaveLength(4);
        expect((html.match(/data-gender-experiences-observation=/g) ?? [])).toHaveLength(16);
        expect((html.match(/data-gender-experiences-unscored=/g) ?? [])).toHaveLength(["unsure", "na", "withheld"].includes(category.id) ? 4 : 0);
        expect(html).toContain("data-gender-experiences-support"); expect(html).toContain(locale === "zh" ? "没有总分" : "no total");
      }
      const support = renderToStaticMarkup(<GenderExperiencesSupport locale={locale} />);
      expect(support).toContain(locale === "zh" ? "不以完成题目" : "without completion, a label or a count");
    }
  });
  it("makes all thirty-two paragraphs public before answers and on their own guide pages", () => {
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<GenderExperiencesPage quiz={quiz} locale={locale} />);
      expect((html.match(/data-gender-experiences-full-guide=/g) ?? [])).toHaveLength(4); expect(html).not.toContain("data-gender-experiences-result");
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
      for (const p of quiz.profiles) {
        const guide = renderToStaticMarkup(<GenderExperiencesGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(guide).toContain("data-gender-experiences-support");
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
