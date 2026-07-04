"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuizShell } from "@/components/quiz/QuizShell";
import { QuizTakeHeaderV2 } from "@/components/quiz/QuizTakeHeaderV2";
import { ImmersiveTakeLayout } from "@/components/quiz/immersive/ImmersiveTakeLayout";
import { SubmitPhaseOverlay } from "@/components/quiz/immersive/SubmitPhaseOverlay";
import { V2LikertScale } from "@/components/quiz/immersive/V2LikertScale";
import {
  useAutoAdvanceFlow,
  type LastSelectionContext,
} from "@/components/quiz/immersive/useAutoAdvanceFlow";
import { StaleDraftResetPrompt } from "@/components/quiz/StaleDraftResetPrompt";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  isGuestTokenEndpointMissingError,
  isGuestTokenRequestError,
} from "@/lib/auth/fmToken";
import { ApiError } from "@/lib/api-client";
import { getOrCreateAnonId } from "@/lib/anon";
import {
  buildBig5TrackingContext,
  trackBig5Event,
  type Big5TrackingContext,
} from "@/lib/big5/analytics";
import {
  fetchBig5Lookup,
  fetchBig5Questions,
  resolveBig5RolloutState,
  startBig5Attempt,
  submitBig5Attempt,
} from "@/lib/big5/api";
import {
  formatBig5RetryCountdown,
  mapBig5Error,
  type Big5UiError,
} from "@/lib/big5/errors";
import { normalizeBig5FormCode, resolveBig5FormMeta } from "@/lib/big5/forms";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";
import { classifyApiError } from "@/lib/observability/httpError";
import { useConstrainQuizUrlTokens } from "@/lib/quiz/urlTokenGuard";
import { isImmersiveSingleFlowEnabled } from "@/lib/quiz/uxFlags";
import { resolveResultAttemptId } from "@/lib/attempt/resolveResultAttemptId";
import { buildTestKpiMetadata, buildTestKpiTrackingPayload } from "@/lib/tracking/testKpiMetadata";
import {
  createTakeFlowController,
  recoverStaleAttemptSubmit,
  resolveStaleDraftResetMessage,
} from "@/lib/attempt/staleAttempt";

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

