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
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/mechanical-reasoning.json", "utf8")) as Questionnaire;
const bytes = readFileSync("tests/fixtures/questionnaires/mechanical-reference.json"), source = JSON.parse(bytes.toString()) as { questions: Questionnaire["questions"]; checks: { id: string; expected_label: string; exact_expression: string; authority: string }[] };
const profileBytes = readFileSync("tests/fixtures/questionnaires/mechanical-profiles-reference.json");
type Q=readonly[bigint,bigint];
const r=(n:number|string|bigint,d:number|bigint=1):Q=>[BigInt(n),BigInt(d)],mul=(a:Q,b:Q):Q=>[a[0]*b[0],a[1]*b[1]],div=(a:Q,b:Q):Q=>[a[0]*b[1],a[1]*b[0]],add=(a:Q,b:Q):Q=>[a[0]*b[1]+b[0]*a[1],a[1]*b[1]];
function numeric(x:string):Q{const z=x.match(/^[\d./]+/)![0];if(z.includes("/")){const [n,d]=z.split("/");return r(n,BigInt(d));}const[n,d=""]=z.split(".");return r(n+d,BigInt(10)**BigInt(d.length));}
const exact:(Q|null)[]=[div(mul(r(90),r(40,100)),r(120,100)),div(mul(r(48),r(75,100)),r(30,100)),div(r(90,100),r(15,100)),div(mul(r(35),r(80,100)),r(140)),div(r(72),r(2)),div(add(mul(r(12),r(25,100)),mul(r(20),r(15,100))),r(50,100)),div(mul(r(240),r(18)),r(54)),div(mul(r(360),r(16)),r(64)),div(mul(r(2),r(36)),r(12)),div(mul(r(75),r(28)),r(14)),null,null,div(r(180),r(1)),div(r(240),r(2)),div(r(360),r(4)),mul(r(3),r(40,100)),mul(r(200),r(60,100)),mul(r(3),r(70)),mul(r(250),r(8,100)),div(r(12),r(3,100)),div(mul(r(15,10),r(10)),r(200)),div(mul(r(4),r(25)),r(10)),div(mul(r(600),r(25)),r(1000)),div(mul(r(5),r(120)),r(300)),mul(mul(r(1000),r(10)),r(18,10)),mul(mul(r(800),r(10)),r(75,100)),div(r(1200),r(900)),div(mul(r(30),r(28)),r(4)),div(mul(r(3),r(10)),r(15)),div(r(45),r(3,1000))];

