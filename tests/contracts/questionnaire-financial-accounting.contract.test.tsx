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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/financial-accounting.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/financial-accounting-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
const journalRules: Record<string, [string, string]> = {
  owner_contribution: ["cash", "capital"], cash_borrowing: ["cash", "loan"],
  settle_payable: ["payable", "cash"], inventory_on_credit: ["inventory", "payable"]
};
type Claim = { label: { en: string; zh: string }; value?: number; debit?: string; credit?: string; amount?: number };
const sum = (values: unknown) => (values as number[]).reduce((a,b) => a+b,0);
for (const question of source.questions) {
  const p = source.proofs.find(v => v.id === question.id)!.proof;
  let label: string;
  if (p.kind === "journal") {
    const [debit,credit] = journalRules[String(p.transaction)];
    const matches = (p.claims as Claim[]).filter(c => c.debit === debit && c.credit === credit && c.amount === p.amount);
    expect(matches).toHaveLength(1); label = matches[0].label.en;
  } else if (p.kind === "balance_difference") {
    expect(Number(p.assets)-Number(p.liabilities)-Number(p.equity)).toBe(1000);
    label = "Assets exceed liabilities plus equity by CU1,000; the cause is not identified";
  } else if (p.kind === "current_ratio") {
    expect(Number(p.currentLiabilities)).toBeGreaterThan(0); expect(Number(p.currentAssets)/Number(p.currentLiabilities)).toBe(1.5);
    label = "1.5 times";
  } else {
    let value: number;
    if (p.kind === "subtract") value = Number(p.left)-Number(p.right);
    else if (p.kind === "net_income") value = sum(p.revenues)-sum(p.expenses);
    else if (p.kind === "sum_less") value = sum(p.positive)-sum(p.negative);
    else if (p.kind === "asset_exchange") value = Number(p.initialAssets)-Number(p.cashOut)+Number(p.equipmentIn);
    else if (p.kind === "earned_portion") value = Number(p.advance)*Number(p.completedUnits)/Number(p.totalUnits);
    else if (p.kind === "used_prepaid") value = Number(p.payment)*Number(p.usedMonths)/Number(p.totalMonths);
    else if (p.kind === "accrued_expense") { expect(p.paidThisPeriod).toBe(0); value = Number(p.incurred); }
    else if (p.kind === "collect_recorded_receivable") { expect(p.previouslyRecorded).toBe(true); expect(p.newService).toBe(false); value = 0; }
    else if (p.kind === "straight_line") value = (Number(p.cost)-Number(p.residual))/Number(p.years);
    else if (p.kind === "carrying_amount") value = Number(p.cost)-(Number(p.cost)-Number(p.residual))*Number(p.elapsedYears)/Number(p.years);
    else if (p.kind === "depreciation_cash_effect") { expect(p.cashEvents).toEqual([]); value = 0; }
    else if (p.kind === "working_capital_delta") value = sum(p.currentAssetChanges)-sum(p.currentLiabilityChanges);
    else throw new Error("Unreviewed accounting case");
    expect(Number.isSafeInteger(value)).toBe(true);
    const matches = (p.claims as Claim[]).filter(c => c.value === value); expect(matches).toHaveLength(1); label = matches[0].label.en;
  }
  const matches = question.options.filter(o => o.label.en === label);
  if (matches.length !== 1) throw new Error(`Nonunique reviewed accounting key ${question.id}`);
  truth.set(question.id,matches[0].id);
}
const answer = (counts = [4, 4, 4, 4, 4, 4]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T167 original bilingual financial accounting practice", () => {
  it("binds24original native ENZH tasks and6fullrevisionguides to reviewed accounting facts and explicit calculations/encodings", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(quiz.profiles).toHaveLength(6);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(source.proofs).toHaveLength(24);
    for (const item of quiz.questions) { expect(item.prompt.en.trim()).not.toBe(""); expect(item.prompt.zh.trim()).not.toBe(""); for (const option of item.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh.trim()).not.toBe(""); } }

    expect(quiz.faq.some(item => item.question.en.includes("give a professional qualification") && item.answer.en.startsWith("No."))).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([4, 4, 4, 4, 4, 4]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const id of ["A", "B", "C", "D"]) expect(positions.filter(v => v === id)).toHaveLength(6);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(5); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(String(obj.zh).replaceAll("、", ", ")).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches all15625 six-section correctness vectors and96 single-item option probes", () => {
    function* vectors(left: number, prefix: number[] = []): Generator<number[]> {
      if (!left) { yield prefix; return; }
      for (let n=0;n<=4;n++) yield* vectors(left-1,[...prefix,n]);
    }
    let checked=0;
    for (const values of vectors(6)) {
      const answers=answer(values), result=scoreQuestionnaire(quiz,answers);
      if (result.status!=="complete" || !("practice" in result)) throw new Error("Practice witness rejected");
      if (result.practice.correct!==values.reduce((a,b)=>a+b,0) || result.practice.total!==24 || result.practice.items.length!==24) throw new Error("Wrong complete count");
      for (const [i,part] of quiz.directions.entries()) {
        const section=result.practice.sections[part.id];
        if (section.correct!==values[i] || section.total!==4) throw new Error("Wrong section count");
      }
      for (const [index,item] of result.practice.items.entries()) {
        if (item.questionId!==quiz.questions[index].id || item.selectedOptionId!==answers[item.questionId] || item.correctOptionId!==truth.get(item.questionId) || item.correct!==(answers[item.questionId]===truth.get(item.questionId))) throw new Error("Wrong item judgement/order");
      }
      for (const field of ["rank","percentile","profileId","ability","type"]) if (field in result) throw new Error("Unrequested tier field");
      checked++;
    }
    expect(checked).toBe(15625);
    let optionsChecked=0;
    for (const question of source.questions) for (const option of question.options) {
      const answers=answer(); answers[question.id]=option.id;
      const result=scoreQuestionnaire(quiz,answers);
      if (result.status!=="complete" || !("practice" in result)) throw new Error("Option witness rejected");
      const correct=option.id===truth.get(question.id);
      expect(result.practice.correct).toBe(correct?24:23);
      expect(result.practice.sections[question.options[0].directionId]).toEqual({correct:correct?4:3,total:4});
      expect(result.practice.items.find(v=>v.questionId===question.id)?.correct).toBe(correct); optionsChecked++;
    }
    expect(optionsChecked).toBe(96);
    console.info("Accounting:24reviewedkeys+15625reachablecorrectnessvectors+96singleitemoptionprobes;not4^24answerpathsoraccountant/psychometricvalidation.");
  });
  it("shows all24correctanswers and explanations and6completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0, 0, 0, 0], [0, 4, 2, 3, 1, 4], [4, 4, 4, 4, 4, 4]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(6);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.ACCOUNTING_24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { ACCOUNTING_01: "na" }, { ACCOUNTING_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { ACCOUNTING_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ ACCOUNTING_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes14nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/financial-accounting`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/financial-accounting/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/financial-accounting/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
