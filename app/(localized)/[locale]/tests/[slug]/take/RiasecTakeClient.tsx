"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuizTakeHeaderV2 } from "@/components/quiz/QuizTakeHeaderV2";
import { V2LikertScale } from "@/components/quiz/immersive/V2LikertScale";
import { QuizShell } from "@/components/quiz/QuizShell";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackObservableFunnelEvent } from "@/lib/analytics";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";
import {
  buildRiasecSubmitAnswers,
  fetchRiasecQuestions,
  startRiasecAttempt,
  submitRiasecAttempt,
} from "@/lib/riasec/api";
import { normalizeRiasecFormCode, resolveRiasecFormMeta } from "@/lib/riasec/forms";
import {
  buildRiasecStartAttemptTrackingPayload,
  buildRiasecSubmitAttemptTrackingPayload,
} from "@/lib/riasec/tracking";
import { readStoredTrackingAttributionPayload } from "@/lib/tracking/attribution";
import { TRACKING_EVENTS } from "@/lib/tracking/events";
import { buildSeoAttemptStartAttributionFromSearchParams } from "@/lib/tracking/seoCtaAttribution";

type RiasecOption = {
  code: string;
  text: string;
};

type RiasecQuestion = {
  question_id: string;
  text: string;
  options: RiasecOption[];
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveLocalizedText(node: Record<string, unknown>, locale: "en" | "zh"): string {
  return locale === "zh"
    ? normalizeText(node.text_zh) || normalizeText(node.text) || normalizeText(node.text_en)
    : normalizeText(node.text_en) || normalizeText(node.text) || normalizeText(node.text_zh);
}

function normalizeQuestions(items: Array<Record<string, unknown>>, locale: "en" | "zh"): RiasecQuestion[] {
  return items.map((item, index) => {
    const questionId = normalizeText(item.question_id) || String(index + 1);
    const options = Array.isArray(item.options)
      ? item.options
          .map((rawOption) => {
            if (!rawOption || typeof rawOption !== "object" || Array.isArray(rawOption)) return null;
            const option = rawOption as Record<string, unknown>;
            const code = normalizeText(option.code);
            if (!code) return null;
            return {
              code,
              text: resolveLocalizedText(option, locale) || code,
            };
          })
          .filter((option): option is RiasecOption => option !== null)
      : [];

    return {
      question_id: questionId,
      text: resolveLocalizedText(item, locale) || (locale === "zh" ? `第 ${index + 1} 题` : `Question ${index + 1}`),
      options,
    };
  });
}

export default function RiasecTakeClient({
  slug,
  formCode,
  estimatedMinutes,
}: {
  slug: string;
  formCode?: string;
  estimatedMinutes?: number;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const resolvedFormCode = useMemo(
    () => normalizeRiasecFormCode(formCode ?? searchParams.get("form") ?? searchParams.get("form_code")),
    [formCode, searchParams]
  );
  const formMeta = resolveRiasecFormMeta(resolvedFormCode);
  const effectiveEstimatedMinutes = estimatedMinutes ?? formMeta.estimatedMinutes;
  const search = searchParams.toString();
  const attributionContext = useMemo(
    () =>
      buildSeoAttemptStartAttributionFromSearchParams({
        searchParams: new URLSearchParams(search),
        currentPath: `${pathname}${search ? `?${search}` : ""}`,
        storedAttribution: readStoredTrackingAttributionPayload(pathname),
        fallbackTestSlug: slug,
        fallbackSourcePageType: "tests_take_page",
        fallbackTargetAction: "start_riasec_test",
      }),
    [pathname, search, slug]
  );

  const [questions, setQuestions] = useState<RiasecQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const questionIds = useMemo(() => questions.map((question) => question.question_id), [questions]);
  const currentQuestion = questions[currentIndex] ?? null;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [questionsResponse, startResponse] = await Promise.all([
          fetchRiasecQuestions({
            locale: toApiLocale(locale),
            anonId,
            formCode: resolvedFormCode,
          }),
          startRiasecAttempt({
            locale: toApiLocale(locale),
            anonId,
            formCode: resolvedFormCode,
            meta: {
              source: "tests_take_page",
              slug,
              ...attributionContext.meta,
            },
            attribution: {
              entrypoint: "seo_cta",
              ...attributionContext.attribution,
            },
          }),
        ]);
        if (!active) return;

        const rawItems = Array.isArray(questionsResponse.questions?.items)
          ? questionsResponse.questions.items
              .filter((item) => Boolean(item && typeof item === "object" && !Array.isArray(item)))
              .map((item) => item as Record<string, unknown>)
          : [];
        setQuestions(normalizeQuestions(rawItems, locale));
        setAttemptId(startResponse.attempt_id);
        setStartedAt(Date.now());
        trackObservableFunnelEvent(
          TRACKING_EVENTS.START_ATTEMPT,
          buildRiasecStartAttemptTrackingPayload({
            slug,
            formCode: resolvedFormCode,
            locale,
            attemptId: startResponse.attempt_id,
            attribution: attributionContext.meta,
          })
        );
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : dict.result.reportUnavailable);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [anonId, attributionContext, dict.result.reportUnavailable, locale, resolvedFormCode, slug]);

  const selectAnswer = useCallback((questionId: string, code: string) => {
    setAnswers((current) => ({ ...current, [questionId]: code }));
    setTimeout(() => {
      setCurrentIndex((index) => Math.min(index + 1, Math.max(0, questions.length - 1)));
    }, 160);
  }, [questions.length]);

  const submit = useCallback(async () => {
    if (!attemptId || submitting || answeredCount < questions.length) return;
    setSubmitting(true);
    setError(null);

    try {
      const durationMs = Math.max(1000, Date.now() - startedAt);
      await submitRiasecAttempt({
        attemptId,
        anonId,
        answers: buildRiasecSubmitAnswers({ questionIds, answers }),
        durationMs,
      });
      trackObservableFunnelEvent(
        TRACKING_EVENTS.SUBMIT_ATTEMPT,
        buildRiasecSubmitAttemptTrackingPayload({
          slug,
          formCode: resolvedFormCode,
          locale,
          attemptId,
          answeredCount,
          durationMs,
          attribution: attributionContext.meta,
        })
      );
      router.push(withLocale(`/result/${attemptId}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : dict.result.reportUnavailable);
      setSubmitting(false);
    }
  }, [answeredCount, anonId, answers, attemptId, attributionContext.meta, dict.result.reportUnavailable, locale, questionIds, questions.length, resolvedFormCode, router, slug, startedAt, submitting, withLocale]);

  if (loading) {
    return (
      <QuizShell>
        <Alert>{locale === "zh" ? "正在加载题目..." : "Loading questions..."}</Alert>
      </QuizShell>
    );
  }

  if (error && questions.length === 0) {
    return (
      <QuizShell>
        <Alert>{error}</Alert>
      </QuizShell>
    );
  }

  return (
    <QuizShell>
      <QuizTakeHeaderV2
        brand={locale === "zh" ? "霍兰德职业兴趣测试" : "Holland Career Interest Test"}
        completedPrefix={locale === "zh" ? "已有" : ""}
        completedSuffix={locale === "zh" ? "人完成测评" : "completed"}
        estimatedTimeLabel={locale === "zh" ? "预计用时" : "Estimated time"}
        minutesUnit={locale === "zh" ? "分钟" : "min"}
        estimatedMinutes={effectiveEstimatedMinutes}
        backHref={withLocale(`/tests/${slug}`)}
        backLabel={locale === "zh" ? "返回详情" : "Back to landing"}
        progressText={locale === "zh" ? "作答进度" : "Progress"}
        current={Math.min(currentIndex + 1, questions.length)}
        total={questions.length}
        answered={answeredCount}
        showCompletedCount={false}
      />

      {currentQuestion ? (
        <div className="space-y-[var(--fm-space-6)]">
          <div className="min-h-[140px] rounded-2xl bg-slate-50 p-[var(--fm-space-6)]">
            <div className="text-sm font-semibold text-[var(--fm-text-muted)]">
              {locale === "zh" ? `第 ${currentIndex + 1} 题` : `Question ${currentIndex + 1}`}
            </div>
            <h2 className="mt-[var(--fm-space-2)] text-2xl font-bold leading-9 text-[var(--fm-text)]">
              {currentQuestion.text}
            </h2>
          </div>

          <V2LikertScale
            questionId={currentQuestion.question_id}
            options={currentQuestion.options}
            value={answers[currentQuestion.question_id]}
            onChange={(code) => selectAnswer(currentQuestion.question_id, code)}
          />

          <div className="flex items-center justify-between gap-[var(--fm-gap-sm)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex <= 0 || submitting}
            >
              {locale === "zh" ? "上一题" : "Back"}
            </Button>
            {answeredCount >= questions.length ? (
              <Button type="button" onClick={() => void submit()} disabled={submitting || !attemptId}>
                {submitting ? (locale === "zh" ? "提交中..." : "Submitting...") : (locale === "zh" ? "提交并查看结果" : "Submit and view result")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
                disabled={currentIndex >= questions.length - 1 || submitting}
              >
                {locale === "zh" ? "下一题" : "Next"}
              </Button>
            )}
          </div>
          {error ? <Alert>{error}</Alert> : null}
        </div>
      ) : null}
    </QuizShell>
  );
}
