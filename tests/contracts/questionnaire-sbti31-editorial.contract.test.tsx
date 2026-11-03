import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/sbti-test.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { Sbti31Page } from "@/components/questionnaires/Sbti31Page";
import { sbti31LandingFaq, sbti31LandingSections } from "@/components/questionnaires/Sbti31LandingEditorial";
import type { Sbti31Questionnaire } from "@/lib/questionnaires/sbti31";
import engine from "@/lib/questionnaires/sbti31Engine.cjs";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Sbti31Questionnaire;
describe("SBTI original31 individual bilingual editorial", () => {
  it("checks the illustrative display calculation and the original band boundaries", () => {
    const vector = Object.fromEntries(Object.keys(engine.SBTI_RESULT_PROFILES[0].centroid).map(key => [key, 50]));
    Object.assign(vector, { stability: 60, initiative: 70, signal_sensitivity: 40 });
    expect(engine.mapSbtiScoreToResultDimensions(vector).S1).toBe(63);
    expect([39, 40, 69, 70].map(value => engine.getSbtiDimensionCards({ ...vector, stability: value, initiative: value, signal_sensitivity: 100 - value }, engine.SBTI_RESULT_PROFILES[0]).find(card => card.key === "S1")?.band)).toEqual(["L", "M", "M", "H"]);
  });
  it.each(["en", "zh"] as const)("keeps complete prose and direct original31 entry in %s", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<Sbti31Page quiz={quiz} locale={locale} />);
    const norm = (s: string) => s.replace(/\s+/g, " ").trim();
    const body = norm(dom.textContent ?? "");
    expect(sbti31LandingSections).toHaveLength(8);
    expect(sbti31LandingFaq).toHaveLength(8);
    expect([...quiz.faq, ...sbti31LandingFaq]).toHaveLength(14);
    for (const section of [...quiz.guide, ...sbti31LandingSections]) for (const p of section.paragraphs) expect(body).toContain(norm(p[locale]));
    for (const f of [...quiz.faq, ...sbti31LandingFaq]) expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll(".sbti31-public-grid > li")).toHaveLength(25);
    for (const p of quiz.profiles) expect(body).toContain(norm(p.summary[locale]));
    expect(dom.querySelector(".explore-intro [data-explore-start]")?.textContent).toBe(locale === "zh" ? "开始31题" : "Start 31 questions");
    expect(dom.querySelector("input[required]")).toBeNull();
    expect(dom.querySelector(".explore-reading-library details")).toBeNull();
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
  });
});
