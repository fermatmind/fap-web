import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { readFileSync } from "node:fs";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { FireflyEveningPage } from "@/components/entertainment/FireflyEveningPage";
import { fireflyEveningSections, fireflyEveningFaq } from "@/components/entertainment/FireflyEveningEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/entertainment/data/firefly-evening.json", "utf8")) as FunQuiz;
afterEach(() => vi.unstubAllEnvs());
describe("FireflyEvening: actual branching story and bilingual editorial", () => {
  it("executes all eight authored routes, with exactly three choices and one exact ending", () => {
    const routes = [
      ["q1:o1,q2:o1,q4:o1", "shared"], ["q1:o1,q2:o1,q4:o2", "quiet"],
      ["q1:o1,q2:o2,q5:o1", "signal"], ["q1:o1,q2:o2,q5:o2", "quiet"],
      ["q1:o2,q3:o1,q5:o1", "signal"], ["q1:o2,q3:o1,q5:o2", "quiet"],
      ["q1:o2,q3:o2,q4:o1", "shared"], ["q1:o2,q3:o2,q4:o2", "quiet"],
    ];
    expect(quiz.mechanism).toBe("branch"); const counts:Record<string,number>={shared:0,signal:0,quiet:0};
    for(const [encoded,ending] of routes) {
      const steps=encoded.split(",").map(s=>s.split(":")), answers:Answers={};
      for(const [q,o] of steps) {expect(resolveFunQuiz(quiz,answers).complete).toBe(false);answers[q]=o;}
      const result=resolveFunQuiz(quiz,answers);expect(result.complete).toBe(true);
      expect(result.path).toEqual(steps.map(([q])=>q));expect(result.resultIds).toEqual([ending]);
      expect(result.scores).toEqual({shared:0,signal:0,quiet:0});expect(result.path.length).toBe(3);counts[ending]++;
    }
    expect(counts).toEqual({shared:2,signal:2,quiet:4});
    expect(new Set(routes.map(([route])=>route)).size).toBe(8);
  });
  it.each(["en","zh"] as const)("renders ten bespoke chapters, twelve FAQ, three complete guide links and direct entry: %s", locale=>{
    const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<FireflyEveningPage quiz={quiz} locale={locale}/>);
    for(const s of fireflyEveningSections) for(const p of s.paragraphs) expect(d.textContent).toContain(p[locale].replace(/\s*\[\d+\]/g, ""));
    for(const f of [quiz.seo.faq,...fireflyEveningFaq]) expect(d.textContent).toContain(f.answer[locale]);
    expect(d.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);
    expect(d.querySelector("#play h2")?.textContent).toBe(locale === "zh" ? "短篇分支故事的阅读说明" : "Reading a short branching story");
    expect(d.querySelectorAll("[data-explore-start]")).toHaveLength(1);expect(d.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    for(const r of quiz.results) { expect(d.querySelector(`a[href="/${locale}/tests/play/firefly-evening/results/${r.id}"]`)).not.toBeNull();expect(d.textContent).toContain(r.summary[locale]); }
    const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
    for(const a of d.querySelectorAll('a[href^="#firefly-evening-reference-"]')) expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(d.textContent).not.toContain(locale==="zh"?"内容与规则版本":"Content and rules version");
  });
});

 it.each(["en","zh"] as const)("real play route preserves metadata and selects the bespoke firefly-evening page: %s", async locale=>{
   vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
   const entry=await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
   const props={params:Promise.resolve({locale,slug:"firefly-evening"})};
   const meta=await entry.generateMetadata(props);const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));
   expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);expect(meta.title).toBe(quiz.seo.title[locale]);expect(meta.description).toBe(quiz.seo.description[locale]);
   expect(dom.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);expect(dom.querySelector("#play")?.textContent).toContain(locale === "zh" ? "纸灯展" : "paper-light scene");expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
   expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/firefly-evening`);
 });
