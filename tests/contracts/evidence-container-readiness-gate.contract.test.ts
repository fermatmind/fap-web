import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/evidence-container-readiness-gate.v1.json"
);
const PRIVATE_FLOW_RE = /\/(?:tests\/[^/]+\/take|test\/[^/]+\/take|result\/|orders\/|share\/|payment\/|pay\/|history\/)/i;

type PageFamily = {
  name: string;
  readiness: "ready" | "partial" | "not_ready";
  requiredBlocks: string[];
  recommendedBlocks: string[];
  riskBoundary: string;
};

type VisibleHtmlSample = {
  id: string;
  pageFamily: string;
  expectedReady: boolean;
  html: string;
  expectedBlocks: string[];
  expectedNextStepUrls: string[];
  expectedFaqQuestions: string[];
};

type SourceTokenContract = {
  source: string;
  requiredTokens: string[];
};

type Fixture = {
  version: string;
  scope: string;
  authorityPrinciples: string[];
  allowedBlockTypes: string[];
  minimumGate: {
    requiresPrimaryAnswer: boolean;
    minimumNonFaqEvidenceBlocks: number;
    requiresCaveatForRiskPages: boolean;
    requiresCanonicalPublicNextSteps: boolean;
    faqOnlyIsReady: boolean;
    hiddenSchemaAllowed: boolean;
  };
  privateFlowDenyPatterns: string[];
  pageFamilies: PageFamily[];
  visibleHtmlSamples: VisibleHtmlSample[];
  sourceTokenContracts: SourceTokenContract[];
};

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readFixture(): Fixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as Fixture;
}

function stripTags(value: string): string {
  let text = "";
  let index = 0;
  let skippedScriptDepth = 0;

  while (index < value.length) {
    if (value[index] !== "<") {
      if (skippedScriptDepth === 0) text += value[index];
      index += 1;
      continue;
    }

    const tagEnd = value.indexOf(">", index + 1);
    if (tagEnd === -1) break;

    const tagSource = value.slice(index + 1, tagEnd).trim().toLowerCase();
    const isClosingTag = tagSource.startsWith("/");
    const tagName = tagSource.replace(/^\//, "").split(/\s+/, 1)[0] ?? "";

    if (!isClosingTag && tagName === "script") {
      skippedScriptDepth += 1;
    } else if (isClosingTag && tagName === "script" && skippedScriptDepth > 0) {
      skippedScriptDepth -= 1;
    }

    if (skippedScriptDepth === 0) text += " ";
    index = tagEnd + 1;
  }

  return text.replace(/\s+/g, " ").trim();
}

function extractEvidenceBlocks(html: string): string[] {
  return [...html.matchAll(/data-evidence-block=["']([^"']+)["']/gi)].map((match) => match[1] ?? "");
}

function extractHrefUrls(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1] ?? "");
}

function extractJsonLdPayloads(html: string): unknown[] {
  const payloads: unknown[] = [];

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    payloads.push(JSON.parse(match[1] ?? "{}"));
  }

  return payloads;
}

function collectJsonValues(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectJsonValues(item, out);
    return out;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectJsonValues(item, out);
  }

  return out;
}

function samplePassesReadinessGate(sample: VisibleHtmlSample, fixture: Fixture): boolean {
  const blocks = extractEvidenceBlocks(sample.html);
  const hasPrimaryAnswer = blocks.includes("quick_answer");
  const nonFaqBlocks = blocks.filter((block) => block !== "faq");
  const hasEnoughNonFaqEvidence = nonFaqBlocks.length >= fixture.minimumGate.minimumNonFaqEvidenceBlocks;
  const linksArePublic = extractHrefUrls(sample.html).every((href) => {
    const url = new URL(href, "https://fermatmind.com");
    return url.origin === "https://fermatmind.com" && !PRIVATE_FLOW_RE.test(url.pathname);
  });

  return hasPrimaryAnswer && hasEnoughNonFaqEvidence && linksArePublic;
}

describe("Evidence Container readiness gate", () => {
  it("documents the visible HTML first readiness contract", () => {
    const fixture = readFixture();
    const doc = read("docs/geo/evidence-container-readiness-gate.md");

    expect(fixture.version).toBe("discoverability.evidence_container_readiness_gate.v1");
    expect(fixture.scope).toBe("PR-DF-07");
    expect(doc).toContain(fixture.version);
    expect(fixture.authorityPrinciples).toEqual(
      expect.arrayContaining([
        "visible_html_first",
        "backend_cms_authority",
        "faq_schema_must_match_visible_content",
        "private_flows_never_discoverable",
        "no_hidden_schema_stuffing",
      ])
    );
    expect(fixture.minimumGate).toMatchObject({
      requiresPrimaryAnswer: true,
      minimumNonFaqEvidenceBlocks: 1,
      requiresCanonicalPublicNextSteps: true,
      faqOnlyIsReady: false,
      hiddenSchemaAllowed: false,
    });
    expect(doc).toContain("FAQ-only pages are not Evidence Container ready");
  });

  it("covers page-family readiness without expanding Topic Graph or GEO content", () => {
    const fixture = readFixture();
    const families = new Map(fixture.pageFamilies.map((family) => [family.name, family]));

    expect([...families.keys()]).toEqual([
      "test_detail",
      "article_detail",
      "topic_detail",
      "personality_detail",
      "career_guide",
      "career_job_detail",
      "mental_health_test",
    ]);
    expect(families.get("career_job_detail")?.readiness).toBe("not_ready");
    expect(families.get("topic_detail")?.requiredBlocks).toEqual(
      expect.arrayContaining(["quick_answer", "definition", "comparison", "related_links"])
    );
    expect(families.get("mental_health_test")?.riskBoundary).toBe("non_medical_screening_not_diagnosis");

    for (const family of fixture.pageFamilies) {
      expect(family.requiredBlocks.length).toBeGreaterThan(0);
      for (const block of [...family.requiredBlocks, ...family.recommendedBlocks]) {
        expect(fixture.allowedBlockTypes).toContain(block);
      }
    }
  });

  it("validates visible samples for hidden-schema, FAQ-only, and private-flow failures", () => {
    const fixture = readFixture();

    for (const sample of fixture.visibleHtmlSamples) {
      const text = stripTags(sample.html);
      const blocks = extractEvidenceBlocks(sample.html);
      const urls = extractHrefUrls(sample.html);
      const jsonValues = extractJsonLdPayloads(sample.html).flatMap((payload) => collectJsonValues(payload));

      expect(blocks).toEqual(sample.expectedBlocks);
      expect(urls).toEqual(sample.expectedNextStepUrls);
      expect(sample.html).not.toContain("display:none");
      expect(sample.html).not.toContain("visibility:hidden");

      for (const question of sample.expectedFaqQuestions) {
        expect(text).toContain(question);
        if (jsonValues.length > 0) {
          expect(jsonValues).toContain(question);
        }
      }

      expect(samplePassesReadinessGate(sample, fixture)).toBe(sample.expectedReady);
    }
  });

  it("keeps private flow deny patterns and current answer-surface sources anchored", () => {
    const fixture = readFixture();

    expect(fixture.privateFlowDenyPatterns).toEqual([
      "/tests/*/take",
      "/result/*",
      "/orders/*",
      "/share/*",
      "/payment/*",
      "/pay/*",
      "/history/*",
    ]);

    for (const contract of fixture.sourceTokenContracts) {
      const source = read(contract.source);
      for (const token of contract.requiredTokens) {
        expect(source, `${contract.source} must contain ${token}`).toContain(token);
      }
    }
  });
});
