import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NatalChartClient } from "@/components/questionnaires/NatalChartClient";
import { NatalChartGuidePage } from "@/components/questionnaires/NatalChartPage";
import { NatalChartReport } from "@/components/questionnaires/NatalChartReport";
import { isNatalChartConfigurationValid, natalPublicLinks, type NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";
import { calculateNatalChart } from "@/lib/questionnaires/natalChartCalculation";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/natal-chart.json", "utf8")) as NatalChartQuestionnaire;
const readings = quiz.profiles.map(p => ({ ...p, ...prepareResultProfile(quiz.slug, p), id: p.id }));
const dom = (html: string) => { const d=document.createElement("div");d.innerHTML=html;return d; };
const input={date:"2001-06-15",time:"08:30",zone:"Europe/London",latitude:"51.5",longitude:"-0.1",knownTime:true,coordinatesConfirmed:true};
function chart(date=input.date,latitude=input.latitude){const r=calculateNatalChart({...input,date,latitude},Date.parse("2026-10-28T00:00:00Z"));if(r.status!=="complete")throw new Error(date);return r.chart;}
const added=(index:number,section:string,locale:"en"|"zh")=>readings[index].sections.find(s=>s.id===section)!.paragraphs[1][locale];

describe("twelve chart-symbol readings with distinct roles and unchanged astronomical calculation",()=>{
 it("preserves all frozen source content and public identities while exposing all72 bilingual module additions",()=>{
  const before=JSON.stringify(quiz);expect(isNatalChartConfigurationValid(quiz)).toBe(true);expect(isNatalChartConfigurationValid({...quiz,profiles:readings})).toBe(false);
  for(const [i,p]of readings.entries()){
   expect(prepareResultProfile(quiz.slug,p)).toBe(p);expect([p.id,p.signName,p.element,p.modality,p.glyph,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].signName,quiz.profiles[i].element,quiz.profiles[i].modality,quiz.profiles[i].glyph,quiz.profiles[i].seo]);
   expect(p.sections.map(s=>s.paragraphs.length)).toEqual([2,2,2,2,2,2]);for(const [j,s]of p.sections.entries())expect(s.paragraphs[0]).toEqual(quiz.profiles[i].sections[j].paragraphs[0]);
   for(const locale of ["en","zh"]as const){const d=dom(renderToStaticMarkup(<NatalChartGuidePage quiz={quiz} profile={p} locale={locale}/>));
    const reader=d.querySelector("[data-natal-symbol-result-reading]");expect(reader?.getAttribute("data-natal-symbol-result-reading")).toBe(p.id);
    expect(reader?.querySelectorAll("h2")).toHaveLength(6);expect(reader?.querySelectorAll("section > div > p:not(:only-child)")).toHaveLength(12);expect(reader?.querySelectorAll("details:not([open]) nav a")).toHaveLength(6);
    for(const s of p.sections)for(const para of s.paragraphs)expect(reader?.textContent).toContain(para[locale]);
    for(const a of reader!.querySelectorAll("nav a"))expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
    expect(d.querySelector("input,textarea,[data-natal-result],[data-natal-body],[data-natal-element],[data-natal-table]")).toBeNull();if(locale==="en")expect(d.textContent).not.toMatch(/\p{Script=Han}/u);
   }
  }
  expect(JSON.stringify(quiz)).toBe(before);const unknown={...quiz.profiles[0],id:"unknown"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
 });
 it("uses each actual calculated sign with its matching Sun, Moon, rising, body, angle and point context",()=>{
  const sunSigns=new Set<string>();let checked=0;
  for(let month=1;month<=12;month++){
   const value=chart(`2001-${String(month).padStart(2,"0")}-15`),before=JSON.stringify(value);sunSigns.add(value.placements[0].coordinate.sign);
   for(const locale of ["en","zh"]as const){const d=dom(renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={value} readingProfiles={readings} locale={locale}/>));
    for(const p of value.placements){const role=["sun","moon"].includes(p.body)?p.body:"symbol";expect(d.querySelector(`[data-natal-body-reading="${p.body}"]`)?.textContent).toContain(added(p.coordinate.signIndex,role,locale));}
    if(value.ascendant.status==="computed")expect(d.querySelector("[data-natal-rising-reading]")?.textContent).toContain(added(value.ascendant.coordinate.signIndex,"ascendant",locale));
    for(const [id,a]of Object.entries(value.angles))if(a.status==="computed")expect(d.querySelector(`[data-natal-angle-reading="${id}"]`)?.textContent).toContain(added(a.coordinate.signIndex,"symbol",locale));
    for(const [id,p]of Object.entries(value.points))if(p.status==="computed")expect(d.querySelector(`[data-natal-point-reading="${id}"]`)?.textContent).toContain(added(p.coordinate.signIndex,"symbol",locale));
    expect(d.querySelectorAll("[data-natal-body]")).toHaveLength(10);expect([...d.querySelectorAll("[data-natal-element]")].reduce((sum,n)=>sum+Number(n.textContent),0)).toBe(10);checked++;
   }
   expect(JSON.stringify(value)).toBe(before);
  }
  expect(sunSigns.size).toBe(12);expect(checked).toBe(24);
  const pole=chart(input.date,"90"),d=dom(renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={pole} readingProfiles={readings} locale="en"/>));expect(d.querySelector("[data-natal-rising-reading]")).toBeNull();expect(d.querySelectorAll("[data-natal-body-reading]")).toHaveLength(10);
 });
 it("retains raw role prose when a projection carries the wrong product, profile, element or modality",()=>{
  const value=chart(),i=value.placements[0].coordinate.signIndex,p=readings[i];
  const bad=[{...p,id:"aries"},{...p,element:"wrong"},{...p,modality:"wrong"},{...p,resultReading:{...p.resultReading!,quizSlug:"zodiac-sign-quiz"}},{...p,resultReading:{...p.resultReading!,profileId:"other"}}];
  for(const replacement of bad){const mapped=readings.map((item,j)=>j===i?replacement:item) as typeof readings;
   const d=dom(renderToStaticMarkup(<NatalChartReport quiz={quiz} chart={value} readingProfiles={mapped} locale="en"/>));expect(d.querySelector('[data-natal-body-reading="sun"]')?.textContent).not.toContain(added(i,"sun","en"));expect(d.querySelector('[data-natal-body-reading="sun"]')?.textContent).toContain(quiz.profiles[i].sections[1].paragraphs[0].en);
  }
 });
 it("renders additions through the real native client while copy and input lifetime remain public-only and memory-only",async()=>{
  const writeText=vi.fn().mockRejectedValue(new Error("denied"));Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
  const storage=vi.spyOn(Storage.prototype,"setItem"),network=vi.spyOn(globalThis,"fetch");const {container,rerender}=render(<NatalChartClient quiz={quiz} readingProfiles={readings} locale="en"/>);
  for(const [id,value]of [["date",input.date],["time",input.time],["latitude",input.latitude],["longitude",input.longitude],["zone",input.zone]])fireEvent.change(document.getElementById(`natal-${id}`)!,{target:{value}});
  fireEvent.click(document.getElementById("natal-confirm")!);fireEvent.click(screen.getByRole("button",{name:"Calculate this chart"}));
  await waitFor(()=>expect(container.querySelector('[data-natal-body-reading="sun"]')).toHaveTextContent(added(2,"sun","en")));
  await act(async()=>fireEvent.click(screen.getByRole("button",{name:"Copy public calculator and guide URLs"})));
  expect(writeText).toHaveBeenCalledWith(natalPublicLinks(quiz,"en"));expect(screen.getByLabelText("Public URLs for manual copying")).toHaveValue(natalPublicLinks(quiz,"en"));
  fireEvent.change(document.getElementById("natal-time")!,{target:{value:"09:00"}});expect(container.querySelector("[data-natal-result]")).toBeNull();
  rerender(<NatalChartClient quiz={quiz} readingProfiles={readings} locale="zh"/>);expect(document.getElementById("natal-date")).toHaveValue("");expect(container.querySelector("[data-natal-result]")).toBeNull();expect(storage).not.toHaveBeenCalled();expect(network).not.toHaveBeenCalled();
 });
});
