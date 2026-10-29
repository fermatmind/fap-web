import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import data from "../../lib/questionnaires/data/after-bereavement-reflection.json";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { isBereavement16ConfigurationValid, recordBereavement16, bereavementCategories, bereavementTimeChoices } from "../../lib/questionnaires/bereavement16";
import { isQuestionnaireConfigurationValid, scoreQuestionnaire } from "../../lib/questionnaires/scoring";
import { loadQuestionnaire } from "../../lib/questionnaires/loaders";
import { BereavementReport, BereavementSupport } from "../../components/questionnaires/BereavementReport";
import { BereavementPage, BereavementGuidePage } from "../../components/questionnaires/BereavementPage";
import { isAnalyticsDisabledQuestionnaireUrl, shouldHardStopPublicAnalyticsForUrl } from "../../lib/tracking/privacy";
import { entertainmentActivityCatalog } from "../../lib/entertainment/activityCatalog";
import { appendFunSitemapEntries } from "../../lib/entertainment/sitemap";
import { SITE_URL } from "../../lib/site";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = data as Questionnaire;
const answers = (value: string) => Object.fromEntries(quiz.questions.map(q => [q.id, value]));
const complete = (value: unknown) => {
  const result = recordBereavement16(quiz, value); expect(result.status).toBe("complete");
  if (result.status !== "complete") throw Error("Expected complete observations");
  return result.records;
};
describe("Original bereavement observation categories, never a clinical score", () => {
  it("binds all16originalobservations and all5fullbilingualguides", () => {
    expect(isBereavement16ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    for (const [field, body] of [["itemBankSha256", { questions: quiz.questions, bereavementTimeContext: quiz.bereavementTimeContext }], ["resultContentSha256", quiz.profiles]] as const) {
      expect(quiz.source[field]).toBe(createHash("sha256").update(JSON.stringify(body)).digest("hex"));
    }
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(16);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(6); expect(q.options.every(o => o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(7);
      const paras = p.sections.flatMap(s => s.paragraphs); expect(paras).toHaveLength(14);
      expect(paras.every(p => p.en.trim() && p.zh.trim())).toBe(true);
      expect(paras.map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(900);
    }
  });
  it("keeps every response category separate including0versusunscored, without totals or means", () => {
    for (const c of bereavementCategories) for (const r of complete(answers(c.id))) {
      expect(r.counts[c.id]).toBe(r.observations.length); expect(Object.values(r.counts).reduce((a, b) => a + b)).toBe(r.observations.length);
      expect(r.observations).toHaveLength(r.id === "missing-the-person" ? 4 : 3); expect(r.observations.every(o => o.category === c.id)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["counts", "id", "observations"]);
    }
    expect(scoreQuestionnaire(quiz, answers("4"))).toEqual({ status: "unavailable", answered: 0 });
  });
  it("retains exact per-item categories rather than thresholds or an implicit missing-as-zero rule", () => {
    const a = Object.fromEntries(quiz.questions.map((q, i) => [q.id, bereavementCategories[i % 6].id]));
    const result = complete(a);
    expect(result.map(r => Object.values(r.counts))).toEqual([[1,1,1,1,0,0],[1,0,0,0,1,1],[0,1,1,1,0,0],[1,0,0,0,1,1],[0,1,1,1,0,0]]);
    for (const r of result) for (const o of r.observations) expect(o.category).toBe(a[o.questionId]);
    const missing = answers("0"); delete missing.BRV_16;
    expect(recordBereavement16(quiz, missing)).toEqual({ status: "incomplete", answered: 15 });
    expect(recordBereavement16(quiz, {})).toEqual({ status: "incomplete", answered: 0 });
  });
  it("rejects fabricated keys, numericvalues, unknowncategories and malformed configurations", () => {
    for (const a of [null, [], "4", 4, { ...answers("0"), BRV_01: 0 }, { ...answers("0"), BRV_01: "5" }, { ...answers("0"), unknown: "0" }]) expect(recordBereavement16(quiz, a).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { q.version = "other"; },
      (q: Questionnaire) => { q.source.scoringVersion = "clinical_type"; },
      (q: Questionnaire) => { q.questions[0].options[0].score = 0; },
      (q: Questionnaire) => { q.questions[0].options[5].label.en = "Not at all"; },
      (q: Questionnaire) => { q.questions[0].reverse = true; },
      (q: Questionnaire) => { q.questions[0].options[0].directionId = "changed-roles"; },
      (q: Questionnaire) => { q.profiles[0].sections.pop(); },
      (q: Questionnaire) => { q.profiles[0].sections[0].paragraphs[0].zh = ""; },
      (q: Questionnaire) => { q.minimumRatedItems = 4; },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isBereavement16ConfigurationValid(bad)).toBe(false); expect(recordBereavement16(bad, answers("0"))).toEqual({ status: "unavailable", answered: 0 }); }
  });
  it("keeps optional time outside answers and every count, without timing-dependent public support", () => {
    const a = answers("na");
    const omitted = recordBereavement16(quiz, a); expect(omitted.status).toBe("complete");
    if (omitted.status !== "complete") throw Error("Incomplete");
    expect(omitted.timeContext).toBe("withheld");
    for (const c of bereavementTimeChoices) {
      const r = recordBereavement16(quiz, a, c.id); expect(r.status).toBe("complete");
      if (r.status !== "complete") throw Error("Incomplete");
      expect(r.records).toEqual(omitted.records); expect(r.timeContext).toBe(c.id);
      for (const locale of ["en", "zh"] as const) {
        const html = renderToStaticMarkup(<BereavementReport quiz={quiz} records={r.records} timeContext={r.timeContext} locale={locale} />);
        expect(html).toContain(c.label[locale]); expect(html).toContain("data-bereavement-support");
        expect(html).toContain(locale === "zh" ? "不必完成练习、达到某种计数或等待某个时间点" : "No completion, count or waiting period is required");
      }
    }
    for (const timing of [null, "12months", 12, {}, []]) expect(recordBereavement16(quiz, a, timing).status).toBe("invalid");
    expect(recordBereavement16(quiz, { ...a, BRV_CONTEXT_TIME: "withheld" }).status).toBe("invalid");
    for (const change of [
      (q: Questionnaire) => { delete q.bereavementTimeContext; },
      (q: Questionnaire) => { q.bereavementTimeContext!.optional = false; },
      (q: Questionnaire) => { q.bereavementTimeContext!.default = "under-three-months"; },
      (q: Questionnaire) => { q.bereavementTimeContext!.options[0].id = "clinical"; },
      (q: Questionnaire) => { q.bereavementTimeContext!.options[0].label.zh = ""; },
      (q: Questionnaire) => { Object.assign(q.bereavementTimeContext!.options[0], { score: 0 }); },
    ]) { const bad = structuredClone(quiz); change(bad); expect(isBereavement16ConfigurationValid(bad)).toBe(false); }
  });
  it("shows all individual observations, allNAand0separately, and unconditional support in both locales", () => {
    for (const locale of ["en", "zh"] as const) {
      for (const category of ["na", "0", "4"]) {
        const html = renderToStaticMarkup(<BereavementReport quiz={quiz} records={complete(answers(category))} timeContext="withheld" locale={locale} />);
        expect((html.match(/data-bereavement-theme=/g) ?? [])).toHaveLength(5);
        expect((html.match(/data-bereavement-observation=/g) ?? [])).toHaveLength(16);
        expect((html.match(/data-bereavement-unscored=/g) ?? [])).toHaveLength(category === "na" ? 5 : 0);
        expect(html).toContain("data-bereavement-support"); expect(html).toContain(locale === "zh" ? "没有总分" : "no total");
      }
      const support = renderToStaticMarkup(<BereavementSupport locale={locale} />);
      expect(support).toContain(locale === "zh" ? "不必完成练习" : "No completion, count or waiting period is required");
    }
  });
  it("makes the full same70paragraphs public before answers and on their own guide pages", () => {
    for (const locale of ["en", "zh"] as const) {
      const html = renderToStaticMarkup(<BereavementPage quiz={quiz} locale={locale} />);
      expect((html.match(/data-bereavement-full-guide=/g) ?? [])).toHaveLength(5);
      expect(html).not.toContain("data-bereavement-result");
      const dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("#take-test button")?.hasAttribute("disabled")).toBe(true);
      expect(dom.querySelector("#take-test select")?.hasAttribute("disabled")).toBe(true);
      for (const p of quiz.profiles) {
        const guide = renderToStaticMarkup(<BereavementGuidePage quiz={quiz} profile={p} locale={locale} />);
        expect(guide).toContain("data-bereavement-support");
        for (const s of p.sections) for (const t of s.paragraphs) {
          const encoded = renderToStaticMarkup(<p>{t[locale]}</p>).slice(3,-4);
          expect(html).toContain(encoded); expect(guide).toContain(encoded);
        }
      }
    }
  });
  it("loads exact identity, publishes12stableENZHURLs and disables analytics on entryandguides", async () => {
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
