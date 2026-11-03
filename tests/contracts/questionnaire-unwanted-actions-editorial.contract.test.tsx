import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { UnwantedActionsPage } from "@/components/questionnaires/UnwantedActionsPage";
import { unwantedActionsSections, unwantedActionsFaq } from "@/components/questionnaires/UnwantedActionsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/unwanted-thoughts-actions-reflection.json", "utf8")) as Questionnaire;
describe("unwanted thoughts and actions editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<UnwantedActionsPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#unwanted-actions-methods")?.textContent).toBe(locale === "en" ? "Thoughts and actions: five topics, category records and assessment context" : "想法与动作：五个主题、类别记录与评估背景");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-unwanted-actions-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="unwanted-actions-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="unwanted-actions-faq"] h3')).toHaveLength(14);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(unwantedActionsSections).toHaveLength(8);expect(unwantedActionsFaq).toHaveLength(8);
    for(const s of unwantedActionsSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="unwanted-actions-reference-"]')).toHaveLength(3);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
