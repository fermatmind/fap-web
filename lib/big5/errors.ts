import { ApiError } from "@/lib/api-client";

export type Big5UiError = {
  title: string;
  message: string;
  action?: "retry" | "restart" | "login" | "fill_missing";
  retryAfterSeconds?: number;
};

export function mapBig5Error(error: unknown): Big5UiError {
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
      message: "Please restart the test or log in again before submitting.",
      action: "restart",
    };
  }

  if (error.status === 429) {
    const details = error.details as { retry_after_seconds?: unknown } | undefined;
    const retryAfter = Number(details?.retry_after_seconds ?? 0);

    return {
      title: "Retake temporarily unavailable",
      message:
        retryAfter > 0
          ? `Please wait ${retryAfter} seconds before starting again.`
          : "Too many attempts in a short time. Please try later.",
      action: "retry",
      retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
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
