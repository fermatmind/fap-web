import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { CaregiverContextPage } from "@/components/questionnaires/CaregiverContextPage";
import { caregiverContextSections, caregiverContextFaq } from "@/components/questionnaires/CaregiverContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/child-focus-activity-observations.json", "utf8")) as Questionnaire;
describe("caregiver-context daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<CaregiverContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#caregiver-context-methods")?.textContent).toBe(locale === "en" ? "Caregiver observations: context, category records and professional assessment" : "儿童日常观察：情境、类别记录与专业评估的区别");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-caregiver-context-scenes]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-caregiver-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="caregiver-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="caregiver-context-faq"] h3')).toHaveLength(11);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(caregiverContextSections).toHaveLength(8);expect(caregiverContextFaq).toHaveLength(8);
    for(const s of caregiverContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="caregiver-context-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
