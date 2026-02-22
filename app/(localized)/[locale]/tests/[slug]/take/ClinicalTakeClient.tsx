"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConsentGate } from "@/components/clinical/quiz/ConsentGate";
import { ModuleTransitionCard } from "@/components/clinical/quiz/ModuleTransitionCard";
import { QuestionCard } from "@/components/clinical/quiz/QuestionCard";
import { QuizShell } from "@/components/clinical/quiz/QuizShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import {
  fetchClinicalQuestions,
  startClinicalAttempt,
  submitClinicalAttempt,
  type ClinicalScaleCode,
} from "@/lib/clinical/api";
import { useClinicalAttemptStore } from "@/lib/clinical/attemptStore";
import { mapClinicalError } from "@/lib/clinical/errors";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";
import { captureError } from "@/lib/observability/sentry";
import type { QuestionsMeta, ScaleQuestionItem, ScaleQuestionOption } from "@/lib/api/v0_3";

const SDS_OPTION_CODES = ["A", "B", "C", "D"];
const SUBMIT_REPORT_CACHE_PREFIX = "fm_attempt_submit_report_v1_";

type ModuleMetaNode = {
  title?: string;
  guidance?: string;
};

function normalizeModuleMeta(raw: unknown): Record<string, ModuleMetaNode> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return Object.entries(raw as Record<string, unknown>).reduce<Record<string, ModuleMetaNode>>((acc, [key, value]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return acc;
    }

    const node = value as Record<string, unknown>;
    acc[key.trim().toUpperCase()] = {
      title: typeof node.title === "string" ? node.title : undefined,
      guidance: typeof node.guidance === "string" ? node.guidance : undefined,
    };
    return acc;
  }, {});
}

function resolveConsentText(meta: QuestionsMeta | undefined, isZh: boolean): string {
  const consentText = typeof meta?.consent?.text === "string" ? meta.consent.text.trim() : "";
  if (consentText) return consentText;

  const disclaimerText = typeof meta?.disclaimer?.text === "string" ? meta.disclaimer.text.trim() : "";
  if (disclaimerText) return disclaimerText;

  return isZh
    ? "请先阅读并同意知情同意说明后再开始测评。"
    : "Please review and accept informed consent before starting the assessment.";
}

function normalizeSdsOptions(format: string[]): ScaleQuestionOption[] {
  return format
    .map((text, idx) => {
      const label = String(text ?? "").trim();
      if (!label) return null;

      return {
        code: SDS_OPTION_CODES[idx] ?? String.fromCharCode(65 + idx),
        text: label,
      } satisfies ScaleQuestionOption;
    })
    .filter((item): item is ScaleQuestionOption => item !== null);
}

function questionOptionsForScale({
  scaleCode,
  question,
  sdsOptions,
}: {
  scaleCode: ClinicalScaleCode;
  question: ScaleQuestionItem;
  sdsOptions: ScaleQuestionOption[];
}): ScaleQuestionOption[] {
  if (scaleCode === "SDS_20") {
    return sdsOptions;
  }

  return Array.isArray(question.options)
    ? question.options.filter((item) => typeof item.code === "string" && typeof item.text === "string")
    : [];
}

