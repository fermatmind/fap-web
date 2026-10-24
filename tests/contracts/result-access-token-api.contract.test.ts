import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAttemptReport, fetchAttemptReportAccess, fetchAttemptResult } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_result_access_token_contract",
  removePendingAnonLinkAttempts: vi.fn(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  getFmToken: () => null,
}));

vi.mock("@/lib/api-client", () => ({
  ApiError: class ApiError extends Error {
    status = 500;
    errorCode = "MOCK";
  },
  apiClient: {
    get: hoisted.get,
  },
}));

describe("result access token API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.get.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-token-1",
    });
  });

  it("sends result lookup tokens in headers instead of URL query strings for result, report, and report-access calls", async () => {
    await fetchAttemptResult({
      attemptId: "attempt-token-1",
      anonId: "anon-current-device",
      locale: "zh",
      accessToken: " result_token_123 ",
    });
    await fetchAttemptReport({
      attemptId: "attempt-token-1",
      locale: "zh",
      skipAuth: true,
      includeAnonId: false,
      accessToken: " result_token_123 ",
    });
    await fetchAttemptReportAccess({
      attemptId: "attempt-token-1",
      locale: "zh",
      skipAuth: true,
      includeAnonId: false,
      accessToken: " result_token_123 ",
    });

    expect(hoisted.get).toHaveBeenNthCalledWith(
      1,
      "/v0.3/attempts/attempt-token-1/result?locale=zh",
      {
        headers: {
          "X-Anon-Id": "anon-current-device",
          "X-Result-Access-Token": "result_token_123",
        },
      }
    );
    expect(hoisted.get).toHaveBeenNthCalledWith(
      2,
      "/v0.3/attempts/attempt-token-1/report?locale=zh",
      {
        headers: {
          "X-Result-Access-Token": "result_token_123",
        },
        skipAuth: true,
      }
    );
    expect(hoisted.get).toHaveBeenNthCalledWith(
      3,
      "/v0.3/attempts/attempt-token-1/report-access?locale=zh",
      {
        headers: {
          "X-Result-Access-Token": "result_token_123",
        },
        skipAuth: true,
      }
    );
  });
});

// PDF is another consumer of the same read-only result access grant.
describe("result page PDF access token", () => {
  it("keeps token-only reads in a header without attaching owner identity or accepting JSON", async () => {
    const { fetchAttemptResultPagePdfWithMeta } = await import("@/lib/api/v0_3");
    const fetch = vi.fn().mockResolvedValue(new Response('{"error":"pending"}', { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);
    try {
      await expect(fetchAttemptResultPagePdfWithMeta({ attemptId: "qa-pdf-token", anonId: "must-not-attach-owner", accessToken: "readonly-qa-token" })).rejects.toThrow();
      const [url, init] = fetch.mock.calls[0];
      expect(url).not.toContain("readonly-qa-token");
      expect(init.headers.get("X-Result-Access-Token")).toBe("readonly-qa-token");
      expect(init.headers.has("Authorization")).toBe(false);
      expect(init.headers.has("X-Anon-Id")).toBe(false);
      expect(init.cache).toBe("no-store");
    } finally { vi.unstubAllGlobals(); }
  });
});
