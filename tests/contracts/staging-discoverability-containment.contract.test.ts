import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as llmsFullRoute } from "@/app/llms-full.txt/route";
import { GET as llmsRoute } from "@/app/llms.txt/route";
import { proxy } from "@/proxy";

const ROOT = process.cwd();
const STAGING_HOST = "staging.fermatmind.com";
const STAGING_URL = `https://${STAGING_HOST}`;
const NOINDEX = "noindex, nofollow, noarchive";

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("staging discoverability containment", () => {
  it("records the generated deindex fix report and no-mutation boundaries", () => {
    const report = JSON.parse(read("docs/seo/generated/discoverability-staging-deindex-fix-01.v1.json"));

    expect(report.task).toBe("DISCOVERABILITY-STAGING-DEINDEX-FIX-01");
    expect(report.staging_noindex_header_enabled).toBe(true);
    expect(report.staging_meta_noindex_enabled).toBe(true);
    expect(report.staging_self_canonical_disabled).toBe(true);
    expect(report.staging_robots_public_sitemap_disabled).toBe(true);
    expect(report.staging_sitemap_staging_urls_removed).toBe(true);
    expect(report.staging_llms_staging_urls_removed).toBe(true);
    expect(report.production_indexability_preserved).toBe(true);
    expect(report.production_canonical_preserved).toBe(true);
    expect(report.production_sitemap_preserved).toBe(true);
    expect(report.production_llms_preserved).toBe(true);
    expect(report.search_submission_performed).toBe(false);
    expect(report.baidu_console_mutation_performed).toBe(false);
    expect(report.dns_mutation_performed).toBe(false);
    expect(report.deploy_performed).toBe(false);
    expect(report.next_task).toBe("FRONTEND-DEPLOY-READINESS｜Deploy staging deindex fix");
  });

  it("adds noindex headers for staging HTML page responses without affecting production pages", () => {
    const staging = proxy(new NextRequest(`${STAGING_URL}/en/tests/mbti-personality-test-16-personality-types`));
    const production = proxy(
      new NextRequest("https://fermatmind.com/en/tests/mbti-personality-test-16-personality-types")
    );

    expect(staging.headers.get("x-robots-tag")).toBe(NOINDEX);
    expect(production.headers.get("x-robots-tag")).toBeNull();
  });

  it("blocks staging robots from advertising a public staging sitemap", async () => {
    const response = proxy(new NextRequest(`${STAGING_URL}/robots.txt`));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toBe(NOINDEX);
    expect(body).toContain("Disallow: /");
    expect(body).not.toContain("Sitemap:");
    expect(body).not.toContain(STAGING_HOST);
  });

  it("returns gone for staging sitemap and llms machine-readable surfaces", async () => {
    for (const pathname of ["/sitemap.xml", "/llms.txt", "/llms-full.txt"]) {
      const response = proxy(new NextRequest(`${STAGING_URL}${pathname}`));
      const body = await response.text();

      expect(response.status).toBe(410);
      expect(response.headers.get("x-robots-tag")).toBe(NOINDEX);
      expect(body).not.toContain(STAGING_HOST);
    }
  });

  it("staging llms route handlers fail closed without listing staging URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", STAGING_URL);

    for (const response of [await llmsRoute(), await llmsFullRoute()]) {
      const body = await response.text();

      expect(response.status).toBe(410);
      expect(response.headers.get("x-robots-tag")).toBe(NOINDEX);
      expect(body).not.toContain(STAGING_HOST);
    }
  });

  it("staging metadata cannot self-canonicalize and production remains indexable", () => {
    expect(read("lib/site.ts")).toContain("STAGING_SITE_HOSTS");
    expect(read("lib/site.ts")).toContain("STAGING_SITE_HOSTS.has(hostname)");
    expect(read("lib/site.ts")).toContain("? CANONICAL_SITE_URL : value");
    expect(read("app/(root)/layout.tsx")).toContain("isConfiguredStagingSiteUrl()");
    expect(read("app/(localized)/[locale]/layout.tsx")).toContain("isConfiguredStagingSiteUrl()");
    expect(read("app/(root)/layout.tsx")).toContain("index: false");
    expect(read("app/(localized)/[locale]/layout.tsx")).toContain("follow: false");
  });

  it("staging host is denied in headers while production sitemap and llms routes remain configured", () => {
    const nextConfigSource = read("next.config.mjs");
    const llmsSource = read("app/llms.txt/route.ts");
    const llmsFullSource = read("app/llms-full.txt/route.ts");

    expect(nextConfigSource).toContain('value: "staging.fermatmind.com"');
    expect(nextConfigSource).toContain('key: "X-Robots-Tag"');
    expect(llmsSource).toContain("isConfiguredStagingDiscoverability()");
    expect(llmsFullSource).toContain("isConfiguredStagingDiscoverability()");
    expect(llmsSource).toContain("getSiteUrlOrThrow()");
    expect(llmsFullSource).toContain("getSiteUrlOrThrow()");
  });
});
