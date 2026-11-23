import type { ReactNode } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import portfolio from "@/lib/entertainment/portfolioLandingEntries.json";
import catalog from "@/lib/questionnaires/catalog.json";
import { ExploreTestEntry } from "./ExploreTestEntry";
import { ExploreHeroArtwork } from "./ExploreHeroArtwork";
import { ArchiveLandingReading, getArchiveLandingCopy } from "./ArchiveLandingReading";

/** The original title, instructions and actual engine remain the source of truth. */
export function ExploreTestIntro({
  children,
  slug,
  entryLink = false,
  sideContent,
  locale = "zh",
  readingLocale = locale,
  readingLeadInHero = false,
}: {
  children: ReactNode;
  slug: string;
  entryLink?: boolean;
  sideContent?: ReactNode;
  locale?: DisplayLocale;
  readingLocale?: DisplayLocale;
  readingLeadInHero?: boolean;
}) {
  const category =
    catalog.find((item) => item.slug === slug)?.category ?? "framework";
  const tool = [
    "career-match",
    "life-path-number",
    "nine-star-ki",
    "natal-chart",
    "nakshatra-spica-reference",
    "typing-speed",
    "ten-key-test",
    "data-entry",
    "written-coordination-practice",
  ].includes(slug);
  const reading = getArchiveLandingCopy(slug, readingLocale);
  return (
    <><header className="explore-intro">
      <div className="explore-intro-content">
      {children}
      {entryLink && <ExploreTestEntry locale={locale} tool={tool} />}
      {Object.hasOwn(portfolio, slug) && <a className="portfolio-preview-link" href="#portfolio-preview">
        {locale === "en" ? "See example questions and results" : locale === "zh-TW" ? "查看題目與結果範例" : "查看题目与结果示例"}<span aria-hidden> ↓</span>
      </a>}
      </div>
      {sideContent ?? <div className="explore-intro-art" aria-hidden="true">
        <ExploreHeroArtwork slug={slug} category={category} />
      </div>}
    </header>
    {reading && <ArchiveLandingReading copy={reading} locale={readingLocale} slug={slug} leadInHero={readingLeadInHero} />}
    </>
  );
}
