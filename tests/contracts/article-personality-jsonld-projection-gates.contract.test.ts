import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveArticleJsonLdAuthority,
  resolvePersonalityFallbackProjectionGate,
} from "@/lib/seo/articlePersonalityAuthority";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/article-personality-jsonld-projection-gates.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/article-personality-jsonld-projection-gates.md");
const STATE_PATH = path.join(ROOT, "docs/codex/pr-train-phase-1b-state.json");

const STATUS_ENUM = [
  "complete",
  "ready_for_remediation",
  "partial",
  "blocked",
  "not_ready",
  "safe_to_defer",
  "dangerous_if_expanded",
  "requires_human_decision",
  "unknown",
] as const;

const PRIORITY_ENUM = ["P0", "P1", "P2", "P3"] as const;

type SourceAnchor = {
  path: string;
  requiredTokens: string[];
};

type GateRow = {
  id: string;
  surface: string;
  status: string;
  priority: string;
  currentOwner: string;
  desiredOwner: string;
  runtimeGuard: string;
  authorityRule: string;
  sourceFiles: SourceAnchor[];
  blocksWhen: string;
};

type Artifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  urlSetChanged: boolean;
  llmsExposureChanged: boolean;
  statusEnum: string[];
  priorityEnum: string[];
  rows: GateRow[];
  hardRules: string[];
  mustNotTouch: string[];
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("Article / Personality JSON-LD and projection gates", () => {
  it("registers PR4 after merged PR3 without changing train order", () => {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(byId.get("PR-PRA1B-03")).toMatchObject({
      status: "merged",
      branch: "codex/pr-pra1b-03-topic-llms-exposure-convergence",
    });
    expect(byId.get("PR-PRA1B-04")).toMatchObject({
      status: "in_progress",
      branch: "codex/pr-pra1b-04-article-personality-jsonld-projection-gates",
      depends_on: ["PR-PRA1B-03"],
    });
  });

  it("tracks Article JSON-LD fallback as visible-content compatibility only", () => {
    const cmsOwned = resolveArticleJsonLdAuthority({
      cmsArticleSeoJsonLd: { "@type": "Article" },
      article: { title: "A", excerpt: "B", contentHtml: "", contentMd: "" },
    });
    const visibleFallback = resolveArticleJsonLdAuthority({
      cmsArticleSeoJsonLd: null,
      article: { title: "A", excerpt: "B", contentHtml: "", contentMd: "" },
    });
    const blocked = resolveArticleJsonLdAuthority({
      cmsArticleSeoJsonLd: null,
      article: { title: "A", excerpt: "", contentHtml: "", contentMd: "" },
    });

    expect(cmsOwned).toMatchObject({
      source: "cms_article_seo_jsonld",
      canRenderJsonLd: true,
      classification: "backend_cms_complete",
      blocksExpansion: false,
    });
    expect(visibleFallback).toMatchObject({
      source: "visible_content_compatibility_fallback",
      canRenderJsonLd: true,
      classification: "compatibility_wrapper",
      blocksExpansion: true,
    });
    expect(blocked).toMatchObject({
      source: "blocked",
      canRenderJsonLd: false,
      classification: "blocked",
      blocksExpansion: true,
    });
  });

  it("suppresses schema, career, recommendation, scenario, and local pack authority on personality fallback", () => {
    const fallbackGate = resolvePersonalityFallbackProjectionGate({
      projection: {
        meta: {
          routeMode: "fallback",
          authoritySource: "frontend_gateway_fallback",
        },
      },
    } as never);
    const cmsGate = resolvePersonalityFallbackProjectionGate({
      projection: {
        meta: {
          routeMode: "detail",
          authoritySource: "cms_personality_projection",
        },
      },
    } as never);

    expect(fallbackGate).toMatchObject({
      isFallbackProjection: true,
      canRenderPublicSchema: false,
      canRenderCareerOrRecommendationClaims: false,
      canRenderLocalPersonalityContentPack: false,
      canRenderScenarioDeepDive: false,
      requiredRobots: "noindex,nofollow",
    });
    expect(cmsGate).toMatchObject({
      isFallbackProjection: false,
      canRenderPublicSchema: true,
      canRenderCareerOrRecommendationClaims: true,
      canRenderLocalPersonalityContentPack: true,
      canRenderScenarioDeepDive: true,
      requiredRobots: null,
    });
  });

  it("anchors source guards for Article and Personality runtime pages", () => {
    const artifact = readArtifact();
    const allowedStatuses = new Set(artifact.statusEnum);
    const allowedPriorities = new Set(artifact.priorityEnum);

    expect(artifact.version).toBe("seo.article_personality_jsonld_projection_gates.v1");
    expect(artifact.scope).toBe("PR-PRA1B-04");
    expect(artifact.trainName).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(artifact.runtimeBehaviorChanged).toBe(true);
    expect(artifact.urlSetChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.statusEnum).toEqual([...STATUS_ENUM]);
    expect(artifact.priorityEnum).toEqual([...PRIORITY_ENUM]);

    for (const row of artifact.rows) {
      expect(allowedStatuses.has(row.status), row.id).toBe(true);
      expect(allowedPriorities.has(row.priority), row.id).toBe(true);
      expect(row.authorityRule.trim(), row.id).not.toBe("");
      expect(row.blocksWhen.trim(), row.id).not.toBe("");

      for (const source of row.sourceFiles) {
        const sourceText = readSource(source.path);
        for (const token of source.requiredTokens) {
          expect(sourceText, `${row.id}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("documents fallback containment without content, schema, sitemap, or llms expansion", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const personalityPage = readSource("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "Article JSON-LD fallback cannot silently become accepted final authority",
        "Article JSON-LD must be backend/CMS-owned or visible-content deterministic",
        "Personality fallback cannot carry career / graph / recommendation claims",
        "Personality fallback must remain noindex/schema-suppressed if used",
        "CMS personality projection must be preferred when available",
      ])
    );
    expect(artifact.mustNotTouch).toEqual(
      expect.arrayContaining(["article content", "personality content", "new schema types", "sitemap URL set", "llms URL set"])
    );
    expect(doc).toContain("Runtime behavior changed: yes");
    expect(doc).toContain("no public JSON-LD");
    expect(doc).toContain("no career direction CTA");
    expect(personalityPage).toContain("careerDirectionHref ? (");
    expect(personalityPage).toContain("fallbackProjectionGate.canRenderScenarioDeepDive");
  });
});
