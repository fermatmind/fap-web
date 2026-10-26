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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/logical-reasoning.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/logical-reasoning-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
function logicFormula(node: unknown, model: Record<string, boolean>): boolean {
  if (typeof node === "string") return model[node];
  if (!Array.isArray(node)) throw new Error("Invalid declared formula");
  const [op,...args] = node;
  if (op === "not") return !logicFormula(args[0],model);
  if (op === "and") return args.every(x => logicFormula(x,model));
  if (op === "or") return args.some(x => logicFormula(x,model));
  if (op === "implies") return !logicFormula(args[0],model) || logicFormula(args[1],model);
  if (op === "iff") return logicFormula(args[0],model) === logicFormula(args[1],model);
  if (op === "count") return args.slice(1).filter(x => logicFormula(x,model)).length === args[0];
  throw new Error("Unknown logical connective");
}
function setClaim(node: unknown, model: number[]): boolean {
  const [op,a,b] = node as [string,number,number];
  const pairs = model.map(n => [!!(n & (1<<a)),!!(n & (1<<b))]);
  if (op === "all") return pairs.every(([x,y]) => !x || y);
  if (op === "none") return pairs.every(([x,y]) => !(x && y));
  if (op === "some") return pairs.some(([x,y]) => x && y);
  if (op === "some_not") return pairs.some(([x,y]) => x && !y);
  if (op === "all_not_subject") return pairs.every(([x,y]) => x || y);
  throw new Error("Unknown set claim");
}
function* permutations(values: string[]): Generator<string[]> {
  if (!values.length) { yield []; return; }
  for (let i=0;i<values.length;i++) for (const rest of permutations(values.filter((_,j) => j!==i))) yield [values[i],...rest];
}
for (const question of source.questions) {
  const p = source.proofs.find(v => v.id === question.id)!.proof;
  let forced: boolean[];
  if (p.kind === "sets") {
    const models: number[][] = [];
    for (let a=0;a<8;a++) for (let b=0;b<8;b++) for (let c=0;c<8;c++) if ((p.premises as unknown[]).every(x => setClaim(x,[a,b,c]))) models.push([a,b,c]);
    expect(models.length).toBeGreaterThan(0);
    forced = (p.claims as unknown[]).map(claim => models.every(m => setClaim(claim,m)));
  } else if (p.kind === "bool" || p.kind === "status") {
    const atoms = p.atoms as string[], models: Record<string,boolean>[] = [];
    for (let mask=0;mask<(1<<atoms.length);mask++) {
      const model = Object.fromEntries(atoms.map((a,i) => [a,!!(mask & (1<<i))]));
      if ((p.premises as unknown[]).every(x => logicFormula(x,model))) models.push(model);
    }
    expect(models.length).toBeGreaterThan(0);
    if (p.kind === "bool") forced = (p.claims as unknown[]).map(c => models.every(m => logicFormula(c,m)));
    else { const states = new Set(models.map(m => logicFormula(p.query,m))); const status = states.size===2 ? "undetermined" : states.has(true) ? "true" : "false"; forced = (p.claimStatuses as string[]).map(s => s===status); }
  } else if (p.kind === "order") {
    const models: Record<string,number>[] = [];
    for (const perm of permutations(p.entities as string[])) {
      const m = Object.fromEntries(perm.map((s,i) => [s,i+1]));
      const fits = (p.rules as [string,string,string|number][]).every(([op,a,b]) => op==="at" ? m[a]===b : op==="not_at" ? m[a]!==b : op==="before" ? m[a]<m[String(b)] : op==="adjacent_before" ? m[a]+1===m[String(b)] : false);
      if (fits) models.push(m);
    }
    expect(models.length).toBeGreaterThan(0);
    const positions = new Set(models.map(m => m[String(p.queryEntity)]));
    forced = (p.claimPositions as (number|null)[]).map(n => n===null ? positions.size>1 : positions.size===1 && positions.has(n));
  } else throw new Error("Unknown logical proof kind");
  expect(forced).toEqual([true,false,false,false]);
  const index = (p.optionOrder as number[]).indexOf(0); expect(index).toBeGreaterThanOrEqual(0);
  truth.set(question.id,question.options[index].id);
}
const answer = (counts = [6, 6, 6, 6]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T168 original bilingual logical reasoning practice", () => {
  it("binds24original native ENZH tasks and4fullrevisionguides to declared Boolean valuations,order permutations and finite set witnesses plus author semantic review", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(source.proofs).toHaveLength(24);
    for (const item of quiz.questions) { expect(item.prompt.en.trim()).not.toBe(""); expect(item.prompt.zh.trim()).not.toBe(""); for (const option of item.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh.trim()).not.toBe(""); } }

    expect(quiz.faq.some(item => item.question.en.includes("official LSAT") && item.answer.en.startsWith("No."))).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(6);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(String(obj.zh).replaceAll("、", ", ")).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
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
    } expect(checked).toBe(2401); console.info("LogicPractice:24reviewedkeys+2401reachablecorrectnessvectors;not4^24answerpathsorpsychometricvalidation.");
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
    const partial = answer(); delete partial.LOGIC_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { LOGIC_01: "na" }, { LOGIC_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { LOGIC_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ LOGIC_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes10nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/logical-reasoning`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/logical-reasoning/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/logical-reasoning/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
