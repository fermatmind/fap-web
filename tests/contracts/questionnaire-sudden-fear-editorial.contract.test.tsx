import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { SuddenFearPage } from "@/components/questionnaires/SuddenFearPage";
import { suddenFearSections, suddenFearFaq } from "@/components/questionnaires/SuddenFearLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sudden-fear-reflection.json", "utf8")) as Questionnaire;
describe("sudden fear editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<SuddenFearPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#sudden-fear-methods")?.textContent).toBe(locale === "en" ? "Sudden fear: four topics, category records and assessment context" : "突然恐惧：四个主题、类别记录与评估背景");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-sudden-fear-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="sudden-fear-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="sudden-fear-faq"] h3')).toHaveLength(14);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(suddenFearSections).toHaveLength(8);expect(suddenFearFaq).toHaveLength(8);
    for(const s of suddenFearSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="sudden-fear-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
