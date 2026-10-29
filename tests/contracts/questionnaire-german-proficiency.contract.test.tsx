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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/german-proficiency.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/german-reference.json"), source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; stimuli: { id: string; text: string }[]; checks: { id: string; expected_label_en: string; primary_url: string }[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/german-profiles-reference.json");
const truth = new Map(source.checks.map(check => {
  const question = source.questions.find(q => q.id === check.id)!;
  const options = question.options.filter(o => o.label.en === check.expected_label_en);
  if (options.length !== 1) throw Error(`Reviewed key is not unique: ${check.id}`);
  return [check.id, options[0].id];
}));
function answer(counts = [7, 7, 7, 7]) {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((section, i) => quiz.questions.filter(q => q.options[0].directionId === section.id).forEach((q, j) => {
    answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id;
  }));
  return answers;
}
describe("T144 original German written knowledge practice", () => {
  it("binds28original bilingual tasks, reviewed keys and4complete seven-section guides", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(28); expect(source.checks).toHaveLength(28);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id)));
    expect(quiz.directions.map(s => s.itemCount)).toEqual([7, 7, 7, 7]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(["A", "B", "C", "D"].map(position => quiz.questions.filter(q => q.correctOptionId === position).length)).toEqual([7, 7, 7, 7]);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(28);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(4); expect(q.explanation!.en.length).toBeGreaterThan(120); expect(q.explanation!.zh).toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.directionId === q.options[0].directionId && o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400); expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(readFileSync("public/fonts/noto-sans-sc/german-proficiency-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("keeps the German stimuli and options unchanged across interfaces and separately checks grammar keys", () => {
    for (const item of source.stimuli) {
      const q = quiz.questions.find(q => q.id === item.id)!;
      for (const locale of ["en", "zh"] as const) expect(q.prompt[locale]).toContain(item.text);
      for (const option of q.options) expect(option.label.en).toBe(option.label.zh);
    }
    expect(source.stimuli).toHaveLength(28);
    const reviewedForms = ["Der", "den", "dem", "die", "der", "die", "des", "lerne", "wohnst", "liest", "fahren", "wohnen", "gelesen", "ist"];
    for (const [i, form] of reviewedForms.entries()) expect(source.checks[i].expected_label_en).toBe(form);
    expect(source.checks[14].expected_label_en).toBe("Ich bleibe zu Hause, weil ich krank bin.");
    expect(source.checks[19].expected_label_en).toBe("Ich weiß, dass der Kurs morgen beginnt.");
    expect(source.checks[27].expected_label_en).toBe("Für den angekündigten Regen ist das Café der Treffpunkt.");
    const primaryHosts = new Set(["grammis.ids-mannheim.de", "www.duden.de"]);
    expect(source.checks.every(c => primaryHosts.has(new URL(c.primary_url).hostname))).toBe(true);
    expect(quiz.introduction.en).toContain("no CEFR level");
    expect(quiz.instructions!.en).toContain("fixed original bank");
  });
  it("recomputes all4096 reachable four-section correct-count vectors without a level assignment", () => {
    let checked = 0;
    for (let a = 0; a <= 7; a++) for (let b = 0; b <= 7; b++) for (let c = 0; c <= 7; c++) for (let d = 0; d <= 7; d++) {
      const counts = [a, b, c, d], answers = answer(counts), result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw Error("Valid German written answer vector rejected");
      expect(result.practice.correct).toBe(a + b + c + d); expect(result.practice.total).toBe(28);
      for (const [i, section] of quiz.directions.entries()) expect(result.practice.sections[section.id]).toEqual({ correct: counts[i], total: 7 });
      for (const item of result.practice.items) expect(item.correct).toBe(answers[item.questionId] === truth.get(item.questionId));
      for (const field of ["rank", "percentile", "profileId", "ability", "type"]) expect(result).not.toHaveProperty(field);
      checked++;
    }
    expect(checked).toBe(4096);
  });
  it("shows all28 explanations and all4FULL7 guides at zero,partial and perfect counts in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const counts of [[0, 0, 0, 0], [1, 4, 5, 2], [7, 7, 7, 7]]) {
      const result = scoreQuestionnaire(quiz, answer(counts)); if (result.status !== "complete" || !("practice" in result)) throw Error("Valid report rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(28); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(28); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-practice-question="${q.id}"]`)?.textContent).toContain(q.explanation![locale]);
      for (const p of quiz.profiles) for (const section of p.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds incomplete counts, rejects malformed answers and invalid keys, and expires optional drafts", () => {
    const partial = answer(); delete partial.GERMAN_28; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 27 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { GERMAN_01: "unknown" }, { GERMAN_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "missing"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { GERMAN_01: "B" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ GERMAN_01: "B" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes all10 native pages with full guides, canonical pairs, sitemap membership and practice entry wording", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/german-proficiency`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const entryDom = document.createElement("div"); entryDom.innerHTML = html;
      const method = entryDom.querySelector('section[aria-labelledby="questionnaire-method"]');
      const methodText = quiz.guide.find(section => section.id === "practice-count")!.paragraphs[0][locale];
      expect(method?.querySelector("p")?.textContent).toBe(methodText);
      expect(method?.closest("details")).toBeNull();
      expect([...entryDom.querySelectorAll("p")].filter(p => p.textContent === methodText)).toHaveLength(1);
      for (const p of quiz.profiles) {
        const native = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
