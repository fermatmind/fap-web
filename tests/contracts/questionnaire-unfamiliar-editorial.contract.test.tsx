import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { UnfamiliarPage } from "@/components/questionnaires/UnfamiliarPage";
import { unfamiliarSections, unfamiliarFaq, unfamiliarReadingSummaries } from "@/components/questionnaires/UnfamiliarLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/unfamiliar-experiences-reflection.json", "utf8")) as Questionnaire;
describe("unfamiliar daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<UnfamiliarPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#unfamiliar-methods")?.textContent).toBe(locale === "en" ? "Unfamiliar experiences: meaning, records and evidence" : "陌生体验：含义、记录与研究证据");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-unfamiliar-five-notes]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-unfamiliar-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="unfamiliar-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="unfamiliar-faq"] h3')).toHaveLength(10);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="unfamiliar-library"]')?.textContent).toContain(unfamiliarReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(unfamiliarReadingSummaries).map(t=>t[locale])).size).toBe(5);
    expect(unfamiliarSections).toHaveLength(8);expect(unfamiliarFaq).toHaveLength(8);
    for(const s of unfamiliarSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="unfamiliar-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
