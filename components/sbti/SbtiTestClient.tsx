"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";
import { SBTI_QUESTIONS } from "@/lib/sbti/questions";
import { SBTI_RESULT_PROFILES } from "@/lib/sbti/results";
import { resolveSbtiPrimaryType, scoreSbtiAnswers } from "@/lib/sbti/scoring";
import { readSbtiState, writeSbtiState, type SbtiStoredState } from "@/lib/sbti/storage";
import type { SbtiAnswerMap } from "@/lib/sbti/types";

function createDefaultState(locale: Locale): SbtiStoredState {
  return {
    version: 1,
    locale,
    updatedAt: new Date().toISOString(),
    answers: {},
    completedResult: null,
    submissionCount: 0,
  };
}

export function SbtiTestClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [answers, setAnswers] = useState<SbtiAnswerMap>({});
  const [completedResult, setCompletedResult] = useState<SbtiStoredState["completedResult"]>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const persisted = readSbtiState();
    const nextState =
      persisted && persisted.version === 1
        ? {
            ...persisted,
            locale,
          }
        : createDefaultState(locale);

    setAnswers(nextState.answers);
    setCompletedResult(nextState.completedResult);
    setSubmissionCount(nextState.submissionCount);
    setLoaded(true);
  }, [locale]);

  useEffect(() => {
    if (!loaded) return;

    writeSbtiState({
      version: 1,
      locale,
      updatedAt: new Date().toISOString(),
      answers,
      completedResult,
      submissionCount,
    });
  }, [answers, completedResult, loaded, locale, submissionCount]);

  useEffect(() => {
    trackEvent("landing_view", {
      slug: "sbti-fun",
      entry_surface: "fun_landing",
      landing_path: localizedPath("/fun/sbti", locale),
      locale,
    });
  }, [locale]);

  const answeredCount = useMemo(
    () =>
      SBTI_QUESTIONS.filter((question) => {
        const answer = answers[question.id];
        return typeof answer === "string" && question.options.some((option) => option.id === answer);
      }).length,
    [answers]
  );
  const unansweredCount = SBTI_QUESTIONS.length - answeredCount;
  const canViewResult = unansweredCount === 0;
  const hasPreviousSubmission = submissionCount > 0;
  const progress = Math.round((answeredCount / SBTI_QUESTIONS.length) * 100);

  const updateAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setCompletedResult(null);
    setError(null);

    const currentQuestionIndex = SBTI_QUESTIONS.findIndex((question) => question.id === questionId);
    const nextQuestion = SBTI_QUESTIONS[currentQuestionIndex + 1];

    if (!nextQuestion) {
      return;
    }

    const scheduleScroll =
      typeof window !== "undefined" && typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (callback: FrameRequestCallback) => window.setTimeout(callback, 0);

    scheduleScroll(() => {
      questionRefs.current[nextQuestion.id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    });
  };

  const handleSubmit = () => {
    if (unansweredCount > 0) {
      setError(`还有 ${unansweredCount} 题未完成，请先答完再看结果。`);
      return;
    }

    setSubmitting(true);

    try {
      const nextSubmissionCount = submissionCount + 1;
      const scores = scoreSbtiAnswers(SBTI_QUESTIONS, answers);
      const resolved = resolveSbtiPrimaryType(scores, SBTI_RESULT_PROFILES);
      const nextResult = {
        version: 1 as const,
        updatedAt: new Date().toISOString(),
        locale,
        answers,
        scores,
        primaryTypeCode: resolved.primary.code,
        matchPercent: resolved.matchPercent,
        similarity: resolved.similarity,
      };

      setCompletedResult(nextResult);
      setSubmissionCount(nextSubmissionCount);

      writeSbtiState({
        version: 1,
        locale,
        updatedAt: new Date().toISOString(),
        answers,
        completedResult: nextResult,
        submissionCount: nextSubmissionCount,
      });

      trackEvent("submit_click", {
        answered_count: SBTI_QUESTIONS.length,
        duration_ms: 0,
        locale,
      });

      router.push(localizedPath("/fun/sbti/result", locale));
    } catch {
      setError("生成结果失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-[var(--fm-border)] bg-[linear-gradient(180deg,#ffffff,rgba(255,255,255,0.94))]">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              娱乐实验
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              31 题 · 3-5 分钟
            </span>
          </div>
          <CardTitle className="text-2xl">SBTI 人格测试</CardTitle>
          <p className="m-0 text-sm leading-7 text-slate-600">
            选最接近你的直觉反应就行。它是一个轻量、娱乐化的人格画像实验，不是正式心理测评。
          </p>
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            仅供娱乐，不作诊断、招聘、相亲、医学心理判断或重大人生决策依据。
          </Alert>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>完成进度</span>
            <strong>{progress}%</strong>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {error ? <Alert>{error}</Alert> : null}

      {hasPreviousSubmission ? (
        <Alert className="border-sky-200 bg-sky-50 text-sky-900">
          已载入你上次提交时的答案。你可以直接重新提交，或改几题后再重新提交结果。
        </Alert>
      ) : null}

      <div className="space-y-4">
        {SBTI_QUESTIONS.map((question) => (
          <div
            key={question.id}
            ref={(node) => {
              questionRefs.current[question.id] = node;
            }}
            data-testid={`sbti-question-${question.order}`}
            className="scroll-mt-28 md:scroll-mt-32"
          >
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle className="text-base sm:text-lg">
                  {question.order}. {question.prompt.zh}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {question.options.map((option) => {
                    const checked = answers[question.id] === option.id;

                    return (
                      <label
                        key={`${question.id}-${option.id}`}
                        className={[
                          "cursor-pointer rounded-2xl border px-4 py-3 text-sm transition",
                          checked
                            ? "border-[var(--fm-accent)] bg-sky-50 text-sky-900 shadow-[0_10px_28px_rgba(56,189,248,0.12)]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={question.id}
                          value={option.id}
                          checked={checked}
                          onChange={() => updateAnswer(question.id, option.id)}
                        />
                        <span className="font-medium">{option.id}. {option.label.zh}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="sticky bottom-3 z-10 rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-sm text-slate-600">
            {unansweredCount === 0 ? "已全部答完，可以生成结果。" : `还有 ${unansweredCount} 题未完成。`}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => router.push(localizedPath("/", locale))}>
              返回首页
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting || !canViewResult}>
              {submitting ? "生成中..." : canViewResult ? (hasPreviousSubmission ? "重新提交结果" : "查看结果") : "继续作答"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
