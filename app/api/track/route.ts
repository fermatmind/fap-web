import { NextResponse, type NextRequest } from "next/server";
import {
  filterTrackingPayload,
  isTrackingEvent,
  type TrackingEventName,
} from "@/lib/tracking/events";

const MAX_BODY_BYTES = 8 * 1024;

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

  const payloadSource = (body as { payload?: unknown }).payload;
  const payload =
    payloadSource && typeof payloadSource === "object" && !Array.isArray(payloadSource)
      ? filterTrackingPayload(eventName as TrackingEventName, payloadSource as Record<string, unknown>)
      : {};

  const requestId = crypto.randomUUID();
  const anonymousId = safeText((body as { anonymousId?: unknown }).anonymousId);
  const path = safeText((body as { path?: unknown }).path);
  const timestamp = safeText((body as { timestamp?: unknown }).timestamp, new Date().toISOString());
  const locale = localeFromPath(path);
  const payloadWithLocale = {
    ...payload,
    locale: payload.locale ?? locale,
  };

  const event = {
    requestId,
    eventName,
    anonymousId,
    path,
    timestamp,
    payload: payloadWithLocale,
  };

  const token = process.env.TRACK_INGEST_TOKEN;
  const targets = [process.env.ANALYTICS_ENDPOINT, process.env.EDM_ENDPOINT].filter(
    (value): value is string => Boolean(value)
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
