import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NatalChartPage } from "@/components/questionnaires/NatalChartPage";
import { natalLandingSections, natalLandingFaq } from "@/components/questionnaires/NatalLandingEditorial";
import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { type NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";
import { NATAL_BODIES, natalWholeSignHouse, readNatalCoordinate } from "@/lib/questionnaires/natalChartCoordinates";
import { calculateNatalAspects } from "@/lib/questionnaires/natalChartAspects";
import { resolveNatalTime } from "@/lib/questionnaires/natalChartTime";
import raw from "@/lib/questionnaires/data/natal-chart.json";
const quiz=raw as unknown as NatalChartQuestionnaire;
it("distinguishes a decorative placement wheel from the time and coordinate inputs",()=>{
 const h=renderToStaticMarkup(<DiscoveryCardArt slug={quiz.slug} category="fantasy"/>);for(const m of ["natal-position-wheel","natal-time-location-card"])expect(h).toContain(`data-${m}="true"`);
});
it("checks the disclosed coordinate, whole-house and inclusive aspect examples against the actual calculators",()=>{
 expect(readNatalCoordinate(29.99)).toMatchObject({sign:"aries",displayDegrees:29.9});expect(readNatalCoordinate(30.01)).toMatchObject({sign:"taurus",displayDegrees:0});expect(natalWholeSignHouse(5,290)).toBe(4);
 const pairs=(moon:number)=>calculateNatalAspects(NATAL_BODIES.map((body,i)=>({body,coordinate:readNatalCoordinate(i===0?10:i===1?moon:100+i*20)})));
 const inside=pairs(78),outside=pairs(78.01);expect(inside.status).toBe("complete");expect(outside.status).toBe("complete");if(inside.status!=="complete"||outside.status!=="complete")throw Error("Missing complete inventory");expect(inside.comparisons).toBe(45);expect(inside.aspects.find(a=>a.id==="sun:moon")).toMatchObject({type:"sextile",orbDegrees:8});expect(outside.aspects.find(a=>a.id==="sun:moon")).toBeUndefined();
 const time=resolveNatalTime({knownTime:true,date:"2021-11-07",time:"01:30",zone:"America/New_York"},Date.parse("2026-10-28T00:00Z"));expect(time).toMatchObject({status:"choose-time",choices:[{utc:"2021-11-07T05:30:00Z"},{utc:"2021-11-07T06:30:00Z"}]});
});
it("preserves full source reading and opens the real birth-date field before optional metrics in both languages",()=>{
 const norm=(s:string)=>s.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
 for(const locale of ["en","zh"] as const){const d=document.createElement("div");d.innerHTML=renderToStaticMarkup(<NatalChartPage quiz={quiz} locale={locale}/>);const b=norm(d.textContent??"");
 expect(d.querySelectorAll("h1")).toHaveLength(1);expect(d.querySelector("#take-test input")?.id).toBe("natal-date");expect(d.querySelectorAll('[aria-labelledby="natal-faq"]>div')).toHaveLength(16);expect(d.querySelectorAll('[aria-labelledby="natal-guides"]>ul>li')).toHaveLength(12);expect(d.querySelectorAll(".explore-reading-section")).toHaveLength(8);expect(d.querySelector("details[data-natal-house-guide]")).toBeNull();expect(d.querySelectorAll("[data-natal-house-reference]")).toHaveLength(12);
 for(const s of [...quiz.guide,...natalLandingSections])for(const p of s.paragraphs)expect(b).toContain(norm(p[locale]));for(const f of [...quiz.faq,...natalLandingFaq]){expect(b).toContain(norm(f.question[locale]));expect(b).toContain(norm(f.answer[locale]));}
 expect(b).toContain(norm(quiz.instructions[locale]));expect(d.querySelector(".explore-intro")?.textContent).not.toContain(quiz.instructions[locale]);for(const a of d.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();if(locale==="en")expect(b).not.toMatch(/\p{Script=Han}/u);
 }
});
