import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { StyleImpressionPage } from "@/components/questionnaires/StyleImpressionPage";
import { styleLandingSections, styleLandingFaq } from "@/components/questionnaires/StyleImpressionLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/style-impression-preferences.json", "utf8")) as Questionnaire;
describe("whole-look editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<StyleImpressionPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-style-full-guide]")).toHaveLength(8);
    expect(dom.querySelectorAll('[aria-labelledby="style-library"] li')).toHaveLength(8);
    expect(dom.querySelectorAll('[aria-labelledby="style-faq"] h3')).toHaveLength(14);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(styleLandingSections).toHaveLength(8);expect(styleLandingFaq).toHaveLength(8);
    for(const s of styleLandingSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="style-reference-"]')).toHaveLength(3);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
