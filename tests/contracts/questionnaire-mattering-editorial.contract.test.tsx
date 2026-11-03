import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Mattering10Page } from "@/components/questionnaires/Mattering10Page";
import { matteringLandingFaq, matteringLandingSections } from "@/components/questionnaires/MatteringLandingEditorial";
import type { Mattering10Questionnaire } from "@/lib/questionnaires/mattering10";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/mattering.json", "utf8")) as Mattering10Questionnaire;
describe("Mattering10 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Mattering10Page quiz={quiz} locale={locale} />);
    expect(matteringLandingSections).toHaveLength(8);
    expect(matteringLandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...matteringLandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...matteringLandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.querySelectorAll(".mattering10-public-grid li")).toHaveLength(2);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
