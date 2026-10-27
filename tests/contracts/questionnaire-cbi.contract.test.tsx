import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionnaireCbiReport, QuestionnaireCbiNextSteps } from "@/components/questionnaires/QuestionnaireCbiReport";
import { isCbiConfigurationValid } from "@/lib/questionnaires/cbi";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/burnout-risk.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/burnout-risk-reference.json");
const reference = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; sourceOrderItems: { id: string; domain: string; reverse: boolean }[]; workedExamples: Record<string, { sourceCodes: number[]; sum: number; mean: string }> };
const expectedProfileSeo = {
  "personal": {
    "title": {
      "en": "CBI Personal Burnout: Six-Item Score & Guide",
      "zh": "CBI个人倦怠模块：分数与完整读法"
    },
    "description": {
      "en": "Read CBI personal burnout: six items, at least three valid answers, valid zero scores and worked examples. Separate from work-related scores; no diagnosis.",
      "zh": "阅读CBI个人倦怠模块六题的计分与完整说明：至少三题有效才计算均分，区分有效零分和资料不足，通过算例理解自述耗竭；不将分数解释为诊断或工作成因。"
    }
  },
  "work": {
    "title": {
      "en": "CBI Work-related Burnout: Score & Full Guide",
      "zh": "CBI工作相关倦怠：分数与完整读法"
    },
    "description": {
      "en": "Read seven CBI work-related items: degree and frequency ratings, reverse-scored energy and at least four valid answers. See worked examples and limits.",
      "zh": "阅读CBI工作相关倦怠七题的完整说明：保留程度与频率两种答题格式，休闲精力题反向计分，至少四题有效才计算均分；含可复算示例与使用边界，不编风险阈值。"
    }
  }
} as const;
const all = (value = "50"): QuestionnaireAnswers => Object.fromEntries(reference.sourceOrderItems.map(row => [row.id, value]));
const independent = (answers: QuestionnaireAnswers) => Object.fromEntries(["personal", "work"].map((id, index) => {
  const rows = reference.sourceOrderItems.filter(row => row.domain === id && answers[row.id] !== "na"), sum = rows.reduce((n, row) => n + (row.id === "CBI_W_07" ? 100 - Number(answers[row.id]) : Number(answers[row.id])), 0), rated = rows.length, minimum = index ? 4 : 3, sufficient = rated >= minimum;
  return [id, { rated, total: index ? 7 : 6, minimum, sum: sufficient ? sum : null, mean: sufficient ? sum / rated : null }];
}));
const complete = (answers: QuestionnaireAnswers) => {
  const result = scoreQuestionnaire(quiz, answers); assert.equal(result.status, "complete");
  if (result.status !== "complete" || !("cbiDomains" in result)) throw new Error("No CBI module report");
  assert.deepEqual(result.cbiDomains, independent(answers));
  for (const key of ["profileId", "total", "rank", "percentile", "diagnosis", "risk", "probability", "riskBand", "mbti", "client"]) assert.equal(key in result, false);
  return result;
};
const checkAttribution = (dom: HTMLElement) => {
  const source = dom.querySelector("[data-cbi-attribution]"); expect(source).not.toBeNull(); expect(source!.closest("details")).toBeNull();
  for (const href of ["https://nfa.dk/vaerktoejer/spoergeskemaer/spoergeskema-til-maaling-af-udbraendthed-cbi/copenhagen-burnout-inventory-cbi", "https://nfa.dk/media/a4wheblj/cbi-scales.pdf", "https://doi.org/10.1080/14034940510032275"]) expect(source!.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect(source!.textContent).toContain("Borritz M et al."); expect(source!.textContent).toContain("2006;34:49–58"); expect(source!.textContent).toMatch(/no author or NFA endorsement|不表示作者或NFA为本站背书/);
};

describe("T184 CBI two complete source modules with working Chinese, source minima and separate means", () => {
  it("keeps13sourceitems,2answerformats,oneenergyreversal and2FULL8 bilingualguides with explicit licensed edition", () => {
    expect(isCbiConfigurationValid(quiz)).toBe(true); expect(quiz.kind).toBe("cbi"); expect(quiz.questions).toHaveLength(13); expect(quiz.questions).toEqual(reference.questions); expect(quiz.profiles).toEqual(reference.profiles);
    expect(quiz.source.formCode).toBe("cbi_personal_work_13_zh_working_v1"); expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.directions.map(d => [d.id, d.itemCount])).toEqual([["personal", 6], ["work", 7]]); expect(quiz.questions.filter(q => q.reverse).map(q => q.id)).toEqual(["CBI_W_07"]);
    expect(quiz.title.en).toContain("CBI"); expect(quiz.instructions!.en).toContain("does not specify a numeric recall period"); expect(quiz.introduction.en).toContain("not the full nineteen-item inventory"); expect(quiz.introduction.zh).toContain("费马工作译本");
    for (const question of quiz.questions) { expect(question.options.map(o => o.id)).toEqual(["100", "75", "50", "25", "0", "na"]); expect(question.options.map(o => o.score)).toEqual([100, 75, 50, 25, 0, null]); expect(question.options[0].label.en).toBe(["CBI_W_01", "CBI_W_02", "CBI_W_03"].includes(question.id) ? "To a very high degree" : "Always"); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(8); expect(p.sections.map(s => s.id)).toEqual(["module-scope", "higher-reading", "lower-reading", "mixed-and-missing", "worked-example", "counterexample", "support-and-context", "source-and-method"]); expect([p.summary.en, p.scoreReading.en, ...p.sections.flatMap(s => s.paragraphs.map(p => p.en))].join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(600); expect(p.seo!.title.en.length).toBeLessThanOrEqual(65); }
    const visit = (value: unknown): void => { if (!value || typeof value !== "object") return; const o = value as Record<string, unknown>;
      if ("en" in o || "zh" in o) { expect(o.en).not.toMatch(/\p{Script=Han}|\bTODO\b|lorem ipsum|placeholder/u); expect(String(o.en).trim()).not.toBe(""); expect(o.zh).toMatch(/\p{Script=Han}/u); } else Object.values(o).forEach(visit);
    }; visit(quiz);
  });

  it("matches211module-ratedsumstates,78singlevariants and512seededjointvectors without6^13claim", () => {
    let compared = 0, singles = 0;
    for (const direction of quiz.directions) {
      const rows = reference.sourceOrderItems.filter(row => row.domain === direction.id), n = rows.length;
      for (let rated = 0; rated <= n; rated++) for (let sumUnits = 0; sumUnits <= 4 * rated; sumUnits++) {
        const answers = all(); rows.forEach(row => { answers[row.id] = "na"; }); let remaining = sumUnits;
        rows.slice(0, rated).forEach(row => { const units = Math.min(4, remaining); remaining -= units; answers[row.id] = String(row.id === "CBI_W_07" ? 100 - units * 25 : units * 25); });
        assert.equal(remaining, 0); complete(answers); compared++;
      }
    }
    for (const row of reference.sourceOrderItems) for (const value of ["0", "25", "50", "75", "100", "na"]) { const answers = all(); answers[row.id] = value; complete(answers); singles++; }
    let seed = 18413;
    for (let index = 0; index < 512; index++) { const answers = all(); for (const row of reference.sourceOrderItems) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; answers[row.id] = ["0", "25", "50", "75", "100", "na"][seed % 6]; } complete(answers); }
    expect([compared, singles]).toEqual([211, 78]);
  });

  it("renders2summarycards+16fullsections,validzeroes/sourcepartialminima andexactexamples in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const mode of ["middle", "examples", "minimum", "maximum", "partial", "insufficient", "na"]) {
      const answers = all(mode === "na" || mode === "partial" || mode === "insufficient" ? "na" : mode === "minimum" ? "0" : mode === "maximum" ? "100" : "50");
      if (mode === "minimum" || mode === "maximum") answers.CBI_W_07 = mode === "minimum" ? "100" : "0";
      if (mode === "examples") for (const [id, example] of Object.entries(reference.workedExamples)) reference.sourceOrderItems.filter(row => row.domain === id).forEach((row, i) => { answers[row.id] = String(example.sourceCodes[i]); });
      if (mode === "partial" || mode === "insufficient") { const valid = mode === "partial"; ["CBI_P_01", "CBI_P_02", ...(valid ? ["CBI_P_03"] : []), "CBI_W_01", "CBI_W_02", "CBI_W_03", ...(valid ? ["CBI_W_04"] : [])].forEach(id => { answers[id] = "0"; }); }
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCbiReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-cbi-domain]")).toHaveLength(2); expect(dom.querySelectorAll("[data-cbi-guide]")).toHaveLength(2); expect(dom.querySelectorAll("h4")).toHaveLength(16); expect(dom.querySelectorAll("[data-cbi-insufficient]")).toHaveLength(["na", "insufficient"].includes(mode) ? 2 : 0);
      for (const id of ["personal", "work"] as const) { const score = result.cbiDomains[id], el = dom.querySelector(`[data-cbi-domain="${id}"]`)!, missing = locale === "en" ? "Insufficient information" : "资料不足";
        expect(el.querySelector("[data-cbi-sum]")?.textContent).toBe(score.mean !== null ? String(score.sum) : missing); expect(el.querySelector("[data-cbi-mean]")?.textContent).toBe(score.mean !== null ? `${score.mean.toFixed(2)} / 100` : missing);
        if (mode === "examples") expect(el.querySelector("[data-cbi-mean]")?.textContent).toBe(`${reference.workedExamples[id].mean} / 100`);
        if (mode === "partial" || mode === "minimum") expect(score.mean).toBe(0); if (mode === "maximum") expect(score.mean).toBe(100);
      }
      for (const p of quiz.profiles) { expect(dom.textContent).toContain(p.summary[locale]); expect(dom.textContent).toContain(p.scoreReading[locale]); for (const s of p.sections) for (const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); }
      checkAttribution(dom); const ids = [...dom.querySelectorAll("[id]")].map(e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("rejectsinvalid/incomplete/configdrift andstaledrafts,whileallNAiscompletewithoutanymean", () => {
    const partial = all(); delete partial.CBI_W_07; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 12 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "50" }, { CBI_P_01: 50 }, { CBI_P_01: "99" }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const mutate of [(q: Questionnaire) => { q.questions[12].reverse = false; }, (q: Questionnaire) => { q.questions[1].options[0].label.en = "Always"; }, (q: Questionnaire) => { q.questions[0].options[4].score = 25; }, (q: Questionnaire) => { q.questions.reverse(); }]) { const bad = structuredClone(quiz); mutate(bad); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); }
    expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { CBI_P_01: "0" } }), 200)).toEqual({ CBI_P_01: "0" }); expect(readQuestionnaireDraft(quiz, JSON.stringify({ version: quiz.version, savedAt: 100, answers: { CBI_P_01: "0" } }), 86400100)).toBeNull();
    expect(Object.values(complete(all("na")).cbiDomains).every(x => x.rated === 0 && x.mean === null && x.sum === null)).toBe(true);
  });

  it("offerssourcehealth/worksupportandstopwithoutagenericMBTIrecommendation", () => {
    for (const locale of ["en", "zh"] as const) { const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireCbiNextSteps locale={locale} />); expect(dom.querySelector("[data-cbi-next-steps]")).not.toBeNull(); expect(dom.querySelector('a[href="https://www.nhs.uk/symptoms/tiredness-and-fatigue/"]')).not.toBeNull(); expect(dom.querySelector('a[href="https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work"]')).not.toBeNull(); expect(dom.querySelector(`a[href="/${locale}/tests#more-tests"]`)).not.toBeNull(); expect(dom.textContent).not.toMatch(/MBTI/); }
    const client = readFileSync("components/questionnaires/QuestionnaireClient.tsx", "utf8"); expect(client).toContain("QuestionnaireCbiNextSteps");
  });

  it("publishes6completenativepageswithvisibleattribution,sourceformatmethod,canonicalpairsandpubliconlyguides", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/burnout-risk`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
      checkAttribution(dom); expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(dom.textContent).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const method = dom.querySelector('[aria-labelledby="questionnaire-method"]')!; expect(method.querySelectorAll("p")).toHaveLength(3); expect(method.closest("details")).toBeNull(); for (const section of quiz.guide) expect(method.textContent).toContain(section.paragraphs[0][locale]);
      for (const p of quiz.profiles) { const publicPath = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), meta = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        checkAttribution(dom); expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); expect(dom.textContent).toContain(p.summary[locale]); expect(dom.textContent).toContain(p.scoreReading[locale]); for (const section of p.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); expect(meta.title).toBe(p.seo!.title[locale]); expect(meta.description).toBe(p.seo!.description[locale]); expect(meta.title).toBe(expectedProfileSeo[p.id as keyof typeof expectedProfileSeo].title[locale]); expect(meta.description).toBe(expectedProfileSeo[p.id as keyof typeof expectedProfileSeo].description[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(meta.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/burnout-risk/results/${p.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/burnout-risk/results/${p.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-cbi-mean]")).toBeNull(); if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
