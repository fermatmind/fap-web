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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/numerical-reasoning.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/numerical-reference.json"), source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; checks: { id: string; expected_label: string; exact_expression: string; authority: string }[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/numerical-profiles-reference.json");
type Q = readonly[bigint,bigint];
const r=(n:number|bigint,d:number|bigint=1):Q=>[BigInt(n),BigInt(d)];
const plus=(a:Q,b:Q):Q=>[a[0]*b[1]+b[0]*a[1],a[1]*b[1]],minus=(a:Q,b:Q):Q=>[a[0]*b[1]-b[0]*a[1],a[1]*b[1]],times=(a:Q,b:Q):Q=>[a[0]*b[0],a[1]*b[1]],over=(a:Q,b:Q):Q=>[a[0]*b[1],a[1]*b[0]];
function parseNumeric(s:string):Q{const x=s.replace(/%$/,""),p=x.split(":");if(p.length===2)return over(parseNumeric(p[0]),parseNumeric(p[1]));const [whole,fraction=""]=x.split(".");return r(BigInt(whole+fraction),BigInt(10)**BigInt(fraction.length));}
const exact:Q[]=[
 minus(times(r(8),r(24)),r(17)),over(r(48,10),r(3,10)),over(r(18+26+31+25),r(4)),times(minus(r(90),r(15)),r(2)),plus(times(r(6),r(18)),times(r(4),r(12))),minus(plus(r(270),r(85)),r(132)),
 times(over(r(36),r(150)),r(100)),times(over(minus(r(400),r(320)),r(320)),r(100)),times(over(minus(r(480),r(360)),r(480)),r(100)),over(r(90),r(25,100)),times(times(r(240),r(115,100)),r(8,10)),minus(r(40),r(32)),
 times(over(r(96),r(3+5)),r(3)),times(r(2,3),r(4,5)),over(times(r(14,10),r(2)),r(5+2)),times(over(r(77),r(7)),r(4)),times(over(r(450),r(6)),r(9)),times(minus(r(40,60),r(54,90)),r(100)),
 times(over(minus(r(90+60),r(70+50)),r(70+50)),r(100)),times(plus(plus(r(24,10),r(31,10)),r(15,10)),r(1000)),over(plus(times(r(10),r(20)),times(r(30),r(40))),r(10+30)),times(minus(r(6,120),r(8,200)),r(100)),minus(minus(r(155),r(100)),minus(r(140),r(95))),times(over(plus(times(r(80),r(25,100)),times(r(120),r(4,10))),r(80+120)),r(100)),
 times(over(r(126),r(18)),r(35)),over(r(180),r(25,10)),times(plus(r(12),r(18)),r(10)),times(over(r(1),plus(r(1,5),r(1,10))),r(60)),over(r(480),plus(r(12),r(30,60))),over(r(320),r(125,100))];
const truth=new Map(source.checks.map((c,index)=>{const q=source.questions[index];assert.equal(c.id,q.id);let a=exact[index];if(index===17)a=r((a[0]*BigInt(20)+a[1])/(BigInt(2)*a[1]),10);const matches=q.options.filter(o=>{const b=parseNumeric(o.label.en);return a[0]*b[1]===b[0]*a[1];});assert.equal(matches.length,1,c.id);assert.equal(matches[0].label.en,c.expected_label);return[c.id,matches[0].id];}));
function answer(counts = [6, 6, 6, 6, 6]) {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((section, i) => quiz.questions.filter(q => q.options[0].directionId === section.id).forEach((q, j) => {
    answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id;
  }));
  return answers;
}
describe("T149 original numerical quantity practice", () => {
  it("binds30original bilingual tasks, reviewed keys and5complete seven-section guides", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(30); expect(source.checks).toHaveLength(30);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id)));
    expect(quiz.directions.map(s => s.itemCount)).toEqual([6, 6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(30);
    for (const q of quiz.questions) { expect(q.options.every(o=>o.label.en===o.label.zh)).toBe(true); expect(q.options).toHaveLength(4); expect(q.explanation!.en.length).toBeGreaterThan(120); expect(q.explanation!.zh).toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.directionId === q.options[0].directionId && o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400); expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(readFileSync("public/fonts/noto-sans-sc/numerical-reasoning-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("recomputes all16807five-section correct-count vectors and120optionprobes without assigning a ability band", () => {
    let checked=0;
    for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)for(let c=0;c<=6;c++)for(let d=0;d<=6;d++)for(let e=0;e<=6;e++){
      const counts=[a,b,c,d,e],answers=answer(counts),result=scoreQuestionnaire(quiz,answers);
      assert.deepStrictEqual(result,{status:"complete",answered:30,practice:{correct:a+b+c+d+e,total:30,
        sections:Object.fromEntries(quiz.directions.map((part,i)=>[part.id,{correct:counts[i],total:6}])),
        items:source.questions.map(q=>({questionId:q.id,selectedOptionId:answers[q.id],correctOptionId:truth.get(q.id),correct:answers[q.id]===truth.get(q.id)}))}});checked++;
    }expect(checked).toBe(16807);let probes=0;
    for(const q of quiz.questions)for(const o of q.options){const responses=answer();responses[q.id]=o.id;const result=scoreQuestionnaire(quiz,responses);if(result.status!=="complete"||!("practice"in result))throw Error("Option probe rejected");assert.equal(result.practice.correct,o.id===truth.get(q.id)?30:29);assert.equal(result.practice.items.find(v=>v.questionId===q.id)?.correct,o.id===truth.get(q.id));probes++;}
    expect(probes).toBe(120);console.info("Numerical:30exactcomputedkeys+16807countvectors+120optionprobes;not4^30pathsorpsychometricvalidation.");
  });
  it("shows all30 explanations and all5FULL7 guides at zero,partial and perfect counts in both languages", () => {
    for (const locale of ["en", "zh"] as const) for (const counts of [[0, 0, 0, 0, 0], [1, 4, 5, 2, 3], [6, 6, 6, 6, 6]]) {
      const result = scoreQuestionnaire(quiz, answer(counts)); if (result.status !== "complete" || !("practice" in result)) throw Error("Valid report rejected");
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnairePracticeReport quiz={quiz} result={result} locale={locale} />);
      expect(dom.querySelectorAll("[data-practice-question]")).toHaveLength(30); expect(dom.querySelectorAll("[data-practice-explanation]")).toHaveLength(30); expect(dom.querySelectorAll("[data-practice-guide]")).toHaveLength(5);
      for (const q of quiz.questions) expect(dom.querySelector(`[data-practice-question="${q.id}"]`)?.textContent).toContain(q.explanation![locale]);
      for (const p of quiz.profiles) for (const section of p.sections) for (const text of section.paragraphs) expect(dom.textContent).toContain(text[locale]);
      const ids = Array.from(dom.querySelectorAll("[id]"), e => e.id); expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("withholds incomplete counts, rejects malformed answers and invalid keys, and expires optional drafts", () => {
    const partial = answer(); delete partial.NUM_30; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 29 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { NUM_01: "unknown" }, { NUM_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "missing"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { NUM_01: "B" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ NUM_01: "B" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes all12 native pages with full guides, canonical pairs, sitemap membership and practice entry wording", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/numerical-reasoning`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      for (const p of quiz.profiles) {
        const native = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
