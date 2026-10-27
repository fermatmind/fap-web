import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireHexacoReport } from "@/components/questionnaires/QuestionnaireHexacoReport";
import { isLikertConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/hexaco.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/hexaco-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; sourceKey: { id: string; domain: string; facet: string; reverse: boolean; promptEN: string; sourceIndex: number }[] };
const all = (value = "3"): QuestionnaireAnswers => Object.fromEntries(reference.questions.map(q => [q.id, value]));
const independent = (answers: QuestionnaireAnswers) => Object.fromEntries(["H", "E", "X", "A", "C", "O"].map(id => {
  const rows = reference.sourceKey.filter(r => r.domain === id), valid = rows.filter(r => answers[r.id] !== "na");
  const sum = valid.reduce((n, r) => n + (r.reverse ? 6 - Number(answers[r.id]) : Number(answers[r.id])), 0);
  return [id, { sum, rated: valid.length, total: 40, mean: valid.length === 40 ? Math.round(sum / 40 * 10) / 10 : null }];
}));
const check = (answers: QuestionnaireAnswers) => {
  const result = scoreQuestionnaire(quiz, answers);
  assert.equal(result.status, "complete"); if (result.status !== "complete" || !("facets" in result)) throw new Error("No six-domain result");
  assert.deepEqual(result.facets, independent(answers));
  for (const field of ["profileId", "profileIds", "total", "percentile", "rank", "diagnosis", "career", "facetScores"]) assert.equal(field in result, false);
  return result;
};

