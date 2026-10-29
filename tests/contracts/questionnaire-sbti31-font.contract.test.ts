// @vitest-environment node
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import data from "@/lib/questionnaires/data/sbti-test.json";

it("renders all52 public images with the local font and no external asset request", async () => {
  const remote = vi.fn(async () => { throw Error("Synthetic external asset denial"); });
  const originalFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? originalFetch(input, init) : remote();
  });
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...data.profiles]) {
      const response = await GET(new Request(`https://fermatmind.com/og/fun/sbti-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: data.slug }) });
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
      const bytes = Buffer.from(await response.arrayBuffer());
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
      expect(bytes.length).toBeGreaterThan(10000);
    }
    expect(remote).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
}, 60000);
