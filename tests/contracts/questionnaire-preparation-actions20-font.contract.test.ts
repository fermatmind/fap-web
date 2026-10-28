// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import type { PreparationActions20Questionnaire } from "@/lib/questionnaires/preparationActions20";
for (const [slug, size, hash] of [["freelance-ready", 32636, "917727dde58966116e64c77c53060ffb53fed295284d0c948476981eb20dc80b"], ["remote-work", 32136, "fe27d716581f2d09ed4c5e227f8dff0175d3a691860402dfc0d337d886580f6f"]] as const) {
const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as PreparationActions20Questionnaire;
it(`${slug}: renders all12 public preparation-action images from the bound local font without remote assets`, async () => {
  const font = readFileSync(`public/fonts/noto-sans-sc/${slug}-700.ttf`);
  expect(font.byteLength).toBe(size);
  expect(createHash("sha256").update(font).digest("hex")).toBe(hash);
  const remote = vi.fn(async () => { throw new Error("Synthetic denial: local-font public images need no remote asset"); });
  const fetchLocal = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("data:application/octet-stream;base64,") ? fetchLocal(input, init) : remote();
  });
  try {
    for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
      const r = await GET(new Request(`https://fermatmind.com/og/fun/${slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`), { params: Promise.resolve({ slug: quiz.slug }) });
      expect(r.status).toBe(200); expect(r.headers.get("content-type")).toContain("image/png");
      const bytes = Buffer.from(await r.arrayBuffer());
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630); expect(bytes.byteLength).toBeGreaterThan(10000);
    }
    expect(remote).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); }
}, 60000);

}
