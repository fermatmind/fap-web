import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { scoreQuestionnaire, readQuestionnaireDraft } from "@/lib/questionnaires/scoring";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { QuestionnairePracticeReport } from "@/components/questionnaires/QuestionnairePracticeReport";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/cybersecurity-awareness.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/cybersecurity-awareness-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; evidence: { id: string; url: string; rule: string }[] };
// Source-reviewed decision oracle: identify the supported action rather than reading the runtime answer key.
const actions = [
  "Open the delivery company’s known app", "Contact the bank through a number from your own bank card", "Verify the invoice through the company’s known contact route", "Check with the colleague through a contact route you already trust",
  "Change the affected passwords to different, strong passwords", "A password plus a registered security key", "Do not share it; contact the service through your own known channel", "Use a reputable password manager",
  "Install legitimate updates promptly", "Keep a separate backup of important files", "Back up needed files, then follow the manufacturer’s instructions", "Avoid the unsolicited download",
  "Grant access only to the named authorized accounts", "Leave unnecessary optional fields blank", "Someone may find the answer without knowing you personally", "The error message and time, with passwords and codes omitted",
  "Go independently to the real service, change the password", "Update trusted security software, run a scan", "Report the suspected event through the established contact", "Reporting is one step; any exposed account still needs"
];
const truth = new Map<string, string>();
for (const [i, question] of source.questions.entries()) {
  const options = question.options.filter(o => o.label.en.startsWith(actions[i]));
  if (options.length !== 1) throw new Error(`Source-reviewed action ambiguous: ${question.id}`);
  truth.set(question.id, options[0].id);
}
const answer = (counts = [4, 4, 4, 4, 4]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T157 original consumer-security knowledge practice", () => {
  it("binds20bilingual scenarios and5fullguides to source-reviewed actions and explicit policy scope", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(20); expect(quiz.profiles).toHaveLength(5);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([4, 4, 4, 4, 4]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(quiz.references).toHaveLength(5);
    for (const item of source.evidence) expect(item.rule.length).toBeGreaterThan(40);
    expect(source.evidence[13].url).toBe("original_prompt_logic");
    for (const i of [12, 15, 18]) expect(source.evidence[i].rule.toLowerCase()).toContain("fictional");
    expect(quiz.guide.map(s => s.id)).toEqual(expect.arrayContaining(["practice-scoring", "practice-reading", "practice-limits"]));
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(5);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(220); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(obj.zh).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches every3125reachable five-section correctness vector and all item judgements", () => {
    let checked = 0;
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 0; c <= 4; c++) for (let d = 0; d <= 4; d++) for (let e = 0; e <= 4; e++) {
      const values = [a, b, c, d, e], answers = answer(values), result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(a + b + c + d + e); expect(result.practice.total).toBe(20);
      for (const [i, part] of quiz.directions.entries()) expect(result.practice.sections[part.id]).toEqual({ correct: values[i], total: 4 });
      for (const item of result.practice.items) expect(item).toEqual({ questionId: item.questionId, selectedOptionId: answers[item.questionId], correctOptionId: truth.get(item.questionId), correct: answers[item.questionId] === truth.get(item.questionId) });
      for (const field of ["rank", "percentile", "profileId", "ability", "type"]) expect(result).not.toHaveProperty(field); checked++;
    } expect(checked).toBe(3125); console.info("Cybersecurity:20source-reviewedkeys+3125reachable correctness vectors;not4^20individualpathsorpsychometricvalidation.");
  });
  it("shows all20correctanswers and explanations and5completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0, 0, 0], [2, 4, 0, 1, 3], [4, 4, 4, 4, 4]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(20); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(20); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(5);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.CYBER_20; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 19 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { CYBER_01: "na" }, { CYBER_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { CYBER_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ CYBER_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes12nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/cybersecurity-awareness`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); for (const r of quiz.references!) expect(html).toContain(`href="${r.url}"`); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/cybersecurity-awareness/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/cybersecurity-awareness/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
