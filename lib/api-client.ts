import { getLocaleFromPathname, toApiLocale } from "@/lib/i18n/locales";

export type ApiErrorShape = { status: number; message: string; details?: unknown };

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.status = shape.status;
    this.details = shape.details;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';
const DEFAULT_TIMEOUT_MS = 15000;

type Json = Record<string, unknown>;
type RequestOptions = RequestInit & { timeoutMs?: number; locale?: string };

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
  const { timeoutMs = DEFAULT_TIMEOUT_MS, locale, ...fetchInit } = init;
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

    res = await fetch(`${API_BASE}${path}`, {
      ...fetchInit,
      method,
      signal: controller.signal,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError({ status: 408, message: "REQUEST_TIMEOUT" });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401) {
    throw new ApiError({ status: 401, message: 'UNAUTHORIZED' });
  }

  if (res.status === 422) {
    const details = await res.json().catch(() => null);
    throw new ApiError({ status: 422, message: 'VALIDATION_ERROR', details });
  }

  if (!res.ok) {
    const details = await res.json().catch(() => null);
    const text =
      typeof details === "object" && details && "message" in details
        ? String((details as { message: unknown }).message ?? "")
        : await res.text().catch(() => "");
    throw new ApiError({ status: res.status, message: text || `API_ERROR_${res.status}`, details });
  }

  const data = (await res.json().catch(() => null)) as T;
  return data;
}

export const apiClient = {
  get: <T>(path: string, init?: RequestOptions) => request<T>('GET', path, undefined, init),
  post: <T>(path: string, body?: Json, init?: RequestOptions) => request<T>('POST', path, body, init),
  put: <T>(path: string, body?: Json, init?: RequestOptions) => request<T>('PUT', path, body, init),
  del: <T>(path: string, init?: RequestOptions) => request<T>('DELETE', path, undefined, init),
};
