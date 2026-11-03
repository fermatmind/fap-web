import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Dvmsq18Page } from "@/components/questionnaires/Dvmsq18Page";
import { dvmsq18LandingFaq, dvmsq18LandingSections } from "@/components/questionnaires/Dvmsq18LandingEditorial";
import type { Dvmsq18Questionnaire } from "@/lib/questionnaires/dvmsq18";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/misophonia-screener.json", "utf8")) as Dvmsq18Questionnaire;
describe("Dvmsq18 researched bilingual entry", () => {
  it.each(["en", "zh"] as const)("retains original content, source credit and direct entry in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<Dvmsq18Page quiz={quiz} locale={locale} />);
    expect(dvmsq18LandingSections).toHaveLength(8);
    expect(dvmsq18LandingFaq).toHaveLength(8);
    for (const section of [...quiz.guide, ...dvmsq18LandingSections]) {
      expect(root.textContent).toContain(section.title[locale]);
      for (const p of section.paragraphs) expect(root.textContent).toContain(p[locale]);
    }
    for (const f of [...quiz.faq, ...dvmsq18LandingFaq]) {
      expect(root.textContent).toContain(f.question[locale]);
      expect(root.textContent).toContain(f.answer[locale]);
    }
    expect(root.textContent).toContain(quiz.dvmsq18.attribution[locale]);
    expect(root.textContent).toContain(quiz.dvmsq18.editionNotice[locale]);
    expect(root.querySelectorAll(".dvmsq18-public-grid li")).toHaveLength(3);
    expect(root.querySelector(".explore-intro [data-explore-start]")).not.toBeNull();
    expect(root.querySelector("input[required]")).toBeNull();
    for (const r of quiz.references ?? []) expect(root.textContent).toContain(r.title[locale]);
  });
});
