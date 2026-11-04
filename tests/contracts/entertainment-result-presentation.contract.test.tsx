import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import nativeCatalog from "@/lib/questionnaires/catalog.json";
import storyCatalog from "@/lib/entertainment/catalog.json";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { resultPath, resultSlug } from "@/lib/entertainment/guides";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { ResultPage, ResultReadingNav, ResultScoreRow, ResultSection } from "@/components/questionnaires/QuestionnaireResultPresentation";
import type { Questionnaire } from "@/lib/questionnaires/types";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const nativePlay = new Set(nativeCatalog.filter(quiz => quiz.collection === "play").map(quiz => quiz.slug));
const reachableStories = storyCatalog.filter(quiz => !nativePlay.has(quiz.slug));
function dom(markup: string) {
  const root = document.createElement("div");
  root.innerHTML = markup;
  return root;
}

describe("entertainment result consumer coverage and presentation boundaries", () => {
  it("resolves every catalog identity to its real loader and bilingual result route, accounting for native play precedence", async () => {
    const routes = new Set<string>();
    for (const entry of nativeCatalog) {
      const quiz = await loadQuestionnaire(entry.slug);
      expect(quiz?.slug, entry.slug).toBe(entry.slug);
      expect(quiz?.profiles.map(profile => profile.id), entry.slug).toEqual(entry.resultSlugs);
      for (const locale of ["en", "zh"] as const) {
        expect(questionnairePath(locale, entry.slug)).toBe(`/${locale}/tests/${entry.collection}/${entry.slug}`);
        for (const id of entry.resultSlugs) routes.add(questionnaireGuidePath(locale, entry.slug, id));
      }
    }
    for (const entry of reachableStories) {
      const quiz = await loadFunQuiz(entry.slug);
      expect(quiz?.slug, entry.slug).toBe(entry.slug);
      expect(quiz?.results.map(profile => profile.id), entry.slug).toEqual(entry.resultSlugs);
      for (const locale of ["en", "zh"]) for (const id of entry.resultSlugs) routes.add(resultPath(locale as "en" | "zh", entry.slug, id));
    }
    const expected = nativeCatalog.reduce((sum, entry) => sum + entry.resultSlugs.length, 0)
      + reachableStories.reduce((sum, entry) => sum + entry.resultSlugs.length, 0);
    expect(routes.size).toBe(expected * 2);
    // Both legacy entries are shadowed by native play dispatch, not separately accessible products.
    expect(storyCatalog.filter(quiz => nativePlay.has(quiz.slug)).map(quiz => quiz.slug).sort()).toEqual(["relationship-values", "response-color"]);
  }, 30_000);

  it.each(["en", "zh"] as const)("renders every native %s reading with its actual paragraphs, scale explanation and valid anchors", locale => {
    for (const entry of nativeCatalog) {
      const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${entry.slug}.json`, "utf8")) as Questionnaire;
      const before = JSON.stringify(quiz);
      for (const source of quiz.profiles) {
        const profile = prepareResultProfile(quiz.slug, source);
        expect(profile.id, quiz.slug).toBe(source.id);
        expect(profile.directionIds, quiz.slug).toEqual(source.directionIds);
        const root = dom(renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} idPrefix="coverage" />));
        for (const field of [profile.headline, profile.summary, profile.scoreReading]) {
          expect(field[locale].trim(), `${quiz.slug}/${profile.id}`).toBeTruthy();
          expect(root.textContent, `${quiz.slug}/${profile.id}`).toContain(field[locale]);
        }
        for (const section of profile.sections) {
          expect(root.querySelector(`[id="coverage-${section.id}"]`)?.textContent).toContain(section.title[locale]);
          for (const paragraph of section.paragraphs) expect(root.textContent).toContain(paragraph[locale]);
        }
        const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
        expect(new Set(ids).size, `${quiz.slug}/${profile.id}`).toBe(ids.length);
        for (const link of root.querySelectorAll('nav a[href^="#"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
        expect(root.querySelectorAll("input, textarea, form")).toHaveLength(0);
      }
      expect(JSON.stringify(quiz), `${quiz.slug}: source mutation`).toBe(before);
    }
  }, 60_000);

  it.each(["en", "zh"] as const)("renders all reachable public story %s guides through their real route with complete authored fields and stable anchors", async locale => {
    const { default: Guide } = await import("@/app/(localized)/[locale]/tests/play/[slug]/results/[portrait]/page");
    for (const entry of reachableStories) {
      const quiz = await loadFunQuiz(entry.slug);
      if (!quiz) throw new Error(`Missing story: ${entry.slug}`);
      for (const portrait of quiz.results) {
        const root = dom(renderToStaticMarkup(await Guide({ params: Promise.resolve({ locale, slug: quiz.slug, portrait: resultSlug(portrait.id) }) })));
        const guide = root.querySelector("[data-story-guide]")!;
        expect(guide, `${quiz.slug}/${portrait.id}`).not.toBeNull();
        expect(guide.getAttribute("data-story-guide")).toBe(quiz.mechanism);
        for (const field of ["summary", "example", "strength", "tradeoff", "experiment"] as const) expect(guide.textContent, `${quiz.slug}/${portrait.id}/${field}`).toContain(portrait[field][locale]);
        const ids = [...root.querySelectorAll("[id]")].map(element => element.id);
        expect(new Set(ids).size, `${quiz.slug}/${portrait.id}`).toBe(ids.length);
        for (const link of guide.querySelectorAll('nav a[href^="#"]')) expect(ids).toContain(link.getAttribute("href")!.slice(1));
        expect(guide.querySelector("input, textarea, form")).toBeNull();
      }
    }
  }, 60_000);

  it("keeps missing, unbounded, non-finite and out-of-range scores textual; maps a documented 1–5 scale from its real minimum", () => {
    const root = dom(renderToStaticMarkup(<>
      <ResultScoreRow label="Mean" value="3 / 5" score={3} min={1} max={5} />
      <ResultScoreRow label="Unavailable" value="Not available" score={null} min={1} max={5} />
      <ResultScoreRow label="Count" value="7 choices" score={7} />
      <ResultScoreRow label="Invalid" value="Unavailable" score={Number.NaN} min={0} max={5} />
      <ResultScoreRow label="Out of range" value="Unavailable" score={7} min={1} max={5} />
    </>));
    expect(root.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    expect(root.querySelector('[style]')?.getAttribute("style")).toContain("width:50%");
    expect(root.querySelector("dt")?.textContent).toBe("Mean");
    expect(root.querySelector("dd")?.textContent).toBe("3 / 5");
    expect(root.textContent).toContain("Not available");
    expect(root.textContent).not.toContain("NaN");
    expect(root.querySelector('[role="progressbar"], [role="meter"]')).toBeNull();
  });

  it("preserves family variants and caller-owned heading structure instead of imposing one report hierarchy", () => {
    const variants = ["profile", "dimensions", "practice", "reflection", "story"] as const;
    for (const variant of variants) {
      const root = dom(renderToStaticMarkup(<ResultPage variant={variant}><ResultSection title="Caller heading" headingLevel={4}><p>Caller content</p></ResultSection></ResultPage>));
      expect(root.querySelector(`[data-result-variant="${variant}"]`)).not.toBeNull();
      expect(root.querySelector("h4")?.textContent).toBe("Caller heading");
      expect(root.querySelector("h2, h3")).toBeNull();
    }
  });

  it("keeps primary navigation visible and gives an explicitly collapsed long reading a native summary control", () => {
    const sections = [{ id: "real-section", title: "A real reading section" }];
    const primary = dom(renderToStaticMarkup(<ResultReadingNav label="Reading" sections={sections} />));
    expect(primary.querySelector("details")).toBeNull();
    expect(primary.querySelector("nav a")?.getAttribute("href")).toBe("#real-section");
    const longReading = dom(renderToStaticMarkup(<ResultReadingNav label="Full contents" sections={sections} collapsible />));
    expect(longReading.querySelector("details > summary")?.textContent).toBe("Full contents");
    expect(longReading.querySelector("details nav a")?.getAttribute("href")).toBe("#real-section");
  });

  it("does not attach foreign reading references or source markers to a mismatched product or profile", () => {
    const quiz = JSON.parse(readFileSync("lib/questionnaires/data/disc.json", "utf8")) as Questionnaire;
    const profile = prepareResultProfile(quiz.slug, quiz.profiles[0]);
    expect(profile.resultReading).toBeTruthy();
    for (const candidate of [
      { ...profile, resultReading: { ...profile.resultReading!, quizSlug: "foreign-product" } },
      { ...profile, resultReading: { ...profile.resultReading!, profileId: "foreign-profile" } },
    ]) {
      const root = dom(renderToStaticMarkup(<QuestionnaireResultReading quizSlug={quiz.slug} profile={candidate} locale="en" />));
      expect(root.querySelector("[data-disc-result-reading]")).toBeNull();
      for (const reference of candidate.resultReading.references ?? []) expect(root.querySelector(`a[href="${reference.url}"]`)).toBeNull();
      expect(root.textContent).toContain(profile.scoreReading.en);
    }
  });
});
