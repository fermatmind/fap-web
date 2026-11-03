import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { BereavementPage } from "@/components/questionnaires/BereavementPage";
import { bereavementSections, bereavementFaq } from "@/components/questionnaires/BereavementLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/after-bereavement-reflection.json", "utf8")) as Questionnaire;
describe("bereavement editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<BereavementPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-bereavement-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="bereavement-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="bereavement-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(bereavementSections).toHaveLength(8);expect(bereavementFaq).toHaveLength(8);
    for(const s of bereavementSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="bereavement-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
