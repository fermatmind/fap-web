import assert from "node:assert/strict";
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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/abstract-reasoning.json", "utf8")) as Questionnaire;
type Check={id:string;kind:string;expected_label:string;operators?:string[];input?:string[];target?:string;examples?:string[][];predicates?:string[];positive?:string[];negative?:string[];targets?:string[];start?:string;steps?:string[];mapping?:Record<string,string>;if_starts?:string;yes?:string;no?:string;then?:string;rows?:string[];sets?:string[];display_sets?:boolean};
const bytes=readFileSync("tests/fixtures/questionnaires/abstract-reference.json"),source=JSON.parse(bytes.toString()) as {questions:Questionnaire["questions"];checks:Check[]};
const profileBytes=readFileSync("tests/fixtures/questionnaires/abstract-profiles-reference.json");
function op(name:string,x:string):string {
 const n=x.length;
 if(name==="identity")return x;if(name==="left")return x.slice(1)+x[0];if(name==="right")return x[n-1]+x.slice(0,-1);if(name==="reverse")return [...x].reverse().join("");
 if(name==="middle")return x[0]+x[2]+x[1]+x[3];if(name==="outer")return x[n-1]+x.slice(1,-1)+x[0];if(name==="first")return x[1]+x[0]+x.slice(2);if(name==="last")return x.slice(0,-2)+x[n-1]+x[n-2];
 if(name==="invert")return [...x].map(c=>c==="0"?"1":"0").join("");if(name==="allA")return "A".repeat(n);if(name==="allB")return "B".repeat(n);if(name==="repeatFirst")return x[0].repeat(4);
 if(name.startsWith("shift")){const alpha="ABCDEF",shift=Number(name.slice(5));return [...x].map(c=>alpha[(alpha.indexOf(c)+shift+6)%6]).join("");}
 if(name==="cycleABC"||name==="backABC"){const a="ABC",k=name==="cycleABC"?1:2;return [...x].map(c=>a[(a.indexOf(c)+k)%3]).join("");}
 if(name==="doubleMiddle")return x[0]+x[1].repeat(2)+x[2];if(name==="doubleFirst")return x[0]+x;if(name==="doubleLast")return x+x[n-1];if(name==="appendFirst")return x+x[0];
 if(name==="complement")return [..."ABCD"].filter(c=>!x.includes(c)).join("");if(name==="addA")return [...new Set(x+"A")].sort().join("");if(name==="removeA")return [...x].filter(c=>c!=="A").join("");throw Error(name);
}
function predicate(name:string,x:string):boolean {
 const kinds=new Set(x).size;
 if(name==="palindrome")return x===[...x].reverse().join("");if(name==="outerEqual")return x[0]===x.at(-1);if(name==="twoKinds")return kinds===2;if(name==="firstEqual")return x[0]===x[1];if(name==="lastEqual")return x.at(-1)===x.at(-2);
 if(name==="alternating4")return x.length===4&&x[0]===x[2]&&x[1]===x[3]&&x[0]!==x[1];if(name==="oneA")return [...x].filter(c=>c==="A").length===1;if(name==="hasA")return x.includes("A");if(name==="startsA")return x[0]==="A";if(name==="allDifferent")return kinds===x.length;
 if(name==="twoOnes")return [...x].filter(c=>c==="1").length===2;if(name==="hasOne")return x.includes("1");if(name==="startsOne")return x[0]==="1";
 if(name==="leadingPairDistinct")return x.length===4&&x[0]===x[1]&&new Set([x[0],x[2],x[3]]).size===3;if(name==="hasRepeat")return kinds<x.length;if(name==="outerPairDistinct")return x.length===4&&x[0]===x[3]&&kinds===3;throw Error(name);
}
function compute(c:Check):string {
 let value="";
 if(c.kind==="series"||c.kind==="analogy"){
  const pairs=c.kind==="analogy"?c.examples!:c.input!.slice(1).map((next,i)=>[c.input![i],next]);const fitted=c.operators!.filter(name=>pairs.every(([a,b])=>op(name,a)===b));assert.equal(fitted.length,1,c.id);value=op(fitted[0],c.target!);
 }else if(c.kind==="classification"){
  const fitted=c.predicates!.filter(name=>c.positive!.every(x=>predicate(name,x))&&c.negative!.every(x=>!predicate(name,x)));assert.equal(fitted.length,1,c.id);const accepted=c.targets!.filter(x=>predicate(fitted[0],x));assert.equal(accepted.length,1,c.id);value=accepted[0];
 }else if(c.kind==="chain"){value=c.steps!.reduce((x,name)=>op(name,x),c.start!);
 }else if(c.kind==="expand"){value=[...c.start!].map(x=>c.mapping![x]).join("");
 }else if(c.kind==="conditional"){value=op(c.then!,op(c.start!.startsWith(c.if_starts!)?c.yes!:c.no!,c.start!));
 }else if(c.kind==="transpose"){value=[...c.rows![0]].map((_,i)=>c.rows!.map(row=>row[i]).join("")).join("");
 }else if(c.kind==="xor"){const[a,b]=c.sets!;value=[...new Set(a+b)].filter(x=>a.includes(x)!==b.includes(x)).sort().join("");
 }else throw Error(c.kind);
 if(c.display_sets)value="{"+[...value].join(",")+"}";assert.equal(value,c.expected_label,c.id);return value;
}
const truth=new Map(source.checks.map(c=>{const value=compute(c),q=source.questions.find(q=>q.id===c.id)!;const options=q.options.filter(o=>o.label.en===value);assert.equal(options.length,1,c.id);return[c.id,options[0].id];}));
function answer(counts = [6, 6, 6, 6]) {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((section, i) => quiz.questions.filter(q => q.options[0].directionId === section.id).forEach((q, j) => {
    answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id;
  }));
  return answers;
}
describe("T148 original finite-rule abstract practice", () => {
  it("binds24original bilingual tasks, computed keys and4complete seven-section guides", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(24); expect(source.checks).toHaveLength(24);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id)));
    expect(quiz.directions.map(s => s.itemCount)).toEqual([6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(24);
    for (const q of quiz.questions) { expect(q.options.every(o => o.label.en === o.label.zh)).toBe(true); expect(q.options).toHaveLength(4); expect(q.explanation!.en.length).toBeGreaterThan(120); expect(q.explanation!.zh).toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.directionId === q.options[0].directionId && o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400); expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(readFileSync("public/fonts/noto-sans-sc/abstract-reasoning-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks fresh guide calculations without borrowing a test-vendor key",()=>{
    assert.equal(op("left","YZWX"),"ZWXY");assert.equal(op("reverse","UVWX"),"XWVU");assert.equal(op("outer","UVWX"),"XVWU");assert.equal(op("doubleLast","KLM"),"KLMM");
    assert.equal(op("reverse",op("right","KLMN")),"MLKN");assert.equal(op("right",op("reverse","KLMN")),"KNML");assert.equal(predicate("palindrome","PQQP"),true);assert.equal(predicate("palindrome","PQRP"),false);
    const a="ABCDE";assert.equal([..."BD"].map(c=>a[(a.indexOf(c)+2)%5]).join(""),"DA");assert.equal([..."PQRST"].filter(c=>!"QS".includes(c)).join(""),"PRT");
    assert.equal(["GH","IJ","KL"][0].split("").map((_,i)=>["GH","IJ","KL"].map(row=>row[i]).join("")).join(""),"GIKHJL");
    assert.equal(op("reverse","PQST"),"TSQP");assert.equal(op("left","PQST"),"QSTP");expect(quiz.introduction.en).toContain("not its psychometric validity");
  });
  it("recomputes all2401four-section count vectors and96option probes without an ability band", () => {
    let checked=0;
    for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)for(let c=0;c<=6;c++)for(let d=0;d<=6;d++){
      const counts=[a,b,c,d],answers=answer(counts),result=scoreQuestionnaire(quiz,answers);
      assert.deepStrictEqual(result,{status:"complete",answered:24,practice:{correct:a+b+c+d,total:24,
        sections:Object.fromEntries(quiz.directions.map((part,i)=>[part.id,{correct:counts[i],total:6}])),
        items:source.questions.map(q=>({questionId:q.id,selectedOptionId:answers[q.id],correctOptionId:truth.get(q.id),correct:answers[q.id]===truth.get(q.id)}))}});checked++;
    }expect(checked).toBe(2401);let probes=0;
    for(const q of quiz.questions)for(const o of q.options){const responses=answer();responses[q.id]=o.id;const result=scoreQuestionnaire(quiz,responses);if(result.status!=="complete"||!("practice"in result))throw Error("Option probe rejected");assert.equal(result.practice.correct,o.id===truth.get(q.id)?24:23);assert.equal(result.practice.items.find(v=>v.questionId===q.id)?.correct,o.id===truth.get(q.id));probes++;}
    expect(probes).toBe(96);console.info("Abstract:24literalcomputedkeys/18finiteuniqueinferences+6explicitoperations;2401reachablecountvectors+96optionprobes;not4^24pathsorpsychometricvalidation.");
  });
  it("shows all24 explanations and all4FULL7 guides at zero,partial and perfect counts in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const counts of [[0, 0, 0, 0], [1, 4, 6, 2], [6, 6, 6, 6]]) {
      const result = scoreQuestionnaire(quiz, answer(counts)); if (result.status !== "complete" || !("practice" in result)) throw Error("Valid report rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(24); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(4);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-practice-question="${q.id}"]`)?.textContent).toContain(q.explanation![locale]);
      for (const p of quiz.profiles) for (const section of p.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds incomplete counts, rejects malformed answers and invalid keys, and expires optional drafts", () => {
    const partial = answer(); delete partial.q24; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 23 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { q1: "unknown" }, { q1: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "missing"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { q1: "B" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ q1: "B" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes all10 native pages with full guides, canonical pairs, sitemap membership and practice entry wording", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/abstract-reasoning`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const entryDom = document.createElement("div"); entryDom.innerHTML = html;
      const method = entryDom.querySelector('section[aria-labelledby="questionnaire-method"]');
      const scoringText = quiz.guide.find(section => section.id === "counts")!.paragraphs[0][locale];
      expect(method?.querySelector("p")?.textContent).toBe(scoringText);
      expect(method?.closest("details")).toBeNull();
      expect([...entryDom.querySelectorAll("p")].filter(p => p.textContent === scoringText)).toHaveLength(1);
      for (const p of quiz.profiles) {
        const native = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
