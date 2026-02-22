"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProgressHeader } from "@/components/big5/quiz/ProgressHeader";
import { QuestionCard } from "@/components/big5/quiz/QuestionCard";
import { QuestionNavigator } from "@/components/big5/quiz/QuestionNavigator";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { setFmToken } from "@/lib/auth/fmToken";
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
import { mapBig5Error, type Big5UiError } from "@/lib/big5/errors";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function retryCountdownText(locale: "en" | "zh", seconds: number): string {
  if (locale === "zh") {
    return `请等待 ${seconds} 秒后重试。`;
  }
  return `Please wait ${seconds} seconds before retrying.`;
}

export default function Big5TakeClient({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const attemptId = useBig5AttemptStore((store) => store.attemptId);
  const answers = useBig5AttemptStore((store) => store.answers);
  const currentIndex = useBig5AttemptStore((store) => store.currentIndex);
  const startedAt = useBig5AttemptStore((store) => store.startedAt);
  const disclaimerVersion = useBig5AttemptStore((store) => store.disclaimerVersion);
  const disclaimerHash = useBig5AttemptStore((store) => store.disclaimerHash);
  const disclaimerAcceptedAt = useBig5AttemptStore((store) => store.disclaimerAcceptedAt);

  const setAttemptMeta = useBig5AttemptStore((store) => store.setAttemptMeta);
  const setAnswer = useBig5AttemptStore((store) => store.setAnswer);
  const setCurrentIndex = useBig5AttemptStore((store) => store.setCurrentIndex);
  const acceptDisclaimer = useBig5AttemptStore((store) => store.acceptDisclaimer);
  const hydrateAnonId = useBig5AttemptStore((store) => store.hydrateAnonId);
  const setAuthToken = useBig5AttemptStore((store) => store.setAuthToken);
  const markSubmitted = useBig5AttemptStore((store) => store.markSubmitted);
  const resetAfterSubmit = useBig5AttemptStore((store) => store.resetAfterSubmit);
  const resetAll = useBig5AttemptStore((store) => store.resetAll);

  const [questions, setQuestions] = useState<Array<{ question_id: string; text: string; options: Array<{ code: string; text: string }> }>>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [rolloutChecking, setRolloutChecking] = useState(true);
  const [rolloutBlocked, setRolloutBlocked] = useState(false);

  const [disclaimerText, setDisclaimerText] = useState("");
  const [serverDisclaimerVersion, setServerDisclaimerVersion] = useState<string | null>(null);
  const [serverDisclaimerHash, setServerDisclaimerHash] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [startErrorAction, setStartErrorAction] = useState<Big5UiError["action"] | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitErrorAction, setSubmitErrorAction] = useState<Big5UiError["action"] | null>(null);
  const [submitCanRetry, setSubmitCanRetry] = useState(false);

  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [trackingBase, setTrackingBase] = useState<Big5TrackingContext | null>(null);
  const [packVersion, setPackVersion] = useState<string>("BIG5_OCEAN");
  const [milestoneHint, setMilestoneHint] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const questionIds = useMemo(() => questions.map((item) => item.question_id), [questions]);
  const answeredCount = useMemo(
    () => questions.reduce((sum, item) => sum + (answers[item.question_id] ? 1 : 0), 0),
    [answers, questions]
  );

  const needsConsent =
    !disclaimerAcceptedAt ||
    !serverDisclaimerVersion ||
    !serverDisclaimerHash ||
    disclaimerVersion !== serverDisclaimerVersion ||
    disclaimerHash !== serverDisclaimerHash;

  const withLocale = useCallback((path: string) => localizedPath(path, locale), [locale]);
  const inCooldown = cooldownSeconds > 0;
  const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < total - 1 ? questions[currentIndex + 1] : null;

  const trackingFallback = useMemo<Big5TrackingContext>(
    () => ({
      scale_code: "BIG5_OCEAN",
      pack_version: packVersion,
      manifest_hash: "pending",
      norms_version: "unavailable",
      quality_level: "unrated",
      locked: true,
      variant: "free",
      sku_id: "",
      locale,
    }),
    [locale, packVersion]
  );

  const buildEventPayload = useCallback(
    (payload: Record<string, unknown>) => ({
      ...(trackingBase ?? trackingFallback),
      ...payload,
    }),
    [trackingBase, trackingFallback]
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
      setStartErrorAction(mapped.action ?? null);
      return;
    }

    if (scope === "submit") {
      setSubmitError(mapped.message);
      setSubmitErrorAction(mapped.action ?? null);
      return;
    }

    setQuestionError(mapped.message);
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
    if (tokenFromUrl.startsWith("fm_")) {
      setFmToken(tokenFromUrl);
      setAuthToken(tokenFromUrl);
    }
  }, [searchParams, setAuthToken]);

  useEffect(() => {
    const anonId = getOrCreateAnonId();
    hydrateAnonId(anonId || null);
  }, [hydrateAnonId]);

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
    if (answeredCount === 0) {
      setSeenMilestones([]);
      setMilestoneHint(null);
    }
  }, [answeredCount, total]);

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
      window.setTimeout(() => {
        setMilestoneHint((prev) => (prev === hint ? null : prev));
      }, 1500);
    }

    const elapsedMs = Math.max(0, Date.now() - startedAt);
    const durationBucket = elapsedMs < 60000 ? "lt_1m" : elapsedMs < 180000 ? "1_3m" : "gte_3m";
    trackEvent("ui_quiz_milestone", {
      scale_code: "BIG5_OCEAN",
      milestone: nextMilestone,
      duration_bucket: durationBucket,
      locale,
    });
  }, [answeredCount, dict.quiz.milestoneHints, locale, seenMilestones, startedAt, total]);

  useEffect(() => {
    let active = true;

    const run = async () => {
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
  }, [locale, router, slug, withLocale]);

  useEffect(() => {
    if (rolloutChecking) return;
    if (rolloutBlocked) {
      setLoadingQuestions(false);
      return;
    }

    let active = true;

    const run = async () => {
      setLoadingQuestions(true);
      setQuestionError(null);

      try {
        const response = await fetchBig5Questions({
          locale: toApiLocale(locale),
        });

        const ordered = [...response.questions.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const options = ordered.map((item) => ({
          question_id: item.question_id,
          text: item.text,
          options: item.options.map((option) => ({ code: option.code, text: option.text })),
        }));

        const version =
          typeof response.meta?.disclaimer_version === "string" ? response.meta.disclaimer_version : null;
        const hash = typeof response.meta?.disclaimer_hash === "string" ? response.meta.disclaimer_hash : null;
        const text = typeof response.meta?.disclaimer_text === "string" ? response.meta.disclaimer_text : "";

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
        setDisclaimerText(text);
        setPackVersion(contentVersion);
        setTrackingBase(context);
      } catch (error) {
        if (!active) return;
        const mapped = mapBig5Error(error);
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
  }, [applyUiError, locale, rolloutBlocked, rolloutChecking]);

  const ensureAttempt = async (): Promise<string | null> => {
    if (attemptId) {
      return attemptId;
    }

    if (inCooldown) {
      setStartError(retryCountdownText(locale, cooldownSeconds));
      return null;
    }

    setStarting(true);
    setStartError(null);
    setStartErrorAction(null);

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
        const response = await startBig5Attempt({
          locale: toApiLocale(locale),
          region: "GLOBAL",
          meta: requestMeta,
          clientVersion: "fe-big5-2",
        });

        setAttemptMeta({
          attemptId: response.attempt_id,
          resumeToken: response.resume_token ?? null,
          disclaimerVersion: serverDisclaimerVersion,
          disclaimerHash: serverDisclaimerHash,
        });

        setCooldownSeconds(0);
        trackBig5Event(
          "start_click",
          buildEventPayload({
            slug,
            disclaimer_version: serverDisclaimerVersion ?? "",
            disclaimer_hash: serverDisclaimerHash ?? "",
          })
        );

        setStarting(false);
        return response.attempt_id;
      } catch (error) {
        if (retry === 0) {
          await wait(600);
          continue;
        }

        const mapped = mapBig5Error(error);
        applyUiError("start", mapped);

        if (error instanceof ApiError && error.status === 429) {
          trackBig5Event(
            "retake_blocked",
            buildEventPayload({
              reason: error.errorCode,
              retry_after_seconds: Number(
                (error.details as { retry_after_seconds?: unknown } | undefined)?.retry_after_seconds ?? 0
              ),
            })
          );
        }
      }
    }

    setStarting(false);
    return null;
  };

  const handleAgreeAndStart = async () => {
    if (!consentChecked) return;

    acceptDisclaimer({
      version: serverDisclaimerVersion,
      hash: serverDisclaimerHash,
    });

    const started = await ensureAttempt();
    if (!started) return;
  };

  const handleSelectAnswer = (questionId: string, code: string) => {
    setAnswer(questionId, code);

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

  const handleSubmit = async () => {
    const activeAttemptId = await ensureAttempt();
    if (!activeAttemptId) return;

    if (inCooldown) {
      setSubmitError(retryCountdownText(locale, cooldownSeconds));
      return;
    }

    const firstMissingIndex = questions.findIndex((item) => !answers[item.question_id]);
    if (firstMissingIndex >= 0) {
      setCurrentIndex(firstMissingIndex);
      setSubmitError(`Please answer question ${firstMissingIndex + 1} before submitting.`);
      setSubmitErrorAction("fill_missing");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitErrorAction(null);
    setSubmitCanRetry(false);

    const durationMs = Math.max(1000, Date.now() - startedAt);

    try {
      trackBig5Event(
        "submit_click",
        buildEventPayload({
          attempt_id: activeAttemptId,
          answered_count: answeredCount,
          duration_ms: durationMs,
        })
      );

      const response = await submitBig5Attempt({
        attemptId: activeAttemptId,
        answers: questions.map((question, idx) => ({
          question_id: question.question_id,
          code: answers[question.question_id] ?? "",
          question_index: idx,
        })),
        durationMs,
      });

      if (!response.ok) {
        throw new Error("Submit failed.");
      }

      markSubmitted();
      const resultAttemptId = response.attempt_id ?? activeAttemptId;
      resetAfterSubmit();
      router.push(withLocale(`/result/${resultAttemptId}`));
    } catch (error) {
      const mapped = mapBig5Error(error);
      applyUiError("submit", mapped);

      if (error instanceof ApiError && error.status === 408) {
        setSubmitCanRetry(true);
      }

      if (error instanceof ApiError && error.status === 429) {
        trackBig5Event(
          "retake_blocked",
          buildEventPayload({
            attempt_id: activeAttemptId,
            reason: error.errorCode,
            retry_after_seconds: Number(
              (error.details as { retry_after_seconds?: unknown } | undefined)?.retry_after_seconds ?? 0
            ),
          })
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (rolloutChecking || loadingQuestions) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="m-0 text-sm text-slate-700">
          {rolloutChecking
            ? locale === "zh"
              ? "正在检查可用性..."
              : "Checking assessment availability..."
            : "Loading BIG5 questions..."}
        </p>
      </div>
    );
  }

  if (questionError && questions.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Alert>{questionError}</Alert>
        {inCooldown ? <p className="m-0 text-xs text-amber-700">{retryCountdownText(locale, cooldownSeconds)}</p> : null}
        {rolloutBlocked ? null : (
          <Button type="button" variant="outline" onClick={() => window.location.reload()} disabled={inCooldown}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!attemptId || needsConsent) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Before you start</h2>
        <p className="text-sm text-slate-700">
          Please review and agree to the disclaimer before starting the BIG5 assessment.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="m-0 whitespace-pre-wrap">
            {disclaimerText || "This assessment is for self-discovery and not a medical diagnosis."}
          </p>
        </div>

        <div className="text-xs text-slate-600">
          <p className="m-0">Version: {serverDisclaimerVersion ?? "-"}</p>
          <p className="m-0">Hash: {serverDisclaimerHash ?? "-"}</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(event) => setConsentChecked(event.target.checked)}
          />
          I have read and agree to the disclaimer.
        </label>

        {startError ? <Alert>{startError}</Alert> : null}
        {inCooldown ? <p className="m-0 text-xs text-amber-700">{retryCountdownText(locale, cooldownSeconds)}</p> : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={!consentChecked || starting || inCooldown}
            onClick={handleAgreeAndStart}
          >
            {starting ? "Starting..." : "Agree and start"}
          </Button>

          {startErrorAction === "restart" ? (
            <Button type="button" variant="outline" onClick={handleRestartTest}>
              Restart test
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Alert>No active question found. Please restart the assessment.</Alert>
        <Button type="button" variant="outline" onClick={handleRestartTest}>
          Restart test
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="opacity-80">
        <ProgressHeader current={currentIndex + 1} total={total} answered={answeredCount} />
      </div>

      {milestoneHint ? (
        <div className="fm-animate-soft-fade rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--fm-text)]">
          {milestoneHint}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="min-h-[48px] rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-2 text-xs text-[var(--fm-text-muted)] opacity-30">
              {previousQuestion ? `${locale === "zh" ? "上一题" : "Previous"}: ${currentIndex}` : (locale === "zh" ? "上一题" : "Previous")}
            </div>
            <div className="min-h-[48px] rounded-xl border border-[var(--fm-border-strong)] bg-[var(--fm-surface)] px-3 py-2 text-xs font-semibold text-[var(--fm-text)] shadow-[var(--fm-shadow-md)] opacity-100">
              {locale === "zh" ? "当前题目" : "Current focus"}
            </div>
            <div className="min-h-[48px] rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-2 text-xs text-[var(--fm-text-muted)] opacity-30">
              {nextQuestion ? `${locale === "zh" ? "下一题" : "Next"}: ${currentIndex + 2}` : (locale === "zh" ? "下一题" : "Next")}
            </div>
          </div>

          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={total}
            selectedCode={answers[currentQuestion.question_id]}
            emphasized
            onSelect={handleSelectAnswer}
          />

          {submitError ? <Alert>{submitError}</Alert> : null}
          {inCooldown ? <p className="m-0 text-xs text-amber-700">{retryCountdownText(locale, cooldownSeconds)}</p> : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex <= 0 || submitting || inCooldown}
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={currentIndex >= total - 1 || submitting || inCooldown}
              onClick={() => setCurrentIndex(Math.min(total - 1, currentIndex + 1))}
            >
              Next
            </Button>

            <Button type="button" disabled={submitting || inCooldown} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>

            {submitCanRetry ? (
              <Button
                type="button"
                variant="outline"
                disabled={submitting || inCooldown}
                onClick={handleSubmit}
              >
                Retry submit
              </Button>
            ) : null}

            {submitErrorAction === "restart" ? (
              <Button type="button" variant="outline" onClick={handleRestartTest}>
                Restart test
              </Button>
            ) : null}
          </div>
        </div>

        <div className="opacity-70">
          <QuestionNavigator
            total={total}
            currentIndex={currentIndex}
            questionIds={questionIds}
            answeredMap={answers}
            onJump={(index) => setCurrentIndex(index)}
          />
        </div>
      </div>
    </div>
  );
}
