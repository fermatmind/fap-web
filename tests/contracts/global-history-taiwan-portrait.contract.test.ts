// @vitest-environment node
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import { GLOBAL_HISTORY_SLUG, globalHistoryImagePath } from "@/lib/entertainment/global-history/config";

it("renders a Taiwan PNG from the local public portrait and font", async () => {
  const originalFetch = globalThis.fetch;
  const remote = vi.fn(async () => { throw new Error("Unexpected remote image dependency"); });
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? originalFetch(input, init) : remote();
  });
  try {
    const options = { params: Promise.resolve({ slug: GLOBAL_HISTORY_SLUG }) };
    const image = (id: string) => new Request(`https://fermatmind.com${globalHistoryImagePath("zh-TW", id)}&download=1`);
    expect((await GET(image("unknown"), options)).status).toBe(404);
    const response = await GET(image("mansa-musa"), options);
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(response.headers.get("Content-Disposition")).toContain("fermatmind-history-mansa-musa-zh-TW.png");
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([840, 1200]);
    expect(remote).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
}, 30000);
