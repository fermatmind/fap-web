import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireFreudianReport } from "@/components/questionnaires/QuestionnaireFreudianReport";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/freudian-personality.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/freudian-personality-reference.json");
type State = { rated: number; sum: number; codes: string; fullMean: number | null };
const reference = JSON.parse(bytes.toString()) as { originalItems: { id: string; domain: string }[]; questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; scoreWitnesses: { perDomainStates: State[]; workedExamples: Record<string, { sum: number; mean: string; codes: number[] }> } };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(reference.originalItems.map(row => [row.id, value]));
const independent = (answers: QuestionnaireAnswers) => Object.fromEntries(["support", "guarded", "spontaneous", "structure", "overt", "argument", "expressive", "private"].map(id => {
  const rows = reference.originalItems.filter(row => row.domain === id), valid = rows.filter(row => answers[row.id] !== "na"), sum = valid.reduce((n, row) => n + Number(answers[row.id]), 0);
  return [id, { rated: valid.length, total: 6, sum, mean: valid.length === 6 ? Math.round(sum / 6 * 10) / 10 : null }];
}));
const complete = (answers: QuestionnaireAnswers) => {
  const result = scoreQuestionnaire(quiz, answers); assert.equal(result.status, "complete");
  if (result.status !== "complete" || !("facets" in result)) throw new Error("No eight-theme frequency report");
  assert.deepEqual(result.facets, independent(answers));
  for (const key of ["profileId", "profileIds", "total", "rank", "percentile", "diagnosis", "gender", "developmentalStage"]) assert.equal(key in result, false);
  return result;
};

