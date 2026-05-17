import { sanitizeTrackingUrl } from "@/lib/tracking/privacy";

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

export const SEARCH_INTELLIGENCE_TRACKING_FIELDS = [
  "source_engine",
  "consent_state",
  "is_internal",
  "is_qa",
  "is_bot",
  "environment",
  "traffic_quality",
] as const;

export const SEARCH_INTELLIGENCE_SOURCE_ENGINE_VALUES = [
  "google",
  "baidu",
  "bing_indexnow",
  "llms",
  "direct",
  "paid_google",
  "paid_baidu",
  "unknown",
] as const;

export const SEARCH_INTELLIGENCE_RESERVED_SOURCE_ENGINE_VALUES = [
  "so360",
  "sogou",
  "shenma",
  "quark",
  "ai_search",
] as const;

export const SEARCH_INTELLIGENCE_CONSENT_STATE_VALUES = [
  "granted",
  "denied",
  "unknown",
  "not_applicable",
] as const;

export const SEARCH_INTELLIGENCE_TRAFFIC_QUALITY_VALUES = [
  "production_user",
  "qa",
  "internal",
  "bot",
  "unknown",
] as const;

export type AttributionQueryKey = (typeof ATTRIBUTION_QUERY_KEYS)[number];
export type AttributionParams = Partial<Record<AttributionQueryKey, string>>;
export type TrackingAttributionPayload = Partial<
  Record<(typeof TRACKING_ATTRIBUTION_FIELDS)[number], string>
>;
export type SearchIntelligenceTrackingField = (typeof SEARCH_INTELLIGENCE_TRACKING_FIELDS)[number];
export type SearchIntelligenceSourceEngine = (typeof SEARCH_INTELLIGENCE_SOURCE_ENGINE_VALUES)[number];
export type SearchIntelligenceConsentState = (typeof SEARCH_INTELLIGENCE_CONSENT_STATE_VALUES)[number];
export type SearchIntelligenceTrafficQuality = (typeof SEARCH_INTELLIGENCE_TRAFFIC_QUALITY_VALUES)[number];
export type SearchIntelligenceTrackingPayload = {
  source_engine: SearchIntelligenceSourceEngine;
  consent_state: SearchIntelligenceConsentState;
  is_internal: boolean;
  is_qa: boolean;
  is_bot: boolean;
  environment: string;
  traffic_quality: SearchIntelligenceTrafficQuality;
};

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

function normalizeToken(value: unknown): string {
  return normalizeText(value)?.toLowerCase() ?? "";
}

function containsAnyToken(value: string, tokens: readonly string[]): boolean {
  return tokens.some((token) => value.includes(token));
}

function referrerHost(referrer: unknown): string {
  const normalized = normalizeText(referrer, 2048);
  if (!normalized) return "";

  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return normalized.toLowerCase();
  }
}

function normalizeEnvironment(value: unknown): string {
  const normalized = normalizeToken(value);
  if (normalized === "production" || normalized === "development" || normalized === "test") {
    return normalized;
  }
  if (normalized === "staging" || normalized === "preview") return normalized;
  return normalized || "unknown";
}

function pathSearchParam(path: string, key: string): string {
  if (!path) return "";

  try {
    return new URL(path, "https://fermatmind.local").searchParams.get(key)?.trim().toLowerCase() ?? "";
  } catch {
    return "";
  }
}

function firstRecordValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return normalizeText(value[0]);
  return normalizeText(value);
}

export function deriveSearchIntelligenceSourceEngine(
  payload: Record<string, unknown>
): SearchIntelligenceSourceEngine {
  const referrer = referrerHost(payload.referrer);
  const landingPath = normalizeToken(payload.landing_path);
  const currentPath = normalizeToken(payload.current_path);
  const utmSource = normalizeToken(payload.utm_source) || pathSearchParam(currentPath, "utm_source") || pathSearchParam(landingPath, "utm_source");
  const utmMedium = normalizeToken(payload.utm_medium) || pathSearchParam(currentPath, "utm_medium") || pathSearchParam(landingPath, "utm_medium");
  const utmCampaign = normalizeToken(payload.utm_campaign) || pathSearchParam(currentPath, "utm_campaign") || pathSearchParam(landingPath, "utm_campaign");
  const utmContent = normalizeToken(payload.utm_content) || pathSearchParam(currentPath, "utm_content") || pathSearchParam(landingPath, "utm_content");
  const hasGclid = Boolean(
    normalizeToken(payload.gclid) || pathSearchParam(currentPath, "gclid") || pathSearchParam(landingPath, "gclid")
  );
  const hasBaiduPaidId = Boolean(pathSearchParam(currentPath, "bd_vid") || pathSearchParam(landingPath, "bd_vid"));
  const combinedUtm = [utmSource, utmMedium, utmCampaign, utmContent].filter(Boolean).join(" ");
  const combinedPath = [landingPath, currentPath].filter(Boolean).join(" ");
  const paidTokens = ["cpc", "ppc", "paid", "sem", "ads", "adwords", "tuiguang"];

  if (hasGclid) return "paid_google";
  if (containsAnyToken(utmSource, ["google"]) && containsAnyToken(combinedUtm, paidTokens)) {
    return "paid_google";
  }
  if (hasBaiduPaidId || (containsAnyToken(combinedUtm, ["baidu"]) && containsAnyToken(combinedUtm, paidTokens))) {
    return "paid_baidu";
  }
  if (containsAnyToken(utmSource, ["google"]) || referrer.includes("google.")) return "google";
  if (containsAnyToken(utmSource, ["baidu"]) || referrer.includes("baidu.")) return "baidu";
  if (containsAnyToken(utmSource, ["bing"]) || referrer.includes("bing.")) return "bing_indexnow";
  if (containsAnyToken(combinedUtm, ["llms"]) || combinedPath.includes("llms")) return "llms";
  if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !referrer) return "direct";

  return "unknown";
}

