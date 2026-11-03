import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NineStarYearPage } from "@/components/questionnaires/NineStarYearPage";
import { nineStarLandingSections, nineStarLandingFaq } from "@/components/questionnaires/NineStarLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { calculateNineStarYearFromInput, type NineStarYearQuestionnaire } from "@/lib/questionnaires/nineStarYear";
import raw from "@/lib/questionnaires/data/nine-star-ki.json";
import catalog from "@/lib/questionnaires/catalog.json";
const quiz=raw as unknown as NineStarYearQuestionnaire;
it("gives the calendar cycle a distinct illustration without a personality score",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="fantasy"/>);for(const m of ["nine-star-calendar-cycle","nine-star-boundary-notes"])expect(h).toContain(`data-${m}="true"`);
});
it("checks the worked negative remainders and preserves both uncertain labels",()=>{
 expect(calculateNineStarYearFromInput("2026","after-boundary")).toMatchObject({boundaryJst:"2026-02-04T05:02",candidates:[{seasonYear:2026,star:1}]});
 expect(calculateNineStarYearFromInput("2026","before-boundary")).toMatchObject({candidates:[{seasonYear:2025,star:2}]});
 expect(calculateNineStarYearFromInput("2025","uncertain")).toMatchObject({certainty:"two-possibilities",candidates:[{seasonYear:2024,star:3},{seasonYear:2025,star:2}]});
 expect(new Date("2026-02-04T05:02:00+09:00").toISOString()).toBe("2026-02-03T20:02:00.000Z");
});
it("renders complete bilingual method and editorial prose, fourteen FAQs and nine public guides",()=>{
 expect(catalog.find(x=>x.slug===quiz.slug)?.description).toEqual(quiz.description);
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<NineStarYearPage quiz={quiz} locale={locale}/>);const b=norm(d.textContent??"");
 expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test input")?.id).toBe("nine-star-year");expect(d.querySelectorAll('[aria-labelledby="nine-star-faq"]>div')).toHaveLength(14);expect(d.querySelectorAll('[aria-labelledby="nine-star-public-guides"]>ul>li')).toHaveLength(9);expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);
 for(const s of [...quiz.guide,...nineStarLandingSections])for(const p of s.paragraphs)expect(b).toContain(norm(p[locale]));for(const f of [...quiz.faq,...nineStarLandingFaq]){expect(b).toContain(norm(f.question[locale]));expect(b).toContain(norm(f.answer[locale]));}
 expect(b).toContain(norm(quiz.instructions[locale]));expect(d.querySelector(".explore-intro")?.textContent).not.toContain(quiz.instructions[locale]);for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();if(locale==="en")expect(b).not.toMatch(/\p{Script=Han}/u);
 }
});