const truth=new Map(source.questions.map((q,index)=>{const a=exact[index];let matches;if(a){matches=q.options.filter(o=>{const b=numeric(o.label.en);return a[0]*b[1]===b[0]*a[1];});}else{const start=index===10?1:-1,meshes=index===10?2:3,expected=start*((-1)**meshes)===1?"Clockwise":"Counterclockwise";matches=q.options.filter(o=>o.label.en===expected);}assert.equal(matches.length,1,q.id);assert.equal(matches[0].id,q.correctOptionId,q.id);assert.equal(matches[0].label.en,source.checks[index].expected_label,q.id);return[q.id,matches[0].id];}));
function answer(counts = [6, 6, 6, 6, 6]) {
  const answers: QuestionnaireAnswers = {};
  quiz.directions.forEach((section, i) => quiz.questions.filter(q => q.options[0].directionId === section.id).forEach((q, j) => {
    answers[q.id] = j < counts[i] ? truth.get(q.id)! : q.options.find(o => o.id !== truth.get(q.id))!.id;
  }));
  return answers;
}
describe("T153 original ideal-mechanics practice", () => {
  it("binds30original bilingual tasks, reviewed keys and5complete seven-section guides", () => {
    expect(isPracticeConfigurationValid(quiz)).toBe(true); expect(quiz.questions).toHaveLength(30); expect(source.checks).toHaveLength(30);
    expect(quiz.questions).toEqual(source.questions); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(bytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.questions.map(q => q.correctOptionId)).toEqual(quiz.questions.map(q => truth.get(q.id)));
    expect(quiz.directions.map(s => s.itemCount)).toEqual([6, 6, 6, 6, 6]); expect(quiz.source.psychometricValidationCompleted).toBe(false);
    expect(new Set(quiz.questions.map(q => q.prompt.en)).size).toBe(30);
    for (const q of quiz.questions) { expect(q.options).toHaveLength(4); expect(q.explanation!.en.length).toBeGreaterThan(120); expect(q.explanation!.zh).toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.directionId === q.options[0].directionId && o.score === undefined)).toBe(true); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.flatMap(s => s.paragraphs).map(p => p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400); expect(p.seo!.title.en.length).toBeLessThanOrEqual(60); expect(p.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(readFileSync("public/fonts/noto-sans-sc/mechanical-reasoning-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("recomputes all16807five-section correct-count vectors and120optionprobes without assigning an ability band", () => {
    let checked=0;
    for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)for(let c=0;c<=6;c++)for(let d=0;d<=6;d++)for(let e=0;e<=6;e++){
      const counts=[a,b,c,d,e],answers=answer(counts),result=scoreQuestionnaire(quiz,answers);
      assert.deepStrictEqual(result,{status:"complete",answered:30,practice:{correct:a+b+c+d+e,total:30,
        sections:Object.fromEntries(quiz.directions.map((part,i)=>[part.id,{correct:counts[i],total:6}])),
        items:source.questions.map(q=>({questionId:q.id,selectedOptionId:answers[q.id],correctOptionId:truth.get(q.id),correct:answers[q.id]===truth.get(q.id)}))}});checked++;
    }expect(checked).toBe(16807);let probes=0;
    for(const q of quiz.questions)for(const o of q.options){const responses=answer();responses[q.id]=o.id;const result=scoreQuestionnaire(quiz,responses);if(result.status!=="complete"||!("practice"in result))throw Error("Option probe rejected");assert.equal(result.practice.correct,o.id===truth.get(q.id)?30:29);assert.equal(result.practice.items.find(v=>v.questionId===q.id)?.correct,o.id===truth.get(q.id));probes++;}
    expect(probes).toBe(120);console.info("Mechanical:28exactnumeric+2directionkeys+16807countvectors+120optionprobes;not4^30pathsorpsychometricvalidation.");
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
    const partial = answer(); delete partial.MECH_30; expect(scoreQuestionnaire(quiz, partial)).toEqual({ status: "incomplete", answered: 29 });
    for (const invalid of [null, [], new Date(), { UNKNOWN: "A" }, { MECH_01: "unknown" }, { MECH_01: 1 }]) expect(scoreQuestionnaire(quiz, invalid).status).toBe("invalid");
    const bad = structuredClone(quiz); bad.questions[0].correctOptionId = "missing"; expect(scoreQuestionnaire(bad, {})).toEqual({ status: "unavailable", answered: 0 });
    const draft = JSON.stringify({ version: quiz.version, savedAt: 100, answers: { MECH_01: "B" } }); expect(readQuestionnaireDraft(quiz, draft, 200)).toEqual({ MECH_01: "B" }); expect(readQuestionnaireDraft(quiz, draft, 86400100)).toBeNull();
  });
  it("publishes all12 native pages with full guides, canonical pairs, sitemap membership and practice entry wording", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com"); vi.resetModules();
    const entry = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"), guide = await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"), maps = appendFunSitemapEntries([]);
    try { for (const locale of ["en", "zh"] as const) {
      const path = `/${locale}/tests/explore/mechanical-reasoning`, props = { params: Promise.resolve({ locale, slug: quiz.slug }) }, html = renderToStaticMarkup(await entry.default(props)), metadata = await entry.generateMetadata(props);
      expect(metadata.title).toBe(quiz.seoTitle[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${path}`); expect(html).toContain(quiz.instructions![locale]); expect(html).toContain(locale === "zh" ? "原创练习题" : "Original practice bank"); expect(renderToStaticMarkup(<MoreTests locale={locale} />)).toContain(`href="${path}"`);
      const entryDom = document.createElement("div"); entryDom.innerHTML = html;
      const method = entryDom.querySelector('section[aria-labelledby="questionnaire-method"]');
      const methodText = quiz.guide.find(section => section.id === "counts")!.paragraphs[0][locale];
      expect(method?.querySelector("p")?.textContent).toBe(methodText);
      expect(method?.closest("details")).toBeNull();
      expect([...entryDom.querySelectorAll("p")].filter(p => p.textContent === methodText)).toHaveLength(1);
      for (const p of quiz.profiles) {
        const native = `${path}/results/${p.id}`, props = { params: Promise.resolve({ locale, slug: quiz.slug, profile: p.id }) }, html = renderToStaticMarkup(await guide.default(props)), metadata = await guide.generateMetadata(props), dom = document.createElement("div"); dom.innerHTML = html;
        expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]); for (const s of p.sections) for (const text of s.paragraphs) expect(dom.textContent).toContain(text[locale]);
        expect(metadata.title).toBe(p.seo!.title[locale]); expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${native}`); expect(maps.some(e => e.loc === `https://fermatmind.com${native}`)).toBe(true); expect(dom.querySelector("[data-practice-correct]")).toBeNull();
      }
    } } finally { vi.unstubAllEnvs(); vi.resetModules(); }
  });
});
