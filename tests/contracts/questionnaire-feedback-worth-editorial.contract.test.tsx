import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { FeedbackWorthPage } from "@/components/questionnaires/FeedbackWorthPage";
import { feedbackWorthSections, feedbackWorthFaq, feedbackWorthReadingSummaries } from "@/components/questionnaires/FeedbackWorthLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/feedback-self-worth-reflection.json", "utf8")) as Questionnaire;
describe("feedback-worth daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<FeedbackWorthPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#feedback-worth-methods")?.textContent).toBe(locale === "en" ? "Feedback and self-worth: context, category records and scope" : "反馈与自我价值感：语境、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-feedback-worth-topic-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-feedback-worth-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="feedback-worth-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="feedback-worth-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="feedback-worth-library"]')?.textContent).toContain(feedbackWorthReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(feedbackWorthReadingSummaries).map(t=>t[locale])).size).toBe(3);
    expect(feedbackWorthSections).toHaveLength(8);expect(feedbackWorthFaq).toHaveLength(8);
    for(const s of feedbackWorthSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="feedback-worth-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
