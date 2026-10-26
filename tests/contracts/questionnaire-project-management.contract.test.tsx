import assert from "node:assert/strict";
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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/project-management.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/project-management-reference.json");
const source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; profiles: Questionnaire["profiles"]; proofs: { id: string; proof: Record<string, unknown> }[] };
const truth = new Map<string, string>();
for (const question of source.questions) {
  const p=source.proofs.find(v=>v.id===question.id)!.proof, n=(k:string)=>Number(p[k]), nums=(k:string)=>p[k] as number[];
  let matches:boolean[];
  if(p.kind==="criteria") matches=(p.claims as {attributes:string[]}[]).map(c=>(p.required as string[]).every(a=>c.attributes.includes(a)));
  else {
    let numerator:number,denominator=1;
    if(p.kind==="parallel_finish") numerator=n("prefix")+Math.max(...nums("branches"))+n("suffix");
    else if(p.kind==="branch_slack") {numerator=n("long")-n("short");expect(numerator).toBeGreaterThanOrEqual(0);}
    else if(p.kind==="mean") {numerator=nums("values").reduce((sum,v)=>sum+v,0);denominator=nums("values").length;expect(denominator).toBeGreaterThan(0);}
    else if(p.kind==="sum") numerator=nums("values").reduce((sum,v)=>sum+v,0);
    else if(p.kind==="remainder") numerator=n("total")-nums("parts").reduce((sum,v)=>sum+v,0);
    else if(p.kind==="quantity_fee") numerator=n("quantity")*n("unit")+n("fee");
    else if(p.kind==="difference") numerator=n("actual")-n("planned");
    else if(p.kind==="forecast_headroom") numerator=n("limit")-n("spent")-n("remaining");
    else if(p.kind==="subset_max") {
      const values=nums("values"),totals=Array.from({length:2**values.length},(_,mask)=>values.reduce((sum,v,i)=>sum+((mask>>i)&1?v:0),0));
      expect(totals).toHaveLength(8);numerator=Math.max(...totals.filter(v=>v<=n("capacity")));
    } else throw new Error("Unknown bounded project case proof");
    expect(Number.isSafeInteger(numerator)).toBe(true);matches=nums("claimValues").map(v=>v*denominator===numerator);
  }
  expect(matches).toEqual([true,false,false,false]);const keyIndex=nums("optionOrder").indexOf(0);expect(keyIndex).toBeGreaterThanOrEqual(0);truth.set(question.id,question.options[keyIndex].id);
}
const answer = (counts = [6, 6, 6, 6, 6]) => {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((d, i) => source.questions.filter(q => q.options[0].directionId === d.id).forEach((q, j) => { answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id; }));
  return answers;
};

