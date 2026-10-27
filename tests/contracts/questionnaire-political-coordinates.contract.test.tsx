import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnairePoliticalCoordinatesReport } from "@/components/questionnaires/QuestionnairePoliticalCoordinatesReport";
import { isPoliticalCoordinatesConfigurationValid } from "@/lib/questionnaires/politicalCoordinates";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/political-coordinates.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/political-coordinates-reference.json");
type Axis = "economic" | "social";
type State = { rated: number; negative: number; positive: number; codes: ("negative" | "positive" | "na")[]; difference: number | null };
const reference = JSON.parse(bytes.toString()) as { originalItems: { id: string; axis: Axis }[]; questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; axisStates: State[] };
const endpoints = { economic: ["left", "right"], social: ["communitarian", "liberal"] } as const;
const vector = (economicNegative = 9, socialNegative = 9): QuestionnaireAnswers => Object.fromEntries(reference.originalItems.map(row => {
  const rows = reference.originalItems.filter(item => item.axis === row.axis), index = rows.findIndex(item => item.id === row.id), negative = row.axis === "economic" ? economicNegative : socialNegative;
  return [row.id, endpoints[row.axis][index < negative ? 0 : 1]];
}));
const oracle = (answers: QuestionnaireAnswers) => Object.fromEntries((["economic", "social"] as Axis[]).map(axis => {
  const rows = reference.originalItems.filter(row => row.axis === axis), negative = rows.filter(row => answers[row.id] === endpoints[axis][0]).length, positive = rows.filter(row => answers[row.id] === endpoints[axis][1]).length, rated = negative + positive, valid = rated === 18;
  return [axis, { rated, total: 18, negativeCount: valid ? negative : null, positiveCount: valid ? positive : null, difference: valid ? positive - negative : null }];
}));
const complete = (answers: QuestionnaireAnswers) => {
  const result = scoreQuestionnaire(quiz, answers); assert.equal(result.status, "complete");
  if (result.status !== "complete" || !("politicalCoordinates" in result)) throw new Error("No original two-axis policy report");
  assert.deepEqual(result.politicalCoordinates, oracle(answers));
  for (const key of ["profileId", "total", "percentile", "purity", "party", "politician", "norm", "vote"]) assert.equal(key in result, false);
  return result;
};
const assign = (answers: QuestionnaireAnswers, axis: Axis, state: State) => reference.originalItems.filter(row => row.axis === axis).forEach((row, i) => { answers[row.id] = state.codes[i] === "na" ? "na" : endpoints[axis][state.codes[i] === "negative" ? 0 : 1]; });

