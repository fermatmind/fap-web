import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import {
  filterTrackingPayload,
  isCareerAttributionEvent,
  isSeoConversionFunnelEvent,
  isTrackingEvent,
  normalizeTrackingEventName,
  type TrackingEventName,
} from "@/lib/tracking/events";
import { buildPublicTrackingServerLabels } from "@/lib/tracking/attribution";
import { sanitizeAnalyticsTrackingUrl, shouldSuppressAnalyticsForUrl } from "@/lib/tracking/privacy";
import { resolveApiOrigin } from "@/lib/api-base";

import { resolveTrackingRuntime } from "@/lib/tracking/serverRuntime";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;
const ACCESS_STATS_RULE_VERSION = "access_test_statistics.v1";

export function HEAD() {
  try {
    const runtime = resolveTrackingRuntime();
    return new NextResponse(null, { status: 200, headers: {
      "Cache-Control": "no-store",
      "X-FermatMind-Tracking-Configured": runtime.token ? "1" : "0",
      "X-FermatMind-Tracking-Revision": runtime.revision ?? "unmanaged",
    } });
  } catch { return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}

export function GET() {
  return NextResponse.json({ ok: true });
}

function safeText(input: unknown, fallback = ""): string {
  if (typeof input !== "string") return fallback;
  return input.slice(0, 256);
}

function localeFromPath(path: string): "en" | "zh" {
  return path.startsWith("/zh") ? "zh" : "en";
}

function uniqueTargets(targets: Array<string | undefined>): string[] {
  return Array.from(new Set(targets.filter((value): value is string => Boolean(value))));
}

function normalizeIp(value: string): string | undefined {
  let candidate = value.trim().replace(/^\[|\]$/g, "").toLowerCase();
  if (candidate.startsWith("::ffff:") && isIP(candidate.slice(7)) === 4) {
    candidate = candidate.slice(7);
  }
  if (isIP(candidate) === 4) return candidate;
  if (isIP(candidate) !== 6) return undefined;

  try {
    return new URL(`http://[${candidate}]/`).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
    return undefined;
  }
}

function shanghaiDay(timestamp: string): string {
  const parsed = new Date(timestamp);
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function buildAccessStatsIdentityHeaders(
  request: NextRequest,
  timestamp: string,
  token: string | undefined,
  environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV
): Record<string, string> {
  if (!token || environment !== "production") return {};

  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "";
  const candidates = forwarded.split(",").map((value) => normalizeIp(value)).filter((value): value is string => Boolean(value));
  const clientIp = candidates.at(-1);
  if (!clientIp) return {};

  const day = shanghaiDay(timestamp);
  const digest = createHmac("sha256", token)
    .update(`${ACCESS_STATS_RULE_VERSION}|${clientIp}`)
    .digest("hex");

  return {
    "X-FermatMind-IP-Day": day,
    "X-FermatMind-IP-Day-Hash": digest,
  };
}

function resolveNativeIngestOrigin(request: NextRequest, runtimeOrigin?: string): string | undefined {
  const origin = runtimeOrigin || resolveApiOrigin();
  if (!["https://api.fermatmind.com", "https://staging-api.fermatmind.com"].includes(origin)) return undefined;
  let host = new URL(request.url).hostname;
  const hostHeader = request.headers.get("host");
  if (hostHeader) {
    // Standalone Next.js builds request.url from its internal listener. The
    // canonical ingress supplies Host; forwarded-host is not an authority.
    if (!/^[A-Za-z0-9.:[\]-]+$/.test(hostHeader)) return undefined;
    let authority;
    try { authority = new URL(`http://${hostHeader}`); } catch { return undefined; }
    if (authority.username || authority.password || authority.pathname !== "/" || authority.search || authority.hash) return undefined;
    const internalListener = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0", "[::]"].includes(host);
    if (!internalListener && host !== authority.hostname) return undefined;
    host = authority.hostname;
  }
  if (["fermatmind.com", "www.fermatmind.com"].includes(host) && origin !== "https://api.fermatmind.com") return undefined;
  if (host === "staging.fermatmind.com" && origin !== "https://staging-api.fermatmind.com") return undefined;
  if (!["fermatmind.com", "www.fermatmind.com", "staging.fermatmind.com", "localhost", "127.0.0.1", "[::1]"].includes(host)) return undefined;
  return origin;
}

function isNativeIngestTarget(target: string, origin: string): boolean {
  try {
    const url = new URL(target);
    return url.origin === origin && !url.username && !url.password && !url.search && !url.hash
      && ["/api/v0.5/seo/attribution/events", "/api/v0.3/analytics/mbti-attribution-events", "/api/v0.5/career/attribution/events"].includes(url.pathname);
  } catch { return false; }
}

// The native SEO ingest is strict. Request identity travels in X-Request-Id;
// browser-only CTA detail must not broaden the backend event schema.
const SEO_ATTRIBUTION_INGEST_FIELDS = [
  "entry_surface",
  "source_page_type",
  "target_action",
  "slug",
  "test_slug",
  "scaleCode",
  "scale_code",
  "form_code",
  "landing_path",
  "current_path",
  "locale",
  "attempt_id",
  "attemptIdMasked",
  "target_attempt_id",
  "answered_count",
  "durationMs",
  "duration_ms",
  "duration_bucket",
  "order_no",
  "orderNo",
  "orderNoMasked",
  "order_id",
  "transaction_id",
  "amount",
  "value",
  "price",
  "currency",
  "provider",
  "pack_version",
  "manifest_hash",
  "norms_version",
  "quality_level",
  "locked",
  "variant",
  "sku_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "msclkid",
  "fbclid",
  "referrer",
  "session_id",
  "url",
  "lang",
  "page_type",
  "source_url",
  "source_article",
  "target_test",
  "scale_id",
  "form_id",
  "stage",
  "stage_detail",
  "status_group",
  "status_code",
  "error_code",
  "error_class",
  "request_id",
  "route",
  "device_class",
  "browser_class",
  "endpoint_class",
  "retry_bucket",
  "source_engine",
  "consent_state",
  "is_internal",
  "is_qa",
  "is_bot",
  "environment",
  "traffic_quality",
] as const;

export function toSeoAttributionIngestEnvelope(event: {
  eventName: string;
  anonymousId: string;
  path: string;
  timestamp: string;
  payload: Record<string, unknown>;
}) {
  return {
    eventName: event.eventName,
    anonymousId: event.anonymousId,
    path: event.path.split("?")[0] ?? "",
    timestamp: event.timestamp,
    payload: Object.fromEntries(SEO_ATTRIBUTION_INGEST_FIELDS
      .filter((key) => event.payload[key] !== undefined)
      .map((key) => [key, event.payload[key]])),
  };
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const eventName = safeText((body as { eventName?: unknown }).eventName);
  if (!isTrackingEvent(eventName)) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }
  const normalizedEventName = normalizeTrackingEventName(eventName as TrackingEventName);

  const payloadSource = (body as { payload?: unknown }).payload;
  const payload =
    payloadSource && typeof payloadSource === "object" && !Array.isArray(payloadSource)
      ? filterTrackingPayload(normalizedEventName, payloadSource as Record<string, unknown>)
      : {};

  const requestId = crypto.randomUUID();
  const anonymousId = safeText((body as { anonymousId?: unknown }).anonymousId);
  const rawPath = safeText((body as { path?: unknown }).path);
  if (shouldSuppressAnalyticsForUrl(rawPath)) {
    return NextResponse.json({ ok: true, requestId, forwarded: 0, suppressed: true });
  }

  const path = sanitizeAnalyticsTrackingUrl(rawPath) ?? "";
  const timestamp = safeText((body as { timestamp?: unknown }).timestamp, new Date().toISOString());
  const locale = localeFromPath(path);
  const payloadWithLocale = {
    ...payload,
    locale: payload.locale ?? locale,
    landing_path: payload.landing_path ?? path,
  };
  const payloadReferrer = payload.referrer;
  const trustedLabels = buildPublicTrackingServerLabels({
    payload: payloadWithLocale,
    path,
    referrer: typeof payloadReferrer === "string" ? payloadReferrer : request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });

  const event = {
    requestId,
    eventName: normalizedEventName,
    anonymousId,
    path,
    timestamp,
    payload: {
      ...payloadWithLocale,
      ...trustedLabels,
    },
  };

  let runtime;
  try { runtime = resolveTrackingRuntime(); } catch {
    return NextResponse.json({ ok: false, requestId, error: "invalid_ingest_runtime" }, { status: 502 });
  }
  const token = runtime.token;
  const nativeOrigin = token ? resolveNativeIngestOrigin(request, runtime.origin) : undefined;
  if (token && !nativeOrigin) {
    return NextResponse.json({ ok: false, requestId, error: "invalid_ingest_target" }, { status: 502 });
  }
  const identityHeaders = buildAccessStatsIdentityHeaders(request, timestamp, token);
  const seoAttributionTarget = isSeoConversionFunnelEvent(normalizedEventName)
    ? (nativeOrigin ? `${nativeOrigin}/api/v0.5/seo/attribution/events` : undefined)
    : undefined;
  const targets = uniqueTargets(
    isCareerAttributionEvent(normalizedEventName)
      ? [seoAttributionTarget, process.env.CAREER_ATTRIBUTION_INGEST_ENDPOINT ?? process.env.ANALYTICS_ENDPOINT]
      : [
          seoAttributionTarget,
          process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT,
          process.env.ANALYTICS_ENDPOINT,
          process.env.EDM_ENDPOINT,
        ]
  );

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, requestId, forwarded: 0 });
  }

  // Reject the entire fan-out before sending any credential or digest.
  if (token && targets.some((url) => !isNativeIngestTarget(url, nativeOrigin!))) {
    return NextResponse.json({ ok: false, requestId, error: "invalid_ingest_target" }, { status: 502 });
  }

  const responses = await Promise.all(
    targets.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          ...(token ? { redirect: "error" as const } : {}),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Request-Id": requestId,
            ...identityHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(url === seoAttributionTarget ? toSeoAttributionIngestEnvelope(event) : event),
        });

        return response.ok;
      } catch {
        return false;
      }
    })
  );

  if (responses.some((ok) => !ok)) {
    return NextResponse.json({ ok: false, requestId, error: "forward_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, requestId, forwarded: targets.length });
}
