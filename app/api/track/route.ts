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

const MAX_BODY_BYTES = 8 * 1024;
const ACCESS_STATS_RULE_VERSION = "access_test_statistics.v1";

export function HEAD() {
  return new NextResponse(null, { status: 200 });
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

function resolveSeoAttributionIngestEndpoint(token?: string): string | undefined {
  return token ? `${resolveApiOrigin()}/api/v0.5/seo/attribution/events` : undefined;
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

  const token = process.env.TRACK_INGEST_TOKEN;
  const identityHeaders = buildAccessStatsIdentityHeaders(request, timestamp, token);
  const seoAttributionTarget = isSeoConversionFunnelEvent(normalizedEventName)
    ? resolveSeoAttributionIngestEndpoint(token)
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

  const responses = await Promise.all(
    targets.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Request-Id": requestId,
            ...identityHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(event),
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
