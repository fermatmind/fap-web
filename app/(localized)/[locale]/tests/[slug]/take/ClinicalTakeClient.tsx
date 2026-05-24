"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ModuleTransitionCard } from "@/components/clinical/quiz/ModuleTransitionCard";
import { ConsentGate } from "@/components/clinical/quiz/ConsentGate";
import { QuestionCard } from "@/components/clinical/quiz/QuestionCard";
import { QuizShell } from "@/components/clinical/quiz/QuizShell";
import { AdaptiveOptionGroup } from "@/components/quiz/immersive/AdaptiveOptionGroup";
import { ImmersiveTakeLayout } from "@/components/quiz/immersive/ImmersiveTakeLayout";
import { SubmitPhaseOverlay } from "@/components/quiz/immersive/SubmitPhaseOverlay";
import {
  useAutoAdvanceFlow,
  type LastSelectionContext,
} from "@/components/quiz/immersive/useAutoAdvanceFlow";
import { StaleDraftResetPrompt } from "@/components/quiz/StaleDraftResetPrompt";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackEvent } from "@/lib/analytics";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  isGuestTokenEndpointMissingError,
  isGuestTokenRequestError,
} from "@/lib/auth/fmToken";
import { ApiError } from "@/lib/api-client";
import {
  fetchClinicalQuestions,
  startClinicalAttempt,
  submitClinicalAttempt,
  type ClinicalScaleCode,
} from "@/lib/clinical/api";
import { type QuestionsMeta, type ScaleQuestionItem } from "@/lib/api/v0_3";
import { useClinicalAttemptStore } from "@/lib/clinical/attemptStore";
import { mapClinicalError } from "@/lib/clinical/errors";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { captureError } from "@/lib/observability/sentry";
import { useConstrainQuizUrlTokens } from "@/lib/quiz/urlTokenGuard";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";
import { resolveResultAttemptId } from "@/lib/attempt/resolveResultAttemptId";
import {
  createTakeFlowController,
  recoverStaleAttemptSubmit,
  resolveStaleDraftResetMessage,
  shouldBlockInvalidDraftOnTakePage,
} from "@/lib/attempt/staleAttempt";

const SDS_OPTION_CODES = ["A", "B", "C", "D"];
const SUBMIT_REPORT_CACHE_PREFIX = "fm_attempt_submit_report_v1_";

function cacheSubmitReport(resultAttemptId: string, report: unknown): void {
  if (typeof window === "undefined" || !report) {
    return;
  }

  try {
    const key = `${SUBMIT_REPORT_CACHE_PREFIX}${resultAttemptId}`;
    window.sessionStorage.setItem(key, JSON.stringify(report));
  } catch {
    // Storage availability must not turn an accepted submit into a failed flow.
  }
}

type ModuleMetaNode = {
  title?: string;
  guidance?: string;
};

type NormalizedScaleOption = {
  code: string;
  text: string;
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

function normalizeSdsOptions(format: string[]): NormalizedScaleOption[] {
  return format.reduce<NormalizedScaleOption[]>((acc, text, idx) => {
    const label = String(text ?? "").trim();
    if (!label) return acc;
    acc.push({
      code: SDS_OPTION_CODES[idx] ?? String.fromCharCode(65 + idx),
      text: label,
    });
    return acc;
  }, []);
}

function questionOptionsForScale({
  scaleCode,
  question,
  sdsOptions,
}: {
  scaleCode: ClinicalScaleCode;
  question: ScaleQuestionItem;
  sdsOptions: NormalizedScaleOption[];
}): NormalizedScaleOption[] {
  if (scaleCode === "SDS_20") {
    return sdsOptions;
  }

  return Array.isArray(question.options)
    ? question.options.reduce<NormalizedScaleOption[]>((acc, item) => {
        if (!item || typeof item !== "object") {
          return acc;
        }

        const code = typeof item.code === "string" ? item.code.trim() : "";
        if (!code) {
          return acc;
        }

        const textCandidates = [item.text, item.label, code];
        const text =
          textCandidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0) ?? code;

        acc.push({ code, text });
        return acc;
      }, [])
    : [];
}

