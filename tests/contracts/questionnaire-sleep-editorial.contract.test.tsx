import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { SleepExperiencesPage } from "@/components/questionnaires/SleepExperiencesPage";
import { sleepExperiencesSections, sleepExperiencesFaq } from "@/components/questionnaires/SleepExperiencesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sleep-experiences-reflection.json", "utf8")) as Questionnaire;
describe("sleep experiences editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<SleepExperiencesPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#sleep-experiences-methods")?.textContent).toBe(locale === "en" ? "Sleep experiences: five topics, category records and assessment context" : "睡眠经历：五个主题、类别记录与评估背景");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-sleep-experiences-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="sleep-experiences-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="sleep-experiences-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(sleepExperiencesSections).toHaveLength(8);expect(sleepExperiencesFaq).toHaveLength(8);
    for(const s of sleepExperiencesSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="sleep-experiences-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