export default function ClinicalTakeClient({
  slug,
  scaleCode,
}: {
  slug: string;
  scaleCode: ClinicalScaleCode;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const isZh = locale === "zh";
  const router = useRouter();
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);

  const attemptId = useClinicalAttemptStore((state) => state.attemptId);
  const answers = useClinicalAttemptStore((state) => state.answers);
  const currentIndex = useClinicalAttemptStore((state) => state.currentIndex);
  const startedAt = useClinicalAttemptStore((state) => state.startedAt);
  const consentAcceptedAt = useClinicalAttemptStore((state) => state.consentAcceptedAt);
  const consentVersion = useClinicalAttemptStore((state) => state.consentVersion);
  const seenModuleTransitions = useClinicalAttemptStore((state) => state.seenModuleTransitions);

  const initSession = useClinicalAttemptStore((state) => state.initSession);
  const hydrateAnonId = useClinicalAttemptStore((state) => state.hydrateAnonId);
  const setAttemptId = useClinicalAttemptStore((state) => state.setAttemptId);
  const acceptConsent = useClinicalAttemptStore((state) => state.acceptConsent);
  const setAnswer = useClinicalAttemptStore((state) => state.setAnswer);
  const setCurrentIndex = useClinicalAttemptStore((state) => state.setCurrentIndex);
  const markModuleSeen = useClinicalAttemptStore((state) => state.markModuleSeen);
  const markSubmitted = useClinicalAttemptStore((state) => state.markSubmitted);
  const resetAfterSubmit = useClinicalAttemptStore((state) => state.resetAfterSubmit);

  const [questions, setQuestions] = useState<ScaleQuestionItem[]>([]);
  const [questionsMeta, setQuestionsMeta] = useState<QuestionsMeta | undefined>();
  const [sdsOptions, setSdsOptions] = useState<ScaleQuestionOption[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [consentChecked, setConsentChecked] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [milestoneHint, setMilestoneHint] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);

  const consentText = useMemo(() => resolveConsentText(questionsMeta, isZh), [isZh, questionsMeta]);
  const serverConsentVersion =
    typeof questionsMeta?.consent?.version === "string" ? questionsMeta.consent.version.trim() : "";

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < totalQuestions - 1 ? questions[currentIndex + 1] : null;
  const answeredCount = useMemo(
    () => questions.reduce((count, item) => count + (answers[item.question_id] ? 1 : 0), 0),
    [answers, questions]
  );

  const moduleMeta = useMemo(() => normalizeModuleMeta(questionsMeta?.modules), [questionsMeta?.modules]);

  const needsConsent = useMemo(() => {
    if (!consentAcceptedAt) return true;
    if (!serverConsentVersion) return false;
    return consentVersion !== serverConsentVersion;
  }, [consentAcceptedAt, consentVersion, serverConsentVersion]);

  const pendingModuleTransition = useMemo(() => {
    if (scaleCode !== "CLINICAL_COMBO_68") return "";
    if (!currentQuestion || currentIndex <= 0) return "";

    const previous = questions[currentIndex - 1];
    const previousModule = String(previous?.module_code ?? "").trim().toUpperCase();
    const currentModule = String(currentQuestion.module_code ?? "").trim().toUpperCase();

    if (!currentModule || currentModule === previousModule) return "";
    if (seenModuleTransitions.includes(currentModule)) return "";
    return currentModule;
  }, [currentIndex, currentQuestion, questions, scaleCode, seenModuleTransitions]);

  useEffect(() => {
    const anonId = getOrCreateAnonId();
    hydrateAnonId(anonId || null);
  }, [hydrateAnonId]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoadingQuestions(true);
      setQuestionError(null);

      try {
        const response = await fetchClinicalQuestions({
          scaleCode,
          locale: toApiLocale(locale),
          region: "GLOBAL",
        });

        if (!active) return;

        const ordered = [...response.questions.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const normalizedMeta = response.meta && typeof response.meta === "object" ? response.meta : undefined;

        setQuestions(ordered);
        setQuestionsMeta(normalizedMeta);
        if (scaleCode === "SDS_20") {
          const format = Array.isArray(response.options?.format) ? response.options.format : [];
          setSdsOptions(normalizeSdsOptions(format));
        } else {
          setSdsOptions([]);
        }

        initSession({
          slug,
          scaleCode,
          questionIds: ordered.map((item) => item.question_id),
        });
      } catch (error) {
        if (!active) return;
        const mapped = mapClinicalError(error);
        setQuestionError(mapped.message);
        captureError(error, {
          route: "/tests/[slug]/take",
          slug,
          scaleCode,
          stage: "load_questions",
        });
      } finally {
        if (active) {
          setLoadingQuestions(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [initSession, locale, scaleCode, slug]);

  useEffect(() => {
    if (!needsConsent) {
      setConsentChecked(true);
      return;
    }
    setConsentChecked(false);
    setAttemptId(null);
  }, [needsConsent, setAttemptId]);

  useEffect(() => {
    if (answeredCount === 0) {
      setSeenMilestones([]);
      setMilestoneHint(null);
    }
  }, [answeredCount, totalQuestions]);

  useEffect(() => {
    if (totalQuestions <= 0) return;

    const progressPercent = Math.floor((answeredCount / totalQuestions) * 100);
    const milestones = [20, 40, 60, 80, 100];
    const nextMilestone = milestones.find((milestone) => progressPercent >= milestone && !seenMilestones.includes(milestone));
    if (!nextMilestone) return;

    setSeenMilestones((prev) => [...prev, nextMilestone]);
    const hintIndex = milestones.indexOf(nextMilestone);
    const hint = dict.quiz.milestoneHints[hintIndex] ?? dict.quiz.milestoneHints[dict.quiz.milestoneHints.length - 1] ?? "";
    if (hint) {
      setMilestoneHint(hint);
      window.setTimeout(() => {
        setMilestoneHint((prev) => (prev === hint ? null : prev));
      }, 1500);
    }

    const elapsedMs = Math.max(0, Date.now() - startedAt);
    const durationBucket = elapsedMs < 60000 ? "lt_1m" : elapsedMs < 180000 ? "1_3m" : "gte_3m";
    trackEvent("ui_quiz_milestone", {
      scale_code: scaleCode,
      milestone: nextMilestone,
      duration_bucket: durationBucket,
      locale,
    });
  }, [answeredCount, dict.quiz.milestoneHints, locale, scaleCode, seenMilestones, startedAt, totalQuestions]);

  const ensureAttempt = useCallback(async () => {
    if (attemptId) {
      return attemptId;
    }

    setStarting(true);
    setStartError(null);

    try {
      const response = await startClinicalAttempt({
        scaleCode,
        locale: toApiLocale(locale),
        region: "GLOBAL",
        consent: {
          accepted: true,
          version: serverConsentVersion,
          locale: toApiLocale(locale),
        },
        clientVersion: `fe-${scaleCode.toLowerCase()}-1`,
      });

      setAttemptId(response.attempt_id);
      trackEvent("clinical_start", {
        scale_code: scaleCode,
        locale,
      });
      return response.attempt_id;
    } catch (error) {
      const mapped = mapClinicalError(error);
      setStartError(mapped.message);
      captureError(error, {
        route: "/tests/[slug]/take",
        slug,
        scaleCode,
        stage: "start_attempt",
      });
      return null;
    } finally {
      setStarting(false);
    }
  }, [attemptId, locale, scaleCode, serverConsentVersion, setAttemptId, slug]);

  const handleStart = async () => {
    if (!consentChecked) {
      return;
    }

    acceptConsent({
      version: serverConsentVersion || null,
      locale: toApiLocale(locale),
    });

    await ensureAttempt();
  };

  const handleSelect = (questionId: string, code: string) => {
    setAnswer(questionId, code);
  };

  const handleSubmit = async () => {
    const activeAttemptId = await ensureAttempt();
    if (!activeAttemptId) return;

    const firstMissing = questions.findIndex((item) => !answers[item.question_id]);
    if (firstMissing >= 0) {
      setCurrentIndex(firstMissing);
      setSubmitError(
        isZh
          ? `请先完成第 ${firstMissing + 1} 题再提交。`
          : `Please answer question ${firstMissing + 1} before submitting.`
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const durationMs = Math.max(1000, Date.now() - startedAt);
      const response = await submitClinicalAttempt({
        attemptId: activeAttemptId,
        durationMs,
        answers: questions.map((item) => ({
          question_id: item.question_id,
          code: answers[item.question_id] ?? "",
        })),
      });

      if (!response.ok) {
        throw new Error("Submit failed.");
      }

      const resultAttemptId = response.attempt_id ?? activeAttemptId;
      if (typeof window !== "undefined" && response.report) {
        const key = `${SUBMIT_REPORT_CACHE_PREFIX}${resultAttemptId}`;
        window.sessionStorage.setItem(key, JSON.stringify(response.report));
      }

      markSubmitted();
      trackEvent("clinical_submit", {
        scale_code: scaleCode,
        locale,
        duration_bucket: durationMs < 60000 ? "lt_1m" : durationMs < 180000 ? "1_3m" : "gte_3m",
      });
      resetAfterSubmit();
      router.push(withLocale(`/attempts/${resultAttemptId}/report`));
    } catch (error) {
      const mapped = mapClinicalError(error);
      setSubmitError(mapped.message);
      captureError(error, {
        route: "/tests/[slug]/take",
        slug,
        scaleCode,
        stage: "submit_attempt",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return (
      <QuizShell>
        <p className="m-0 text-sm text-slate-700">{isZh ? "正在加载题目..." : "Loading questions..."}</p>
      </QuizShell>
    );
  }

  if (questionError) {
    return (
      <QuizShell>
        <Alert>{questionError}</Alert>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          {isZh ? "重试" : "Retry"}
        </Button>
      </QuizShell>
    );
  }

  if (totalQuestions === 0 || !currentQuestion) {
    return (
      <QuizShell>
        <Alert>{isZh ? "当前量表暂无可用题目。" : "No questions are currently available."}</Alert>
      </QuizShell>
    );
  }

  if (needsConsent) {
    return (
      <ConsentGate
        locale={locale}
        text={consentText}
        version={serverConsentVersion || undefined}
        checked={consentChecked}
        starting={starting}
        error={startError}
        onCheckedChange={setConsentChecked}
        onStart={() => {
          void handleStart();
        }}
      />
    );
  }

  const options = questionOptionsForScale({
    scaleCode,
    question: currentQuestion,
    sdsOptions,
  });

  const moduleNode = pendingModuleTransition ? moduleMeta[pendingModuleTransition] : undefined;

  return (
    <div className="space-y-4">
      <QuizShell>
        <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
          <p className="m-0 font-semibold">{scaleCode}</p>
          <p className="m-0">
            {answeredCount}/{totalQuestions}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
          <div
            className="h-full bg-slate-900 transition-all"
            style={{ width: `${Math.max(0, Math.min(100, Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100)))}%` }}
          />
        </div>
      </QuizShell>

      {milestoneHint ? (
        <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--fm-text)]">
          {milestoneHint}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <div className="min-h-[48px] rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-2 text-xs text-[var(--fm-text-muted)] opacity-30">
          {previousQuestion ? `${isZh ? "上一题" : "Previous"}: ${currentIndex}` : (isZh ? "上一题" : "Previous")}
        </div>
        <div className="min-h-[48px] rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface)] px-3 py-2 text-xs font-semibold text-[var(--fm-text)] shadow-[var(--fm-shadow-md)] opacity-100">
          {isZh ? "当前题目" : "Current focus"}
        </div>
        <div className="min-h-[48px] rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-2 text-xs text-[var(--fm-text-muted)] opacity-30">
          {nextQuestion ? `${isZh ? "下一题" : "Next"}: ${currentIndex + 2}` : (isZh ? "下一题" : "Next")}
        </div>
      </div>

      {pendingModuleTransition ? (
        <ModuleTransitionCard
          locale={locale}
          moduleCode={pendingModuleTransition}
          title={moduleNode?.title}
          guidance={moduleNode?.guidance}
          onContinue={() => markModuleSeen(pendingModuleTransition)}
        />
      ) : (
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          total={totalQuestions}
          options={options}
          selectedCode={answers[currentQuestion.question_id]}
          emphasized
          onSelect={handleSelect}
        />
      )}

      {submitError ? <Alert>{submitError}</Alert> : null}

      <QuizShell>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentIndex <= 0 || submitting || Boolean(pendingModuleTransition)}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            {isZh ? "上一题" : "Previous"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={currentIndex >= totalQuestions - 1 || submitting || Boolean(pendingModuleTransition)}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            {isZh ? "下一题" : "Next"}
          </Button>

          <Button
            type="button"
            disabled={submitting || Boolean(pendingModuleTransition)}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {submitting ? (isZh ? "提交中..." : "Submitting...") : isZh ? "提交" : "Submit"}
          </Button>

          <Button type="button" variant="ghost" onClick={() => router.push(withLocale(`/tests/${slug}`))}>
            {isZh ? "返回详情" : "Back to details"}
          </Button>
        </div>
      </QuizShell>
    </div>
  );
}
