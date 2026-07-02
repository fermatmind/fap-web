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
