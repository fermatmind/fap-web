import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StaleDraftResetPrompt } from "@/components/quiz/StaleDraftResetPrompt";
import { ApiError } from "@/lib/api-client";
import {
  createTakeFlowController,
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

function buildDifferentAnswersConflictError(
  message = "attempt already submitted with different answers."
): ApiError {
  return new ApiError({
    status: 409,
    errorCode: "ATTEMPT_ALREADY_SUBMITTED_WITH_DIFFERENT_ANSWERS",
    message,
  });
}

afterEach(() => {
  vi.useRealTimers();
});

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

  it("stops after the first stale auto-recovery pass and falls back to reset state", async () => {
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

    expect(result).toEqual({ kind: "failed" });
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

  it("treats different-answer resubmit conflicts as recoverable stale submit errors", async () => {
    const clearAttemptState = vi.fn();
    const startFreshAttempt = vi.fn().mockResolvedValue("attempt-fresh-conflict-001");
    const submitFreshAttempt = vi.fn().mockResolvedValue("result-fresh-conflict-001");

    expect(
      isStaleAttemptSubmitError(buildDifferentAnswersConflictError())
    ).toBe(true);

    const recovery = await recoverStaleAttemptSubmit({
      error: buildDifferentAnswersConflictError(),
      alreadyRecovered: false,
      clearAttemptState,
      startFreshAttempt,
      submitFreshAttempt,
    });

    expect(recovery).toEqual({
      kind: "recovered",
      value: "result-fresh-conflict-001",
    });
    expect(clearAttemptState).toHaveBeenCalledTimes(1);
    expect(startFreshAttempt).toHaveBeenCalledTimes(1);
    expect(submitFreshAttempt).toHaveBeenCalledWith("attempt-fresh-conflict-001");
  });

  it("cancels pending delayed submit work after route change or unmount", async () => {
    vi.useFakeTimers();

    const controller = createTakeFlowController();
    const runId = controller.beginRun();
    const delayedSubmit = vi.fn();

    controller.schedule(delayedSubmit, 400, runId);
    const waitPromise = controller.wait(2200, runId);

    controller.cancelCurrentRun();
    await vi.runAllTimersAsync();

    await expect(waitPromise).resolves.toBe(false);
    expect(delayedSubmit).not.toHaveBeenCalled();
  });

  it("renders a structured stale reset prompt with an explicit restart action", () => {
    const onReset = vi.fn();

    render(
      createElement(StaleDraftResetPrompt, {
        locale: "zh",
        message: "当前草稿已失效，请重新开始。",
        onReset,
      })
    );

    expect(screen.getByTestId("stale-draft-reset-prompt")).toBeTruthy();
    expect(screen.getByText("草稿已失效")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "清空草稿并重新开始" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
