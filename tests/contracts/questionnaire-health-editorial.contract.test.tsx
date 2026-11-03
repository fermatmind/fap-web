import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { HealthWorryPage } from "@/components/questionnaires/HealthWorryPage";
import { healthWorrySections, healthWorryFaq } from "@/components/questionnaires/HealthWorryLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/health-worries-reflection.json", "utf8")) as Questionnaire;
describe("health worries editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<HealthWorryPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#health-worry-methods")?.textContent).toBe(locale === "en" ? "Health worries: three topics, category records and assessment context" : "健康担忧：三个主题、类别记录与评估背景");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-health-worry-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="health-worry-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="health-worry-faq"] h3')).toHaveLength(14);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(healthWorrySections).toHaveLength(8);expect(healthWorryFaq).toHaveLength(8);
    for(const s of healthWorrySections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="health-worry-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
