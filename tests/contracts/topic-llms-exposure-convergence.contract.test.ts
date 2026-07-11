import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  TOPIC_LLMS_COMPATIBILITY_FALLBACKS,
  TOPIC_LLMS_COMPATIBILITY_FALLBACK_SLUGS,
  resolveTopicRuntimeAuthority,
} from "@/lib/seo/topicLlmsAuthority";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/topic-llms-exposure-convergence.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/topic-llms-exposure-convergence.md");
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

type TopicLlmsRow = {
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
  compatibilityFallbacks: Array<{
    slug: string;
    title: string;
    allowedInLlms: boolean;
    allowedInLlmsFull: boolean;
    allowedTopicCtaFallback: boolean;
    reason: string;
  }>;
  blockedFallbackSlugs: Array<{ slug: string; reason: string }>;
  rows: TopicLlmsRow[];
  hardRules: string[];
  mustNotTouch: string[];
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("topic / llms exposure convergence", () => {
  it("registers PR3 after merged PR2 without overwriting train order", () => {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(byId.get("PR-PRA1B-02")).toMatchObject({
      status: "merged",
      branch: "codex/pr-pra1b-02-test-detail-authority-convergence",
    });
    expect(byId.get("PR-PRA1B-03")).toMatchObject({
      status: "merged",
      branch: "codex/pr-pra1b-03-topic-llms-exposure-convergence",
      depends_on: ["PR-PRA1B-02"],
    });
  });

  it("keeps topic compatibility fallback centralized and narrow", () => {
    const artifact = readArtifact();
    const helperSlugs = TOPIC_LLMS_COMPATIBILITY_FALLBACKS.map((topic) => topic.slug);

    expect(artifact.version).toBe("seo.topic_llms_exposure_convergence.v1");
    expect(artifact.scope).toBe("PR-PRA1B-03");
    expect(artifact.trainName).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(artifact.runtimeBehaviorChanged).toBe(true);
    expect(artifact.urlSetChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.statusEnum).toEqual([...STATUS_ENUM]);
    expect(artifact.priorityEnum).toEqual([...PRIORITY_ENUM]);
    expect(artifact.compatibilityFallbacks.map((topic) => topic.slug)).toEqual(["mbti", "big-five", "iq-eq"]);
    expect(TOPIC_LLMS_COMPATIBILITY_FALLBACK_SLUGS).toEqual(["mbti", "big-five", "iq-eq"]);
    expect(helperSlugs).toEqual(artifact.compatibilityFallbacks.map((topic) => topic.slug));
    expect(artifact.blockedFallbackSlugs.map((topic) => topic.slug)).toEqual(
      expect.arrayContaining(["riasec", "enneagram", "career"])
    );
  });

  it("blocks unapproved topic CTA fallback while preserving CMS-owned CTAs", () => {
    expect(resolveTopicRuntimeAuthority({ slug: "riasec", hasLandingSurfaceCtaBundle: false })).toMatchObject({
      cta: { allowed: false, source: "blocked" },
    });
    expect(resolveTopicRuntimeAuthority({ slug: "riasec", hasLandingSurfaceCtaBundle: true })).toMatchObject({
      cta: { allowed: true, source: "landing_surface_v1" },
    });
    expect(resolveTopicRuntimeAuthority({ slug: "mbti", hasLandingSurfaceCtaBundle: false })).toMatchObject({
      cta: { allowed: true, source: "compatibility_fixture" },
    });
  });

  it("anchors llms, llms-full, and topic page runtime guards", () => {
    const artifact = readArtifact();
    const allowedStatuses = new Set(artifact.statusEnum);
    const allowedPriorities = new Set(artifact.priorityEnum);

    for (const row of artifact.rows) {
      expect(allowedStatuses.has(row.status), row.id).toBe(true);
      expect(allowedPriorities.has(row.priority), row.id).toBe(true);
      expect(row.authorityRule.trim(), row.id).not.toBe("");
      expect(row.blocksWhen.trim(), row.id).not.toBe("");

      if (["llms_topic_fallback_convergence", "llms_full_topic_fallback_convergence"].includes(row.id)) {
        continue;
      }

      for (const source of row.sourceFiles) {
        const sourceText = readSource(source.path);
        for (const token of source.requiredTokens) {
          expect(sourceText, `${row.id}: ${source.path} missing ${token}`).toContain(token);
        }
      }
    }
  });

  it("keeps route-level discoverability on backend authority while CTA compatibility stays separate", () => {
    const llmsSource = readSource("app/llms.txt/route.ts");
    const llmsFullSource = readSource("app/llms-full.txt/route.ts");
    const topicPageSource = readSource("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(llmsSource).toContain("listDiscoverableTopicsWithLastKnownGood");
    expect(llmsFullSource).toContain("listDiscoverableTopicsWithLastKnownGood");
    expect(llmsSource).not.toContain("TOPIC_LLMS_COMPATIBILITY_FALLBACK");
    expect(llmsFullSource).not.toContain("TOPIC_LLMS_COMPATIBILITY_FALLBACK");
    expect(topicPageSource).toContain("resolveTopicRuntimeAuthority({");
    expect(topicPageSource).toContain("canRenderRelatedTopicCtas");
    expect(topicPageSource).toContain("topicRuntimeAuthority.cta.allowed");
  });

  it("documents convergence without topic graph or llms exposure expansion", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "no silent topic addition to llms",
        "no topic exposure without backend/CMS or explicit compatibility fixture",
        "no llms-full enrichment without answer/evidence readiness",
        "topic CTA must prefer landing_surface_v1 / CMS",
        "future topic expansion must require authority entry",
        "private flows remain excluded",
      ])
    );
    expect(artifact.mustNotTouch).toEqual(expect.arrayContaining(["new topics", "sitemap URL set", "llms URL set"]));
    expect(doc).toContain("Runtime behavior changed: yes");
    expect(doc).toContain("The fixture is not Topic Graph authority");
    expect(doc).toContain("This PR does not create topic pages");
  });
});
