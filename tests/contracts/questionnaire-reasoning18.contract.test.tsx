import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { REASONING18_SECTIONS, REASONING18_LIMITS, isReasoning18ConfigurationValid, readReasoning18Clock, scoreReasoning18, type Reasoning18Questionnaire } from "@/lib/questionnaires/reasoning18";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/employer-reasoning-practice-test.json", "utf8")) as Reasoning18Questionnaire;
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
const sections = () => REASONING18_SECTIONS.map(id => ({ id, reason: "finished", elapsedMs: 0 }));
const allCorrect = () => Object.fromEntries(quiz.questions.map(q => [q.id, q.correctOptionId!]));
const attempt = (answers: Record<string, string> = {}) => ({ mode: "study", answers, sections: sections() });
function complete(x: unknown) { const r = scoreReasoning18(quiz, x); if (r.status !== "complete") throw Error("Complete practice rejected"); return r.result; }
describe("original mixed-format three-area reasoning practice", () => {
  it("binds 18 English tasks in both UIs and three substantive bilingual guides", () => {
    expect(isReasoning18ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(18); expect(quiz.reasoning18.sections.map(s => s.limitSeconds)).toEqual(REASONING18_LIMITS);
    for (const q of quiz.questions) { expect(q.prompt.zh).toBe(q.prompt.en); expect(q.prompt.en).not.toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.label.en === o.label.zh)).toBe(true); expect(q.explanation?.zh).toMatch(/\p{Script=Han}/u); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true); expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(700); for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); } }
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.reasoning18.editionNotice.en).toContain("Not validated");
    expect(readFileSync("public/fonts/noto-sans-sc/employer-reasoning-practice-test-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks arithmetic, rule families and text evidence with independent witnesses", () => {
    const answer = (i:number) => quiz.questions[i].options.find(o=>o.id===quiz.questions[i].correctOptionId)!.label.en;
    const expected=[100*(200-160)/160,(3*10+2*25)/5,200*.9*1.2,80*1.25+5,90/(60+90)*100,.6*2.5*60];
    expected.forEach((n,i)=>expect(parseFloat(answer(i+6))).toBeCloseTo(n,8));
    const seq=[3,8,15,24,35],diff=seq.slice(1).map((x,i)=>x-seq[i]);expect(diff.slice(1).map((x,i)=>x-diff[i])).toEqual([2,2,2]);expect(Number(answer(12))).toBe(seq.at(-1)!+diff.at(-1)!+2);
    expect(Number(answer(13))).toBe(9+(6-3));expect(answer(14)).toBe(String.fromCharCode("H".charCodeAt(0)+2)+String(24*2));
    const ops=[(a:number,b:number)=>a+b,(a:number,b:number)=>a-b,(a:number,b:number)=>a*b,(a:number,b:number)=>a/b],valid=ops.filter(f=>f(3,5)===8&&f(4,7)===11);expect(valid).toHaveLength(1);expect(Number(answer(15))).toBe(valid[0](6,9));
    const permutations=(xs:string[]):string[][]=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
    const order=permutations(["U","R","S","T"]).filter(p=>p.indexOf("U")<p.indexOf("R")&&p.indexOf("R")<p.indexOf("S")&&p.indexOf("S")<p.indexOf("T"));expect(order).toHaveLength(1);expect(answer(16)).toBe(order[0][1]);
    expect(answer(17)).toBe(Array.from({length:6},(_,i)=>"AB"[i%2]+String(i%3+1)).at(-1));
    expect(quiz.questions.slice(0,6).map(q=>q.correctOptionId)).toEqual(["A","B","C","C","D","A"]);
    expect(quiz.questions.map(q=>q.options.length)).toEqual([...Array(3).fill(3),...Array(15).fill(4)]);
    for(const q of quiz.questions.slice(0,3))expect(scoreReasoning18(quiz,attempt({[q.id]:"D"})).status).toBe("invalid");
  });
  it("fails closed on sparse and malformed arrays at every required boundary",()=>{
    for(const field of ["questions","directions","profiles","guide","faq","references"] as const){const copy=structuredClone(quiz);delete copy[field]![0];expect(isReasoning18ConfigurationValid(copy)).toBe(false);}
    for(const mutate of [(q:Reasoning18Questionnaire)=>{delete q.questions[0].options[1];},(q:Reasoning18Questionnaire)=>{delete q.reasoning18.sections[2];},(q:Reasoning18Questionnaire)=>{delete q.profiles[1].sections[3];},(q:Reasoning18Questionnaire)=>{delete q.profiles[0].sections[0].paragraphs[0];}]){const copy=structuredClone(quiz);mutate(copy);expect(isReasoning18ConfigurationValid(copy)).toBe(false);}
    const sparse=sections();delete sparse[1];expect(scoreReasoning18(quiz,{...attempt(),sections:sparse}).status).toBe("invalid");
  });
  it("counts every option and skip on every item without treating unselected responses as wrong", () => {
    for (const [i,q] of quiz.questions.entries()) for (const value of [...q.options.map(o=>o.id),"skip"]) {
      const result = complete(attempt({ [q.id]: value })), correct = value === q.correctOptionId ? 1 : 0, wrong = value !== "skip" && !correct ? 1 : 0;
      expect(result.overall).toEqual({correct,wrong,unanswered:18-correct-wrong,total:18});
      expect(result.parts[Math.floor(i/6)]).toMatchObject({correct,wrong,unanswered:6-correct-wrong,total:6});
      expect(result.items[i].selectedOptionId).toBe(value === "skip" ? null : value);
    }
    expect(complete(attempt()).overall).toEqual({correct:0,wrong:0,unanswered:18,total:18});
    expect(complete(attempt(Object.fromEntries(quiz.questions.map(q => [q.id,"skip"])))).overall.unanswered).toBe(18);
    for (let count=0;count<=18;count++) { const answers=Object.fromEntries(quiz.questions.map((q,i) => [q.id,i<count?q.correctOptionId!:q.options.find(o=>o.id!==q.correctOptionId)!.id])); expect(complete(attempt(answers)).overall).toEqual({correct:count,wrong:18-count,unanswered:0,total:18}); }
    expect(Object.keys(complete(attempt()).overall)).toEqual(["correct","wrong","unanswered","total"]);
  });
  it("enforces deadline endpoints, clock drift and no paused elapsed time", () => {
    const start={wall:1000000,monotonic:2000};
    expect(readReasoning18Clock(start,{wall:1000000,monotonic:2000},180)).toEqual({status:"running",elapsedMs:0,remainingSeconds:180});
    expect(readReasoning18Clock(start,{wall:1179999,monotonic:181999},180)).toEqual({status:"running",elapsedMs:179999,remainingSeconds:1});
    expect(readReasoning18Clock(start,{wall:1180000,monotonic:182000},180)).toEqual({status:"expired",elapsedMs:180000,remainingSeconds:0});
    expect(readReasoning18Clock(start,{wall:1300000,monotonic:302000},240)).toEqual({status:"expired",elapsedMs:300000,remainingSeconds:0});
    for(const current of [{wall:1001601,monotonic:2000},{wall:999999,monotonic:2000},{wall:1000000,monotonic:1999},{wall:NaN,monotonic:2000},{wall:1000000,monotonic:Infinity}]) expect(readReasoning18Clock(start,current,240).status).toBe("invalid");
    expect(readReasoning18Clock(start,start,0).status).toBe("invalid");
    const timed={mode:"timed",answers:{},sections:sections().map((s,i)=>({...s,reason:"expired",elapsedMs:REASONING18_LIMITS[i]*1000+42}))};
    expect(complete(timed).overall).toEqual({correct:0,wrong:0,unanswered:18,total:18});
    timed.sections[0].elapsedMs=179999;expect(scoreReasoning18(quiz,timed).status).toBe("invalid");
  });
  it("rejects malformed snapshots, incomplete sections and edition drift with no generic score or draft", () => {
    for(const input of [null,[],{}, { ...attempt(), mode:"other" }, {...attempt(),mode:{toString:()=>"study"}}, {...attempt(),extra:1}, {...attempt(),answers:{extra:"A"}}, {...attempt(),answers:{REASON_1_01:undefined}}, {...attempt(),answers:{REASON_1_01:"E"}}, {...attempt(),answers:{REASON_1_01:null}}, {...attempt(),answers:{REASON_1_01:Object.create(null)}}, {...attempt(),sections:sections().map(s=>({...s,reason:Object.create(null)}))}, {...attempt(),answers:[]}, {...attempt(),answers:{[Symbol("private")]:"A"}}, {...attempt(),sections:[...sections(),sections()[0]]}, {...attempt(),sections:[...sections()].reverse()}, {...attempt(),sections:sections().map(s=>({...s,reason:"expired"}))}, {...attempt(),sections:sections().map(s=>({...s,elapsedMs:1}))}]) expect(scoreReasoning18(quiz,input).status).toBe("invalid");
    for(let n=0;n<3;n++) expect(scoreReasoning18(quiz,{...attempt(),sections:sections().slice(0,n)}).status).toBe("incomplete");
    const mutations: ((q:Reasoning18Questionnaire)=>void)[]=[q=>{q.questions[0].prompt.en+=".";},q=>{q.questions[0].prompt.zh="中文题干";},q=>{q.questions[0].correctOptionId="B";},q=>{q.questions[0].options[0].label.en="altered";},q=>{q.questions[0].reverse=true;},q=>{q.reasoning18.sections[0].limitSeconds=200;},q=>{q.profiles[0].sections[0].paragraphs.pop();},q=>{q.source.itemBankSha256="0".repeat(64);},q=>{q.references!.pop();}];
    for(const mutate of mutations){const copy=structuredClone(quiz);mutate(copy);expect(isReasoning18ConfigurationValid(copy)).toBe(false);expect(scoreReasoning18(copy,attempt()).status).toBe("unavailable");}
    expect(scoreQuestionnaire(quiz,allCorrect())).toEqual({status:"unavailable",answered:0}); expect(readQuestionnaireDraft(quiz,JSON.stringify({version:quiz.version,savedAt:Date.now(),answers:allCorrect()}))).toBeNull();
  });
  it("requires private action consent and disables ordinary analytics for this route and guides", () => {
    expect(entertainmentActivityCatalog.find(x=>x.slug===quiz.slug)?.privacy).toBe("explicit_opt_in");
    for(const lang of ["en","zh"]) for(const tail of ["","/results/numerical"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/${quiz.slug}${tail}?score=9`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl(`/en/tests/explore/${quiz.slug}-other`)).toBe(false);
  });
  it("renders bilingual SSR content and full guides with canonical, hreflang, directory and sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");
    try{
      const entry=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),maps=appendFunSitemapEntries([]);
      for(const locale of ["en","zh"] as const){
        const base=`/${locale}/tests/explore/${quiz.slug}`,props={params:Promise.resolve({locale,slug:quiz.slug})},dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.reasoning18.attribution[locale]);
        for(const s of quiz.guide)for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);for(const f of quiz.faq)expect(dom.textContent).toContain(f.answer[locale]);
        const meta=await entry.generateMetadata(props);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/holland-career-interest-test-riasec"]`)).not.toBeNull();expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${base}"`);
        for(const p of quiz.profiles){const props={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})},path=`${base}/results/${p.id}`;dom.innerHTML=renderToStaticMarkup(await guide.default(props));expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);const meta=await guide.generateMetadata(props);expect(meta.title).toBe(p.seo?.title[locale]);expect(meta.description).toBe(p.seo?.description[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);expect(meta.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}`});expect(maps.filter(x=>x.loc===`https://fermatmind.com${path}`)).toHaveLength(1);expect(dom.querySelector("[data-reasoning18-result]")).toBeNull();if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
        expect(maps.filter(x=>x.loc===`https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile:"unknown"})})).rejects.toThrow();
    }finally{vi.unstubAllEnvs();}
  });
});
