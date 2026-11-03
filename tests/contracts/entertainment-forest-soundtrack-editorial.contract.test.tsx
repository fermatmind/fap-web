import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { readFileSync } from "node:fs";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { ForestSoundtrackPage } from "@/components/entertainment/ForestSoundtrackPage";
import { forestSoundtrackSections, forestSoundtrackFaq } from "@/components/entertainment/ForestSoundtrackEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/entertainment/data/forest-soundtrack.json", "utf8")) as FunQuiz;
afterEach(() => vi.unstubAllEnvs());
describe("ForestSoundtrack: actual branching story and bilingual editorial", () => {
  it("executes all ten authored routes, with three or four choices and one exact ending", () => {
    const routes = [["q1:o1,q2:o1,q4:o1", "echo"], ["q1:o1,q2:o1,q4:o2", "pause"], ["q1:o1,q2:o2,q3:o1,q5:o1", "chorus"], ["q1:o1,q2:o2,q3:o1,q5:o2", "pause"], ["q1:o1,q2:o2,q3:o2,q4:o1", "echo"], ["q1:o1,q2:o2,q3:o2,q4:o2", "pause"], ["q1:o2,q3:o1,q5:o1", "chorus"], ["q1:o2,q3:o1,q5:o2", "pause"], ["q1:o2,q3:o2,q4:o1", "echo"], ["q1:o2,q3:o2,q4:o2", "pause"]];
    expect(quiz.mechanism).toBe("branch"); const counts:Record<string,number>={echo:0,chorus:0,pause:0};
    for(const [encoded,ending] of routes) {
      const steps=encoded.split(",").map(s=>s.split(":")), answers:Answers={};
      for(const [q,o] of steps) {expect(resolveFunQuiz(quiz,answers).complete).toBe(false);answers[q]=o;}
      const result=resolveFunQuiz(quiz,answers);expect(result.complete).toBe(true);
      expect(result.path).toEqual(steps.map(([q])=>q));expect(result.resultIds).toEqual([ending]);
      expect(result.scores).toEqual({echo:0,chorus:0,pause:0});expect([3,4]).toContain(result.path.length);counts[ending]++;
    }
    expect(counts).toEqual({echo:3,chorus:2,pause:5});
    expect(new Set(routes.map(([route])=>route)).size).toBe(10);
  });
  it.each(["en","zh"] as const)("renders ten bespoke chapters, twelve FAQ, three complete guide links and direct entry: %s", locale=>{
    const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<ForestSoundtrackPage quiz={quiz} locale={locale}/>);
    for(const s of forestSoundtrackSections) for(const p of s.paragraphs) expect(d.textContent).toContain(p[locale].replace(/\s*\[\d+\]/g, ""));
    for(const f of [quiz.seo.faq,...forestSoundtrackFaq]) expect(d.textContent).toContain(f.answer[locale]);
    expect(d.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);
    expect(d.querySelector("#play h2")?.textContent).toBe(locale === "zh" ? "短篇分支故事的阅读说明" : "Reading a short branching story");
    expect(d.querySelectorAll("[data-explore-start]")).toHaveLength(1);expect(d.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    for(const r of quiz.results) { expect(d.querySelector(`a[href="/${locale}/tests/play/forest-soundtrack/results/${r.id}"]`)).not.toBeNull();expect(d.textContent).toContain(r.summary[locale]); }
    const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
    for(const a of d.querySelectorAll('a[href^="#forest-soundtrack-reference-"]')) expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(d.textContent).not.toContain(locale==="zh"?"内容与规则版本":"Content and rules version");
  });
});

 it.each(["en","zh"] as const)("real play route preserves metadata and selects the bespoke forest-soundtrack page: %s", async locale=>{
   vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
   const entry=await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
   const props={params:Promise.resolve({locale,slug:"forest-soundtrack"})};
   const meta=await entry.generateMetadata(props);const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));
   expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);expect(meta.title).toBe(quiz.seo.title[locale]);expect(meta.description).toBe(quiz.seo.description[locale]);
   expect(dom.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);expect(dom.querySelector("#play")?.textContent).toContain(locale === "zh" ? "森林曲子场景" : "forest-tune scene");expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
   expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/forest-soundtrack`);
 });
