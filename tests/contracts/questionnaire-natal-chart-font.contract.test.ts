// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/natal-chart.json", "utf8")) as NatalChartQuestionnaire;
it("distributes the original license notices for the three new bundled packages", () => {
  const notices = readFileSync("public/licenses/natal-chart-third-party.txt", "utf8");
  expect(notices).toContain(readFileSync("node_modules/astronomy-engine/esm/astronomy.js", "utf8").split("*/", 1)[0] + "*/");
  expect(notices).toContain(readFileSync("node_modules/@js-temporal/polyfill/LICENSE", "utf8"));
  expect(notices).toContain(readFileSync("node_modules/.pnpm/jsbi@4.3.2/node_modules/jsbi/LICENSE", "utf8"));
});
it("renders all26 natal public images with the local topic font and no remote asset fallback", async () => {
  expect(readFileSync("public/fonts/noto-sans-sc/natal-chart-700.ttf").byteLength).toBeLessThan(300000);
  const remote = vi.fn(async () => { throw new Error("Remote asset fallback is not allowed"); }), localFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? localFetch(input, init) : remote();
  });
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const response = await GET(new Request(`https://fermatmind.com/og/fun/natal-chart?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("image/png");
      const png = Buffer.from(await response.arrayBuffer()); expect([...png.subarray(0, 8)]).toEqual([137,80,78,71,13,10,26,10]);
      expect(png.byteLength).toBeGreaterThan(10000); expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([1200,630]);
    }
    expect(remote).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
}, 60000);
