import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CatQ25Page } from "@/components/questionnaires/CatQ25Page";
import { catQ25LandingFaq, catQ25LandingSections } from "@/components/questionnaires/CatQ25LandingEditorial";
import type { CatQ25Questionnaire } from "@/lib/questionnaires/catq25";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/masking-test.json", "utf8")) as CatQ25Questionnaire;
describe("CAT-Q researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<CatQ25Page quiz={quiz} locale={locale} />);
    expect(catQ25LandingSections).toHaveLength(8);
    expect(catQ25LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...catQ25LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...catQ25LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.catq25.attribution[locale]);
    expect(root.textContent).toContain(quiz.catq25.editionNotice[locale]);
    expect(root.querySelectorAll(".catq25-public-grid li")).toHaveLength(4);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
