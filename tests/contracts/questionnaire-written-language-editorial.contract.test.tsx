import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { WrittenLanguagePage } from "@/components/questionnaires/WrittenLanguagePage";
import { writtenLanguageSections, writtenLanguageFaq } from "@/components/questionnaires/WrittenLanguageLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/written-language-context-reflection.json", "utf8")) as Questionnaire;
describe("written-language daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<WrittenLanguagePage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#written-language-methods")?.textContent).toBe(locale === "en" ? "Reading and writing: daily context, category records and assessment context" : "阅读与书写：日常情境、类别读法与评估背景");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-written-language-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-written-language-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="written-language-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="written-language-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(writtenLanguageSections).toHaveLength(8);expect(writtenLanguageFaq).toHaveLength(8);
    for(const s of writtenLanguageSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="written-language-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
