import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GlobalHistoryResultV2 } from "@/components/entertainment/GlobalHistoryResultV2";
import { getHistoryResult } from "@/lib/entertainment/global-history/result-v2";
import { GlobalHistoryReport } from "@/components/entertainment/GlobalHistoryReport";
import { ArchiveGuideShare } from "@/components/questionnaires/ArchiveQuestionnaireExperience";
import { archive90Topic, archiveTopic } from "@/lib/entertainment/archive90";
import { getArchiveExperience } from "@/lib/entertainment/archiveExperience";
import { archiveSecondBatch } from "@/lib/entertainment/archiveSecondBatch";
import { archiveThirdBatch } from "@/lib/entertainment/archiveThirdBatch";
import { GLOBAL_HISTORY_SLUG, globalHistoryPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { globalHistoryResultKey } from "@/lib/entertainment/global-history/local-result";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { quizPath, resultPath } from "@/lib/entertainment/guides";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import questionnaires from "@/lib/questionnaires/catalog.json";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isArchivedEntertainmentPath } from "@/lib/seo/discoverabilityExposurePolicy";

const locales = ["en", "zh", "zh-TW"] as const;

describe("third archive experience cohort", () => {
  it("preserves the 65 archived test identities and keeps World Edition public", async () => {
    // The legacy topic still supplies the matched result’s optional follow-up.
    expect(archiveTopic(GLOBAL_HISTORY_SLUG)?.slug).toBe("big-five-personality-test-ocean-model");
    const ids = Object.keys(archiveThirdBatch).filter(slug => slug !== GLOBAL_HISTORY_SLUG);
    expect(ids).toHaveLength(65);
    for (const locale of locales) {
      expect(isArchivedEntertainmentPath(globalHistoryPath(locale))).toBe(false);
      for (const { id } of historyPeople) {
        expect(isArchivedEntertainmentPath(globalHistoryResultPath(locale, id))).toBe(false);
      }
    }
    for (const slug of ids) {
      expect(archive90Topic(slug)).toBeUndefined();
      expect(archiveSecondBatch[slug]).toBeUndefined();
      expect(getArchiveExperience(slug)).toBeUndefined();
      const native = questionnaires.find(row => row.slug === slug);
      const story = !native;
      const profiles = native?.resultSlugs ?? (await loadFunQuiz(slug))?.results.map(p => p.id);
      expect(profiles).toBeDefined();
      for (const locale of locales) {
        const entry = story ? quizPath(locale, slug) : questionnairePath(locale, slug);
        expect(isArchivedEntertainmentPath(entry)).toBe(true);
        expect(archiveTopic(slug)?.label[locale]).toBeTruthy();
        for (const id of profiles!) {
          const url = story ? resultPath(locale, slug, id) : questionnaireGuidePath(locale, slug, id);
          expect(isArchivedEntertainmentPath(url), url).toBe(true);
          expect(renderToStaticMarkup(<ArchiveGuideShare slug={slug} id={id} locale={locale} story={story} />))
            .toContain("data-public-guide-share");
        }
      }
    }
  }, 20_000);

  it("shows the history assessment link only after a result made from this visitor's answers", () => {
    const person = historyPeople[0];
    const props = { id: person.id, profile: person.vector, locale: "zh" as const, displayLocale: "zh-TW" as const };
    sessionStorage.removeItem(globalHistoryResultKey);
    const visitor = render(<GlobalHistoryReport {...props} />);
    expect(visitor.container.querySelector("[data-archive-next-step]")).toBeNull();
    visitor.unmount();
    sessionStorage.setItem(globalHistoryResultKey, JSON.stringify({ id: person.id, vector: [1, 2, 3, 4, 5, 6] }));
    try {
      const player = render(<GlobalHistoryReport {...props} />);
      const report = player.container.querySelector("#history-reflection")!;
      const next = player.container.querySelector("[data-archive-next-step]")!;
      expect(report.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(next.querySelectorAll("a")).toHaveLength(1);
      expect(next.querySelector("a")).toHaveAttribute("href", "/zh-TW/tests/big-five-personality-test-ocean-model");
    } finally {
      sessionStorage.removeItem(globalHistoryResultKey);
    }
  });

  it("keeps the three method links in both World Edition states and one matched follow-up", () => {
    const person = historyPeople.find(item => item.id === "isaac-newton")!;
    const result = getHistoryResult(person)!;
    const page = <GlobalHistoryResultV2 person={person} locale="en" result={result} traditionalCopy={text => text} />;
    const assessmentLinks = [
      "/en/tests/mbti-personality-test-16-personality-types",
      "/en/tests/big-five-personality-test-ocean-model",
      "/en/tests/iq-test-intelligence-quotient-assessment",
    ];
    const sectionLinks = (container: HTMLElement, selector: string) =>
      [...container.querySelectorAll<HTMLAnchorElement>(selector)].map(link => link.getAttribute("href"));
    const methodLinks = (container: HTMLElement) =>
      sectionLinks(container, '#alternative-readings nav[aria-label="Modern assessments"] a');
    sessionStorage.removeItem(globalHistoryResultKey);
    const visitor = render(page);
    expect(methodLinks(visitor.container)).toEqual(assessmentLinks);
    expect(visitor.container.querySelector("[data-archive-next-step]")).toBeNull();
    visitor.unmount();

    sessionStorage.setItem(globalHistoryResultKey, JSON.stringify({ id: person.id, vector: [1, 2, 3, 4, 5, 6] }));
    try {
      const player = render(page);
      expect(player.container.querySelector('[data-history-state="matched"]')).toBeInTheDocument();
      expect(methodLinks(player.container)).toEqual(assessmentLinks);
      expect(sectionLinks(player.container, "[data-archive-next-step] a")).toEqual(["/en/tests/big-five-personality-test-ocean-model"]);
    } finally {
      sessionStorage.removeItem(globalHistoryResultKey);
    }
  });
});
