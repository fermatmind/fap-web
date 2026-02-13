export const ANALYTICS_ENDPOINT = "/api/v0.2/events";
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

export type AnalyticsProperties = Record<string, unknown>;

type AnalyticsEvent = {
  eventName: string;
  properties: AnalyticsProperties;
  timestamp: string;
  anonymousId: string;
  path: string;
};

const QUEUE_KEY = "fap_event_queue_v1";
const ANON_ID_KEY = "fap_anonymous_id_v1";
const LAST_FLUSH_KEY = "fap_analytics_last_flush";
const MAX_FLUSH_BATCH = 20;
const RETRY_MS = 15_000;

let isFlushing = false;
let flushTimer: number | null = null;
let scheduledFlushAt: number | null = null;

const isBrowser = () => typeof window !== "undefined";

const setLastFlush = () => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(LAST_FLUSH_KEY, new Date().toISOString());
  } catch {
    // Ignore write errors to avoid breaking user flow.
  }
};

const buildFallbackId = () =>
  `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const generateAnonymousId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return buildFallbackId();
};

const readQueue = (): AnalyticsEvent[] => {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AnalyticsEvent[];
  } catch {
    return [];
  }
};

const writeQueue = (queue: AnalyticsEvent[]) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore write errors to avoid breaking user flow.
  }
};

const scheduleFlush = (delayMs: number) => {
  if (!isBrowser()) return;

  const safeDelay = Math.max(0, delayMs);
  const runAt = Date.now() + safeDelay;

  if (
    flushTimer !== null &&
    scheduledFlushAt !== null &&
    runAt >= scheduledFlushAt
  ) {
    return;
  }

  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
  }

  scheduledFlushAt = runAt;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    scheduledFlushAt = null;
    void flushEvents();
  }, safeDelay);
};

export function getAnonymousId(): string {
  if (!isBrowser()) return "";

  try {
    const cached = window.localStorage.getItem(ANON_ID_KEY);
    if (cached) return cached;

    const nextId = generateAnonymousId();
    window.localStorage.setItem(ANON_ID_KEY, nextId);
    return nextId;
  } catch {
    return generateAnonymousId();
  }
}

export function clearAnalyticsQueue(): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(QUEUE_KEY);
    window.localStorage.removeItem(LAST_FLUSH_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}

export function initAnalytics(): void {
  if (!isBrowser()) return;

  if (!ANALYTICS_ENABLED) {
    clearAnalyticsQueue();
    return;
  }

  scheduleFlush(0);
}

export function trackEvent(
  eventName: string,
  properties: AnalyticsProperties = {}
): void {
  if (!ANALYTICS_ENABLED || !isBrowser() || !eventName) return;

  const payload: AnalyticsEvent = {
    eventName,
    properties,
    timestamp: new Date().toISOString(),
    anonymousId: getAnonymousId(),
    path: `${window.location.pathname}${window.location.search}`,
  };

  const queue = readQueue();
  queue.push(payload);
  writeQueue(queue);
  scheduleFlush(0);
}

export async function flushEvents(): Promise<void> {
  if (!ANALYTICS_ENABLED || !isBrowser() || isFlushing) return;

  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
    scheduledFlushAt = null;
  }

  isFlushing = true;

  try {
    while (true) {
      const queue = readQueue();
      if (queue.length === 0) return;

      const batch = queue.slice(0, MAX_FLUSH_BATCH);

      let response: Response;
      try {
        response = await fetch(ANALYTICS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ events: batch }),
          keepalive: true,
        });
      } catch {
        scheduleFlush(RETRY_MS);
        return;
      }

      if (!response.ok) {
        scheduleFlush(RETRY_MS);
        return;
      }

      const latestQueue = readQueue();
      const remaining = latestQueue.slice(batch.length);
      writeQueue(remaining);
      setLastFlush();

      if (remaining.length === 0) {
        return;
      }
    }
  } finally {
    isFlushing = false;
  }
}
