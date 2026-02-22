import { getLocaleFromPathname, toApiLocale } from "@/lib/i18n/locales";
import { getFmToken } from "@/lib/auth/fmToken";

export type ApiErrorShape = {
  status: number;
  errorCode: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export class ApiError extends Error {
  status: number;
  errorCode: string;
  details?: unknown;
  requestId?: string;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.status = shape.status;
    this.errorCode = shape.errorCode;
    this.details = shape.details;
    this.requestId = shape.requestId;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
const DEFAULT_TIMEOUT_MS = 15000;

type Json = Record<string, unknown>;
type RequestOptions = RequestInit & {
  timeoutMs?: number;
  locale?: string;
  authToken?: string | null;
  skipAuth?: boolean;
};

function resolveRequestLocale(headers: Headers, localeHint?: string): "en" | "zh-CN" {
  if (localeHint) {
    return toApiLocale(localeHint);
  }

  const headerLocale = headers.get("X-FAP-Locale") ?? headers.get("x-locale") ?? headers.get("X-Locale");
  if (headerLocale) {
    return toApiLocale(headerLocale);
  }

  if (typeof window !== "undefined") {
    return toApiLocale(getLocaleFromPathname(window.location.pathname));
  }

  return "en";
}

async function request<T>(method: string, path: string, body?: Json, init: RequestOptions = {}): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    locale,
    authToken,
    skipAuth = false,
    ...fetchInit
  } = init;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (fetchInit.signal) {
    fetchInit.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let res: Response;
  try {
    const mergedHeaders = new Headers(fetchInit.headers ?? {});
    mergedHeaders.set("Content-Type", "application/json");
    mergedHeaders.set("Accept", "application/json");
    if (!mergedHeaders.has("X-FAP-Locale")) {
      mergedHeaders.set("X-FAP-Locale", resolveRequestLocale(mergedHeaders, locale));
    }
    if (!skipAuth && !mergedHeaders.has("Authorization")) {
      const resolvedAuthToken = authToken ?? getFmToken();
      if (resolvedAuthToken) {
        mergedHeaders.set("Authorization", `Bearer ${resolvedAuthToken}`);
      }
    }

    res = await fetch(`${API_BASE}${path}`, {
      ...fetchInit,
      method,
      signal: controller.signal,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError({
        status: 408,
        errorCode: "REQUEST_TIMEOUT",
        message: "Request timed out.",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const payloadNode =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : null;

    const fallbackErrorCode =
      res.status === 401
        ? "UNAUTHORIZED"
        : res.status === 403
          ? "FORBIDDEN"
          : res.status === 404
            ? "NOT_FOUND"
            : res.status === 422
              ? "VALIDATION_ERROR"
              : res.status === 429
                ? "RATE_LIMITED"
                : `HTTP_${res.status}`;

    const message =
      typeof payloadNode?.message === "string" && payloadNode.message.trim().length > 0
        ? payloadNode.message
        : `Request failed with status ${res.status}.`;

    const errorCode =
      typeof payloadNode?.error_code === "string" && payloadNode.error_code.trim().length > 0
        ? payloadNode.error_code.trim()
        : fallbackErrorCode;

    const details =
      payloadNode && Object.prototype.hasOwnProperty.call(payloadNode, "details")
        ? payloadNode.details
        : payloadNode;

    const requestId =
      typeof payloadNode?.request_id === "string" && payloadNode.request_id.trim().length > 0
        ? payloadNode.request_id.trim()
        : undefined;

    throw new ApiError({
      status: res.status,
      errorCode,
      message,
      details,
      requestId,
    });
  }

  const data = (await res.json().catch(() => null)) as T;
  return data;
}

export const apiClient = {
  get: <T>(path: string, init?: RequestOptions) => request<T>("GET", path, undefined, init),
  post: <T>(path: string, body?: Json, init?: RequestOptions) => request<T>("POST", path, body, init),
  put: <T>(path: string, body?: Json, init?: RequestOptions) => request<T>("PUT", path, body, init),
  del: <T>(path: string, init?: RequestOptions) => request<T>("DELETE", path, undefined, init),
};