describe("T177 full preliminary public-domain IPIP HEXACO-like 240-item edition", () => {
  it("preserves all240 source English/signs/24facets,interleaved six40itemdomains and six FULL8 guides", () => {
    expect(isLikertConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(240); expect(quiz.minimumRatedItems).toBe(40);
    expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.source.formCode).toBe("fm_ipip_hexaco_preliminary240_accuracy_v1"); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.directions.map(d => d.id)).toEqual(["H", "E", "X", "A", "C", "O"]);
    expect(new Set(reference.sourceKey.map(r => r.promptEN)).size).toBe(240); expect(reference.sourceKey.filter(r => r.reverse)).toHaveLength(122);
    const facets = new Map<string, number>();
    for (const [i, source] of reference.sourceKey.entries()) {
      expect(source.sourceIndex).toBe(i + 1); expect(source.id).toBe(`HEX_${String(i + 1).padStart(3, "0")}`);
      const item = quiz.questions.find(q => q.id === source.id)!; expect(item.prompt.en).toBe(source.promptEN); expect(item.reverse).toBe(source.reverse); expect(item.options[0].directionId).toBe(source.domain);
      facets.set(source.facet, (facets.get(source.facet) ?? 0) + 1);
    }
    expect(facets.size).toBe(24); expect([...facets.values()]).toEqual(Array(24).fill(10));
    for (const [i, item] of quiz.questions.entries()) expect(item.options[0].directionId).toBe(["H", "E", "X", "A", "C", "O"][i % 6]);
    for (const direction of quiz.directions) {
      expect(quiz.questions.filter(q => q.options[0].directionId === direction.id)).toHaveLength(40);
      const profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!; expect(profile.sections).toHaveLength(8);
      expect(profile.sections.map(s => s.id)).toEqual(["four-facets", "higher-reading", "lower-reading", "mixed-reading", "worked-example", "counterexample", "next-step", "source-and-method"]);
      const words = [profile.summary.en, profile.scoreReading.en, ...profile.sections.flatMap(s => s.paragraphs.map(p => p.en))].join(" ").split(/\s+/); expect(words.length).toBeGreaterThanOrEqual(600);
      expect(profile.seo!.title.en.length).toBeLessThanOrEqual(65);
    }
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>;
      if ("en" in obj || "zh" in obj) { expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(String(obj.en).trim()).not.toBe(""); expect(obj.zh).toMatch(/\p{Script=Han}/u); }
      else Object.values(obj).forEach(visit);
    }; visit(quiz);
  });

  it("matches966 per-domain attainable full sums,1200singleitemperturbations,246missingstates and512seededjointvectors", () => {
    let sums = 0, perturbations = 0, missing = 0;
    for (const domain of quiz.directions) {
      const rows = reference.sourceKey.filter(r => r.domain === domain.id);
      for (let total = 40; total <= 200; total++) {
        const answers = all(); let extra = total - 40;
        for (const row of rows) { const value = 1 + Math.min(4, extra); extra -= value - 1; answers[row.id] = String(row.reverse ? 6 - value : value); }
        const result = check(answers); assert.equal(result.facets[domain.id].sum, total); sums++;
      }
      for (let rated = 0; rated <= 40; rated++) { const answers = all(); rows.slice(rated).forEach(r => { answers[r.id] = "na"; }); check(answers); missing++; }
    }
    for (const row of reference.sourceKey) for (const value of ["1", "2", "3", "4", "5"]) { const answers = all(); answers[row.id] = value; check(answers); perturbations++; }
    let seed = 177240;
    for (let n = 0; n < 512; n++) { const answers = all(); for (const row of reference.sourceKey) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; answers[row.id] = n % 2 === 0 ? String(1 + seed % 5) : ["1", "2", "3", "4", "5", "na"][seed % 6]; } check(answers); }
    expect([sums, perturbations, missing]).toEqual([966, 1200, 246]);
    console.info("HEXACO:966 per-domain full-sum witnesses/1200 single-item/246 rated-count/512 seeded vectors, not6^240joint attempts or psychometric validation.");
  });

  it("renders precise unrounded-sum means,all six FULL8 and explicit NA in both languages without battery/typecopy", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["middle", "na", "partial", "example"]) {
      const answers = all(mode === "na" ? "na" : "3"); if (mode === "partial") answers.HEX_001 = "na"; if (mode === "example") answers.HEX_001 = "5";
      const result = check(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireHexacoReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-hexaco-domain]")).toHaveLength(6); expect(dom.querySelectorAll("[data-hexaco-guide]")).toHaveLength(6); expect(dom.querySelectorAll("h4")).toHaveLength(48);
      expect(dom.querySelectorAll("[data-hexaco-insufficient]")).toHaveLength(mode === "na" ? 6 : mode === "partial" ? 1 : 0);
      for (const profile of quiz.profiles) for (const s of profile.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      for (const direction of quiz.directions) { const facet = result.facets[direction.id], el = dom.querySelector(`[data-hexaco-domain="${direction.id}"]`)!;
        expect(el.querySelector("[data-hexaco-sum]")?.textContent).toBe(facet.rated === 40 ? String(facet.sum) : locale === "en" ? "Insufficient information" : "资料不足");
        expect(el.querySelector("[data-hexaco-mean]")?.textContent).toBe(facet.rated === 40 ? `${(facet.sum / 40).toFixed(2)} / 5` : locale === "en" ? "Insufficient information" : "资料不足");
      }
      if (mode === "example") { expect(dom.querySelector('[data-hexaco-domain="H"] [data-hexaco-sum]')?.textContent).toBe("122"); expect(dom.querySelector('[data-hexaco-domain="H"] [data-hexaco-mean]')?.textContent).toBe("3.05 / 5"); }
      const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
      expect(dom.textContent).not.toMatch(/battery remaining|reported demands|剩余电量|频率回答/);
      if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
    }
  });

  it("rejects incomplete/invalid input,malformedoptions and stale drafts without silently imputing answers", () => {
    const partial = all(); delete partial.HEX_240; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 239 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "3" }, { HEX_001: "0" }, { HEX_001: "6" }, { HEX_001: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].options[0].score = 3; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { HEX_001: "5" } }), 200)).toEqual({ HEX_001: "5" });
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { HEX_001: "5" } }), 86400100)).toBeNull();
    expect(check(all("na")).facets.H).toEqual({ rated: 0, sum: 0, total: 40, mean: null });
  });

  it("publishes14complete native pages with same-language hub,sitemap,canonical and hreflang without private scores", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/hexaco`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]);
      const entryDom = document.createElement("div"); entryDom.innerHTML = html; const method = entryDom.querySelector('[aria-labelledby="questionnaire-method"]')!; expect(method.querySelectorAll("p")).toHaveLength(3); for (const section of quiz.guide) expect(method.textContent).toContain(section.paragraphs[0][locale]); expect(method.closest("details")).toBeNull();
      expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`); expect(html).toContain(locale === "en" ? "Preliminary IPIP 240 items" : "preliminary IPIP240条");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, html = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const s of profile.sections) for (const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
        expect(meta.title).toBe(profile.seo!.title[locale]); expect(meta.description).toBe(profile.seo!.description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`);
        expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/hexaco/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/hexaco/results/${profile.id}` });
        expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-hexaco-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
