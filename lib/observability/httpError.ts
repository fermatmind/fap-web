import { ApiError } from "@/lib/api-client";

export type ErrorStatusGroup = "422" | "500" | "timeout" | "other";

export function classifyApiError(error: unknown): {
  statusCode: number;
  statusGroup: ErrorStatusGroup;
  errorCode: string;
} {
  if (!(error instanceof ApiError)) {
    return {
      statusCode: 0,
      statusGroup: "other",
      errorCode: "UNKNOWN",
    };
  }

  const statusCode = Number.isFinite(error.status) ? error.status : 0;
  const normalizedErrorCode = String(error.errorCode ?? "").trim().toUpperCase();

  if (statusCode === 422) {
    return {
      statusCode,
      statusGroup: "422",
      errorCode: normalizedErrorCode || "VALIDATION_ERROR",
    };
  }

  if (statusCode >= 500 && statusCode <= 599) {
    return {
      statusCode,
      statusGroup: "500",
      errorCode: normalizedErrorCode || `HTTP_${statusCode}`,
    };
  }

  if (statusCode === 408 || normalizedErrorCode === "REQUEST_TIMEOUT") {
    return {
      statusCode,
      statusGroup: "timeout",
      errorCode: normalizedErrorCode || "REQUEST_TIMEOUT",
    };
  }

  return {
    statusCode,
    statusGroup: "other",
    errorCode: normalizedErrorCode || (statusCode > 0 ? `HTTP_${statusCode}` : "UNKNOWN"),
  };
}

