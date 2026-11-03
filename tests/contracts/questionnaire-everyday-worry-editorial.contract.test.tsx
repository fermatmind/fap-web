import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { EverydayWorryPage } from "@/components/questionnaires/EverydayWorryPage";
import { everydayWorrySections, everydayWorryFaq } from "@/components/questionnaires/EverydayWorryLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/everyday-worry-reflection.json", "utf8")) as Questionnaire;
describe("everyday-worry daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<EverydayWorryPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#everyday-worry-methods")?.textContent).toBe(locale === "en" ? "Everyday worry: recent recollections, category records and scope" : "日常担心：近期回顾、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-everyday-worry-recollection]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-everyday-worry-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="everyday-worry-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="everyday-worry-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(everydayWorrySections).toHaveLength(8);expect(everydayWorryFaq).toHaveLength(8);
    for(const s of everydayWorrySections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="everyday-worry-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
