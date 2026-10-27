import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireLoveConflictProcessReport } from "@/components/questionnaires/QuestionnaireLoveConflictProcessReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/love-fight-style.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/love-fight-style-source-reference.json");
const source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"]; parts: (Questionnaire["directions"][number] & { item_numbers: number[] })[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/love-fight-style-profiles-reference.json");
const positive = [1, 2, 3, 4, 5];
const literal = [positive, positive, positive, positive, positive];
const baseline = () => Object.fromEntries(quiz.questions.map(q => [q.id, "3"]));
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw Error("Wrong love-conflict-process result kind");
  return result;
}
function extreme(n: 1 | 5) { return Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(literal[i % 5].indexOf(n) + 1)])); }
describe("T095 original conflict-process reflection without ranking or assigned fight types", () => {
  it("binds twenty original bilingual items, four five-item areas and four full eight-section guides", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(quiz.kind).toBe("likert"); expect(quiz.minimumRatedItems).toBe(5); expect(quiz.questions).toEqual(source.questions); expect(quiz.directions).toEqual(source.parts.map(({ id, title, itemCount }) => ({ id, title, itemCount }))); expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex")); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString())); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (let i = 0; i < 20; i++) { const q = quiz.questions[i]; expect(q.id).toBe(`LCP_${String(i + 1).padStart(2, "0")}`); expect(q.reverse).toBe(false); expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(q.options.every(o => o.directionId === quiz.directions[Math.floor(i / 5)].id)).toBe(true); expect(q.prompt.zh).toMatch(/\p{Script=Han}/u); for (const option of q.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh).toMatch(/\p{Script=Han}/u); } expect(q.correctOptionId).toBeUndefined(); }
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(8); expect(new Set(profile.sections.map(s => s.id)).size).toBe(8); expect(profile.seo?.title.en.trim()).not.toBe(""); expect(profile.seo?.title.zh.trim()).not.toBe(""); }
    for (const locale of ["en", "zh"] as const) expect(new Set(quiz.profiles.map(p => p.seo!.description[locale])).size).toBe(4);
    expect(quiz.instructions!.en).toContain("window is editorial"); expect(quiz.introduction.en).toContain("not established independent factors"); expect(quiz.title.en).toContain("Original Process Reflection"); expect(quiz.title.zh).toContain("原创过程反思"); expect(quiz.introduction.en).toContain("does not validate this new item set");
  });
  it("matches12500separatepartvectors and128 NA masks without ranking four observation areas", () => {
    const baselineAnswers = baseline(); let witnesses = 0, masks = 0;
    for (let facet = 0; facet < 4; facet++) {
      const sums = new Set<number>();
      for (let n = 0; n < 3125; n++) {
        const answers = { ...baselineAnswers }; let digits = n, expected = 0;
        for (let j = 0; j < 5; j++) { const digit = digits % 5; digits = Math.floor(digits / 5); answers[`LCP_${String(facet * 5 + j + 1).padStart(2, "0")}`] = String(digit + 1); expected += literal[j][digit]; }
        const result = complete(answers);
        for (let other = 0; other < 4; other++) { const sum = other === facet ? expected : 15; assert.deepEqual(result.facets[quiz.directions[other].id], { sum, rated: 5, total: 5, mean: Math.round(sum / 5 * 10) / 10 }); }
        sums.add(expected); witnesses++;
      }
      expect([...sums].sort((a, b) => a - b)).toEqual(Array.from({ length: 21 }, (_, i) => i + 5));
      for (let mask = 0; mask < 32; mask++) {
        const answers = { ...baselineAnswers }; for (let j = 0; j < 5; j++) if (mask & (1 << j)) answers[`LCP_${String(facet * 5 + j + 1).padStart(2, "0")}`] = "na";
        const result = complete(answers), skipped = mask.toString(2).replaceAll("0", "").length;
        for (let other = 0; other < 4; other++) assert.deepEqual(result.facets[quiz.directions[other].id], other === facet ? { sum: 3 * (5 - skipped), rated: 5 - skipped, total: 5, mean: mask ? null : 3 } : { sum: 15, rated: 5, total: 5, mean: 3 }); masks++;
      }
    }
    expect(witnesses).toBe(12500); expect(masks).toBe(128); expect(Math.round(18 / 5 * 10) / 10).toBe(3.6);
    console.info("T095 4x5^5 separatepartvectors with otherparts baseline,128NA masks;not5^20jointanswers or psychometricvalidation.");
  }, 30000);
  it("keeps missing, invalid, insufficient, complete minimum and maximum distinct and preserves opt-in draft rules", () => {
    const missing = baseline(); delete missing.LCP_20; expect(scoreQuestionnaire(quiz, missing)).toEqual({ status: "incomplete", answered: 19 });
    for (const invalid of [null, [], new Date(), { BAD: "3" }, { LCP_01: "6" }, { LCP_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const n of [1, 5] as const) expect(Object.values(complete(extreme(n)).facets).every(s => s.mean === n && s.rated === 5)).toBe(true);
    const bad = structuredClone(quiz); bad.minimumRatedItems = 6; expect(scoreQuestionnaire(bad, baseline())).toEqual({ status: "unavailable", answered: 0 });
    const allNA = complete(Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))); expect(Object.values(allNA.facets).every(s => s.mean === null && s.rated === 0)).toBe(true);
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { LCP_01: "4", LCP_02: "na" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ LCP_01: "4", LCP_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("renders all four complete guides at minimum, near, maximum, partial and unavailable part means in both languages", () => {
    const oneNA = baseline(); oneNA.LCP_01 = "na"; const near = extreme(5); near.LCP_01 = "4";
    for (const locale of ["en", "zh"] as const) for (const answers of [extreme(1), baseline(), near, extreme(5), oneNA, Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))]) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireLoveConflictProcessReport quiz={quiz} result={result} locale={locale} />);
      for (const direction of quiz.directions) { const score = result.facets[direction.id]; expect(dom.querySelector(`[data-love-conflict-process-score="${direction.id}"]`)?.textContent).toContain(score.mean === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${score.mean.toFixed(1)} / 5`); }
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
      expect(dom.querySelectorAll("h4")).toHaveLength(32); const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.textContent).not.toMatch(/battery remaining|剩余电量|highest type|获胜类型是/);
    }
  });
  it("serves ten full native bilingual entry and guide pages with own metadata, public links and stable canonical pairs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/love-fight-style`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(ep)), metadata = await entry.generateMetadata(ep); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); const entryDom = document.createElement("div"); entryDom.innerHTML = html; const method = entryDom.querySelector('[aria-labelledby="questionnaire-method"]'); const expectedMethod = quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)); expect(expectedMethod).toHaveLength(3); expect(method?.querySelectorAll("h3")).toHaveLength(0); expect(method?.querySelectorAll("p")).toHaveLength(3); for (const section of expectedMethod) for (const paragraph of section.paragraphs) expect(method?.textContent).toContain(paragraph[locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) { const native = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(gp)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); const guideMetadata = await guide.generateMetadata(gp); expect(guideMetadata.title).toBe(profile.seo!.title[locale]); expect(guideMetadata.description).toBe(profile.seo!.description[locale]); expect(guideMetadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-love-conflict-process-score]")).toBeNull(); }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
