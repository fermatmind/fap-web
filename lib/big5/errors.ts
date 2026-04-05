import { ApiError } from "@/lib/api-client";

export type Big5RetakeCopy = {
  title: string;
  forms: {
    big5_120: string;
    big5_90: string;
    generic: string;
  };
  reasons: {
    cooldownWithRetry: string;
    cooldownWithoutRetry: string;
    limitExceededWithWindow: string;
    limitExceededDefault: string;
    genericWithRetry: string;
    genericWithoutRetry: string;
  };
  guidance: string;
  retryCountdown: string;
};

export type Big5UiError = {
  title: string;
  message: string;
  action?: "retry" | "restart" | "login" | "fill_missing";
  retryAfterSeconds?: number;
  reasonCode?: string;
  formCode?: "big5_120" | "big5_90" | null;
  scopeKey?: string | null;
};

const EN_BIG5_RETAKE_COPY: Big5RetakeCopy = {
  title: "Retake temporarily unavailable",
  forms: {
    big5_120: "Big Five 120-question Full Edition",
    big5_90: "Big Five 90-question Standard Edition",
    generic: "this Big Five assessment entry",
  },
  reasons: {
    cooldownWithRetry: "You already started {form_label}. Please try again in {retry_after}.",
    cooldownWithoutRetry: "You already started {form_label}. Please try again later.",
    limitExceededWithWindow: "You have reached the restart limit for {form_label} in the last 30 days.",
    limitExceededDefault: "You have reached the restart limit for {form_label}. Please try again later.",
    genericWithRetry: "Starting is temporarily limited. Please try again in {retry_after}.",
    genericWithoutRetry: "Starting is temporarily limited. Please try again later.",
  },
  guidance: "If you want to continue, come back later or explore another assessment.",
  retryCountdown: "Please wait {retry_after} before retrying.",
};

function replaceTemplate(template: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce((output, [key, value]) => output.replaceAll(`{${key}}`, value), template);
}

function normalizePositiveSeconds(value: unknown): number | undefined {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }

  return Math.max(1, Math.ceil(seconds));
}

function normalizeReasonCode(value: unknown): string | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  return normalized ? normalized : null;
}

function normalizeBig5FormCode(value: unknown): "big5_120" | "big5_90" | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (["big5_120", "120", "big5-120", "standard_120", "default"].includes(normalized)) {
    return "big5_120";
  }

  if (["big5_90", "90", "big5-90", "standard_90", "short_90"].includes(normalized)) {
    return "big5_90";
  }

  return null;
}

function resolveFormLabel(formCode: "big5_120" | "big5_90" | null, copy: Big5RetakeCopy): string {
  if (formCode === "big5_120") {
    return copy.forms.big5_120;
  }
  if (formCode === "big5_90") {
    return copy.forms.big5_90;
  }
  return copy.forms.generic;
}

export function formatBig5RetryAfterLabel(
  locale: "en" | "zh",
  retryAfterSeconds: number,
): string {
  const safeSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  const totalMinutes = Math.max(1, Math.ceil(safeSeconds / 60));
  if (totalMinutes >= 60) {
    const hours = Math.ceil(totalMinutes / 60);
    if (locale === "zh") {
      return `${hours}小时`;
    }
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  if (locale === "zh") {
    return `${totalMinutes}分钟`;
  }
  return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
}

export function formatBig5RetryCountdown(
  locale: "en" | "zh",
  retryAfterSeconds: number,
  copy: Big5RetakeCopy = EN_BIG5_RETAKE_COPY
): string {
  return replaceTemplate(copy.retryCountdown, {
    retry_after: formatBig5RetryAfterLabel(locale, retryAfterSeconds),
  });
}

export function mapBig5Error(
  error: unknown,
  options?: {
    locale?: "en" | "zh";
    fallbackFormCode?: string | null;
    copy?: Big5RetakeCopy;
  }
): Big5UiError {
  const locale = options?.locale ?? "en";
  const copy = options?.copy ?? EN_BIG5_RETAKE_COPY;

  if (!(error instanceof ApiError)) {
    return {
      title: "Something went wrong",
      message: "Please try again in a moment.",
      action: "retry",
    };
  }

  if (error.status === 422) {
    return {
      title: "Please review your answers",
      message: "Some answers are missing or invalid. Complete all required questions and submit again.",
      action: "fill_missing",
    };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      title: "Session expired",
      message: "Please restart the test before submitting again.",
      action: "restart",
    };
  }

  if (error.status === 429) {
    const details = (error.details && typeof error.details === "object")
      ? (error.details as Record<string, unknown>)
      : {};
    const retryAfter = normalizePositiveSeconds(details.retry_after_seconds);
    const reasonCode = normalizeReasonCode(details.reason_code ?? details.code ?? error.errorCode);
    const formCode = normalizeBig5FormCode(details.form_code) ?? normalizeBig5FormCode(options?.fallbackFormCode);
    const scopeKey = typeof details.scope_key === "string" && details.scope_key.trim().length > 0
      ? details.scope_key.trim()
      : null;
    const formLabel = resolveFormLabel(formCode, copy);

    let message: string;
    if (reasonCode === "RETAKE_COOLDOWN") {
      if (retryAfter) {
        message = replaceTemplate(copy.reasons.cooldownWithRetry, {
          form_label: formLabel,
          retry_after: formatBig5RetryAfterLabel(locale, retryAfter),
        });
      } else {
        message = replaceTemplate(copy.reasons.cooldownWithoutRetry, {
          form_label: formLabel,
        });
      }
    } else if (reasonCode === "RETAKE_LIMIT_EXCEEDED") {
      const limitWindow = String(details.limit_window ?? "").trim().toLowerCase();
      if (limitWindow === "30_days") {
        message = replaceTemplate(copy.reasons.limitExceededWithWindow, {
          form_label: formLabel,
        });
      } else {
        message = replaceTemplate(copy.reasons.limitExceededDefault, {
          form_label: formLabel,
        });
      }
    } else if (retryAfter) {
      message = replaceTemplate(copy.reasons.genericWithRetry, {
        retry_after: formatBig5RetryAfterLabel(locale, retryAfter),
      });
    } else {
      message = copy.reasons.genericWithoutRetry;
    }

    return {
      title: copy.title,
      message: `${message} ${copy.guidance}`.trim(),
      action: "retry",
      retryAfterSeconds: retryAfter,
      reasonCode: reasonCode ?? undefined,
      formCode,
      scopeKey,
    };
  }

  if (error.status >= 500) {
    return {
      title: "Server unavailable",
      message: "Service is temporarily unavailable. Your draft is saved. Please retry later.",
      action: "retry",
    };
  }

  return {
    title: "Request failed",
    message: error.message || "Please try again.",
    action: "retry",
  };
}
