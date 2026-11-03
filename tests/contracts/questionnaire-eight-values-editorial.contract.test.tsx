import { DiscoveryCardArt } from "@/components/tests/DiscoveryCardArt";
import { eightValuesLandingSections, eightValuesLandingFaq } from "@/components/questionnaires/EightValuesLandingEditorial";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import raw from "@/lib/questionnaires/data/8-values-political.json";
import { scoreEightValuesQuestionnaire } from "@/lib/questionnaires/eightValues";
import { QuestionnaireEightValuesReport } from "@/components/questionnaires/QuestionnaireEightValuesReport";
import type { Questionnaire } from "@/lib/questionnaires/types";
import catalog from "@/lib/questionnaires/catalog.json";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = raw as Questionnaire;
describe("individual four-axis 8values editorial", () => {
  it("uses four paired rails and linked statement artwork", () => {
    const html = renderToStaticMarkup(<DiscoveryCardArt slug="8-values-political" category="framework" />);
    expect(html).toContain('data-composition="values-paired-rails:values-linked-statements:workspace"');
    expect(html).toContain('data-values-paired-rails="true"'); expect(html).toContain('data-values-linked-statements="true"');
  });
  it("reproduces cancellation and cross-axis examples with all eight complete guides", () => {
    for (const overrides of [{}, { E8_002: "5", E8_003: "5" }, { E8_001: "4" }]) {
      const answers = { ...Object.fromEntries(quiz.questions.map(q => [q.id, "3"])), ...overrides };
      const result = scoreEightValuesQuestionnaire(quiz, answers);
      if (result.status !== "complete") throw new Error("Editorial example rejected");
      const cross = "E8_001" in overrides;
      expect(Object.values(result.eightValuesAxes).map(s => s.sum)).toEqual(cross ? [5, 0, -2.5, 0] : [0, 0, 0, 0]);
      expect(Object.values(result.eightValuesAxes).map(s => s.percentage)).toEqual(cross ? [51.3, 50, 49.6, 50] : [50, 50, 50, 50]);
      expect(Object.values(result.eightValuesAxes).map(s => s.complement)).toEqual(cross ? [48.7, 50, 50.4, 50] : [50, 50, 50, 50]);
      for (const axis of Object.values(result.eightValuesAxes)) expect(axis.percentage + axis.complement).toBeCloseTo(100);
      expect(result).not.toHaveProperty("ideology"); expect(result).not.toHaveProperty("percentile");
      for (const locale of ["zh", "en"] as const) {
        const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<QuestionnaireEightValuesReport quiz={quiz} result={result} locale={locale} />);
        expect(dom.querySelectorAll("[data-eight-values-axis]")).toHaveLength(4);
        expect(dom.querySelectorAll("[data-eight-values-guide]")).toHaveLength(8); expect(dom.querySelectorAll("[data-eight-values-guide] h4")).toHaveLength(56);
        for (const p of quiz.profiles) for (const section of p.sections) for (const paragraph of section.paragraphs) expect(dom.textContent).toContain(paragraph[locale]);
      }
    }
  });
  it("renders all bilingual paragraphs, fourteen FAQs, license and resolving research citations", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    expect(catalog.find(item => item.slug === quiz.slug)?.description).toEqual(quiz.description);
    for (const locale of ["zh", "en"] as const) {
      const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(await entry.default({ params: Promise.resolve({ slug: quiz.slug, locale }) }));
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(8);
      expect(dom.querySelector("#questionnaire-purpose")?.textContent).toBe(locale === "zh" ? "8 Values测试探索什么？四轴与八个互补端点" : "What does the 8 Values Test explore? Four axes and eight poles");
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-faq"] > section')).toHaveLength(14);
      const normalize = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim(); const body = normalize(dom.textContent ?? "");
      for (const faq of [...quiz.faq, ...eightValuesLandingFaq]) expect(body).toContain(normalize(faq.answer[locale]));
      for (const section of [...quiz.guide, ...eightValuesLandingSections]) for (const paragraph of section.paragraphs) expect(body).toContain(normalize(paragraph[locale]));
      const citations = dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation"); expect(citations.length).toBeGreaterThan(0);
      for (const citation of citations) expect(dom.querySelector(`[id="${citation.getAttribute("href")!.slice(1)}"]`)).not.toBeNull();
      for (const n of [1, 2, 3, 4]) expect(dom.querySelector(`a[href="#8-values-political-reference-${n}"]`)).not.toBeNull();
      expect(body).toContain("Copyright (c) 2020 8values."); if (locale === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    }
  });
});
