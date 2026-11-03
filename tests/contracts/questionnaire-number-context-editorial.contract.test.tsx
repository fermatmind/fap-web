import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { NumberContextPage } from "@/components/questionnaires/NumberContextPage";
import { numberContextSections, numberContextFaq } from "@/components/questionnaires/NumberContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/number-context-reflection.json", "utf8")) as Questionnaire;
describe("number-context daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<NumberContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#number-context-methods")?.textContent).toBe(locale === "en" ? "Everyday numbers: quantities, steps, time, measures and prices" : "日常数字：数量、步骤、时间度量与价格信息");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-number-context-notebook]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-number-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="number-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="number-context-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(numberContextSections).toHaveLength(8);expect(numberContextFaq).toHaveLength(8);
    for(const s of numberContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="number-context-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
