import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/seo-foundation/llms-topic-fallback-governance.v1.json"
);
const DOC_PATH = path.join(ROOT, "docs/seo/llms-topic-fallback-governance.md");

type SourceContract = {
  source: string;
  fallbackIdentifier: string;
  requiredTokens: string[];
  forbiddenTokens: string[];
};

type TopicFallbackFixture = {
  version: string;
  scope: string;
  runtimeBehaviorChanged: boolean;
  fallbackOwner: string;
  futureFinalAuthority: string;
  stablePublicTopicFallbacks: Array<{ slug: string; intentionalInclusion: boolean; reason: string }>;
  intentionalExclusions: Array<{ slug: string; reason: string }>;
  sourceContracts: SourceContract[];
  parityExpectations: Record<string, boolean>;
  blockedBeforeTopicGraphExpansion: string[];
};

function readFixture(): TopicFallbackFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as TopicFallbackFixture;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function extractStringArrayLiteral(source: string, identifier: string): string[] {
  const pattern = new RegExp(`const\\s+${identifier}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const match = source.match(pattern);
  expect(match, `${identifier} array literal must exist`).toBeTruthy();

  return [...String(match?.[1] ?? "").matchAll(/["']([^"']+)["']/g)].map((item) => item[1]);
}

function extractObjectFallbackSlugs(source: string, identifier: string): string[] {
  const pattern = new RegExp(`const\\s+${identifier}\\s*=\\s*\\[([\\s\\S]*?)\\];`, "m");
  const match = source.match(pattern);
  expect(match, `${identifier} object fallback literal must exist`).toBeTruthy();

  return [...String(match?.[1] ?? "").matchAll(/slug:\s*["']([^"']+)["']/g)].map((item) => item[1]);
}

describe("llms topic fallback governance", () => {
  it("defines a versioned compatibility fixture for the current stable public topic fallback set", () => {
    const fixture = readFixture();

    expect(fixture.version).toBe("seo_foundation.llms_topic_fallback_governance.v1");
    expect(fixture.scope).toBe("PR-SEOF-03");
    expect(fixture.runtimeBehaviorChanged).toBe(false);
    expect(fixture.fallbackOwner).toContain("compatibility_fixture");
    expect(fixture.futureFinalAuthority).toBe("backend_or_cms_topic_exposure_state");
    expect(fixture.stablePublicTopicFallbacks.map((item) => item.slug)).toEqual(["mbti", "big-five", "iq-eq"]);
    expect(fixture.intentionalExclusions.map((item) => item.slug)).toEqual(
      expect.arrayContaining(["riasec", "enneagram", "career"])
    );
  });

  it("keeps llms.txt and llms-full.txt fallback topic slugs in explicit parity", () => {
    const fixture = readFixture();
    const expectedSlugs = fixture.stablePublicTopicFallbacks.map((item) => item.slug);
    const llmsSource = readSource("app/llms.txt/route.ts");
    const llmsFullSource = readSource("app/llms-full.txt/route.ts");

    expect(extractStringArrayLiteral(llmsSource, "TOPIC_FALLBACK_SLUGS")).toEqual(expectedSlugs);
    expect(extractObjectFallbackSlugs(llmsFullSource, "TOPIC_FALLBACKS")).toEqual(expectedSlugs);
  });

  it("anchors source tokens and prevents unreviewed topic fallback widening", () => {
    const fixture = readFixture();

    for (const contract of fixture.sourceContracts) {
      const source = readSource(contract.source);

      for (const token of contract.requiredTokens) {
        expect(source, `${contract.source} missing ${token}`).toContain(token);
      }

      for (const token of contract.forbiddenTokens) {
        expect(source, `${contract.source} must not contain ${token}`).not.toContain(token);
      }
    }

    expect(fixture.parityExpectations).toMatchObject({
      llmsAndLlmsFullFallbackSlugsMustMatch: true,
      unexpectedTopicFallbackAdditionsFailContract: true,
      topicGraphExpansionMustNotSilentlyWidenLlms: true,
      privateFlowsRemainDenied: true,
    });
  });

  it("documents backend/CMS authority migration before Topic Graph expansion", () => {
    const fixture = readFixture();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(doc).toContain("No llms exposure widening");
    expect(doc).toContain("backend/CMS topic exposure authority");
    expect(doc).toContain("Topic Graph");
    expect(fixture.blockedBeforeTopicGraphExpansion).toEqual(
      expect.arrayContaining([
        expect.stringContaining("backend/CMS topic exposure authority"),
        expect.stringContaining("visibility/indexability/llms exposure state"),
      ])
    );
  });
});
