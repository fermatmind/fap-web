// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { Questionnaire } from "@/lib/questionnaires/types";
it("renders all34native bilingual OG images with local fonts and no external asset request",async()=>{
 const localFetch=globalThis.fetch,external=vi.fn(async()=>{throw Error("Synthetic denial: only local font assets allowed");});
 vi.stubGlobal("fetch",(input:RequestInfo|URL,init?:RequestInit)=>String(input).startsWith("data:")?localFetch(input,init):external());
 let count=0;
 try{
  for(const slug of ["seven-sins-virtues-test","euphoria-character-quiz"]){
   const quiz=JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`,"utf8")) as Questionnaire;
   expect(readFileSync(`public/fonts/noto-sans-sc/${slug}-700.ttf`).byteLength).toBeLessThan(300000);
   for(const locale of ["en","zh"])for(const portrait of [undefined,...quiz.profiles.map(p=>p.id)]){
    const response=await GET(new Request(`https://fermatmind.com/og/fun/${slug}?locale=${locale}${portrait?`&portrait=${portrait}`:""}`),{params:Promise.resolve({slug})});
    expect(response.status).toBe(200);expect(response.headers.get("content-type")).toContain("image/png");
    const bytes=Buffer.from(await response.arrayBuffer());expect([...bytes.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);expect(bytes.byteLength).toBeGreaterThan(10000);expect(bytes.readUInt32BE(16)).toBe(1200);expect(bytes.readUInt32BE(20)).toBe(630);count++;
   }
  }
  expect(count).toBe(34);expect(external).not.toHaveBeenCalled();
 }finally{vi.unstubAllGlobals();}
},30000);
