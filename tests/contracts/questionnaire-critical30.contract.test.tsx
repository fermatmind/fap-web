import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CRITICAL30_LIMIT, CRITICAL30_SECTIONS, isCritical30ConfigurationValid, readCritical30Clock, scoreCritical30, type Critical30Questionnaire } from "@/lib/questionnaires/critical30";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";
import { isAnalyticsDisabledQuestionnaireUrl } from "@/lib/tracking/privacy";
import { MoreTests } from "@/components/entertainment/MoreTests";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/watson-glaser-practice-test.json", "utf8")) as Critical30Questionnaire;
const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, sorted(x)])) : v;
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(sorted(v))).digest("hex");
const attempt = (answers: Record<string, string> = {}) => ({ mode: "study", answers, closure: { reason: "finished", elapsedMs: 0 } });
function complete(x: unknown) { const r = scoreCritical30(quiz, x); if (r.status !== "complete") throw Error("Complete practice rejected"); return r.result; }
describe("original five-rule critical thinking with one continuous clock", () => {
  it("binds thirty English tasks, distinct response sets and five substantive bilingual public guides", () => {
    expect(isCritical30ConfigurationValid(quiz)).toBe(true);expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(hash(quiz.questions)).toBe(quiz.source.itemBankSha256);expect(hash(quiz.profiles)).toBe(quiz.source.resultContentSha256);
    expect(quiz.questions.map(q=>q.options.length)).toEqual([...Array(6).fill(5),...Array(24).fill(2)]);
    expect(quiz.critical30.limitSeconds).toBe(CRITICAL30_LIMIT);expect(CRITICAL30_LIMIT).toBe(1800);expect(quiz.critical30.sections.map(s=>s.id)).toEqual(CRITICAL30_SECTIONS);
    for(const q of quiz.questions){expect(q.prompt.en).toBe(q.prompt.zh);expect(q.prompt.en).not.toMatch(/\p{Script=Han}/u);expect(q.options.every(o=>o.label.en===o.label.zh)).toBe(true);expect(q.explanation?.zh).toMatch(/\p{Script=Han}/u);}
    for(const p of quiz.profiles){expect(p.sections).toHaveLength(7);expect(p.sections.every(s=>s.paragraphs.length===2)).toBe(true);expect(p.sections.flatMap(s=>s.paragraphs).map(p=>p.en).join(" ").split(/\s+/).length).toBeGreaterThan(700);for(const s of p.sections)for(const t of s.paragraphs){expect(t.en).not.toMatch(/\p{Script=Han}|TODO|lorem ipsum/iu);expect(t.zh).toMatch(/\p{Script=Han}/u);}}
    expect(quiz.source.psychometricValidationCompleted).toBe(false);expect(quiz.critical30.editionNotice.en).toContain("Not validated");expect(readFileSync("public/fonts/noto-sans-sc/watson-glaser-practice-test-700.ttf").byteLength).toBeLessThan(300000);
    for(const field of ["questions","directions","profiles","guide","faq","references"] as const){const q=structuredClone(quiz);delete q[field]![0];expect(isCritical30ConfigurationValid(q)).toBe(false);}
    for(const mutate of [(q:Critical30Questionnaire)=>{delete q.questions[0].options[1];},(q:Critical30Questionnaire)=>{q.questions[0].correctOptionId="B";},(q:Critical30Questionnaire)=>{q.questions[7].prompt.en+=".";},(q:Critical30Questionnaire)=>{q.critical30.limitSeconds=1801 as 1800;},(q:Critical30Questionnaire)=>{q.source.resultContentSha256="0".repeat(64);}]){const q=structuredClone(quiz);mutate(q);expect(isCritical30ConfigurationValid(q)).toBe(false);}
  });
  it("checks likelihood classifications and logical keys with separate witnesses", () => {
    const key=(i:number)=>quiz.questions[i].correctOptionId;
    const category=(p:number|null)=>p===null?"C":p===1?"A":p===0?"E":p>.5?"B":"D";
    expect(quiz.questions.slice(0,6).map(q=>q.correctOptionId)).toEqual([1,7/10,null,2/10,0,.8].map(category));
    // Denial witnesses for assumptions: inaccessible sole route; no usable paper; unavailable required attendee.
    expect(quiz.questions.slice(6,12).map(q=>q.correctOptionId)).toEqual(["A","B","A","B","A","B"]);
    // Enumerate finite boolean models; the universal/existential premise supplies one real instance.
    expect(key(12)).toBe("A");
    const values=[false,true],models=values.flatMap(p=>values.map(q=>({p,q}))),necessary=(premise:(m:{p:boolean;q:boolean})=>boolean,conclusion:(m:{p:boolean;q:boolean})=>boolean)=>models.filter(premise).every(conclusion);
    expect(key(13)).toBe(necessary(m=>!m.p||m.q,m=>!m.q||m.p)?"A":"B");
    expect(key(14)).toBe(necessary(m=>(!m.p||m.q)&&m.p,m=>m.q)?"A":"B");
    expect(key(15)).toBe(necessary(m=>(!m.p||m.q)&&m.q,m=>m.p)?"A":"B");
    expect(key(16)).toBe(necessary(m=>!(m.p&&m.q)&&m.q,m=>!m.p)?"A":"B");expect(key(17)).toBe("B");
    // Interpretation: preserve recorded instances, population and time; do not isolate a confounded cause.
    expect(quiz.questions.slice(18,24).map(q=>q.correctOptionId)).toEqual(["A","B","A","B","A","B"]);expect(23>18).toBe(true);
    // Arguments: material goal effects versus booklet typeface, sign border and capitalisation.
    expect(quiz.questions.slice(24).map(q=>q.correctOptionId)).toEqual(["A","B","A","B","A","B"]);
  });
  it("counts all offered options and blanks without diagnosing a level or guessing", () => {
    for(const [i,q]of quiz.questions.entries())for(const value of [...q.options.map(o=>o.id),"skip"]){const r=complete(attempt({[q.id]:value})),correct=value===q.correctOptionId?1:0,wrong=value!=="skip"&&!correct?1:0;expect(r.overall).toEqual({correct,wrong,unanswered:30-correct-wrong,total:30});expect(r.parts[Math.floor(i/6)]).toMatchObject({correct,wrong,unanswered:6-correct-wrong,total:6});expect(r.items[i].selectedOptionId).toBe(value==="skip"?null:value);}
    for(let n=0;n<=30;n++){const a=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i<n?q.correctOptionId!:q.options.find(o=>o.id!==q.correctOptionId)!.id]));expect(complete(attempt(a)).overall).toEqual({correct:n,wrong:30-n,unanswered:0,total:30});}
    expect(complete(attempt()).overall).toEqual({correct:0,wrong:0,unanswered:30,total:30});expect(Object.keys(complete(attempt()).overall)).toEqual(["correct","wrong","unanswered","total"]);
    for(const q of quiz.questions.slice(6))expect(scoreCritical30(quiz,attempt({[q.id]:"C"})).status).toBe("invalid");
    expect(scoreQuestionnaire(quiz,{})).toEqual({status:"unavailable",answered:0});expect(readQuestionnaireDraft(quiz,JSON.stringify({version:quiz.version,savedAt:Date.now(),answers:{}}))).toBeNull();
  });
  it("requires one valid whole-attempt closure and enforces global deadline endpoints", () => {
    const start={wall:1000000,monotonic:2000};expect(readCritical30Clock(start,start,CRITICAL30_LIMIT)).toEqual({status:"running",elapsedMs:0,remainingSeconds:1800});expect(readCritical30Clock(start,{wall:2799999,monotonic:1801999},CRITICAL30_LIMIT)).toEqual({status:"running",elapsedMs:1799999,remainingSeconds:1});expect(readCritical30Clock(start,{wall:2800000,monotonic:1802000},CRITICAL30_LIMIT)).toEqual({status:"expired",elapsedMs:1800000,remainingSeconds:0});expect(readCritical30Clock(start,{wall:1001601,monotonic:2000},CRITICAL30_LIMIT).status).toBe("invalid");
    expect(scoreCritical30(quiz,{mode:"timed",answers:{}}).status).toBe("incomplete");expect(complete({mode:"timed",answers:{},closure:{reason:"expired",elapsedMs:1800000}}).overall.unanswered).toBe(30);
    for(const x of [null,[],{}, {...attempt(),extra:1},{...attempt(),mode:"other"},{...attempt(),answers:{CRIT_1_01:undefined}},{...attempt(),answers:{CRIT_1_01:"Z"}},{...attempt(),answers:{CRIT_1_01:null}},{...attempt(),answers:{[Symbol("private")]:"A"}},{...attempt(),closure:null},{...attempt(),closure:{reason:"expired",elapsedMs:1800000}},{...attempt(),closure:{reason:"finished",elapsedMs:1}},{...attempt(),mode:"timed",closure:{reason:"finished",elapsedMs:1800000}},{...attempt(),mode:"timed",closure:{reason:"expired",elapsedMs:1799999}},{...attempt(),closure:{reason:"finished",elapsedMs:NaN}},{...attempt(),closure:{reason:"finished",elapsedMs:0,sections:[]}}])expect(scoreCritical30(quiz,x).status).toBe("invalid");
  });
  it("renders all bilingual public bodies and stable SEO without private result URLs or ordinary analytics", async () => {
    expect(entertainmentActivityCatalog.find(x=>x.slug===quiz.slug)?.privacy).toBe("explicit_opt_in");for(const locale of ["en","zh"])for(const tail of ["","/results/inference"])expect(isAnalyticsDisabledQuestionnaireUrl(`https://fermatmind.com/${locale}/tests/explore/${quiz.slug}${tail}?answers=private`)).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");
    try{const entry=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),maps=appendFunSitemapEntries([]);
      for(const locale of ["en","zh"]as const){const base=`/${locale}/tests/explore/${quiz.slug}`,props={params:Promise.resolve({locale,slug:quiz.slug})},dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);expect(dom.textContent).toContain(quiz.critical30.attribution[locale]);for(const s of quiz.guide)for(const p of s.paragraphs)expect(dom.textContent).toContain(p[locale]);for(const f of quiz.faq)expect(dom.textContent).toContain(f.answer[locale]);const meta=await entry.generateMetadata(props);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${base}`);expect(renderToStaticMarkup(<MoreTests locale={locale}/>)).toContain(`href="${base}"`);
        for(const p of quiz.profiles){const props={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})},path=`${base}/results/${p.id}`;dom.innerHTML=renderToStaticMarkup(await guide.default(props));expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);const meta=await guide.generateMetadata(props);expect(meta.title).toBe(p.seo?.title[locale]);expect(meta.description).toBe(p.seo?.description[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);expect(meta.alternates?.languages).toMatchObject({en:`https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${p.id}`,"zh-CN":`https://fermatmind.com/zh/tests/explore/${quiz.slug}/results/${p.id}`});expect(maps.filter(x=>x.loc===`https://fermatmind.com${path}`)).toHaveLength(1);expect(dom.querySelector("[data-critical30-result]")).toBeNull();if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
        expect(maps.filter(x=>x.loc===`https://fermatmind.com${base}`)).toHaveLength(1);
      }await expect(guide.default({params:Promise.resolve({locale:"en",slug:quiz.slug,profile:"unknown"})})).rejects.toThrow();
    }finally{vi.unstubAllEnvs();}
  });
});
