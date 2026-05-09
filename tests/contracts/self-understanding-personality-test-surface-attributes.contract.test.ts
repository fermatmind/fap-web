import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/self-understanding-personality-test-surface-attributes.v1.json"
);
const DOC_PATH = path.join(
  ROOT,
  "docs/assessment/domains/self-understanding-personality-test-surface-attributes.md"
);

type SurfaceEntry = {
  surface: string;
  route?: string;
  scale_code?: string;
  domain_role: string;
  attributePolicy: string;
  file?: string;
  note?: string;
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

describe("self-understanding personality test surface attributes", () => {
  it("artifact exists with correct version", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
    const artifact = readArtifact();

    expect(artifact.version).toBe("self_understanding.personality_test_surface_attributes.v1");
    expect(artifact.scope).toBe("PR-4C-02");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-phase-4c-train");
    expect(artifact.dependsOn).toEqual(["PR-4C-01"]);
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
      expect.arrayContaining(["RIASEC", "SDS", "CLINICAL", "EQ", "IQ"])
    );
  });

  it("personality_detail role is primary", () => {
    const artifact = readArtifact();
    const personality = artifact.surfaces.find((s) => s.surface === "personality_detail");

    expect(personality).toBeDefined();
    expect(personality!.domain_role).toBe("primary");
    expect(personality!.attributePolicy).toBe("metadata_only");
    expect(personality!.route).toBe("/personality/[type]");
  });

  it("test_detail MBTI role is primary", () => {
    const artifact = readArtifact();
    const mbti = artifact.surfaces.find((s) => s.surface === "test_detail" && s.scale_code === "MBTI");

    expect(mbti).toBeDefined();
    expect(mbti!.domain_role).toBe("primary");
    expect(mbti!.attributePolicy).toBe("metadata_only");
  });

  it("test_detail BIG5_OCEAN role is primary", () => {
    const artifact = readArtifact();
    const big5 = artifact.surfaces.find((s) => s.surface === "test_detail" && s.scale_code === "BIG5_OCEAN");

    expect(big5).toBeDefined();
    expect(big5!.domain_role).toBe("primary");
    expect(big5!.attributePolicy).toBe("metadata_only");
  });

  it("test_detail ENNEAGRAM role is supporting", () => {
    const artifact = readArtifact();
    const enneagram = artifact.surfaces.find((s) => s.surface === "test_detail" && s.scale_code === "ENNEAGRAM");

    expect(enneagram).toBeDefined();
    expect(enneagram!.domain_role).toBe("supporting");
    expect(enneagram!.attributePolicy).toBe("metadata_only");
  });

  it("RIASEC is not in active surfaces", () => {
    const artifact = readArtifact();
    const riasec = artifact.surfaces.find((s) => s.scale_code === "RIASEC");

    expect(riasec).toBeUndefined();
    expect(artifact.excluded).toContain("RIASEC");
  });

  it("blocked list contains required domains and runtime areas", () => {
    const artifact = readArtifact();

    expect(artifact.blocked).toEqual(
      expect.arrayContaining([
        "career_decision",
        "workstyle_decision",
        "new_domain_hub",
        "visible_copy",
        "domain_cta_runtime",
        "seo_geo_expansion",
        "recommendation_runtime",
        "profile_memory",
        "freemium_runtime",
        "topic_article_scope",
      ])
    );
  });

  it("data attributes are defined as static governance markers", () => {
    const artifact = readArtifact();

    expect(artifact.attributes).toEqual([
      "data-domain-id",
      "data-domain-role",
      "data-domain-envelope-state",
    ]);
    expect(artifact.executionMode).toBe("passive_data_attributes_only");
    expect(artifact.attributePolicy).toContain("static governance markers");
  });

  it("mustNotChange covers all runtime surfaces", () => {
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
      ])
    );
  });

  it("documents the no-runtime-change position", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("governance-only data attributes");
    expect(doc).toContain("static governance markers");
    expect(doc).toContain("data-domain-id=\"self_understanding\"");
    expect(doc).toContain("data-domain-role=\"primary\"");
    expect(doc).toContain("data-domain-role=\"supporting\"");
    expect(doc).toContain("data-domain-envelope-state=\"metadata_only\"");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
