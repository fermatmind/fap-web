import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { ConnectionIdealsPage } from "@/components/questionnaires/ConnectionIdealsPage";
import { connectionLandingSections, connectionLandingFaq } from "@/components/questionnaires/ConnectionIdealsLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/connection-ideals.json", "utf8")) as Questionnaire;
describe("connection-ideals editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<ConnectionIdealsPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#questionnaire-results")?.textContent).toBe(locale === "en" ? "Six complete public connection-ideal guides" : "六篇完整公开连接偏好指南");
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-connection-full-guide]")).toHaveLength(6);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] li')).toHaveLength(6);
    expect(dom.querySelectorAll('[aria-labelledby="connection-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(connectionLandingSections).toHaveLength(8);expect(connectionLandingFaq).toHaveLength(8);
    for(const s of connectionLandingSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="connection-reference-"]')).toHaveLength(1);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
