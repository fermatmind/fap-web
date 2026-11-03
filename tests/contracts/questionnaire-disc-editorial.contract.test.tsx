import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "@/lib/questionnaires/data/disc.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const quiz = source as Questionnaire;

describe("DISC evidence-led landing copy", () => {
  it("uses a reachable synthetic scoring example and keeps the complete 15-outcome coverage", () => {
    const ids = quiz.directions.map(direction => direction.id);
    const target = [8, 8, 4, 4];
    let layer = new Map<string, QuestionnaireAnswers>([["0,0,0,0", {}]]);
    for (const question of quiz.questions) {
      const next = new Map<string, QuestionnaireAnswers>();
      for (const [key, answers] of layer) for (const option of question.options) {
        const counts = key.split(",").map(Number);
        counts[ids.indexOf(option.directionId)]++;
        if (counts.some((count, i) => count > target[i])) continue;
        next.set(counts.join(","), { ...answers, [question.id]: option.id });
      }
      layer = next;
    }
    const answers = layer.get(target.join(","));
    expect(answers).toBeDefined();
    expect(scoreDirectionalQuestionnaire(quiz, answers)).toMatchObject({ status: "complete", counts: Object.fromEntries(ids.map((id, i) => [id, target[i]])), profileId: "tied-d-i" });
    expect(quiz.profiles).toHaveLength(15);
    expect(catalog.find(item => item.slug === "disc")?.description).toEqual(quiz.description);
  });

  it("gives every outcome a distinct context and explains product-specific score constraints", async () => {
    const { discLandingSummary } = await import("@/components/questionnaires/DiscLandingEditorial");
    for (const locale of ["zh", "en"] as const) {
      const summaries = quiz.profiles.map(profile => discLandingSummary(profile, locale));
      expect(new Set(summaries).size).toBe(15);
      expect(summaries.every(text => text.length > 45)).toBe(true);
      expect(discLandingSummary(quiz.profiles.find(profile => profile.id === "tied-d-i-s-c")!, locale)).toContain(locale === "zh" ? "均为6次" : "six choices");
      const faq = quiz.faq.map(item => item.answer[locale]).join(" ");
      expect(faq).toContain("D = I = S = C = 6");
      expect(faq).toContain(locale === "zh" ? "不另行计算自然" : "does not separately score natural");
    }
  });

  it("renders complete bilingual sections, resolvable scholarly citations and stable SEO identity", async () => {
    const entry = await import("@/components/questionnaires/QuestionnairePage");
    for (const locale of ["zh", "en"] as const) {
      const args = { params: Promise.resolve({ locale, slug: "disc" }) };
      const dom = document.createElement("div");
      dom.innerHTML = renderToStaticMarkup(await entry.default(args));
      expect(dom.querySelectorAll("h1")).toHaveLength(1);
      expect(dom.querySelector("h1")?.textContent).toBe(quiz.title[locale]);
      for (const id of ["questionnaire-purpose", "questionnaire-method", "questionnaire-results", "questionnaire-faq", "questionnaire-reading-scope", "questionnaire-references"]) expect(dom.querySelector(`#${id}`)).not.toBeNull();
      for (const citation of dom.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(dom.querySelector(citation.getAttribute("href")!)).not.toBeNull();
      expect(dom.querySelectorAll(".disc-source-citation").length).toBeGreaterThan(4);
      expect(dom.querySelectorAll('[aria-labelledby="questionnaire-results"] > ul > li')).toHaveLength(15);
      expect(dom.textContent).toContain(locale === "zh" ? "103名大学生" : "103 undergraduates");
      expect(dom.textContent).toContain(locale === "zh" ? "尚未建立内部一致性" : "has not established internal consistency");
      expect(dom.textContent).toContain(quiz.instructions![locale]);
      const definitions = quiz.guide.find(section => section.id === "not-a-fixed-identity")!;
      for (const paragraph of definitions.paragraphs) {
        const plain = paragraph[locale].replace(/\[[1-3]\]/g, "");
        expect(dom.querySelector(".disc-direction-definitions")?.textContent?.replace(/\[[1-3]\]/g, "")).toContain(plain);
      }
      expect(dom.querySelector(".explore-reading-sections")?.textContent).not.toContain(definitions.paragraphs[0][locale]);
      const method = dom.querySelector('[aria-labelledby="questionnaire-method"]')!;
      for (const section of quiz.guide.filter(item => ["raw-wins-explanation", "ties-explanation", "low-direction-explanation"].includes(item.id))) {
        for (const paragraph of section.paragraphs) expect(method.textContent).toContain(paragraph[locale]);
      }
      expect(dom.querySelector('a[href*="jobcannon.io"]')).toBeNull();
      const metadata = await entry.generateMetadata(args);
      expect(metadata.description).toBe(quiz.description[locale]);
      expect(quiz.seoTitle[locale]).not.toContain("FermatMind"); // The locale layout appends the brand once.
      expect(metadata.alternates?.canonical).toContain(`/${locale}/tests/explore/disc`);
      if (locale === "en") expect(dom.textContent).not.toMatch(/\p{Script=Han}/u);
      const guide = await import("@/components/questionnaires/QuestionnaireGuide");
      const report = document.createElement("div");
      report.innerHTML = renderToStaticMarkup(await guide.default({ params: Promise.resolve({ locale, slug: "disc", profile: "single-d" }) }));
      for (const citation of report.querySelectorAll<HTMLAnchorElement>(".disc-source-citation")) expect(citation.getAttribute("href")).toMatch(new RegExp(`^/${locale}/tests/explore/disc#disc-reference-[1-3]$`));
    }
  });
});
