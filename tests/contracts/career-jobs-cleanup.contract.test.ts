import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career jobs cleanup contract", () => {
  it("frontend sitemap config no longer uses local career job authority", async () => {
    const source = read("next-sitemap.config.js");
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const excluded = Array.isArray(config.exclude) ? config.exclude : [];
    const generatedCareerJobLocs = additionalPaths
      .map((entry: { loc?: string }) => String(entry?.loc ?? ""))
      .filter((loc: string) => loc.startsWith("/en/career/jobs") || loc.startsWith("/zh/career/jobs"));

    expect(source).not.toContain('require("./.velite/careerJobs.json")');
    expect(excluded).toEqual(
      expect.arrayContaining([
        "/en/career/jobs",
        "/zh/career/jobs",
        "/en/career/jobs/*",
        "/zh/career/jobs/*",
      ])
    );
    expect(generatedCareerJobLocs).toEqual([]);
    expect(additionalPaths).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ loc: "/en/career/guides" }),
        expect.objectContaining({ loc: "/zh/career/guides" }),
        expect.objectContaining({ loc: "/en/career/industries" }),
        expect.objectContaining({ loc: "/zh/career/industries" }),
      ])
    );
  });

  it("committed sitemap artifacts no longer contain career job routes", () => {
    const sitemapIndex = read("public/sitemap.xml");
    const sitemap = read("public/sitemap-0.xml");

    expect(sitemapIndex).toContain("<loc>https://fermatmind.com/sitemap-0.xml</loc>");
    expect(sitemap).not.toContain("/en/career/jobs");
    expect(sitemap).not.toContain("/zh/career/jobs");
    expect(sitemap).toContain("/en/career/guides");
    expect(sitemap).toContain("/zh/career/industries");
  });

  it("career alias route no longer imports local career job slugs for static params", () => {
    const source = read("app/(localized)/[locale]/career/[slug]/page.tsx");

    expect(source).toContain("getCareerJobFromCmsBySlug");
    expect(source).not.toContain("listCareerJobSlugs");
    expect(source).toContain("listCareerGuideSlugs");
    expect(source).toContain("listCareerIndustrySlugs");
  });

  it("machine-readable routes resolve career jobs from CMS instead of local slugs", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(llms).toContain("listCareerJobsFromCms");
    expect(llmsFull).toContain("listCareerJobsFromCms");
    expect(llms).not.toContain("listCareerJobSlugs");
    expect(llmsFull).not.toContain("listCareerJobSlugs");
  });

  it("robots continues to point at the public authoritative sitemap path", () => {
    const robots = read("public/robots.txt");

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://fermatmind.com/sitemap.xml");
  });
});
