import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Technical30Page } from "@/components/questionnaires/Technical30Page";
import { technical30LandingFaq, technical30LandingSections } from "@/components/questionnaires/Technical30LandingEditorial";
import type { Technical30Questionnaire } from "@/lib/questionnaires/technical30";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/asvab-science-mechanical-practice-test.json", "utf8")) as Technical30Questionnaire;
describe("Technical30 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Technical30Page quiz={quiz} locale={locale} />);
    expect(technical30LandingSections).toHaveLength(8);
    expect(technical30LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...technical30LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...technical30LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.technical30.attribution[locale]);
    expect(root.textContent).toContain(quiz.technical30.editionNotice[locale]);
    expect(root.querySelectorAll(".technical30-public-grid li")).toHaveLength(5);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
