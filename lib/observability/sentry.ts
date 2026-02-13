import { logError, redact } from "@/lib/observability/logger";

declare global {
  interface Window {
    Sentry?: {
      init?: (options: Record<string, unknown>) => void;
      setTag?: (key: string, value: string) => void;
      captureException?: (error: unknown, context?: Record<string, unknown>) => void;
    };
  }
}

let hasInit = false;

export function initSentry() {
  if (hasInit || typeof window === "undefined") return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || !window.Sentry?.init) {
    hasInit = true;
    return;
  }

  window.Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_RELEASE,
  });

  hasInit = true;
}

export function captureError(error: unknown, context: Record<string, unknown> = {}) {
  const safeContext = redact(context) as Record<string, unknown>;

  if (typeof window !== "undefined" && window.Sentry?.captureException) {
    if (window.Sentry.setTag && typeof safeContext.route === "string") {
      window.Sentry.setTag("route", safeContext.route);
    }
    if (window.Sentry.setTag && typeof process.env.NEXT_PUBLIC_RELEASE === "string") {
      window.Sentry.setTag("release", process.env.NEXT_PUBLIC_RELEASE);
    }

    window.Sentry.captureException(error, {
      extra: safeContext,
    });
    return;
  }

  logError("captureError", {
    error: error instanceof Error ? error.message : String(error),
    ...safeContext,
  });
}
