// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { Questionnaire } from "@/lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/capacity-to-love-test.json", "utf8")) as Questionnaire;

  it("renders all fourteen public images from local fonts without a remote fallback request", async () => {
    const remote = vi.fn(async () => { throw new Error("Synthetic denial: public images must use their local font"); });
    const localFetch = globalThis.fetch;
    // Next initializes embedded WASM through a local data URL. Only that local
    // initialization is allowed; every external asset request is denied and counted.
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      return url.startsWith("data:application/octet-stream;base64,") ? localFetch(input, init) : remote();
    });
    try {
      for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
        const response = await GET(new Request(`https://fermatmind.com/og/fun/capacity-to-love-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
        expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("image/png");
        const bytes = new Uint8Array(await response.arrayBuffer()); expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]); expect(bytes.byteLength).toBeGreaterThan(10000); expect(Buffer.from(bytes).readUInt32BE(16)).toBe(1200); expect(Buffer.from(bytes).readUInt32BE(20)).toBe(630);
      }
      expect(remote).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  }, 30000);
