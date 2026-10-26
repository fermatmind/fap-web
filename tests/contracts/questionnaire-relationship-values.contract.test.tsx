import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { filterTrackingPayload } from "@/lib/tracking/events";
import { toSeoAttributionIngestEnvelope } from "@/app/api/track/route";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isDirectionalConfigurationValid, readQuestionnaireDraft, scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { MoreTests } from "@/components/entertainment/MoreTests";
import catalog from "@/lib/questionnaires/catalog.json";
const tracking = vi.hoisted(() => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/analytics", () => tracking);
afterEach(() => { cleanup(); sessionStorage.clear(); tracking.trackEvent.mockClear(); });
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz=JSON.parse(readFileSync("lib/questionnaires/data/relationship-values.json","utf8"))as Questionnaire;
const fixtureBytes=readFileSync("tests/fixtures/questionnaires/relationship-values-reference.json");
type Profile=Record<string,unknown>&{profile_code:string;top_direction_codes:string[]};
type Reference={questions:Questionnaire["questions"];profiles:Questionnaire["profiles"];source_scorer_sha256:string;source_item_bank:{test_id:string;form_code:string;item_bank_version:string;items:{question_id:string;instruction_zh:string;options:{code:string;text:string;direction_code:string}[]}[]};source_scoring_spec:{scoring_version:string;status:string;directions:{direction_code:string}[]};source_result_content:{profiles:Profile[]};source_count_vectors:{option_codes:string;counts:number[]}[];profile_mapping:{source_code:string;native_id:string;source_direction_codes:string[];native_direction_ids:string[]}[];legacy_questions:{id:string;prompt:Questionnaire["questions"][number]["prompt"];options:{id:string;label:Questionnaire["questions"][number]["prompt"];points:Record<string,number>}[]}[];legacy_public_ids:string[];legacy_version:string};
const ref=JSON.parse(fixtureBytes.toString())as Reference;
type SourceResult={score_availability:string;directions:Record<string,{wins:number}>;ranking:{top_direction_codes:string[]}};
const originalModule=createRequire(import.meta.url)("../fixtures/questionnaires/multidirection-scorer.cjs")as{create:(config:object)=>{scoreSubmission:(submission:object,bank:object,spec:object)=>SourceResult}};
const sourceIds=ref.source_scoring_spec.directions.map(d=>d.direction_code),nativeIds=quiz.directions.map(d=>d.id);
const sourceScorer=originalModule.create({testId:"LOVE_ROLE",directionCodes:sourceIds,questionCount:24,pairOccurrences:4,scheduledComparisons:12,status:ref.source_scoring_spec.status});
const chinese=(v:unknown):string[]=>typeof v==="string"?(/\p{Script=Han}/u.test(v)?[v]:[]):Array.isArray(v)?v.flatMap(chinese):v&&typeof v==="object"?Object.values(v).flatMap(chinese):[];
describe("complete original mini-program relationship values at the existing canonical entry",()=>{
 it("preserves all24bilingual legacy items, original Chinese source, balanced comparisons and all15complete source assets",()=>{
  expect(quiz.code).toBe("LOVE_ROLE");expect(quiz.version).toBe("2.0.0");expect(quiz.source.formCode).toBe("love_role_forced_choice_24");expect(isDirectionalConfigurationValid(quiz)).toBe(true);expect(quiz.questions).toHaveLength(24);expect(quiz.profiles).toHaveLength(15);
  expect(quiz.questions).toEqual(ref.questions);expect(quiz.profiles).toEqual(ref.profiles);expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(fixtureBytes).digest("hex"));expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(JSON.stringify(quiz.profiles)).digest("hex"));expect(ref.source_scorer_sha256).toBe(createHash("sha256").update(readFileSync("tests/fixtures/questionnaires/multidirection-scorer.cjs")).digest("hex"));
  const exposure=Object.fromEntries(nativeIds.map(id=>[id,{total:0,o1:0,o2:0}])),pairs=new Map<string,number>();
  for(const[i,q]of quiz.questions.entries()){
   const old=ref.legacy_questions[i],original=ref.source_item_bank.items[i];expect(q.id).toBe(old.id);expect(q.prompt).toEqual(old.prompt);expect(q.prompt.zh).toBe(original.instruction_zh);
   for(const[j,o]of q.options.entries()){expect(o.id).toBe(old.options[j].id);expect(o.label).toEqual(old.options[j].label);expect(o.directionId).toBe(Object.keys(old.options[j].points)[0]);expect(o.label.zh).toBe(original.options[j].text);expect(o.directionId).toBe(original.options[j].direction_code.toLowerCase());expect(o.score).toBeUndefined();exposure[o.directionId].total++;exposure[o.directionId][o.id as"o1"|"o2"]++;}
   const key=q.options.map(o=>o.directionId).sort().join("|");pairs.set(key,(pairs.get(key)??0)+1);
  }
  expect([...pairs.values()]).toEqual(Array(6).fill(4));for(const v of Object.values(exposure))expect(v).toEqual({total:12,o1:6,o2:6});expect(new Set(quiz.questions.map(q=>q.options.map(o=>o.label.en).join("|"))).size).toBe(24);
  expect(quiz.profiles.slice(0,4).map(p=>p.id)).toEqual(ref.legacy_public_ids);
  for(const[i,p]of quiz.profiles.entries()){
   const original=ref.source_result_content.profiles[i];expect(p.directionIds).toEqual(original.top_direction_codes.map(d=>d.toLowerCase()));expect(ref.profile_mapping[i]).toMatchObject({source_code:original.profile_code,native_id:p.id});
   for(const[field,v]of Object.entries(original)){if(["profile_code","top_direction_codes","display_name","content_status"].includes(field))continue;for(const text of chinese(v))expect(JSON.stringify(p),`${p.id}:${field}`).toContain(text);}
   expect(p.sections).toHaveLength(7);for(const id of["scene","counterexample","private-exercise"])expect(p.sections.some(s=>s.id===id)).toBe(true);
   expect(p.seo!.title.en.length).toBeLessThanOrEqual(60);expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);
  }
  expect(quiz.source.psychometricValidationCompleted).toBe(false);
 });
 it("conforms to the actual original scorer on all1289reachable count vectors, including every full single and joint result",()=>{
  const reached=new Set<string>(),seen=new Set<string>();expect(ref.source_count_vectors).toHaveLength(1289);
  for(const w of ref.source_count_vectors){
   const sourceAnswers=Object.fromEntries(ref.source_item_bank.items.map((q,i)=>[q.question_id,w.option_codes[i]]));
   const actual=sourceScorer.scoreSubmission({submission_id:"synthetic-love-role-conformance",test_id:"LOVE_ROLE",item_bank_version:ref.source_item_bank.item_bank_version,scoring_version:ref.source_scoring_spec.scoring_version,answers:sourceAnswers},ref.source_item_bank,ref.source_scoring_spec);
   assert.equal(actual.score_availability,"complete");assert.deepStrictEqual(sourceIds.map(id=>actual.directions[id].wins),w.counts);
   const top=new Set(actual.ranking.top_direction_codes.map(d=>d.toLowerCase())),leaders=nativeIds.filter(id=>top.has(id));const profile=quiz.profiles.find(p=>p.directionIds.slice().sort().join("|")===leaders.slice().sort().join("|"));assert.ok(profile);
   const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,w.option_codes[i]==="A"?"o1":"o2"]));assert.deepStrictEqual(scoreDirectionalQuestionnaire(quiz,answers),{status:"complete",answered:24,counts:Object.fromEntries(nativeIds.map((id,i)=>[id,w.counts[i]])),leaders,profileId:profile.id});seen.add(w.counts.join(","));reached.add(profile.id);
  }
  expect(seen.size).toBe(1289);expect([...reached].sort()).toEqual(quiz.profiles.map(p=>p.id).sort());console.info("RelationshipValues:1289sourcecountvectors/all15leading sets, not2^24attempt execution or psychometric validation.");
 });
 it("keeps partial, invalid and unavailable states distinct, rejects old drafts and closes source/internal identifiers",async()=>{
  const first=quiz.questions[0],partial={[first.id]:"o1"};expect(scoreDirectionalQuestionnaire(quiz,partial)).toEqual({status:"incomplete",answered:1});for(const v of[null,[],new Date(),{unknown:"o1"},{[first.id]:"A"},{[first.id]:1},Object.create(partial)])expect(scoreDirectionalQuestionnaire(quiz,v).status).toBe("invalid");
  const bad=structuredClone(quiz);bad.directions[0].comparisons=13;expect(scoreDirectionalQuestionnaire(bad,{})).toEqual({status:"unavailable",answered:0});const saved={version:quiz.version,savedAt:100000,answers:partial};expect(readQuestionnaireDraft(quiz,JSON.stringify(saved),100001)).toEqual(partial);for(const raw of["broken JSON",JSON.stringify({...saved,version:ref.legacy_version}),JSON.stringify({...saved,savedAt:100002}),JSON.stringify({...saved,savedAt:100000-86400000})])expect(readQuestionnaireDraft(quiz,raw,100001)).toBeNull();
  expect(await loadQuestionnaire(quiz.slug)).toEqual(quiz);for(const locale of["en","zh"]as const){expect(questionnairePath(locale,quiz.slug)).toBe(`/${locale}/tests/play/relationship-values`);for(const id of["romantic_expression","SINGLE_ROMANTIC_EXPRESSION","unknown"])expect(isMissingFunRoute(questionnaireGuidePath(locale,quiz.slug,id))).toBe(true);}
 });
 it("contains complete independent bilingual units and specific searchable metadata for every result",()=>{
  const walk=(v:unknown):void=>{if(!v||typeof v!=="object")return;const o=v as Record<string,unknown>;if("en"in o||"zh"in o){expect(String(o.en).trim()).not.toBe("");expect(String(o.en)).not.toMatch(/\p{Script=Han}|\bTODO\b|placeholder|lorem ipsum/u);expect(String(o.zh)).toMatch(/\p{Script=Han}/u);}else Object.values(o).forEach(walk);};walk(quiz);
  for(const locale of["en","zh"]as const){expect(new Set(quiz.profiles.map(p=>p.seo!.title[locale])).size).toBe(15);expect(new Set(quiz.profiles.map(p=>p.seo!.description[locale])).size).toBe(15);expect(new Set(quiz.profiles.map(p=>p.sections.find(s=>s.id==="scene")!.paragraphs[0][locale])).size).toBe(15);}
  const entry=catalog.find(q=>q.slug===quiz.slug)!;expect(entry.collection).toBe("play");expect(entry.resultSlugs).toEqual(quiz.profiles.map(p=>p.id));expect(entry.formCode).toBe(quiz.source.formCode);
  expect(quiz.guide.filter(s=>["raw-wins-explanation","ties-explanation","low-direction-explanation"].includes(s.id))).toHaveLength(3);
 });
 it.each(["en", "zh"] as const)("preserves the existing play analytics identity and once-only completion after a full %s attempt", locale => {
  const prior = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  try {
   const zh = locale === "zh";render(<StrictMode><QuestionnaireClient quiz={quiz} locale={locale}/></StrictMode>);
   expect(document.getElementById("play")).not.toBeNull();expect(tracking.trackEvent.mock.calls.filter(([event])=>event==="landing_view")).toHaveLength(1);
   fireEvent.click(screen.getByRole("button",{name:zh?"开始测试":"Start test"}));
   expect(tracking.trackEvent.mock.calls.some(([event])=>event==="complete_test"||event==="view_result")).toBe(false);
   for(const[i]of quiz.questions.entries()){fireEvent.click(screen.getAllByRole("radio")[0]);fireEvent.click(screen.getByRole("button",{name:i===23?(zh?"查看完整结果":"See full result"):(zh?"下一题":"Next")}));}
   for(const event of["landing_view","start_test","complete_test","view_result"])expect(tracking.trackEvent.mock.calls.filter(([name])=>name===event)).toHaveLength(1);
   for(const[event,payload]of tracking.trackEvent.mock.calls){
    expect(payload).toMatchObject({slug:"relationship-values",locale,entry_surface:"entertainment",scale_code:"ENTERTAINMENT",form_code:"fun_relationship-values_v1"});
    const envelope=toSeoAttributionIngestEnvelope({eventName:event,anonymousId:"",path:`/${locale}/tests/play/relationship-values`,timestamp:"2026-10-27T00:00:00Z",payload:filterTrackingPayload(event,payload)});expect(envelope.payload).toMatchObject({scale_code:"ENTERTAINMENT",form_code:"fun_relationship-values_v1"});
    expect(JSON.stringify(payload)).not.toMatch(/answers|counts|q1|o1|raw|profileId|submission/i);
   }
   const onward=screen.getByRole("link",{name:zh?"了解MBTI与题本选择":"Explore MBTI and its versions"});onward.addEventListener("click",e=>e.preventDefault());fireEvent.click(onward);
   const calls=tracking.trackEvent.mock.calls.filter(([event])=>event==="article_to_test_click");expect(calls).toHaveLength(1);expect(calls[0][1]).toMatchObject({source_path:`/${locale}/tests/play/relationship-values`,cta_id:"entertainment_result_mbti",scale_code:"MBTI"});
  } finally { if(prior)Object.defineProperty(HTMLElement.prototype,"scrollIntoView",prior);else Reflect.deleteProperty(HTMLElement.prototype,"scrollIntoView"); }
 });
 it("uses actual play wrappers for both entries and all30fullguides, keeps four old URLs and avoids duplicate directory/sitemap identities",async()=>{
  vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");vi.resetModules();const entry=await import("@/app/(localized)/[locale]/tests/play/[slug]/page"),guide=await import("@/app/(localized)/[locale]/tests/play/[slug]/results/[portrait]/page"),maps=appendFunSitemapEntries([]);
  try{for(const locale of["en","zh"]as const){
   const path=questionnairePath(locale,quiz.slug),props={params:Promise.resolve({locale,slug:quiz.slug})},html=renderToStaticMarkup(await entry.default(props)),meta=await entry.generateMetadata(props),dom=document.createElement("div");dom.innerHTML=html;
   expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.description).toBe(quiz.description[locale]);expect(meta.alternates?.canonical).toBe("https://fermatmind.com"+path);expect(html).toContain(quiz.instructions![locale]);expect(html).toContain("application/ld+json");for(const id of["raw-wins-explanation","ties-explanation","low-direction-explanation"]){const s=quiz.guide.find(x=>x.id===id)!;expect([...dom.querySelectorAll("details p")].some(p=>p.textContent===s.paragraphs[0][locale])).toBe(false);expect(dom.textContent).toContain(s.paragraphs[0][locale]);}
   const directory=document.createElement("div");directory.innerHTML=renderToStaticMarkup(<MoreTests locale={locale}/>);expect(directory.querySelectorAll(`a[href="${path}"]`)).toHaveLength(1);expect(maps.filter(v=>v.loc==="https://fermatmind.com"+path)).toHaveLength(1);
   for(const p of quiz.profiles){const path=questionnaireGuidePath(locale,quiz.slug,p.id),props={params:Promise.resolve({locale,slug:quiz.slug,portrait:p.id})},rendered=renderToStaticMarkup(await guide.default(props)),meta=await guide.generateMetadata(props),dom=document.createElement("div");dom.innerHTML=rendered;expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);expect(meta.title).toBe(p.seo!.title[locale]);expect(meta.description).toBe(p.seo!.description[locale]);expect(meta.alternates?.canonical).toBe("https://fermatmind.com"+path);expect(meta.alternates?.languages).toMatchObject({en:"https://fermatmind.com"+questionnaireGuidePath("en",quiz.slug,p.id),"zh-CN":"https://fermatmind.com"+questionnaireGuidePath("zh",quiz.slug,p.id)});expect(maps.filter(v=>v.loc==="https://fermatmind.com"+path)).toHaveLength(1);expect(rendered).toContain("application/ld+json");if(locale==="en")expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);}
  }}finally{vi.unstubAllEnvs();vi.resetModules();}
 });
});
