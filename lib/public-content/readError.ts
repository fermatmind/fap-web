export type PublicReadErrorKind =
  | "not_found"
  | "unpublished"
  | "forbidden"
  | "timeout"
  | "rate_limited"
  | "transient"
  | "network"
  | "contract";

type ApiErrorLike = Error & {
  status?: unknown;
  errorCode?: unknown;
  details?: unknown;
  requestId?: unknown;
};

export type PublicReadErrorShape = {
  kind: PublicReadErrorKind;
  status?: number;
  errorCode?: string;
  requestId?: string;
  retryAfterSeconds?: number;
  cause?: unknown;
};

const UNPUBLISHED_ERROR_CODES = new Set([
  "CONTENT_NOT_PUBLIC",
  "CONTENT_UNPUBLISHED",
  "DRAFT",
  "NOT_PUBLISHED",
  "UNPUBLISHED",
]);

const TIMEOUT_ERROR_CODES = new Set(["REQUEST_TIMEOUT", "TIMEOUT", "UPSTREAM_TIMEOUT"]);
const NETWORK_ERROR_CODES = new Set(["FETCH_FAILED", "NETWORK_ERROR"]);

const DEFAULT_MESSAGES: Record<PublicReadErrorKind, string> = {
  not_found: "Public content was not found.",
  unpublished: "Public content is not published.",
  forbidden: "Public content access was denied.",
  timeout: "The public content request timed out.",
  rate_limited: "The public content request was rate limited.",
  transient: "The public content service is temporarily unavailable.",
  network: "The public content service could not be reached.",
  contract: "The public content response did not match its contract.",
};

function normalizedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

function normalizedStatus(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
}

function retryAfterSeconds(details: unknown): number | undefined {
  if (!details || typeof details !== "object" || Array.isArray(details)) return undefined;
  const value = (details as Record<string, unknown>).retry_after_seconds;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.max(1, Math.ceil(numeric)) : undefined;
}

function classifyKind(error: ApiErrorLike, status?: number, errorCode?: string): PublicReadErrorKind {
  const normalizedCode = errorCode?.toUpperCase();

  if (normalizedCode && UNPUBLISHED_ERROR_CODES.has(normalizedCode)) return "unpublished";
  if (status === 404) return "not_found";
  if (status === 401 || status === 403) return "forbidden";
  if (status === 408 || status === 504 || (normalizedCode && TIMEOUT_ERROR_CODES.has(normalizedCode))) {
    return "timeout";
  }
  if (status === 429) return "rate_limited";
  if (status !== undefined && status >= 500) return "transient";
  if (normalizedCode && NETWORK_ERROR_CODES.has(normalizedCode)) return "network";
  if (error.name === "AbortError") return "timeout";
  if (error instanceof TypeError) return "network";
  return "contract";
}

export class PublicReadError extends Error {
  readonly kind: PublicReadErrorKind;
  readonly status?: number;
  readonly errorCode?: string;
  readonly requestId?: string;
  readonly retryAfterSeconds?: number;
  readonly authoritativeAbsence: boolean;
  readonly retryable: boolean;

  constructor(shape: PublicReadErrorShape) {
    super(DEFAULT_MESSAGES[shape.kind], { cause: shape.cause });
    this.name = "PublicReadError";
    this.kind = shape.kind;
    this.status = shape.status;
    this.errorCode = shape.errorCode;
    this.requestId = shape.requestId;
    this.retryAfterSeconds = shape.retryAfterSeconds;
    this.authoritativeAbsence = shape.kind === "not_found" || shape.kind === "unpublished";
    this.retryable = ["timeout", "rate_limited", "transient", "network"].includes(shape.kind);
  }
}

export function toPublicReadError(error: unknown): PublicReadError {
  if (error instanceof PublicReadError) return error;

  const errorLike: ApiErrorLike = error instanceof Error
    ? (error as ApiErrorLike)
    : new Error("Unknown public read error");
  const status = normalizedStatus(errorLike.status);
  const errorCode = normalizedString(errorLike.errorCode);
  const kind = classifyKind(errorLike, status, errorCode);

  return new PublicReadError({
    kind,
    status,
    errorCode,
    requestId: normalizedString(errorLike.requestId),
    retryAfterSeconds: retryAfterSeconds(errorLike.details),
    cause: error,
  });
}

export function isPublicReadError(error: unknown): error is PublicReadError {
  return error instanceof PublicReadError;
}

export function isAuthoritativePublicAbsence(error: unknown): boolean {
  return toPublicReadError(error).authoritativeAbsence;
}

export function isRetryablePublicReadError(error: unknown): boolean {
  return toPublicReadError(error).retryable;
}
