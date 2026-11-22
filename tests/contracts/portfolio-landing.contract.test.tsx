import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortfolioFlagshipLanding, hasPortfolioFlagship } from "@/components/tests/PortfolioFlagshipLanding";
import { buildPortfolioPreview, hasPortfolioLanding } from "@/lib/entertainment/portfolioLanding";
import entries from "@/lib/entertainment/portfolioLandingEntries.json";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";

const retiredDraftCopy = /optional saving|(?:draft|progress)[^.。]{0,96}24[- ]hours?|(?:草稿|作答進度|答题进度)[^.。]{0,96}24\s*(?:小时|小時)|可[选選]保存/u;

function checkFlagshipLanding(markup: string, slug: string, where: string) {
  const container = document.createElement("div");
  container.innerHTML = markup;
  const landing = container.querySelector(`[data-flagship-entry="${slug}"]`);
  expect(landing, where).not.toBeNull();
  expect(Array.from(landing!.querySelectorAll("[data-ent-module]"), section => section.getAttribute("data-ent-module")), where).toEqual([
    "hero", "summary", "method", "profiles", "interpretation", "related", "comparison", "reference",
  ]);
  expect(landing!.querySelectorAll("h1"), where).toHaveLength(1);
  expect(landing!.querySelectorAll("[data-ent-faq]"), where).toHaveLength(6);
  expect(landing!.querySelector("[data-ent-boundary]")?.hasAttribute("open"), where).toBe(false);
  expect(markup, where).not.toMatch(retiredDraftCopy);
}

describe("Mode A portfolio flagship landings", () => {
  it("only enables the 86 in-scope native questionnaire landings", async () => {
    expect(Object.keys(entries)).toHaveLength(86);
    for (const slug of ["mental-age", "seven-sins-virtues-test", "gta-6-character-quiz", "global-history-quiz", "friendship-quiz"]) {
      expect(hasPortfolioLanding(slug)).toBe(false);
      expect(hasPortfolioFlagship(slug)).toBe(false);
    }
    for (const slug of Object.keys(entries)) {
      expect(hasPortfolioFlagship(slug), slug).toBe(true);
      const quiz = await loadQuestionnaire(slug);
      expect(quiz?.slug, slug).toBe(slug);
      if (!quiz) continue;
      for (const index of [0, 1, 2]) {
        const sample = buildPortfolioPreview(quiz, index);
        expect(sample.kind, slug).not.toBe("format");
        if (sample.kind === "matches") {
          expect(sample.profileIds.length, slug).toBeGreaterThan(0);
          for (const id of sample.profileIds) expect(quiz.profiles.some(profile => profile.id === id), slug).toBe(true);
        } else if (sample.kind === "practice") {
          expect(sample.total, slug).toBe(quiz.questions.length);
          expect(sample.correct, slug).toBe(sample.scores.reduce((sum, score) => sum + score.value, 0));
        }
      }
    }
  }, 120_000);

  it("serves the complete English and Simplified Chinese landings through the public entry routes", async () => {
    const { default: ExplorePage } = await import("@/app/(localized)/[locale]/tests/explore/[slug]/page");
    const { default: PlayPage } = await import("@/app/(localized)/[locale]/tests/play/[slug]/page");
    const { default: DiscPage } = await import("@/app/(localized)/[locale]/tests/explore/disc/page");
    for (const locale of ["en", "zh"] as const) {
      for (const slug of Object.keys(entries)) {
        const path = questionnairePath(locale, slug);
        const props = { params: Promise.resolve({ slug, locale }) };
        const element = slug === "disc" ? await DiscPage(props)
          : path.includes("/play/") ? await PlayPage(props) : await ExplorePage(props);
        checkFlagshipLanding(renderToStaticMarkup(element), slug, path);
      }
    }
  }, 120_000);

  it("connects all Traditional Chinese entries to their existing localised readers", async () => {
    const { default: ExplorePage } = await import("@/app/(traditional)/zh-TW/[...path]/page");
    const { default: PlayPage } = await import("@/app/(traditional)/zh-TW/tests/play/[slug]/page");
    for (const slug of Object.keys(entries)) {
      const path = questionnairePath("zh-TW", slug).split("/").slice(2);
      const element = path[1] === "play"
        ? await PlayPage({ params: Promise.resolve({ slug }) })
        : await ExplorePage({ params: Promise.resolve({ path }) });
      checkFlagshipLanding(renderToStaticMarkup(element), slug, path.join("/"));
    }
  }, 120_000);

  it("preserves result IDs and canonical collection when rendering the sample", async () => {
    const quiz = (await loadQuestionnaire("response-color"))!;
    const markup = renderToStaticMarkup(<PortfolioFlagshipLanding quiz={quiz} locale="en" />);
    expect(markup).toContain('data-flagship-entry="response-color"');
    expect(markup).toContain('/en/tests/play/response-color/results/');
    expect(markup).toContain("<h1");
  });

  it("shows real timed output for data entry without adding a fictitious question", async () => {
    const quiz = (await loadQuestionnaire("data-entry"))!;
    const markup = renderToStaticMarkup(<PortfolioFlagshipLanding quiz={quiz} locale="en" />);
    expect(markup).toContain("character KPH");
    expect(markup).not.toContain("data-explore-choice");
    expect(markup).toContain("Inspect a fictional source record");
    expect(markup).toContain("Exact field accuracy");
  });
});
