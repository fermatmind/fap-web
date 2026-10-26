import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/customer-service-aptitude.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/customer-service-reference.json"), source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; checks: { id: string; expected_label_en: string; primary_url: string }[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/customer-service-profiles-reference.json");
const truth = new Map(source.checks.map(check => {
  const question = source.questions.find(q => q.id === check.id)!;
  const options = question.options.filter(o => o.label.en === check.expected_label_en);
  if (options.length !== 1) throw Error(`Reviewed key is not unique: ${check.id}`);
  return [check.id, options[0].id];
}));
function answer(counts = [6, 6, 6, 6]) {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((section, i) => quiz.questions.filter(q => q.options[0].directionId === section.id).forEach((q, j) => {
    answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id;
  }));
  return answers;
}
describe("T143 original Customer service knowledge practice", () => {
  it("binds24original bilingual tasks, reviewed keys and4complete seven-section guides", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(source.checks).toHaveLength(24);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id)));
    expect(quiz.directions.map(s => s.itemCount)).toEqual([6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(["A", "B", "C", "D"].map(position => quiz.questions.filter(q => q.correctOptionId === position).length)).toEqual([6, 6, 6, 6]);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(24);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(4); expect(q.explanation!.en.length).toBeGreaterThan(120); expect(q.explanation!.zh).toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.directionId === q.options[0].directionId && o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400); expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(readFileSync("public/fonts/noto-sans-sc/customer-service-aptitude-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("separately checks the numeric conditions and preserves fictional-policy boundaries", () => {
    const key = (id: number) => source.checks.find(c => c.id === `SERVICE_${String(id).padStart(2, "0")}`)!.expected_label_en;
    expect(9 <= 14).toBe(true); expect(key(7)).toContain("eligible");
    expect(45 > 30).toBe(true); expect(key(9)).toContain("authorized supervisor");
    expect(16 * 60 - (15 * 60 + 30)).toBe(30); expect(key(11)).toContain("16:00 today");
    expect(40 - 32).toBe(8); expect(key(19)).toContain("Difference remains to be clarified");
    const primaryHosts = new Set(["www.ombudsman.org.uk", "www.ombo.nsw.gov.au"]);
    expect(source.checks.every(c => primaryHosts.has(new URL(c.primary_url).hostname))).toBe(true);
    expect(quiz.introduction.en).toContain("no real customer message");
    expect(quiz.instructions!.en).toContain("fictional rule");
  });
  it("recomputes all2401 reachable four-section correct-count vectors without a level assignment", () => {
    let checked = 0;
    for (let a = 0; a <= 6; a++) for (let b = 0; b <= 6; b++) for (let c = 0; c <= 6; c++) for (let d = 0; d <= 6; d++) {
      const counts = [a, b, c, d], answers = answer(counts), result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw Error("Valid Customer service answer vector rejected");
      expect(result.practice.correct).toBe(a + b + c + d); expect(result.practice.total).toBe(24);
      for (const [i, section] of quiz.directions.entries()) expect(result.practice.sections[section.id]).toEqual({ correct: counts[i], total: 6 });
      for (const item of result.practice.items) expect(item.correct).toBe(answers[item.questionId] === truth.get(item.questionId));
      for (const field of ["rank", "percentile", "profileId", "ability", "type"]) expect(result).not.toHaveProperty(field);
      checked++;
    }
    expect(checked).toBe(2401);
  });
  it("shows all24 explanations and all4FULL7 guides at zero,partial and perfect counts in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const counts of [[0, 0, 0, 0], [1, 4, 5, 2], [6, 6, 6, 6]]) {
      const result = scoreQuestionnaire(quiz, answer(counts)); if (result.status !== "complete" || !("practice" in result)) throw Error("Valid report rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-practice-question="${q.id}"]`)?.textContent).toContain(q.explanation![locale]);
      for (const p of quiz.profiles) for (const section of p.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds incomplete counts, rejects malformed answers and invalid keys, and expires optional drafts", () => {
    const partial = answer(); delete partial.SERVICE_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { SERVICE_01: "unknown" }, { SERVICE_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "missing"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { SERVICE_01: "B" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ SERVICE_01: "B" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes all10 native pages with full guides, canonical pairs, sitemap membership and practice entry wording", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/customer-service-aptitude`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      for (const p of quiz.profiles) {
        const native = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
