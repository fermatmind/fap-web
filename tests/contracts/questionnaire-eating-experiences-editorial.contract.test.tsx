import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { EatingExperiencesPage } from "@/components/questionnaires/EatingExperiencesPage";
import { eatingExperiencesSections, eatingExperiencesFaq, eatingExperiencesReadingSummaries } from "@/components/questionnaires/EatingExperiencesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/eating-experiences-reflection.json", "utf8")) as Questionnaire;
describe("eating-experiences daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<EatingExperiencesPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#eating-experiences-methods")?.textContent).toBe(locale === "en" ? "Eating experiences: context, category records and scope" : "进食经历：语境、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-eating-experiences-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-eating-experiences-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="eating-experiences-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="eating-experiences-faq"] h3')).toHaveLength(12);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="eating-experiences-library"]')?.textContent).toContain(eatingExperiencesReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(eatingExperiencesReadingSummaries).map(t=>t[locale])).size).toBe(5);
    expect(eatingExperiencesSections).toHaveLength(8);expect(eatingExperiencesFaq).toHaveLength(8);
    for(const s of eatingExperiencesSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="eating-experiences-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
