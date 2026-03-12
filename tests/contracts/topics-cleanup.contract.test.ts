import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("topics cleanup contract", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("topics pages no longer import the legacy local topics source", () => {
    const listPage = read("app/(localized)/[locale]/topics/page.tsx");
    const detailPage = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(listPage).toContain('from "@/lib/cms/topics"');
    expect(detailPage).toContain('from "@/lib/cms/topics"');
    expect(listPage).not.toContain('from "@/lib/topics"');
    expect(detailPage).not.toContain('from "@/lib/topics"');
    expect(listPage).not.toContain("listTopicClusters");
    expect(detailPage).not.toContain("getTopicCluster");
  });

  it("uses app/robots.ts as the authoritative robots definition", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://fermatmind.com/sitemap.xml",
    });
  });

  it("frontend sitemap config includes public topic routes and does not exclude them", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const excluded = Array.isArray(config.exclude) ? config.exclude : [];
    const generatedTopicLocs = additionalPaths
      .map((entry: { loc?: string }) => String(entry?.loc ?? ""))
      .filter((loc: string) => loc.startsWith("/en/topics/") || loc.startsWith("/zh/topics/"));

    expect(excluded).not.toEqual(
      expect.arrayContaining(["/en/topics", "/zh/topics", "/en/topics/*", "/zh/topics/*"])
    );
    expect(generatedTopicLocs).toEqual(
      expect.arrayContaining(["/en/topics/mbti", "/zh/topics/mbti"])
    );
  });

  it("legacy local topics source file is removed", () => {
    expect(fs.existsSync(path.join(ROOT, "lib/topics.ts"))).toBe(false);
  });
});
