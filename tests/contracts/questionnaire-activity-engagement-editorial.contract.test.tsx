import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { ActivityEngagementPage } from "@/components/questionnaires/ActivityEngagementPage";
import { activityLandingSections, activityLandingFaq } from "@/components/questionnaires/ActivityEngagementLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/activity-engagement-patterns.json", "utf8")) as Questionnaire;
describe("activity-engagement editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<ActivityEngagementPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-activity-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="activity-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="activity-faq"] h3')).toHaveLength(15);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(activityLandingSections).toHaveLength(8);expect(activityLandingFaq).toHaveLength(8);
    for(const s of activityLandingSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="activity-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
