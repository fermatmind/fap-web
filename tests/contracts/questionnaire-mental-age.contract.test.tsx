import { createHash } from "node:crypto";
import { describe,it,expect } from "vitest";
import raw from "@/lib/questionnaires/data/mental-age.json";
import old from "@/lib/questionnaires/legacy/mental-age12.json";
import {scoreMentalAgeQuestionnaire as scoreLegacy} from "@/lib/questionnaires/legacy/mentalAge12";
import type {Questionnaire} from "@/lib/questionnaires/types";
import {isMentalAgeConfigurationValid,scoreMentalAgeQuestionnaire,mentalAgeStyle,mentalAgeComparison,parseActualAge,mentalAgeExtraScreens} from "@/lib/questionnaires/mentalAge";
import {readQuestionnaireDraft,scoreQuestionnaire} from "@/lib/questionnaires/scoring";
const q=raw as Questionnaire,hash=(v:unknown)=>createHash("sha256").update(JSON.stringify(v)).digest("hex");
const answers=(sum:number)=>Object.fromEntries(q.questions.map((item,i)=>[item.id,item.options.find(o=>o.score===Math.min(2,Math.max(0,sum-i*2)))!.id]));
describe("Mental age classic30 source, age arithmetic and migration",()=>{
 it("binds the original 30 statements, 15/15 keys, complete reading and public identity",()=>{
  expect(isMentalAgeConfigurationValid(q)).toBe(true);expect(hash(q.questions)).toBe(q.source.itemBankSha256);expect(hash(q.profiles)).toBe(q.source.resultContentSha256);
  expect(q.questions).toHaveLength(30);expect(q.questions.filter(x=>x.options[0].score===2)).toHaveLength(15);expect(q.description.en.length).toBeLessThanOrEqual(160);
  expect(mentalAgeExtraScreens.map(s=>s.id)).toEqual(["gender","experience","astrology"]);
 });
 it("reaches every integer 10..70; agreeing or disagreeing throughout gives40",()=>{
  for(let sum=0;sum<=60;sum++){const r=scoreQuestionnaire(q,answers(sum));expect(r).toMatchObject({status:"complete",answered:30,mentalAge:{sum,playfulAge:sum+10}});expect(mentalAgeStyle(sum+10)).toBeDefined();}
  for(const id of ["agree","neither","disagree"])expect(scoreMentalAgeQuestionnaire(q,Object.fromEntries(q.questions.map(x=>[x.id,id])))).toMatchObject({mentalAge:{sum:30,playfulAge:40}});
 });
 it("rejects incomplete, foreign, unscored, accessor and drifted data",()=>{
  const a=answers(30);for(let n=0;n<30;n++)expect(scoreMentalAgeQuestionnaire(q,Object.fromEntries(Object.entries(a).slice(0,n)))).toEqual({status:"incomplete",answered:n});
  for(const bad of [null,[],Object.create(a),{...a,gender:"0"},{...a,MAC_01:"skip"},{...a,MAC_01:1},{...a,[Symbol("x")]:"agree"},Object.defineProperty({...a},"MAC_01",{get(){throw Error("getter must not run");}})])expect(scoreMentalAgeQuestionnaire(q,bad).status).toBe("invalid");
  for(const mutate of [(x:Questionnaire)=>{x.questions[0].options[0].score=2;},(x:Questionnaire)=>{delete x.questions[1];},(x:Questionnaire)=>{x.source.scoringVersion="old";},(x:Questionnaire)=>{x.profiles[0].sections.pop();}]){const x=structuredClone(q);mutate(x);expect(scoreMentalAgeQuestionnaire(x,{}).status).toBe("unavailable");}
 });
 it("handles every supported real age without changing scored age, including missing and out-of-range",()=>{
  expect(parseActualAge("")).toBeNull();expect(parseActualAge(" 35 ")).toBe(35);for(let n=1;n<=125;n++){expect(parseActualAge(String(n))).toBe(n);expect(mentalAgeComparison(40,n,2026)).toEqual({gap:40-n,equivalentYear:1986});}
  for(const n of ["0","126","-1","1.5","NaN","Infinity","1e2"])expect(parseActualAge(n)).toBeUndefined();expect(mentalAgeComparison(40,null,2026)).toEqual({gap:null,equivalentYear:1986});
  expect(mentalAgeComparison(10,125,2026)).toEqual({gap:-115,equivalentYear:2016});expect(mentalAgeComparison(70,1,2026)).toEqual({gap:69,equivalentYear:1956});
  expect(mentalAgeComparison(40,0,2026)).toBeNull();expect(mentalAgeStyle(9)).toBeUndefined();expect(mentalAgeStyle(71)).toBeUndefined();
 });
 it("isolates the twelve-item edition and rejects its drafts instead of padding answers",()=>{
  expect(isMentalAgeConfigurationValid(old)).toBe(false);expect(scoreMentalAgeQuestionnaire(old,{}).status).toBe("unavailable");
  const legacyAnswers=Object.fromEntries(old.questions.map(x=>[x.id,x.options[0].id]));expect(scoreLegacy(old,legacyAnswers).status).toBe("complete");
  const now=1800000000000;expect(readQuestionnaireDraft(q,"invalid-json",now)).toBeNull();expect(readQuestionnaireDraft(q,JSON.stringify({version:old.version,savedAt:now,answers:legacyAnswers}),now)).toBeNull();
  expect(readQuestionnaireDraft(q,JSON.stringify({version:q.version,savedAt:now,answers:{MAGE_01:"a"}}),now)).toBeNull();
 });
});