describe("T180 original historical-vocabulary reflection, without clinical or developmental labels", () => {
  it("preserves48originalbilingualitems/8x6directfrequencyratings and8FULL8guides under an explicit original edition", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.kind).toBe("likert"); expect(quiz.minimumRatedItems).toBe(6);
    expect(quiz.questions).toHaveLength(48); expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.formCode).toBe("fm_freudian_historical_themes_48_v1"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.title.en).toContain("Original Historical Reflection"); expect(quiz.title.zh).toContain("原创历史词汇反思版"); expect(quiz.seoTitle.en).toContain("Original Historical Reflection"); expect(quiz.instructions!.en).toContain("past four weeks");
    expect(quiz.directions.map(d => d.id)).toEqual(["support", "guarded", "spontaneous", "structure", "overt", "argument", "expressive", "private"]);
    for (const [index, question] of quiz.questions.entries()) { expect(question.id).toBe(`FRE_${String(index + 1).padStart(3, "0")}`); expect(question.reverse).toBe(false); expect(question.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(question.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(question.options[0].directionId).toBe(quiz.directions[index % 8].id); }
    for (const p of quiz.profiles) { expect(quiz.questions.filter(q => q.options[0].directionId === p.id)).toHaveLength(6); expect(p.sections).toHaveLength(8); expect(p.headline).not.toEqual(p.summary); expect(p.sections.map(s => s.id)).toEqual(["historical-scope", "higher-reading", "lower-reading", "mixed-context", "worked-example", "counterexample", "next-step", "source-and-method"]); expect([p.summary.en, p.scoreReading.en, ...p.sections.flatMap(s => s.paragraphs.map(p => p.en))].join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(600); expect(p.seo!.title.en.length).toBeLessThanOrEqual(65); }
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const o = value as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(String(o.en).trim()).not.toBe(""); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(visit);
    }; visit(quiz);
  });

  it("matches728per-domainrated-sumstates/288singlevariants/512seededvectors without6^48claims", () => {
    let compared = 0, single = 0;
    expect(reference.scoreWitnesses.perDomainStates).toHaveLength(91);
    for (const direction of quiz.directions) for (const state of reference.scoreWitnesses.perDomainStates) {
      const answers = all(), rows = reference.originalItems.filter(row => row.domain === direction.id); rows.forEach((row, i) => { answers[row.id] = state.codes[i] === "n" ? "na" : state.codes[i]; });
      const score = complete(answers).facets[direction.id]; assert.equal(score.rated, state.rated); assert.equal(score.sum, state.sum); assert.equal(score.mean, state.rated === 6 ? Math.round(state.fullMean! * 10) / 10 : null); compared++;
    }
    for (const row of reference.originalItems) for (const value of ["1", "2", "3", "4", "5", "na"]) { const answers = all(); answers[row.id] = value; complete(answers); single++; }
    let seed = 18048;
    for (let index = 0; index < 512; index++) { const answers = all(); for (const row of reference.originalItems) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; answers[row.id] = index % 2 ? ["1", "2", "3", "4", "5", "na"][seed % 6] : String(1 + seed % 5); } complete(answers); }
    expect([compared, single]).toEqual([728, 288]); console.info("Freudianreflection:728per-domainrated/sumstates+288singlevariants+512seededvectors;not6^48jointanswers,constructindependenceorpsychometricvalidation.");
  });

  it("shows8separatesummarycards andall64fullsections,preciserawsummeans andNA in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["neutral", "examples", "minimum", "maximum", "partial", "na"]) {
      const answers = all(mode === "na" ? "na" : mode === "minimum" ? "1" : mode === "maximum" ? "5" : "3");
      if (mode === "partial") answers.FRE_001 = "na";
      if (mode === "examples") for (const [id, example] of Object.entries(reference.scoreWitnesses.workedExamples)) reference.originalItems.filter(row => row.domain === id).forEach((row, i) => { answers[row.id] = String(example.codes[i]); });
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireFreudianReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-freudian-domain]")).toHaveLength(8); expect(dom.querySelectorAll("[data-freudian-guide]")).toHaveLength(8); expect(dom.querySelectorAll("h4")).toHaveLength(64); expect(dom.querySelectorAll("[data-freudian-insufficient]")).toHaveLength(mode === "na" ? 8 : mode === "partial" ? 1 : 0);
      for (const direction of quiz.directions) { const score = result.facets[direction.id], el = dom.querySelector(`[data-freudian-domain="${direction.id}"]`)!, missing = locale === "en" ? "Insufficient information" : "资料不足";
        expect(el.querySelector("[data-freudian-sum]")?.textContent).toBe(score.rated === 6 ? String(score.sum) : missing); expect(el.querySelector("[data-freudian-mean]")?.textContent).toBe(score.rated === 6 ? `${(score.sum / 6).toFixed(2)} / 5` : missing);
        if (mode === "examples") { const example = reference.scoreWitnesses.workedExamples[direction.id]; expect(score.sum).toBe(example.sum); expect(el.querySelector("[data-freudian-mean]")?.textContent).toBe(`${example.mean} / 5`); }
      }
      for (const p of quiz.profiles) for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(dom.textContent).not.toMatch(/剩余电量百分比|较高的负担与较高的恢复感|battery remaining|stronger recovery/); const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("rejects invalid/incomplete choices,malformedoptions and stale drafts while allNAstayscomplete", () => {
    const partial = all(); delete partial.FRE_048; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 47 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "3" }, { FRE_001: 3 }, { FRE_001: "0" }, { FRE_001: "6" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 3; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { FRE_001: "5" } }), 200)).toEqual({ FRE_001: "5" }); expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { FRE_001: "5" } }), 86400100)).toBeNull();
    const result = complete(all("na")); expect(Object.values(result.facets).every(x => x.rated === 0 && x.mean === null)).toBe(true);
  });

  it("publishes18complete nativepages with original-editionH1/SEO,visiblemethod,canonicalpairs and public-only guides", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/freudian-personality`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const method = dom.querySelector('[aria-labelledby="questionnaire-method"]')!; expect(method.querySelectorAll("p")).toHaveLength(3); expect(method.closest("details")).toBeNull(); for (const section of quiz.guide) expect(method.textContent).toContain(section.paragraphs[0][locale]);
      for (const p of quiz.profiles) {
        const publicPath = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const section of p.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); expect(meta.title).toBe(p.seo!.title[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/freudian-personality/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/freudian-personality/results/${p.id}` });
        expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-freudian-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
