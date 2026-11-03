import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { BodyFrameObservationsPage } from "@/components/questionnaires/BodyFrameObservationsPage";
import { bodyFrameSections, bodyFrameFaq } from "@/components/questionnaires/BodyFrameLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/body-frame-observations.json", "utf8")) as Questionnaire;
describe("body-frame editorial and complete public landing", () => {
  it.each(["en", "zh"] as const)("retains all source guides and bespoke explanations in %s", locale => {
    const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<BodyFrameObservationsPage quiz={quiz} locale={locale} />);
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelectorAll("[data-explore-start]")).toHaveLength(1);
    expect(dom.querySelectorAll("input[type=checkbox],details,textarea")).toHaveLength(0);
    expect(dom.querySelectorAll("[data-body-frame-full-guide]")).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="body-frame-library"] li')).toHaveLength(3);
    expect(dom.querySelectorAll('[aria-labelledby="body-frame-faq"] h3')).toHaveLength(13);
    for(const p of quiz.profiles) for(const s of p.sections) for(const paragraph of s.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
    expect(bodyFrameSections).toHaveLength(8);expect(bodyFrameFaq).toHaveLength(8);
    for(const s of bodyFrameSections) for(const p of s.paragraphs) expect(dom.textContent).toContain(p[locale]);
    expect(dom.querySelectorAll('[id^="body-frame-reference-"]')).toHaveLength(2);
    const ids=[...dom.querySelectorAll("[id]")].map(n=>n.id);expect(new Set(ids).size).toBe(ids.length);
  });
});
