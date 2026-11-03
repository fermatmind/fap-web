import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { RecentMoodPage } from "@/components/questionnaires/RecentMoodPage";
import { recentMoodSections, recentMoodFaq, recentMoodReadingSummaries } from "@/components/questionnaires/RecentMoodLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/recent-mood-reflection.json", "utf8")) as Questionnaire;
describe("recent-mood daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<RecentMoodPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#recent-mood-methods")?.textContent).toBe(locale === "en" ? "Recent mood: context, category records and interpretation" : "近期心情：经历、类别记录与结果读法");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-recent-mood-windows]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-recent-mood-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="recent-mood-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="recent-mood-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="recent-mood-library"]')?.textContent).toContain(recentMoodReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(recentMoodReadingSummaries).map(t=>t[locale])).size).toBe(3);
    expect(recentMoodSections).toHaveLength(8);expect(recentMoodFaq).toHaveLength(8);
    for(const s of recentMoodSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="recent-mood-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
