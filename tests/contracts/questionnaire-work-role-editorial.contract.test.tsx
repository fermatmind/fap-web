import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/work-role-reflection.json";
import catalog from "@/lib/questionnaires/catalog.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { recordWorkRole12 } from "@/lib/questionnaires/workRole12";
import { workRoleLandingSections, workRoleLandingFaq } from "@/components/questionnaires/WorkRoleLandingEditorial";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("Work role individual bilingual editorial", () => {
  it("preserves task identity when equal distributions describe different instances", () => {
    const result = (states: string[]) => {
      const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, states[i % 4]]));
      const r = recordWorkRole12(quiz, answers);
      if (r.status !== "complete") throw Error("Rejected example");
      return r;
    };
    const a = result(["guided", "owned", "owned", "na"]), b = result(["owned", "guided", "owned", "na"]);
    expect(a.workRole[0].counts).toEqual({ guided: 1, owned: 2, supported: 0, na: 1 });
    expect(a.workRole[0].counts).toEqual(b.workRole[0].counts);
    expect(a.workRole[0].rows).not.toEqual(b.workRole[0].rows);
    expect(result(["na", "na", "na", "na"]).workRole[0].counts).toEqual({ guided: 0, owned: 0, supported: 0, na: 4 });
    expect(Object.keys(a).sort()).toEqual(["answered", "status", "workRole"]);
  });
  it.each(["en", "zh"] as const)("renders all original and new copy with direct entry in %s", async locale => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ locale, slug: quiz.slug }) }));
    const norm = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    const body = norm(dom.textContent ?? "");
    expect(workRoleLandingSections).toHaveLength(8);
    expect(workRoleLandingFaq).toHaveLength(8);
    for (const s of [...quiz.guide, ...workRoleLandingSections]) for (const p of s.paragraphs) expect(body).toContain(norm(p[locale]));
    const library = norm(dom.querySelector(".explore-reading-library")?.textContent ?? "");
    for (const s of quiz.guide) for (const p of s.paragraphs) expect(library).not.toContain(norm(p[locale]));
    for (const f of [...quiz.faq, ...workRoleLandingFaq]) expect(body).toContain(norm(f.answer[locale]));
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
    expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(3);
    expect(dom.querySelector('.explore-intro [data-explore-start]')).not.toBeNull();
    expect(dom.querySelector('input[required]')).toBeNull();
    expect(dom.querySelector('a[href="#work-role-reflection-reference-3"]')).not.toBeNull();
    expect(dom.querySelector('#work-role-reflection-reference-3')).not.toBeNull();
    expect(catalog.find(q => q.slug === quiz.slug)?.description).toEqual(quiz.description);
  });
});
