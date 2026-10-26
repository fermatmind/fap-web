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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/verbal-reasoning.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/verbal-reasoning-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
type Expr = string | [string, ...Expr[]];
type World = Record<string, boolean>;
const evaluate = (expr: Expr, world: World): boolean => {
  if (typeof expr === "string") { if (!(expr in world)) throw new Error("Unknown atom"); return world[expr]; }
  const [op, ...args] = expr;
  if (op === "not") return !evaluate(args[0], world);
  if (op === "and") return args.every(v => evaluate(v, world));
  if (op === "or") return args.some(v => evaluate(v, world));
  if (op === "imp") return !evaluate(args[0], world) || evaluate(args[1], world);
  if (op === "xor") return evaluate(args[0], world) !== evaluate(args[1], world);
  throw new Error("Unknown connective");
};
const reviewed: Record<string, string> = {
 VERBAL_01: "The rules require each registered helper to attend", VERBAL_02: "The instruction is stated directly rather than left to inference", VERBAL_03: "Monday, Tuesday, Wednesday", VERBAL_04: "It is an interim arrangement that can be revised", VERBAL_05: "The tickets meet the stated admission need", VERBAL_06: "They cannot both hold under the stated exact conditions", VERBAL_13: "The talks are postponed while the indoor collection rooms remain open", VERBAL_14: "The panel’s rejection of the budget proposal", VERBAL_15: "Offer two-hour loans during the next trial", VERBAL_17: "Eighteen of the twenty self-selected respondents preferred the new labels", VERBAL_18: "It does not determine whether every reply was within three hours"
};
type Label = { en: string; zh: string };
const permutations = (items: string[]): string[][] => items.length ? items.flatMap((item,i) => permutations(items.filter((_,j) => i !== j)).map(rest => [item,...rest])) : [[]];
for (const question of source.questions) {
 const p = source.proofs.find(item => item.id === question.id)!.proof;
 let expected: string;
 if (p.kind === "finite_logic" || p.kind === "truth_status") {
  const vars = p.variables as string[], premises = p.premises as Expr[];
  const worlds = Array.from({length: 2 ** vars.length}, (_,mask) => Object.fromEntries(vars.map((v,i) => [v, Boolean(mask & 2 ** i)]))).filter(world => premises.every(expr => evaluate(expr, world)));
  expect(worlds.length).toBeGreaterThan(0);
  if (p.kind === "finite_logic") {
   const claims = p.claims as {label: Label; expr: Expr}[], entailed = claims.filter(c => worlds.every(w => evaluate(c.expr,w)));
   expect(entailed).toHaveLength(1); expected = entailed[0].label.en;
   for (const claim of claims.filter(c => c !== entailed[0])) expect(worlds.some(w => !evaluate(claim.expr,w))).toBe(true);
   if (question.id === "VERBAL_22") expect(worlds).toHaveLength(91);
  } else {
   const values = new Set(worlds.map(w => evaluate(p.query as Expr,w))), status = values.size === 2 ? "undetermined" : values.has(true) ? "entailed" : "refuted";
   expect(status).toBe("undetermined"); expected = (p.statusClaims as {status:string;label:Label}[]).find(c => c.status === status)!.label.en;
  }
 } else if (p.kind === "order") {
  const worlds = permutations(p.items as string[]).filter(order => (p.before as string[][]).every(([a,b]) => order.indexOf(a) < order.indexOf(b)));
  expect(worlds).toHaveLength(1);
  const valid = (p.claims as {label:Label;before?:string[];first?:string}[]).filter(c => worlds.every(w => c.before ? w.indexOf(c.before[0]) < w.indexOf(c.before[1]) : w[0] === c.first));
  expect(valid).toHaveLength(1); expected = valid[0].label.en;
 } else if (p.kind === "analogy") {
  const valid = (p.relationFacts as {relation:string;label:Label}[]).filter(c => c.relation === p.targetRelation); expect(valid).toHaveLength(1); expected = valid[0].label.en;
 } else if (p.kind === "exception_fact") expected = String(p.exceptionMatches ? p.exception : p.regular);
 else {
  expected = reviewed[question.id];
  if (p.kind === "mean_countermodels") {
   const witnesses = p.witnesses as number[][];
   for (const w of witnesses) expect(w.reduce((a,b) => a+b,0)).toBe(Number(p.mean) * Number(p.count));
   expect(new Set(witnesses.map(w => w.every(v => v <= Number(p.limit)))).size).toBe(2);
  }
 }
 const valid = question.options.filter(o => o.label.en === expected); if (valid.length !== 1) throw new Error(`Nonunique reviewed key ${question.id}`); truth.set(question.id,valid[0].id);
}
const answer = (counts = [6, 6, 6, 6]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T164 original bilingual verbal practice", () => {
  it("binds24original native ENZH tasks and4fullrevisionguides to reviewed word/relation/passage facts and finite formal consequences", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(source.proofs).toHaveLength(24);
    for (const item of quiz.questions) { const en = item.prompt.en.split(String.fromCharCode(10, 10)), zh = item.prompt.zh.split(String.fromCharCode(10, 10)); expect(en).toHaveLength(2); expect(zh).toHaveLength(2); expect(en[1]).not.toBe(zh[1]); for (const option of item.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh.trim()).not.toBe(""); } }
    expect(quiz.faq.some(item => item.question.en.includes("IQ or percentile") && item.answer.en.startsWith("No."))).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(6);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(obj.zh).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches every2401reachable four-section correctness vector and all item judgements", () => {
    let checked = 0;
    for (let a = 0; a <= 6; a++) for (let b = 0; b <= 6; b++) for (let c = 0; c <= 6; c++) for (let d = 0; d <= 6; d++) {
      const values = [a, b, c, d], answers = answer(values), result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("practice" in result)) throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(a + b + c + d); expect(result.practice.total).toBe(24);
      for (const [i, part] of quiz.directions.entries()) expect(result.practice.sections[part.id]).toEqual({ correct: values[i], total: 6 });
      for (const item of result.practice.items) expect(item).toEqual({ questionId: item.questionId, selectedOptionId: answers[item.questionId], correctOptionId: truth.get(item.questionId), correct: answers[item.questionId] === truth.get(item.questionId) });
      for (const field of ["rank", "percentile", "profileId", "ability", "type"]) expect(result).not.toHaveProperty(field); checked++;
    } expect(checked).toBe(2401); console.info("VerbalPractice:24reviewedkeys+2401reachablecorrectnessvectors;not4^24answerpathsorpsychometricvalidation.");
  });
  it("shows all24correctanswers and explanations and4completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0, 0], [2, 6, 0, 5], [6, 6, 6, 6]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.VERBAL_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { VERBAL_01: "na" }, { VERBAL_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { VERBAL_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ VERBAL_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes10nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/verbal-reasoning`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/verbal-reasoning/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/verbal-reasoning/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
