import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { CycleContextPage } from "@/components/questionnaires/CycleContextPage";
import { cycleContextSections, cycleContextFaq, cycleContextReadingSummaries } from "@/components/questionnaires/CycleContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/menstrual-cycle-context-reflection.json", "utf8")) as Questionnaire;
describe("cycle-context daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<CycleContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#cycle-context-methods")?.textContent).toBe(locale === "en" ? "Menstrual-cycle context: recollection, categories and scope" : "月经周期情境：回忆、类别与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-cycle-context-recollection-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-cycle-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="cycle-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="cycle-context-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="cycle-context-library"]')?.textContent).toContain(cycleContextReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(cycleContextReadingSummaries).map(t=>t[locale])).size).toBe(4);
    expect(cycleContextSections).toHaveLength(8);expect(cycleContextFaq).toHaveLength(8);
    for(const s of cycleContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="cycle-context-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
