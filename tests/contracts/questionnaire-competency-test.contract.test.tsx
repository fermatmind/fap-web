import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireWorkBehaviorReport, QuestionnaireWorkBehaviorNextSteps } from "@/components/questionnaires/QuestionnaireWorkBehaviorReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/competency-test.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/competency-test-source-reference.json");
const source = JSON.parse(sourceBytes.toString()) as { questions: Questionnaire["questions"]; parts: (Questionnaire["directions"][number] & { item_numbers: number[] })[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/competency-test-profiles-reference.json");
const expectedSeoTitles: Record<string, string> = {
  "message-checking-reading": "Competency Reflection: Checking Shared Understanding",
  "problem-framing-reading": "Competency Reflection: Defining a Problem and Testing an Explanation",
  "agreed-action-reading": "Competency Reflection: Agreeing Action Without Assuming Authority",
  "work-planning-reading": "Competency Reflection: Outputs, Inputs and Shared Resources",
  "response-to-change-reading": "Competency Reflection: Changing an Approach for a Reason",
  "shared-delivery-reading": "Competency Reflection: Connecting Contributions in Shared Work"
};
const literal = [[1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]];
const baseline = () => Object.fromEntries(quiz.questions.map(q => [q.id, "3"]));
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("facets" in result)) throw Error("Wrong work-behavior result kind");
  return result;
}
function extreme(n: 1 | 5) { return Object.fromEntries(quiz.questions.map((q, i) => [q.id, String(literal[i % 6].indexOf(n) + 1)])); }
describe("T107 original work-behavior frequencies without competency or hiring grades", () => {
  it("binds 36 original bilingual items, six six-item parts, complete guides and truthful source scope", () => {
    expect(isQuestionnaireConfigurationValid(quiz)).toBe(true); expect(quiz.kind).toBe("likert"); expect(quiz.minimumRatedItems).toBe(6); expect(quiz.questions).toEqual(source.questions.map(question => ({ ...question, reverse: false }))); expect(quiz.directions).toEqual(source.parts.map(({ id, title, itemCount }) => ({ id, title, itemCount }))); expect(quiz.questions).toHaveLength(36); expect(quiz.profiles).toHaveLength(6);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex")); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString())); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    for (let i = 0; i < 36; i++) { const q = quiz.questions[i]; expect(q.id).toBe(`WBEH_${String(i + 1).padStart(2, "0")}`); expect(q.reverse).toBe(false); expect(q.options.map(o => o.id)).toEqual(["1", "2", "3", "4", "5", "na"]); expect(q.options.map(o => o.score)).toEqual([1, 2, 3, 4, 5, null]); expect(q.options.every(o => o.directionId === quiz.directions[Math.floor(i / 6)].id)).toBe(true); expect(q.prompt.zh).toMatch(/\p{Script=Han}/u); for (const option of q.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh).toMatch(/\p{Script=Han}/u); } expect(q.correctOptionId).toBeUndefined(); }
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(6); expect(new Set(profile.sections.map(s => s.id)).size).toBe(6); expect(profile.seo?.title.en).toBe(expectedSeoTitles[profile.id]); expect(profile.seo?.title.zh.trim()).not.toBe(""); }
    for (const locale of ["en", "zh"] as const) expect(new Set(quiz.profiles.map(p => p.seo!.description[locale])).size).toBe(6);
    expect(quiz.instructions!.en).toContain("past four weeks"); expect(quiz.introduction.en).toContain("frequency is not proof of skill"); expect(quiz.code).toBe("FM_WORK_BEHAVIOR_REFLECTION36"); expect(quiz.source.formCode).toBe("fm_work_behaviors_six_themes36_v1");
  });
  it("matches all93750 per-facet witnesses and384 NA masks with an independent literal scoring table", () => {
    const baselineAnswers = baseline(); let witnesses = 0, masks = 0;
    for (let facet = 0; facet < 6; facet++) {
      const sums = new Set<number>();
      for (let n = 0; n < 15625; n++) {
        const answers = { ...baselineAnswers }; let digits = n, expected = 0;
        for (let j = 0; j < 6; j++) { const digit = digits % 5; digits = Math.floor(digits / 5); answers[`WBEH_${String(facet * 6 + j + 1).padStart(2, "0")}`] = String(digit + 1); expected += literal[j][digit]; }
        const result = complete(answers);
        for (let other = 0; other < 6; other++) { const sum = other === facet ? expected : 18; assert.deepEqual(result.facets[quiz.directions[other].id], { sum, rated: 6, total: 6, mean: Math.round(sum / 6 * 10) / 10 }); }
        sums.add(expected); witnesses++;
      }
      expect([...sums].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 6));
      for (let mask = 0; mask < 64; mask++) {
        const answers = { ...baselineAnswers }; for (let j = 0; j < 6; j++) if (mask & (1 << j)) answers[`WBEH_${String(facet * 6 + j + 1).padStart(2, "0")}`] = "na";
        const result = complete(answers), skipped = mask.toString(2).replaceAll("0", "").length;
        for (let other = 0; other < 6; other++) assert.deepEqual(result.facets[quiz.directions[other].id], other === facet ? { sum: 3 * (6 - skipped), rated: 6 - skipped, total: 6, mean: mask ? null : 3 } : { sum: 18, rated: 6, total: 6, mean: 3 }); masks++;
      }
    }
    expect(witnesses).toBe(93750); expect(masks).toBe(384); expect(Math.round(23 / 6 * 10) / 10).toBe(3.8);
    console.info("T107 6x5^6 facet witnesses with otherparts baseline,384NA masks;not5^36jointanswers or psychometricvalidation.");
  }, 30000);
  it("keeps missing, invalid, insufficient, complete minimum and maximum distinct and preserves opt-in draft rules", () => {
    const missing = baseline(); delete missing.WBEH_36; expect(scoreQuestionnaire(quiz, missing)).toEqual({ status: "incomplete", answered: 35 });
    for (const invalid of [null, [], new Date(), { BAD: "3" }, { WBEH_01: "6" }, { WBEH_01: 3 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    for (const n of [1, 5] as const) expect(Object.values(complete(extreme(n)).facets).every(s => s.mean === n && s.rated === 6)).toBe(true);
    const bad = structuredClone(quiz); bad.minimumRatedItems = 7; expect(scoreQuestionnaire(bad, baseline())).toEqual({ status: "unavailable", answered: 0 });
    const allNA = complete(Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))); expect(Object.values(allNA.facets).every(s => s.mean === null && s.rated === 0)).toBe(true);
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { WBEH_01: "4", WBEH_02: "na" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ WBEH_01: "4", WBEH_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("renders all six complete guides at minimum, near, maximum, partial and unavailable part means in both languages", () => {
    const oneNA = baseline(); oneNA.WBEH_01 = "na"; const near = extreme(5); near.WBEH_01 = "4";
    for (const locale of ["en", "zh"] as const) for (const answers of [extreme(1), baseline(), near, extreme(5), oneNA, Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))]) {
      const result = complete(answers), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireWorkBehaviorReport quiz={quiz} result={result} locale={locale} />);
      for (const direction of quiz.directions) { const score = result.facets[direction.id]; expect(dom.querySelector(`[data-work-behavior-score="${direction.id}"]`)?.textContent).toContain(score.mean === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${score.mean.toFixed(1)} / 5`); }
      for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
      expect(dom.querySelectorAll("h4")).toHaveLength(36); const ids = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(ids).size).toBe(ids.length); expect(dom.textContent).not.toMatch(/battery remaining|剩余电量|highest type|获胜类型是/);
    }
  });
  it("offers finished next steps without aptitude, hiring or MBTI conversion", () => {
    for (const locale of ["en", "zh"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireWorkBehaviorNextSteps locale={locale} />);
      expect(dom.querySelector("h3")?.textContent).toBe(locale === "zh" ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.");
      expect(Array.from(dom.querySelectorAll("a"), a => a.getAttribute("href"))).toEqual([`/${locale}/tests/explore/competency-test#questionnaire-results`, `/${locale}/tests#more-tests`]);
      expect(dom.textContent).toContain(locale === "zh" ? "频率不证明能力" : "Frequency does not prove ability");
    }
  });
  it("serves fourteen full native bilingual entry and guide pages with own metadata, public links and stable canonical pairs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/competency-test`, ep = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(ep)), metadata = await entry.generateMetadata(ep); expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.description).toBe(quiz.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); const entryDom = document.createElement("div"); entryDom.innerHTML = html; const method = entryDom.querySelector('section[aria-labelledby="questionnaire-method"]'); expect(method).not.toBeNull(); const methodSections = quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)); expect(methodSections).toHaveLength(3); expect(method!.querySelectorAll(":scope > p")).toHaveLength(3); for (const s of methodSections) for (const p of s.paragraphs) expect(method!.textContent).toContain(p[locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        for (const profile of quiz.profiles) { const native = `${path}/results/${profile.id}`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await guide.default(gp)); expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]); const guideMetadata = await guide.generateMetadata(gp); expect(guideMetadata.title).toBe(profile.seo!.title[locale]); expect(guideMetadata.description).toBe(profile.seo!.description[locale]); expect(guideMetadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-work-behavior-score]")).toBeNull(); }
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