export function deriveSearchIntelligenceTrafficLabels({
  payload,
  userAgent,
  environment,
}: {
  payload: Record<string, unknown>;
  userAgent?: string | null;
  environment?: string | null;
}): Pick<SearchIntelligenceTrackingPayload, "is_internal" | "is_qa" | "is_bot" | "environment" | "traffic_quality"> {
  const normalizedEnvironment = normalizeEnvironment(environment);
  const campaignContext = [
    payload.utm_source,
    payload.utm_medium,
    payload.utm_campaign,
    payload.utm_content,
    payload.entry_surface,
    payload.cta_id,
  ]
    .map((value) => normalizeToken(value))
    .filter(Boolean)
    .join(" ");
  const normalizedUserAgent = normalizeToken(userAgent);
  const isQa = containsAnyToken(campaignContext, ["codex_qa", "codex-qa", "controlled_pilot", "controlled-pilot", "acceptance"]);
  const isBot = containsAnyToken(normalizedUserAgent, [
    "bot",
    "spider",
    "crawler",
    "googlebot",
    "bingbot",
    "baiduspider",
    "bytespider",
  ]);
  const isInternal = normalizedEnvironment !== "production" && normalizedEnvironment !== "unknown";
  const trafficQuality: SearchIntelligenceTrafficQuality = isBot
    ? "bot"
    : isQa
      ? "qa"
      : isInternal
        ? "internal"
        : normalizedEnvironment === "production"
          ? "production_user"
          : "unknown";

  return {
    is_internal: isInternal,
    is_qa: isQa,
    is_bot: isBot,
    environment: normalizedEnvironment,
    traffic_quality: trafficQuality,
  };
}

export function buildSearchIntelligenceTrackingPayload({
  payload,
  referrer,
  currentPath,
  userAgent,
  environment,
  consentState,
}: {
  payload: Record<string, unknown>;
  referrer?: string | null;
  currentPath?: string | null;
  userAgent?: string | null;
  environment?: string | null;
  consentState?: SearchIntelligenceConsentState;
}): SearchIntelligenceTrackingPayload {
  const attributionPayload = {
    ...payload,
    ...(referrer ? { referrer } : {}),
    ...(currentPath ? { current_path: currentPath } : {}),
  };

  return {
    source_engine: deriveSearchIntelligenceSourceEngine(attributionPayload),
    consent_state: consentState ?? "unknown",
    ...deriveSearchIntelligenceTrafficLabels({
      payload: attributionPayload,
      userAgent,
      environment,
    }),
  };
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

  const referrer = sanitizeTrackingUrl(extra.referrer);
  const landingPath = sanitizeTrackingUrl(extra.landingPath);
  const currentPath = sanitizeTrackingUrl(extra.currentPath);
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
  const stored = readStoredAttribution();
  const storedTouch = stored?.last_touch ?? stored?.first_touch;
  const effectiveParams = hasAttributionParams(params)
    ? params
    : extractAttributionParamsFromRecord(storedTouch ?? {});
  const payload = buildTrackingAttributionPayload(params, {
    referrer,
    landingPath: hasAttributionParams(params) ? currentPath : storedTouch?.landing_path ?? currentPath,
    currentPath,
  });
  const hasTouch = Object.keys(payload).some((key) => key !== "current_path");
  const effectivePayload = hasAttributionParams(params) ? payload : {
    ...payload,
    ...buildTrackingAttributionPayload(effectiveParams, {
      referrer,
      landingPath: storedTouch?.landing_path ?? currentPath,
      currentPath,
    }),
  };

  if (hasTouch) {
    const now = new Date().toISOString();
    const touch: StoredTouch = {
      ...effectivePayload,
      captured_at: now,
    };
    const next: StoredAttribution = {
      first_touch: stored?.first_touch ?? touch,
      last_touch: touch,
      updated_at: now,
    };
    writeStoredAttribution(next);
    return effectivePayload;
  }

  return {
    ...(stored?.last_touch ?? {}),
    current_path: currentPath,
  };
}

export function readStoredTrackingAttributionPayload(currentPath?: string): TrackingAttributionPayload {
  const stored = readStoredAttribution();
  const safeCurrentPath = sanitizeTrackingUrl(currentPath);
  return {
    ...(stored?.last_touch ?? {}),
    ...(safeCurrentPath ? { current_path: safeCurrentPath } : {}),
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
