import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  clearFmToken,
  getFmToken,
  GuestTokenRequestError,
  requestGuestToken,
  setFmToken,
} from "@/lib/auth/fmToken";

describe("auth guest token retry contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearFmToken();
  });

  it("stores guest token on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            fm_token: "fm_12345678-1234-1234-1234-1234567890ab",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      )
    );

    const token = await requestGuestToken({
      anonId: "anon_contract_001",
      locale: "en",
    });

    expect(token).toBe("fm_12345678-1234-1234-1234-1234567890ab");
  });

  it("throws typed error on 404 guest endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error_code: "NOT_FOUND",
            message: "Not Found",
            request_id: "req_test_404",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      )
    );

    await expect(
      requestGuestToken({
        anonId: "anon_contract_002",
        locale: "zh",
      })
    ).rejects.toMatchObject({
      status: 404,
      errorCode: "NOT_FOUND",
      requestId: "req_test_404",
      reason: "http_error",
    });
  });

  it("retries once after 401 and succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            fm_token: "fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      )
    );

    let runCalls = 0;
    const runner = vi.fn(async () => {
      runCalls += 1;
      if (runCalls === 1) {
        throw new ApiError({
          status: 401,
          errorCode: "UNAUTHENTICATED",
          message: "Missing token",
        });
      }

      return "ok";
    });

    const value = await runWithGuestTokenRetry({
      runner,
      anonId: "anon_contract_003",
      locale: "en",
    });

    expect(value).toBe("ok");
    expect(runner).toHaveBeenCalledTimes(2);
  });

  it("force refreshes token during bootstrap when requested", async () => {
    setFmToken("fm_existing-1111-2222-3333-444444444444");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            fm_token: "fm_refresh-aaaa-bbbb-cccc-dddddddddddd",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      )
    );

    const status = await ensureFmTokenReady({
      anonId: "anon_contract_refresh",
      locale: "en",
      forceRefresh: true,
    });

    expect(status).toBe("issued");
    expect(getFmToken()).toBe("fm_refresh-aaaa-bbbb-cccc-dddddddddddd");
  });

  it("surfaces guest token error and notifies callback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error_code: "NOT_FOUND",
            message: "Not Found",
            request_id: "req_guest_fail",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      )
    );

    const runner = vi.fn(async () => {
      throw new ApiError({
        status: 401,
        errorCode: "UNAUTHENTICATED",
        message: "Missing token",
      });
    });

    const failureSpy = vi.fn();
    await expect(
      runWithGuestTokenRetry({
        runner,
        anonId: "anon_contract_004",
        locale: "en",
        onGuestTokenFailure: failureSpy,
      })
    ).rejects.toBeInstanceOf(GuestTokenRequestError);

    expect(runner).toHaveBeenCalledTimes(1);
    expect(failureSpy).toHaveBeenCalledTimes(1);
  });
});
