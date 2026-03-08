import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("topics cleanup contract", () => {
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

  it("robots points to the authoritative sitemap xml", () => {
    const robots = read("public/robots.txt");

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://fermatmind.com/sitemap.xml");
  });

  it("frontend sitemap config excludes topics routes from static sitemap generation", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const excluded = Array.isArray(config.exclude) ? config.exclude : [];
    const generatedTopicLocs = additionalPaths
      .map((entry: { loc?: string }) => String(entry?.loc ?? ""))
      .filter((loc: string) => loc.startsWith("/en/topics") || loc.startsWith("/zh/topics"));

    expect(excluded).toEqual(
      expect.arrayContaining(["/en/topics", "/zh/topics", "/en/topics/*", "/zh/topics/*"])
    );
    expect(generatedTopicLocs).toEqual([]);
  });

  it("legacy local topics source file is removed", () => {
    expect(fs.existsSync(path.join(ROOT, "lib/topics.ts"))).toBe(false);
  });
});
