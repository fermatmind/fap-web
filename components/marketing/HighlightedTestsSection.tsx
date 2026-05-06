"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  buildBig5TakeHref,
  getBig5QuestionSummary,
  getBig5StartLabel,
  isBig5Slug,
  listBig5FormMetas,
  resolveBig5FormMeta,
} from "@/lib/big5/forms";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildMbtiTakeHref,
  getMbtiQuestionSummary,
  getMbtiStartLabel,
  isMbtiSlug,
  listMbtiFormMetas,
  resolveMbtiFormMeta,
} from "@/lib/mbti/forms";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { isPublicTestEntryVisible } from "@/lib/tests/publicTestEntryVisibility";

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

type CardStatus =
  | {
      mode: "ready";
      actionLabel: string;
      progress: number;
    }
  | {
      mode: "cache";
      actionLabel: string;
      progress: number;
    };

type PersistedProgress = {
  currentIndex?: number;
  answers?: Record<string, string>;
  attemptId?: string | null;
  submittedAt?: number | string | null;
  lastSubmittedAt?: string | null;
  slug?: string;
  questionOrder?: string[];
  formCode?: string | null;
};

const SECTION_COPY = {
  en: {
    kicker: "Start from your current question",
    title: "Assessment entry points",
    subtitle:
      "Choose the entry that matches your current decision context, then move into a clearer and more actionable self-understanding path.",
    rackMeta: "6 high-frequency assessment entries",
    deckStatus: "Covers personality, cognition, pressure, emotion, and career direction",
    filters: ["Collaboration", "Career & cognition", "Pressure & emotion", "Ability & performance"],
    progressLabel: "Resume",
    startLabel: "Start assessment",
    resumeLabel: "Continue assessment",
    authLabel: "View assessment",
    accessPublic: "Free",
    accessAuth: "Pro",
    authTerminalTitle: "Pro assessment entry",
    authTerminalStatus: "Pro access",
    authTerminalCopy:
      "This assessment is part of the pro catalog. You can continue authorization after entering the flow. If you already saved a result, recover it by email.",
    authTerminalClose: "Close",
    authTerminalProceed: "Go to assessment",
    authTerminalLookup: "Recover by email",
    minuteUnit: "min",
  },
  zh: {
    kicker: "从你当前的问题开始",
    title: "测评入口",
    subtitle: "选择最贴近你当下决策情境的入口，快速进入更清晰、更可执行的自我认知路径。",
    rackMeta: "6 个高频测评入口",
    deckStatus: "涵盖人格、认知、压力、情绪与职业方向",
    filters: ["协作与角色", "职业与认知", "压力与情绪", "能力与表现"],
    progressLabel: "继续上次",
    startLabel: "开始测评",
    resumeLabel: "继续测评",
    authLabel: "查看测评",
    accessPublic: "免费",
    accessAuth: "专业版",
    authTerminalTitle: "专业版测评入口",
    authTerminalStatus: "专业版入口",
    authTerminalCopy:
      "该测评属于专业版入口。进入流程后可继续完成授权；如已保存结果，可通过邮箱找回。",
    authTerminalClose: "关闭",
    authTerminalProceed: "进入测评",
    authTerminalLookup: "邮箱找回",
    minuteUnit: "分钟",
  },
} as const;

const CARD_SYSTEM_META = {
  "mbti-personality-test-16-personality-types": {
    typeCode: "ROLE-FIT",
    slotCode: "R1-C1",
    protocolCode: "TEAM_ROLE_ROUTER",
    accessMode: "public",
    question: {
      en: "Clarify how you process information and make decisions, so role fit and collaboration become easier to discuss.",
      zh: "更清楚地看到你获取信息与做决策的方式，让角色定位与协作沟通更容易落地。",
    },
  },
  "big-five-personality-test-ocean-model": {
    typeCode: "LONG-HORIZON",
    slotCode: "R1-C2",
    protocolCode: "TRAIT_COORDINATE_LOCK",
    accessMode: "auth",
    question: {
      en: "Understand your long-term trait tendencies before making bigger choices about role, field, and growth path.",
      zh: "在做更长期的角色、方向与发展选择前，先看清你的稳定特质走向。",
    },
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    typeCode: "RISK-SCAN",
    slotCode: "R1-C3",
    protocolCode: "PRESSURE_PRIORITY_SCAN",
    accessMode: "auth",
    question: {
      en: "Scan pressure load and emotional risk early, then prioritize what support should come first.",
      zh: "尽早识别压力负荷与情绪风险，先明确支持优先级，再进入下一步判断。",
    },
  },
  "depression-screening-test-standard-edition": {
    typeCode: "STATE-CHECK",
    slotCode: "R2-C1",
    protocolCode: "RECENT_BASELINE_CHECK",
    accessMode: "public",
    question: {
      en: "Get a quick view of your recent emotional baseline and whether further support should be considered.",
      zh: "快速了解近期情绪基线，并判断是否需要进一步支持。",
    },
  },
  "iq-test-intelligence-quotient-assessment": {
    typeCode: "COGNITION",
    slotCode: "R2-C2",
    protocolCode: "ABSTRACT_REASONING_CHECK",
    accessMode: "auth",
    question: {
      en: "Estimate pattern recognition and reasoning readiness when upcoming tasks require higher cognitive load.",
      zh: "在高认知负载任务前，先评估你的模式识别与推理准备度。",
    },
  },
  "eq-test-emotional-intelligence-assessment": {
    typeCode: "RELATION",
    slotCode: "R2-C3",
    protocolCode: "RELATION_REGULATION_CHECK",
    accessMode: "public",
    question: {
      en: "See your current self-awareness, empathy, and regulation tendencies for practical collaboration scenarios.",
      zh: "了解你在自我觉察、共情与关系调节上的当前倾向，支持真实协作场景判断。",
    },
  },
} as const;

