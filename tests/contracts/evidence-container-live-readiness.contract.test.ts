import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/url-truth/evidence-container-live-readiness-samples.v1.json"
);
const PRIVATE_FLOW_RE = /\/(?:tests\/[^/]+\/take|test\/[^/]+\/take|result\/|orders\/|share\/|payment\/|pay\/|history\/)/i;
const HIDDEN_ATTR_RE = /\b(?:hidden|aria-hidden=["']true["'])\b/i;
const HIDDEN_STYLE_RE = /\bstyle=["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^"']*["']/i;

type ReadinessState = "ready" | "partial" | "not_ready";

type EvidenceLiveSample = {
  id: string;
  routeFamily: string;
  url: string;
  expectedReadiness: ReadinessState;
  expectedBlocks: string[];
  expectedFaqQuestions: string[];
  expectedPublicNextSteps: string[];
  html: string;
};

type SourceTokenContract = {
  source: string;
  requiredTokens: string[];
};

type Fixture = {
  version: string;
  scope: string;
  siteUrl: string;
  readinessStates: ReadinessState[];
  authorityPrinciples: string[];
  requiredCoverage: {
    routeFamilies: string[];
    readinessStates: ReadinessState[];
  };
  privateFlowDenyPatterns: string[];
  samples: EvidenceLiveSample[];
  sourceTokenContracts: SourceTokenContract[];
};

const REQUIRED_BLOCKS_BY_FAMILY: Record<string, string[]> = {
  article_detail: ["quick_answer", "definition", "next_step"],
  test_detail: ["quick_answer", "definition", "caveat", "next_step"],
  topic_detail: ["quick_answer", "definition", "comparison", "related_links"],
  personality_detail: ["quick_answer", "definition", "caveat", "next_step"],
  career_guide: ["quick_answer", "how_to", "caveat", "next_step", "evidence_facts"],
  career_job_detail: ["quick_answer", "evidence_facts", "caveat", "next_step"],
  mental_health_test: ["quick_answer", "definition", "caveat", "next_step"],
};

function readFixture(): Fixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as Fixture;
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function stripInvisible(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+(?:display\s*:\s*none|visibility\s*:\s*hidden|hidden|aria-hidden=["']true["'])[^>]*>[\s\S]*?<\/[^>]+>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function hasHiddenEvidence(html: string): boolean {
  const evidenceFragments = [...html.matchAll(/<[^>]+data-evidence-block=["'][^"']+["'][^>]*>/gi)].map(
    (match) => match[0] ?? ""
  );
  return evidenceFragments.some((fragment) => HIDDEN_ATTR_RE.test(fragment) || HIDDEN_STYLE_RE.test(fragment));
}

function hasPrivateNextStep(sample: EvidenceLiveSample): boolean {
  return extractHrefUrls(sample.html).some((href) => {
    const url = new URL(href, sample.url);
    return url.origin === new URL(sample.url).origin && PRIVATE_FLOW_RE.test(url.pathname);
  });
}

function classifySample(sample: EvidenceLiveSample): ReadinessState {
  const blocks = extractEvidenceBlocks(sample.html);
  const requiredBlocks = REQUIRED_BLOCKS_BY_FAMILY[sample.routeFamily] ?? ["quick_answer"];
  const visibleText = stripInvisible(sample.html);
  const jsonValues = extractJsonLdPayloads(sample.html).flatMap((payload) => collectJsonValues(payload));
  const faqVisibleAndAligned = sample.expectedFaqQuestions.every(
    (question) => visibleText.includes(question) && (jsonValues.length === 0 || jsonValues.includes(question))
  );
  const hasContainer = /data-evidence-container=/i.test(sample.html);
  const hasPrimaryAnswer = blocks.includes("quick_answer");
  const nonFaqBlocks = blocks.filter((block) => block !== "faq");
  const hasEnoughNonFaqEvidence = nonFaqBlocks.length >= 2;
  const hasAllRequiredBlocks = requiredBlocks.every((block) => blocks.includes(block));

  if (
    !hasContainer ||
    !hasPrimaryAnswer ||
    hasHiddenEvidence(sample.html) ||
    hasPrivateNextStep(sample) ||
    !faqVisibleAndAligned ||
    nonFaqBlocks.length === 0
  ) {
    return "not_ready";
  }

  if (hasEnoughNonFaqEvidence && hasAllRequiredBlocks) {
    return "ready";
  }

  return "partial";
}

describe("Evidence Container live readiness sampling", () => {
  it("defines a read-only sampling contract without content expansion", () => {
    const fixture = readFixture();

    expect(fixture.version).toBe("url_truth.evidence_container_live_readiness.v1");
    expect(fixture.scope).toBe("PR-UG-08");
    expect(fixture.siteUrl).toBe("https://fermatmind.com");
    expect(fixture.readinessStates).toEqual(["ready", "partial", "not_ready"]);
    expect(fixture.authorityPrinciples).toEqual(
      expect.arrayContaining([
        "visible_html_first",
        "backend_cms_authority",
        "no_hidden_schema_stuffing",
        "private_flows_never_discoverable",
        "sampling_only_no_content_expansion",
      ])
    );
  });

  it("covers required route families and readiness states", () => {
    const fixture = readFixture();
    const families = new Set(fixture.samples.map((sample) => sample.routeFamily));
    const readinessStates = new Set(fixture.samples.map((sample) => sample.expectedReadiness));

    expect(families).toEqual(new Set(fixture.requiredCoverage.routeFamilies));
    for (const state of fixture.requiredCoverage.readinessStates) {
      expect(readinessStates.has(state), `missing readiness state ${state}`).toBe(true);
    }
  });

  it("classifies visible HTML samples and blocks hidden schema stuffing", () => {
    const fixture = readFixture();

    for (const sample of fixture.samples) {
      const url = new URL(sample.url);
      const blocks = extractEvidenceBlocks(sample.html);
      const hrefs = extractHrefUrls(sample.html);
      const visibleText = stripInvisible(sample.html);

      expect(sample.url.startsWith(`${fixture.siteUrl}/`), `${sample.id} must use the site URL`).toBe(true);
      expect(PRIVATE_FLOW_RE.test(url.pathname), `${sample.id} must not sample private URL`).toBe(false);
      expect(blocks, `${sample.id} blocks`).toEqual(sample.expectedBlocks);
      expect(hrefs, `${sample.id} next steps`).toEqual(sample.expectedPublicNextSteps);

      for (const href of hrefs) {
        const nextStep = new URL(href, sample.url);
        expect(nextStep.origin).toBe(fixture.siteUrl);
        expect(PRIVATE_FLOW_RE.test(nextStep.pathname), `${sample.id} has private next step`).toBe(false);
      }

      for (const question of sample.expectedFaqQuestions) {
        if (sample.expectedReadiness !== "not_ready") {
          expect(visibleText, `${sample.id} visible FAQ`).toContain(question);
        }
      }

      expect(classifySample(sample), `${sample.id} readiness`).toBe(sample.expectedReadiness);
    }
  });

  it("keeps sampling docs and the original readiness gate anchored", () => {
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
