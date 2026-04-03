"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
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
    kicker: "Selected Assessment Recommendations",
    title: "Featured Assessments",
    subtitle:
      "Choose the assessment that best fits your current question and get a clearer path into self-understanding within minutes.",
    rackMeta: "Selected 6 high-frequency assessment entries",
    deckStatus: "Personality, cognition, pressure, emotion, and career directions",
    filters: ["Collaboration", "Career & cognition", "Pressure & emotion", "Ability & performance"],
    progressLabel: "Resume",
    startLabel: "Start assessment →",
    resumeLabel: "Continue assessment →",
    authLabel: "View assessment →",
    accessPublic: "Free",
    accessAuth: "Pro",
    authGate: "AUTH_GATE: SECURE_PAYMENT_GATEWAY",
    authTerminalTitle: "Pro assessment",
    authTerminalStatus: "PRO ASSESSMENT",
    authTerminalCopy:
      "This assessment is part of the pro catalog. Authorization is completed after you enter the assessment flow. If you already have an order, recover it through Order lookup.",
    authTerminalClose: "Close",
    authTerminalProceed: "View assessment →",
    authTerminalLookup: "Order lookup",
    minuteUnit: "min",
  },
  zh: {
    kicker: "精选测评推荐",
    title: "重点测评",
    subtitle: "选择适合你的测评入口，用更清晰的时长预期，快速进入更精准的自我认知路径。",
    rackMeta: "精选 6 个高频测评入口",
    deckStatus: "涵盖人格、认知、压力、情绪与职业方向",
    filters: ["协作与角色", "职业与认知", "压力与情绪", "能力与表现"],
    progressLabel: "继续上次",
    startLabel: "开始测试 →",
    resumeLabel: "继续测试 →",
    authLabel: "查看测评 →",
    accessPublic: "免费",
    accessAuth: "专业版",
    authGate: "AUTH_GATE: SECURE_PAYMENT_GATEWAY",
    authTerminalTitle: "专业版测评",
    authTerminalStatus: "PRO ASSESSMENT",
    authTerminalCopy:
      "该测评属于专业版入口。进入测评流程后可继续完成授权或支付；如果你已有订单，可先通过订单查询恢复流程。",
    authTerminalClose: "关闭",
    authTerminalProceed: "查看测评 →",
    authTerminalLookup: "订单查询",
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
      en: "Used to establish a baseline map for learning direction, collaboration style, and decision preference.",
      zh: "用于识别信息获取、判断与决策偏好，适合在学业方向、合作风格与角色定位中建立基础认知。",
    },
  },
  "big-five-personality-test-ocean-model": {
    typeCode: "LONG-HORIZON",
    slotCode: "R1-C2",
    protocolCode: "TRAIT_COORDINATE_LOCK",
    accessMode: "auth",
    question: {
      en: "Used to anchor long-term trait coordinates before committing to a role, field, or development path.",
      zh: "用于把长期稳定特质放回更完整的常模坐标，适合职业路径与长期发展判断。",
    },
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    typeCode: "RISK-SCAN",
    slotCode: "R1-C3",
    protocolCode: "PRESSURE_PRIORITY_SCAN",
    accessMode: "auth",
    question: {
      en: "Used to identify pressure load, emotional risk, and support priority under higher-stakes contexts.",
      zh: "用于识别压力负荷、情绪风险与支持优先级，适合高压和复杂情境下的判断。",
    },
  },
  "depression-screening-test-standard-edition": {
    typeCode: "STATE-CHECK",
    slotCode: "R2-C1",
    protocolCode: "RECENT_BASELINE_CHECK",
    accessMode: "public",
    question: {
      en: "Used to quickly calibrate your recent emotional baseline and whether additional support should be considered.",
      zh: "用于快速校准近期情绪基线，并判断是否需要进一步支持。",
    },
  },
  "iq-test-intelligence-quotient-assessment": {
    typeCode: "COGNITION",
    slotCode: "R2-C2",
    protocolCode: "ABSTRACT_REASONING_CHECK",
    accessMode: "auth",
    question: {
      en: "Used to evaluate pattern recognition and abstract reasoning when the task ahead demands higher cognitive load.",
      zh: "用于评估模式识别与抽象推理能力，适合高认知负载任务的前置判断。",
    },
  },
  "eq-test-emotional-intelligence-assessment": {
    typeCode: "RELATION",
    slotCode: "R2-C3",
    protocolCode: "RELATION_REGULATION_CHECK",
    accessMode: "public",
    question: {
      en: "Used to evaluate self-awareness, empathy, and relationship regulation for practical collaboration scenarios.",
      zh: "用于评估自我觉察、共情与关系调节能力，适合协作与沟通情境判断。",
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
    const state = parsePersistedEnvelope(window.localStorage.getItem("fm_big5_attempt_v1"));
    if (state) entries.push(state);
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
}: {
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const copy = SECTION_COPY[locale];
  const withLocale = (path: string) => localizedPath(path, locale);
  const [authTerminalSlug, setAuthTerminalSlug] = useState<string | null>(null);

  const liveCards = useMemo(
    () => cards.filter((card): card is Extract<HomeHighlightedCard, { kind: "live" }> => card.kind === "live"),
    [cards]
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
              const isAuth = systemMeta?.accessMode === "auth";
              const accessMode = isAuth ? copy.accessAuth : copy.accessPublic;
              const actionLabel = isAuth && status.mode === "ready" ? copy.authLabel : status.actionLabel;
              const timeLabel = `[ ${card.timeMinutes}_MIN ]`;
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
                        <Link href={withLocale(`/tests/${card.slug}`)} className="fm-home-calibration-slot-title">
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
                            className="fm-home-calibration-slot-action"
                          >
                            {getMbtiStartLabel(form.formCode, locale)}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link href={withLocale(`/tests/${card.slug}/take`)} className="fm-home-calibration-slot-action">
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
              <div className="fm-home-auth-terminal-meta">
                <span>{`PROTOCOL: ${CARD_SYSTEM_META[authTerminalCard.slug as keyof typeof CARD_SYSTEM_META]?.protocolCode ?? "SECURE_GATE"}`}</span>
                <span>{`ROUTE: ${withLocale(`/tests/${authTerminalCard.slug}/take`)}`}</span>
              </div>

              <p className="fm-home-auth-terminal-copy m-0">{copy.authTerminalCopy}</p>

              <div className="fm-home-auth-terminal-actions">
                <Link href={withLocale("/orders/lookup")} className="fm-home-auth-terminal-secondary fm-home-auth-terminal-link">
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
