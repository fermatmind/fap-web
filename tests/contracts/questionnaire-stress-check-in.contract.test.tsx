import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/stress-check-in-test.json";
import source from "@/tests/fixtures/questionnaires/stress-check-in-source-reference.json";
import { isStressReflection4ConfigurationValid, scoreStressReflection4Questionnaire } from "@/lib/questionnaires/stressReflection4";
import { QuestionnaireStressCheckInReport } from "@/components/questionnaires/QuestionnaireStressCheckInReport";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { shouldLoadBrowserAnalyticsScripts } from "@/lib/tracking/browserAnalyticsSuppression";
const answers = (values = [2, 2, 2, 2]) => Object.fromEntries(data.questions.map((q, i) => [q.id, String(values[i])]));
const complete = (a: unknown) => { const r = scoreStressReflection4Questionnaire(data, a); if (r.status !== "complete") throw Error(r.status); return r; };
describe("original monthly stress reflection with four independent prompts", () => {
  it("binds the full original copy and transparent 2/4 reverse keys without claiming standard PSS-4 identity", async () => {
    expect(isStressReflection4ConfigurationValid(data)).toBe(true);
    const { source: metadata, ...configuration } = data;
    expect(configuration).toEqual(source.publicConfiguration);
    expect(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/stress-check-in-source-reference.json")).digest("hex")).toBe(metadata.itemBankSha256);
    expect(createHash("sha256").update(JSON.stringify(data.profiles)).digest("hex")).toBe(metadata.resultContentSha256);
    expect(data.questions.map(q => q.reverse)).toEqual([false, true, false, true]);
    const quiz = await loadQuestionnaire(data.slug); expect(quiz).toEqual(data);
    expect(scoreQuestionnaire(quiz!, answers())).toEqual(complete(answers()));
    expect(readQuestionnaireDraft(quiz!, JSON.stringify({ version: data.version, savedAt: Date.now(), answers: answers() }))).toBeNull();
    expect(data.faq[0].answer.en).toContain("not a standard PSS-4 score");
    for (const locale of ["en", "zh"] as const) expect(data.guide[1].paragraphs[0][locale]).not.toBe(locale);
  });
  it("checks every one of 625 answer combinations against independently stated arithmetic and all 17 attainable totals", () => {
    const totals = new Set<number>();
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 0; c <= 4; c++) for (let d = 0; d <= 4; d++) {
      const r = complete(answers([a, b, c, d]));
      expect(r.total).toBe(a + 4 - b + c + 4 - d);
      expect(r.contributions.map(p => p.chosen)).toEqual([a, b, c, d]);
      expect(r.contributions.map(p => p.value)).toEqual([a, 4 - b, c, 4 - d]);
      expect(Object.keys(r)).toEqual(["status", "answered", "total", "contributions"]); totals.add(r.total);
    }
    expect([...totals].sort((a,b) => a-b)).toEqual(Array.from({ length: 17 }, (_,i) => i));
    expect(complete(answers([3,1,2,3])).total).toBe(9);
    expect(complete(answers([0,0,0,0])).total).toBe(8); expect(complete(answers([4,4,4,4])).total).toBe(8);
  });
  it("withholds the total for each incomplete state and rejects malformed or unknown values without invoking getters", () => {
    for (let mask = 0; mask < 15; mask++) {
      const a = Object.fromEntries(data.questions.flatMap((q,i) => mask & (1 << i) ? [[q.id,"2"]] : []));
      expect(scoreStressReflection4Questionnaire(data, a)).toEqual({ status: "incomplete", answered: Object.keys(a).length });
    }
    for (const a of [null, [], new Date(), 2, { ...answers(), extra: "2" }, ...[2, null, "na", "5", "-1", "2.5"].map(v => ({ ...answers(), [data.questions[0].id]: v }))]) expect(scoreStressReflection4Questionnaire(data, a).status).toBe("invalid");
    const getter = answers(); Object.defineProperty(getter, data.questions[0].id, { enumerable: true, get() { throw Error("Do not invoke"); } }); expect(scoreStressReflection4Questionnaire(data,getter).status).toBe("invalid");
    expect(scoreStressReflection4Questionnaire(data, { ...answers(), [Symbol("extra")]: "2" }).status).toBe("invalid");
    const hidden = answers(); Object.defineProperty(hidden,data.questions[0].id,{value:"2",enumerable:false}); expect(scoreStressReflection4Questionnaire(data,hidden).status).toBe("invalid");
    expect(scoreStressReflection4Questionnaire(data,Object.assign(Object.create(null),answers())).status).toBe("complete");
  });
  it("fails closed on missing full content, sparse arrays, changed mapping or an incorrect reverse key", () => {
    for (const mutate of [
      (q: typeof data) => { delete q.questions[0]; }, (q: typeof data) => { delete q.questions[0].options[0]; },
      (q: typeof data) => { q.questions[1].reverse = false; }, (q: typeof data) => { q.questions[2].reverse = true; },
      (q: typeof data) => { q.questions[0].options[0].score = 1; }, (q: typeof data) => { q.questions[0].options[0].directionId = "OTHER"; },
      (q: typeof data) => { q.profiles[0].sections.pop(); }, (q: typeof data) => { delete q.profiles[0].sections[0].paragraphs[0]; },
      (q: typeof data) => { q.source.psychometricValidationCompleted = true; },
    ]) { const damaged = structuredClone(data); mutate(damaged); expect(isStressReflection4ConfigurationValid(damaged)).toBe(false); expect(scoreStressReflection4Questionnaire(damaged,answers()).status).toBe("unavailable"); }
  });
  it("renders the total, each contribution and the whole 12-paragraph guide in both languages and withholds inconsistent totals", () => {
    if (!isStressReflection4ConfigurationValid(data)) throw Error("Invalid source");
    const r = complete(answers([3,1,2,3]));
    for (const locale of ["en", "zh"] as const) {
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireStressCheckInReport quiz={data} result={r} locale={locale} />), "text/html");
      expect(doc.querySelector("[data-stress-check-in-total]")?.textContent).toContain("9 / 16");
      expect(doc.querySelectorAll("[data-stress-check-in-contribution]")).toHaveLength(4);
      for (const s of data.profiles[0].sections) {
        const section = doc.getElementById(`stress-check-in-report-${s.id}`)!;
        expect([...section.querySelectorAll(":scope > p, :scope > ul > li")].map(p => p.textContent)).toEqual(s.paragraphs.map(p => p[locale]));
      }
      const damaged = structuredClone(r); damaged.total = 10;
      expect(renderToStaticMarkup(<QuestionnaireStressCheckInReport quiz={data} result={damaged} locale={locale} />)).not.toContain("data-stress-check-in-total");
    }
  });
  it("suppresses production browser analytics even when consent is granted, on the entry and fixed public guide", () => {
    for (const locale of ["en","zh"]) for (const suffix of ["","/results/reading-your-check-in"]) {
      const pathname = `/${locale}/tests/explore/stress-check-in-test${suffix}`;
      expect(isAnalyticsDisabledQuestionnaireUrl(pathname)).toBe(true);
      expect(shouldLoadBrowserAnalyticsScripts({ pathname, consent: true, analyticsEnabled: true, env: "production", host: "fermatmind.com" })).toEqual({ allowed: false, reason: "private_route" });
    }
    expect(isAnalyticsDisabledQuestionnaireUrl("/en/tests/explore/stress-check-in-test-other")).toBe(false);
  });
});
