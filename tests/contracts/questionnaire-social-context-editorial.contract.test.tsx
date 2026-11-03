import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { SocialContextPage } from "@/components/questionnaires/SocialContextPage";
import { socialContextSections, socialContextFaq } from "@/components/questionnaires/SocialContextLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/social-context-reflection.json", "utf8")) as Questionnaire;
describe("social-context daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<SocialContextPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#social-context-methods")?.textContent).toBe(locale === "en" ? "Social situations: being seen, conversations, plans and sensations" : "社交场景：被注视、谈话、计划与感觉");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-social-context-dialogue]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-social-context-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="social-context-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="social-context-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(socialContextSections).toHaveLength(8);expect(socialContextFaq).toHaveLength(8);
    for(const s of socialContextSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="social-context-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