describe("T171 original bilingual bounded project practice", () => {
  it("binds30original native ENZH tasks and5fullrevisionguides to declared bounded model checks plus author semantic review", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(30); expect(quiz.profiles).toHaveLength(5);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(source.profiles);
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id))); expect(quiz.questions.some(q => q.reverse || q.options.some(o => o.score !== undefined))).toBe(false);
    expect(source.proofs).toHaveLength(30);
    for (const item of quiz.questions) { expect(item.prompt.en.trim()).not.toBe(""); expect(item.prompt.zh.trim()).not.toBe(""); for (const option of item.options) { expect(option.label.en.trim()).not.toBe(""); expect(option.label.zh.trim()).not.toBe(""); } }

    expect(quiz.faq.some(item => item.question.en.includes("PMP, CAPM or PRINCE2") && item.answer.en.startsWith("No."))).toBe(true);
    expect(quiz.directions.map(d => d.itemCount)).toEqual([6, 6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    const positions = quiz.questions.map(q => q.correctOptionId); for (const [i,id] of ["A", "B", "C", "D"].entries()) expect(positions.filter(v => v === id)).toHaveLength([8,8,7,7][i]);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(7); expect(profile.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThanOrEqual(230); expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60); expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    const check = (value: unknown): void => { if (!value || typeof value !== "object") return; const obj = value as Record<string, unknown>; if ("en" in obj || "zh" in obj) { expect(String(obj.en).trim()).not.toBe(""); expect(obj.en).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder/u); expect(String(obj.zh).trim()).not.toBe(""); if (!/\p{Script=Han}/u.test(String(obj.zh))) expect(String(obj.zh).replaceAll("、", ", ")).toBe(obj.en); } else Object.values(obj).forEach(check); }; check(quiz);
  });
  it("matches16807reachable five-section correctnessvectors and120single-optionprobes",()=>{
    let checked=0;
    for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)for(let c=0;c<=6;c++)for(let d=0;d<=6;d++)for(let e=0;e<=6;e++){
      const values=[a,b,c,d,e],answers=answer(values),result=scoreQuestionnaire(quiz,answers);
      if(result.status!=="complete"||!("practice"in result))throw new Error("Practice witness rejected");
      // Keep every vector and the complete result shape without constructing per-item matchers.
      assert.deepStrictEqual(result, {
        status: "complete", answered: 30,
        practice: {
          correct: a+b+c+d+e, total: 30,
          sections: Object.fromEntries(quiz.directions.map((part,i)=>[part.id,{correct:values[i],total:6}])),
          items: source.questions.map(item=>({questionId:item.id,selectedOptionId:answers[item.id],correctOptionId:truth.get(item.id),correct:answers[item.id]===truth.get(item.id)})),
        },
      }, `Incorrect project-practice result for vector ${values.join(",")}`);
      checked++;
    }
    expect(checked).toBe(16807);let probes=0;
    for(const q of quiz.questions)for(const option of q.options){const answers=answer();answers[q.id]=option.id;const result=scoreQuestionnaire(quiz,answers);if(result.status!=="complete"||!("practice"in result))throw new Error("Option witness rejected");expect(result.practice.correct).toBe(option.id===truth.get(q.id)?30:29);expect(result.practice.items.find(v=>v.questionId===q.id)?.correct).toBe(option.id===truth.get(q.id));probes++;}
    expect(probes).toBe(120);console.info("ProjectPractice:30reviewedkeys+16807correctnessvectors+120optionprobes;not4^30paths,PMreview or psychometricvalidation.");
  });
  it("shows all30correctanswers and explanations and5completeguides at zero,partial and perfect counts", () => {
    for (const locale of ["en", "zh"] as const) for (const values of [[0, 0, 0, 0, 0], [1, 5, 2, 6, 0], [6, 6, 6, 6, 6]]) {
      const result = scoreQuestionnaire(quiz, answer(values)); if (result.status !== "complete" || !("practice" in result)) throw new Error("Report witness rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(30); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(30); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(5);
      for (const question of quiz.questions) { const item = dom.querySelector(`[data-practice-question="${question.id}"]`)!; expect(item.textContent).toContain(question.explanation![locale]); expect(item.textContent).toContain(question.options.find(o => o.id === truth.get(question.id))!.label[locale]); }
      for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds partial results,rejects malformed answers/keys and expires opt-in drafts", () => {
    const partial = answer(); delete partial.PROJECT_30; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 29 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { PROJECT_01: "na" }, { PROJECT_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "not-an-option"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { PROJECT_01: "D" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ PROJECT_01: "D" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes12nativeENZHpageswith practice language,complete guides and correct publicSEO", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules(); const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/project-management`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), meta = await entry.generateMetadata(props);
      expect(meta.title).toBe(quiz.seoTitle[locale]); expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank");
      for (const profile of quiz.profiles) {
        const publicPath = `${path}/results/${profile.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: profile.id }) }, rendered = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = rendered;
        expect(dom.querySelector("h1")?.textContent).toBe(profile.title[locale]); for (const section of profile.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(profile.seo!.title[locale]); expect(metadata.description).toBe(profile.seo!.description[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${publicPath}`); expect(metadata.alternates?.languages).toMatchObject({ en: `https://fermatmind.com/en/tests/explore/project-management/results/${profile.id}`, "zh-CN": `https://fermatmind.com/zh/tests/explore/project-management/results/${profile.id}` }); expect(maps.some(e => e.loc === `https://fermatmind.com${publicPath}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
