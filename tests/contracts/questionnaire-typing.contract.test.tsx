import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isTypingConfigurationValid, normalizeTypingText, scoreTypingRound, typingCharacters, type TypingRound } from "@/lib/questionnaires/typing";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/typing-speed.json", "utf8")) as Questionnaire;
const sourceBytes = readFileSync("tests/fixtures/questionnaires/typing-reference.json"), source = JSON.parse(sourceBytes.toString()) as { typing: NonNullable<Questionnaire["typing"]> };
const profileBytes = readFileSync("tests/fixtures/questionnaires/typing-profiles-reference.json");
const complete = (round: TypingRound, value: string, elapsed = 60000) => {
  const result = scoreTypingRound(round, value, elapsed);
  if (result.status !== "complete") throw Error("Valid final typing buffer rejected");
  return result;
};
describe("T147 real English/Chinese typing practice", () => {
  it("binds two original language passages and two complete guides without inventing questionnaire items", () => {
    expect(quiz.kind).toBe("typing"); expect(isTypingConfigurationValid(quiz)).toBe(true); expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);
    expect(quiz.questions).toEqual([]); expect(quiz.typing).toEqual(source.typing); expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex")); expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.typing!.durationMs).toBe(60000); expect(quiz.typing!.rounds.map(r => [r.id,r.language,r.profileId])).toEqual([["english","en","english"],["chinese","zh","chinese"]]);
    expect(quiz.typing!.rounds[0].passage).not.toMatch(/\p{Script=Han}/u);expect(quiz.typing!.rounds[1].passage).toMatch(/\p{Script=Han}/u);
    for (const profile of quiz.profiles) { expect(profile.sections).toHaveLength(7);expect(profile.sections.flatMap(s=>s.paragraphs).map(p=>p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400);expect(profile.seo!.title.en.length).toBeLessThanOrEqual(60);expect(profile.seo!.description.en.length).toBeLessThanOrEqual(160); }
    expect(quiz.source.psychometricValidationCompleted).toBe(false); expect(readFileSync("public/fonts/noto-sans-sc/typing-speed-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("checks every source prefix and every single-position substitution against independent BMP source counts", () => {
    let prefixes=0, substitutions=0;
    for(const round of quiz.typing!.rounds){
      // These two original banks contain BMP noncombining characters. Unicode clusters are checked separately below.
      const chars=Array.from(round.passage);assert.equal(chars.length,round.passage.length);assert(!/\p{Mark}|[\uD800-\uDFFF]/u.test(round.passage));
      for(let n=0;n<=chars.length;n++){
        const r=complete(round,chars.slice(0,n).join(""));
        assert.deepStrictEqual(r,{status:"complete",language:round.language,durationMs:60000,observedElapsedMs:60000,targetCharacters:chars.length,typedCharacters:n,correctCharacters:n,incorrectCharacters:0,accuracy:n?100:null,cpm:n,correctCpm:n,grossWpm:round.language==="en"?n/5:null,correctWpm:round.language==="en"?n/5:null});prefixes++;
      }
      for(let i=0;i<chars.length;i++){
        const copy=chars.slice();copy[i]=chars[i]==="~"?"X":"~";const r=complete(round,copy.join(""));
        assert.equal(r.typedCharacters,chars.length);assert.equal(r.correctCharacters,chars.length-1);assert.equal(r.incorrectCharacters,1);assert.equal(r.accuracy,(chars.length-1)/chars.length*100);assert.equal(r.grossWpm,round.language==="en"?chars.length/5:null);assert.equal(r.correctWpm,round.language==="en"?(chars.length-1)/5:null);substitutions++;
      }
    }
    expect(prefixes).toBe(2017);expect(substitutions).toBe(2015);console.info("Typing:2017source-prefixes+2015single-position substitutions,not all possible text inputs or a human speed benchmark.");
  });
  it("checks canonical graphemes, punctuation, positional shifts and both worked examples", () => {
    expect(typingCharacters("e\u0301👨‍👩‍👧‍👦。" )).toEqual(["é","👨‍👩‍👧‍👦","。"]);expect(typingCharacters("👩🏽‍💻")).toHaveLength(1);expect(normalizeTypingText("a\r\nb\rc")).toBe("a\nb\nc");
    const en={...quiz.typing!.rounds[0],passage:"cat sat"};const shifted=complete(en,"catsat");expect([shifted.correctCharacters,shifted.incorrectCharacters,shifted.accuracy,shifted.grossWpm,shifted.correctWpm]).toEqual([3,3,50,1.2,0.6]);
    const a=complete({...en,passage:"a".repeat(250)},"a".repeat(240)+"b".repeat(10));expect([a.cpm,a.correctCpm,a.grossWpm,a.correctWpm,a.accuracy]).toEqual([250,240,50,48,96]);
    const zh={...quiz.typing!.rounds[1],passage:"春".repeat(120)};const b=complete(zh,"春".repeat(114)+"夏".repeat(6));expect([b.cpm,b.correctCpm,b.accuracy,b.grossWpm,b.correctWpm]).toEqual([120,114,95,null,null]);
    expect(complete({...zh,passage:"春天。"},"春天，").accuracy).toBe(2/3*100);expect(complete({...en,passage:"café"},"cafe\u0301").correctCharacters).toBe(4);
    const empty=complete(en,"");expect([empty.cpm,empty.accuracy,empty.correctWpm]).toEqual([0,null,0]);
  });
  it("requires the real full boundary and rejects malformed or overlong submitted buffers", () => {
    const round=quiz.typing!.rounds[0];expect(scoreTypingRound(round,"On",59999.99)).toEqual({status:"incomplete"});expect(complete(round,"On",60025).durationMs).toBe(60000);
    for(const bad of [null,[],{},42])expect(scoreTypingRound(round,bad,60000)).toEqual({status:"invalid"});
    for(const bad of [null,NaN,Infinity,-1,"60000"])expect(scoreTypingRound(round,"On",bad)).toEqual({status:"invalid"});
    expect(scoreTypingRound(round,round.passage+"x",60000)).toEqual({status:"invalid"});
  });
  it("fails closed on malformed configuration, declines option scoring and never restores a draft", () => {
    for(const mutate of [(q:Questionnaire)=>{q.typing!.durationMs=30 as 60000;},(q:Questionnaire)=>{q.typing!.rounds[1].language="en";},(q:Questionnaire)=>{q.typing!.rounds[0].passage="short";},(q:Questionnaire)=>{q.typing!.rounds[0].passage+="\n";},(q:Questionnaire)=>{q.typing!.rounds[0].profileId="unknown";},(q:Questionnaire)=>{q.profiles[0].sections[0].paragraphs=[];},(q:Questionnaire)=>{q.questions=[{id:"FAKE",prompt:{en:"fake",zh:"假"},options:[]}];}]){const bad=structuredClone(quiz);mutate(bad);expect(isTypingConfigurationValid(bad)).toBe(false);}
    expect(scoreQuestionnaire(quiz,{})).toEqual({status:"unavailable",answered:0});expect(readQuestionnaireDraft(quiz,JSON.stringify({version:quiz.version,savedAt:100,answers:{}}),200)).toBeNull();
  });
  it("preserves a valid complete witness for every existing questionnaire kind", () => {
    const representatives=new Map<string,Questionnaire>();
    for(const name of readdirSync("lib/questionnaires/data").sort()){if(!name.endsWith(".json"))continue;const q=JSON.parse(readFileSync(`lib/questionnaires/data/${name}`,"utf8")) as Questionnaire;if(!representatives.has(q.kind))representatives.set(q.kind,q);}
    const knownKinds = ["eight-values","archetype","practice","compass","attachment","likert","directional","extraversion","affection","alignment","optimism","ten-key","typing"] as const;
    for(const kind of knownKinds) expect(representatives.has(kind),kind).toBe(true);
    for(const kind of knownKinds){
      const q = representatives.get(kind)!;
      expect(isQuestionnaireConfigurationValid(q),q.kind).toBe(true);
      const answers = q.kind==="typing"||q.kind==="ten-key" ? {} : Object.fromEntries(q.questions.map(item=>[item.id,item.options[0].id]));
      const result=scoreQuestionnaire(q,answers);
      expect(result.status,q.kind).toBe(q.kind==="typing"||q.kind==="ten-key"?"unavailable":"complete");
    }
  });
  it("publishes all6native ENZH pages with complete guides and a mode-specific directory label", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");vi.resetModules();const entry=await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"),guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"),maps=appendFunSitemapEntries([]);
    try{for(const locale of ["en","zh"] as const){
      const path=`/${locale}/tests/explore/typing-speed`,props={params:Promise.resolve({locale,slug:quiz.slug})},dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));const meta=await entry.generateMetadata(props);
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);expect(dom.querySelector("#take-test textarea")).not.toBeNull();expect(dom.querySelector("[data-typing-passage]")?.textContent).toBe(quiz.typing!.rounds[0].passage);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
      const directory=document.createElement("div");directory.innerHTML=renderToStaticMarkup(<MoreTests locale={locale}/>);const card=directory.querySelector(`a[href="${path}"]`)?.closest("article");expect(card?.textContent).toContain(locale==="zh"?"英/中文两种输入模式":"English & Chinese modes");expect(card?.textContent).not.toContain(locale==="zh"?"2 题":"2 questions");
      for(const p of quiz.profiles){const route=`${path}/results/${p.id}`,params={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})};dom.innerHTML=renderToStaticMarkup(await guide.default(params));const metadata=await guide.generateMetadata(params);expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);expect(dom.querySelector("a[href$='#take-test']")).not.toBeNull();for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${route}`);expect(maps.some(v=>v.loc===`https://fermatmind.com${route}`)).toBe(true);expect(dom.querySelector("[data-typing-result]")).toBeNull();}
    }}finally{vi.unstubAllEnvs();vi.resetModules();}
  });
  it("returns unavailable metadata and404 boundaries for invalid typing configuration",async()=>{
    const bad=structuredClone(quiz);bad.typing!.durationMs=1 as 60000;vi.resetModules();vi.doMock("@/lib/questionnaires/loaders",()=>({loadQuestionnaire:async()=>bad}));
    try{const entry=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),og=await import("@/app/og/fun/[slug]/route");const props={params:Promise.resolve({locale:"en",slug:quiz.slug})},gp={params:Promise.resolve({locale:"en",slug:quiz.slug,profile:"english"})};expect((await entry.generateMetadata(props)).robots).toEqual({index:false,follow:false});await expect(entry.default(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");expect((await guide.generateMetadata(gp)).robots).toEqual({index:false,follow:false});await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");expect((await og.GET(new Request("https://fermatmind.com/og/fun/typing-speed"),{params:Promise.resolve({slug:quiz.slug})})).status).toBe(404);}finally{vi.doUnmock("@/lib/questionnaires/loaders");vi.resetModules();}
  });
});
