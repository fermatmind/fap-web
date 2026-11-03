import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { ConnectionMeaningPage } from "@/components/questionnaires/ConnectionMeaningPage";
import { connectionMeaningSections, connectionMeaningFaq } from "@/components/questionnaires/ConnectionMeaningLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/connection-meaning-reflection.json", "utf8")) as Questionnaire;
describe("connection-meaning editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<ConnectionMeaningPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-connection-meaning-full-guide]")).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="connection-meaning-library"] li')).toHaveLength(5);
    expect(dom.querySelectorAll('[aria-labelledby="connection-meaning-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(connectionMeaningSections).toHaveLength(8);expect(connectionMeaningFaq).toHaveLength(8);
    for(const s of connectionMeaningSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="connection-meaning-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
