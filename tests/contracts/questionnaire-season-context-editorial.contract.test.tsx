import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { SeasonContextPage } from "@/components/questionnaires/SeasonContextPage";
import { seasonContextSections, seasonContextFaq, seasonContextReadingSummaries } from "@/components/questionnaires/SeasonContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/time-of-year-context-reflection.json", "utf8")) as Questionnaire;
describe("season-context daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<SeasonContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#season-context-methods")?.textContent).toBe(locale === "en" ? "Time of year: recollections, category records and evidence" : "一年中的时间：回忆、类别记录与研究证据");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-season-context-unfixed-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-season-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="season-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="season-context-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="season-context-library"]')?.textContent).toContain(seasonContextReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(seasonContextReadingSummaries).map(t=>t[locale])).size).toBe(4);
    expect(seasonContextSections).toHaveLength(8);expect(seasonContextFaq).toHaveLength(8);
    for(const s of seasonContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="season-context-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
