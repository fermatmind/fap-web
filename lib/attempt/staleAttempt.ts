import { ApiError } from "@/lib/api-client";

export type SupportedTakeLocale = "en" | "zh";

export type TakeFlowController = {
  beginRun: () => number;
  isActive: (runId?: number) => boolean;
  wait: (ms: number, runId?: number) => Promise<boolean>;
  schedule: (callback: () => void, ms: number, runId?: number) => number | null;
  cancelCurrentRun: () => void;
  dispose: () => void;
};

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

export function createTakeFlowController(): TakeFlowController {
  let activeRunId = 0;
  let disposed = false;
  const timers = new Set<number>();
  const pendingWaitResolvers = new Map<number, (value: boolean) => void>();

  const clearTimers = () => {
    timers.forEach((timerId) => {
      window.clearTimeout(timerId);
      const pendingResolver = pendingWaitResolvers.get(timerId);
      if (pendingResolver) {
        pendingWaitResolvers.delete(timerId);
        pendingResolver(false);
      }
    });
    timers.clear();
  };

  const isActive = (runId?: number) => !disposed && (typeof runId !== "number" || runId === activeRunId);

  const beginRun = () => {
    activeRunId += 1;
    clearTimers();
    return activeRunId;
  };

  const schedule = (callback: () => void, ms: number, runId?: number) => {
    if (!isActive(runId)) {
      return null;
    }

    const timerId = window.setTimeout(() => {
      timers.delete(timerId);
      if (!isActive(runId)) {
        return;
      }
      callback();
    }, ms);

    timers.add(timerId);
    return timerId;
  };

  const wait = (ms: number, runId?: number) => {
    if (!isActive(runId)) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      const timerId = window.setTimeout(() => {
        timers.delete(timerId);
        pendingWaitResolvers.delete(timerId);
        resolve(isActive(runId));
      }, ms);

      pendingWaitResolvers.set(timerId, resolve);
      timers.add(timerId);
    });
  };

  const cancelCurrentRun = () => {
    activeRunId += 1;
    clearTimers();
  };

  const dispose = () => {
    disposed = true;
    cancelCurrentRun();
  };

  return {
    beginRun,
    isActive,
    wait,
    schedule,
    cancelCurrentRun,
    dispose,
  };
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
  if (!isStaleAttemptSubmitError(error)) {
    return { kind: "ignored" };
  }

  if (alreadyRecovered) {
    return { kind: "failed" };
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
