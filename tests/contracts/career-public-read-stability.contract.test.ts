import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerRecommendationBundle } from "@/lib/career/api/fetchCareerRecommendationBundle";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const publicReaders = [
  ["career job bundle", () => fetchCareerJobBundle({ locale: "en", slug: "software-developer" })],
  ["career job index", () => fetchCareerJobIndex({ locale: "en" })],
  ["career family", () => fetchCareerFamilyHub({ locale: "en", slug: "technology" })],
  ["career recommendation index", () => fetchCareerRecommendationIndex({ locale: "en" })],
  ["career recommendation bundle", () => fetchCareerRecommendationBundle({ locale: "en", type: "intj-a" })],
] as const;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("career public read stability", () => {
  it.each(publicReaders)("preserves %s transient failures as typed retryable errors", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503)));

    await expect(load()).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "transient",
      retryable: true,
      authoritativeAbsence: false,
    });
  });

  it.each(publicReaders)("keeps %s authoritative absence as null", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "NOT_FOUND" }, 404)));

    await expect(load()).resolves.toBeNull();
  });

  it.each(publicReaders)("does not collapse %s validation failures into absence", async (_name, load) => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error_code: "VALIDATION_ERROR" }, 422)));

    await expect(load()).rejects.toMatchObject({
      name: "PublicReadError",
      kind: "contract",
      authoritativeAbsence: false,
    });
  });

  it("preserves SEO transient errors when the requested career job exists", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/career-jobs/software-developer/seo")) {
        return jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503);
      }

      return jsonResponse({ data: { identity: { canonical_slug: "software-developer" } } });
    }));

    await expect(fetchCareerJobBundle({
      locale: "en",
      slug: "software-developer",
      includeSeoAuthority: true,
    })).rejects.toMatchObject({ kind: "transient", retryable: true });
  });

  it("lets authoritative career job absence win when the optional SEO read also fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return url.includes("/career-jobs/missing-job/seo")
        ? jsonResponse({ error_code: "UPSTREAM_UNAVAILABLE" }, 503)
        : jsonResponse({ error_code: "NOT_FOUND" }, 404);
    }));

    await expect(fetchCareerJobBundle({
      locale: "en",
      slug: "missing-job",
      includeSeoAuthority: true,
    })).resolves.toBeNull();
  });
});

describe("career detail transport recovery", () => {
  const load = () => fetchCareerJobBundle({ locale: "en", slug: "software-developer" });
  const bundle = { bundle_version: "career.detail.page.v1" };

  function pendingUntilAbort(signal: AbortSignal): Promise<never> {
    return new Promise((_, reject) => {
      if (signal.aborted) reject(signal.reason);
      else signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
  }

  it.each(["headers", "body"] as const)("retries once when the first attempt stalls at %s", async (phase) => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>()
      .mockImplementationOnce(async (_input, init) => {
        const pending = () => pendingUntilAbort(init!.signal!);
        if (phase === "headers") return pending();
        const response = jsonResponse(bundle);
        vi.spyOn(response, "json").mockImplementation(pending);
        return response;
      })
      .mockResolvedValueOnce(jsonResponse(bundle));
    vi.stubGlobal("fetch", fetcher);

    const verified = expect(load()).resolves.toEqual(bundle);
    await vi.advanceTimersByTimeAsync(12_000);
    await verified;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("retries a connection reset once", async () => {
    const cause = Object.assign(new Error("Connection reset"), { code: "ECONNRESET" });
    const fetcher = vi.fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("fetch failed", { cause }))
      .mockResolvedValueOnce(jsonResponse(bundle));
    vi.stubGlobal("fetch", fetcher);

    await expect(load()).resolves.toEqual(bundle);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("stops after two timed-out attempts", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>((_input, init) => pendingUntilAbort(init!.signal!));
    vi.stubGlobal("fetch", fetcher);

    const verified = expect(load()).rejects.toMatchObject({ errorCode: "REQUEST_TIMEOUT" });
    await vi.advanceTimersByTimeAsync(24_000);
    await verified;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([404, 408, 429])("preserves HTTP %s with only one request", async (status) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ error_code: "REQUEST_TIMEOUT" }, status));
    vi.stubGlobal("fetch", fetcher);

    if (status === 404) await expect(load()).resolves.toBeNull();
    else await expect(load()).rejects.toMatchObject({ status });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("surfaces invalid JSON as a contract failure without retry", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("invalid JSON"));
    vi.stubGlobal("fetch", fetcher);

    await expect(load()).rejects.toThrow("CAREER_PAGE_CONTRACT_INVALID");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not retry caller cancellation", async () => {
    const fetcher = vi.fn<typeof fetch>((_input, init) => pendingUntilAbort(init!.signal!));
    vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController();
    const read = apiClient.getPublic("/career", {
      signal: controller.signal,
      includeResponseBodyInTimeout: true,
      retryTransportOnce: true,
    });
    controller.abort();

    await expect(read).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not extend the header timeout to the body for other callers", async () => {
    vi.useFakeTimers();
    const response = jsonResponse(bundle);
    vi.spyOn(response, "json").mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(bundle), 13_000))
    );
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetcher);

    const verified = expect(apiClient.getPublic("/other", { timeoutMs: 12_000 })).resolves.toEqual(bundle);
    await vi.advanceTimersByTimeAsync(13_000);
    await verified;
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
