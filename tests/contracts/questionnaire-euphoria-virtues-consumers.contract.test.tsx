import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
const mocks=vi.hoisted(()=>({load:vi.fn(),font:vi.fn(),image:vi.fn()}));
vi.mock("@/lib/questionnaires/loaders",()=>({loadQuestionnaire:mocks.load}));
vi.mock("@/lib/entertainment/loaders",()=>({loadFunQuiz:async()=>null}));
vi.mock("node:fs/promises",async(importOriginal)=>({...await importOriginal<typeof import("node:fs/promises")>(),readFile:mocks.font}));
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
vi.mock("next/og",()=>({ImageResponse:class extends Response{constructor(){super("synthetic image; negative tests only");mocks.image();}}}));
const read=(slug:string)=>JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`,"utf8")) as Questionnaire;
it("fails closed in entry, guide and OG before consuming missing or sparse profiles for both new identities",async()=>{
 const page=await import("@/components/questionnaires/QuestionnairePage"),guide=await import("@/components/questionnaires/QuestionnaireGuide"),og=await import("@/app/og/fun/[slug]/route");
 for(const slug of ["seven-sins-virtues-test","euphoria-character-quiz"]){
  const source=read(slug);
  const changes:((q:Questionnaire)=>void)[]=[q=>{q.source.scoringVersion="stale";},q=>{q.profiles=undefined as unknown as Questionnaire["profiles"];},q=>{delete q.profiles[0];},q=>{delete q.questions[0];},q=>{delete q.guide[0].paragraphs[0];},q=>{q.questions[0].options[0].label.en="";}];
  for(const change of changes){
   const damaged=structuredClone(source);change(damaged);mocks.load.mockResolvedValue(damaged);
   for(const locale of ["en","zh"]){
    const params=Promise.resolve({locale,slug,profile:source.profiles[0].id});
    expect((await page.generateMetadata({params})).robots).toEqual({index:false,follow:false});
    expect((await guide.generateMetadata({params})).robots).toEqual({index:false,follow:false});
    await expect(page.default({params})).rejects.toThrow(/404/);await expect(guide.default({params})).rejects.toThrow(/404/);
    expect((await og.GET(new Request(`https://fermatmind.com/og/fun/${slug}?locale=${locale}&portrait=${source.profiles[0].id}`),{params:Promise.resolve({slug})})).status).toBe(404);
   }
  }
 }
 expect(mocks.font).not.toHaveBeenCalled();expect(mocks.image).not.toHaveBeenCalled();
});
it("rejects unknown, private-looking and foreign portrait identities before image generation",async()=>{
 const og=await import("@/app/og/fun/[slug]/route");
 for(const slug of ["seven-sins-virtues-test","euphoria-character-quiz"]){
  const quiz=read(slug);mocks.load.mockResolvedValue(quiz);
  for(const portrait of ["unknown","VIRTUES_LK_001","EUPHORIA_ORIGINAL_01","personal-score-15","../../private"]){
   const response=await og.GET(new Request(`https://fermatmind.com/og/fun/${slug}?portrait=${encodeURIComponent(portrait)}`),{params:Promise.resolve({slug})});expect(response.status).toBe(404);
  }
 }
 expect(mocks.font).not.toHaveBeenCalled();expect(mocks.image).not.toHaveBeenCalled();
});
