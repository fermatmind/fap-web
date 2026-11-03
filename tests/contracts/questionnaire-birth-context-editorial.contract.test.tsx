import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { BirthContextPage } from "@/components/questionnaires/BirthContextPage";
import { birthContextSections, birthContextFaq, birthContextReadingSummaries } from "@/components/questionnaires/BirthContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/after-childbirth-context-reflection.json", "utf8")) as Questionnaire;
describe("birth-context daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<BirthContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#birth-context-methods")?.textContent).toBe(locale === "en" ? "After childbirth: recollections, records and evidence" : "分娩之后：回忆、记录与研究证据");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-birth-context-recollection-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-birth-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="birth-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="birth-context-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="birth-context-library"]')?.textContent).toContain(birthContextReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(birthContextReadingSummaries).map(t=>t[locale])).size).toBe(4);
    expect(birthContextSections).toHaveLength(8);expect(birthContextFaq).toHaveLength(8);
    for(const s of birthContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="birth-context-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
