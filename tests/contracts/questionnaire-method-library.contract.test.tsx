import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const methods = {
  "communication-adaptability": "practice-key",
  "toxic-positivity-test": "method",
  "mental-age": "calculation",
  "energy-flow": "calculation",
  "food-disgust": "calculation",
  "food-choice": "counting",
  "everyday-control-style": "response-map",
  "interpersonal-preferences": "method",
  "social-attitudes-reflection": "method",
  "work-activity-interests": "respond"
} as const;
const libraries = ["overthinking-screener", "executive-function", "sensory-processing-test", "conservatism", "food-disgust", "tipi-10", "parenting-style", "love-type-16"] as const;
const read = (slug: string) => JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;

async function render(slug: string, locale: "en" | "zh") {
  const dom = document.createElement("div");
  dom.innerHTML = renderToStaticMarkup(await QuestionnairePage({ params: Promise.resolve({ locale, slug }) }));
  return dom;
}

describe("Existing questionnaire method and public-guide explanations", () => {
  for (const [slug, sectionId] of Object.entries(methods)) {
    for (const locale of ["en", "zh"] as const) {
      it(`${slug}/${locale}: shows the full existing method once outside collapsed scope`, async () => {
        const quiz = read(slug), section = quiz.guide.find(s => s.id === sectionId)!;
        expect(section.paragraphs).toHaveLength(1);
        const text = section.paragraphs[0][locale], dom = await render(slug, locale);
        const method = dom.querySelector('section[aria-labelledby="questionnaire-method"]');
        expect(method?.querySelector("p")?.textContent).toBe(text);
        expect(method?.closest("details")).toBeNull();
        expect([...dom.querySelectorAll("p")].filter(p => p.textContent === text)).toHaveLength(1);
      });
    }
  }
  for (const slug of libraries) {
    for (const locale of ["en", "zh"] as const) {
      it(`${slug}/${locale}: describes the actual full guide library without inventing winners or ties`, async () => {
        const quiz = read(slug), dom = await render(slug, locale);
        const library = dom.querySelector('section[aria-labelledby="questionnaire-results"]');
        const explanation = library?.querySelector("p")?.textContent;
        expect(explanation).toContain(locale === "en" ? "this edition" : "本题本");
        expect(explanation).not.toMatch(/single directions|every tied combination|单项和并列组合/);
        const links = [...library!.querySelectorAll("li > a")];
        expect(links.map(a => a.getAttribute("href"))).toEqual(quiz.profiles.map(p => `/${locale}/tests/explore/${slug}/results/${p.id}`));
        expect(links.map(a => a.textContent)).toEqual(quiz.profiles.map(p => p.title[locale]));
      });
    }
  }
});
