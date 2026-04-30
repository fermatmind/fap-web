import { beforeEach, describe, expect, it, vi } from "vitest";
import { queuePendingAnonLinkAttempt, readPendingAnonLinkAttempts } from "@/lib/anon";
import { linkAnonAttemptsOnceOnLoginSuccess } from "@/lib/api/v0_3";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("link-anon login helper contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("deduplicates by sorted attempts, uses the stored auth token, and clears queue on success", async () => {
    queuePendingAnonLinkAttempt("attempt_b");
    queuePendingAnonLinkAttempt("attempt_a");

    const fetchSpy = vi.fn().mockResolvedValue(
      jsonResponse({
        ok: true,
        linked_attempt_ids: ["attempt_a", "attempt_b"],
      })
    );
    vi.stubGlobal("fetch", fetchSpy);

    await linkAnonAttemptsOnceOnLoginSuccess({
      authToken: "fm_token_sorted_dedup_123456",
      anonId: "anon_login_001",
      attemptIds: ["attempt_b", "attempt_a", "attempt_a"],
    });

    await linkAnonAttemptsOnceOnLoginSuccess({
      authToken: "fm_token_sorted_dedup_123456",
      anonId: "anon_login_001",
      attemptIds: ["attempt_a", "attempt_b"],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/v0.3/me/attempts/link-anon");

    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer fm_token_sorted_dedup_123456");
    expect(headers.get("X-Anon-Id")).toBe("anon_login_001");
    expect(JSON.parse(String(init?.body))).toEqual({
      anon_id: "anon_login_001",
      attempt_ids: ["attempt_a", "attempt_b"],
    });
    expect(readPendingAnonLinkAttempts()).toEqual([]);
  });

  it("marks 404 as unsupported for 24 hours and skips later calls during the ttl window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-08T00:00:00.000Z"));

    queuePendingAnonLinkAttempt("attempt_404");

    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            ok: false,
            error_code: "NOT_FOUND",
            message: "Not Found",
            request_id: "req_link_404",
          },
          404
        )
      )
      .mockResolvedValueOnce(
        jsonResponse({
          ok: true,
          linked_attempt_ids: ["attempt_retry_after_ttl"],
        })
      );
    vi.stubGlobal("fetch", fetchSpy);

    await linkAnonAttemptsOnceOnLoginSuccess({
      authToken: "fm_token_unsupported_123456",
      anonId: "anon_login_404",
      attemptIds: ["attempt_404"],
    });

    await linkAnonAttemptsOnceOnLoginSuccess({
      authToken: "fm_token_unsupported_123456",
      anonId: "anon_login_404",
      attemptIds: ["attempt_should_skip"],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(readPendingAnonLinkAttempts()).toEqual(["attempt_404"]);

    vi.setSystemTime(new Date("2026-03-09T00:00:01.000Z"));

    await linkAnonAttemptsOnceOnLoginSuccess({
      authToken: "fm_token_unsupported_123456",
      anonId: "anon_login_404",
      attemptIds: ["attempt_retry_after_ttl"],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("keeps the queue on non-404 errors and retries on the next login success", async () => {
    queuePendingAnonLinkAttempt("attempt_retry");

    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse(
          {
            ok: false,
            error_code: "SERVER_ERROR",
            message: "Internal error",
            request_id: "req_link_500",
          },
          500
        )
      )
      .mockResolvedValueOnce(
        jsonResponse({
          ok: true,
          linked_attempt_ids: ["attempt_retry"],
        })
      );
    vi.stubGlobal("fetch", fetchSpy);

    await expect(
      linkAnonAttemptsOnceOnLoginSuccess({
        authToken: "fm_token_retry_123456",
        anonId: "anon_login_retry",
        attemptIds: ["attempt_retry"],
      })
    ).rejects.toMatchObject({
      status: 500,
      errorCode: "SERVER_ERROR",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(readPendingAnonLinkAttempts()).toEqual(["attempt_retry"]);

    await linkAnonAttemptsOnceOnLoginSuccess({
      authToken: "fm_token_retry_123456",
      anonId: "anon_login_retry",
      attemptIds: ["attempt_retry"],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(readPendingAnonLinkAttempts()).toEqual([]);
  });
});
