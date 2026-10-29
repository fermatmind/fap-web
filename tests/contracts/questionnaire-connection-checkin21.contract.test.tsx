import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/connection-belonging-check-in.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isConnectionCheckIn21ConfigurationValid, recordConnectionCheckIn21, connectionCheckInCategories } from "../../lib/questionnaires/connectionCheckIn21";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { ConnectionCheckInReport, ConnectionCheckInSupport } from "../../components/questionnaires/ConnectionCheckInReport";
import { ConnectionCheckInPage, ConnectionCheckInGuidePage } from "../../components/questionnaires/ConnectionCheckInPage";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
import { SITE_URL } from "../../lib/site";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (value: unknown) => {
  const result = recordConnectionCheckIn21(quiz, value); expect(result.status).toBe("complete");
  if (result.status !== "complete") throw Error("Expected complete observations");
  return result.records;
};
describe("Original connection and belonging observation categories, never a clinical score", () => {
  it("binds all21originalobservations and all3fullbilingualguides", () => {
    expect(isConnectionCheckIn21ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [field, body] of [["itemBankSha256", quiz.questions], ["resultContentSha256", quiz.profiles]] as const) {
      expect(quiz.source[field]).toBe(createHash("sha256").update(JSON.stringify(body)).digest("hex"));
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(21);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(6); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7);
      const paras = p.sections.flatMap(s => s.paragraphs); expect(paras).toHaveLength(14);
      expect(paras.every(p => p.en.trim() && p.zh.trim())).toBe(true);
      expect(paras.map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(900);
    }
  });
  it("keeps every response category separate including0versusunscored, without totals or means", () => {
    for (const c of connectionCheckInCategories) for (const r of complete(answers(c.id))) {
      expect(r.counts[c.id]).toBe(7); expect(Object.values(r.counts).reduce((a, b) => a + b)).toBe(7);
      expect(r.observations).toHaveLength(7); expect(r.observations.every(o => o.category === c.id)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
    }
    expect(scoreQuestionnaire(quiz, answers("4"))).toEqual({ status: "unavailable", answered: 0 });
  });
  it("retains exact per-item categories rather than thresholds or an implicit missing-as-zero rule", () => {
    const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, connectionCheckInCategories[i % 6].id]));
    const result = complete(a);
    expect(result.map(r => Object.values(r.counts))).toEqual([[2,1,1,1,1,1],[1,2,1,1,1,1],[1,1,2,1,1,1]]);
    for (const r of result) for (const o of r.observations) expect(o.category).toBe(a[o.questionId]);
    const missing = answers("0"); delete missing.CON_21;
    expect(recordConnectionCheckIn21(quiz, missing)).toEqual({ status: "incomplete", answered: 20 });
    expect(recordConnectionCheckIn21(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
  });
  it("rejects fabricated keys, numericvalues, unknowncategories and malformed configurations", () => {
    for (const a of [null, [], "4", 4, { ...answers("0"), CON_01: 0 }, { ...answers("0"), CON_01: "5" }, { ...answers("0"), unknown: "0" }]) expect(recordConnectionCheckIn21(quiz, a).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { q.version = "other"; },
      (q: Questionnaire) => { q.source.scoringVersion = "clinical_type"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions[0].options[5].label.en = "Not at all"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "wanted-listening"; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.minimumRatedItems = 4; },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isConnectionCheckIn21ConfigurationValid(bad)).toBe(false); expect(recordConnectionCheckIn21(bad, answers("0"))).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("shows all individual observations, allNAand0separately, and unconditional support in both locales", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const category of ["na", "0", "4"]) {
        const html = renderToStaticMarkup(<ConnectionCheckInReport quiz={quiz} records={complete(answers(category))} locale={locale} />);
        expect((html.match(/data-connection-checkin-theme=/g) ?? [])).toHaveLength(3);
        expect((html.match(/data-connection-checkin-observation=/g) ?? [])).toHaveLength(21);
        expect((html.match(/data-connection-checkin-unscored=/g) ?? [])).toHaveLength(category === "na" ? 3 : 0);
        expect(html).toContain("data-connection-checkin-support"); expect(html).toContain(locale === "zh" ? "没有总分" : "no total");
      }
      const support = renderToStaticMarkup(<ConnectionCheckInSupport locale={locale} />);
      expect(support).toContain(locale === "zh" ? "不必完成练习" : "No completion or count is required");
    }
  });
  it("makes the full same42paragraphs public before answers and on their own guide pages", () => {
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<ConnectionCheckInPage quiz={quiz} locale={locale} />);
      expect((html.match(/data-connection-checkin-full-guide=/g) ?? [])).toHaveLength(3);
      expect(html).not.toContain("data-connection-checkin-result");
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
      for (const p of quiz.profiles) {
        const guide = renderToStaticMarkup(<ConnectionCheckInGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(guide).toContain("data-connection-checkin-support");
        for (const s of p.sections) for (const t of s.paragraphs) {
          const encoded = renderToStaticMarkup(<p>{t[locale]}</p>).slice(3,-4);
          expect(html).toContain(encoded); expect(guide).toContain(encoded);
        }
      }
    }
  });
  it("loads exact identity, publishes8stableENZHURLs and disables analytics on entryandguides", async () => {
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
});
