// @vitest-environment node

import { createHmac } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { isPublicPageRequest, readSiteTraffic } from "@/lib/tracking/siteTrafficSnapshot";
import * as trackingRuntime from "@/lib/tracking/serverRuntime";
import * as siteTraffic from "@/lib/tracking/siteTrafficSnapshot";
import { GET } from "@/app/api/internal/site-traffic/route";

const agent = "Mozilla/5.0 Chrome/130.0";
const now = Date.parse("2026-11-27T01:00:00+08:00");

function log(time: string, path: string, ip = "192.0.2.1", status = 200) {
  return `${ip} - - [26/Nov/2026:${time} +0000] "GET ${path} HTTP/2.0" ${status} 100 "-" "${agent}" "-"\n`;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it("counts real ingress requests and deduplicates the remote address across a Beijing-day rotation", async () => {
  const dir = await mkdtemp(join(tmpdir(), "site-traffic-test-"));
  const file = join(dir, "access.log");
  try {
    await writeFile(file, log("16:20:00", "/zh/tests/example/take", "192.0.2.1", 304)
      + log("16:30:00", "/en") + log("16:45:00", "/zh", "192.0.2.2", 503)
      + log("16:49:00", "/zh", "192.0.2.2") + log("17:30:00", "/zh", "192.0.2.3"));
    await writeFile(file + ".1", log("15:59:59", "/zh", "192.0.2.4") + log("16:10:00", "/zh"));
    await expect(readSiteTraffic(file, now)).resolves.toEqual({
      date: "2026-11-27", through: now / 1000, pageRequests: 4, uniqueIps: 2,
    });
    await rm(file + ".1");
    await expect(readSiteTraffic(file, now)).rejects.toThrow();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

it("excludes private routes, known automated agents, resources and Next.js prefetch requests", () => {
  expect(isPublicPageRequest("/zh-TW/tests/example/take", agent)).toBe(true);
  for (const path of ["/zh/tests/example?_rsc=abc", "/zh/results/123", "/zh/foo%2fbar", "/en/icon.png", "/healthz", "/api/foo"]) {
    expect(isPublicPageRequest(path, agent)).toBe(false);
  }
  expect(isPublicPageRequest("/zh/tests/example", agent + " HeadlessChrome")).toBe(false);
});

it("rejects unsigned, expired and unrelated signatures before touching logs", async () => {
  const endpoint = "https://fermatmind.com/api/internal/site-traffic";
  vi.stubEnv("TRACK_INGEST_TOKEN", "site-traffic-test-secret");
  const timestamp = Math.floor(Date.now() / 1000) - 900;
  const signed = createHmac("sha256", "site-traffic-test-secret")
    .update(`fermatmind.site-traffic.v1:${timestamp}`).digest("hex");
  for (const headers of [
    {},
    { "x-fm-site-traffic-time": String(timestamp), "x-fm-site-traffic-signature": signed },
    { "x-fm-site-traffic-time": String(timestamp + 900), "x-fm-site-traffic-signature": signed },
  ]) {
    const response = await GET(new Request(endpoint, { headers: Object.entries(headers).filter((entry): entry is [string, string] => typeof entry[1] === "string") }));
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  }
});

it("uses the release-bound tracking credential and returns only the day's aggregate", async () => {
  const endpoint = "https://fermatmind.com/api/internal/site-traffic";
  const token = "test-release-tracking-secret";
  const timestamp = Math.floor(Date.now() / 1000);
  const snapshot = { date: "2026-11-27", through: timestamp, pageRequests: 125, uniqueIps: 100 };
  vi.stubEnv("TRACK_INGEST_TOKEN", "old-environment-only-secret");
  vi.spyOn(trackingRuntime, "resolveTrackingRuntime").mockReturnValue({ token });
  vi.spyOn(siteTraffic, "readTodaySiteTraffic").mockResolvedValue(snapshot);
  const signed = createHmac("sha256", token).update(`fermatmind.site-traffic.v1:${timestamp}`).digest("hex");
  const response = await GET(new Request(endpoint, { headers: {
    "x-fm-site-traffic-time": String(timestamp),
    "x-fm-site-traffic-signature": signed,
  } }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(snapshot);
});
