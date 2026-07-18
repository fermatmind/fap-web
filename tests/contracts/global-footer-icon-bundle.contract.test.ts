import fs from "node:fs";
import path from "node:path";
import {
  siBilibili,
  siFacebook,
  siInstagram,
  siReddit,
  siSinaweibo,
  siTiktok,
  siWechat,
  siX,
  siXiaohongshu,
  siYoutube,
} from "simple-icons";
import { describe, expect, it } from "vitest";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";

const source = fs.readFileSync(path.join(process.cwd(), "lib/ui/footerSocialIcons.ts"), "utf8");

const expectedIconExportNames = [
  "siBilibili",
  "siFacebook",
  "siInstagram",
  "siReddit",
  "siSinaweibo",
  "siTiktok",
  "siWechat",
  "siX",
  "siXiaohongshu",
  "siYoutube",
];

const expectedIcons = {
  fb: siFacebook,
  x: siX,
  yt: siYoutube,
  ig: siInstagram,
  reddit: siReddit,
  wx: siWechat,
  weibo: siSinaweibo,
  xhs: siXiaohongshu,
  b: siBilibili,
  dy: siTiktok,
  tt: siTiktok,
} as const;

describe("GLOBAL-FOOTER-ICON-BUNDLE-01", () => {
  it("uses only explicit simple-icons imports with no namespace lookup", () => {
    expect(source).not.toMatch(/import\s+\*\s+as\s+\w+\s+from\s+["']simple-icons["']/);
    expect(source).not.toContain("simpleIcons");
    expect(source).not.toContain("requireSimpleIcon");

    const valueImport = source.match(/import\s*{([\s\S]*?)}\s*from\s*"simple-icons";/);
    expect(valueImport).not.toBeNull();
    expect(
      valueImport?.[1]
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    ).toEqual(expectedIconExportNames);
  });

  it("preserves the footer item keys, count, and icon paths", () => {
    expect(FOOTER_SOCIAL_ITEMS.map((item) => item.key)).toEqual(Object.keys(expectedIcons));

    for (const item of FOOTER_SOCIAL_ITEMS) {
      const expected = expectedIcons[item.key as keyof typeof expectedIcons];
      expect(item.icon).toEqual({ title: expected.title, slug: expected.slug, path: expected.path });
    }
  });
});
