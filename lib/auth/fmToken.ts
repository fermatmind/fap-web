const FM_TOKEN_KEY = "fm_auth_token";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
const GUEST_TOKEN_TIMEOUT_MS = 10000;

export type GuestTokenErrorReason =
  | "config"
  | "timeout"
  | "network"
  | "http_error"
  | "missing_token";

export class GuestTokenRequestError extends Error {
  reason: GuestTokenErrorReason;
  status?: number;
  errorCode?: string;
  requestId?: string;

  constructor({
    reason,
    message,
    status,
    errorCode,
    requestId,
  }: {
    reason: GuestTokenErrorReason;
    message: string;
    status?: number;
    errorCode?: string;
    requestId?: string;
  }) {
    super(message);
    this.reason = reason;
    this.status = status;
    this.errorCode = errorCode;
    this.requestId = requestId;
  }
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getFmToken(): string | null {
  if (!canUseStorage()) return null;

  try {
    const token = window.localStorage.getItem(FM_TOKEN_KEY)?.trim() ?? "";
    if (isValidFmToken(token)) {
      return token;
    }
  } catch {
    // Ignore storage errors.
  }

  return null;
}

export function setFmToken(token: string | null | undefined): void {
  if (!canUseStorage()) return;

  try {
    const normalized = (token ?? "").trim();
    if (!normalized || !isValidFmToken(normalized)) {
      window.localStorage.removeItem(FM_TOKEN_KEY);
      return;
    }

    window.localStorage.setItem(FM_TOKEN_KEY, normalized);
  } catch {
    // Ignore storage errors.
  }
}

export function clearFmToken(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(FM_TOKEN_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function resolveApiLocale(locale?: string): "en" | "zh-CN" {
  const normalized = String(locale ?? "").trim().toLowerCase();
  if (normalized.startsWith("zh")) return "zh-CN";
  return "en";
}

function isValidFmToken(token: string): boolean {
  return token.startsWith("fm_") && token.length > 10;
}

function resolveGuestToken(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "";
  }

  const node = payload as Record<string, unknown>;
  const topTokenCandidates = [node.fm_token, node.token, node.auth_token];
  for (const candidate of topTokenCandidates) {
    if (typeof candidate === "string" && candidate.trim().startsWith("fm_")) {
      return candidate.trim();
    }
  }

  const data = node.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "";
  }

  const dataNode = data as Record<string, unknown>;
  const dataTokenCandidates = [dataNode.fm_token, dataNode.token, dataNode.auth_token];
  for (const candidate of dataTokenCandidates) {
    if (typeof candidate === "string" && candidate.trim().startsWith("fm_")) {
      return candidate.trim();
    }
  }

  return "";
}

function extractErrorDetails(payload: unknown): {
  code: string;
  message: string;
  requestId?: string;
} {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      code: "UNKNOWN",
      message: "Unknown error payload.",
    };
  }

  const node = payload as Record<string, unknown>;
  const code = typeof node.error_code === "string" && node.error_code.trim()
    ? node.error_code.trim()
    : "UNKNOWN";
  const message = typeof node.message === "string" && node.message.trim()
    ? node.message.trim()
    : "Unknown error.";
  const requestId =
    typeof node.request_id === "string" && node.request_id.trim()
      ? node.request_id.trim()
      : undefined;
  return { code, message, requestId };
}

export function isGuestTokenRequestError(error: unknown): error is GuestTokenRequestError {
  return error instanceof GuestTokenRequestError;
}

export function isGuestTokenEndpointMissingError(error: unknown): boolean {
  return isGuestTokenRequestError(error) && error.status === 404;
}

export async function requestGuestToken({
  anonId,
  locale,
}: {
  anonId?: string;
  locale?: string;
} = {}): Promise<string> {
  if (!API_BASE.trim()) {
    throw new GuestTokenRequestError({
      reason: "config",
      message: "NEXT_PUBLIC_API_BASE is empty. Unable to request guest token.",
    });
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-FAP-Locale": resolveApiLocale(locale),
  });
  const normalizedAnonId = String(anonId ?? "").trim();
  if (normalizedAnonId) {
    headers.set("X-Anon-Id", normalizedAnonId);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GUEST_TOKEN_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/v0.3/auth/guest`, {
      method: "POST",
      headers,
      body: JSON.stringify(normalizedAnonId ? { anon_id: normalizedAnonId } : {}),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new GuestTokenRequestError({
        reason: "timeout",
        message: "Guest token request timed out.",
      });
    }
    throw new GuestTokenRequestError({
      reason: "network",
      message: `Guest token request failed: ${error instanceof Error ? error.message : "unknown error"}`,
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const { code, message, requestId } = extractErrorDetails(payload);
    throw new GuestTokenRequestError({
      reason: "http_error",
      status: response.status,
      errorCode: code,
      requestId,
      message: `Failed to request guest token (${response.status}, ${code}): ${message}`,
    });
  }

  const token = resolveGuestToken(payload);
  if (!token) {
    throw new GuestTokenRequestError({
      reason: "missing_token",
      message: "Guest token missing in /auth/guest response payload.",
    });
  }

  setFmToken(token);
  return token;
}
