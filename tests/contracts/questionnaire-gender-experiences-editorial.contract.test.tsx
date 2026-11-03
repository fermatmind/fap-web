import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { GenderExperiencesPage } from "@/components/questionnaires/GenderExperiencesPage";
import { genderExperiencesSections, genderExperiencesFaq, genderExperiencesReadingSummaries } from "@/components/questionnaires/GenderExperiencesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/gender-experiences-reflection.json", "utf8")) as Questionnaire;
describe("gender-experiences daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<GenderExperiencesPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#gender-experiences-methods")?.textContent).toBe(locale === "en" ? "Gender experiences: context, category records and scope" : "性别经历：语境、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-gender-experiences-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-gender-experiences-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="gender-experiences-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="gender-experiences-faq"] h3')).toHaveLength(12);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="gender-experiences-library"]')?.textContent).toContain(genderExperiencesReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(genderExperiencesReadingSummaries).map(t=>t[locale])).size).toBe(4);
    expect(genderExperiencesSections).toHaveLength(8);expect(genderExperiencesFaq).toHaveLength(8);
    for(const s of genderExperiencesSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="gender-experiences-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
