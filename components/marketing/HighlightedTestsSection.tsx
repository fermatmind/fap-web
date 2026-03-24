import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export type HomeHighlightedCard =
  | {
      kind: "live";
      slug: string;
      title: string;
      scaleCode?: string;
      excerpt: string;
      rating: number;
      isClinical: boolean;
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

type TestPresentation = {
  zh: string;
  en: string;
};

const TEST_TITLE_BY_SLUG: Record<string, TestPresentation> = {
  "mbti-personality-test-16-personality-types": {
    zh: "MBTI 性格测试",
    en: "MBTI Personality Test",
  },
  "big-five-personality-test-ocean-model": {
    zh: "大五人格测试",
    en: "Big Five Personality Test",
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    zh: "抑郁焦虑综合检测",
    en: "Clinical Depression & Anxiety Assessment",
  },
  "depression-screening-test-standard-edition": {
    zh: "抑郁测评（标准版）",
    en: "Depression Screening Test (Standard)",
  },
  "iq-test-intelligence-quotient-assessment": {
    zh: "智商 IQ 测试",
    en: "IQ Test",
  },
  "eq-test-emotional-intelligence-assessment": {
    zh: "情商 EQ 测试",
    en: "EQ Test",
  },
};

const TEST_CATEGORY_BY_SLUG: Record<string, TestPresentation> = {
  "mbti-personality-test-16-personality-types": {
    zh: "人格测评",
    en: "Personality",
  },
  "big-five-personality-test-ocean-model": {
    zh: "人格测评",
    en: "Personality",
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    zh: "情绪状态",
    en: "Emotional State",
  },
  "depression-screening-test-standard-edition": {
    zh: "情绪状态",
    en: "Emotional State",
  },
  "iq-test-intelligence-quotient-assessment": {
    zh: "认知能力",
    en: "Cognitive Ability",
  },
  "eq-test-emotional-intelligence-assessment": {
    zh: "情绪与关系",
    en: "Emotional Intelligence",
  },
};

function resolveDisplayText(
  slug: string,
  fallback: string,
  locale: Locale,
  source: Record<string, TestPresentation>
): string {
  const preset = source[slug];
  if (!preset) return fallback;
  return locale === "zh" ? preset.zh : preset.en;
}

function stripInternalScaleCode(text: string) {
  return text
    .replace(/\b(?:BIG5_OCEAN|SDS_20|IQ_RAVEN|EQ_60|CLINICAL_COMBO_68|MBTI|MBTI\s*\d+)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function HighlightedTestsSection({
  dict,
  locale,
  cards,
}: {
  dict: SiteDictionary;
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      id="home-highlighted-tests"
      data-testid="home-highlighted-tests-section"
      className="fm-section-highlighted relative py-[var(--fm-section-y-lg)]"
    >
      <Container className="relative z-10">
        <div className="fm-home-highlighted-shell mx-auto max-w-[76rem]">
          <div className="relative z-10 mx-auto max-w-3xl space-y-[var(--fm-gap-sm)] text-center">
            <p className="fm-home-section-kicker">{locale === "zh" ? "重点测评入口" : "Priority assessments"}</p>
            <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-trust-blue-strong)] md:text-4xl">
              {dict.home.highlighted.title}
            </h2>
            <p className="m-0 text-[var(--fm-text-muted)]">{dict.home.highlighted.subtitle}</p>
          </div>

          <div className="mt-[var(--fm-space-8)] grid gap-[var(--fm-space-5)] md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              if (card.kind === "live") {
                const displayTitle = resolveDisplayText(card.slug, card.title, locale, TEST_TITLE_BY_SLUG);
                const displayCategory = resolveDisplayText(card.slug, "", locale, TEST_CATEGORY_BY_SLUG);
                const safeExcerpt = stripInternalScaleCode(card.excerpt);

                return (
                  <article
                    key={`live-${card.slug}`}
                    className="fm-home-highlight-card group flex min-h-[19rem] h-full flex-col rounded-[1.25rem] bg-white p-6 text-[var(--fm-text)]"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-[var(--fm-border-strong)] bg-white font-semibold text-[var(--fm-text)]">
                          {displayCategory}
                        </Badge>
                        {card.isClinical ? <Badge className="border-amber-300 bg-amber-50 text-amber-900">{dict.home.highlighted.clinicalBadge}</Badge> : null}
                      </div>

                      <Link
                        href={withLocale(`/tests/${card.slug}`)}
                        className="block"
                        title={displayTitle}
                        aria-label={displayTitle}
                      >
                        <h3 className="m-0 text-xl leading-snug font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] transition group-hover:text-[var(--fm-trust-blue)]">
                          {displayTitle}
                        </h3>
                      </Link>

                      <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{safeExcerpt}</p>
                    </div>

                    <div className="mt-auto pt-[var(--fm-space-5)]">
                      <Link
                        href={withLocale(`/tests/${card.slug}/take`)}
                        className="inline-flex items-center text-sm font-semibold text-[var(--fm-trust-blue)]"
                      >
                        <span>{locale === "zh" ? "开始此测试" : "Start this test"}</span>
                        <span className="fm-home-highlight-card-arrow">→</span>
                      </Link>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={`coming-${card.id}`}
                  className="fm-home-highlight-card fm-home-highlight-card--disabled flex h-full min-h-[19rem] flex-col rounded-[1.25rem] bg-[#f9fbff] p-6 text-[var(--fm-text)] opacity-95"
                >
                  <div className="space-y-4">
                    <Badge className="inline-flex w-fit border-amber-300 bg-amber-100 text-amber-900">{dict.home.highlighted.comingSoonBadge}</Badge>
                    <h3 className="m-0 text-xl leading-snug font-semibold text-[var(--fm-trust-blue-strong)]">{card.title}</h3>
                    <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{card.description}</p>
                  </div>
                  <p className="mt-auto pt-[var(--fm-space-5)] text-sm font-semibold text-[var(--fm-text-muted)]">{dict.home.highlighted.comingSoonCta}</p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
