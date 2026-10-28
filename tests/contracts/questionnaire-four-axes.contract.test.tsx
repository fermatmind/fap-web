import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/four-axes-test.json";
import source from "@/tests/fixtures/questionnaires/four-axes-source-reference.json";
import { FOUR_AXES_IDS, isFourAxesConfigurationValid, scoreFourAxesQuestionnaire } from "@/lib/questionnaires/fourAxes";
import { QuestionnaireFourAxesReport } from "@/components/questionnaires/QuestionnaireFourAxesReport";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { shouldLoadBrowserAnalyticsScripts } from "@/lib/tracking/browserAnalyticsSuppression";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
const neutral = () => Object.fromEntries(data.questions.map(q => [q.id, "2"]));
const complete = (answers: unknown) => {
  const r = scoreFourAxesQuestionnaire(data, answers);
  if (r.status !== "complete") throw new Error(r.status);
  return r;
};
describe("original four-domain sixty-statement reflection", () => {
  it("binds the original full configuration, bilingual content and disclosed formula", async () => {
    expect(isFourAxesConfigurationValid(data)).toBe(true);
    const { source: metadata, ...configuration } = data;
    expect(configuration).toEqual(source.publicConfiguration);
    expect(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/four-axes-source-reference.json")).digest("hex")).toBe(metadata.itemBankSha256);
    expect(createHash("sha256").update(JSON.stringify({ profiles: data.profiles, fourAxes: data.fourAxes })).digest("hex")).toBe(metadata.resultContentSha256);
    const quiz = await loadQuestionnaire(data.slug);
    expect(quiz && isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(scoreQuestionnaire(quiz!, neutral())).toEqual(complete(neutral()));
    expect(readQuestionnaireDraft(quiz!, JSON.stringify({ version: data.version, savedAt: Date.now(), answers: neutral() }))).toBeNull();
    for (const profile of data.profiles) {
      expect(profile.sections).toHaveLength(6);
      expect(profile.sections.flatMap(s => s.paragraphs)).toHaveLength(12);
      expect(profile.seo.title.en.length).toBeLessThanOrEqual(47);
      expect(profile.seo.description.en.length).toBeLessThanOrEqual(160);
    }
  });
  it("suppresses browser analytics on both private answering and fixed public guide routes, including granted consent", () => {
    for (const locale of ["en", "zh"]) for (const suffix of ["", ...data.profiles.map(p => `/results/${p.id}`)]) {
      const pathname = `/${locale}/tests/explore/four-axes-test${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(pathname)).toBe(true);
      expect(shouldLoadBrowserAnalyticsScripts({ pathname, consent: true, analyticsEnabled: true, env: "production", host: "fermatmind.com" })).toEqual({ allowed: false, reason: "private_route" });
    }
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/four-axes-test-other")).toBe(false);
  });
  it("computes every possible sum on each axis independently, including reverse keys", () => {
    for (const id of FOUR_AXES_IDS) for (let sum = 0; sum <= 60; sum++) {
      const answers = neutral(); let remaining = sum;
      for (const q of data.questions.filter(q => q.options[0].directionId === id)) {
        const scored = Math.min(4, remaining); remaining -= scored;
        answers[q.id] = String(q.reverse ? 4 - scored : scored);
      }
      const result = complete(answers);
      expect(result.axes[id]).toEqual({ sum, count: 15, highPercent: sum / 60 * 100, lowPercent: 100 - sum / 60 * 100 });
      for (const other of FOUR_AXES_IDS.filter(v => v !== id)) expect(result.axes[other].sum).toBe(30);
      expect(Object.keys(result)).toEqual(["status", "answered", "axes"]);
    }
    expect(Object.values(complete(neutral()).axes).every(a => a.highPercent === 50)).toBe(true);
    const allAgree = Object.fromEntries(data.questions.map(q => [q.id, "4"]));
    expect(Object.values(complete(allAgree).axes).every(a => a.sum === 32)).toBe(true);
  });
  it("withholds all axes for missing answers and rejects malformed responses without invoking getters", () => {
    for (const q of data.questions) { const a = neutral(); delete a[q.id]; expect(scoreFourAxesQuestionnaire(data, a)).toEqual({ status: "incomplete", answered: 59 }); }
    for (const a of [null, [], new Date(), 2, { ...neutral(), extra: "2" }, ...["na", "5", "-1", "2.5", 2, null, true].map(v => ({ ...neutral(), [data.questions[0].id]: v }))]) expect(scoreFourAxesQuestionnaire(data, a).status).toBe("invalid");
    const getter = neutral(); Object.defineProperty(getter, data.questions[0].id, { enumerable: true, get() { throw Error("Must not invoke"); } });
    expect(scoreFourAxesQuestionnaire(data, getter).status).toBe("invalid");
    expect(scoreFourAxesQuestionnaire(data, { ...neutral(), [Symbol("extra")]: "2" }).status).toBe("invalid");
    const hidden = neutral(); Object.defineProperty(hidden, data.questions[0].id, { value: "2", enumerable: false });
    expect(scoreFourAxesQuestionnaire(data, hidden).status).toBe("invalid");
    expect(scoreFourAxesQuestionnaire(data, Object.assign(Object.create(null), neutral())).status).toBe("complete");
  });
  it("fails closed on sparse, miskeyed or incomplete product content", () => {
    const mutations = [
      (q: typeof data) => { delete q.questions[0]; },
      (q: typeof data) => { delete q.questions[0].options[0]; },
      (q: typeof data) => { q.questions[0].reverse = true; },
      (q: typeof data) => { q.questions[0].options[0].directionId = "political"; },
      (q: typeof data) => { q.questions[0].options[0].score = 1; },
      (q: typeof data) => { q.fourAxes.axes[0].id = "political"; },
      (q: typeof data) => { q.profiles[0].sections.pop(); },
      (q: typeof data) => { delete q.profiles[0].sections[0].paragraphs[0]; },
      (q: typeof data) => { q.source.psychometricValidationCompleted = true; },
    ];
    for (const mutate of mutations) { const q = structuredClone(data); mutate(q); expect(isFourAxesConfigurationValid(q)).toBe(false); expect(scoreFourAxesQuestionnaire(q, neutral()).status).toBe("unavailable"); }
  });
  it("renders all four bars and all 48 paragraph pairs in both languages, without score-bearing URLs", () => {
    if (!isFourAxesConfigurationValid(data)) throw Error("Invalid source");
    const r = complete(neutral());
    for (const locale of ["en", "zh"] as const) {
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireFourAxesReport quiz={data} result={r} locale={locale} />), "text/html");
      expect(doc.querySelectorAll("[data-four-axes-part]")).toHaveLength(4);
      expect(doc.querySelectorAll('[role="img"]')).toHaveLength(4);
      for (const p of data.profiles) for (const section of p.sections) {
        const element = doc.getElementById(`four-axes-report-${p.id}-${section.id}`)!;
        expect([...element.querySelectorAll(":scope > p, :scope > ul > li")].map(n => n.textContent)).toEqual(section.paragraphs.map(p => p[locale]));
      }
      for (const a of doc.querySelectorAll('a[href*="/results/"]')) expect(a.getAttribute("href")).not.toMatch(/[?#]/);
      const ids = [...doc.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
      const damaged = structuredClone(r); damaged.axes.gender.highPercent = 51;
      expect(renderToStaticMarkup(<QuestionnaireFourAxesReport quiz={data} result={damaged} locale={locale} />)).not.toContain("data-four-axes-part");
    }
  });
});
