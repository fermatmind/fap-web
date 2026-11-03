import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { CareFeelingsPage } from "@/components/questionnaires/CareFeelingsPage";
import { careFeelingsSections, careFeelingsFaq } from "@/components/questionnaires/CareFeelingsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/care-feelings-reflection.json", "utf8")) as Questionnaire;
describe("care-feelings daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<CareFeelingsPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#care-feelings-methods")?.textContent).toBe(locale === "en" ? "Care and feelings: recall windows, category records and present support" : "照护与感受：回忆窗口、类别读法与当下支持");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-care-feelings-recollections]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-care-feelings-full-guide]")).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="care-feelings-library"] li')).toHaveLength(4);
    expect(dom.querySelectorAll('[aria-labelledby="care-feelings-faq"] h3')).toHaveLength(11);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(careFeelingsSections).toHaveLength(8);expect(careFeelingsFaq).toHaveLength(8);
    for(const s of careFeelingsSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="care-feelings-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
