import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { DrinkingExperiencesPage } from "@/components/questionnaires/DrinkingExperiencesPage";
import { drinkingExperiencesSections, drinkingExperiencesFaq } from "@/components/questionnaires/DrinkingExperiencesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/drinking-experiences-reflection.json", "utf8")) as Questionnaire;
describe("drinking-experiences daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<DrinkingExperiencesPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#drinking-experiences-methods")?.textContent).toBe(locale === "en" ? "Drinking experiences: four-week reflection, category records and scope" : "饮酒经历：四周回顾、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-drinking-experiences-notes]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-drinking-experiences-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="drinking-experiences-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="drinking-experiences-faq"] h3')).toHaveLength(12);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(drinkingExperiencesSections).toHaveLength(8);expect(drinkingExperiencesFaq).toHaveLength(8);
    for(const s of drinkingExperiencesSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="drinking-experiences-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
