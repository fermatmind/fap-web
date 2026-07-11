import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type RevalidationAuthResult =
  | { ok: true; nonceHash: string }
  | { ok: false; status: 401 | 429 | 503; errorCode: string; message: string };

type RedisCommandResult = { result?: unknown };

const DEFAULT_TOLERANCE_SECONDS = 300;
const DEFAULT_RATE_LIMIT = 60;

function secureEquals(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(actual, "utf8");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function integerEnv(name: string, fallback: number): number {
  const value = Number.parseInt(String(process.env[name] ?? ""), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function redisCommand(command: string[]): Promise<RedisCommandResult> {
  const url = String(process.env.CONTENT_RELEASE_REVALIDATE_REDIS_URL ?? "").replace(/\/$/, "");
  const token = String(process.env.CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN ?? "").trim();
  if (!url || !token) {
    throw new Error("revalidation replay store is not configured");
  }

  const response = await fetch(`${url}/${command.map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`revalidation replay store returned ${response.status}`);
  }
  return (await response.json()) as RedisCommandResult;
}

export async function authenticateContentReleaseRevalidation(
  request: Request,
  rawBody: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<RevalidationAuthResult> {
  const secret = String(process.env.CONTENT_RELEASE_REVALIDATE_SECRET ?? "").trim();
  const timestampRaw = request.headers.get("x-fm-content-release-timestamp")?.trim() ?? "";
  const nonce = request.headers.get("x-fm-content-release-nonce")?.trim() ?? "";
  const signature = request.headers.get("x-fm-content-release-signature")?.trim() ?? "";
  const timestamp = Number.parseInt(timestampRaw, 10);
  const tolerance = integerEnv("CONTENT_RELEASE_REVALIDATE_TOLERANCE_SECONDS", DEFAULT_TOLERANCE_SECONDS);

  if (!secret || !/^\d{10}$/.test(timestampRaw) || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce) || !Number.isSafeInteger(timestamp)) {
    return { ok: false, status: 401, errorCode: "UNAUTHORIZED", message: "invalid revalidation credentials" };
  }
  if (Math.abs(nowSeconds - timestamp) > tolerance) {
    return { ok: false, status: 401, errorCode: "STALE_REQUEST", message: "revalidation request is outside tolerance" };
  }

  const expected = `sha256=${createHmac("sha256", secret).update(`${timestampRaw}.${nonce}.${rawBody}`).digest("hex")}`;
  if (!secureEquals(expected, signature)) {
    return { ok: false, status: 401, errorCode: "UNAUTHORIZED", message: "invalid revalidation signature" };
  }

  const nonceHash = createHash("sha256").update(nonce).digest("hex");
  const window = Math.floor(timestamp / tolerance);
  try {
    const nonceResult = await redisCommand(["SET", `fap:revalidate:nonce:${nonceHash}`, "1", "NX", "EX", String(tolerance * 2)]);
    if (nonceResult.result !== "OK") {
      return { ok: false, status: 401, errorCode: "REPLAY_DETECTED", message: "revalidation request was already used" };
    }

    const rateKey = `fap:revalidate:rate:${window}`;
    const rateResult = await redisCommand(["INCR", rateKey]);
    const count = Number(rateResult.result ?? 0);
    if (count === 1) {
      await redisCommand(["EXPIRE", rateKey, String(tolerance * 2)]);
    }
    if (!Number.isFinite(count) || count > integerEnv("CONTENT_RELEASE_REVALIDATE_RATE_LIMIT", DEFAULT_RATE_LIMIT)) {
      return { ok: false, status: 429, errorCode: "RATE_LIMITED", message: "revalidation rate limit exceeded" };
    }
  } catch {
    return { ok: false, status: 503, errorCode: "REPLAY_STORE_UNAVAILABLE", message: "revalidation replay protection unavailable" };
  }

  return { ok: true, nonceHash };
}
