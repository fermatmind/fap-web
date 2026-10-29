import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AFQT32_SECTIONS, AFQT32_LIMITS, isAfqt32ConfigurationValid, readAfqt32Clock, scoreAfqt32, type Afqt32Questionnaire } from "@/lib/questionnaires/afqt32";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/asvab-practice-test.json", "utf8")) as Afqt32Questionnaire;
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
const sections = () => AFQT32_SECTIONS.map(id => ({ id, reason: "finished", elapsedMs: 0 }));
const allCorrect = () => Object.fromEntries(quiz.questions.map(q => [q.id, q.correctOptionId!]));
const attempt = (answers: Record<string, string> = {}) => ({ mode: "study", answers, sections: sections() });
function complete(x: unknown) { const r = scoreAfqt32(quiz, x); if (r.status !== "complete") throw Error("Complete practice rejected"); return r.result; }
describe("original four-area English AFQT-style practice", () => {
  it("binds 32 English tasks in both UIs and four substantive bilingual guides", () => {
    expect(isAfqt32ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(32); expect(quiz.afqt32.sections.map(s => s.limitSeconds)).toEqual(AFQT32_LIMITS);
    for (const q of quiz.questions) { expect(q.prompt.zh).toBe(q.prompt.en); expect(q.prompt.en).not.toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.label.en === o.label.zh)).toBe(true); expect(q.explanation?.zh).toMatch(/\p{Script=Han}/u); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true); expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(700); for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); } }
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.afqt32.editionNotice.en).toContain("Not validated");
    expect(readFileSync("public/fonts/noto-sans-sc/asvab-practice-test-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks all sixteen numeric answers against independent arithmetic and algebra witnesses", () => {
    const ar = [6*18-11,75*(1-20/100),54*2/(2+7),420/(150/30),4*12/6,3*4-2,2*14+3*8,(84-12)/2];
    for (const [i, value] of ar.entries()) expect(quiz.questions[i].options.find(o => o.id === quiz.questions[i].correctOptionId)!.label.en.replace(/\$/g, "")).toBe(String(value));
    const numeric: Record<number, number> = { 24: (26-5)/3, 26: Math.sqrt(6**2+8**2), 28: 2**3 * 2**2, 29: (4+7+9+12)/4, 31: 12*5/2 };
    for (const [i, value] of Object.entries(numeric)) { const q = quiz.questions[Number(i)]; expect(q.options.find(o => o.id === q.correctOptionId)!.label.en).toBe(String(value)); }
    expect(quiz.questions[25].options.find(o => o.id === quiz.questions[25].correctOptionId)!.label.en).toBe("6a + 2b");
    for (const [a,b] of [[2,3],[-4,7],[0,-2]]) expect(2*a+3*b+4*a-b).toBe(6*a+2*b);
    expect(quiz.questions[27].options.find(o => o.id === quiz.questions[27].correctOptionId)!.label.en).toBe("(x − 3)(x + 3)");
    for (const x of [-5,-1,0,2,8]) expect((x-3)*(x+3)).toBe(x*x-9);
    expect(quiz.questions[30].options.find(o => o.id === quiz.questions[30].correctOptionId)!.label.en).toBe(`${3}/${3+2}`);
  });
  it("counts every option and skip on every item without treating unselected responses as wrong", () => {
    for (const [i,q] of quiz.questions.entries()) for (const value of ["A","B","C","D","skip"]) {
      const result = complete(attempt({ [q.id]: value })), correct = value === q.correctOptionId ? 1 : 0, wrong = value !== "skip" && !correct ? 1 : 0;
      expect(result.overall).toEqual({correct,wrong,unanswered:32-correct-wrong,total:32});
      expect(result.parts[Math.floor(i/8)]).toMatchObject({correct,wrong,unanswered:8-correct-wrong,total:8});
      expect(result.items[i].selectedOptionId).toBe(value === "skip" ? null : value);
    }
    expect(complete(attempt()).overall).toEqual({correct:0,wrong:0,unanswered:32,total:32});
    expect(complete(attempt(Object.fromEntries(quiz.questions.map(q => [q.id,"skip"])))).overall.unanswered).toBe(32);
    for (let count=0;count<=32;count++) { const answers=Object.fromEntries(quiz.questions.map((q,i) => [q.id,i<count?q.correctOptionId!:q.options.find(o=>o.id!==q.correctOptionId)!.id])); expect(complete(attempt(answers)).overall).toEqual({correct:count,wrong:32-count,unanswered:0,total:32}); }
    expect(Object.keys(complete(attempt()).overall)).toEqual(["correct","wrong","unanswered","total"]);
  });
  it("enforces deadline endpoints, clock drift and no paused elapsed time", () => {
    const start={wall:1000000,monotonic:2000};
    expect(readAfqt32Clock(start,{wall:1000000,monotonic:2000},240)).toEqual({status:"running",elapsedMs:0,remainingSeconds:240});
    expect(readAfqt32Clock(start,{wall:1239999,monotonic:241999},240)).toEqual({status:"running",elapsedMs:239999,remainingSeconds:1});
    expect(readAfqt32Clock(start,{wall:1240000,monotonic:242000},240)).toEqual({status:"expired",elapsedMs:240000,remainingSeconds:0});
    expect(readAfqt32Clock(start,{wall:1300000,monotonic:302000},240)).toEqual({status:"expired",elapsedMs:300000,remainingSeconds:0});
    for(const current of [{wall:1001601,monotonic:2000},{wall:999999,monotonic:2000},{wall:1000000,monotonic:1999},{wall:NaN,monotonic:2000},{wall:1000000,monotonic:Infinity}]) expect(readAfqt32Clock(start,current,240).status).toBe("invalid");
    expect(readAfqt32Clock(start,start,0).status).toBe("invalid");
    const timed={mode:"timed",answers:{},sections:sections().map((s,i)=>({...s,reason:"expired",elapsedMs:AFQT32_LIMITS[i]*1000+42}))};
    expect(complete(timed).overall).toEqual({correct:0,wrong:0,unanswered:32,total:32});
    timed.sections[0].elapsedMs=239999;expect(scoreAfqt32(quiz,timed).status).toBe("invalid");
  });
  it("rejects malformed snapshots, incomplete sections and edition drift with no generic score or draft", () => {
    for(const input of [null,[],{}, { ...attempt(), mode:"other" }, {...attempt(),mode:{toString:()=>"study"}}, {...attempt(),extra:1}, {...attempt(),answers:{extra:"A"}}, {...attempt(),answers:{AFQ_AR01:undefined}}, {...attempt(),answers:{AFQ_AR01:"E"}}, {...attempt(),answers:{AFQ_AR01:null}}, {...attempt(),answers:[]}, {...attempt(),answers:{[Symbol("private")]:"A"}}, {...attempt(),sections:[...sections(),sections()[0]]}, {...attempt(),sections:[...sections()].reverse()}, {...attempt(),sections:sections().map(s=>({...s,reason:"expired"}))}, {...attempt(),sections:sections().map(s=>({...s,elapsedMs:1}))}]) expect(scoreAfqt32(quiz,input).status).toBe("invalid");
    for(let n=0;n<4;n++) expect(scoreAfqt32(quiz,{...attempt(),sections:sections().slice(0,n)}).status).toBe("incomplete");
    const mutations: ((q:Afqt32Questionnaire)=>void)[]=[q=>{q.questions[0].prompt.en+=".";},q=>{q.questions[0].prompt.zh="中文题干";},q=>{q.questions[0].correctOptionId="A";},q=>{q.questions[0].options[0].label.en="altered";},q=>{q.questions[0].reverse=true;},q=>{q.afqt32.sections[0].limitSeconds=200;},q=>{q.profiles[0].sections[0].paragraphs.pop();},q=>{q.source.itemBankSha256="0".repeat(64);},q=>{q.references!.pop();}];
    for(const mutate of mutations){const copy=structuredClone(quiz);mutate(copy);expect(isAfqt32ConfigurationValid(copy)).toBe(false);expect(scoreAfqt32(copy,attempt()).status).toBe("unavailable");}
    expect(scoreQuestionnaire(quiz,allCorrect())).toEqual({status:"unavailable",answered:0}); expect(readQuestionnaireDraft(quiz,JSON.stringify({version:quiz.version,savedAt:Date.now(),answers:allCorrect()}))).toBeNull();
  });
  it("requires private action consent and disables ordinary analytics for this route and guides", () => {
    expect(entertainmentActivityCatalog.find(x=>x.slug===quiz.slug)?.privacy).toBe("explicit_opt_in");
    for(const lang of ["en","zh"]) for(const tail of ["","/results/word-knowledge"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/${quiz.slug}${tail}?score=9`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl(`/en/tests/explore/${quiz.slug}-other`)).toBe(false);
  });
  it("renders bilingual SSR content and full guides with canonical, hreflang, directory and sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");
    try{
      const entry=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),maps=appendFunSitemapEntries([]);
      for(const locale of ["en","zh"] as const){
        const base=`/${locale}/tests/explore/${quiz.slug}`,props={params:Promise.resolve({locale,slug:quiz.slug})},dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.afqt32.attribution[locale]);
        for(const s of quiz.guide)for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);for(const f of quiz.faq)expect(dom.textContent).toContain(f.answer[locale]);
        const meta=await entry.generateMetadata(props);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/holland-career-interest-test-riasec"]`)).not.toBeNull();expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${base}"`);
        for(const p of quiz.profiles){const props={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})},path=`${base}/results/${p.id}`;dom.innerHTML=renderToStaticMarkup(await guide.default(props));expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);const meta=await guide.generateMetadata(props);expect(meta.title).toBe(p.seo?.title[locale]);expect(meta.description).toBe(p.seo?.description[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);expect(meta.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}`});expect(maps.filter(x=>x.loc===`https://fermatmind.com${path}`)).toHaveLength(1);expect(dom.querySelector("[data-afqt32-result]")).toBeNull();if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
        expect(maps.filter(x=>x.loc===`https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile:"unknown"})})).rejects.toThrow();
    }finally{vi.unstubAllEnvs();}
  });
});
