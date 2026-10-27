import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isDataEntryConfigurationValid, normalizeDataEntryText, scoreDataEntryRound, dataEntryCharacters, classifyDataEntryError, type DataEntryRound, type DataEntryAttemptRow } from "@/lib/questionnaires/dataEntry";
import { isQuestionnaireConfigurationValid, readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { MoreTests } from "@/components/entertainment/MoreTests";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/data-entry.json", "utf8")) as Questionnaire;
const sourceBytes=readFileSync("tests/fixtures/questionnaires/data-entry-reference.json"), source=JSON.parse(sourceBytes.toString()) as {durationMs:60000;rounds:DataEntryRound[]};
const profileBytes=readFileSync("tests/fixtures/questionnaires/data-entry-profiles-reference.json");
const complete=(round:DataEntryRound,rows:DataEntryAttemptRow[],elapsed=60000)=>{const result=scoreDataEntryRound(round,rows,elapsed);if(result.status!=="complete")throw Error("Valid entry rejected");return result;};
describe("T152 real structured data entry",()=>{
  it("binds64fictionalrecords256fields and twoFULL7 without questionnaire items",()=>{
    expect(quiz.kind).toBe("data-entry");expect(isDataEntryConfigurationValid(quiz)).toBe(true);expect(isQuestionnaireConfigurationValid(quiz)).toBe(true);expect(quiz.questions).toEqual([]);
    expect(quiz.dataEntry).toEqual({durationMs:source.durationMs,rounds:source.rounds});expect(quiz.profiles).toEqual(JSON.parse(profileBytes.toString()));
    expect(quiz.source.itemBankSha256).toBe(createHash("sha256").update(sourceBytes).digest("hex"));expect(quiz.source.resultContentSha256).toBe(createHash("sha256").update(profileBytes).digest("hex"));
    expect(quiz.dataEntry!.rounds.map(r=>[r.id,r.fields.length,r.records.length])).toEqual([["assets",4,32],["dispatch",4,32]]);
    for(const p of quiz.profiles){expect(p.sections).toHaveLength(7);expect(p.sections.flatMap(s=>s.paragraphs).map(p=>p.en).join(" ").split(/\s+/).length).toBeGreaterThan(400);expect(p.seo!.title.en.length).toBeLessThanOrEqual(60);expect(p.seo!.description.en.length).toBeLessThanOrEqual(160);}
    expect(quiz.source.psychometricValidationCompleted).toBe(false);expect(readFileSync("public/fonts/noto-sans-sc/data-entry-700.ttf").byteLength).toBeLessThan(300000);
  });
  it("recomputes every perfect prefix,each exact field and every character prefix using literal ASCII lengths",()=>{
    let prefixes=0,fields=0,characters=0;
    for(const round of source.rounds){
      for(const record of round.records)for(const value of record.values)assert.match(value,/^[\x20-\x7e]+$/);
      for(let n=0;n<=32;n++){const rows=round.records.slice(0,n).map(r=>({recordId:r.id,values:r.values})),chars=rows.flatMap(r=>r.values).reduce((a,v)=>a+v.length,0),r=complete(round,rows);
        assert.deepStrictEqual([r.attemptedRecords,r.exactRecords,r.consideredFields,r.exactFields,r.enteredCharacters,r.exactFieldCharacters,r.fieldAccuracy,r.characterKph,r.exactFieldCharacterKph,r.exactFieldsPerHour],[n,n,n*4,n*4,chars,chars,n?100:null,chars*60,chars*60,n*240]);prefixes++;}
      for(const record of round.records)for(let field=0;field<4;field++){
        const values=["","","",""];values[field]=record.values[field];const r=complete(round,[{recordId:record.id,values}]);assert.deepStrictEqual([r.exactFields,r.exactRecords,r.consideredFields,r.fieldAccuracy,r.enteredCharacters,r.errors.blank],[1,0,4,25,values[field].length,3]);fields++;
        for(let n=0;n<=record.values[field].length;n++){values[field]=record.values[field].slice(0,n);const a=complete(round,[{recordId:record.id,values}]);assert.equal(a.enteredCharacters,n);assert.equal(a.characterKph,n*60);assert.equal(a.exactFields,n===record.values[field].length?1:0);characters++;}
      }
    }
    expect(prefixes).toBe(66);expect(fields).toBe(256);expect(characters).toBe(2111);console.info("Entry:66perfect prefixes+256field probes+2111character prefixes;not physical keys,human speed or all possible text.");
  });
  it("checks priority error buckets,NFCgraphemes,leading zeros and separate units",()=>{
    expect(dataEntryCharacters("e\u0301👩🏽‍💻")).toEqual(["é","👩🏽‍💻"]);expect(normalizeDataEntryText(" a ")).toBe(" a ");
    for(const [target,actual,expected] of [["Ab 12","Ab 12",null],["Ab 12","","blank"],["Ab 12","ab12","case-spacing"],["AB12","AB21","transposition"],["AB12","A12","omission"],["AB12","ABX12","addition"],["007","7","omission"],["AX","AY","other"]] as const)expect(classifyDataEntryError(target,actual)).toBe(expected);
    const round=structuredClone(source.rounds[0]);round.records[0].values=["AX-0042","Blue Tray","007","B-02"];
    const full=complete(round,[{recordId:round.records[0].id,values:[...round.records[0].values]}]);expect([full.enteredCharacters,full.characterKph,full.exactFieldCharacterKph,full.fieldAccuracy,full.exactRecords]).toEqual([23,1380,1380,100,1]);
    const wrong=complete(round,[{recordId:round.records[0].id,values:["AX-0042","blue Tray","007","B-02"]}]);expect([wrong.characterKph,wrong.exactFieldCharacterKph,wrong.fieldAccuracy,wrong.errors["case-spacing"]]).toEqual([1380,840,75,1]);
    const blank=complete(round,[{recordId:round.records[0].id,values:["","","",""]}]);expect([blank.fieldAccuracy,blank.errors.blank,blank.attemptedRecords]).toEqual([0,4,1]);expect(complete(round,[]).fieldAccuracy).toBeNull();
  });
  it("rejects early results,duplicates,foreign rows,controls and malformed configurations",()=>{
    const round=source.rounds[0],row={recordId:round.records[0].id,values:round.records[0].values};expect(scoreDataEntryRound(round,[row],59999.9)).toEqual({status:"incomplete"});expect(complete(round,[row],60040).durationMs).toBe(60000);
    for(const bad of [null,{},[row,row],[{...row,recordId:"FOREIGN"}],[{...row,values:["x"]}],[{...row,values:["x\n","","",""]}],[{...row,values:["x".repeat(65),"","",""]}]])expect(scoreDataEntryRound(round,bad,60000)).toEqual({status:"invalid"});
    for(const bad of [null,NaN,Infinity,-1,"60000"])expect(scoreDataEntryRound(round,[row],bad)).toEqual({status:"invalid"});
    for(const mutate of [(q:Questionnaire)=>{q.dataEntry!.durationMs=1 as 60000;},(q:Questionnaire)=>{q.dataEntry!.rounds.pop();},(q:Questionnaire)=>{q.dataEntry!.rounds[0].records.pop();},(q:Questionnaire)=>{q.dataEntry!.rounds[0].records[1].id=q.dataEntry!.rounds[0].records[0].id;},(q:Questionnaire)=>{q.dataEntry!.rounds[0].records[0].values[0]="秘密";},(q:Questionnaire)=>{q.dataEntry!.rounds[0].fields[1].id=q.dataEntry!.rounds[0].fields[0].id;},(q:Questionnaire)=>{q.profiles[0].sections[0].paragraphs=[];},(q:Questionnaire)=>{q.questions=[{id:"FAKE",prompt:{en:"fake",zh:"假"},options:[]}];}]){const bad=structuredClone(quiz);mutate(bad);expect(isDataEntryConfigurationValid(bad)).toBe(false);}
    expect(scoreQuestionnaire(quiz,{})).toEqual({status:"unavailable",answered:0});expect(readQuestionnaireDraft(quiz,JSON.stringify({version:quiz.version,savedAt:100,answers:{}}),200)).toBeNull();
  });
  it("preserves a valid complete witness for every existing questionnaire kind", () => {
    const representatives=new Map<string,Questionnaire>();
    for(const name of readdirSync("lib/questionnaires/data").sort()){if(!name.endsWith(".json"))continue;const q=JSON.parse(readFileSync(`lib/questionnaires/data/${name}`,"utf8")) as Questionnaire;if(!representatives.has(q.kind))representatives.set(q.kind,q);}
    const knownKinds = ["data-entry","secs","paired-dimensions","eight-values","archetype","practice","compass","attachment","likert","directional","extraversion","affection","alignment","optimism","ten-key","typing"] as const;
    for(const kind of knownKinds) expect(representatives.has(kind),kind).toBe(true);
    for(const kind of knownKinds){
      const q = representatives.get(kind)!;
      expect(isQuestionnaireConfigurationValid(q),q.kind).toBe(true);
      const answers = q.kind==="data-entry"||q.kind==="typing"||q.kind==="ten-key" ? {} : Object.fromEntries(q.questions.map(item=>[item.id,item.options[0].id]));
      const result=scoreQuestionnaire(q,answers);
      expect(result.status,q.kind).toBe(q.kind==="data-entry"||q.kind==="typing"||q.kind==="ten-key"?"unavailable":"complete");
    }
  });
  it("publishes all6native ENZH pages with complete guides and a mode-specific directory label", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");vi.resetModules();const entry=await import("@/app/(localized)/[locale]/tests/explore/[slug]/page"),guide=await import("@/app/(localized)/[locale]/tests/explore/[slug]/results/[profile]/page"),maps=appendFunSitemapEntries([]);
    try{for(const locale of ["en","zh"] as const){
      const path=`/${locale}/tests/explore/data-entry`,props={params:Promise.resolve({locale,slug:quiz.slug})},dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));const meta=await entry.generateMetadata(props);
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);expect(dom.querySelector("#take-test input")).not.toBeNull();expect(dom.querySelector("[data-data-entry-source]")?.textContent).toBe(quiz.dataEntry!.rounds[0].records[0].values[0]);expect(meta.title).toBe(quiz.seoTitle[locale]);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com${path}`);
      const directory=document.createElement("div");directory.innerHTML=renderToStaticMarkup(<MoreTests locale={locale}/>);const card=directory.querySelector(`a[href="${path}"]`)?.closest("article");expect(card?.textContent).toContain(locale==="zh"?"2种虚构记录模式":"2 fictional record modes");expect(card?.textContent).not.toContain(locale==="zh"?"2 题":"2 questions");
      for(const p of quiz.profiles){const route=`${path}/results/${p.id}`,params={params:Promise.resolve({locale,slug:quiz.slug,profile:p.id})};dom.innerHTML=renderToStaticMarkup(await guide.default(params));const metadata=await guide.generateMetadata(params);expect(dom.querySelector("h1")?.textContent).toBe(p.title[locale]);expect(dom.querySelector("a[href$='#take-test']")).not.toBeNull();for(const s of p.sections)for(const t of s.paragraphs)expect(dom.textContent).toContain(t[locale]);expect(metadata.alternates?.canonical).toBe(`https://fermatmind.com${route}`);expect(maps.some(v=>v.loc===`https://fermatmind.com${route}`)).toBe(true);expect(dom.querySelector("[data-data-entry-result]")).toBeNull();}
    }}finally{vi.unstubAllEnvs();vi.resetModules();}
  });
  it("returns unavailable metadata and404 boundaries for invalid data entry configuration",async()=>{
    const bad=structuredClone(quiz);bad.dataEntry!.durationMs=1 as 60000;vi.resetModules();vi.doMock("@/lib/questionnaires/loaders",()=>({loadQuestionnaire:async()=>bad}));
    try{const entry=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),og=await import("@/app/og/fun/[slug]/route");const props={params:Promise.resolve({locale:"en",slug:quiz.slug})},gp={params:Promise.resolve({locale:"en",slug:quiz.slug,profile:"assets"})};expect((await entry.generateMetadata(props)).robots).toEqual({index:false,follow:false});await expect(entry.default(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");expect((await guide.generateMetadata(gp)).robots).toEqual({index:false,follow:false});await expect(guide.default(gp)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");expect((await og.GET(new Request("https://fermatmind.com/og/fun/data-entry"),{params:Promise.resolve({slug:quiz.slug})})).status).toBe(404);}finally{vi.doUnmock("@/lib/questionnaires/loaders");vi.resetModules();}
  });
});
