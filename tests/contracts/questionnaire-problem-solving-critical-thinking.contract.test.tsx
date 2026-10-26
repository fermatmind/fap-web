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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/problem-solving-critical-thinking.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/problem-solving-critical-thinking-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
for (const question of source.questions) {
  const p = source.proofs.find(v => v.id === question.id)!.proof;
  const n = (k: string) => Number(p[k]);
  const nums = (k: string) => p[k] as number[];
  let matches: boolean[];
  if (p.kind === "criteria") matches = (p.claims as { attributes: string[] }[]).map(c => (p.required as string[]).every(a => c.attributes.includes(a)));
  else if (p.kind === "next_step") {
    const sequence = p.sequence as string[], completed = p.completed as string[];
    expect(sequence.slice(0,completed.length)).toEqual(completed); matches = (p.claimSteps as string[]).map(s => s===sequence[completed.length]);
  } else if (p.kind === "limits") matches = (p.claimValues as Record<string,number>[]).map(c => Object.entries(p.maximums as Record<string,number>).every(([k,v]) => c[k]<=v));
  else if (p.kind === "weighted_max") {
    const scores = (p.claimValues as number[][]).map(c => c.reduce((sum,v,i) => sum+v*nums("weights")[i],0));
    matches = scores.map(v => v===Math.max(...scores));
  } else if (p.kind === "smaller_choice") {
    const values = nums("values"), value = values[0]<values[1] ? "first" : values[1]<values[0] ? "second" : "tie";
    matches = (p.claimResults as string[]).map(v => v===value);
  } else if (p.kind === "discriminating_test") matches = (p.claimPredictions as number[][]).map(([a,b]) => a!==b);
  else if (p.kind === "earliest_allowed") {
    const values = nums("claimMinutes"), value = Math.min(...values.filter(v => v>=n("endMinutes")+n("breakMinutes")));
    matches = values.map(v => v===value);
  } else if (p.kind === "thresholds") {
    expect(n("errors")<=n("maximumErrors") && n("runs")>=n("minimumRuns")).toBe(true); matches = (p.claimResults as string[]).map(s => s==="met");
  } else if (p.kind === "review_plan") matches = (p.claimValues as number[][]).map(c => c.reduce((sum,v) => sum+v,0)<=n("maximumTotal") && c[2]>=n("minimumReview"));
  else if (p.kind === "counterexample") {
    const total = n("knownGood")+n("knownBad")+n("unknown"), models = Array.from({length:2**n("unknown")},(_,mask) => n("knownGood")+Array.from({length:n("unknown")},(_,i) => (mask>>i)&1).reduce((sum,v) => sum+v,0));
    expect(models).toHaveLength(128); matches = (p.claimKinds as string[]).map(k => models.every(good => k==="not_all" ? good<total : k==="none" ? good===0 : k==="all" ? good===total : k==="exactly_one" ? good===1 : false));
  } else {
    let numerator: number, denominator = 1;
    if (p.kind === "subtract_blocks") numerator = n("total")-nums("blocks").reduce((sum,v) => sum+v,0);
    else if (p.kind === "period_fee") numerator = n("periods")*n("unit")+n("fee");
    else if (p.kind === "unaccounted") numerator = n("total")-nums("parts").reduce((sum,v) => sum+v,0);
    else if (p.kind === "rate_drop") { denominator = n("beforeTotal")*n("afterTotal"); expect(denominator).toBeGreaterThan(0); numerator = (n("beforeBad")*n("afterTotal")-n("afterBad")*n("beforeTotal"))*100; }
    else throw new Error("Unknown bounded problem-solving proof");
    expect(Number.isSafeInteger(numerator)).toBe(true); matches = nums("claimValues").map(v => v*denominator===numerator);
  }
  expect(matches).toEqual([true,false,false,false]);
  const keyIndex = nums("optionOrder").indexOf(0); expect(keyIndex).toBeGreaterThanOrEqual(0); truth.set(question.id,question.options[keyIndex].id);
}
const answer = (counts = [10, 10, 10]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T170 original bilingual bounded problem-solving practice", () => {
  it("binds30original native ENZH tasks and3fullrevisionguides to declared bounded model checks plus author semantic review", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(30); expect(quiz.profiles).toHaveLength(3);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(source.proofs).toHaveLength(30);
    for (const item of quiz.questions) { expect(item.prompt.en.trim()).not.toBe(""); expect(item.prompt.zh.trim()).not.toBe(""); for (const option of item.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh.trim()).not.toBe(""); } }

    expect(quiz.faq.some(item => item.question.en.includes("official Arizona eCTE") && item.answer.en.startsWith("No."))).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([10, 10, 10]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const [i,id] of ["A", "B", "C", "D"].entries()) expect(positions.filter(v => v === id)).toHaveLength([8,8,7,7][i]);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(8); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(String(obj.zh).replaceAll("、", ", ")).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches1331reachable three-section correctness vectors and120single-option probes", () => {
    let checked = 0;
    for (let a=0;a<=10;a++) for (let b=0;b<=10;b++) for (let c=0;c<=10;c++) {
      const values=[a,b,c], answers=answer(values), result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete" || !("practice" in result)) throw new Error("Practice witness rejected");
      expect(result.practice.correct).toBe(a+b+c); expect(result.practice.total).toBe(30);
      for(const [i,part]of quiz.directions.entries()) expect(result.practice.sections[part.id]).toEqual({correct:values[i],total:10});
      for(const item of result.practice.items) expect(item).toEqual({questionId:item.questionId,selectedOptionId:answers[item.questionId],correctOptionId:truth.get(item.questionId),correct:answers[item.questionId]===truth.get(item.questionId)});
      for(const field of ["rank","percentile","profileId","ability","type"]) expect(result).not.toHaveProperty(field); checked++;
    }
    expect(checked).toBe(1331); let probes=0;
    for(const q of quiz.questions) for(const option of q.options) {
      const answers=answer();answers[q.id]=option.id;const result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete" || !("practice" in result)) throw new Error("Option witness rejected");
      expect(result.practice.correct).toBe(option.id===truth.get(q.id)?30:29);
      expect(result.practice.items.find(v=>v.questionId===q.id)?.correct).toBe(option.id===truth.get(q.id)); probes++;
    }
    expect(probes).toBe(120); console.info("ProblemPractice:30reviewedkeys+1331correctnessvectors+120optionprobes;not4^30answerpaths or pedagogicvalidation.");
  });
  it("shows all30correctanswers and explanations and3completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0], [2, 8, 5], [10, 10, 10]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(30); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(30); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(3);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.PROBLEM_30; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 29 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { PROBLEM_01: "na" }, { PROBLEM_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { PROBLEM_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ PROBLEM_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes8nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/problem-solving-critical-thinking`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/problem-solving-critical-thinking/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/problem-solving-critical-thinking/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
