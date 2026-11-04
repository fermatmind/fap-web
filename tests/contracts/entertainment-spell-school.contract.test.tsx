import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
const fixtures = [
 {slug:"spell-school-elective",hash:"474084b272c55fdf50d9e3aa68b51919f8ed36673a323e5878627d3bd5d30bb4",mapping:[["weather","architecture","echo","floating"],["architecture","echo","floating","weather"],["echo","floating","weather","architecture"],["floating","weather","architecture","echo"],["weather","echo","architecture","floating"],["architecture","floating","echo","weather"]]},
];
for (const {slug,hash,mapping} of fixtures) describe(slug,()=>{
 const bytes=readFileSync(`lib/entertainment/data/${slug}.json`);const quiz=JSON.parse(bytes.toString()) as FunQuiz;
 it("keeps the source bank and complete portraits byte-identical, and independently checks all 4096 paths",()=>{
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
  const sets=new Set<string>();
  for(let n=0;n<4096;n++){
   let digits=n;const answers:Answers={};const expected=Object.fromEntries(quiz.tieOrder.map(id=>[id,0]));
   for(const [i,q] of quiz.questions.entries()){const digit=digits%4;digits=Math.floor(digits/4);answers[q.id]=q.options[digit].id;expected[mapping[i][digit]]++;}
   const result=resolveFunQuiz(quiz,answers);expect(result.complete).toBe(true);expect(result.scores).toEqual(expected);
   const highest=quiz.tieOrder.filter(id=>expected[id]===Math.max(...Object.values(expected)));expect(result.resultIds).toEqual(highest);sets.add(highest.join(","));
   expect(Object.values(result.scores).reduce((a,b)=>a+b,0)).toBe(6);
  }
  expect(sets.size).toBe(14);expect(resolveFunQuiz(quiz,{q1:"o1"}).complete).toBe(false);expect(()=>resolveFunQuiz(quiz,{q1:"invalid"})).toThrow();
 });
 it.each(["en","zh"] as const)("renders the actual %s route with dedicated content, full public guides and stable metadata",async locale=>{
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
  const route=await import("@/app/(localized)/[locale]/tests/play/[slug]/page");const props={params:Promise.resolve({locale,slug})};
  const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default(props));const editorial=additionalStoryEditorials[slug]!;
  for(const section of editorial.sections)for(const p of section.paragraphs)expect(dom.textContent?.replace(/\s*\[\d+\]/g, "")).toContain(p[locale].replace(/\s*\[\d+\]/g,""));
  for(const f of editorial.faq)expect(dom.textContent).toContain(f.answer[locale]);
  expect(dom.querySelector("#play")?.textContent).toContain(editorial.instructions[locale]);expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
  expect(dom.querySelectorAll('#play input:not([type="hidden"])')).toHaveLength(0);expect(dom.querySelector("#play form")?.getAttribute("action")).toBe(`/${locale}/tests/play/${quiz.slug}/take`);expect([...dom.querySelectorAll<HTMLInputElement>('#play input[type="hidden"]')].map(input => [input.name, input.value])).toEqual([["start", "1"]]);expect(dom.querySelectorAll("main")).toHaveLength(1);
  expect(dom.textContent).toContain(locale === "zh" ? "四篇完整画像与公开指南" : "Four complete portraits and public guides");
  for(const result of quiz.results){expect(dom.querySelector(`a[href="/${locale}/tests/play/${slug}/results/${result.id}"]`)).not.toBeNull();expect(dom.textContent).toContain(result.summary[locale]);}
  for(const a of dom.querySelectorAll(`a[href^="#${slug}-reference-"]`))expect(dom.querySelector(a.getAttribute("href")!)).not.toBeNull();
  const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(ids.length).toBe(new Set(ids).size);
  const meta=await route.generateMetadata(props);expect(meta.title).toBe(quiz.seo.title[locale]);expect(meta.description).toBe(quiz.seo.description[locale]);
  expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/${slug}`);
 });
});
