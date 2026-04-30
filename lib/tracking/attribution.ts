export const ATTRIBUTION_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "msclkid",
  "fbclid",
] as const;

export const TRACKING_ATTRIBUTION_FIELDS = [
  ...ATTRIBUTION_QUERY_KEYS,
  "referrer",
  "landing_path",
  "current_path",
  "session_id",
] as const;

export type AttributionQueryKey = (typeof ATTRIBUTION_QUERY_KEYS)[number];
export type AttributionParams = Partial<Record<AttributionQueryKey, string>>;
export type TrackingAttributionPayload = Partial<
  Record<(typeof TRACKING_ATTRIBUTION_FIELDS)[number], string>
>;

type SearchParamRecord = Record<string, string | string[] | undefined>;
type StoredTouch = TrackingAttributionPayload & {
  captured_at: string;
};
type StoredAttribution = {
  first_touch?: StoredTouch;
  last_touch?: StoredTouch;
  updated_at: string;
};

const ATTRIBUTION_STORAGE_KEY = "fm_attribution_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeText(value: unknown, maxLength = 512): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function firstRecordValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return normalizeText(value[0]);
  return normalizeText(value);
}

function readStoredAttribution(): StoredAttribution | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredAttribution>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      first_touch: parsed.first_touch,
      last_touch: parsed.last_touch,
      updated_at: normalizeText(parsed.updated_at) ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeStoredAttribution(next: StoredAttribution): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Attribution must never block user flows.
  }
}

export function extractAttributionParamsFromRecord(record: SearchParamRecord): AttributionParams {
  return ATTRIBUTION_QUERY_KEYS.reduce<AttributionParams>((acc, key) => {
    const value = firstRecordValue(record[key]);
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function extractAttributionParamsFromSearchParams(searchParams: URLSearchParams): AttributionParams {
  return ATTRIBUTION_QUERY_KEYS.reduce<AttributionParams>((acc, key) => {
    const value = normalizeText(searchParams.get(key));
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function hasAttributionParams(params: AttributionParams): boolean {
  return ATTRIBUTION_QUERY_KEYS.some((key) => Boolean(params[key]));
}

export function appendAttributionParamsToHref(href: string, params: AttributionParams): string {
  if (!hasAttributionParams(params)) return href;

  const [pathname, rawQuery = ""] = href.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const value = params[key];
    if (value) {
      searchParams.set(key, value);
    }
  }

  const serialized = searchParams.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function buildTrackingAttributionPayload(
  params: AttributionParams,
  extra: {
    referrer?: string | null;
    landingPath?: string | null;
    currentPath?: string | null;
    sessionId?: string | null;
  } = {}
): TrackingAttributionPayload {
  const payload: TrackingAttributionPayload = {};

  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const value = normalizeText(params[key]);
    if (value) {
      payload[key] = value;
    }
  }

  const referrer = normalizeText(extra.referrer, 2048);
  const landingPath = normalizeText(extra.landingPath, 2048);
  const currentPath = normalizeText(extra.currentPath, 2048);
  const sessionId = normalizeText(extra.sessionId, 128);

  if (referrer) payload.referrer = referrer;
  if (landingPath) payload.landing_path = landingPath;
  if (currentPath) payload.current_path = currentPath;
  if (sessionId) payload.session_id = sessionId;

  return payload;
}

export function captureAttributionFromLocation({
  pathname,
  search,
  referrer,
}: {
  pathname: string;
  search: string;
  referrer?: string;
}): TrackingAttributionPayload {
  const currentPath = `${pathname}${search}`;
  const params = extractAttributionParamsFromSearchParams(new URLSearchParams(search));
  const payload = buildTrackingAttributionPayload(params, {
    referrer,
    landingPath: currentPath,
    currentPath,
  });
  const hasTouch = Object.keys(payload).some((key) => key !== "current_path");
  const stored = readStoredAttribution();

  if (hasTouch) {
    const now = new Date().toISOString();
    const touch: StoredTouch = {
      ...payload,
      captured_at: now,
    };
    const next: StoredAttribution = {
      first_touch: stored?.first_touch ?? touch,
      last_touch: touch,
      updated_at: now,
    };
    writeStoredAttribution(next);
    return payload;
  }

  return {
    ...(stored?.last_touch ?? {}),
    current_path: currentPath,
  };
}

export function readStoredTrackingAttributionPayload(currentPath?: string): TrackingAttributionPayload {
  const stored = readStoredAttribution();
  return {
    ...(stored?.last_touch ?? {}),
    ...(currentPath ? { current_path: currentPath } : {}),
  };
}

export function toAttemptAttributionPayload(payload: TrackingAttributionPayload): {
  referrer?: string;
  landing_path?: string;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    term?: string | null;
    content?: string | null;
  };
} {
  const utm = {
    source: payload.utm_source ?? null,
    medium: payload.utm_medium ?? null,
    campaign: payload.utm_campaign ?? null,
    term: payload.utm_term ?? null,
    content: payload.utm_content ?? null,
  };
  const hasUtm = Object.values(utm).some((value) => value !== null);

  return {
    ...(payload.referrer ? { referrer: payload.referrer } : {}),
    ...(payload.landing_path ? { landing_path: payload.landing_path } : {}),
    ...(hasUtm ? { utm } : {}),
  };
}
