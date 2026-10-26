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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/aptitude-test.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/aptitude-test-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
const logical = (expr: unknown, world: Record<string, boolean>): boolean => {
  if (typeof expr === "string") return world[expr];
  const [op, a, b] = expr as unknown[];
  if (op === "not") return !logical(a, world);
  if (op === "and") return logical(a, world) && logical(b, world);
  if (op === "xor") return logical(a, world) !== logical(b, world);
  if (op === "implies") return !logical(a, world) || logical(b, world);
  throw new Error("Unknown source expression");
};
for (const question of source.questions) {
  const p = source.proofs.find(v => v.id === question.id)!.proof, kind = p.kind;
  const labels = question.options.map(o => o.label.en); let matches: boolean[];
  if (["percent", "ratio", "mean", "linear_total", "increase", "constant_rate", "arithmetic_sequence", "machine"].includes(String(kind))) {
    let value: number;
    if (kind === "percent") value = Number(p.base) * Number(p.percent) / 100;
    else if (kind === "ratio") value = Number(p.total) * (p.parts as number[])[Number(p.target)] / (p.parts as number[]).reduce((a, b) => a + b, 0);
    else if (kind === "mean") value = (p.values as number[]).reduce((a, b) => a + b, 0) / (p.values as number[]).length;
    else if (kind === "linear_total") value = Number(p.count) * Number(p.unit) + Number(p.once);
    else if (kind === "increase") value = Number(p.base) * (100 + Number(p.percent)) / 100;
    else if (kind === "constant_rate") value = Number(p.minutes) * Number(p.target) / Number(p.tasks);
    else if (kind === "arithmetic_sequence") value = Number(p.start) + (Number(p.target) - 1) * Number(p.step);
    else value = Number(p.input) * Number(p.multiply) + Number(p.add);
    matches = labels.map(v => Number(v) === value);
  } else if (kind === "facts") { const facts = p.facts as Record<string, unknown>; matches = (p.claims as Record<string, unknown>[]).map(claim => { const valid = Object.entries(claim).every(([k, v]) => Object.hasOwn(facts, k) && facts[k] === v); return p.invert ? !valid : valid; }); }
  else if (kind === "order") matches = (p.options as string[][]).map(v => JSON.stringify(v) === JSON.stringify(p.source));
  else if (kind === "missing_field") matches = (p.queries as string[]).map(k => !Object.hasOwn(p.facts as object, k));
  else if (kind === "requires") matches = (p.capabilities as string[][]).map(v => (p.required as string[]).every(r => v.includes(r)));
  else if (kind === "logical_worlds") {
    const names = p.variables as string[], worlds = Array.from({ length: 2 ** names.length }, (_, n) => Object.fromEntries(names.map((name, i) => [name, Boolean(n & (1 << i))]))).filter(world => (p.facts as unknown[]).every(f => logical(f, world)));
    if (!worlds.length) throw new Error("Inconsistent source premises"); matches = (p.claims as unknown[]).map(c => worlds.every(w => logical(c, w)));
  } else if (kind === "ordering") matches = (p.options as string[][]).map(v => (p.before as string[][]).every(([a, b]) => v.indexOf(a) < v.indexOf(b)));
  else if (kind === "selection") {
    const names = p.labels as string[], valid = (set: Set<string>) => set.size === p.count && (p.oneOf as string[][]).every(pair => pair.filter(v => set.has(v)).length === 1) && (p.implications as string[][]).every(([a, b]) => !set.has(a) || set.has(b)) && (p.forbidden as string[]).every(v => !set.has(v));
    const allowed = Array.from({ length: 2 ** names.length }, (_, n) => new Set(names.filter((_, i) => Boolean(n & (1 << i))))).filter(valid); if (!allowed.length) throw new Error("No source selection"); matches = (p.options as string[][]).map(v => allowed.some(set => set.size === v.length && v.every(x => set.has(x))));
  } else if (kind === "repeat_block") { const block = p.block as string[]; matches = labels.map(v => v === block[(Number(p.target) - 1) % block.length]); }
  else if (kind === "alphabet_shift") { const alphabet = p.alphabet as string[], value = (p.input as string[]).map(v => alphabet[alphabet.indexOf(v) + Number(p.shift)]).join(" "); matches = labels.map(v => v === value); }
  else if (kind === "swap_ends") { const input = p.input as string[], value = [input.at(-1), ...input.slice(1, -1), input[0]].join(" "); matches = labels.map(v => v === value); }
  else if (kind === "symbol_counts") { const required = p.required as Record<string, number>; matches = labels.map(v => { const tokens = v.split(" "); return tokens.length === Object.values(required).reduce((a, b) => a + b, 0) && Object.entries(required).every(([k, n]) => tokens.filter(t => t === k).length === n); }); }
  else throw new Error(`Unknown independent source proof ${kind}`);
  const accepted = question.options.filter((_, i) => matches[i]); if (accepted.length !== 1) throw new Error(`Nonunique source key ${question.id}`); truth.set(question.id, accepted[0].id);
}
const answer = (counts = [6, 6, 6, 6]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T159 original mixed-reasoning practice", () => {
  it("also serves T166 cognitive practice through the same bank and canonical", () => {
    expect(quiz.slug).toBe("aptitude-test");
    expect(quiz.title).toEqual({ en: "Aptitude & Cognitive Ability Test", zh: "能力倾向与认知能力测试" });
    expect(quiz.introduction.en).toContain("does not estimate general cognitive ability");
    expect(quiz.faq.some(item => item.question.en === "How does this relate to a cognitive ability test?" && item.answer.en.includes("no calibrated cognitive-ability scores"))).toBe(true);
    const catalog = JSON.parse(readFileSync("lib/questionnaires/catalog.json", "utf8")) as { slug: string; code: string; title: Questionnaire["title"]; description: Questionnaire["description"] }[];
    const entries = catalog.filter(item => item.code === quiz.code);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ slug: quiz.slug, title: quiz.title, description: quiz.description });
    expect(catalog.some(item => item.slug === "cognitive-aptitude")).toBe(false);
    expect(quiz.questions).toEqual(source.questions);
    expect(quiz.profiles).toEqual(source.profiles);
  });
  it("binds24bilingual tasks and4fullrevisionguides to independently recomputed source keys", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(4);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
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
    } expect(checked).toBe(2401); console.info("Aptitude:24independentproofkeys+2401reachablecorrectnessvectors;not4^24answerpathsorpsychometricvalidation.");
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
    const partial = answer(); delete partial.APT_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { APT_01: "na" }, { APT_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { APT_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ APT_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes10nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/aptitude-test`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/aptitude-test/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/aptitude-test/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
