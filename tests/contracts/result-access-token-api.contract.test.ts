import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAttemptReport, fetchAttemptReportAccess, fetchAttemptResult } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  get: vi.fn(),
  getFmToken: vi.fn(() => null as string | null),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_result_access_token_contract",
  removePendingAnonLinkAttempts: vi.fn(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  getFmToken: hoisted.getFmToken,
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
    hoisted.getFmToken.mockReturnValue(null);
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
  it.each(["fetchAttemptResultPagePdfWithMeta", "fetchAttemptReportPdfWithMeta"] as const)("keeps %s token-only reads in a header without owner identity or JSON downloads", async (name) => {
    const api = await import("@/lib/api/v0_3");
    const fetch = vi.fn().mockResolvedValue(new Response('{"error":"pending"}', { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);
    try {
      await expect(api[name]({ attemptId: "qa-pdf-token", anonId: "must-not-attach-owner", accessToken: "readonly-qa-token" })).rejects.toThrow();
      const [url, init] = fetch.mock.calls[0];
      expect(url).not.toContain("readonly-qa-token");
      expect(init.headers.get("X-Result-Access-Token")).toBe("readonly-qa-token");
      expect(init.headers.has("Authorization")).toBe(false);
      expect(init.headers.has("X-Anon-Id")).toBe(false);
      expect(init.cache).toBe("no-store");
    } finally { vi.unstubAllGlobals(); }
  });
});


describe("owner PDF fetch preserves authentication and backend denials", () => {
  it("uses normal owner headers without putting credentials in the URL", async () => {
    const api = await import("@/lib/api/v0_3");
    hoisted.getFmToken.mockReturnValue("fm_synthetic_owner_contract");
    const fetch = vi.fn().mockResolvedValue(new Response("%PDF-synthetic", { headers: { "content-type": "application/pdf" } }));
    vi.stubGlobal("fetch", fetch);
    try {
      await api.fetchAttemptResultPagePdfWithMeta({ attemptId: "attempt-owner", anonId: "synthetic-owner" });
      const [url, init] = fetch.mock.calls[0];
      expect(String(url)).toMatch(/\/attempts\/attempt-owner\/result-page\.pdf$/);
      expect(String(url)).not.toContain("synthetic_owner_contract");
      expect(init.headers.get("Authorization")).toBe("Bearer fm_synthetic_owner_contract");
      expect(init.headers.get("X-Anon-Id")).toBe("synthetic-owner");
      expect(init.headers.has("X-Result-Access-Token")).toBe(false);
      expect(init.cache).toBe("no-store");
    } finally { hoisted.getFmToken.mockReturnValue(null); vi.unstubAllGlobals(); }
  });

  it.each([401, 404, 409, 503])("does not turn status %s into a PDF download", async (status) => {
    const api = await import("@/lib/api/v0_3");
    const fetch = vi.fn().mockResolvedValue(new Response('{"error":"private"}', { status, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);
    try { await expect(api.fetchAttemptResultPagePdfWithMeta({ attemptId: "attempt-denied" })).rejects.toThrow(`Failed to fetch result-page pdf: ${status}`); }
    finally { vi.unstubAllGlobals(); }
  });
});
