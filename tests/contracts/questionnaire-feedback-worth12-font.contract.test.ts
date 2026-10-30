// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/feedback-self-worth-reflection.json", "utf8")) as Questionnaire;

it("renders all eight feedback and self-worth public PNGs from the local topic font with network denied", async () => {
  expect(readFileSync("public/fonts/noto-sans-sc/feedback-self-worth-reflection-700.ttf").byteLength).toBeLessThan(300000);
  const requests: string[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: unknown) => {
    requests.push(typeof input === "string" ? input : input instanceof URL ? input.href : input instanceof Request ? input.url : String(input));
    throw new Error("Feedback and self-worth images must use local assets");
  }));
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const response = await GET(new Request(`https://fermatmind.com/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(response.status).toBe(200); expect(response.headers.get("content-type")).toContain("image/png");
      const png = Buffer.from(await response.arrayBuffer()); expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(png.byteLength).toBeGreaterThan(10000); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    }
    const embeddedPrefix = "data:application/octet-stream;base64,";
    expect(requests.filter(url => !url.startsWith(embeddedPrefix))).toEqual([]);
    for (const url of requests) expect([...Buffer.from(url.slice(embeddedPrefix.length), "base64").subarray(0, 4)]).toEqual([0, 97, 115, 109]);
  } finally { vi.unstubAllGlobals(); }
}, 30000);
