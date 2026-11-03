import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { Bpi21Page } from "@/components/questionnaires/Bpi21Page";
import { bpi21Sections, bpi21Faq } from "@/components/questionnaires/Bpi21LandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/prakriti-inventory21.json", "utf8")) as Questionnaire;
describe("bpi21 editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<Bpi21Page quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-bpi21-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="bpi21-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="bpi21-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(bpi21Sections).toHaveLength(8);expect(bpi21Faq).toHaveLength(8);
    for(const s of bpi21Sections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="bpi21-reference-"]')).toHaveLength(4);
    expect(dom.textContent).toContain("10.12688/wellcomeopenres.25166.2");
    expect(dom.textContent).toContain("CC BY 4.0");
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
