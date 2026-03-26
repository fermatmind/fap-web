import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

export type HomeHighlightedCard =
  | {
      kind: "live";
      slug: string;
      title: string;
      description: string;
      category: string;
      tags: string[];
      questionsCount: number;
      timeMinutes: number;
      footnote: string;
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

const SECTION_COPY = {
  en: {
    kicker: "Decision Entry Matrix",
    title: "Decision Entry Matrix",
    subtitle:
      "This is not about choosing a fun test. It is about choosing the right judgment module for the decision you are actually making.",
    cta: "[ ACTIVATE_PROTOCOL ]",
    complexity: "Complexity",
    nodeActive: "NODE_SCAN_ACTIVE",
  },
  zh: {
    kicker: "决策入口矩阵",
    title: "决策入口矩阵",
    subtitle: "不是选择一个“好玩的测试”，而是进入一个更适合当前问题的判断模块。",
    cta: "[ 激活协议 ]",
    complexity: "复杂度",
    nodeActive: "NODE_SCAN_ACTIVE",
  },
} as const;

const CARD_SYSTEM_META = {
  "mbti-personality-test-16-personality-types": {
    typeCode: "MBTI",
    modeCode: "ROLE-FIT",
    slotCode: "R1-C1",
    complexity: 3,
  },
  "big-five-personality-test-ocean-model": {
    typeCode: "OCEAN",
    modeCode: "LONG-TERM",
    slotCode: "R1-C2",
    complexity: 4,
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    typeCode: "CLINICAL",
    modeCode: "RISK-SCAN",
    slotCode: "R1-C3",
    complexity: 4,
  },
  "depression-screening-test-standard-edition": {
    typeCode: "BASELINE",
    modeCode: "STATE-CHECK",
    slotCode: "R2-C1",
    complexity: 2,
  },
  "iq-test-intelligence-quotient-assessment": {
    typeCode: "REASONING",
    modeCode: "COGNITION",
    slotCode: "R2-C2",
    complexity: 3,
  },
  "eq-test-emotional-intelligence-assessment": {
    typeCode: "REGULATION",
    modeCode: "RELATION",
    slotCode: "R2-C3",
    complexity: 3,
  },
} as const;

function renderComplexityBars(level: number) {
  return Array.from({ length: 5 }, (_, index) => index < level);
}

export function HighlightedTestsSection({
  locale,
  cards,
}: {
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const copy = SECTION_COPY[locale];

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-home-tests relative py-[var(--fm-section-y-lg)] text-[var(--fm-text)]"
    >
      <Container className="relative z-10">
        <div className="fm-home-matrix-shell mx-auto max-w-[80rem] px-[var(--fm-space-4)] pb-[var(--fm-space-8)] pt-[var(--fm-space-9)] md:px-[var(--fm-space-6)] md:pb-[var(--fm-space-9)] md:pt-[var(--fm-space-10)]">
          <div className="mx-auto max-w-[46rem] space-y-3 text-center">
            <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
            <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[#0b0f14]">
              {copy.title}
            </h2>
            <p className="m-0 text-[0.98rem] leading-7 text-[#55616e] md:text-[1.04rem]">{copy.subtitle}</p>
          </div>

          <div className="mt-[var(--fm-space-7)] grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {cards.map((card) => {
              if (card.kind !== "live") {
                return null;
              }

              const systemMeta = CARD_SYSTEM_META[card.slug as keyof typeof CARD_SYSTEM_META];
              const complexityBars = renderComplexityBars(systemMeta?.complexity ?? 3);

              return (
                <article key={card.slug} className="fm-home-test-card group flex h-full flex-col">
                  <div className="fm-home-test-slot-status">
                    <span>{`TYPE: ${systemMeta?.typeCode ?? "CORE"}`}</span>
                    <span>{`MODE: ${systemMeta?.modeCode ?? "SCAN"}`}</span>
                    <span>{`ITEMS: ${card.questionsCount}`}</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="m-0 text-[0.9rem] font-semibold leading-6 tracking-[-0.02em] text-[#171b21]">
                        {card.category}
                      </p>
                      <p className="m-0 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#6d7682]">
                        {card.footnote}
                      </p>
                    </div>

                    <Link
                      href={withLocale(`/tests/${card.slug}`)}
                      title={card.title}
                      className="inline-flex text-[1.5rem] font-semibold leading-tight tracking-[-0.04em] text-[#0b0f14] transition hover:text-[#0b0f14]"
                    >
                      {card.title}
                    </Link>
                    <p className="m-0 text-[0.95rem] leading-7 text-[#404a56]">{card.description}</p>
                  </div>

                  <div className="fm-home-test-slot-ruler mt-5">
                    <span className="fm-home-test-slot-ruler-label">{copy.complexity}</span>
                    <div className="fm-home-test-slot-ruler-bars" aria-hidden>
                      {complexityBars.map((isActive, index) => (
                        <span
                          key={`${card.slug}-complexity-${index}`}
                          className={`fm-home-test-slot-ruler-bar${isActive ? " is-active" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="fm-home-test-slot-ruler-mode">{systemMeta?.modeCode ?? "SCAN"}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span key={tag} className="fm-home-test-slot-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#d0d5dc] pt-4">
                    <div className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#6d7682]">
                      <span>{`TIME: ${card.timeMinutes} MIN`}</span>
                      <span className="mx-2 text-[#9ea6b1]">{"//"}</span>
                      <span>{`SLOT: ${systemMeta?.slotCode ?? "R1-C1"}`}</span>
                    </div>

                    <Link
                      href={withLocale(`/tests/${card.slug}/take`)}
                      className="fm-home-test-card-cta inline-flex items-center gap-2 text-[0.76rem] font-semibold text-[#0b0f14]"
                    >
                      {copy.cta}
                    </Link>
                  </div>

                  <div className="fm-home-test-slot-coordinate" aria-hidden>
                    <span>{copy.nodeActive}</span>
                    <span>{`[ ${systemMeta?.slotCode ?? "R1-C1"} ]`}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
