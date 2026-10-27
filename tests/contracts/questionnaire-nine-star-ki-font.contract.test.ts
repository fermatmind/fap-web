// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { NineStarYearQuestionnaire } from "@/lib/questionnaires/nineStarYear";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/nine-star-ki.json", "utf8")) as NineStarYearQuestionnaire;
it("renders all20 public cultural images from the bound local font without remote assets", async () => {
  const font = readFileSync("public/fonts/noto-sans-sc/nine-star-ki-700.ttf");
  expect(font.byteLength).toBe(36152);
  expect(createHash("sha256").update(font).digest("hex")).toBe("5b17a27af111ca47d748a3a85702189d227b55527adb846c5dad1a1aeb0849ee");
  const remote = vi.fn(async () => { throw new Error("Synthetic denial: local-font public images need no remote asset"); });
  const fetchLocal = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? fetchLocal(input, init) : remote();
  });
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const r = await GET(new Request(`https://fermatmind.com/og/fun/nine-star-ki?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(r.status).toBe(200); expect(r.headers.get("content-type")).toContain("image/png");
      const bytes = Buffer.from(await r.arrayBuffer());
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630); expect(bytes.byteLength).toBeGreaterThan(10000);
    }
    expect(remote).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
}, 60000);
