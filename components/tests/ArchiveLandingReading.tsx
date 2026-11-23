import type { DisplayLocale } from "@/lib/i18n/locales";
import entries from "@/lib/entertainment/archiveLandingCopy.json";
import { TestExploreMethod } from "./TestExploreTemplate";
import styles from "./test-explore-template.module.css";

type Reading = {
  lead?: string;
  method?: string;
  interpretation?: string;
};

const archiveLandingCopy: Readonly<Record<string, Record<DisplayLocale, Reading>>> = entries;

export function getArchiveLandingCopy(slug: string, locale: DisplayLocale) {
  return Object.hasOwn(archiveLandingCopy, slug) ? archiveLandingCopy[slug][locale] : undefined;
}

export function ArchiveLandingLead({ slug, locale, original, className }: { slug: string; locale: DisplayLocale; original: string; className: string }) {
  const lead = getArchiveLandingCopy(slug, locale)?.lead;
  return <p className={className} data-archive-landing-lead={lead ? slug : undefined}>{lead ?? original}</p>;
}

const labels = {
  zh: { preview: "开始前快速了解", reading: "怎样看结果", practice: "怎样复习", interpretation: "试着观察", scale: "原始总分范围" },
  "zh-TW": { preview: "開始前先了解", reading: "怎麼看結果", practice: "怎麼複習", interpretation: "可以留意什麼", scale: "原始總分範圍" },
  en: { preview: "Before you start", reading: "Reading your result", practice: "How to review", interpretation: "What to look for", scale: "Raw score range" },
} as const;

export function ArchiveLandingReading({ copy, locale, slug, leadInHero }: { copy: Reading; locale: DisplayLocale; slug: string; leadInHero: boolean }) {
  const text = labels[locale];
  const summary = !leadInHero && copy.lead;
  if (!summary && !copy.method && !copy.interpretation) return null;
  return <div className={`${styles.page} ${styles.archiveReading}`} data-archive-landing-reading={slug}>
    {summary && <section data-ent-module="summary" className={styles.archiveSummary}>
      <h2>{text.preview}</h2>
      <p>{summary}</p>
    </section>}
    {(copy.method || copy.interpretation) && <TestExploreMethod mark>
      {copy.method && <div>
        <h2>{text.reading}</h2>
        <p>{copy.method}</p>
        {slug === "self-esteem" && <p className={styles.archiveScale}>
          <span>{text.scale}</span>
          <strong>0</strong><span className={styles.archiveScaleTrack} aria-hidden="true" /><strong>30</strong>
        </p>}
      </div>}
      {copy.interpretation && <div data-ent-module="interpretation">
        <h3>{slug === "spelling-test" ? text.practice : text.interpretation}</h3>
        <p>{copy.interpretation}</p>
      </div>}
    </TestExploreMethod>}
  </div>;
}
