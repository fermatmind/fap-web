import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TECHNICAL30_SECTIONS, TECHNICAL30_LIMITS, isTechnical30ConfigurationValid, readTechnical30Clock, scoreTechnical30, type Technical30Questionnaire } from "@/lib/questionnaires/technical30";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/asvab-science-mechanical-practice-test.json", "utf8")) as Technical30Questionnaire;
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
const sections = () => TECHNICAL30_SECTIONS.map(id => ({ id, reason: "finished", elapsedMs: 0 }));
const allCorrect = () => Object.fromEntries(quiz.questions.map(q => [q.id, q.correctOptionId!]));
const attempt = (answers: Record<string, string> = {}) => ({ mode: "study", answers, sections: sections() });
function complete(x: unknown) { const r = scoreTechnical30(quiz, x); if (r.status !== "complete") throw Error("Complete practice rejected"); return r.result; }
describe("original five-area science and technical practice", () => {
  it("binds 30 English tasks in both UIs and five substantive bilingual guides", () => {
    expect(isTechnical30ConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256); expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions).toHaveLength(30); expect(quiz.technical30.sections.map(s => s.limitSeconds)).toEqual(TECHNICAL30_LIMITS);
    for (const q of quiz.questions) { expect(q.prompt.zh).toBe(q.prompt.en); expect(q.prompt.en).not.toMatch(/\p{Script=Han}/u); expect(q.options.every(o => o.label.en === o.label.zh)).toBe(true); expect(q.explanation?.zh).toMatch(/\p{Script=Han}/u); }
    for (const p of quiz.profiles) { expect(p.sections).toHaveLength(7); expect(p.sections.every(s => s.paragraphs.length === 2)).toBe(true); expect(p.sections.flatMap(s => s.paragraphs).map(t => t.en).join(" ").split(/\s+/).length).toBeGreaterThan(700); for (const s of p.sections) for (const t of s.paragraphs) { expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu); expect(t.zh).toMatch(/\p{Script=Han}/u); } }
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(quiz.technical30.editionNotice.en).toContain("Not validated");
    expect(readFileSync("public/fonts/noto-sans-sc/asvab-science-mechanical-practice-test-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks numerical and spatial keys against independent model witnesses", () => {
    const answer = (i: number) => quiz.questions[i].options.find(o => o.id === quiz.questions[i].correctOptionId)!.label.en;
    const numbers: Record<number, number> = { 0:20/4,1:360/120,6:72*.25/.75,7:150/3,8:150*20/60,9:120*1/4,11:16*10/2,12:12/6,13:3+9,14:1/(1/6+1/3),15:9*2,22:.075*1000,23:9*.5 };
    for (const [i,n] of Object.entries(numbers)) expect(parseFloat(answer(Number(i)))).toBeCloseTo(n,8);
    expect(answer(10)).toBe("14 N to the left"); expect(answer(16)).toBe("Zero"); expect(answer(17)).toBe("It doubles");
    const set = (cells: number[][]) => [...new Set(cells.map(p=>p.join(",")))].sort();
    const fits = (target:number[][],a:number[][],b:number[][],offset:number[]) => { const moved=b.map(([x,y])=>[x+offset[0],y+offset[1]]); return !moved.some(p=>set(a).includes(p.join(","))) && JSON.stringify(set([...a,...moved]))===JSON.stringify(set(target)); };
    const rectangle=(w:number,h:number)=>Array.from({length:w*h},(_,i)=>[i%w,Math.floor(i/w)]);
    const cases = [ {i:24,target:rectangle(3,2),a:[[0,0],[1,0],[0,1]],b:[[1,0],[0,1],[1,1]]}, {i:25,target:[[0,0],[1,0],[2,0],[1,1]],a:[[0,0],[1,0],[2,0]],b:[[0,0]]}, {i:26,target:rectangle(4,2),a:rectangle(2,2),b:rectangle(2,2)} ];
    for(const c of cases){const valid=quiz.questions[c.i].options.filter(o=>fits(c.target,c.a,c.b,o.label.en.match(/-?\d+/g)!.map(Number)));expect(valid.map(o=>o.id)).toEqual([quiz.questions[c.i].correctOptionId]);}
    expect(answer(27)).toBe(`(${-(-2)},${1})`);
    let cube:Record<string,string>={top:"T",bottom:"B",front:"F",back:"K",right:"R",left:"L"};
    const turn=(cycle:string[])=>{const old={...cube};cube={...cube};for(let i=0;i<cycle.length;i++)cube[cycle[(i+1)%cycle.length]]=old[cycle[i]];};
    turn(["top","right","bottom","left"]);turn(["top","front","bottom","back"]);expect(answer(28)).toBe(cube.front);
    expect(Number(answer(29))).toBe(set([[0,0,0],[1,0,0],[1,1,0],[1,1,1]].map(([x,,z])=>[x,z])).length);
    expect([answer(2),answer(3),answer(4),answer(5)]).toEqual(["Red blood cells","Carbon dioxide","Reflecting sunlight","Evaporation"]);
    expect([answer(18),answer(19),answer(20),answer(21)]).toEqual(["Spark plug","Power","Exhaust system","Transmission"]);
  });
  it("fails closed on sparse and malformed arrays at every required boundary",()=>{
    for(const field of ["questions","directions","profiles","guide","faq","references"] as const){const copy=structuredClone(quiz);delete copy[field]![0];expect(isTechnical30ConfigurationValid(copy)).toBe(false);}
    for(const mutate of [(q:Technical30Questionnaire)=>{delete q.questions[0].options[1];},(q:Technical30Questionnaire)=>{delete q.technical30.sections[2];},(q:Technical30Questionnaire)=>{delete q.profiles[1].sections[3];},(q:Technical30Questionnaire)=>{delete q.profiles[0].sections[0].paragraphs[0];}]){const copy=structuredClone(quiz);mutate(copy);expect(isTechnical30ConfigurationValid(copy)).toBe(false);}
    const sparse=sections();delete sparse[1];expect(scoreTechnical30(quiz,{...attempt(),sections:sparse}).status).toBe("invalid");
  });
  it("counts every option and skip on every item without treating unselected responses as wrong", () => {
    for (const [i,q] of quiz.questions.entries()) for (const value of ["A","B","C","D","skip"]) {
      const result = complete(attempt({ [q.id]: value })), correct = value === q.correctOptionId ? 1 : 0, wrong = value !== "skip" && !correct ? 1 : 0;
      expect(result.overall).toEqual({correct,wrong,unanswered:30-correct-wrong,total:30});
      expect(result.parts[Math.floor(i/6)]).toMatchObject({correct,wrong,unanswered:6-correct-wrong,total:6});
      expect(result.items[i].selectedOptionId).toBe(value === "skip" ? null : value);
    }
    expect(complete(attempt()).overall).toEqual({correct:0,wrong:0,unanswered:30,total:30});
    expect(complete(attempt(Object.fromEntries(quiz.questions.map(q => [q.id,"skip"])))).overall.unanswered).toBe(30);
    for (let count=0;count<=30;count++) { const answers=Object.fromEntries(quiz.questions.map((q,i) => [q.id,i<count?q.correctOptionId!:q.options.find(o=>o.id!==q.correctOptionId)!.id])); expect(complete(attempt(answers)).overall).toEqual({correct:count,wrong:30-count,unanswered:0,total:30}); }
    expect(Object.keys(complete(attempt()).overall)).toEqual(["correct","wrong","unanswered","total"]);
  });
  it("enforces deadline endpoints, clock drift and no paused elapsed time", () => {
    const start={wall:1000000,monotonic:2000};
    expect(readTechnical30Clock(start,{wall:1000000,monotonic:2000},180)).toEqual({status:"running",elapsedMs:0,remainingSeconds:180});
    expect(readTechnical30Clock(start,{wall:1179999,monotonic:181999},180)).toEqual({status:"running",elapsedMs:179999,remainingSeconds:1});
    expect(readTechnical30Clock(start,{wall:1180000,monotonic:182000},180)).toEqual({status:"expired",elapsedMs:180000,remainingSeconds:0});
    expect(readTechnical30Clock(start,{wall:1300000,monotonic:302000},240)).toEqual({status:"expired",elapsedMs:300000,remainingSeconds:0});
    for(const current of [{wall:1001601,monotonic:2000},{wall:999999,monotonic:2000},{wall:1000000,monotonic:1999},{wall:NaN,monotonic:2000},{wall:1000000,monotonic:Infinity}]) expect(readTechnical30Clock(start,current,240).status).toBe("invalid");
    expect(readTechnical30Clock(start,start,0).status).toBe("invalid");
    const timed={mode:"timed",answers:{},sections:sections().map((s,i)=>({...s,reason:"expired",elapsedMs:TECHNICAL30_LIMITS[i]*1000+42}))};
    expect(complete(timed).overall).toEqual({correct:0,wrong:0,unanswered:30,total:30});
    timed.sections[0].elapsedMs=179999;expect(scoreTechnical30(quiz,timed).status).toBe("invalid");
  });
  it("rejects malformed snapshots, incomplete sections and edition drift with no generic score or draft", () => {
    for(const input of [null,[],{}, { ...attempt(), mode:"other" }, {...attempt(),mode:{toString:()=>"study"}}, {...attempt(),extra:1}, {...attempt(),answers:{extra:"A"}}, {...attempt(),answers:{TECH_1_01:undefined}}, {...attempt(),answers:{TECH_1_01:"E"}}, {...attempt(),answers:{TECH_1_01:null}}, {...attempt(),answers:{TECH_1_01:Object.create(null)}}, {...attempt(),sections:sections().map(s=>({...s,reason:Object.create(null)}))}, {...attempt(),answers:[]}, {...attempt(),answers:{[Symbol("private")]:"A"}}, {...attempt(),sections:[...sections(),sections()[0]]}, {...attempt(),sections:[...sections()].reverse()}, {...attempt(),sections:sections().map(s=>({...s,reason:"expired"}))}, {...attempt(),sections:sections().map(s=>({...s,elapsedMs:1}))}]) expect(scoreTechnical30(quiz,input).status).toBe("invalid");
    for(let n=0;n<5;n++) expect(scoreTechnical30(quiz,{...attempt(),sections:sections().slice(0,n)}).status).toBe("incomplete");
    const mutations: ((q:Technical30Questionnaire)=>void)[]=[q=>{q.questions[0].prompt.en+=".";},q=>{q.questions[0].prompt.zh="中文题干";},q=>{q.questions[0].correctOptionId="A";},q=>{q.questions[0].options[0].label.en="altered";},q=>{q.questions[0].reverse=true;},q=>{q.technical30.sections[0].limitSeconds=200;},q=>{q.profiles[0].sections[0].paragraphs.pop();},q=>{q.source.itemBankSha256="0".repeat(64);},q=>{q.references!.pop();}];
    for(const mutate of mutations){const copy=structuredClone(quiz);mutate(copy);expect(isTechnical30ConfigurationValid(copy)).toBe(false);expect(scoreTechnical30(copy,attempt()).status).toBe("unavailable");}
    expect(scoreQuestionnaire(quiz,allCorrect())).toEqual({status:"unavailable",answered:0}); expect(readQuestionnaireDraft(quiz,JSON.stringify({version:quiz.version,savedAt:Date.now(),answers:allCorrect()}))).toBeNull();
  });
  it("requires private action consent and disables ordinary analytics for this route and guides", () => {
    expect(entertainmentActivityCatalog.find(x=>x.slug===quiz.slug)?.privacy).toBe("explicit_opt_in");
    for(const lang of ["en","zh"]) for(const tail of ["","/results/electronics"]) expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${lang}/tests/explore/${quiz.slug}${tail}?score=9`)).toBe(true);
    expect(isAnalyticsDisabledQuestionnaireUrl(`/en/tests/explore/${quiz.slug}-other`)).toBe(false);
  });
  it("renders bilingual SSR content and full guides with canonical, hreflang, directory and sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");
    try{
      const entry=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),maps=appendFunSitemapEntries([]);
      for(const locale of ["en","zh"] as const){
        const base=`/${locale}/tests/explore/${quiz.slug}`,props={params:Promise.resolve({locale,slug:quiz.slug})},dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));
        expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]); expect(dom.textContent).toContain(quiz.technical30.attribution[locale]);
        for(const s of quiz.guide)for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);for(const f of quiz.faq)expect(dom.textContent).toContain(f.answer[locale]);
        const meta=await entry.generateMetadata(props);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);
        expect(dom.querySelector(`a[href="/${locale}/tests/holland-career-interest-test-riasec"]`)).not.toBeNull();expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${base}"`);
        for(const p of quiz.profiles){const props={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})},path=`${base}/results/${p.id}`;dom.innerHTML=renderToStaticMarkup(await guide.default(props));expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);const meta=await guide.generateMetadata(props);expect(meta.title).toBe(p.seo?.title[locale]);expect(meta.description).toBe(p.seo?.description[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);expect(meta.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}`});expect(maps.filter(x=>x.loc===`https://fermatmind.com${path}`)).toHaveLength(1);expect(dom.querySelector("[data-technical30-result]")).toBeNull();if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
        expect(maps.filter(x=>x.loc===`https://fermatmind.com${base}`)).toHaveLength(1);
      }
      await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile:"unknown"})})).rejects.toThrow();
    }finally{vi.unstubAllEnvs();}
  });
});
