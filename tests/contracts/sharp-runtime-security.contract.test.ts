import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootRequire = createRequire(path.join(process.cwd(), "package.json"));
const fromNext = createRequire(rootRequire.resolve("next"));
type Image = {
  resize(width: number, height: number): Image;
  png(): Image;
  toBuffer(): Promise<Buffer>;
  metadata(): Promise<{ format?: string; width?: number; height?: number }>;
};
const sharp = fromNext("sharp") as {
  (input: Buffer): Image;
  versions: Record<string, string>;
};

describe("Next image processing security binding", () => {
  it("loads the fixed sharp and librsvg versions from Next's actual dependency", () => {
    expect(sharp.versions.sharp).toBe("0.35.5");
    const actual = sharp.versions.rsvg.split(".").map(Number);
    expect(actual[0] * 1_000_000 + actual[1] * 1000 + actual[2]).toBeGreaterThanOrEqual(2_063_002);
  });

  it("keeps ordinary SVG decoding and PNG resizing operational", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>');
    const png = await sharp(svg).resize(10, 10).png().toBuffer();
    const metadata = await sharp(png).metadata();
    expect(metadata.format).toBe("png");
    expect([metadata.width, metadata.height]).toEqual([10, 10]);
  });
});
