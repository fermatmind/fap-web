import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectPathDecisions } from "@/lib/contentRelease/revalidateRoute";

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
    const route = read("lib/seo/llmsFullRoute.ts");

    expect(route).toContain('type LlmsFullResponseMode = "complete" | "degraded"');
    expect(route).toContain("X-FermatMind-LLMS-Full-Source");
    expect(route).toContain('createLlmsFullResponse(freshCachedText, "complete", "cache")');
    expect(route).toContain('createLlmsFullResponse(staleCachedText, "complete", "stale-cache")');
    expect(route).toContain('createLlmsFullResponse(await buildDegradedLlmsFullText(siteUrl), "degraded", "degraded")');
    expect(route).not.toContain('"complete", "generated"');
    expect(route).toContain("scheduleLlmsFullResponseCacheRebuild(siteUrl)");
    expect(route).toContain("getOrStartLlmsFullBuild");
  });

  it("keeps llms surfaces on default article revalidation but excludes them from exact detail scope", () => {
    const defaultDecision = collectPathDecisions({
      content: { type: "article", locale: "en", slug: "example-article" },
      cache_signal: { paths: ["/en/articles/example-article"] },
    });
    const exactDecision = collectPathDecisions({
      content: {
        type: "article",
        path_scope: "article_detail_only",
        locale: "en",
        slug: "example-article",
        published_revision_id: 477,
        content_sha256: "a03386aaa589020a15d07d28bae7214bb3ff7463e1421be83494f4a427d67565",
      },
      cache_signal: { paths: ["/en/articles/example-article"] },
    });

    expect(defaultDecision.accepted).toContain("/llms.txt");
    expect(defaultDecision.accepted).toContain("/llms-full.txt");
    expect(exactDecision.accepted).toEqual(["/en/articles/example-article"]);
  });
});
