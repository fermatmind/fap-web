// @vitest-environment node
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import { GLOBAL_HISTORY_SLUG, globalHistoryImagePath, globalHistoryPortraitPath } from "@/lib/entertainment/global-history/config";

it("serves the original static preview for Taiwan OG and former PNG download URLs", async () => {
  const options = { params: Promise.resolve({ slug: GLOBAL_HISTORY_SLUG }) };
  const image = (id: string, suffix = "") => new Request(`https://fermatmind.com${globalHistoryImagePath("zh-TW", id)}${suffix}`);
  expect((await GET(image("unknown"), options)).status).toBe(404);
  const portrait = await readFile(`public${globalHistoryPortraitPath("mansa-musa")}`);
  for (const suffix of ["", "&format=poster", "&download=1", "&format=poster&download=1"]) {
    const response = await GET(image("mansa-musa", suffix), options);
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("Content-Disposition")).toBeNull();
    expect(Buffer.from(await response.arrayBuffer())).toEqual(portrait);
  }
});
