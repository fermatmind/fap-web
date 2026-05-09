import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/self-understanding-topic-article-surface-attributes.v1.json"
);
const DOC_PATH = path.join(
  ROOT,
  "docs/assessment/domains/self-understanding-topic-article-surface-attributes.md"
);

type SurfaceEntry = {
  surface: string;
  route: string;
  status: string;
  allowedTopics: string[];
  attributePolicy: string;
  deferredReason: string;
  allowedWhen: string;
};

type AttributeArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  visibleCopyAdded: boolean;
  seoGeoChanged: boolean;
  recommendationChanged: boolean;
  profileMemoryChanged: boolean;
  freemiumChanged: boolean;
  domain: string;
  executionMode: string;
  attributes: string[];
  attributePolicy: string;
  surfaces: SurfaceEntry[];
  excluded: string[];
  blocked: string[];
  mustNotChange: string[];
};

function readArtifact(): AttributeArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as AttributeArtifact;
}

describe("self-understanding topic article surface attributes", () => {
  it("artifact exists with correct version", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
    const artifact = readArtifact();

    expect(artifact.version).toBe("self_understanding.topic_article_surface_attributes.v1");
    expect(artifact.scope).toBe("PR-4C-03");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-phase-4c-train");
    expect(artifact.dependsOn).toEqual(["PR-4C-02"]);
  });

  it("runtime behavior is unchanged", () => {
    const artifact = readArtifact();

    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.visibleCopyAdded).toBe(false);
    expect(artifact.seoGeoChanged).toBe(false);
    expect(artifact.recommendationChanged).toBe(false);
    expect(artifact.profileMemoryChanged).toBe(false);
    expect(artifact.freemiumChanged).toBe(false);
  });

  it("only covers self_understanding domain", () => {
    const artifact = readArtifact();

    expect(artifact.domain).toBe("self_understanding");
    expect(artifact.excluded).toEqual(
      expect.arrayContaining([
        "RIASEC", "career_decision", "workstyle_decision",
        "SDS", "CLINICAL", "EQ", "IQ",
      ])
    );
  });

  it("topic_detail is deferred with clear reason", () => {
    const artifact = readArtifact();
    const topic = artifact.surfaces.find((s) => s.surface === "topic_detail");

    expect(topic).toBeDefined();
    expect(topic!.status).toBe("deferred");
    expect(topic!.route).toBe("/topics/[slug]");
    expect(topic!.deferredReason).toContain("CmsTopicProfile");
    expect(topic!.deferredReason).toContain("topicCode");
    expect(topic!.allowedTopics).toEqual(["MBTI", "BIG5_OCEAN", "ENNEAGRAM"]);
    expect(topic!.allowedWhen).toContain("backend/CMS");
  });

  it("article_detail is deferred with clear reason", () => {
    const artifact = readArtifact();
    const article = artifact.surfaces.find((s) => s.surface === "article_detail");

    expect(article).toBeDefined();
    expect(article!.status).toBe("deferred");
    expect(article!.route).toBe("/articles/[slug]");
    expect(article!.deferredReason).toContain("CmsArticle");
    expect(article!.deferredReason).toContain("relatedTestSlug");
    expect(article!.allowedTopics).toEqual(["MBTI", "BIG5_OCEAN", "ENNEAGRAM"]);
    expect(article!.allowedWhen).toContain("backend/CMS");
  });

  it("executionMode is contract_only_deferred", () => {
    const artifact = readArtifact();

    expect(artifact.executionMode).toBe("contract_only_deferred");
    expect(artifact.attributePolicy).toContain("deferred");
    expect(artifact.attributePolicy).toContain("backend/CMS");
  });

  it("blocked list contains required runtime areas", () => {
    const artifact = readArtifact();

    expect(artifact.blocked).toEqual(
      expect.arrayContaining([
        "new_domain_hub",
        "visible_copy",
        "domain_cta_runtime",
        "seo_geo_expansion",
        "recommendation_runtime",
        "profile_memory",
        "freemium_runtime",
        "topic_graph_expansion",
        "career_pseo_expansion",
      ])
    );
  });

  it("mustNotChange covers all runtime surfaces and page markup", () => {
    const artifact = readArtifact();

    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining([
        "visible copy",
        "CTA runtime",
        "recommendation runtime",
        "profile memory",
        "freemium runtime",
        "checkout/payment",
        "report entitlement",
        "SEO/GEO output",
        "sitemap generation",
        "llms generation",
        "scoring",
        "topic page markup",
        "article page markup",
      ])
    );
  });

  it("documents the no-runtime-change and deferred position", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("contract-only");
    expect(doc).toContain("deferred");
    expect(doc).toContain("no passive `data-domain-*` attributes are added");
    expect(doc).toContain("CmsTopicProfile.topicCode");
    expect(doc).toContain("CmsArticle.relatedTestSlug");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
