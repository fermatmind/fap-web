import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { EmotionsConnectionsPage } from "@/components/questionnaires/EmotionsConnectionsPage";
import { emotionsConnectionsSections, emotionsConnectionsFaq, emotionsConnectionsReadingSummaries } from "@/components/questionnaires/EmotionsConnectionsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/emotions-connections-reflection.json", "utf8")) as Questionnaire;
describe("emotions-connections daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<EmotionsConnectionsPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#emotions-connections-methods")?.textContent).toBe(locale === "en" ? "Emotions and connections: context, category records and scope" : "情绪与联结：语境、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-emotions-connections-topic-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-emotions-connections-full-guide]")).toHaveLength(7);
    expect(dom.querySelectorAll('[aria-labelledby="emotions-connections-library"] li')).toHaveLength(7);
    expect(dom.querySelectorAll('[aria-labelledby="emotions-connections-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="emotions-connections-library"]')?.textContent).toContain(emotionsConnectionsReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(emotionsConnectionsReadingSummaries).map(t=>t[locale])).size).toBe(7);
    expect(emotionsConnectionsSections).toHaveLength(8);expect(emotionsConnectionsFaq).toHaveLength(8);
    for(const s of emotionsConnectionsSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="emotions-connections-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
