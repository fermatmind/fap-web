import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/values.json";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireValuesReport } from "@/components/questionnaires/QuestionnaireValuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;

describe("individual Schwartz ten-value editorial", () => {
  it("reproduces both raw-four examples and keeps a missing baseline separate from complete parts", () => {
    const render = (other: string, missing = false) => {
      const answers = Object.fromEntries(quiz.questions.map(q => [q.id, q.options[0].directionId === "self-direction" ? "4" : other]));
      if (missing) answers[quiz.questions[0].id] = "na";
      const result = scoreQuestionnaire(quiz, answers);
      if (result.status !== "complete" || !("facets" in result)) throw new Error("Complete witness rejected");
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(<QuestionnaireValuesReport quiz={quiz} result={result} locale="en" />);
      return dom;
    };
    const low = render("5"), high = render("1");
    for (const dom of [low, high]) expect(dom.querySelector('[data-values-facet="self-direction"] [data-values-mean]')?.textContent).toBe("4.00 / 5");
    expect(low.querySelector("[data-values-baseline]")?.textContent).toBe("4.90");
    expect(low.querySelector('[data-values-facet="self-direction"] [data-values-relative]')?.textContent).toBe("-0.90");
    expect(high.querySelector("[data-values-baseline]")?.textContent).toBe("1.30");
    expect(high.querySelector('[data-values-facet="self-direction"] [data-values-relative]')?.textContent).toBe("+2.70");
    const missing = render("5", true);
    expect(missing.querySelector("[data-values-baseline]")?.textContent).toBe("Insufficient information");
    expect(missing.querySelector('[data-values-facet="stimulation"] [data-values-mean]')?.textContent).toBe("5.00 / 5");
    for(const e of missing.querySelectorAll("[data-values-relative]")) expect(e.textContent).toBe("Insufficient information");
  });
  it("renders fixed-sum examples, context distinctions and research scope, source citations and all bilingual readings", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(quiz.seoTitle.en).not.toContain("| FermatMind");
    expect(quiz.seoTitle.zh).not.toContain("| FermatMind");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      const summaries = quiz.profiles.map(profile => profile.summary[locale]);
      expect(new Set(summaries).size).toBe(10);
      for (const summary of summaries) expect(dom.textContent).toContain(summary);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(10);
      expect(dom.querySelector("#questionnaire-results")?.textContent).toContain(locale === "zh" ? "十类价值观结果" : "Ten value results");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (text: string) => text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const body = normalize(dom.textContent ?? "");
      for (const section of quiz.guide) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      expect(body).toContain(locale === "zh" ? "这份测试不保存答题进度" : "This quiz does not save your progress");
      expect(body).not.toMatch(/24小时|24 hours|opt-in tab progress|optional tab progress/i);
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelector('a[href="#values-reference-2"]')).not.toBeNull();
      expect(body).toContain(locale === "zh" ? "相对值为+2.70" : "relative value +2.70");

      if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
