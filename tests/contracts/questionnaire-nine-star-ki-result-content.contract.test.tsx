import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NineStarYearClient } from "@/components/questionnaires/NineStarYearClient";
import { NineStarYearReport } from "@/components/questionnaires/NineStarYearReport";
import { NineStarYearGuidePage } from "@/components/questionnaires/NineStarYearPage";
import { calculateNineStarYearReference } from "@/lib/questionnaires/nineStarYearMethod";
import { isNineStarYearConfigurationValid, type NineStarYearProfile, type NineStarYearQuestionnaire, type NineStarReference } from "@/lib/questionnaires/nineStarYear";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nine-star-ki.json", "utf8")) as NineStarYearQuestionnaire;
const readings = quiz.profiles.map(p => ({ ...p, ...prepareResultProfile(quiz.slug, p) }));
const dom = (html: string) => { const d = document.createElement("div"); d.innerHTML = html; return d; };
const result = (year: number, side: string) => calculateNineStarYearReference(year, side) as NineStarReference;

describe("original Nine Star cultural readings alongside conditional year references", () => {
  it("preserves source configuration, identity and paragraphs while publishing all bilingual additions", () => {
    const before = JSON.stringify(quiz);
    expect(isNineStarYearConfigurationValid(quiz)).toBe(true);
    expect(isNineStarYearConfigurationValid({ ...quiz, profiles: readings })).toBe(false);
    for (const [i, p] of readings.entries()) {
      expect(prepareResultProfile(quiz.slug, p)).toBe(p);
      expect([p.id,p.star,p.title,p.seo]).toEqual([quiz.profiles[i].id,quiz.profiles[i].star,quiz.profiles[i].title,quiz.profiles[i].seo]);
      expect(p.sections.flatMap(s => s.paragraphs)).toHaveLength(10);
      for (const [j,s] of p.sections.entries()) expect(s.paragraphs.slice(0,quiz.profiles[i].sections[j].paragraphs.length)).toEqual(quiz.profiles[i].sections[j].paragraphs);
      for (const locale of ["en","zh"] as const) {
        const d = dom(renderToStaticMarkup(<NineStarYearGuidePage quiz={quiz} profile={p} locale={locale} />));
        expect(d.querySelectorAll("h1")).toHaveLength(1); expect(d.querySelectorAll("[data-nine-star-guide] h2")).toHaveLength(6);
        expect(d.querySelectorAll("[data-nine-star-guide] section > p")).toHaveLength(10);
        expect(d.querySelectorAll("[data-nine-star-guide] nav a")).toHaveLength(6);
        expect(d.querySelector("[data-nine-star-guide] nav")?.closest("details")).toBeNull();
        for (const a of d.querySelectorAll("[data-nine-star-guide] nav a")) expect(d.querySelector(a.getAttribute("href")!)).not.toBeNull();
        for (const s of p.sections) for (const para of s.paragraphs) expect(d.textContent).toContain(para[locale]);
        expect(d.querySelector("input,textarea,[data-nine-star-value],[data-nine-star-result],[data-nine-star-calculation]")).toBeNull();
        if (locale === "en") expect(d.textContent).not.toMatch(/\p{Script=Han}/u);
      }
    }
    expect(JSON.stringify(quiz)).toBe(before);
    const unknown={...quiz.profiles[0],id:"unknown"};expect(prepareResultProfile(quiz.slug,unknown)).toBe(unknown);
  });
  it("renders all381 supported year-side outcomes with the exact one or two complete guides", () => {
    let checks=0;
    for(let year=1900;year<=2026;year++)for(const side of ["before-boundary","after-boundary","uncertain"]){
      const value=result(year,side),d=dom(renderToStaticMarkup(<NineStarYearReport quiz={quiz} readingProfiles={readings} result={value} locale="en" />));
      expect([...d.querySelectorAll("[data-nine-star-value]")].map(n=>Number(n.getAttribute("data-nine-star-value")))).toEqual(value.candidates.map(c=>c.star));
      expect([...d.querySelectorAll("[data-nine-star-cultural-result-reading]")].map(n=>n.getAttribute("data-nine-star-cultural-result-reading"))).toEqual(value.candidates.map(c=>quiz.profiles[c.star-1].id));
      expect(d.querySelectorAll("[data-nine-star-guide] section > p")).toHaveLength(value.candidates.length*10);
      const ids=[...d.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);checks++;
    }
    expect(checks).toBe(381);
  });
  it("withholds mismatched profile, star, product or reading identity and retains raw fallback", () => {
    for(const bad of [undefined,[readings[1]],[{...readings[0],star:2}],[{...readings[0],resultReading:{...readings[0].resultReading!,quizSlug:"other"}}],[{...readings[0],resultReading:{...readings[0].resultReading!,profileId:"other"}}]] as (readonly NineStarYearProfile[]|undefined)[]){
      const d=dom(renderToStaticMarkup(<NineStarYearReport quiz={quiz} readingProfiles={bad} result={result(2026,"after-boundary")} locale="en" />));
      expect(d.querySelector("[data-nine-star-cultural-result-reading]")).toBeNull();expect(d.querySelectorAll("[data-nine-star-guide] section > p")).toHaveLength(7);
    }
    const bad=result(2026,"uncertain");bad.candidates[0].star=9;
    expect(dom(renderToStaticMarkup(<NineStarYearReport quiz={quiz} readingProfiles={readings} result={bad} locale="en" />)).querySelector("[data-nine-star-result]")).toBeNull();
  });
  it("requires a side, keeps both uncertain guides, copies only public links and clears memory on edits or language change", async () => {
    const writeText=vi.fn().mockRejectedValue(new Error("denied"));Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText}});
    const storage=vi.spyOn(Storage.prototype,"setItem"),network=vi.spyOn(globalThis,"fetch");
    const {container,rerender}=render(<NineStarYearClient quiz={quiz} readingProfiles={readings} locale="en" />);
    const calculate=()=>fireEvent.click(screen.getByRole("button",{name:"Show year reference"}));
    fireEvent.change(screen.getByLabelText("Gregorian year (four digits)"),{target:{value:"2025"}});calculate();
    expect(container.querySelector("[data-nine-star-result]")).toBeNull();expect(screen.getByRole("status")).toHaveTextContent("No side is selected");
    fireEvent.click(screen.getByRole("radio",{name:"Uncertain: keep both possibilities"}));calculate();
    expect(container.querySelectorAll("[data-nine-star-cultural-result-reading]")).toHaveLength(2);
    await act(async()=>fireEvent.click(screen.getByRole("button",{name:"Copy public guide links"})));
    const payload=[readings[2],readings[1]].map(p=>`${p.title.en}\nhttps://fermatmind.com/en/tests/explore/nine-star-ki/results/${p.id}`).join("\n\n");
    expect(writeText).toHaveBeenCalledWith(payload);expect(screen.getByLabelText("Text for manual copying")).toHaveValue(payload);expect(payload).not.toMatch(/2025|2024|before-boundary|uncertain|mod 9/);
    fireEvent.click(screen.getByRole("radio",{name:"Clearly after the displayed boundary"}));expect(container.querySelector("[data-nine-star-result]")).toBeNull();calculate();
    expect(container.querySelectorAll("[data-nine-star-cultural-result-reading]")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Gregorian year (four digits)"),{target:{value:"2027"}});calculate();expect(container.querySelector("[data-nine-star-result]")).toBeNull();
    rerender(<NineStarYearClient quiz={quiz} readingProfiles={readings} locale="zh" />);expect(screen.getByLabelText("公历年份（四位数字）")).toHaveValue("");
    expect(storage).not.toHaveBeenCalled();expect(network).not.toHaveBeenCalled();
  });
});
