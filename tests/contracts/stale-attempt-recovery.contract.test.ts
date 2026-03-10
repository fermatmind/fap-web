import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import {
  isStaleAttemptSubmitError,
  recoverStaleAttemptSubmit,
  resolveStaleDraftResetMessage,
  shouldBlockInvalidDraftOnTakePage,
} from "@/lib/attempt/staleAttempt";

function buildNotFoundError(message = "attempt not found."): ApiError {
  return new ApiError({
    status: 404,
    errorCode: "RESOURCE_NOT_FOUND",
    message,
  });
}

describe("stale attempt recovery", () => {
  it("retries once by starting a fresh attempt and resubmitting on stale submit 404", async () => {
    const clearAttemptState = vi.fn();
    const startFreshAttempt = vi.fn().mockResolvedValue("attempt-fresh-002");
    const submitFreshAttempt = vi.fn().mockResolvedValue("result-fresh-002");

    const result = await recoverStaleAttemptSubmit({
      error: buildNotFoundError(),
      alreadyRecovered: false,
      clearAttemptState,
      startFreshAttempt,
      submitFreshAttempt,
    });

    expect(result).toEqual({
      kind: "recovered",
      value: "result-fresh-002",
    });
    expect(clearAttemptState).toHaveBeenCalledTimes(1);
    expect(startFreshAttempt).toHaveBeenCalledTimes(1);
    expect(submitFreshAttempt).toHaveBeenCalledTimes(1);
    expect(submitFreshAttempt).toHaveBeenCalledWith("attempt-fresh-002");
  });

  it("fails once and stops when stale submit recovery cannot obtain a fresh attempt", async () => {
    const clearAttemptState = vi.fn();
    const startFreshAttempt = vi.fn().mockResolvedValue(null);
    const submitFreshAttempt = vi.fn();

    const result = await recoverStaleAttemptSubmit({
      error: buildNotFoundError(),
      alreadyRecovered: false,
      clearAttemptState,
      startFreshAttempt,
      submitFreshAttempt,
    });

    expect(result).toEqual({ kind: "failed" });
    expect(clearAttemptState).toHaveBeenCalledTimes(1);
    expect(startFreshAttempt).toHaveBeenCalledTimes(1);
    expect(submitFreshAttempt).not.toHaveBeenCalled();
  });

  it("does not attempt a second auto-recovery after the first stale recovery pass", async () => {
    const clearAttemptState = vi.fn();
    const startFreshAttempt = vi.fn();
    const submitFreshAttempt = vi.fn();

    const result = await recoverStaleAttemptSubmit({
      error: buildNotFoundError("No query results for model [App\\Models\\Attempt]."),
      alreadyRecovered: true,
      clearAttemptState,
      startFreshAttempt,
      submitFreshAttempt,
    });

    expect(result).toEqual({ kind: "ignored" });
    expect(clearAttemptState).not.toHaveBeenCalled();
    expect(startFreshAttempt).not.toHaveBeenCalled();
    expect(submitFreshAttempt).not.toHaveBeenCalled();
  });

  it("blocks near-complete drafts without an active attempt on take page entry", () => {
    expect(
      shouldBlockInvalidDraftOnTakePage({
        answeredCount: 59,
        totalQuestions: 60,
        attemptId: null,
      })
    ).toBe(true);
    expect(
      shouldBlockInvalidDraftOnTakePage({
        answeredCount: 59,
        totalQuestions: 60,
        attemptId: "attempt-live-001",
      })
    ).toBe(false);
    expect(resolveStaleDraftResetMessage("zh")).toBe("当前草稿已失效，请重新开始。");
    expect(isStaleAttemptSubmitError(buildNotFoundError())).toBe(true);
  });
});
