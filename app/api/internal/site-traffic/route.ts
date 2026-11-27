import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { readTodaySiteTraffic } from "@/lib/tracking/siteTrafficSnapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const token = process.env.TRACK_INGEST_TOKEN?.trim();
  const timestamp = request.headers.get("x-fm-site-traffic-time") ?? "";
  const signature = request.headers.get("x-fm-site-traffic-signature") ?? "";
  if (!token || !/^\d{10}$/.test(timestamp) || !/^[a-f\d]{64}$/.test(signature)
    || Math.abs(Date.now() - Number(timestamp) * 1000) > 60_000) {
    return NextResponse.json({ ok: false }, { status: 404, headers: noStore });
  }

  const expected = createHmac("sha256", token).update(`fermatmind.site-traffic.v1:${timestamp}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) {
    return NextResponse.json({ ok: false }, { status: 404, headers: noStore });
  }

  try {
    const snapshot = await readTodaySiteTraffic();
    return NextResponse.json(snapshot, { headers: noStore });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: noStore });
  }
}
