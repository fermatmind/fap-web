import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireSecsReport } from "@/components/questionnaires/QuestionnaireSecsReport";
import { isSecsConfigurationValid } from "@/lib/questionnaires/secs";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/conservatism.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/conservatism-reference.json");
type Domain = "social" | "economic";
type Row = { sourceIndex: number; domain: Domain; reverse: boolean; term: string };
type State = { rated: number; sum: number; codes: string };
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; sourceReadback: { parsedSource: Row[]; states: Record<Domain, State[]>; sourceSHA256: string } };
const rows = reference.sourceReadback.parsedSource;
const all = (value = "50"): QuestionnaireAnswers => Object.fromEntries(rows.map(row => [`SECS_${String(row.sourceIndex).padStart(2, "0")}`, value]));
const complete = (answers: QuestionnaireAnswers) => {
  const result = scoreQuestionnaire(quiz, answers);
  assert.equal(result.status, "complete");
  if (result.status !== "complete" || !("secsDomains" in result)) throw new Error("No two-domain SECS result");
  for (const field of ["profileId", "profileIds", "total", "percentile", "rank", "quadrant", "party", "diagnosis"]) assert.equal(field in result, false);
  return result;
};

describe("T178 complete historical 2013 U.S. SECS twelve-term edition", () => {
  it("preserves complete source terms, two reverse keys, original7/5groupings and two FULL8 guides", () => {
    expect(isSecsConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.formCode).toBe("fm_secs_2013_us_warmth_12"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(reference.sourceReadback.sourceSHA256).toBe("f1f5f19ccec42ff551a6aea668c1e0980f3122388ee4e70103673fabd4d0ba3d");
    expect(quiz.questions).toHaveLength(12); expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual(["SECS_01", "SECS_05"]);
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["social", 7], ["economic", 5]]);
    expect(quiz.questions[5].options[0].directionId).toBe("economic"); expect(quiz.questions[2].options[0].directionId).toBe("social");
    for (const p of quiz.profiles) {
      expect(p.sections).toHaveLength(8); expect(p.headline).not.toEqual(p.summary);
      expect([p.summary.en, p.scoreReading.en, ...p.sections.flatMap(s => s.paragraphs.map(p => p.en))].join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(600);
      expect(p.sections.map(s => s.id)).toContain("worked-example"); expect(p.sections.map(s => s.id)).toContain("counterexample"); expect(p.seo!.title.en.length).toBeLessThanOrEqual(65);
    }
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const o = value as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(String(o.en).trim()).not.toBe(""); expect(String(o.zh)).toMatch(/\p{Script=Han}|^[\d ./%—–-]+$/u); } else Object.values(o).forEach(visit);
    }; visit(quiz);
  });

  it("matches44928independentpairedrated-sumstates and144singleitemvariants, including zero and withheld domains", () => {
    let compared = 0;
    for (const social of reference.sourceReadback.states.social) for (const economic of reference.sourceReadback.states.economic) {
      const answers: QuestionnaireAnswers = {}, expected: Record<string, unknown> = {};
      for (const [id, state] of Object.entries({ social, economic })) {
        const sourceRows = rows.filter(row => row.domain === id), total = sourceRows.length;
        sourceRows.forEach((row, i) => { answers[`SECS_${String(row.sourceIndex).padStart(2, "0")}`] = state.codes[i] === "n" ? "na" : String("0123456789a".indexOf(state.codes[i]) * 10); });
        expected[id] = { rated: state.rated, total, sum: state.rated === total ? state.sum : null, mean: state.rated === total ? state.sum / total : null };
      }
      assert.deepEqual(complete(answers).secsDomains, expected); compared++;
    }
    expect(compared).toBe(44928);
    for (const row of rows) for (const value of [...Array.from({ length: 11 }, (_, i) => String(i * 10)), "na"]) {
      const answers = all(); answers[`SECS_${String(row.sourceIndex).padStart(2, "0")}`] = value;
      for (const id of ["social", "economic"] as const) {
        const sourceRows = rows.filter(row => row.domain === id), valid = sourceRows.filter(row => answers[`SECS_${String(row.sourceIndex).padStart(2, "0")}`] !== "na");
        const sum = valid.reduce((n, row) => { const raw = Number(answers[`SECS_${String(row.sourceIndex).padStart(2, "0")}`]); return n + (row.reverse ? 100 - raw : raw); }, 0);
        assert.deepEqual(complete(answers).secsDomains[id], { rated: valid.length, total: sourceRows.length, sum: valid.length === sourceRows.length ? sum : null, mean: valid.length === sourceRows.length ? sum / sourceRows.length : null });
      }
    }
    console.info("SECS:44928 paired rated/sum states and144singleitem variants;not12^12jointanswers,psychometricvalidationorcurrentcrossculturalequivalence.");
  });

  it("renders both complete reports, precise examples, zero and all/partialNA in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["neutral", "example", "zero", "partial", "na"]) {
      const answers = all(mode === "na" ? "na" : "50");
      if (mode === "example") { answers.SECS_01 = "20"; answers.SECS_05 = "80"; }
      if (mode === "partial") answers.SECS_01 = "na";
      if (mode === "zero") rows.forEach(row => { answers[`SECS_${String(row.sourceIndex).padStart(2, "0")}`] = row.reverse ? "100" : "0"; });
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireSecsReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-secs-domain]")).toHaveLength(2); expect(dom.querySelectorAll("[data-secs-guide]")).toHaveLength(2); expect(dom.querySelectorAll("h4")).toHaveLength(16);
      expect(dom.querySelectorAll("[data-secs-insufficient]")).toHaveLength(mode === "na" ? 2 : mode === "partial" ? 1 : 0);
      for (const id of ["social", "economic"] as const) { const score = result.secsDomains[id], el = dom.querySelector(`[data-secs-domain="${id}"]`)!;
        expect(el.querySelector("[data-secs-sum]")?.textContent).toBe(score.sum === null ? locale === "en" ? "Insufficient information" : "资料不足" : String(score.sum));
        expect(el.querySelector("[data-secs-mean]")?.textContent).toBe(score.mean === null ? locale === "en" ? "Insufficient information" : "资料不足" : `${score.mean.toFixed(2)} / 100`);
      }
      if (mode === "example") { expect(result.secsDomains.social.sum).toBe(380); expect(result.secsDomains.social.mean!.toFixed(2)).toBe("54.29"); expect(result.secsDomains.economic.sum).toBe(220); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("fails closed on missing input, invalid selections, altered source keys/groups and stale drafts", () => {
    const partial = all(); delete partial.SECS_12; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 11 });
    for (const invalid of [null, [], new Date(), { unknown: "50" }, { SECS_01: 50 }, { SECS_01: "1" }, { SECS_01: "110" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const mutate of [(x: Questionnaire) => { x.questions[0].reverse = false; }, (x: Questionnaire) => { x.questions[5].options[0].directionId = "social"; }, (x: Questionnaire) => { x.questions[0].options[0].score = 1; }]) { const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); }
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { SECS_01: "0" } }), 200)).toEqual({ SECS_01: "0" });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { SECS_01: "0" } }), 86400100)).toBeNull();
  });

  it("publishes6nativepages, full visible method, canonical pairs, sitemap and same-language discovery without private scores", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/conservatism`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const method = dom.querySelector('[aria-labelledby="questionnaire-method"]')!; expect(method.querySelectorAll("p")).toHaveLength(3); expect(method.closest("details")).toBeNull(); for (const section of quiz.guide) expect(method.textContent).toContain(section.paragraphs[0][locale]);
      expect(dom.textContent).toContain(locale === "en" ? "SECS 2013 U.S. issues" : "SECS2013美国议题");
      for (const p of quiz.profiles) {
        const publicPath = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
        expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/conservatism/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/conservatism/results/${p.id}` });
        expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-secs-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
