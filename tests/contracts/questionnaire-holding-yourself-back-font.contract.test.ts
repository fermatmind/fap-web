// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { HoldingBack35Questionnaire } from "@/lib/questionnaires/holdingBack35";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/holding-yourself-back.json", "utf8")) as HoldingBack35Questionnaire;
it("renders all16 public original35 images from the bound local font without remote assets", async () => {
  const font = readFileSync("public/fonts/noto-sans-sc/holding-yourself-back-700.ttf");
  expect(font.byteLength).toBe(33224);
  expect(createHash("sha256").update(font).digest("hex")).toBe("cc58fd72a777e9c8e701e2d360c60ec08f6e92dc327d5c54a57151bee5b2def7");
  const remote = vi.fn(async () => { throw new Error("Synthetic denial: local-font public images need no remote asset"); });
  const fetchLocal = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? fetchLocal(input, init) : remote();
  });
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const r = await GET(new Request(`https://fermatmind.com/og/fun/holding-yourself-back?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(r.status).toBe(200); expect(r.headers.get("content-type")).toContain("image/png");
      const bytes = Buffer.from(await r.arrayBuffer());
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630); expect(bytes.byteLength).toBeGreaterThan(10000);
    }
    expect(remote).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
}, 60000);
