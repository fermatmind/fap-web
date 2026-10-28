import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCareerInterestComparisonRole } from "@/lib/career/api/fetchCareerInterestComparisonRole";
import { careerMatchRoleFixture } from "@/tests/fixtures/questionnaires/careerMatch";
afterEach(() => vi.unstubAllGlobals());

describe("Career Match browser transport on the unchanged public CORS policy", () => {
  it.each(["en", "zh"] as const)("%s: reads Current without SSR-only preflight headers or auth", async locale => {
    const body = careerMatchRoleFixture(locale);
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchCareerInterestComparisonRole({ locale, slug: "contract-role-a" })).toEqual(body);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const parsed = new URL(url, "https://fermatmind.com");
    expect(parsed.pathname).toBe("/api/v0.5/career/jobs/contract-role-a");
    expect([...parsed.searchParams.keys()].sort()).toEqual(["locale", "projection_contract"]);
    expect(parsed.searchParams.get("locale")).toBe(locale === "zh" ? "zh-CN" : "en");
    expect(parsed.searchParams.get("projection_contract")).toBe("career.detail.page.v1");
    expect(init.cache).toBe("no-store"); expect(init.body).toBeUndefined(); expect(init.method).toBe("GET");
    const headers = new Headers(init.headers);
    expect([...headers.keys()].sort()).toEqual(["accept", "content-type", "x-fap-locale"]);
    expect(headers.get("X-FAP-Locale")).toBe(locale === "zh" ? "zh-CN" : "en");
    expect(headers.get("Cache-Control")).toBeNull(); expect(headers.get("Pragma")).toBeNull(); expect(headers.get("Authorization")).toBeNull();
  });
  it("keeps missing, transport and invalid identity separate without an independent SEO or fallback read", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 404 })).mockResolvedValueOnce(new Response("{}", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchCareerInterestComparisonRole({ locale: "en", slug: "../private" })).toBeNull(); expect(fetchMock).not.toHaveBeenCalled();
    expect(await fetchCareerInterestComparisonRole({ locale: "en", slug: "contract-role-a" })).toBeNull();
    await expect(fetchCareerInterestComparisonRole({ locale: "en", slug: "contract-role-b" })).rejects.toMatchObject({ kind: "transient" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
