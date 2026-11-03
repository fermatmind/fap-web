import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { FocusContextPage } from "@/components/questionnaires/FocusContextPage";
import { focusContextSections, focusContextFaq } from "@/components/questionnaires/FocusContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/focus-energy-context-reflection.json", "utf8")) as Questionnaire;
describe("attention and daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<FocusContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#focus-context-methods")?.textContent).toBe(locale === "en" ? "Daily context: four topics, category records and assessment context" : "日常情境：四个主题、类别记录与评估背景");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-focus-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="focus-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="focus-context-faq"] h3')).toHaveLength(14);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(focusContextSections).toHaveLength(8);expect(focusContextFaq).toHaveLength(8);
    for(const s of focusContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="focus-context-reference-"]')).toHaveLength(2);
    expect(dom.querySelector('[data-focus-context-existing-primary] a')?.getAttribute('href')).toBe(`/${locale}/tests/explore/executive-function`);
    expect(dom.querySelectorAll('[data-focus-context-existing-primary] li')).toHaveLength(3);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