function parsePersistedEnvelope(raw: string | null): PersistedProgress | null {
  if (!raw) return null;

  try {
    let parsed: unknown = JSON.parse(raw);

    for (let depth = 0; depth < 3; depth += 1) {
      if (!parsed || typeof parsed !== "object") break;
      const candidate = parsed as { state?: unknown };
      if (!candidate.state || typeof candidate.state !== "object") break;
      parsed = candidate.state;
    }

    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PersistedProgress;
  } catch {
    return null;
  }
}

function resolveProgressPercent(payload: PersistedProgress, totalQuestions: number): number {
  if (!totalQuestions) return 0;

  const answerCount =
    payload.answers && typeof payload.answers === "object" ? Object.keys(payload.answers).length : 0;
  const currentIndex = typeof payload.currentIndex === "number" ? payload.currentIndex : 0;
  const questionOrderCount = Array.isArray(payload.questionOrder) ? payload.questionOrder.length : 0;
  const best = Math.max(answerCount, currentIndex, questionOrderCount ? Math.min(currentIndex + 1, questionOrderCount) : 0);

  return Math.max(0, Math.min(100, Math.round((best / totalQuestions) * 100)));
}

function resolveCachedProgressQuestionCount(slug: string, payload: PersistedProgress, fallbackQuestionCount: number): number {
  if (isBig5Slug(slug)) {
    if (!payload.formCode) {
      return fallbackQuestionCount;
    }

    return resolveBig5FormMeta(payload.formCode).questionCount;
  }

  if (!isMbtiSlug(slug)) {
    return fallbackQuestionCount;
  }

  if (!payload.formCode) {
    return fallbackQuestionCount;
  }

  return resolveMbtiFormMeta(payload.formCode).questionCount;
}

function findCachedProgress(slug: string, totalQuestions: number): number | null {
  if (typeof window === "undefined") return null;

  const entries: PersistedProgress[] = [];

  if (slug === "big-five-personality-test-ocean-model") {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      if (
        key !== "fm_big5_attempt_v1"
        && !key.startsWith(`fm_big5_attempt_v2_${slug}_`)
      ) {
        continue;
      }

      const state = parsePersistedEnvelope(window.localStorage.getItem(key));
      if (state) entries.push(state);
    }
  }

  if (slug === "clinical-depression-anxiety-assessment-professional-edition") {
    const state = parsePersistedEnvelope(window.localStorage.getItem("fm_clinical_attempt_v1"));
    if (state?.slug === slug) entries.push(state);
  }

  const quizPrefixes = [
    `fm_quiz_v4_${slug}_`,
    `fm_quiz_v3_${slug}_`,
  ];
  const quizLegacyKeys = [
    `fm_quiz_v2_${slug}`,
    `fm_quiz_v1_${slug}`,
  ];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (
      !key
      || (!quizPrefixes.some((prefix) => key.startsWith(prefix)) && !quizLegacyKeys.includes(key))
    ) {
      continue;
    }
    const state = parsePersistedEnvelope(window.localStorage.getItem(key));
    if (state) entries.push(state);
  }

  for (const entry of entries) {
    if (entry.submittedAt || entry.lastSubmittedAt) continue;
    const progress = resolveProgressPercent(
      entry,
      resolveCachedProgressQuestionCount(slug, entry, totalQuestions)
    );
    if (progress > 0 && progress < 100) return progress;
  }

  return null;
}

