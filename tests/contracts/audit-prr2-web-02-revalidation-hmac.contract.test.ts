import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticateContentReleaseRevalidation } from "@/lib/security/contentReleaseRevalidationAuth";

const NOW = 1_800_000_000;
const SECRET = "test-secret-with-sufficient-entropy";
const NONCE = "nonce_value_1234567890";
const BODY = JSON.stringify({ cache_signal: { paths: ["/en/articles"] } });

function request(body = BODY, timestamp = NOW, nonce = NONCE, signatureBody = body): Request {
  const signature = createHmac("sha256", SECRET)
    .update(`${timestamp}.${nonce}.${signatureBody}`)
    .digest("hex");
  return new Request("https://fermatmind.com/api/content-release/revalidate", {
    method: "POST",
    body,
    headers: {
      "x-fm-content-release-timestamp": String(timestamp),
      "x-fm-content-release-nonce": nonce,
      "x-fm-content-release-signature": `sha256=${signature}`,
    },
  });
}

function redisResults(...results: unknown[]) {
  const mock = vi.fn();
  for (const result of results) {
    mock.mockResolvedValueOnce(new Response(JSON.stringify({ result }), { status: 200 }));
  }
  vi.stubGlobal("fetch", mock);
}

describe("AUDIT-PRR2-WEB-02 revalidation HMAC boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.CONTENT_RELEASE_REVALIDATE_SECRET;
    delete process.env.CONTENT_RELEASE_REVALIDATE_REDIS_URL;
    delete process.env.CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN;
    delete process.env.CONTENT_RELEASE_REVALIDATE_RATE_LIMIT;
  });

  function configure() {
    process.env.CONTENT_RELEASE_REVALIDATE_SECRET = SECRET;
    process.env.CONTENT_RELEASE_REVALIDATE_REDIS_URL = "https://redis.example.test";
    process.env.CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN = "redis-token";
  }

  it("accepts an exact signed body once and consumes nonce plus rate budget", async () => {
    configure();
    redisResults("OK", 1, 1);

    await expect(authenticateContentReleaseRevalidation(request(), BODY, NOW)).resolves.toMatchObject({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("rejects stale and body-tampered requests before replay-store access", async () => {
    configure();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(authenticateContentReleaseRevalidation(request(BODY, NOW - 301), BODY, NOW)).resolves.toMatchObject({ ok: false, errorCode: "STALE_REQUEST" });
    await expect(authenticateContentReleaseRevalidation(request(BODY, NOW, NONCE, "different"), BODY, NOW)).resolves.toMatchObject({ ok: false, errorCode: "UNAUTHORIZED" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects reused nonces, excessive rate, and unavailable replay storage", async () => {
    configure();
    redisResults(null);
    await expect(authenticateContentReleaseRevalidation(request(), BODY, NOW)).resolves.toMatchObject({ ok: false, errorCode: "REPLAY_DETECTED" });

    process.env.CONTENT_RELEASE_REVALIDATE_RATE_LIMIT = "1";
    redisResults("OK", 2);
    await expect(authenticateContentReleaseRevalidation(request(), BODY, NOW)).resolves.toMatchObject({ ok: false, status: 429, errorCode: "RATE_LIMITED" });

    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    await expect(authenticateContentReleaseRevalidation(request(), BODY, NOW)).resolves.toMatchObject({ ok: false, status: 503, errorCode: "REPLAY_STORE_UNAVAILABLE" });
  });

  it("fails closed when secret or replay-store configuration is absent", async () => {
    await expect(authenticateContentReleaseRevalidation(request(), BODY, NOW)).resolves.toMatchObject({ ok: false, status: 401 });

    process.env.CONTENT_RELEASE_REVALIDATE_SECRET = SECRET;
    await expect(authenticateContentReleaseRevalidation(request(), BODY, NOW)).resolves.toMatchObject({ ok: false, status: 503 });
  });
});
