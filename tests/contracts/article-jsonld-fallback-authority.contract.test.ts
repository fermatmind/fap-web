import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/seo-foundation/article-jsonld-fallback-authority.v1.json"
);
const DOC_PATH = path.join(ROOT, "docs/seo/article-jsonld-fallback-authority.md");

type TrackedFallback = {
  id: string;
  routeFamily: string;
  source: string;
  classification: "migration_required";
  risk: "P1" | "P2";
  currentAuthority: string;
  requiredFinalAuthority: string;
  temporaryAllowance: string;
  requiredTokens: string[];
  forbiddenTokens: string[];
  blocksBeforeExpansion: string[];
};

type NonArticleGuard = {
  id: string;
  source: string;
  expectedAllowedTypes: string[];
  forbiddenTokens: string[];
};

type ArticleFallbackFixture = {
  version: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  authorityStates: Record<string, { finalAuthority: boolean; allowedForExpansion: boolean }>;
  requirements: string[];
  trackedFallbacks: TrackedFallback[];
  nonArticleFallbackGuards: NonArticleGuard[];
  futureFailGate: {
    condition: string;
    blocksMergeWhenEnabled: boolean;
  };
};

function readFixture(): ArticleFallbackFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as ArticleFallbackFixture;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("Article JSON-LD fallback authority contract", () => {
  it("tracks Article JSON-LD frontend fallback as a migration-required authority state", () => {
    const fixture = readFixture();

    expect(fixture.version).toBe("seo_foundation.article_jsonld_fallback_authority.v1");
    expect(fixture.scope).toBe("PR-SEOF-02");
    expect(fixture.runtimeBehaviorChanged).toBe(false);
    expect(fixture.authorityStates.backend_cms_complete).toMatchObject({
      finalAuthority: true,
      allowedForExpansion: true,
    });
    expect(fixture.authorityStates.frontend_fallback).toMatchObject({
      finalAuthority: false,
      allowedForExpansion: false,
    });
    expect(fixture.authorityStates.migration_required).toMatchObject({
      finalAuthority: false,
      allowedForExpansion: false,
    });
    expect(fixture.trackedFallbacks).toHaveLength(1);
    expect(fixture.trackedFallbacks[0]).toMatchObject({
      id: "cms_article_detail_article_jsonld_fallback",
      routeFamily: "article_detail",
      classification: "migration_required",
      requiredFinalAuthority: "backend_cms_complete",
    });
  });

  it("anchors the current fallback source without accepting it as final authority", () => {
    const fixture = readFixture();

    for (const fallback of fixture.trackedFallbacks) {
      const source = readSource(fallback.source);

      for (const token of fallback.requiredTokens) {
        expect(source, `${fallback.id} missing ${token}`).toContain(token);
      }

      for (const token of fallback.forbiddenTokens) {
        expect(source, `${fallback.id} must not contain ${token}`).not.toContain(token);
      }

      expect(fallback.temporaryAllowance).toContain("Compatibility");
      expect(fallback.blocksBeforeExpansion).toEqual(
        expect.arrayContaining(["article_geo_expansion", "large_article_seo_rollout"])
      );
    }
  });

  it("keeps non-Article support detail pages out of the Article JSON-LD fallback gate", () => {
    const fixture = readFixture();

    for (const guard of fixture.nonArticleFallbackGuards) {
      const source = readSource(guard.source);

      for (const token of guard.forbiddenTokens) {
        expect(source, `${guard.id} must not contain ${token}`).not.toContain(token);
      }

      for (const schemaType of guard.expectedAllowedTypes) {
        expect(schemaType).toMatch(/^(WebPage|BreadcrumbList)$/);
      }
    }
  });

  it("documents the migration blocker without changing runtime output", () => {
    const fixture = readFixture();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("No Article schema output changes");
    expect(doc).toContain("backend/CMS complete");
    expect(doc).toContain("migration_required");
    expect(doc).toContain("Topic Graph");
    expect(fixture.futureFailGate.blocksMergeWhenEnabled).toBe(true);
    expect(fixture.requirements).toEqual(
      expect.arrayContaining([
        expect.stringContaining("visible article title"),
        expect.stringContaining("Frontend fallback must remain tracked"),
      ])
    );
  });
});
