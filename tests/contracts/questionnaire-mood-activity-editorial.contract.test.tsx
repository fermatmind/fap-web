import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { MoodActivityPage } from "@/components/questionnaires/MoodActivityPage";
import { moodActivitySections, moodActivityFaq, moodActivityReadingSummaries } from "@/components/questionnaires/MoodActivityLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/mood-activity-changes-reflection.json", "utf8")) as Questionnaire;
describe("mood-activity daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<MoodActivityPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#mood-activity-methods")?.textContent).toBe(locale === "en" ? "Mood and activity: period, category records and scope" : "心情与活动：时段、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-mood-activity-context-cards]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-mood-activity-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="mood-activity-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="mood-activity-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="mood-activity-library"]')?.textContent).toContain(moodActivityReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(moodActivityReadingSummaries).map(t=>t[locale])).size).toBe(4);
    expect(moodActivitySections).toHaveLength(8);expect(moodActivityFaq).toHaveLength(8);
    for(const s of moodActivitySections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="mood-activity-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
