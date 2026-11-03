import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { UncertaintyEasePage } from "@/components/questionnaires/UncertaintyEasePage";
import { uncertaintyEaseSections, uncertaintyEaseFaq, uncertaintyEaseReadingSummaries } from "@/components/questionnaires/UncertaintyEaseLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/uncertainty-ease-reflection.json", "utf8")) as Questionnaire;
describe("uncertainty-ease daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<UncertaintyEasePage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#uncertainty-ease-methods")?.textContent).toBe(locale === "en" ? "Ease with uncertainty: experience, categories and evidence" : "面对未知的自在感：体验、类别与证据");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-uncertainty-ease-open-arrangement]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-uncertainty-ease-full-guide]")).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="uncertainty-ease-library"] li')).toHaveLength(1);
    expect(dom.querySelectorAll('[aria-labelledby="uncertainty-ease-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="uncertainty-ease-library"]')?.textContent).toContain(uncertaintyEaseReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(uncertaintyEaseReadingSummaries).map(t=>t[locale])).size).toBe(1);
    expect(uncertaintyEaseSections).toHaveLength(8);expect(uncertaintyEaseFaq).toHaveLength(8);
    for(const s of uncertaintyEaseSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="uncertainty-ease-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
