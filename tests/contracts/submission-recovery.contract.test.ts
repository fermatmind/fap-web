import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { recoverAcceptedSubmission } from "@/lib/attempt/submissionRecovery";

const { readSubmission } = vi.hoisted(() => ({ readSubmission: vi.fn() }));
vi.mock("@/lib/api/v0_3", () => ({ fetchAttemptSubmission: readSubmission }));
const timeout = new ApiError({ status: 408, errorCode: "REQUEST_TIMEOUT", message: "Timed out" });

describe("ambiguous submission recovery", () => {
  beforeEach(() => readSubmission.mockReset());

  it.each(["pending", "running", "succeeded"])("recovers only the original %s attempt", async (state) => {
    readSubmission.mockResolvedValue({ ok: true, attempt_id: "original", submission: { state } });
    expect(await recoverAcceptedSubmission({ error: timeout, attemptId: "original", anonId: "fixture-anon" })).toBe(true);
    expect(readSubmission).toHaveBeenCalledExactlyOnceWith({ attemptId: "original", anonId: "fixture-anon" });
  });

  it.each(["failed", "queued", "", undefined])("does not treat %s as confirmed receipt", async (state) => {
    readSubmission.mockResolvedValue({ ok: true, submission: { state } });
    expect(await recoverAcceptedSubmission({ error: timeout, attemptId: "original" })).toBe(false);
  });

  it("preserves retry when the network or readback remains unavailable", async () => {
    readSubmission.mockRejectedValue(new TypeError("Offline"));
    expect(await recoverAcceptedSubmission({ error: new TypeError("Lost response"), attemptId: "original" })).toBe(false);
  });

  it("rejects another attempt and unsuccessful readbacks", async () => {
    for (const response of [
      { ok: true, attempt_id: "other", submission: { state: "succeeded" } },
      { ok: false, submission: { state: "succeeded" } },
    ]) {
      readSubmission.mockResolvedValue(response);
      expect(await recoverAcceptedSubmission({ error: timeout, attemptId: "original" })).toBe(false);
    }
  });

  it.each([401, 403, 404, 409, 422, 429])("preserves the existing %s auth, stale-draft or validation path", async (status) => {
    const error = new ApiError({ status, errorCode: "REJECTED", message: "Rejected" });
    expect(await recoverAcceptedSubmission({ error, attemptId: "original" })).toBe(false);
    expect(readSubmission).not.toHaveBeenCalled();
  });
});
