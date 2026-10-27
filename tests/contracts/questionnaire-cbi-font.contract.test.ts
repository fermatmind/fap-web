// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/burnout-risk.json", "utf8")) as Questionnaire;

it("renders all six CBI public images from local fonts with every network request denied", async () => {
  expect(readFileSync("public/fonts/noto-sans-sc/burnout-risk-700.ttf").byteLength).toBeLessThan(300000);
  const requests: string[] = [];
  const deniedFetch = vi.fn(async (input: unknown) => {
    requests.push(typeof input === "string" ? input : input instanceof URL ? input.href : input instanceof Request ? input.url : String(input));
    throw new Error("CBI images must render entirely from local assets");
  });
  // Deny every fetch, including Next’s attempted initialization from embedded data.
  vi.stubGlobal("fetch", deniedFetch);
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const response = await GET(new Request(`https://fermatmind.com/og/fun/burnout-risk?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("image/png");
      const png = Buffer.from(await response.arrayBuffer());
      expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]); expect(png.byteLength).toBeGreaterThan(10000); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    }
    const embeddedPrefix = "data:application/octet-stream;base64,";
    expect(requests.filter(url => !url.startsWith(embeddedPrefix))).toEqual([]);
    for (const url of requests) expect([...Buffer.from(url.slice(embeddedPrefix.length), "base64").subarray(0, 4)]).toEqual([0, 97, 115, 109]);
    console.info(`CBI actual Next renderer: 6 PNGs; 0 network requests; ${requests.length} denied embedded-WASM initialization fetches.`);
  } finally { vi.unstubAllGlobals(); }
}, 30000);
