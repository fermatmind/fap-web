import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { FeelingsConnectionPage } from "@/components/questionnaires/FeelingsConnectionPage";
import { feelingsConnectionSections, feelingsConnectionFaq, feelingsConnectionReadingSummaries } from "@/components/questionnaires/FeelingsConnectionLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/feelings-connection-reflection.json", "utf8")) as Questionnaire;
describe("feelings-connection daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<FeelingsConnectionPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#feelings-connection-methods")?.textContent).toBe(locale === "en" ? "Feelings and connection: context, category records and scope" : "感受与联系：情境、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-feelings-connection-open-pages]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-feelings-connection-full-guide]")).toHaveLength(2);
    expect(dom.querySelectorAll('[aria-labelledby="feelings-connection-library"] li')).toHaveLength(2);
    expect(dom.querySelectorAll('[aria-labelledby="feelings-connection-faq"] h3')).toHaveLength(10);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="feelings-connection-library"]')?.textContent).toContain(feelingsConnectionReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(feelingsConnectionReadingSummaries).map(t=>t[locale])).size).toBe(2);
    expect(feelingsConnectionSections).toHaveLength(8);expect(feelingsConnectionFaq).toHaveLength(8);
    for(const s of feelingsConnectionSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="feelings-connection-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
