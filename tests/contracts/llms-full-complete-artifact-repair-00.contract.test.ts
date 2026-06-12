import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("SEO-OPS-LLMS-FULL-COMPLETE-ARTIFACT-REPAIR-PR-00", () => {
  it("exposes an operator-safe llms-full complete artifact warm script", () => {
    const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    const script = read("scripts/seo/generate-llms-full.mjs");

    expect(pkg.scripts["seo:generate-llms-full"]).toBe("node scripts/seo/generate-llms-full.mjs");
    expect(script).toContain("buildAndCacheLlmsFullText");
    expect(script).toContain("mode: result.ok === true ? \"complete\" : \"failed\"");
    expect(script).not.toContain("Mode: degraded");
  });

  it("keeps llms-full route response mode coarse while preserving source detail", () => {
    const route = read("app/llms-full.txt/route.ts");

    expect(route).toContain('type LlmsFullResponseMode = "complete" | "degraded"');
    expect(route).toContain("X-FermatMind-LLMS-Full-Source");
    expect(route).toContain('createLlmsFullResponse(freshCachedText, "complete", "cache")');
    expect(route).toContain('createLlmsFullResponse(buildResult, "complete", "generated")');
    expect(route).toContain('createLlmsFullResponse(staleCachedText, "complete", "stale-cache")');
    expect(route).toContain('createLlmsFullResponse(await buildDegradedLlmsFullText(siteUrl), "degraded", "degraded")');
  });

  it("adds llms surfaces to article content release revalidation", () => {
    const route = read("app/api/content-release/revalidate/route.ts");

    expect(route).toContain('if (type === "article")');
    expect(route).toContain('localized.push("/llms.txt", "/llms-full.txt")');
  });
});
