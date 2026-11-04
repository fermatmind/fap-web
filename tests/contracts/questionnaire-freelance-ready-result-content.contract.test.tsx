import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { prepareResultProfile, prepareQuestionnaireResultReadings } from "@/lib/questionnaires/result-content/readings";
import { isPreparationActions20ConfigurationValid, scorePreparationActions20Questionnaire, preparationActions20GuideLinks, type PreparationActions20Questionnaire } from "@/lib/questionnaires/preparationActions20";
import { QuestionnairePreparationActions20Report } from "@/components/questionnaires/QuestionnairePreparationActions20Report";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/freelance-ready.json","utf8")) as PreparationActions20Questionnaire;
const prepared=prepareQuestionnaireResultReadings(quiz);
const base=()=>Object.fromEntries(quiz.questions.map(q=>[q.id,"2"]));
const dom=(html:string)=>{const d=document.createElement("div");d.innerHTML=html;return d;};
function complete(answers:Record<string,string>){const r=scorePreparationActions20Questionnaire(prepared,answers);expect(r).toEqual(scorePreparationActions20Questionnaire(quiz,answers));if(r.status!=="complete")throw Error(r.status);return r;}

describe("five freelance action readings without an employment or business verdict",()=>{
 it("preserves source identity, immutable original paragraphs and strict admission while preparing nine-paragraph guides",()=>{
  const before=JSON.stringify(quiz);expect(isPreparationActions20ConfigurationValid(prepared)).toBe(true);
  for(const [i,p]of prepared.profiles.entries()){
   expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect({...p,sections:quiz.profiles[i].sections,resultReading:undefined}).toEqual({...quiz.profiles[i],resultReading:undefined});
   expect(p.sections.flatMap(s=>s.paragraphs)).toHaveLength(9);for(const [j,s]of p.sections.entries())expect(s.paragraphs[0]).toEqual(quiz.profiles[i].sections[j].paragraphs[0]);
  }
  for(const q of quiz.questions){const a=base();delete a[q.id];expect(scorePreparationActions20Questionnaire(prepared,a)).toEqual({status:"incomplete",answered:19});}
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"__proto__"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it.each(["zh","en"]as const)("publishes every complete %s public guide with collapsed usable anchors and no private rows",async locale=>{
  const {default:Guide}=await import("@/components/questionnaires/QuestionnaireGuide");
  for(const p of prepared.profiles){
   const d=dom(renderToStaticMarkup(await Guide({params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})})));
   const reader=d.querySelector(`[data-freelance-preparation-result-reading="${p.id}"]`)!;expect(reader).not.toBeNull();expect(reader.querySelectorAll("h2")).toHaveLength(6);expect(reader.querySelectorAll("section > div > p")).toHaveLength(9);expect(reader.querySelectorAll("details:not([open]) nav a")).toHaveLength(6);
   for(const a of reader.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();for(const s of p.sections)for(const para of s.paragraphs)expect(reader.textContent).toContain(para[locale]);expect(d.querySelector("input,textarea,[data-preparation-action-row],[data-preparation-actions-mean]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);
  }
 });
 it("renders all 65 marginal sum witnesses, all 32 joint missing-domain patterns and zero without ranking or filling",()=>{
  for(let g=0;g<5;g++)for(let sum=0;sum<=12;sum++){
   const a=base();let rest=sum;for(let j=0;j<4;j++){const n=Math.min(3,rest);rest-=n;a[quiz.questions[g*4+j].id]=String(n);}
   const r=complete(a),d=dom(renderToStaticMarkup(<QuestionnairePreparationActions20Report quiz={prepared} result={r} locale="en"/>));
   expect(d.querySelector(`[data-preparation-actions-part="${quiz.directions[g].id}"] [data-preparation-actions-mean]`)?.textContent).toBe(`Sum ${sum} / 12; mean ${(Math.round(sum/4*10)/10).toFixed(1)} / 3 (4/4 actions rated)`);expect(d.querySelectorAll("[data-freelance-preparation-result-reading]")).toHaveLength(5);expect(d.querySelectorAll("[data-preparation-action-row]")).toHaveLength(20);
  }
  for(let mask=0;mask<32;mask++){
   const a=base();for(let g=0;g<5;g++)if(mask&(1<<g))a[quiz.questions[g*4].id]="na";const r=complete(a),d=dom(renderToStaticMarkup(<QuestionnairePreparationActions20Report quiz={prepared} result={r} locale="en"/>));
   for(const [g,p]of r.preparationActions20.domains.entries())expect(p.mean).toBe(mask&(1<<g)?null:2);expect(d.querySelectorAll("[data-freelance-preparation-result-reading]")).toHaveLength(5);
  }
 });
 it("keeps all non-rating guides, row distinctions, public-only copying and corruption refusal",()=>{
  for(const locale of ["zh","en"]as const){
   const r=complete(Object.fromEntries(quiz.questions.map(q=>[q.id,"na"]))),d=dom(renderToStaticMarkup(<QuestionnairePreparationActions20Report quiz={prepared} result={r} locale={locale}/>));expect(d.querySelectorAll("[data-freelance-preparation-result-reading]")).toHaveLength(5);expect(d.querySelectorAll("[data-preparation-action-row]")).toHaveLength(20);for(const p of prepared.profiles)for(const s of p.sections)for(const para of s.paragraphs)expect(d.textContent).toContain(para[locale]);
   expect(preparationActions20GuideLinks(prepared,locale)).toBe(quiz.profiles.map(p=>`${p.title[locale]}\nhttps://fermatmind.com/${locale}/tests/explore/${quiz.slug}/results/${p.id}`).join("\n\n"));const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  }
  const r=complete(base());r.preparationActions20.domains[0].sum=99;expect(renderToStaticMarkup(<QuestionnairePreparationActions20Report quiz={prepared} result={r} locale="en"/>)).toContain('role="alert"');
 });
});
