import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/lib/api-client";
import {
  isAuthoritativePublicAbsence,
  isRetryablePublicReadError,
  PublicReadError,
  toPublicReadError,
} from "@/lib/public-content/readError";

function apiError(status: number, errorCode: string, details?: unknown) {
  return new ApiError({
    status,
    errorCode,
    message: "backend detail must not become the public read message",
    details,
    requestId: "request-1",
  });
}

describe("public content read error contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [apiError(404, "NOT_FOUND"), "not_found", true, false],
    [apiError(404, "CONTENT_UNPUBLISHED"), "unpublished", true, false],
    [apiError(403, "FORBIDDEN"), "forbidden", false, false],
    [apiError(408, "REQUEST_TIMEOUT"), "timeout", false, true],
    [apiError(429, "RATE_LIMITED", { retry_after_seconds: 12 }), "rate_limited", false, true],
    [apiError(503, "UPSTREAM_UNAVAILABLE"), "transient", false, true],
    [new TypeError("fetch failed"), "network", false, true],
    [new SyntaxError("invalid payload"), "contract", false, false],
  ] as const)("classifies %s as %s without collapsing transient failures into absence", (
    input,
    kind,
    authoritativeAbsence,
    retryable
  ) => {
    const error = toPublicReadError(input);

    expect(error).toBeInstanceOf(PublicReadError);
    expect(error.kind).toBe(kind);
    expect(error.authoritativeAbsence).toBe(authoritativeAbsence);
    expect(error.retryable).toBe(retryable);
    expect(isAuthoritativePublicAbsence(error)).toBe(authoritativeAbsence);
    expect(isRetryablePublicReadError(error)).toBe(retryable);
    expect(error.message).not.toContain("backend detail");
  });

  it("preserves safe operational fields for bounded retry and correlation", () => {
    const error = toPublicReadError(apiError(429, "RATE_LIMITED", { retry_after_seconds: "11.2" }));

    expect(error).toMatchObject({
      kind: "rate_limited",
      status: 429,
      errorCode: "RATE_LIMITED",
      requestId: "request-1",
      retryAfterSeconds: 12,
    });
  });

  it("adds an opt-in public GET without changing existing API client methods", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network down")));

    await expect(apiClient.getPublic("/v0.5/public/content")).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "network",
      retryable: true,
      authoritativeAbsence: false,
    });
    expect(apiClient).toEqual(expect.objectContaining({
      get: expect.any(Function),
      post: expect.any(Function),
      put: expect.any(Function),
      del: expect.any(Function),
    }));
  });
});
