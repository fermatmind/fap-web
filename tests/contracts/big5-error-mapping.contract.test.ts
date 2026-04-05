import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api-client";
import {
  formatBig5RetryAfterLabel,
  formatBig5RetryCountdown,
  mapBig5Error,
} from "@/lib/big5/errors";
import { getDictSync } from "@/lib/i18n/getDict";

function buildRateLimitError({
  reasonCode,
  formCode,
  retryAfterSeconds,
  scopeKey,
  limitWindow,
}: {
  reasonCode?: string;
  formCode?: string;
  retryAfterSeconds?: number | null;
  scopeKey?: string;
  limitWindow?: string;
}): ApiError {
  return new ApiError({
    status: 429,
    errorCode: reasonCode ?? "RATE_LIMITED",
    message: "rate limited",
    details: {
      reason_code: reasonCode,
      form_code: formCode,
      retry_after_seconds: retryAfterSeconds,
      scope_key: scopeKey,
      limit_window: limitWindow,
    },
  });
}

describe("big5 429 error mapping contract", () => {
  const zhCopy = getDictSync("zh").quiz.big5Retake;
  const enCopy = getDictSync("en").quiz.big5Retake;

  it("maps RETAKE_COOLDOWN + big5_120 to form-aware copy", () => {
    const mapped = mapBig5Error(
      buildRateLimitError({
        reasonCode: "RETAKE_COOLDOWN",
        formCode: "big5_120",
        retryAfterSeconds: 900,
        scopeKey: "org+scale+identity+form",
      }),
      {
        locale: "zh",
        copy: zhCopy,
      }
    );

    expect(mapped.reasonCode).toBe("RETAKE_COOLDOWN");
    expect(mapped.formCode).toBe("big5_120");
    expect(mapped.scopeKey).toBe("org+scale+identity+form");
    expect(mapped.retryAfterSeconds).toBe(900);
    expect(mapped.message).toContain("大五人格120题完整版");
    expect(mapped.message).toContain("15分钟");
  });

  it("maps RETAKE_COOLDOWN + big5_90 to form-aware copy", () => {
    const mapped = mapBig5Error(
      buildRateLimitError({
        reasonCode: "RETAKE_COOLDOWN",
        formCode: "big5_90",
        retryAfterSeconds: 7200,
      }),
      {
        locale: "en",
        copy: enCopy,
      }
    );

    expect(mapped.reasonCode).toBe("RETAKE_COOLDOWN");
    expect(mapped.formCode).toBe("big5_90");
    expect(mapped.message).toContain("Big Five 90-question Standard Edition");
    expect(mapped.message).toContain("2 hours");
  });

  it("maps RETAKE_LIMIT_EXCEEDED + big5_120 to window-aware copy", () => {
    const mapped = mapBig5Error(
      buildRateLimitError({
        reasonCode: "RETAKE_LIMIT_EXCEEDED",
        formCode: "big5_120",
        limitWindow: "30_days",
      }),
      {
        locale: "zh",
        copy: zhCopy,
      }
    );

    expect(mapped.reasonCode).toBe("RETAKE_LIMIT_EXCEEDED");
    expect(mapped.formCode).toBe("big5_120");
    expect(mapped.message).toContain("最近30天内");
    expect(mapped.message).toContain("大五人格120题完整版");
  });

  it("maps RETAKE_LIMIT_EXCEEDED + big5_90 to form-aware copy", () => {
    const mapped = mapBig5Error(
      buildRateLimitError({
        reasonCode: "RETAKE_LIMIT_EXCEEDED",
        formCode: "big5_90",
      }),
      {
        locale: "en",
        copy: enCopy,
      }
    );

    expect(mapped.reasonCode).toBe("RETAKE_LIMIT_EXCEEDED");
    expect(mapped.formCode).toBe("big5_90");
    expect(mapped.message).toContain("Big Five 90-question Standard Edition");
    expect(mapped.message).toContain("restart limit");
  });

  it("uses retry_after_seconds when available and falls back when missing", () => {
    const withRetry = mapBig5Error(
      buildRateLimitError({
        reasonCode: "RETAKE_COOLDOWN",
        formCode: "big5_120",
        retryAfterSeconds: 3700,
      }),
      {
        locale: "en",
        copy: enCopy,
      }
    );
    expect(withRetry.message).toContain("2 hours");

    const withoutRetry = mapBig5Error(
      buildRateLimitError({
        reasonCode: "RETAKE_COOLDOWN",
        formCode: "big5_120",
      }),
      {
        locale: "en",
        copy: enCopy,
      }
    );
    expect(withoutRetry.message).not.toContain("seconds");
    expect(withoutRetry.message).toContain("Please try again later");
  });

  it("keeps non-429 mapping behavior stable", () => {
    const mapped = mapBig5Error(
      new ApiError({
        status: 500,
        errorCode: "INTERNAL",
        message: "internal error",
      }),
      {
        locale: "en",
        copy: enCopy,
      }
    );

    expect(mapped.title).toBe("Server unavailable");
    expect(mapped.action).toBe("retry");
  });
});

describe("big5 retry-after formatter", () => {
  it("formats retry-after with minutes/hours instead of raw seconds", () => {
    expect(formatBig5RetryAfterLabel("en", 59)).toBe("1 minute");
    expect(formatBig5RetryAfterLabel("en", 3700)).toBe("2 hours");
    expect(formatBig5RetryAfterLabel("zh", 59)).toBe("1分钟");
    expect(formatBig5RetryAfterLabel("zh", 3700)).toBe("2小时");
  });

  it("renders localized countdown copy", () => {
    const enCopy = getDictSync("en").quiz.big5Retake;
    const zhCopy = getDictSync("zh").quiz.big5Retake;

    expect(formatBig5RetryCountdown("en", 3599, enCopy)).toBe("Please wait 1 hour before retrying.");
    expect(formatBig5RetryCountdown("zh", 3599, zhCopy)).toBe("请在1小时后重试。");
  });
});
