import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveAccountSession, clearAccountSession } from "@/lib/account/storage";
import { ApiError } from "@/lib/api-client";
import { ensureFmTokenReady, runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import {
  getFmToken,
  GuestTokenRequestError,
  requestGuestToken,
  setFmToken,
} from "@/lib/auth/fmToken";

describe("auth guest token retry contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAccountSession();
  });

  it("does not silently downgrade an expired account to a guest", async () => {
    saveAccountSession("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const error = new ApiError({status:401,errorCode:"UNAUTHENTICATED",message:"Expired"});
    const runner = vi.fn().mockRejectedValue(error);
    await expect(runWithGuestTokenRetry({runner, locale:"en"})).rejects.toBe(error);
    expect(fetch).not.toHaveBeenCalled(); expect(runner).toHaveBeenCalledTimes(1); expect(getFmToken()).toBeNull();
  });

  it("does not overwrite a newer account with a delayed guest response", async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(r => {resolve = r;})));
    const pending = requestGuestToken({anonId:"test-browser",locale:"en"});
    saveAccountSession("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    resolve(new Response(JSON.stringify({ok:true,fm_token:"fm_11111111-2222-3333-4444-555555555555"}),{status:200}));
    await expect(pending).resolves.toBe("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    expect(getFmToken()).toBe("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  });

  it("preserves an account when the existing result bootstrap requests a forced guest refresh", async () => {
    saveAccountSession("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    await expect(ensureFmTokenReady({forceRefresh:true,anonId:"old-result-browser",locale:"en"})).resolves.toBe("existing");
    expect(fetch).not.toHaveBeenCalled();
    expect(getFmToken()).toBe("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  });

  it("still refreshes an existing guest when the result bootstrap requests it", async () => {
    setFmToken("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true,fm_token:"fm_11111111-2222-3333-4444-555555555555"}),{status:200})));
    await expect(ensureFmTokenReady({forceRefresh:true,anonId:"old-result-browser",locale:"en"})).resolves.toBe("issued");
    expect(getFmToken()).toBe("fm_11111111-2222-3333-4444-555555555555");
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
