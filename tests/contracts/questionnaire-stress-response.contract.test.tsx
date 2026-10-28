import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import data from "@/lib/questionnaires/data/stress-response-patterns-test.json";
import source from "@/tests/fixtures/questionnaires/stress-response-source-reference.json";
import profiles from "@/tests/fixtures/questionnaires/stress-response-profiles-reference.json";
import { isMiniShadowConfigurationValid, scoreMiniShadowQuestionnaire } from "@/lib/questionnaires/miniShadow";
import { QuestionnaireShadowReport } from "@/components/questionnaires/QuestionnaireShadowReport";

const base = () => Object.fromEntries(data.questions.map(q => [q.id, "3"]));
const complete = (answers: unknown) => {
  const result = scoreMiniShadowQuestionnaire(data, answers);
  expect(result.status).toBe("complete");
  if (result.status !== "complete") throw new Error("Expected all 20 numeric responses");
  return result;
};
describe("original twenty-statement stress response form", () => {
  it("preserves all original Chinese statements, working English, five anchors and full manuscripts", () => {
    expect(isMiniShadowConfigurationValid(data)).toBe(true);
    expect(data.source.itemBankSha256).toBe(source.sourceBankSHA256);
    expect(data.profiles).toEqual(profiles);
    for (const [i, original] of source.items.entries()) {
      const q = data.questions[i];
      expect(q.id).toBe(original.id); expect(q.prompt).toEqual(original.prompt); expect(q.reverse).toBe(false);
      expect(original.timeframe).toEqual({ zh: "过去三个月", en: "the past three months" });
      expect(q.options).toEqual(Object.entries(source.responseLabels).map(([id, label]) => ({ id, label, directionId: original.factor, score: Number(id) })));
    }
  });
  it("records all 85 possible part sums with exact quarter means and no cross-part ranking", () => {
    for (let group = 0; group < 5; group++) for (let sum = 4; sum <= 20; sum++) {
      const answers = base(); let remainder = sum - 4;
      for (let i = 0; i < 4; i++) { const addition = Math.min(4, remainder); remainder -= addition; answers[data.questions[group * 4 + i].id] = String(1 + addition); }
      const result = complete(answers);
      expect(result.facets[data.directions[group].id]).toEqual({ sum, rated: 4, total: 4, mean: sum / 4 });
      expect(Object.keys(result)).toEqual(["status", "answered", "facets"]);
      for (const [i, d] of data.directions.entries()) if (i !== group) expect(result.facets[d.id]).toEqual({ sum: 12, rated: 4, total: 4, mean: 3 });
    }
  });
  it("withholds all personal interpretation until twenty responses and rejects unknown or unsafe answers", () => {
    for (const q of data.questions) { const answers = base(); delete answers[q.id]; expect(scoreMiniShadowQuestionnaire(data, answers).status).toBe("incomplete"); }
    for (const value of [null, [], new Date(), 3, true, { ...base(), extra: "3" }, ...["na", "0", "6", "2.5", 3, null, NaN].map(v => ({ ...base(), [data.questions[0].id]: v }))]) expect(scoreMiniShadowQuestionnaire(data, value).status).toBe("invalid");
    const getter = base(); Object.defineProperty(getter, data.questions[0].id, { enumerable: true, get() { throw new Error("Must not invoke"); } });
    expect(scoreMiniShadowQuestionnaire(data, getter).status).toBe("invalid");
    expect(scoreMiniShadowQuestionnaire(data, { ...base(), [Symbol("extra")]: "3" }).status).toBe("invalid");
    const hidden = base(); Object.defineProperty(hidden, data.questions[0].id, { enumerable: false, value: "3" }); expect(scoreMiniShadowQuestionnaire(data, hidden).status).toBe("invalid");
    expect(scoreMiniShadowQuestionnaire(data, Object.assign(Object.create(null), base())).status).toBe("complete");
  });
  it("fails closed on sparse source arrays, changed mapping, scoring or missing full content", () => {
    for (const mutate of [
      (q: typeof data) => { delete q.questions[0]; },
      (q: typeof data) => { delete q.questions[0].options[0]; },
      (q: typeof data) => { delete q.profiles[0].sections[0].paragraphs[0]; },
      (q: typeof data) => { q.minimumRatedItems = 3; },
      (q: typeof data) => { q.questions[0].options[0].score = 0; },
      (q: typeof data) => { q.questions[0].options[0].directionId = "EMOTIONAL_SHUTDOWN"; },
      (q: typeof data) => { q.questions[0].reverse = true; },
      (q: typeof data) => { q.profiles[0].sections[1].id = q.profiles[0].sections[0].id; },
      (q: typeof data) => { q.source.psychometricValidationCompleted = true; },
    ]) {
      const damaged = structuredClone(data); mutate(damaged);
      expect(isMiniShadowConfigurationValid(damaged)).toBe(false);
      expect(scoreMiniShadowQuestionnaire(damaged, base()).status).toBe("unavailable");
    }
  });
  it("renders all five complete guides, sums and means in both locales and withholds inconsistent records", () => {
    const result = complete(base());
    if (!isMiniShadowConfigurationValid(data)) throw new Error("Source unavailable");
    for (const locale of ["en", "zh"] as const) {
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<QuestionnaireShadowReport quiz={data} result={result} locale={locale} />), "text/html");
      expect(doc.querySelectorAll("[data-shadow-part]")).toHaveLength(5);
      expect(doc.querySelectorAll("[data-shadow-sum]")).toHaveLength(5);
      expect([...doc.querySelectorAll("[data-shadow-mean]")].every(p => p.textContent?.includes("3.0000 / 5"))).toBe(true);
      let paragraphs = 0;
      for (const profile of data.profiles) for (const section of profile.sections) {
        const body = doc.getElementById(`shadow-report-${profile.id}-${section.id}`)!;
        expect(body.querySelector("h4")?.textContent).toBe(section.title[locale]);
        expect([...body.querySelectorAll(":scope > ul > li, :scope > p")].map(p => p.textContent)).toEqual(section.paragraphs.map(p => p[locale])); paragraphs += section.paragraphs.length;
      }
      expect(paragraphs).toBe(80);
      const ids = [...doc.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length);
      expect(doc.querySelectorAll("form, input, script")).toHaveLength(0);
      const damaged = structuredClone(result); damaged.facets.WITHDRAWAL_AVOIDANCE.mean = 3.5;
      const unavailable = renderToStaticMarkup(<QuestionnaireShadowReport quiz={data} result={damaged} locale={locale} />);
      expect(unavailable).toContain('role="status"'); expect(unavailable).not.toContain("data-shadow-part");
    }
  });
});
