import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { additionalStoryEditorials } from "@/components/entertainment/AdditionalStoryEditorials";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
afterEach(() => vi.unstubAllEnvs());
// Independently transcribed terminal routes; expected endings do not come from the resolver.
const routes = [
 ["q1:1,q2:1,q4:1","bell"], ["q1:1,q2:1,q4:2","mural"],
 ["q1:1,q2:2,q5:1","ledger"], ["q1:1,q2:2,q5:2","mural"],
 ["q1:2,q3:1,q4:1","bell"], ["q1:2,q3:1,q4:2","mural"],
 ["q1:2,q3:2,q5:1","ledger"], ["q1:2,q3:2,q5:2","mural"],
];
const bytes = readFileSync("lib/entertainment/data/island-day.json");
const quiz = JSON.parse(bytes.toString()) as FunQuiz;
describe("island-day: authored branching fiction, not tally scoring", () => {
 it("preserves the source bytes and checks all eight terminal paths and every incomplete prefix", () => {
  expect(createHash("sha256").update(bytes).digest("hex")).toBe("29a890a791e3d525b2a2daca289f6e34379569f90b92ca1c992951954a072a5b");
  const lengths: Record<number,number> = {}, endings: Record<string,number> = {};
  for (const [encoded,ending] of routes) {
   const steps=encoded.split(",").map(s=>s.split(":")); const answers: Answers = {};
   for (const [qid,option] of steps) {expect(resolveFunQuiz(quiz,answers).complete).toBe(false);answers[qid]=`o${option}`;}
   const value=resolveFunQuiz(quiz,answers);
   expect(value.path).toEqual(steps.map(s=>s[0]));expect(value.complete).toBe(true);expect(value.resultIds).toEqual([ending]);
   expect(Object.values(value.scores)).toEqual([0,0,0]);lengths[steps.length]=(lengths[steps.length]??0)+1;endings[ending]=(endings[ending]??0)+1;
  }
  expect(lengths).toEqual({3:8});expect(endings).toEqual({bell:2,mural:4,ledger:2});
  expect(()=>resolveFunQuiz(quiz,{q1:"o9"})).toThrow();expect(()=>resolveFunQuiz(quiz,{unknown:"o1"})).toThrow();
 });
 it.each(["en","zh"] as const)("renders actual %s entry, source meaning and complete public endings without tally claims", async locale=>{
  vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://fermatmind.com");
  const route=await import("@/app/(localized)/[locale]/tests/play/[slug]/page");const props={params:Promise.resolve({locale,slug:quiz.slug})};
  const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await route.default(props));
  const editorial=additionalStoryEditorials[quiz.slug]!;
  for(const section of editorial.sections)for(const p of section.paragraphs)expect(dom.textContent).toContain(p[locale].replace(/\s*\[\d+\]/g,""));
  for(const item of editorial.faq)expect(dom.textContent).toContain(item.answer[locale]);
  expect(dom.querySelector(".explore-intro-meta")?.textContent).toContain("3");
  expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);expect(dom.querySelectorAll("#play input")).toHaveLength(0);
  expect(dom.textContent).not.toMatch(/retains every highest tie|本次结果会保留并完整显示所有最高并列/);
  for(const result of quiz.results)expect(dom.querySelector(`a[href="/${locale}/tests/play/${quiz.slug}/results/${result.id}"]`)).not.toBeNull();
  const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  const meta=await route.generateMetadata(props);expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/${quiz.slug}`);expect(meta.title).toBe(quiz.seo.title[locale]);
 });
});