function resolveCardStatus(
  slug: string,
  totalQuestions: number,
  copy: (typeof SECTION_COPY)[Locale]
): CardStatus {
  const progress = findCachedProgress(slug, totalQuestions);

  if (progress !== null) {
    return {
      mode: "cache",
      actionLabel: copy.resumeLabel,
      progress,
    };
  }

  return {
    mode: "ready",
    actionLabel: copy.startLabel,
    progress: 32,
  };
}

export function HighlightedTestsSection({
  locale,
  cards,
  productPriority,
}: {
  locale: Locale;
  cards: HomeHighlightedCard[];
  productPriority?: ProductPriorityEnvSnapshot;
}) {
  const copy = SECTION_COPY[locale];
  const withLocale = (path: string) => localizedPath(path, locale);
  const [authTerminalSlug, setAuthTerminalSlug] = useState<string | null>(null);

  const liveCards = useMemo(
    () =>
      cards.filter(
        (card): card is Extract<HomeHighlightedCard, { kind: "live" }> =>
          card.kind === "live"
          && isPublicTestEntryVisible({ slug: card.slug })
          && (
            !productPriority?.mbtiPriorityMode
            || isMbtiSlug(card.slug)
            || isBig5Slug(card.slug)
          )
      ),
    [cards, productPriority?.mbtiPriorityMode]
  );

  const hydrationReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const statusBySlug = useMemo(() => {
    if (!hydrationReady) return {};

    const nextState: Record<string, CardStatus> = {};
    for (const card of liveCards) {
      nextState[card.slug] = resolveCardStatus(card.slug, card.questionsCount, copy);
    }
    return nextState;
  }, [copy, hydrationReady, liveCards]);

  const authTerminalCard =
    authTerminalSlug !== null ? liveCards.find((card) => card.slug === authTerminalSlug) ?? null : null;

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-home-calibration"
    >
      <Container className="fm-home-calibration-shell max-w-[84rem] px-5 md:px-8 lg:px-10">
        <div className="fm-home-calibration-head">
          <p className="fm-home-calibration-kicker m-0">{copy.kicker}</p>
          <h2 className="fm-home-calibration-title m-0">{copy.title}</h2>
          <p className="fm-home-calibration-subtitle m-0">{copy.subtitle}</p>
        </div>

        <div className="fm-home-calibration-deck">
          <div className="fm-home-calibration-deck-glow" aria-hidden />
          <span className="fm-home-calibration-focus fm-home-calibration-focus--tl" aria-hidden />
          <span className="fm-home-calibration-focus fm-home-calibration-focus--tr" aria-hidden />
          <span className="fm-home-calibration-focus fm-home-calibration-focus--bl" aria-hidden />
          <span className="fm-home-calibration-focus fm-home-calibration-focus--br" aria-hidden />

          <div className="fm-home-calibration-rackbar">
            <span>{copy.rackMeta}</span>
            <span>{copy.deckStatus}</span>
          </div>

          <div className="fm-home-calibration-grid">
            {liveCards.map((card) => {
              const systemMeta = CARD_SYSTEM_META[card.slug as keyof typeof CARD_SYSTEM_META];
              const status =
                statusBySlug[card.slug] ??
                ({
                  mode: "ready",
                  actionLabel: copy.startLabel,
                  progress: 32,
                } satisfies CardStatus);
              const isBig5Entry = isBig5Slug(card.slug);
              const isAuth = systemMeta?.accessMode === "auth" && !isBig5Entry;
              const accessMode = isAuth ? copy.accessAuth : copy.accessPublic;
              const actionLabel = isAuth && status.mode === "ready" ? copy.authLabel : status.actionLabel;
              const timeLabel = locale === "zh" ? `约 ${card.timeMinutes} ${copy.minuteUnit}` : `${card.timeMinutes} ${copy.minuteUnit}`;
              const ledClass = isAuth
                ? "fm-home-calibration-led fm-home-calibration-led--auth"
                : "fm-home-calibration-led fm-home-calibration-led--public";

              return (
                <article key={card.slug} className="fm-home-calibration-slot">
                  <div className="fm-home-calibration-slot-grid" aria-hidden />
                  <div
                    className={`fm-home-calibration-cache-rail${status.mode === "cache" ? " is-active" : ""}`}
                    aria-hidden
                  />

                  <div className="fm-home-calibration-slot-body">
                    <div className="fm-home-calibration-slot-heading">
                      <div className="fm-home-calibration-slot-titleRow">
                        <span className={ledClass} aria-hidden />
                        <Link href={withLocale(`/tests/${card.slug}`)} prefetch={false} className="fm-home-calibration-slot-title">
                          {card.title}
                        </Link>
                      </div>
                      <div className="fm-home-calibration-slot-titleRule" aria-hidden>
                        <span className="fm-home-calibration-slot-titleRuleLead" />
                        <span className="fm-home-calibration-slot-titleRuleTrail" />
                      </div>
                      <div className="fm-home-calibration-slot-metaRow">
                        <span className="fm-home-calibration-time">{timeLabel}</span>
                        <span className="fm-home-calibration-slot-access">{accessMode}</span>
                      </div>
                    </div>

                    <p className="fm-home-calibration-slot-copy m-0">
                      {systemMeta?.question[locale] ?? card.description}
                    </p>

                    <p className="fm-home-calibration-slot-tags m-0">{card.tags.join(" / ")}</p>
                  </div>

                  <div className="fm-home-calibration-slot-footer">
                    <div className="fm-home-calibration-slot-footer-meta">
                      <span className="fm-home-calibration-slot-caption">
                        {isMbtiSlug(card.slug)
                          ? getMbtiQuestionSummary(locale)
                          : isBig5Entry
                            ? getBig5QuestionSummary(locale)
                          : locale === "zh"
                            ? `${card.questionsCount} 题`
                            : `${card.questionsCount} questions`}
                      </span>
                      {status.mode === "cache" ? (
                        <span className="fm-home-calibration-slot-caption fm-home-calibration-slot-caption--cache">
                          {`${copy.progressLabel} ${status.progress}%`}
                        </span>
                      ) : null}
                    </div>

                    {isAuth && status.mode === "ready" ? (
                      <button
                        type="button"
                        className="fm-home-calibration-slot-action fm-home-calibration-slot-action--button"
                        onClick={() => setAuthTerminalSlug(card.slug)}
                      >
                        {actionLabel}
                      </button>
                    ) : isMbtiSlug(card.slug) ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        {listMbtiFormMetas().map((form) => (
                          <Link
                            key={form.formCode}
                            href={buildMbtiTakeHref(card.slug, locale, form.formCode)}
                            prefetch={false}
                            className="fm-home-calibration-slot-action"
                          >
                            {getMbtiStartLabel(form.formCode, locale)}
                          </Link>
                        ))}
                      </div>
                    ) : isBig5Entry ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        {listBig5FormMetas().map((form) => (
                          <Link
                            key={form.formCode}
                            href={buildBig5TakeHref(card.slug, locale, form.formCode)}
                            prefetch={false}
                            className="fm-home-calibration-slot-action"
                          >
                            {getBig5StartLabel(form.formCode, locale)}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link href={withLocale(`/tests/${card.slug}/take`)} prefetch={false} className="fm-home-calibration-slot-action">
                        {actionLabel}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="fm-home-calibration-bottom">
            <p className="fm-home-calibration-bottom-meta m-0">{copy.rackMeta}</p>
            <div className="fm-home-calibration-filters" aria-label={locale === "zh" ? "模块筛选" : "Module filters"}>
              {copy.filters.map((filter) => (
                <span key={filter} className="fm-home-calibration-filter">
                  {filter}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {authTerminalCard ? (
        <div
          className="fm-home-auth-terminal-backdrop"
          role="presentation"
          onClick={() => setAuthTerminalSlug(null)}
        >
          <div
            className="fm-home-auth-terminal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fm-home-auth-terminal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="fm-home-auth-terminal-head">
              <div>
                <p className="fm-home-auth-terminal-kicker m-0">{copy.authTerminalStatus}</p>
                <h3 id="fm-home-auth-terminal-title" className="fm-home-auth-terminal-title m-0">
                  {copy.authTerminalTitle}
                </h3>
              </div>
              <button
                type="button"
                className="fm-home-auth-terminal-close"
                onClick={() => setAuthTerminalSlug(null)}
                aria-label={copy.authTerminalClose}
              >
                ×
              </button>
            </div>

            <div className="fm-home-auth-terminal-body">
              <p className="fm-home-auth-terminal-copy m-0">{copy.authTerminalCopy}</p>

              <div className="fm-home-auth-terminal-actions">
                <Link href={withLocale("/results/lookup")} prefetch={false} className="fm-home-auth-terminal-secondary fm-home-auth-terminal-link">
                  {copy.authTerminalLookup}
                </Link>
                <button
                  type="button"
                  className="fm-home-auth-terminal-secondary"
                  onClick={() => setAuthTerminalSlug(null)}
                >
                  {copy.authTerminalClose}
                </button>
                <Link
                  href={withLocale(`/tests/${authTerminalCard.slug}/take`)}
                  prefetch={false}
                  className="fm-home-auth-terminal-primary"
                >
                  {copy.authTerminalProceed}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
