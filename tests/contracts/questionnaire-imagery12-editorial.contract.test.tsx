import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Imagery12Page } from "@/components/questionnaires/Imagery12Page";
import { imagery12LandingFaq, imagery12LandingSections } from "@/components/questionnaires/Imagery12LandingEditorial";
import type { Imagery12Questionnaire } from "@/lib/questionnaires/imagery12";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/aphantasia-test.json", "utf8")) as Imagery12Questionnaire;
describe("Imagery12 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Imagery12Page quiz={quiz} locale={locale} />);
    expect(imagery12LandingSections).toHaveLength(8);
    expect(imagery12LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...imagery12LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...imagery12LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.imagery12.attribution[locale]);
    expect(root.textContent).toContain(quiz.imagery12.editionNotice[locale]);
    expect(root.querySelectorAll(".imagery12-public-grid li")).toHaveLength(4);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
