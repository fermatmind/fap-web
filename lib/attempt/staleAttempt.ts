import { ApiError } from "@/lib/api-client";

export type SupportedTakeLocale = "en" | "zh";

export function isStaleAttemptSubmitError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 404) {
    return false;
  }

  const errorCode = String(error.errorCode ?? "").trim().toUpperCase();
  if (errorCode === "RESOURCE_NOT_FOUND" || errorCode === "NOT_FOUND") {
    return true;
  }

  const message = String(error.message ?? "").trim().toLowerCase();
  return message.includes("attempt not found") || message.includes("app\\models\\attempt");
}

export function isDraftNearComplete(answeredCount: number, totalQuestions: number): boolean {
  if (!Number.isFinite(answeredCount) || !Number.isFinite(totalQuestions) || totalQuestions <= 0) {
    return false;
  }

  const normalizedAnswered = Math.max(0, Math.floor(answeredCount));
  const normalizedTotal = Math.max(0, Math.floor(totalQuestions));
  const threshold = normalizedTotal <= 10 ? Math.max(1, normalizedTotal - 1) : Math.ceil(normalizedTotal * 0.9);

  return normalizedAnswered >= threshold;
}

export function shouldBlockInvalidDraftOnTakePage({
  answeredCount,
  totalQuestions,
  attemptId,
}: {
  answeredCount: number;
  totalQuestions: number;
  attemptId?: string | null;
}): boolean {
  return isDraftNearComplete(answeredCount, totalQuestions) && String(attemptId ?? "").trim().length === 0;
}

export function resolveStaleDraftResetMessage(locale: SupportedTakeLocale): string {
  if (locale === "zh") {
    return "当前草稿已失效，请重新开始。";
  }

  return "This draft is no longer valid. Please start again.";
}

export async function recoverStaleAttemptSubmit<T>({
  error,
  alreadyRecovered,
  clearAttemptState,
  startFreshAttempt,
  submitFreshAttempt,
}: {
  error: unknown;
  alreadyRecovered: boolean;
  clearAttemptState: () => void;
  startFreshAttempt: () => Promise<string | null>;
  submitFreshAttempt: (attemptId: string) => Promise<T>;
}): Promise<
  | {
      kind: "recovered";
      value: T;
    }
  | {
      kind: "failed";
    }
  | {
      kind: "ignored";
    }
> {
  if (!isStaleAttemptSubmitError(error) || alreadyRecovered) {
    return { kind: "ignored" };
  }

  clearAttemptState();

  const nextAttemptId = await startFreshAttempt();
  if (!nextAttemptId) {
    return { kind: "failed" };
  }

  try {
    const value = await submitFreshAttempt(nextAttemptId);
    return {
      kind: "recovered",
      value,
    };
  } catch {
    return { kind: "failed" };
  }
}
