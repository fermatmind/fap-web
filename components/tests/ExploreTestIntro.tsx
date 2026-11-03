import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import catalog from "@/lib/questionnaires/catalog.json";
import { ExploreTestEntry } from "./ExploreTestEntry";
import { ExploreHeroArtwork } from "./ExploreHeroArtwork";

/** The original title, instructions and actual engine remain the source of truth. */
export function ExploreTestIntro({
  children,
  slug,
  entryLink = false,
  locale = "zh",
}: {
  children: ReactNode;
  slug: string;
  entryLink?: boolean;
  locale?: Locale;
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
  return (
    <header className="explore-intro">
      <div className="explore-intro-content">
      {children}
      {entryLink && <ExploreTestEntry locale={locale} tool={tool} />}
      </div>
      <div className="explore-intro-art" aria-hidden="true">
        <ExploreHeroArtwork slug={slug} category={category} />
      </div>
    </header>
  );
}
