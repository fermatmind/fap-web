import { expect, it } from "vitest";
import data from "@/lib/questionnaires/data/orientation-exploration-test.json";
import original from "@/tests/fixtures/questionnaires/orientation-source-reference.json";
import profiles from "@/tests/fixtures/questionnaires/orientation-profiles-reference.json";
import distributions from "@/tests/fixtures/questionnaires/orientation-distribution-reference.json";
import { isMiniOrientationConfigurationValid, recordMiniOrientationQuestionnaire } from "@/lib/questionnaires/miniOrientation";

const all = (value = "na") => Object.fromEntries(data.questions.map(q => [q.id, value]));
it("preserves the original20 statements, five domains, numeric anchors and explicit skip", () => {
  expect(isMiniOrientationConfigurationValid(data)).toBe(true);
  expect(data.code).toBe(original.source_test_id);
  expect(data.questions.map(q => ({ id: q.id, domain: q.options[0].directionId, prompt: q.prompt.zh, reverse: q.reverse }))).toEqual(original.items);
  for (const q of data.questions) {
    expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]);
    expect(q.options.map(o => o.label.zh)).toEqual([...Object.values(original.numeric_labels), original.skip_zh]);
    expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]);
  }
});
it("binds all five complete bilingual readings and distinct SEO to the frozen source", () => {
  expect(data.profiles).toEqual(profiles);
  for (const locale of ["en", "zh"] as const) {
    expect(new Set(data.profiles.map(p => p.seo.title[locale])).size).toBe(5);
    expect(new Set(data.profiles.map(p => p.seo.description[locale])).size).toBe(5);
    for (const p of data.profiles) { expect(p.sections).toHaveLength(6); expect(p.sections.flatMap(s => s.paragraphs)).toHaveLength(12); }
  }
  expect(data.guide.flatMap(s => s.paragraphs)).toHaveLength(12); expect(data.faq).toHaveLength(8);
});
it("matches all6480 marginal patterns to the actual original-factory histogram witnesses, not6pow20", () => {
  const values = ["1", "2", "3", "4", "5", "na"], expected = new Map(distributions.reachableFourChoiceHistograms.map(r => [r.responseCounts, r.expected]));
  expect(expected.size).toBe(126); expect(distributions.jointExhaustive).toBe(false);
  let cases = 0;
  for (let domain = 0; domain < 5; domain++) for (let n = 0; n < 1296; n++) {
    const answers = all(), counts = [0, 0, 0, 0, 0, 0]; let remainder = n;
    for (let i = 0; i < 4; i++) { const k = remainder % 6; remainder = Math.floor(remainder / 6); answers[data.questions[domain * 4 + i].id] = values[k]; counts[k]++; }
    const r = recordMiniOrientationQuestionnaire(data, answers); if (r.status !== "complete") throw Error("complete marginal vector rejected");
    expect(r.domains[data.directions[domain].id]).toEqual(expected.get(counts.join(",")));
    expect(Object.keys(r)).toEqual(["status", "answered", "state", "domains"]); cases++;
  }
  expect(cases).toBe(distributions.marginalPatternsChecked);
});
it("distinguishes missing, all-skipped and partially skipped responses without assigning an identity", () => {
  for (const q of data.questions) { const a = all(); delete a[q.id]; expect(recordMiniOrientationQuestionnaire(data, a)).toEqual({ status: "incomplete", answered: 19 }); }
  expect(recordMiniOrientationQuestionnaire(data, all())).toMatchObject({ status: "complete", state: "ALL_SKIPPED" });
  const a = all("3"); for (let i = 0; i < 4; i++) a[data.questions[i].id] = "na";
  const r = recordMiniOrientationQuestionnaire(data, a); if (r.status !== "complete") throw Error("partial rejected");
  expect(r.state).toBe("PARTIALLY_SKIPPED"); expect(r.domains[data.directions[0].id].skipped).toBe(4);
  expect(r.domains[data.directions[1].id]).toMatchObject({ numeric: 4, uncertain: 4, skipped: 0 });
});
it("rejects forged answers without invoking accessors or imputing invalid strings", () => {
  for (const value of ["3\n", " 3", "0", "6", 3, null, undefined, true]) expect(recordMiniOrientationQuestionnaire(data, { ...all(), [data.questions[0].id]: value }).status).toBe("invalid");
  for (const value of [null, [], "3", new Date(), { ...all(), unknown: "1" }, { ...all(), [Symbol("private")]: "1" }]) expect(recordMiniOrientationQuestionnaire(data, value).status).toBe("invalid");
  let reads = 0; const getter = Object.defineProperty(all(), data.questions[0].id, { enumerable: true, get: () => { reads++; return "1"; } });
  expect(recordMiniOrientationQuestionnaire(data, getter).status).toBe("invalid"); expect(reads).toBe(0);
  const hidden = Object.defineProperty(all(), data.questions[0].id, { value: "1", enumerable: false }); expect(recordMiniOrientationQuestionnaire(data, hidden).status).toBe("invalid");
});
it("fails closed for damaged identifiers, sparse banks, altered scales and incomplete full content", () => {
  const faults: ((q: typeof data) => void)[] = [q => { q.code = "other"; }, q => { q.kind = "likert"; }, q => { delete q.questions[1]; }, q => { delete q.questions[0].options[1]; }, q => { q.questions[0].reverse = true; }, q => { q.questions[0].options[0].score = 5; }, q => { q.questions[0].options[0].directionId = "unknown"; }, q => { q.profiles[0].sections[0].paragraphs[0].en = ""; }, q => { delete q.guide[0].paragraphs[0]; }, q => { q.faq[0].answer.en = ""; }];
  for (const fault of faults) { const q = structuredClone(data); fault(q); expect(isMiniOrientationConfigurationValid(q)).toBe(false); expect(recordMiniOrientationQuestionnaire(q, all()).status).toBe("unavailable"); }
});