function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

function toUiMessage(error: unknown, fallback: string, locale: "en" | "zh"): string {
  if (isGuestTokenEndpointMissingError(error)) {
    return locale === "zh"
      ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
      : "Submission is temporarily unavailable because authentication service is not configured.";
  }
  if (isGuestTokenRequestError(error)) {
    return locale === "zh"
      ? "认证服务暂时不可用，请稍后重试。"
      : "Authentication service is temporarily unavailable. Please retry later.";
  }
  if (isUnauthorizedError(error)) {
    return locale === "zh" ? "登录状态已失效，请刷新页面后重试。" : "Authentication expired. Please refresh and try again.";
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

function resolveGuestTokenTelemetry(error: unknown): {
  statusCode?: number;
  errorCode: string;
  requestId?: string;
} {
  if (isGuestTokenRequestError(error)) {
    return {
      statusCode: error.status,
      errorCode: error.errorCode ?? error.reason.toUpperCase(),
      requestId: error.requestId,
    };
  }

  return {
    errorCode: "UNKNOWN",
  };
}

export default function ClinicalTakeClient({
  slug,
  scaleCode,
}: {
  slug: string;
  scaleCode: ClinicalScaleCode;
}) {
  const searchParams = useSearchParams();
  const forceNewAttemptRequested = searchParams.get("force_new_attempt") === "1";
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const isZh = locale === "zh";
  const router = useRouter();
  useConstrainQuizUrlTokens({ pathname, router, searchParams });
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const anonId = useMemo(() => getOrCreateAnonId(), []);

  const attemptId = useClinicalAttemptStore((state) => state.attemptId);
  const answers = useClinicalAttemptStore((state) => state.answers);
  const currentIndex = useClinicalAttemptStore((state) => state.currentIndex);
  const startedAt = useClinicalAttemptStore((state) => state.startedAt);
  const consentAcceptedAt = useClinicalAttemptStore((state) => state.consentAcceptedAt);
  const consentVersion = useClinicalAttemptStore((state) => state.consentVersion);
  const consentLocale = useClinicalAttemptStore((state) => state.consentLocale);
  const seenModuleTransitions = useClinicalAttemptStore((state) => state.seenModuleTransitions);

  const initSession = useClinicalAttemptStore((state) => state.initSession);
  const hydrateAnonId = useClinicalAttemptStore((state) => state.hydrateAnonId);
  const setAttemptId = useClinicalAttemptStore((state) => state.setAttemptId);
  const acceptConsent = useClinicalAttemptStore((state) => state.acceptConsent);
  const setAnswer = useClinicalAttemptStore((state) => state.setAnswer);
  const setCurrentIndex = useClinicalAttemptStore((state) => state.setCurrentIndex);
  const markModuleSeen = useClinicalAttemptStore((state) => state.markModuleSeen);
  const markSubmitted = useClinicalAttemptStore((state) => state.markSubmitted);
  const clearAttemptMeta = useClinicalAttemptStore((state) => state.clearAttemptMeta);
  const resetAfterSubmit = useClinicalAttemptStore((state) => state.resetAfterSubmit);

  const [questions, setQuestions] = useState<ScaleQuestionItem[]>([]);
  const [questionsMeta, setQuestionsMeta] = useState<QuestionsMeta | undefined>();
  const [sdsOptions, setSdsOptions] = useState<NormalizedScaleOption[]>([]);
  const [authBootstrapping, setAuthBootstrapping] = useState(true);
  const [authBlockError, setAuthBlockError] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [staleDraftError, setStaleDraftError] = useState<string | null>(null);
  const [milestoneHint, setMilestoneHint] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);
  const [submitOverlayVisible, setSubmitOverlayVisible] = useState(false);
  const [submitOverlayPhase, setSubmitOverlayPhase] = useState(0);
  const mountedRef = useRef(true);
  const takeFlowRef = useRef(createTakeFlowController());
  const latestAnswersRef = useRef<Record<string, string>>(answers);
  const submitInFlightRef = useRef(false);
  const autoRecoveryAttemptedRef = useRef(false);
  const recoveringAttemptRef = useRef(false);
  const forceNewAttemptAppliedRef = useRef(false);
  const cancelAutoAdvanceRef = useRef<() => void>(() => {});
  const immersiveEnabled = isImmersiveSingleFlowEnabled();

  const trackGuestTokenFailure = useCallback(
    (stage: "bootstrap" | "questions" | "start_attempt" | "submit_attempt", error: unknown) => {
      const telemetry = resolveGuestTokenTelemetry(error);
      trackEvent("auth_guest_token_failure", {
        scale_code: scaleCode,
        stage,
        status_code: telemetry.statusCode,
        error_code: telemetry.errorCode,
        request_id: telemetry.requestId,
        route: "/tests/[slug]/take",
        locale,
      });
    },
    [locale, scaleCode]
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      setAuthBootstrapping(true);
      setAuthBlockError(null);

      try {
        await ensureFmTokenReady({
          anonId: anonId || undefined,
          locale,
          forceRefresh: true,
        });
      } catch (error) {
        if (!active) return;
        trackGuestTokenFailure("bootstrap", error);

        if (isGuestTokenEndpointMissingError(error)) {
          setAuthBlockError(
            locale === "zh"
              ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
              : "Submission is temporarily unavailable because authentication service is not configured."
          );
          const telemetry = resolveGuestTokenTelemetry(error);
          trackEvent("submit_blocked_no_token_service", {
            scale_code: scaleCode,
            status_code: telemetry.statusCode,
            error_code: telemetry.errorCode,
            request_id: telemetry.requestId,
            route: "/tests/[slug]/take",
            locale,
          });
        }
      } finally {
        if (active) {
          setAuthBootstrapping(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [anonId, locale, scaleCode, trackGuestTokenFailure]);

  const runWithAuthRetry = useCallback(
    async <T,>(
      stage: "questions" | "start_attempt" | "submit_attempt",
      runner: () => Promise<T>
    ): Promise<T> =>
      runWithGuestTokenRetry({
        runner,
        anonId: anonId || undefined,
        locale,
        onGuestTokenFailure: (guestTokenError) => {
          trackGuestTokenFailure(stage, guestTokenError);

          if (isGuestTokenEndpointMissingError(guestTokenError)) {
            setAuthBlockError(
              locale === "zh"
                ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
                : "Submission is temporarily unavailable because authentication service is not configured."
            );
            const telemetry = resolveGuestTokenTelemetry(guestTokenError);
            trackEvent("submit_blocked_no_token_service", {
              scale_code: scaleCode,
              status_code: telemetry.statusCode,
              error_code: telemetry.errorCode,
              request_id: telemetry.requestId,
              route: "/tests/[slug]/take",
              locale,
            });
          }
        },
      }),
    [anonId, locale, scaleCode, trackGuestTokenFailure]
  );

  const serverConsentVersion =
    typeof questionsMeta?.consent?.version === "string" ? questionsMeta.consent.version.trim() : "";
  const serverConsentText =
    typeof questionsMeta?.consent?.text === "string" ? questionsMeta.consent.text.trim() : "";

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < totalQuestions - 1 ? questions[currentIndex + 1] : null;
  const answeredCount = useMemo(
    () => questions.reduce((count, item) => count + (answers[item.question_id] ? 1 : 0), 0),
    [answers, questions]
  );
  const shouldBlockStaleDraft = shouldBlockInvalidDraftOnTakePage({
    answeredCount,
    totalQuestions: totalQuestions,
    attemptId,
  });

  const moduleMeta = useMemo(() => normalizeModuleMeta(questionsMeta?.modules), [questionsMeta?.modules]);

  const needsConsent = useMemo(() => {
    if (!consentAcceptedAt) return true;
    if (!serverConsentVersion) return false;
    return consentVersion !== serverConsentVersion;
  }, [consentAcceptedAt, consentVersion, serverConsentVersion]);
  const consentRequiredMessage =
    isZh
      ? "请先阅读并同意知情同意说明，然后再开始答题。"
      : "Please review and accept informed consent before answering.";

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

  const isFlowActive = useCallback((runId?: number) => (
    mountedRef.current && takeFlowRef.current.isActive(runId)
  ), []);

  const cancelPendingSubmitSideEffects = useCallback(() => {
    takeFlowRef.current.cancelCurrentRun();
    cancelAutoAdvanceRef.current();
    submitInFlightRef.current = false;
    recoveringAttemptRef.current = false;
  }, []);

  useEffect(() => {
    hydrateAnonId(anonId || null);
  }, [anonId, hydrateAnonId]);

  useEffect(() => {
    latestAnswersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (loadingQuestions) {
      return;
    }

    if (shouldBlockStaleDraft) {
      clearAttemptMeta();
      cancelPendingSubmitSideEffects();
      setSubmitOverlayVisible(false);
      setSubmitOverlayPhase(0);
      setSubmitting(false);
      setSubmitError(null);
      setStartError(null);
      setStaleDraftError(resolveStaleDraftResetMessage(locale));
      return;
    }

    setStaleDraftError(null);
  }, [cancelPendingSubmitSideEffects, clearAttemptMeta, loadingQuestions, locale, shouldBlockStaleDraft]);

  useEffect(() => {
    const takeFlow = takeFlowRef.current;
    return () => {
      mountedRef.current = false;
      takeFlow.dispose();
      submitInFlightRef.current = false;
      recoveringAttemptRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (authBlockError) {
        setLoadingQuestions(false);
        return;
      }

      setLoadingQuestions(true);
      setQuestionError(null);

      try {
        const response = await runWithAuthRetry("questions", () =>
          fetchClinicalQuestions({
            scaleCode,
            locale: toApiLocale(locale),
            region: "GLOBAL",
          })
        );

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
        setQuestionError(toUiMessage(error, mapped.message, locale));
        const classified = classifyApiError(error);
        trackEvent("questions_load_failure", {
          scale_code: scaleCode,
          stage: "questions",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          request_id: classified.requestId,
          route: "/tests/[slug]/take",
          locale,
        });
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
  }, [authBlockError, initSession, locale, runWithAuthRetry, scaleCode, slug]);

  useEffect(() => {
    if (!needsConsent || !attemptId) {
      return;
    }
    setAttemptId(null);
  }, [attemptId, needsConsent, setAttemptId]);

  const handleAcceptConsentAndStart = useCallback(() => {
    if (loadingQuestions || totalQuestions === 0 || !needsConsent) {
      return;
    }

    acceptConsent({
      version: serverConsentVersion || null,
      locale: toApiLocale(locale),
    });
    setConsentChecked(false);
    setStartError(null);
  }, [acceptConsent, loadingQuestions, locale, needsConsent, serverConsentVersion, totalQuestions]);

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
      takeFlowRef.current.schedule(() => {
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

  const buildAnswersSnapshot = useCallback((pendingSelection?: LastSelectionContext) => {
    const snapshot = {
      ...latestAnswersRef.current,
    };

    if (pendingSelection?.questionId && pendingSelection.code) {
      snapshot[pendingSelection.questionId] = pendingSelection.code;
    }

    return snapshot;
  }, []);

  const startFreshAttempt = useCallback(async (runId?: number) => {
    if (authBlockError || staleDraftError) {
      return null;
    }

    if (needsConsent) {
      setStartError(consentRequiredMessage);
      return null;
    }

    setStarting(true);
    setStartError(null);

    try {
      const response = await runWithAuthRetry("start_attempt", () =>
        startClinicalAttempt({
          scaleCode,
          locale: toApiLocale(locale),
          region: "GLOBAL",
          consent: {
            accepted: true,
            version: serverConsentVersion,
            locale: toApiLocale(locale),
          },
          clientVersion: `fe-${scaleCode.toLowerCase()}-1`,
        })
      );
      if (!isFlowActive(runId)) {
        return null;
      }

      setAttemptId(response.attempt_id);
      trackEvent("start_attempt", {
        slug,
        test_slug: slug,
        scale_code: scaleCode,
        locale,
      });
      return response.attempt_id;
    } catch (error) {
      if (!isFlowActive(runId)) {
        return null;
      }
      const mapped = mapClinicalError(error);
      setStartError(toUiMessage(error, mapped.message, locale));
      const classified = classifyApiError(error);
      trackEvent("submit_failure", {
        scale_code: scaleCode,
        stage: "start_attempt",
        status_group: classified.statusGroup,
        status_code: classified.statusCode,
        error_code: classified.errorCode,
        route: "/tests/[slug]/take",
        locale,
      });
      captureError(error, {
        route: "/tests/[slug]/take",
        slug,
        scaleCode,
        stage: "start_attempt",
      });
      return null;
    } finally {
      if (isFlowActive(runId)) {
        setStarting(false);
      }
    }
  }, [authBlockError, consentRequiredMessage, isFlowActive, locale, needsConsent, runWithAuthRetry, scaleCode, serverConsentVersion, setAttemptId, slug, staleDraftError]);

  const ensureAttempt = useCallback(async (runId?: number) => {
    if (authBlockError || staleDraftError || recoveringAttemptRef.current) {
      return null;
    }

    if (forceNewAttemptRequested && !forceNewAttemptAppliedRef.current) {
      forceNewAttemptAppliedRef.current = true;
      clearAttemptMeta();
      return startFreshAttempt(runId);
    }

    if (attemptId) {
      return attemptId;
    }

    return startFreshAttempt(runId);
  }, [attemptId, authBlockError, clearAttemptMeta, forceNewAttemptRequested, staleDraftError, startFreshAttempt]);

  const handleSelect = (questionId: string, code: string) => {
    if (needsConsent) {
      setStartError(consentRequiredMessage);
      return;
    }

    setAnswer(questionId, code);
  };

  const submitAttemptWithId = useCallback(async (
    activeAttemptId: string,
    answersSnapshot: Record<string, string>,
    submitConsentVersion: string,
    submitConsentLocale: string,
    runId?: number,
  ): Promise<string> => {
    const durationMs = Math.max(1000, Date.now() - startedAt);
    const response = await runWithAuthRetry("submit_attempt", () =>
      submitClinicalAttempt({
        attemptId: activeAttemptId,
        durationMs,
        answers: questions.map((item) => ({
          question_id: item.question_id,
          code: answersSnapshot[item.question_id] ?? "",
        })),
        consent: {
          accepted: true,
          version: submitConsentVersion,
          locale: submitConsentLocale,
        },
      })
    );
    if (!isFlowActive(runId)) {
      return "";
    }

    if (!response.ok) {
      throw new Error("Submit failed.");
    }

    const resultAttemptId = resolveResultAttemptId(response, activeAttemptId);
    cacheSubmitReport(resultAttemptId, response.report);

    markSubmitted();
    trackEvent("submit_attempt", {
      slug,
      test_slug: slug,
      attempt_id: activeAttemptId,
      scale_code: scaleCode,
      locale,
      duration_bucket: durationMs < 60000 ? "lt_1m" : durationMs < 180000 ? "1_3m" : "gte_3m",
    });
    return resultAttemptId;
  }, [isFlowActive, locale, markSubmitted, questions, runWithAuthRetry, scaleCode, slug, startedAt]);

  const handleSubmit = useCallback(async (pendingSelection?: LastSelectionContext, runId?: number): Promise<string | null> => {
    if (submitInFlightRef.current || staleDraftError) {
      return null;
    }

    submitInFlightRef.current = true;
    const activeRunId = typeof runId === "number" ? runId : takeFlowRef.current.beginRun();
    const submitConsentVersion = String(consentVersion ?? serverConsentVersion ?? "").trim();
    const submitConsentLocale = String(consentLocale ?? toApiLocale(locale)).trim();
    if (needsConsent || !consentAcceptedAt || !submitConsentVersion || !submitConsentLocale) {
      if (isFlowActive(activeRunId)) {
        setSubmitError(
          isZh
            ? "当前会话缺少同意书快照，请返回详情页重新开始测评。"
            : "Consent snapshot is missing for this session. Please restart the assessment from test details."
        );
      }
      submitInFlightRef.current = false;
      return null;
    }

    const activeAttemptId = await ensureAttempt(activeRunId);
    if (!isFlowActive(activeRunId)) {
      submitInFlightRef.current = false;
      return null;
    }
    if (!activeAttemptId) {
      submitInFlightRef.current = false;
      return null;
    }

    const answersSnapshot = buildAnswersSnapshot(pendingSelection);
    const firstMissing = questions.findIndex((item) => !answersSnapshot[item.question_id]);
    if (firstMissing >= 0) {
      if (isFlowActive(activeRunId)) {
        setCurrentIndex(firstMissing);
        setSubmitError(
          isZh
            ? `请先完成第 ${firstMissing + 1} 题再提交。`
            : `Please answer question ${firstMissing + 1} before submitting.`
        );
      }
      submitInFlightRef.current = false;
      return null;
    }

    if (!isFlowActive(activeRunId)) {
      submitInFlightRef.current = false;
      return null;
    }

    setSubmitting(true);
    setSubmitError(null);
    setStaleDraftError(null);

    try {
      const resultAttemptId = await submitAttemptWithId(
        activeAttemptId,
        answersSnapshot,
        submitConsentVersion,
        submitConsentLocale,
        activeRunId
      );
      if (!isFlowActive(activeRunId) || !resultAttemptId) {
        return null;
      }
      return resultAttemptId;
    } catch (error) {
      recoveringAttemptRef.current = true;
      const recovery = await recoverStaleAttemptSubmit({
        error,
        alreadyRecovered: autoRecoveryAttemptedRef.current,
        clearAttemptState: () => {
          clearAttemptMeta();
          setStartError(null);
        },
        startFreshAttempt: () => startFreshAttempt(activeRunId),
        submitFreshAttempt: (nextAttemptId) =>
          submitAttemptWithId(nextAttemptId, answersSnapshot, submitConsentVersion, submitConsentLocale, activeRunId),
      });
      if (!isFlowActive(activeRunId)) {
        return null;
      }
      recoveringAttemptRef.current = false;

      if (recovery.kind === "recovered") {
        autoRecoveryAttemptedRef.current = true;
        setSubmitError(null);
        setStaleDraftError(null);
        return recovery.value;
      }

      if (recovery.kind === "failed") {
        autoRecoveryAttemptedRef.current = true;
        const message = resolveStaleDraftResetMessage(locale);
        setStaleDraftError(message);
        setSubmitError(null);
        return null;
      }

      const mapped = mapClinicalError(error);
      setSubmitError(toUiMessage(error, mapped.message, locale));
      const classified = classifyApiError(error);
      trackEvent("submit_failure", {
        scale_code: scaleCode,
        stage: "submit_attempt",
        status_group: classified.statusGroup,
        status_code: classified.statusCode,
        error_code: classified.errorCode,
        route: "/tests/[slug]/take",
        locale,
      });
      captureError(error, {
        route: "/tests/[slug]/take",
        slug,
        scaleCode,
        stage: "submit_attempt",
      });
      return null;
    } finally {
      recoveringAttemptRef.current = false;
      if (isFlowActive(activeRunId)) {
        setSubmitting(false);
      }
      submitInFlightRef.current = false;
    }
  }, [
    buildAnswersSnapshot,
    clearAttemptMeta,
    consentAcceptedAt,
    consentLocale,
    consentVersion,
    ensureAttempt,
    isFlowActive,
    isZh,
    locale,
    needsConsent,
    questions,
    scaleCode,
    serverConsentVersion,
    setCurrentIndex,
    slug,
    staleDraftError,
    startFreshAttempt,
    submitAttemptWithId,
  ]);

  const finalizeSuccessfulSubmit = useCallback(
    (resultAttemptId: string) => {
      cancelPendingSubmitSideEffects();
      resetAfterSubmit();
      router.push(withLocale(`/attempts/${resultAttemptId}/report`));
    },
    [cancelPendingSubmitSideEffects, resetAfterSubmit, router, withLocale]
  );

  const startSubmitOverlayPhases = useCallback((runId: number) => {
    setSubmitOverlayPhase(0);

    trackEvent("ui_report_loading_phase", {
      scale_code: scaleCode,
      phase: "saving",
      locked: true,
      variant: "free",
      locale,
    });

    takeFlowRef.current.schedule(() => {
      setSubmitOverlayPhase(1);
      trackEvent("ui_report_loading_phase", {
        scale_code: scaleCode,
        phase: "analyzing",
        locked: true,
        variant: "free",
        locale,
      });
    }, 800, runId);

    takeFlowRef.current.schedule(() => {
      setSubmitOverlayPhase(2);
      trackEvent("ui_report_loading_phase", {
        scale_code: scaleCode,
        phase: "generating",
        locked: true,
        variant: "free",
        locale,
      });
    }, 1500, runId);
  }, [locale, scaleCode]);

  const handleSubmitWithOverlay = useCallback(async (pendingSelection?: LastSelectionContext) => {
    if (submitOverlayVisible || submitting) return;
    const runId = takeFlowRef.current.beginRun();
    setSubmitOverlayVisible(true);
    startSubmitOverlayPhases(runId);

    const resultAttemptId = await handleSubmit(pendingSelection, runId);
    if (!isFlowActive(runId)) {
      return;
    }

    const delayFinished = await takeFlowRef.current.wait(2200, runId);
    if (!delayFinished || !isFlowActive(runId)) {
      return;
    }

    if (!resultAttemptId) {
      setSubmitOverlayVisible(false);
      setSubmitOverlayPhase(0);
      return;
    }

    finalizeSuccessfulSubmit(resultAttemptId);
  }, [
    finalizeSuccessfulSubmit,
    handleSubmit,
    isFlowActive,
    startSubmitOverlayPhases,
    submitOverlayVisible,
    submitting,
  ]);

  const {
    transitionDirection,
    isTransitioning,
    selectAndAdvance,
    goPrevious,
    cancelPending,
  } = useAutoAdvanceFlow({
    currentIndex,
    total: totalQuestions,
    onMove: (index) => setCurrentIndex(index),
    onLast: handleSubmitWithOverlay,
    confirmDelayMs: 200,
    enterDurationMs: 280,
  });

  useEffect(() => {
    cancelAutoAdvanceRef.current = cancelPending;
  }, [cancelPending]);

  if (authBootstrapping || loadingQuestions) {
    return (
      <QuizShell>
        <p className="m-0 text-sm text-slate-700">
          {authBootstrapping
            ? isZh
              ? "正在初始化安全会话..."
              : "Preparing secure session..."
            : isZh
              ? "正在加载题目..."
              : "Loading questions..."}
        </p>
      </QuizShell>
    );
  }

  if (authBlockError || questionError) {
    return (
      <QuizShell>
        <Alert>{authBlockError ?? questionError}</Alert>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          {isZh ? "重试" : "Retry"}
        </Button>
      </QuizShell>
    );
  }

  if (staleDraftError) {
    return (
      <QuizShell>
      <StaleDraftResetPrompt
        locale={locale}
        message={staleDraftError}
        onReset={() => {
          cancelPendingSubmitSideEffects();
          autoRecoveryAttemptedRef.current = false;
          resetAfterSubmit();
          setStaleDraftError(null);
          setSubmitError(null);
            setStartError(null);
            router.replace(withLocale(`/tests/${slug}`));
          }}
        />
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
        text={serverConsentText}
        version={serverConsentVersion || undefined}
        checked={consentChecked}
        starting={starting}
        error={startError}
        onCheckedChange={setConsentChecked}
        onStart={handleAcceptConsentAndStart}
      />
    );
  }

  const options = questionOptionsForScale({
    scaleCode,
    question: currentQuestion,
    sdsOptions,
  });

  const moduleNode = pendingModuleTransition ? moduleMeta[pendingModuleTransition] : undefined;

  if (immersiveEnabled) {
    return (
      <>
        <ImmersiveTakeLayout
          backHref={withLocale(`/tests/${slug}`)}
          backLabel={dict.quiz.immersive.backToDetails}
          current={currentIndex + 1}
          total={totalQuestions}
          answered={answeredCount}
          previousLabel={dict.quiz.immersive.previous}
          previousDisabled={currentIndex <= 0 || starting || submitting || submitOverlayVisible}
          onPrevious={goPrevious}
          transitionKey={currentQuestion.question_id}
          transitionDirection={transitionDirection}
          isTransitioning={isTransitioning}
          footerSlot={
            <div className="flex flex-wrap items-center justify-end gap-[var(--fm-gap-xs)]">
              {submitError ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={starting || submitting || submitOverlayVisible}
                  onClick={() => {
                    void handleSubmitWithOverlay();
                  }}
                >
                  {dict.quiz.immersive.submitRetry}
                </Button>
              ) : null}
              <Button type="button" variant="ghost" onClick={() => router.push(withLocale(`/tests/${slug}`))}>
                {dict.quiz.immersive.backToDetails}
              </Button>
            </div>
          }
        >
          <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
              Question {currentIndex + 1} / {totalQuestions}
            </p>
            <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{currentQuestion.text}</h2>

            {milestoneHint ? (
              <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-sm font-medium text-[var(--fm-text)]">
                {milestoneHint}
              </div>
            ) : null}

            <AdaptiveOptionGroup
              questionId={currentQuestion.question_id}
              options={options}
              value={answers[currentQuestion.question_id]}
              noOptionsLabel={dict.quiz.immersive.noOptions}
              onChange={(code) =>
                selectAndAdvance(() => {
                  handleSelect(currentQuestion.question_id, code);
                }, {
                  questionId: currentQuestion.question_id,
                  code,
                })
              }
            />

            {startError ? <Alert>{startError}</Alert> : null}
            {submitError ? <Alert>{submitError}</Alert> : null}
          </article>
        </ImmersiveTakeLayout>

        <SubmitPhaseOverlay
          visible={submitOverlayVisible}
          phases={dict.quiz.immersive.submitPhases}
          phaseIndex={submitOverlayPhase}
        />
      </>
    );
  }

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      <QuizShell>
        <div className="flex items-center justify-between gap-[var(--fm-gap-sm)] text-sm text-[var(--fm-text)]">
          <p className="m-0 font-semibold">{scaleCode}</p>
          <p className="m-0">
            {answeredCount}/{totalQuestions}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--fm-surface-muted)]" aria-hidden>
          <div
            className="h-full bg-gradient-to-r from-[var(--fm-trust-blue)] to-[var(--fm-teal)] transition-all"
            style={{ width: `${Math.max(0, Math.min(100, Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100)))}%` }}
          />
        </div>
      </QuizShell>

      {milestoneHint ? (
        <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-sm font-medium text-[var(--fm-text)]">
          {milestoneHint}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-[var(--fm-gap-xs)]">
        <div className="min-h-[48px] rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-xs text-[var(--fm-text-muted)] opacity-30">
          {previousQuestion ? `${isZh ? "上一题" : "Previous"}: ${currentIndex}` : (isZh ? "上一题" : "Previous")}
        </div>
        <div className="min-h-[48px] rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-xs font-semibold text-[var(--fm-text)] shadow-[var(--fm-shadow-md)] opacity-100">
          {isZh ? "当前题目" : "Current focus"}
        </div>
        <div className="min-h-[48px] rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-xs text-[var(--fm-text-muted)] opacity-30">
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

      {startError ? <Alert>{startError}</Alert> : null}
      {submitError ? <Alert>{submitError}</Alert> : null}

      <QuizShell>
        <div className="flex flex-wrap items-center gap-[var(--fm-gap-xs)]">
          <Button
            type="button"
            variant="outline"
            disabled={currentIndex <= 0 || starting || submitting || Boolean(pendingModuleTransition)}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            {isZh ? "上一题" : "Previous"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={currentIndex >= totalQuestions - 1 || starting || submitting || Boolean(pendingModuleTransition)}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            {isZh ? "下一题" : "Next"}
          </Button>

          <Button
            type="button"
            disabled={starting || submitting || Boolean(pendingModuleTransition)}
            onClick={() => {
              void handleSubmit().then((resultAttemptId) => {
                if (resultAttemptId) {
                  finalizeSuccessfulSubmit(resultAttemptId);
                }
              });
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
