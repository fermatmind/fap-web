import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Critical30Page } from "@/components/questionnaires/Critical30Page";
import { critical30LandingFaq, critical30LandingSections } from "@/components/questionnaires/Critical30LandingEditorial";
import type { Critical30Questionnaire } from "@/lib/questionnaires/critical30";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/watson-glaser-practice-test.json", "utf8")) as Critical30Questionnaire;
describe("Critical30 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Critical30Page quiz={quiz} locale={locale} />);
    expect(critical30LandingSections).toHaveLength(8);
    expect(critical30LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...critical30LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...critical30LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.critical30.attribution[locale]);
    expect(root.textContent).toContain(quiz.critical30.editionNotice[locale]);
    expect(root.querySelectorAll(".critical30-public-grid li")).toHaveLength(5);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of [...(quiz.references ?? [])]) expect(root.textContent).toContain(r.title[locale]);
  });
});
