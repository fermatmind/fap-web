import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isRosenbergConfigurationValid } from "@/lib/questionnaires/rosenberg";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireRosenbergReport } from "@/components/questionnaires/QuestionnaireRosenbergReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/self-esteem.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/rses-source-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; positive_item_numbers: number[]; reverse_item_numbers: number[]; scored_anchors: string[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/rses-profiles-reference.json");
const reference = JSON.parse(readFileSync("tests/fixtures/questionnaires/rses-scoring-reference.json", "utf8")) as { literal_per_item_response_scores: number[][]; independent_DP_distribution: Record<string, number>; source_sha256: string };
const anchors = ["sa", "a", "d", "sd"];
function answersForTotal(total: number): QuestionnaireAnswers {
  let remaining = total;
  const answers = Object.fromEntries(quiz.questions.map((question, index) => {
    const contribution = Math.min(3, remaining); remaining -= contribution;
    return [question.id, anchors[reference.literal_per_item_response_scores[index].indexOf(contribution)]];
  }));
  assert.equal(remaining, 0); return answers;
}
function complete(answers: QuestionnaireAnswers) {
  const result = scoreQuestionnaire(quiz, answers);
  if (result.status !== "complete" || !("rosenberg" in result)) throw Error("RSES report rejected");
  return result;
}
describe("T191 UMD-order Rosenberg raw total, without invented cutoffs", () => {
  it("binds ten original English statements, working Chinese, four scored anchors and one full-range guide", () => {
    expect(isRosenbergConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toEqual(source.questions);
    expect(quiz.questions).toHaveLength(10); expect(source.positive_item_numbers).toEqual([1, 2, 4, 6, 7]); expect(source.reverse_item_numbers).toEqual([3, 5, 8, 9, 10]); expect(source.scored_anchors).toEqual(anchors);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(reference.source_sha256).toBe(quiz.source.itemBankSha256);
    expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex")); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.profiles.map(p => p.id)).toEqual(["score-reading"]); expect(quiz.profiles[0].sections).toHaveLength(7);
    for (const q of quiz.questions) { expect(q.options.map(o => o.id)).toEqual([...anchors, "na"]); expect(q.options.map(o => o.score)).toEqual([3, 2, 1, 0, null]); expect(q.prompt.en).not.toContain("**"); expect(q.prompt.zh).toMatch(/\p{Script=Han}/u); expect(q.correctOptionId).toBeUndefined(); }
    expect(quiz.introduction.en).toContain("working translation"); expect(quiz.introduction.zh).toContain("工作译文"); expect(quiz.references?.map(r => r.url)).toContain("https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale");
    expect(readFileSync("public/fonts/noto-sans-sc/self-esteem-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks every 4^10 scored answer combination against the independent literal key and all 31 totals", () => {
    const distribution = Array<number>(31).fill(0);
    for (let n = 0; n < 1048576; n++) {
      const answers: QuestionnaireAnswers = {}; let expected = 0;
      quiz.questions.forEach((q, i) => { const digit = (n >>> (i * 2)) & 3; answers[q.id] = anchors[digit]; expected += reference.literal_per_item_response_scores[i][digit]; });
      const result = complete(answers); assert.deepEqual(result, { status: "complete", answered: 10, rosenberg: { total: expected, rated: 10, totalItems: 10, skipped: 0 } }); distribution[expected]++;
    }
    expect(distribution).toEqual(Array.from({ length: 31 }, (_, i) => reference.independent_DP_distribution[String(i)])); expect(distribution.reduce((a, b) => a + b, 0)).toBe(1048576);
    for (let total = 0; total <= 30; total++) expect(complete(answersForTotal(total)).rosenberg.total).toBe(total);
    console.info("RSES full1048576scored patterns/31totals;literal UMD order,not psychometricvalidation.");
  }, 30000);
  it("checks 1024 skip masks without imputation and keeps a real zero distinct from no total", () => {
    for (let mask = 0; mask < 1024; mask++) {
      const responses = Object.fromEntries(quiz.questions.map((q, i) => [q.id, mask & (1 << i) ? "na" : "sa"]));
      const skipped = mask.toString(2).replaceAll("0", "").length;
      expect(complete(responses).rosenberg).toEqual({ total: mask ? null : 15, rated: 10 - skipped, totalItems: 10, skipped });
    }
    expect(complete(answersForTotal(0)).rosenberg.total).toBe(0);
    const missing = answersForTotal(18); delete missing.RSES_10; expect(scoreQuestionnaire(quiz, missing)).toEqual({ status: "incomplete", answered: 9 });
    for (const invalid of [null, [], new Date(), { BAD: "sa" }, { RSES_01: "unknown" }, { RSES_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const mutations = [(v: Questionnaire) => v.questions.reverse(), (v: Questionnaire) => { v.questions[2].reverse = false; }, (v: Questionnaire) => { v.questions[0].options[0].score = 4; }, (v: Questionnaire) => v.questions[0].options.pop(), (v: Questionnaire) => { v.questions[0].id = "bad"; }, (v: Questionnaire) => { v.source.formCode = "other"; }, (v: Questionnaire) => { v.source.scoringVersion = "other"; }, (v: Questionnaire) => { v.profiles[0].directionIds = ["bad"]; }, (v: Questionnaire) => { v.source.kind = "bad"; }, (v: Questionnaire) => { v.source.itemBankVersion = "bad"; }, (v: Questionnaire) => { v.source = null!; }, (v: Questionnaire) => { v.questions = null!; }, (v: Questionnaire) => { v.questions[0] = null!; }, (v: Questionnaire) => { v.questions[0].options = null!; }, (v: Questionnaire) => { v.profiles[0] = null!; }];
    for (const mutate of mutations) { const bad = structuredClone(quiz); mutate(bad); expect(isRosenbergConfigurationValid(bad)).toBe(false); expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 }); }
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { RSES_01: "a", RSES_02: "na" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ RSES_01: "a", RSES_02: "na" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("renders the identical complete guide at zero, mixed, maximum and insufficient results in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const responses of [answersForTotal(0), answersForTotal(15), answersForTotal(18), answersForTotal(30), Object.fromEntries(quiz.questions.map(q => [q.id, "na"]))]) {
      const result = complete(responses), dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireRosenbergReport quiz={quiz} result={result} locale={locale} />);
      const text = dom.querySelector("[data-rosenberg-score]")?.textContent;
      expect(text).toContain(result.rosenberg.total === null ? (locale === "zh" ? "资料不足" : "Insufficient information") : `${result.rosenberg.total} / 30`);
      for (const section of quiz.profiles[0].sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      expect(dom.querySelectorAll("h4")).toHaveLength(7); const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("serves four full bilingual native pages, metadata pairs, sitemap links and no private score in public guides", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
      for (const locale of ["en", "zh"] as const) {
        const path = `/${locale}/tests/explore/self-esteem`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
        expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(quiz.guide[0].paragraphs[0][locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
        const native = `${path}/results/score-reading`, gp = { params: Promise.resolve({ locale, slug: quiz.slug, profile: "score-reading" }) }, ghtml = renderToStaticMarkup(await guide.default(gp)), gmeta = await guide.generateMetadata(gp), dom = document.createElement("div"); dom.innerHTML = ghtml;
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.profiles[0].title[locale]); for (const s of quiz.profiles[0].sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]); expect(dom.querySelector("[data-rosenberg-score]")).toBeNull(); expect(gmeta.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true);
      }
    } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
  it("withholds invalid source configurations through real entry, guide and image callers", async () => {
    const bad = structuredClone(quiz); bad.questions[2].reverse = false;
    vi.doMock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: async () => bad })); vi.resetModules();
    try {
      const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), image = await import("@/app/og/fun/[slug]/route");
      const ep = { params: Promise.resolve({ locale: "en", slug: quiz.slug }) }, gp = { params: Promise.resolve({ locale: "en", slug: quiz.slug, profile: "score-reading" }) };
      expect((await entry.generateMetadata(ep)).robots).toEqual({ index: false, follow: false }); expect((await guide.generateMetadata(gp)).robots).toEqual({ index: false, follow: false }); await expect(entry.default(ep)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); await expect(guide.default(gp)).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }); expect((await image.GET(new Request("https://fermatmind.com/og/fun/self-esteem?locale=en"), { params: Promise.resolve({ slug: quiz.slug }) })).status).toBe(404);
    } finally { vi.doUnmock("@/lib/questionnaires/loaders"); vi.resetModules(); }
  });
});
