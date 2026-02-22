import { ApiError } from "@/lib/api-client";

export type ClinicalUiError = {
  title: string;
  message: string;
  action?: "retry" | "restart" | "consent" | "fill_missing";
  retryAfterSeconds?: number;
};

export function mapClinicalError(error: unknown): ClinicalUiError {
  if (!(error instanceof ApiError)) {
    return {
      title: "Request failed",
      message: "Please try again in a moment.",
      action: "retry",
    };
  }

  const code = String(error.errorCode || "").trim().toUpperCase();

  if (error.status === 422) {
    if (code === "CONSENT_REQUIRED_SDS20" || code === "CONSENT_REQUIRED") {
      return {
        title: "Consent required",
        message: "Please accept informed consent before starting the assessment.",
        action: "consent",
      };
    }

    if (code === "SDS20_CONSENT_REQUIRED") {
      return {
        title: "Consent snapshot missing",
        message: "This session is missing consent snapshot. Please restart the assessment.",
        action: "restart",
      };
    }

    return {
      title: "Please complete required answers",
      message: "Some answers are missing or invalid.",
      action: "fill_missing",
    };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      title: "Session expired",
      message: "Please restart the assessment.",
      action: "restart",
    };
  }

  if (error.status === 429) {
    const details = error.details as { retry_after_seconds?: unknown } | undefined;
    const retryAfter = Number(details?.retry_after_seconds ?? 0);

    return {
      title: "Too many requests",
      message:
        retryAfter > 0
          ? `Please wait ${retryAfter} seconds before trying again.`
          : "Too many requests in a short time. Please retry later.",
      action: "retry",
      retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
    };
  }

  if (error.status >= 500) {
    return {
      title: "Server unavailable",
      message: "Service is temporarily unavailable. Please retry later.",
      action: "retry",
    };
  }

  return {
    title: "Request failed",
    message: error.message || "Please try again.",
    action: "retry",
  };
}
