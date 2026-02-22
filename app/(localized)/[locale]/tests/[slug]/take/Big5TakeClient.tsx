"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProgressHeader } from "@/components/big5/quiz/ProgressHeader";
import { QuestionCard } from "@/components/big5/quiz/QuestionCard";
import { QuestionNavigator } from "@/components/big5/quiz/QuestionNavigator";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { setFmToken } from "@/lib/auth/fmToken";
import { ApiError } from "@/lib/api-client";
import { getOrCreateAnonId } from "@/lib/anon";
import { trackBig5Event } from "@/lib/big5/analytics";
import { fetchBig5Questions, startBig5Attempt, submitBig5Attempt } from "@/lib/big5/api";
import { mapBig5Error } from "@/lib/big5/errors";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";
import { getLocaleFromPathname, localizedPath, toApiLocale } from "@/lib/i18n/locales";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function Big5TakeClient({ slug }: { slug: string }) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
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

  const [questions, setQuestions] = useState<Array<{ question_id: string; text: string; options: Array<{ code: string; text: string }> }>>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [disclaimerText, setDisclaimerText] = useState("");
  const [serverDisclaimerVersion, setServerDisclaimerVersion] = useState<string | null>(null);
  const [serverDisclaimerHash, setServerDisclaimerHash] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitCanRetry, setSubmitCanRetry] = useState(false);

  const [packVersion, setPackVersion] = useState<string>("unknown");

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

  const withLocale = (path: string) => localizedPath(path, locale);

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
    let active = true;

    const run = async () => {
      setLoadingQuestions(true);
      setQuestionError(null);

      try {
        const response = await fetchBig5Questions({
          locale: toApiLocale(locale),
        });

        if (!active) return;

        const ordered = [...response.questions.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setQuestions(
          ordered.map((item) => ({
            question_id: item.question_id,
            text: item.text,
            options: item.options.map((option) => ({ code: option.code, text: option.text })),
          }))
        );

        const version = typeof response.meta?.disclaimer_version === "string" ? response.meta.disclaimer_version : null;
        const hash = typeof response.meta?.disclaimer_hash === "string" ? response.meta.disclaimer_hash : null;
        const text = typeof response.meta?.disclaimer_text === "string" ? response.meta.disclaimer_text : "";
        setServerDisclaimerVersion(version);
        setServerDisclaimerHash(hash);
        setDisclaimerText(text);

        const contentVersion =
          (typeof response.content_package_version === "string" && response.content_package_version) ||
          (typeof response.dir_version === "string" && response.dir_version) ||
          "unknown";
        setPackVersion(contentVersion);
      } catch (error) {
        if (!active) return;
        const mapped = mapBig5Error(error);
        setQuestionError(mapped.message);
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
  }, [locale]);

  const ensureAttempt = async (): Promise<string | null> => {
    if (attemptId) {
      return attemptId;
    }

    setStarting(true);
    setStartError(null);

    const requestMeta: Record<string, unknown> = {
      disclaimer_version_accepted: serverDisclaimerVersion,
      disclaimer_hash: serverDisclaimerHash,
      disclaimer_locale: toApiLocale(locale),
      accepted_at: new Date().toISOString(),
      slug,
    };

    for (let retry = 0; retry < 2; retry += 1) {
      try {
        const response = await startBig5Attempt({
          locale: toApiLocale(locale),
          region: "GLOBAL",
          meta: requestMeta,
          clientVersion: "fe-big5-1",
        });

        setAttemptMeta({
          attemptId: response.attempt_id,
          resumeToken: response.resume_token ?? null,
          disclaimerVersion: serverDisclaimerVersion,
          disclaimerHash: serverDisclaimerHash,
        });

        trackBig5Event("start_click", {
          slug,
          disclaimer_version: serverDisclaimerVersion ?? "",
          disclaimer_hash: serverDisclaimerHash ?? "",
          scale_code: "BIG5_OCEAN",
          pack_version: packVersion,
          manifest_hash: "unknown",
          norms_version: "unknown",
          quality_level: "unknown",
          locked: true,
          variant: "free",
          sku_id: "",
        });

        setStarting(false);
        return response.attempt_id;
      } catch (error) {
        if (retry === 0) {
          await wait(600);
          continue;
        }

        const mapped = mapBig5Error(error);
        setStartError(mapped.message);

        if (error instanceof ApiError && error.status === 429) {
          trackBig5Event("retake_blocked", {
            reason: error.errorCode,
            retry_after_seconds: Number(
              (error.details as { retry_after_seconds?: unknown } | undefined)?.retry_after_seconds ?? 0
            ),
            scale_code: "BIG5_OCEAN",
            pack_version: packVersion,
            manifest_hash: "unknown",
            norms_version: "unknown",
            quality_level: "unknown",
            locked: true,
            variant: "free",
            sku_id: "",
          });
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
    trackBig5Event("question_answer", {
      attempt_id: attemptId ?? "",
      question_id: questionId,
      question_no: questionNo,
      answered_count: answeredCount + 1,
      scale_code: "BIG5_OCEAN",
      pack_version: packVersion,
      manifest_hash: "unknown",
      norms_version: "unknown",
      quality_level: "unknown",
      locked: true,
      variant: "free",
      sku_id: "",
    });
  };

  const handleSubmit = async () => {
    const activeAttemptId = await ensureAttempt();
    if (!activeAttemptId) return;

    const firstMissingIndex = questions.findIndex((item) => !answers[item.question_id]);
    if (firstMissingIndex >= 0) {
      setCurrentIndex(firstMissingIndex);
      setSubmitError(`Please answer question ${firstMissingIndex + 1} before submitting.`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitCanRetry(false);

    const durationMs = Math.max(1000, Date.now() - startedAt);

    try {
      trackBig5Event("submit_click", {
        attempt_id: activeAttemptId,
        answered_count: answeredCount,
        duration_ms: durationMs,
        scale_code: "BIG5_OCEAN",
        pack_version: packVersion,
        manifest_hash: "unknown",
        norms_version: "unknown",
        quality_level: "unknown",
        locked: true,
        variant: "free",
        sku_id: "",
      });

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
      setSubmitError(mapped.message);
      if (error instanceof ApiError && error.status === 408) {
        setSubmitCanRetry(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="m-0 text-sm text-slate-700">Loading BIG5 questions...</p>
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Alert>{questionError}</Alert>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
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
          <p className="m-0 whitespace-pre-wrap">{disclaimerText || "This assessment is for self-discovery and not a medical diagnosis."}</p>
        </div>

        <div className="text-xs text-slate-600">
          <p className="m-0">Version: {serverDisclaimerVersion ?? "unknown"}</p>
          <p className="m-0">Hash: {serverDisclaimerHash ?? "unknown"}</p>
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

        <Button type="button" disabled={!consentChecked || starting} onClick={handleAgreeAndStart}>
          {starting ? "Starting..." : "Agree and start"}
        </Button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Alert>No active question found. Please restart the assessment.</Alert>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressHeader current={currentIndex + 1} total={total} answered={answeredCount} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={total}
            selectedCode={answers[currentQuestion.question_id]}
            onSelect={handleSelectAnswer}
          />

          {submitError ? <Alert>{submitError}</Alert> : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex <= 0 || submitting}
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={currentIndex >= total - 1 || submitting}
              onClick={() => setCurrentIndex(Math.min(total - 1, currentIndex + 1))}
            >
              Next
            </Button>

            <Button type="button" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>

            {submitCanRetry ? (
              <Button type="button" variant="outline" disabled={submitting} onClick={handleSubmit}>
                Retry submit
              </Button>
            ) : null}
          </div>
        </div>

        <QuestionNavigator
          total={total}
          currentIndex={currentIndex}
          questionIds={questionIds}
          answeredMap={answers}
          onJump={(index) => setCurrentIndex(index)}
        />
      </div>
    </div>
  );
}
