// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { Fscrs22Questionnaire } from "@/lib/questionnaires/fscrs22";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/inner-critic-voice-test.json", "utf8")) as Fscrs22Questionnaire;
it("renders all eight FSCRS22 public images with the topic font and no remote asset request", async () => {
  expect(readFileSync("public/fonts/noto-sans-sc/inner-critic-voice-test-700.ttf").byteLength).toBeLessThan(300000);
  const remote = vi.fn(async () => { throw new Error("No remote asset fallback is allowed"); }), localFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? localFetch(input, init) : remote();
  });
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const response = await GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("image/png");
      const png = Buffer.from(await response.arrayBuffer()); expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(png.byteLength).toBeGreaterThan(10000); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    }
    expect(remote).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
}, 30000);
