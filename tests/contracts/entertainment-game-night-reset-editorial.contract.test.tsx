import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, FunQuiz } from "@/lib/entertainment/types";
import { readFileSync } from "node:fs";
import { resolveFunQuiz } from "@/lib/entertainment/scoring";
import { GameNightResetPage } from "@/components/entertainment/GameNightResetPage";
import { gameNightResetSections, gameNightResetFaq } from "@/components/entertainment/GameNightResetEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/entertainment/data/game-night-reset.json", "utf8")) as FunQuiz;
afterEach(() => vi.unstubAllEnvs());
describe("GameNightReset: actual six-choice game and bilingual editorial", () => {
  it("executes all729 complete answers, preserves all seven highest combinations and the six-point sum", () => {
    const outcomes = new Set<string>();
    for (let n=0; n<729; n++) {
      let digits=n; const answers:Answers={};
      for(const q of quiz.questions) { answers[q.id]=q.options[digits%3].id; digits=Math.floor(digits/3); }
      const r=resolveFunQuiz(quiz,answers), expected=Object.fromEntries(quiz.tieOrder.map(id=>[id,0]));
      const mapping=[["check", "change", "finish"], ["check", "change", "finish"], ["finish", "check", "change"], ["change", "check", "finish"], ["finish", "check", "change"], ["change", "check", "finish"]];
      quiz.questions.forEach((q,i)=>{expected[mapping[i][Number(answers[q.id].slice(1))-1]]+=1;});
      expect(r.complete).toBe(true); expect(r.scores).toEqual(expected);expect(Object.values(r.scores).reduce((a,b)=>a+b,0)).toBe(6);
      expect(r.resultIds).toEqual(quiz.tieOrder.filter(id=>expected[id]===Math.max(...Object.values(expected))));outcomes.add(r.resultIds.join(","));
    }
    expect(outcomes.size).toBe(7);
    for(let mask=1;mask<8;mask++) expect(outcomes.has(quiz.tieOrder.filter((_,i)=>mask&(1<<i)).join(","))).toBe(true);
    expect(resolveFunQuiz(quiz,{q1:"o1"}).complete).toBe(false);
  });
  it.each(["en","zh"] as const)("renders ten bespoke chapters, twelve FAQ, three complete guide links and direct entry: %s", locale=>{
    const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<GameNightResetPage quiz={quiz} locale={locale}/>);
    for(const s of gameNightResetSections) for(const p of s.paragraphs) expect(d.textContent).toContain(p[locale].replace(/\s*\[\d+\]/g, ""));
    for(const f of [quiz.seo.faq,...gameNightResetFaq]) expect(d.textContent).toContain(f.answer[locale]);
    expect(d.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);
    expect(d.querySelectorAll("[data-explore-start]")).toHaveLength(1);expect(d.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    for(const r of quiz.results) { expect(d.querySelector(`a[href="/${locale}/tests/play/game-night-reset/results/${r.id}"]`)).not.toBeNull();expect(d.textContent).toContain(r.summary[locale]); }
    const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
    for(const a of d.querySelectorAll('a[href^="#game-night-reset-reference-"]')) expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(d.textContent).not.toContain(locale==="zh"?"内容与规则版本":"Content and rules version");
  });
});

 it.each(["en","zh"] as const)("real play route preserves metadata and selects the bespoke game-night-reset page: %s", async locale=>{
   vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
   const entry=await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
   const props={params:Promise.resolve({locale,slug:"game-night-reset"})};
   const meta=await entry.generateMetadata(props);const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(await entry.default(props));
   expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);expect(meta.title).toBe(quiz.seo.title[locale]);expect(meta.description).toBe(quiz.seo.description[locale]);
   expect(dom.querySelectorAll('[aria-labelledby="quiz-faq"] h3')).toHaveLength(12);expect(dom.querySelector("#play")?.textContent).toContain(locale === "zh" ? "友好游戏" : "friendly game");expect(dom.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
   expect(meta.alternates?.canonical).toBe(`https://fermatmind.com/${locale}/tests/play/game-night-reset`);
 });
