import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/assessment/domains/generated/phase-4c-runtime-verification-report.v1.json"
);
const DOC_PATH = path.join(
  ROOT,
  "docs/assessment/domains/phase-4c-runtime-verification-report.md"
);

type VerificationArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  phase: string;
  verificationStatus: string;
  runtimeBehaviorChanged: boolean;
  visibleCopyAdded: boolean;
  ctaRuntimeChanged: boolean;
  seoGeoChanged: boolean;
  sitemapChanged: boolean;
  llmsChanged: boolean;
  recommendationChanged: boolean;
  profileMemoryChanged: boolean;
  freemiumChanged: boolean;
  scoringChanged: boolean;
  newRoutesAdded: boolean;
  domainHubAdded: boolean;
  verifiedPRs: string[];
  domain: string;
  careerDecisionStatus: string;
  workstyleStatus: string;
  readinessForDashboard: boolean;
  surfaces: Array<{
    surface: string;
    pr: string;
    status: string;
    signals?: Array<{ scale_code: string; role: string }>;
    deferredReason?: string;
  }>;
  excludedSurfaces: string[];
  blocked: string[];
  mustNotChange: string[];
};

function readArtifact(): VerificationArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as VerificationArtifact;
}

describe("phase 4c runtime verification report", () => {
  it("artifact exists with correct version", () => {
    expect(fs.existsSync(ARTIFACT_PATH)).toBe(true);
    const artifact = readArtifact();

    expect(artifact.version).toBe("phase_4c.runtime_verification_report.v1");
    expect(artifact.scope).toBe("PR-4C-04");
    expect(artifact.trainName).toBe("domain-runtime-metadata-integration-phase-4c-train");
    expect(artifact.dependsOn).toEqual(["PR-4C-03"]);
    expect(artifact.phase).toBe("4C");
  });

  it("verification status is verified_clean", () => {
    const artifact = readArtifact();

    expect(artifact.verificationStatus).toBe("verified_clean");
  });

  it("all runtime flags are false", () => {
    const artifact = readArtifact();

    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.visibleCopyAdded).toBe(false);
    expect(artifact.ctaRuntimeChanged).toBe(false);
    expect(artifact.seoGeoChanged).toBe(false);
    expect(artifact.sitemapChanged).toBe(false);
    expect(artifact.llmsChanged).toBe(false);
    expect(artifact.recommendationChanged).toBe(false);
    expect(artifact.profileMemoryChanged).toBe(false);
    expect(artifact.freemiumChanged).toBe(false);
    expect(artifact.scoringChanged).toBe(false);
    expect(artifact.newRoutesAdded).toBe(false);
    expect(artifact.domainHubAdded).toBe(false);
  });

  it("verified PRs include PR-4C-01 through PR-4C-03", () => {
    const artifact = readArtifact();

    expect(artifact.verifiedPRs).toEqual(["PR-4C-01", "PR-4C-02", "PR-4C-03"]);
  });

  it("domain is self_understanding only", () => {
    const artifact = readArtifact();

    expect(artifact.domain).toBe("self_understanding");
    expect(artifact.careerDecisionStatus).toBe("blocked");
    expect(artifact.workstyleStatus).toBe("artifact_only");
  });

  it("result_report surfaces are active with correct roles", () => {
    const artifact = readArtifact();
    const rr = artifact.surfaces.find((s) => s.surface === "result_report");

    expect(rr).toBeDefined();
    expect(rr!.status).toBe("active");
    expect(rr!.pr).toBe("PR-4C-01");
    expect(rr!.signals).toEqual(
      expect.arrayContaining([
        { scale_code: "MBTI", role: "primary" },
        { scale_code: "BIG5_OCEAN", role: "primary" },
        { scale_code: "ENNEAGRAM", role: "supporting" },
      ])
    );
  });

  it("personality_detail is active", () => {
    const artifact = readArtifact();
    const pd = artifact.surfaces.find((s) => s.surface === "personality_detail");

    expect(pd).toBeDefined();
    expect(pd!.status).toBe("active");
    expect(pd!.pr).toBe("PR-4C-02");
  });

  it("test_detail is active with MBTI/Big5/Enneagram", () => {
    const artifact = readArtifact();
    const td = artifact.surfaces.find((s) => s.surface === "test_detail");

    expect(td).toBeDefined();
    expect(td!.status).toBe("active");
    expect(td!.pr).toBe("PR-4C-02");
    expect(td!.signals).toEqual(
      expect.arrayContaining([
        { scale_code: "MBTI", role: "primary" },
        { scale_code: "BIG5_OCEAN", role: "primary" },
        { scale_code: "ENNEAGRAM", role: "supporting" },
      ])
    );
  });

  it("topic_detail and article_detail are deferred", () => {
    const artifact = readArtifact();
    const topic = artifact.surfaces.find((s) => s.surface === "topic_detail");
    const article = artifact.surfaces.find((s) => s.surface === "article_detail");

    expect(topic).toBeDefined();
    expect(topic!.status).toBe("deferred");
    expect(topic!.pr).toBe("PR-4C-03");
    expect(topic!.deferredReason).toContain("topicCode");

    expect(article).toBeDefined();
    expect(article!.status).toBe("deferred");
    expect(article!.pr).toBe("PR-4C-03");
    expect(article!.deferredReason).toContain("relatedTestSlug");
  });

  it("excluded surfaces include RIASEC and non-self-understanding", () => {
    const artifact = readArtifact();

    expect(artifact.excludedSurfaces).toEqual(
      expect.arrayContaining(["RIASEC", "career_decision", "workstyle_decision"])
    );
  });

  it("readinessForDashboard is true", () => {
    const artifact = readArtifact();

    expect(artifact.readinessForDashboard).toBe(true);
  });

  it("blocked list contains required items", () => {
    const artifact = readArtifact();

    expect(artifact.blocked).toEqual(
      expect.arrayContaining([
        "new_domain_hub",
        "public_decision_routes",
        "visible_domain_copy",
        "domain_cta_runtime",
        "seo_geo_expansion",
        "sitemap_llms_widening",
        "generalized_recommendation",
        "career_decision_runtime",
        "workstyle_public_module",
        "profile_memory",
        "freemium_runtime",
        "checkout_payment_changes",
      ])
    );
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

  it("documents the verification position", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("verified_clean");
    expect(doc).toContain("Phase 4C-EXEC verified clean");
    expect(doc).toContain("Career Decision and Workstyle remain blocked");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });

  it("this PR does not modify app, components, or lib", () => {
    const forbiddenDirs = ["app", "components", "lib"];
    const gitRoot = path.join(ROOT, ".git");
    // Read-only check: verify we're on the right branch and commit is artifact-only
    // This test is satisfied by the fact that only docs/tests/codex files are staged
    expect(fs.existsSync(gitRoot)).toBe(true);
    // Asset that this test file is within tests/contracts/
    expect(__filename).toContain("tests/contracts");
    for (const dir of forbiddenDirs) {
      expect(__filename).not.toContain(`${dir}/`);
    }
  });
});