export default function Big5TakeClient({
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
  useConstrainQuizUrlTokens({ pathname, router, searchParams });
  const forceNewAttemptRequested = searchParams.get("force_new_attempt") === "1";
  const anonId = useMemo(() => getOrCreateAnonId(), []);

  const attemptId = useBig5AttemptStore((store) => store.attemptId);
  const answers = useBig5AttemptStore((store) => store.answers);
  const currentIndex = useBig5AttemptStore((store) => store.currentIndex);
  const startedAt = useBig5AttemptStore((store) => store.startedAt);

  const setAttemptMeta = useBig5AttemptStore((store) => store.setAttemptMeta);
  const setAnswer = useBig5AttemptStore((store) => store.setAnswer);
  const setCurrentIndex = useBig5AttemptStore((store) => store.setCurrentIndex);
  const hydrateAnonId = useBig5AttemptStore((store) => store.hydrateAnonId);
  const setSessionContext = useBig5AttemptStore((store) => store.setSessionContext);
  const markSubmitted = useBig5AttemptStore((store) => store.markSubmitted);
  const clearAttemptMeta = useBig5AttemptStore((store) => store.clearAttemptMeta);
  const resetAfterSubmit = useBig5AttemptStore((store) => store.resetAfterSubmit);
  const resetAll = useBig5AttemptStore((store) => store.resetAll);

  const [questions, setQuestions] = useState<Array<{ question_id: string; text: string; options: Array<{ code: string; text: string }> }>>([]);
  const [authBootstrapping, setAuthBootstrapping] = useState(true);
  const [authBlockError, setAuthBlockError] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [rolloutChecking, setRolloutChecking] = useState(true);
  const [rolloutBlocked, setRolloutBlocked] = useState(false);

  const [serverDisclaimerVersion, setServerDisclaimerVersion] = useState<string | null>(null);
  const [serverDisclaimerHash, setServerDisclaimerHash] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitErrorAction, setSubmitErrorAction] = useState<Big5UiError["action"] | null>(null);
  const [submitCanRetry, setSubmitCanRetry] = useState(false);
  const [staleDraftError, setStaleDraftError] = useState<string | null>(null);

  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [trackingBase, setTrackingBase] = useState<Big5TrackingContext | null>(null);
  const [packVersion, setPackVersion] = useState<string>("BIG5_OCEAN");
  const [milestoneHint, setMilestoneHint] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);
  const [submitOverlayVisible, setSubmitOverlayVisible] = useState(false);
  const [submitOverlayPhase, setSubmitOverlayPhase] = useState(0);
  const mountedRef = useRef(true);
  const takeFlowRef = useRef(createTakeFlowController());
  const latestAnswersRef = useRef<Record<string, string>>(answers);
  const ensureAttemptPromiseRef = useRef<Promise<string | null> | null>(null);
  const submitInFlightRef = useRef(false);
  const autoRecoveryAttemptedRef = useRef(false);
  const recoveringAttemptRef = useRef(false);
  const forceNewAttemptAppliedRef = useRef(false);
  const cancelAutoAdvanceRef = useRef<() => void>(() => {});
  const immersiveEnabled = isImmersiveSingleFlowEnabled();
  const resolvedFormCode = useMemo(
    () => normalizeBig5FormCode(formCode ?? searchParams.get("form") ?? searchParams.get("form_code")),
    [formCode, searchParams]
  );
  const resolvedFormMeta = useMemo(
    () => resolveBig5FormMeta(resolvedFormCode),
    [resolvedFormCode]
  );
  const testKpiMetadata = useMemo(
    () => buildTestKpiMetadata({ scaleCode: "BIG5_OCEAN", formCode: resolvedFormCode, locale }),
    [locale, resolvedFormCode]
  );
  const effectiveEstimatedMinutes = estimatedMinutes ?? resolvedFormMeta.estimatedMinutes;
  const savedSlug = useBig5AttemptStore((store) => store.slug);
  const savedFormCode = useBig5AttemptStore((store) => store.formCode);
  const matchesSavedAttempt = useMemo(() => {
    if (!attemptId) {
      return false;
    }
    return savedSlug === slug && savedFormCode === resolvedFormCode;
  }, [attemptId, resolvedFormCode, savedFormCode, savedSlug, slug]);

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.reduce((sum, item) => sum + (answers[item.question_id] ? 1 : 0), 0),
    [answers, questions]
  );
  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const big5RetakeCopy = dict.quiz.big5Retake;
  const retryCountdownText = useCallback((seconds: number): string => (
    formatBig5RetryCountdown(locale, seconds, big5RetakeCopy)
  ), [big5RetakeCopy, locale]);
  const inCooldown = cooldownSeconds > 0;
  const progressStatus = locale === "zh"
    ? `${answeredCount}/${total} 已答 · 约 ${effectiveEstimatedMinutes} 分钟`
    : `${answeredCount}/${total} answered · about ${effectiveEstimatedMinutes} min`;
  const trackingFallback = useMemo<Big5TrackingContext>(
    () => ({
      scale_code: testKpiMetadata.scale_code,
      pack_version: packVersion,
      manifest_hash: "pending",
      norms_version: "unavailable",
      quality_level: "unrated",
      locked: true,
      variant: "free",
      sku_id: "",
      locale,
    }),
    [locale, packVersion, testKpiMetadata.scale_code]
  );

  const buildEventPayload = useCallback(
    (payload: Record<string, unknown>) =>
      buildTestKpiTrackingPayload(testKpiMetadata, {
        ...(trackingBase ?? trackingFallback),
        ...payload,
      }),
    [testKpiMetadata, trackingBase, trackingFallback]
  );

  const handleRestartTest = useCallback(() => {
    resetAll();
    setCooldownSeconds(0);
    router.replace(withLocale(`/tests/${slug}`));
  }, [resetAll, router, slug, withLocale]);

  const applyUiError = useCallback((scope: "start" | "submit" | "question", mapped: Big5UiError) => {
    if (mapped.retryAfterSeconds && mapped.retryAfterSeconds > 0) {
      setCooldownSeconds(Math.ceil(mapped.retryAfterSeconds));
    }

    if (scope === "start") {
      setStartError(mapped.message);
      return;
    }

    if (scope === "submit") {
      setSubmitError(mapped.message);
      setSubmitErrorAction(mapped.action ?? null);
      return;
    }

    setQuestionError(mapped.message);
  }, []);

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
    setSessionContext({
      slug,
      formCode: resolvedFormCode,
      anonId: anonId || null,
    });
  }, [anonId, resolvedFormCode, setSessionContext, slug]);

  const trackGuestTokenFailure = useCallback(
    (stage: "bootstrap" | "questions" | "start_attempt" | "submit_attempt", error: unknown) => {
      const telemetry = resolveGuestTokenTelemetry(error);
      trackEvent("auth_guest_token_failure", buildTestKpiTrackingPayload(testKpiMetadata, {
        stage,
        status_code: telemetry.statusCode,
        error_code: telemetry.errorCode,
        request_id: telemetry.requestId,
        route: "/tests/[slug]/take",
      }));
    },
    [testKpiMetadata]
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
        });
      } catch (error) {
        if (!active) return;
        trackGuestTokenFailure("bootstrap", error);

        if (isGuestTokenEndpointMissingError(error)) {
          const message =
            locale === "zh"
              ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
              : "Submission is temporarily unavailable because authentication service is not configured.";
          setAuthBlockError(message);
          setQuestionError(message);

          const telemetry = resolveGuestTokenTelemetry(error);
          trackEvent("submit_blocked_no_token_service", buildTestKpiTrackingPayload(testKpiMetadata, {
            status_code: telemetry.statusCode,
            error_code: telemetry.errorCode,
            request_id: telemetry.requestId,
            route: "/tests/[slug]/take",
          }));
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
  }, [anonId, locale, trackGuestTokenFailure]);

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
            const message =
              locale === "zh"
                ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
                : "Submission is temporarily unavailable because authentication service is not configured.";
            setAuthBlockError(message);
            setQuestionError(message);

            const telemetry = resolveGuestTokenTelemetry(guestTokenError);
            trackEvent("submit_blocked_no_token_service", buildTestKpiTrackingPayload(testKpiMetadata, {
              status_code: telemetry.statusCode,
              error_code: telemetry.errorCode,
              request_id: telemetry.requestId,
              route: "/tests/[slug]/take",
            }));
          }
        },
      }),
    [anonId, locale, trackGuestTokenFailure]
  );

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldownSeconds]);

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
    latestAnswersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (answeredCount === 0) {
      setSeenMilestones([]);
      setMilestoneHint(null);
    }
  }, [answeredCount, total]);

  const buildAnswersSnapshot = useCallback((pendingSelection?: LastSelectionContext) => {
    const snapshot = {
      ...latestAnswersRef.current,
    };

    if (pendingSelection?.questionId && pendingSelection.code) {
      snapshot[pendingSelection.questionId] = pendingSelection.code;
    }

    return snapshot;
  }, []);

  useEffect(() => {
    if (total <= 0) return;

    const progressPercent = Math.floor((answeredCount / total) * 100);
    const milestones = [20, 40, 60, 80, 100];
    const nextMilestone = milestones.find((milestone) => progressPercent >= milestone && !seenMilestones.includes(milestone));
    if (!nextMilestone) return;

    const nextSeen = [...seenMilestones, nextMilestone];
    setSeenMilestones(nextSeen);

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
    trackEvent("ui_quiz_milestone", buildTestKpiTrackingPayload(testKpiMetadata, {
      milestone: nextMilestone,
      duration_bucket: durationBucket,
    }));
  }, [answeredCount, dict.quiz.milestoneHints, locale, seenMilestones, startedAt, testKpiMetadata, total]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (authBlockError) {
        setRolloutChecking(false);
        return;
      }

      try {
        const lookup = await fetchBig5Lookup({
          slug,
          locale,
        });

        if (!active) return;

        const rollout = resolveBig5RolloutState(lookup.capabilities);
        if (!rollout.enabledInProd || rollout.paywallMode === "off") {
          setRolloutBlocked(true);
          setQuestionError(
            locale === "zh"
              ? "该测评当前维护中，请稍后再试。"
              : "This assessment is temporarily unavailable right now."
          );
          router.replace(withLocale(`/tests/${slug}?maintenance=1`));
          return;
        }
      } catch {
        // Keep current page behavior on lookup failures.
      } finally {
        if (active) {
          setRolloutChecking(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [authBlockError, locale, router, slug, withLocale]);

  useEffect(() => {
    if (authBootstrapping || rolloutChecking) return;
    if (rolloutBlocked || authBlockError) {
      setLoadingQuestions(false);
      return;
    }

    let active = true;

    const run = async () => {
      setLoadingQuestions(true);
      setQuestionError(null);

      try {
        const response = await runWithAuthRetry("questions", () =>
          fetchBig5Questions({
            locale: testKpiMetadata.apiLocale,
            anonId: anonId || undefined,
            formCode: testKpiMetadata.formCode,
          })
        );

        const ordered = [...response.questions.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const options = ordered.map((item, index) => {
          const questionText =
            typeof item.text === "string" && item.text.trim().length > 0
              ? item.text
              : locale === "zh"
                ? `第 ${index + 1} 题`
                : `Question ${index + 1}`;
          const normalizedOptions = (Array.isArray(item.options) ? item.options : [])
            .map((option) => {
              const code = typeof option.code === "string" ? option.code.trim() : "";
              if (!code) return null;
              return {
                code,
                text:
                  typeof option.text === "string" && option.text.trim().length > 0
                    ? option.text
                    : code,
              };
            })
            .filter((option): option is { code: string; text: string } => option !== null);

          return {
            question_id: item.question_id,
            text: questionText,
            options: normalizedOptions,
          };
        });

        const version =
          typeof response.meta?.disclaimer_version === "string" ? response.meta.disclaimer_version : null;
        const hash = typeof response.meta?.disclaimer_hash === "string" ? response.meta.disclaimer_hash : null;
        const contentVersion =
          (typeof response.content_package_version === "string" && response.content_package_version) ||
          (typeof response.dir_version === "string" && response.dir_version) ||
          response.scale_code ||
          "BIG5_OCEAN";

        const manifestHashFromResponse =
          (typeof response.manifest_hash === "string" && response.manifest_hash) ||
          (typeof response.meta?.manifest_hash === "string" ? response.meta.manifest_hash : "");

        const context = await buildBig5TrackingContext({
          scaleCode: response.scale_code ?? "BIG5_OCEAN",
          packVersion: contentVersion,
          manifestHash: manifestHashFromResponse || null,
          normsVersion:
            typeof response.meta?.norms_version === "string" && response.meta.norms_version.trim().length > 0
              ? response.meta.norms_version
              : "unavailable",
          qualityLevel:
            typeof response.meta?.quality_level === "string" && response.meta.quality_level.trim().length > 0
              ? response.meta.quality_level
              : "unrated",
          locked: true,
          variant: "free",
          skuId: null,
          packId: response.pack_id ?? null,
          dirVersion: response.dir_version ?? null,
          contentPackageVersion: response.content_package_version ?? null,
          locale,
        });

        if (!active) return;

        setQuestions(options);
        setServerDisclaimerVersion(version);
        setServerDisclaimerHash(hash);
        setPackVersion(contentVersion);
        setTrackingBase(context);
      } catch (error) {
        if (!active) return;
        if (isGuestTokenRequestError(error)) {
          trackGuestTokenFailure("questions", error);
          if (isGuestTokenEndpointMissingError(error)) {
            const message =
              locale === "zh"
                ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
                : "Submission is temporarily unavailable because authentication service is not configured.";
            setAuthBlockError(message);
            setQuestionError(message);
            const telemetry = resolveGuestTokenTelemetry(error);
            trackEvent("submit_blocked_no_token_service", buildTestKpiTrackingPayload(testKpiMetadata, {
              status_code: telemetry.statusCode,
              error_code: telemetry.errorCode,
              request_id: telemetry.requestId,
              route: "/tests/[slug]/take",
            }));
          }
        }

        const mapped = mapBig5Error(error, {
          locale,
          fallbackFormCode: resolvedFormCode,
          copy: big5RetakeCopy,
        });
        const classified = classifyApiError(error);
        trackEvent("questions_load_failure", buildTestKpiTrackingPayload(testKpiMetadata, {
          stage: "questions",
          status_group: classified.statusGroup,
          status_code: classified.statusCode,
          error_code: classified.errorCode,
          request_id: classified.requestId,
          route: "/tests/[slug]/take",
        }));
        applyUiError("question", mapped);
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
  }, [anonId, applyUiError, authBlockError, authBootstrapping, big5RetakeCopy, locale, resolvedFormCode, rolloutBlocked, rolloutChecking, runWithAuthRetry, testKpiMetadata, trackGuestTokenFailure]);

  const startFreshAttempt = useCallback(async (runId?: number): Promise<string | null> => {
    if (authBlockError || staleDraftError) {
      return null;
    }

    if (ensureAttemptPromiseRef.current) {
      return ensureAttemptPromiseRef.current;
    }

    if (inCooldown) {
      setStartError(retryCountdownText(cooldownSeconds));
      return null;
    }

    const pending = (async () => {
      try {
        setStarting(true);
        setStartError(null);

        const acceptedAt = new Date().toISOString();
        const requestMeta: Record<string, unknown> = {
          accepted_version: serverDisclaimerVersion,
          accepted_hash: serverDisclaimerHash,
          accepted_at: acceptedAt,
          // Temporary compatibility for backend rollouts still reading the old key.
          disclaimer_version_accepted: serverDisclaimerVersion,
          disclaimer_hash: serverDisclaimerHash,
          disclaimer_locale: toApiLocale(locale),
          slug,
        };

        for (let retry = 0; retry < 2; retry += 1) {
          try {
            const response = await runWithAuthRetry("start_attempt", () =>
              startBig5Attempt({
                anonId: anonId || undefined,
                locale: testKpiMetadata.apiLocale,
                region: "GLOBAL",
                formCode: testKpiMetadata.formCode,
                meta: requestMeta,
                clientVersion: "fe-big5-2",
              })
            );
            if (!isFlowActive(runId)) {
              return null;
            }

            setAttemptMeta({
              attemptId: response.attempt_id,
              resumeToken: response.resume_token ?? null,
              disclaimerVersion: serverDisclaimerVersion,
              disclaimerHash: serverDisclaimerHash,
            });

            setCooldownSeconds(0);
            trackEvent(
              "start_attempt",
              buildEventPayload({
                slug,
                disclaimer_version: serverDisclaimerVersion ?? "",
                disclaimer_hash: serverDisclaimerHash ?? "",
              })
            );

            if (isFlowActive(runId)) {
              setStarting(false);
            }
            return response.attempt_id;
          } catch (error) {
            if (retry === 0) {
              const retryWaitCompleted = await takeFlowRef.current.wait(600, runId);
              if (!retryWaitCompleted) {
                if (isFlowActive(runId)) {
                  setStarting(false);
                }
                return null;
              }
              continue;
            }

            if (!isFlowActive(runId)) {
              return null;
            }

            if (isGuestTokenRequestError(error)) {
              trackGuestTokenFailure("start_attempt", error);
              if (isGuestTokenEndpointMissingError(error)) {
                const message =
                  locale === "zh"
                    ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
                    : "Submission is temporarily unavailable because authentication service is not configured.";
                setAuthBlockError(message);
                const telemetry = resolveGuestTokenTelemetry(error);
                trackEvent("submit_blocked_no_token_service", buildTestKpiTrackingPayload(testKpiMetadata, {
                  status_code: telemetry.statusCode,
                  error_code: telemetry.errorCode,
                  request_id: telemetry.requestId,
                  route: "/tests/[slug]/take",
                }));
              }
            }

            const mapped = mapBig5Error(error, {
              locale,
              fallbackFormCode: resolvedFormCode,
              copy: big5RetakeCopy,
            });
            const classified = classifyApiError(error);
            trackEvent("submit_failure", buildTestKpiTrackingPayload(testKpiMetadata, {
              stage: "start_attempt",
              status_group: classified.statusGroup,
              status_code: classified.statusCode,
              error_code: classified.errorCode,
              route: "/tests/[slug]/take",
            }));
            applyUiError("start", mapped);

            if (error instanceof ApiError && error.status === 429) {
              trackBig5Event(
                "retake_blocked",
                buildEventPayload({
                  reason: mapped.reasonCode ?? error.errorCode,
                  form_code: mapped.formCode ?? resolvedFormCode,
                  scope_key: mapped.scopeKey ?? undefined,
                  retry_after_seconds: mapped.retryAfterSeconds ?? 0,
                })
              );
            }
          }
        }

        if (isFlowActive(runId)) {
          setStarting(false);
        }
        return null;
      } finally {
        ensureAttemptPromiseRef.current = null;
      }
    })();

    ensureAttemptPromiseRef.current = pending;
    return pending;
  }, [
    anonId,
    authBlockError,
    inCooldown,
    locale,
    cooldownSeconds,
    serverDisclaimerVersion,
    serverDisclaimerHash,
    slug,
    resolvedFormCode,
    setAttemptMeta,
    buildEventPayload,
    applyUiError,
    isFlowActive,
    runWithAuthRetry,
    trackGuestTokenFailure,
    staleDraftError,
    retryCountdownText,
    big5RetakeCopy,
    testKpiMetadata,
  ]);

  const ensureAttempt = useCallback(async (runId?: number): Promise<string | null> => {
    if (authBlockError || staleDraftError || recoveringAttemptRef.current) {
      return null;
    }

    if (forceNewAttemptRequested && !forceNewAttemptAppliedRef.current) {
      forceNewAttemptAppliedRef.current = true;
      clearAttemptMeta();
      return startFreshAttempt(runId);
    }

    if (matchesSavedAttempt) {
      return attemptId;
    }

    return startFreshAttempt(runId);
  }, [attemptId, authBlockError, clearAttemptMeta, forceNewAttemptRequested, matchesSavedAttempt, staleDraftError, startFreshAttempt]);

  const handleSelectAnswer = (questionId: string, code: string) => {
    const shouldPrimeAttempt =
      !attemptId &&
      !matchesSavedAttempt &&
      Object.keys(latestAnswersRef.current).length === 0;

    setAnswer(questionId, code);

    if (shouldPrimeAttempt) {
      void ensureAttempt();
    }

    const questionNo = questions.findIndex((item) => item.question_id === questionId) + 1;
    trackBig5Event(
      "question_answer",
      buildEventPayload({
        attempt_id: attemptId ?? "",
        question_id: questionId,
        question_no: questionNo,
        answered_count: answeredCount + 1,
      })
    );
  };

  const submitAttemptWithId = useCallback(async (
    activeAttemptId: string,
    answersSnapshot: Record<string, string>,
    runId?: number,
  ): Promise<string> => {
    const durationMs = Math.max(1000, Date.now() - startedAt);
    const answeredCountSnapshot = questions.reduce(
      (count, question) => count + (answersSnapshot[question.question_id] ? 1 : 0),
      0
    );

    trackEvent(
      "submit_attempt",
      buildEventPayload({
        attempt_id: activeAttemptId,
        answered_count: answeredCountSnapshot,
        duration_ms: durationMs,
      })
    );

    const response = await runWithAuthRetry("submit_attempt", () =>
      submitBig5Attempt({
        attemptId: activeAttemptId,
        anonId: anonId || undefined,
        answers: questions.map((question, idx) => ({
          question_id: question.question_id,
          code: answersSnapshot[question.question_id] ?? "",
          question_index: idx,
        })),
        durationMs,
      })
    );
    if (!isFlowActive(runId)) {
      return "";
    }

    if (!response.ok) {
      throw new Error("Submit failed.");
    }

    markSubmitted();
    return resolveResultAttemptId(response, activeAttemptId);
  }, [anonId, buildEventPayload, isFlowActive, markSubmitted, questions, runWithAuthRetry, startedAt]);

  const handleSubmit = useCallback(async (pendingSelection?: LastSelectionContext, runId?: number): Promise<string | null> => {
    if (submitInFlightRef.current || staleDraftError) {
      return null;
    }

    submitInFlightRef.current = true;
    const activeRunId = typeof runId === "number" ? runId : takeFlowRef.current.beginRun();

    const activeAttemptId = await ensureAttempt(activeRunId);
    if (!isFlowActive(activeRunId)) {
      submitInFlightRef.current = false;
      return null;
    }
    if (!activeAttemptId) {
      submitInFlightRef.current = false;
      return null;
    }

    if (inCooldown) {
      if (isFlowActive(activeRunId)) {
        setSubmitError(retryCountdownText(cooldownSeconds));
      }
      submitInFlightRef.current = false;
      return null;
    }

    const answersSnapshot = buildAnswersSnapshot(pendingSelection);
    const firstMissingIndex = questions.findIndex((item) => !answersSnapshot[item.question_id]);
    if (firstMissingIndex >= 0) {
      if (isFlowActive(activeRunId)) {
        setCurrentIndex(firstMissingIndex);
        setSubmitError(`Please answer question ${firstMissingIndex + 1} before submitting.`);
        setSubmitErrorAction("fill_missing");
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
    setSubmitErrorAction(null);
    setSubmitCanRetry(false);
    setStaleDraftError(null);

    try {
      const resultAttemptId = await submitAttemptWithId(activeAttemptId, answersSnapshot, activeRunId);
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
        submitFreshAttempt: (nextAttemptId) => submitAttemptWithId(nextAttemptId, answersSnapshot, activeRunId),
      });
      if (!isFlowActive(activeRunId)) {
        return null;
      }
      recoveringAttemptRef.current = false;

      if (recovery.kind === "recovered") {
        autoRecoveryAttemptedRef.current = true;
        setSubmitError(null);
        setSubmitErrorAction(null);
        setStaleDraftError(null);
        return recovery.value;
      }

      if (recovery.kind === "failed") {
        autoRecoveryAttemptedRef.current = true;
        const message = resolveStaleDraftResetMessage(locale);
        setStaleDraftError(message);
        setSubmitError(null);
        setSubmitErrorAction(null);
        return null;
      }

      if (isGuestTokenRequestError(error)) {
        trackGuestTokenFailure("submit_attempt", error);
        if (isGuestTokenEndpointMissingError(error)) {
          const message =
            locale === "zh"
              ? "提交通道暂时不可用（认证服务未配置），请稍后再试。"
              : "Submission is temporarily unavailable because authentication service is not configured.";
          setAuthBlockError(message);
          const telemetry = resolveGuestTokenTelemetry(error);
          trackEvent("submit_blocked_no_token_service", buildTestKpiTrackingPayload(testKpiMetadata, {
            status_code: telemetry.statusCode,
            error_code: telemetry.errorCode,
            request_id: telemetry.requestId,
            route: "/tests/[slug]/take",
          }));
        }
      }

      const mapped = mapBig5Error(error, {
        locale,
        fallbackFormCode: resolvedFormCode,
        copy: big5RetakeCopy,
      });
      const classified = classifyApiError(error);
      trackEvent("submit_failure", buildTestKpiTrackingPayload(testKpiMetadata, {
        stage: "submit_attempt",
        status_group: classified.statusGroup,
        status_code: classified.statusCode,
        error_code: classified.errorCode,
        route: "/tests/[slug]/take",
      }));
      applyUiError("submit", mapped);

      if (error instanceof ApiError && error.status === 408) {
        setSubmitCanRetry(true);
      }

      if (error instanceof ApiError && error.status === 429) {
        trackBig5Event(
          "retake_blocked",
          buildEventPayload({
            attempt_id: activeAttemptId,
            reason: mapped.reasonCode ?? error.errorCode,
            form_code: mapped.formCode ?? resolvedFormCode,
            scope_key: mapped.scopeKey ?? undefined,
            retry_after_seconds: mapped.retryAfterSeconds ?? 0,
          })
        );
      }
      return null;
    } finally {
      recoveringAttemptRef.current = false;
      if (isFlowActive(activeRunId)) {
        setSubmitting(false);
      }
      submitInFlightRef.current = false;
    }
  }, [
    applyUiError,
    buildAnswersSnapshot,
    buildEventPayload,
    cooldownSeconds,
    clearAttemptMeta,
    ensureAttempt,
    inCooldown,
    isFlowActive,
    locale,
    questions,
    resolvedFormCode,
    setCurrentIndex,
    staleDraftError,
    startFreshAttempt,
    submitAttemptWithId,
    big5RetakeCopy,
    trackGuestTokenFailure,
    retryCountdownText,
    testKpiMetadata,
  ]);

  const finalizeSuccessfulSubmit = useCallback(
    (resultAttemptId: string) => {
      cancelPendingSubmitSideEffects();
      resetAfterSubmit();
      router.push(withLocale(`/result/${resultAttemptId}`));
    },
    [cancelPendingSubmitSideEffects, resetAfterSubmit, router, withLocale]
  );

  const startSubmitOverlayPhases = useCallback((runId: number) => {
    setSubmitOverlayPhase(0);

    trackEvent("ui_report_loading_phase", buildTestKpiTrackingPayload(testKpiMetadata, {
      phase: "saving",
      locked: true,
      variant: "free",
    }));

    takeFlowRef.current.schedule(() => {
      setSubmitOverlayPhase(1);
      trackEvent("ui_report_loading_phase", buildTestKpiTrackingPayload(testKpiMetadata, {
        phase: "analyzing",
        locked: true,
        variant: "free",
      }));
    }, 800, runId);

    takeFlowRef.current.schedule(() => {
      setSubmitOverlayPhase(2);
      trackEvent("ui_report_loading_phase", buildTestKpiTrackingPayload(testKpiMetadata, {
        phase: "generating",
        locked: true,
        variant: "free",
      }));
    }, 1500, runId);
  }, [testKpiMetadata]);

  const handleSubmitWithOverlay = useCallback(async (pendingSelection?: LastSelectionContext): Promise<void> => {
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
    total,
    onMove: (index) => setCurrentIndex(index),
    onLast: handleSubmitWithOverlay,
    confirmDelayMs: 200,
    enterDurationMs: 280,
  });

  useEffect(() => {
    cancelAutoAdvanceRef.current = cancelPending;
  }, [cancelPending]);

  if (authBootstrapping || rolloutChecking || loadingQuestions) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-[var(--fm-space-5)] shadow-sm">
        <p className="m-0 text-sm text-slate-700">
          {authBootstrapping
            ? locale === "zh"
              ? "正在初始化安全会话..."
              : "Preparing secure session..."
            : rolloutChecking
            ? locale === "zh"
              ? "正在检查可用性..."
              : "Checking assessment availability..."
            : "Loading BIG5 questions..."}
        </p>
      </div>
    );
  }

  if ((authBlockError || questionError) && questions.length === 0) {
    return (
      <div className="space-y-[var(--fm-gap-sm)] rounded-2xl border border-slate-200 bg-white p-[var(--fm-space-5)] shadow-sm">
        <Alert>{authBlockError ?? questionError}</Alert>
        {inCooldown ? <p className="m-0 text-xs text-amber-700">{retryCountdownText(cooldownSeconds)}</p> : null}
        {rolloutBlocked ? null : (
          <Button type="button" variant="outline" onClick={() => window.location.reload()} disabled={inCooldown}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (staleDraftError) {
    return (
      <StaleDraftResetPrompt
        locale={locale}
        message={staleDraftError}
        onReset={() => {
          cancelPendingSubmitSideEffects();
          autoRecoveryAttemptedRef.current = false;
          resetAll();
          setCooldownSeconds(0);
          setStaleDraftError(null);
          setSubmitError(null);
          setSubmitErrorAction(null);
          setSubmitCanRetry(false);
          setStartError(null);
          router.replace(withLocale(`/tests/${slug}`));
        }}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="space-y-[var(--fm-gap-sm)] rounded-2xl border border-slate-200 bg-white p-[var(--fm-space-5)] shadow-sm">
        <Alert>No active question found. Please restart the assessment.</Alert>
        <Button type="button" variant="outline" onClick={handleRestartTest}>
          Restart test
        </Button>
      </div>
    );
  }

  if (immersiveEnabled) {
    return (
      <>
        <ImmersiveTakeLayout
          headerSlot={
            <QuizTakeHeaderV2
              brand={locale === "zh" ? "大五人格测试" : "Big Five Test"}
              completedPrefix={dict.header.completedPrefix}
              completedSuffix={dict.header.completedSuffix}
              estimatedTimeLabel={dict.quiz.estimatedTimeLabel}
              minutesUnit={dict.common.minutes_unit}
              estimatedMinutes={effectiveEstimatedMinutes}
              progressText={progressStatus}
              current={currentIndex + 1}
              total={total}
              answered={answeredCount}
            />
          }
          backHref={withLocale(`/tests/${slug}`)}
          backLabel={dict.quiz.immersive.backToLanding}
          current={currentIndex + 1}
          total={total}
          answered={answeredCount}
          previousLabel={dict.quiz.immersive.previous}
          previousDisabled={currentIndex <= 0 || submitting || inCooldown || submitOverlayVisible}
          onPrevious={goPrevious}
          transitionKey={currentQuestion.question_id}
          transitionDirection={transitionDirection}
          isTransitioning={isTransitioning}
          footerSlot={
            <div className="flex flex-wrap items-center justify-end gap-[var(--fm-gap-xs)]">
              {submitCanRetry ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || inCooldown || submitOverlayVisible}
                  onClick={() => {
                    void handleSubmitWithOverlay();
                  }}
                >
                  {dict.quiz.immersive.submitRetry}
                </Button>
              ) : null}
              {submitErrorAction === "restart" ? (
                <Button type="button" variant="outline" onClick={handleRestartTest}>
                  Restart test
                </Button>
              ) : null}
            </div>
          }
        >
          <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
              Question {currentIndex + 1} / {total}
            </p>
            <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{currentQuestion.text}</h2>

            {milestoneHint ? (
              <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-sm font-medium text-[var(--fm-text)]">
                {milestoneHint}
              </div>
            ) : null}

            <V2LikertScale
              questionId={currentQuestion.question_id}
              options={currentQuestion.options}
              value={answers[currentQuestion.question_id]}
              onChange={(code) =>
                selectAndAdvance(() => {
                  handleSelectAnswer(currentQuestion.question_id, code);
                }, {
                  questionId: currentQuestion.question_id,
                  code,
                })
              }
            />

            {startError ? <Alert>{startError}</Alert> : null}
            {submitError ? <Alert>{submitError}</Alert> : null}
            {inCooldown ? <p className="m-0 text-xs text-amber-700">{retryCountdownText(cooldownSeconds)}</p> : null}
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
    <QuizShell>
      <QuizTakeHeaderV2
        brand={locale === "zh" ? "大五人格测试" : "Big Five Test"}
        completedPrefix={dict.header.completedPrefix}
        completedSuffix={dict.header.completedSuffix}
        estimatedTimeLabel={dict.quiz.estimatedTimeLabel}
        minutesUnit={dict.common.minutes_unit}
        estimatedMinutes={effectiveEstimatedMinutes}
        progressText={progressStatus}
        current={currentIndex + 1}
        total={total}
        answered={answeredCount}
      />

      {milestoneHint ? (
        <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-input-x)] py-[var(--fm-pad-input-y)] text-sm font-medium text-[var(--fm-text)]">
          {milestoneHint}
        </div>
      ) : null}

      <article className="space-y-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border-strong)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
          {locale === "zh" ? `第 ${currentIndex + 1} 题` : `Question ${currentIndex + 1}`} / {total}
        </p>
        <h2 className="m-0 text-2xl font-semibold leading-9 text-[var(--fm-text)]">{currentQuestion.text}</h2>

        <V2LikertScale
          questionId={currentQuestion.question_id}
          options={currentQuestion.options}
          value={answers[currentQuestion.question_id]}
          onChange={(code) =>
            selectAndAdvance(() => {
              handleSelectAnswer(currentQuestion.question_id, code);
            }, {
              questionId: currentQuestion.question_id,
              code,
            })
          }
        />

        {startError ? <Alert>{startError}</Alert> : null}
        {submitError ? <Alert>{submitError}</Alert> : null}
        {inCooldown ? <p className="m-0 text-xs text-amber-700">{retryCountdownText(cooldownSeconds)}</p> : null}
      </article>

      <div className="flex flex-col gap-[var(--fm-gap-xs)] sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex <= 0 || starting || submitting || inCooldown || submitOverlayVisible}
          onClick={goPrevious}
        >
          {dict.quiz.immersive.previous}
        </Button>

        <div className="flex flex-wrap items-center gap-[var(--fm-gap-xs)] sm:justify-end">
          {submitCanRetry ? (
            <Button
              type="button"
              variant="outline"
              disabled={starting || submitting || inCooldown || submitOverlayVisible}
              onClick={() => {
                void handleSubmitWithOverlay();
              }}
            >
              {dict.quiz.immersive.submitRetry}
            </Button>
          ) : null}

          {submitErrorAction === "restart" ? (
            <Button type="button" variant="outline" onClick={handleRestartTest}>
              {locale === "zh" ? "重新开始" : "Restart test"}
            </Button>
          ) : null}

          <Button
            type="button"
            disabled={starting || submitting || inCooldown || submitOverlayVisible}
            onClick={() => {
              if (currentIndex >= total - 1) {
                void handleSubmitWithOverlay();
                return;
              }

              cancelPending();
              setCurrentIndex(Math.min(total - 1, currentIndex + 1));
            }}
          >
            {currentIndex >= total - 1
              ? submitting
                ? locale === "zh" ? "提交中..." : "Submitting..."
                : locale === "zh" ? "提交" : "Submit"
              : locale === "zh" ? "下一题" : "Next"}
          </Button>
        </div>
      </div>

      <SubmitPhaseOverlay
        visible={submitOverlayVisible}
        phases={dict.quiz.immersive.submitPhases}
        phaseIndex={submitOverlayPhase}
      />
    </QuizShell>
  );
}