describe("T181 original two-axis public-policy choices with separate raw counts and uncertainty", () => {
  it("binds36originalbilingualpolicychoices/18each/alternatingendpoints/NA and4FULL8guides", () => {
    expect(isPoliticalCoordinatesConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(quiz.kind).toBe("political-coordinates");
    expect(quiz.questions).toHaveLength(36); expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles); expect(quiz.source.formCode).toBe("fm_original_policy_coordinates_36_v1"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.title.en).toContain("Original Policy-Choice"); expect(quiz.title.zh).toContain("原创公共政策取舍"); expect(quiz.seoTitle.en).toContain("Original");
    expect(quiz.directions.map(d => d.id)).toEqual(["left", "right", "communitarian", "liberal"]);
    for (const [i, question] of quiz.questions.entries()) { expect(question.id).toBe(`POL_${String(i + 1).padStart(3, "0")}`); expect(question.options.map(o => o.score)).toEqual([1, 1, null]); expect(question.options[2].id).toBe("na"); expect(question.options[0].directionId).not.toBe(question.options[1].directionId); }
    for (const axis of ["economic", "social"] as Axis[]) expect(reference.originalItems.filter(x => x.axis === axis)).toHaveLength(18);
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.headline).not.toEqual(p.summary); expect(p.sections.map(s => s.id)).toEqual(["two-separate-axes", "policy-instruments", "worked-example", "boundary-and-na", "counterexample", "tradeoffs", "reflection", "source-and-scope"]); expect([p.summary.en, p.scoreReading.en, ...p.sections.flatMap(s => s.paragraphs.map(p => p.en))].join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(600); expect(p.seo!.title.en.length).toBeLessThanOrEqual(65); }
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const o = value as Record<string, unknown>; if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(String(o.en).trim()).not.toBe(""); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(visit); }; visit(quiz);
  });

  it("recomputes36100pairedrated-endpointstates including361completepoints/108singlevariants/512seededvectors", () => {
    expect(reference.axisStates).toHaveLength(190); let states = 0, full = 0, singles = 0;
    for (const economic of reference.axisStates) for (const social of reference.axisStates) {
      const answers = vector(); assign(answers, "economic", economic); assign(answers, "social", social); const result = complete(answers);
      assert.equal(result.politicalCoordinates.economic.difference, economic.difference); assert.equal(result.politicalCoordinates.social.difference, social.difference);
      if (economic.rated === 18 && social.rated === 18) full++; else assert.deepEqual(result.politicalCoordinateProfileIds, []); states++;
    }
    for (const row of reference.originalItems) for (const value of [...endpoints[row.axis], "na"]) { const answers = vector(); answers[row.id] = value; complete(answers); singles++; }
    let seed = 18136;
    for (let i = 0; i < 512; i++) { const answers = vector(); for (const row of reference.originalItems) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; const choices = i % 2 ? [...endpoints[row.axis], "na"] : [...endpoints[row.axis]]; answers[row.id] = choices[seed % choices.length]; } complete(answers); }
    expect([states, full, singles]).toEqual([36100, 361, 108]); console.info("Politicalcoordinates:36100pairedrated/countstates includes361fullcoordinatepairs+108singlevariants+512seededvectors;not3^36jointanswersorpsychometricvalidation.");
  });

  it("retainsallzero-axiscomparisons andrenders2counts/pointorNA plusall4FULL8 in both languages", () => {
    const expected = [
      [18, 18, ["left-communitarian"]], [18, 0, ["left-liberal"]], [0, 18, ["right-communitarian"]], [0, 0, ["right-liberal"]],
      [9, 18, ["left-communitarian", "right-communitarian"]], [9, 0, ["left-liberal", "right-liberal"]],
      [18, 9, ["left-communitarian", "left-liberal"]], [0, 9, ["right-communitarian", "right-liberal"]],
      [9, 9, ["left-communitarian", "left-liberal", "right-communitarian", "right-liberal"]],
    ] as const;
    for (const locale of ["en", "zh"] as const) for (const [a, z, matches] of expected) {
      const result = complete(vector(a, z)); expect(result.politicalCoordinateProfileIds).toEqual(matches);
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePoliticalCoordinatesReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-political-axis]")).toHaveLength(2); expect(dom.querySelectorAll("[data-political-guide]")).toHaveLength(4); expect(dom.querySelectorAll("h4")).toHaveLength(32); expect(dom.querySelector("[data-political-point]")).not.toBeNull(); expect(dom.querySelector("[role=img]")?.getAttribute("aria-label")).toBeTruthy();
      for (const axis of ["economic", "social"] as Axis[]) { const el = dom.querySelector(`[data-political-axis=${axis}]`)!, score = result.politicalCoordinates[axis]; expect(el.querySelector("[data-political-negative]")?.textContent).toBe(String(score.negativeCount)); expect(el.querySelector("[data-political-positive]")?.textContent).toBe(String(score.positiveCount)); expect(el.querySelector("[data-political-difference]")?.textContent).toBe(score.difference! > 0 ? `+${score.difference}` : String(score.difference)); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
    for (const locale of ["en", "zh"] as const) for (const mode of ["economic", "social", "all"]) {
      const answers = vector(12, 7); for (const row of reference.originalItems) if (mode === "all" || row.axis === mode) answers[row.id] = "na"; const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePoliticalCoordinatesReport quiz={quiz} result={result} locale={locale} />);
      expect(result.politicalCoordinateProfileIds).toEqual([]); expect(dom.querySelector("[data-political-point]")).toBeNull(); expect(dom.querySelector("[data-political-no-point]")).not.toBeNull(); expect(dom.querySelectorAll("[data-political-insufficient]")).toHaveLength(mode === "all" ? 2 : 1); expect(dom.querySelectorAll("[data-political-guide]")).toHaveLength(4); for (const p of quiz.profiles) for (const s of p.sections) expect(dom.textContent).toContain(s.paragraphs[0][locale]);
    }
  });

  it("failsclosedoninvalid/incomplete/configurationandstaledrafts whileallNAfinisheswithnopoint", () => {
    const partial = vector(); delete partial.POL_036; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 35 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "left" }, { POL_001: 1 }, { POL_001: "liberal" }, { POL_001: "0" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const mutate: ((q: Questionnaire) => void)[] = [q => { q.version = "2"; }, q => { q.questions[0].options[0].score = 2; }, q => { q.questions[0].options[2].score = 0; }, q => { q.questions[0].id = "POL_002"; }, q => { q.questions[0].options.reverse(); }, q => { q.profiles[0].directionIds.reverse(); }, q => { q.questions.pop(); }, q => { q.source.formCode = "another"; }];
    for (const change of mutate) { const bad = structuredClone(quiz); change(bad); expect(isPoliticalCoordinatesConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); }
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { POL_001: "left", POL_002: "na" } }), 200)).toEqual({ POL_001: "left", POL_002: "na" }); expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { POL_001: "left" } }), 86400100)).toBeNull(); const allNA = Object.fromEntries(reference.originalItems.map(row => [row.id, "na"])); const result = complete(allNA); expect(result.politicalCoordinateProfileIds).toEqual([]); expect(Object.values(result.politicalCoordinates).every(x => x.rated === 0 && x.difference === null)).toBe(true);
  });

  it("renders10nativebilingualpages withoriginaleditionmetadata/3visiblemethods/pairscanonicals/fullpubliconlybodyandhubmaps", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/political-coordinates`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default(props)); const metadata = await entry.generateMetadata(props);
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`); const method = dom.querySelector('[aria-labelledby="questionnaire-method"]')!; expect(method.querySelectorAll("p")).toHaveLength(3); expect(method.closest("details")).toBeNull(); for (const s of quiz.guide) expect(method.textContent).toContain(s.paragraphs[0][locale]);
      for (const p of quiz.profiles) { const publicPath = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(props)); const meta = await guide.generateMetadata(props);
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const para of s.paragraphs) expect(dom.textContent).toContain(para[locale]); expect(meta.title).toBe(p.seo!.title[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/political-coordinates/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/political-coordinates/results/${p.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-political-point]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
