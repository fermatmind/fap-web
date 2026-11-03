import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { CommunicationRoutinesPage } from "@/components/questionnaires/CommunicationRoutinesPage";
import { communicationRoutinesSections, communicationRoutinesFaq, communicationRoutinesReadingSummaries } from "@/components/questionnaires/CommunicationRoutinesLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/communication-routines-context.json", "utf8")) as Questionnaire;
describe("communication-routines daily context editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<CommunicationRoutinesPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#communication-routines-methods")?.textContent).toBe(locale === "en" ? "Communication and routines: context, records and scope" : "沟通与日常安排：情境、类别记录与使用范围");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelector(".explore-intro-content [data-explore-start]")).not.toBeNull();
    expect(dom.querySelector("[data-communication-routines-board]")).not.toBeNull();
    expect(dom.querySelectorAll("input[type=checkbox],details p,details section,details article,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-communication-routines-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="communication-routines-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="communication-routines-faq"] h3')).toHaveLength(10);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    for(const p of quiz.profiles) expect(dom.querySelector('[aria-labelledby="communication-routines-library"]')?.textContent).toContain(communicationRoutinesReadingSummaries[p.id][locale]);
    expect(new Set(Object.values(communicationRoutinesReadingSummaries).map(t=>t[locale])).size).toBe(5);
    expect(communicationRoutinesSections).toHaveLength(8);expect(communicationRoutinesFaq).toHaveLength(8);
    for(const s of communicationRoutinesSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="communication-routines-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
