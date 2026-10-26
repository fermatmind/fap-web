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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/workplace-technology.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/workplace-technology-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
for (const question of source.questions) {
  const p = source.proofs.find(row => row.id === question.id)!.proof, kind = p.kind;
  let matches: boolean[];
  if (kind === "exact_fields") matches = (p.variants as string[][]).map(v => JSON.stringify(v) === JSON.stringify(p.source));
  else if (kind === "requires") matches = (p.capabilities as string[][]).map(v => (p.required as string[]).every(f => v.includes(f)));
  else if (kind === "latest_approved") { const value = (p.records as [string, number, boolean][]).filter(r => r[2]).sort((a, b) => b[1] - a[1])[0][0]; matches = (p.optionValues as string[]).map(v => v === value); }
  else if (kind === "window") matches = (p.options as number[][]).map(([a, b]) => b - a === p.duration && (p.windows as number[][]).every(([lo, hi]) => a >= lo && b <= hi));
  else if (kind === "least_capability") { const c = p.capabilities as string[][], required = p.required as string[], eligible = c.map(v => required.every(r => v.includes(r))), least = Math.min(...c.filter((_, i) => eligible[i]).map(v => v.length)); matches = c.map((v, i) => eligible[i] && v.length === least); }
  else if (kind === "changed_records") { const before = p.before as Record<string, string>, after = p.after as Record<string, string>, changed = Object.keys(before).filter(k => before[k] !== after[k]).sort(); matches = (p.options as string[][]).map(v => JSON.stringify([...v].sort()) === JSON.stringify(changed)); }
  else if (kind === "task_filter") { const expected = (p.rows as string[][]).filter(([, owner, status]) => owner === p.owner && status !== p.excludedStatus).map(([id]) => id).sort(); matches = (p.options as string[][]).map(v => JSON.stringify([...v].sort()) === JSON.stringify(expected)); }
  else if (kind === "requires_and_forbids") matches = (p.actions as string[][]).map(v => (p.required as string[]).every(r => v.includes(r)) && (p.forbidden as string[]).every(f => !v.includes(f)));
  else if (kind === "sum_change") { const a = (p.before as number[]).reduce((n, v) => n + v, 0), b = (p.after as number[]).reduce((n, v) => n + v, 0); matches = (p.options as number[][]).map(v => JSON.stringify(v) === JSON.stringify([a, b, b - a])); }
  else if (kind === "information_scope") { if ((p.provided as string[]).includes("headcount")) throw new Error("Headcount premise changed"); matches = (p.conclusionKind as string[]).map(v => v === "insufficient-headcount-evidence"); }
  else if (kind === "rates_scope") { const counts = p.counts as number[][], errors = counts.map(([n]) => n), rates = counts.map(([n, d]) => n / d * 100); matches = (p.options as { errors?: number[]; rates?: number[]; causal?: boolean }[]).map(v => v.causal !== true && (!v.errors || JSON.stringify(v.errors) === JSON.stringify(errors)) && (!v.rates || JSON.stringify(v.rates) === JSON.stringify(rates))); }
  else throw new Error(`Unimplemented independent proof ${kind}`);
  const accepted = question.options.filter((_, i) => matches[i]); if (accepted.length !== 1) throw new Error(`Proof did not isolate one answer: ${question.id}`); truth.set(question.id, accepted[0].id);
}
const answer = (counts = [4, 4, 4, 4]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T158 original closed-information workplace technology and collaboration practice", () => {
  it("binds16bilingual tasks and4fullrevisionguides to independently recomputed source keys", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(16); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([4, 4, 4, 4]); expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.references).toHaveLength(1);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(4);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(obj.zh).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches every625reachable four-section correctness vector and all item judgements", () => {
    let checked = 0;
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 0; c <= 4; c++) for (let d = 0; d <= 4; d++) {
      const values = [a, b, c, d], answers = answer(values), result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(a + b + c + d); expect(result.practice.total).toBe(16);
      for (const [i, part] of quiz.directions.entries()) expect(result.practice.sections[part.id]).toEqual({ correct: values[i], total: 4 });
      for (const item of result.practice.items) expect(item).toEqual({ questionId: item.questionId, selectedOptionId: answers[item.questionId], correctOptionId: truth.get(item.questionId), correct: answers[item.questionId] === truth.get(item.questionId) });
      for (const field of ["rank", "percentile", "profileId", "ability", "type"]) expect(result).not.toHaveProperty(field); checked++;
    } expect(checked).toBe(625); console.info("Workplace tech:16independentproofkeys+625reachable correctness vectors;not4^16individualpathsorpsychometricvalidation.");
  });
  it("shows all16correctanswers and explanations and4completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0, 0], [2, 4, 0, 3], [4, 4, 4, 4]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(16); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(16); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.WORKTECH_16; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 15 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { WORKTECH_01: "na" }, { WORKTECH_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { WORKTECH_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ WORKTECH_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes10nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/workplace-technology`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/workplace-technology/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/workplace-technology/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
