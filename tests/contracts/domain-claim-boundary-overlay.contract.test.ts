import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-claim-boundary-overlay.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/domain-claim-boundary-overlay.md");
const EVIDENCE_CTA_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-evidence-cta-policy.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-cdd-state.json");

const DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];
const STATUS_VALUES = [
  "ready_for_domain_v1",
  "partial",
  "artifact_only",
  "backend_ready",
  "frontend_partial",
  "blocked",
  "dangerous_if_expanded",
  "requires_human_decision",
  "safe_to_defer",
  "unknown",
];

type OverlayArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domains: string[];
  sourceArtifacts: string[];
  globalRules: string[];
  overlays: Array<{
    domain_id: string;
    status: string;
    forbidden_boundaries: string[];
    allowed_with_boundary: string[];
    guard_artifacts: string[];
    copy_remediation_allowed: boolean;
  }>;
  crossDomainBoundaries: Record<string, string[]>;
  mustNotChange: string[];
};

function readArtifact(): OverlayArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as OverlayArtifact;
}

describe("Domain claim boundary overlay", () => {
  it("depends on PR-CDD-03 and updates train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-CDD-03")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/738",
    });
    expect(byId.get("PR-CDD-04")).toMatchObject({
      status: "in_progress",
      branch: "codex/pr-cdd-04-domain-claim-boundary-overlay",
      depends_on: ["PR-CDD-03"],
    });
    expect(fs.existsSync(EVIDENCE_CTA_PATH)).toBe(true);
  });

  it("defines claim overlays only for the approved domains", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("core_decision_domain.claim_boundary_overlay.v1");
    expect(artifact.scope).toBe("PR-CDD-04");
    expect(artifact.trainName).toBe("core-decision-domain-governance-train");
    expect(artifact.dependsOn).toEqual(["PR-CDD-03"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.overlays.map((overlay) => overlay.domain_id)).toEqual(DOMAINS);

    for (const overlay of artifact.overlays) {
      expect(STATUS_VALUES).toContain(overlay.status);
      expect(overlay.forbidden_boundaries.length, overlay.domain_id).toBeGreaterThan(0);
      expect(overlay.allowed_with_boundary.length, overlay.domain_id).toBeGreaterThan(0);
      expect(overlay.guard_artifacts.length, overlay.domain_id).toBeGreaterThan(0);
      expect(overlay.copy_remediation_allowed).toBe(false);
    }
  });

  it("binds required self-understanding, career, and workstyle forbidden boundaries", () => {
    const byDomain = new Map(readArtifact().overlays.map((overlay) => [overlay.domain_id, overlay]));

    expect(byDomain.get("self_understanding")?.forbidden_boundaries).toEqual(
      expect.arrayContaining(["no determinism", "no diagnosis", "no destiny framing", "no personality entertainment framing"])
    );
    expect(byDomain.get("career_decision")?.forbidden_boundaries).toEqual(
      expect.arrayContaining([
        "no precise recommender",
        "no best-career prediction",
        "no success guarantee",
        "no placement guarantee",
        "no Big Five/RIASEC career matcher",
        "no AI planning claim",
        "no snapshot recommendation equals personalized recommender",
      ])
    );
    expect(byDomain.get("workstyle_decision")?.forbidden_boundaries).toEqual(
      expect.arrayContaining(["no employment suitability", "no workplace performance prediction", "no HR screening claim", "no Big Five career matching"])
    );
  });

  it("binds SEO/GEO, profile, recommendation, and freemium cross-domain boundaries", () => {
    const artifact = readArtifact();

    expect(artifact.crossDomainBoundaries.seo_geo).toEqual(
      expect.arrayContaining(["no sitemap/llms/schema as true graph", "no FAQ-only as evidence ready", "no AI answerability as AI planning"])
    );
    expect(artifact.crossDomainBoundaries.profile).toEqual(
      expect.arrayContaining(["no domain mapping implies profile write", "saved careers are not UASP profile memory"])
    );
    expect(artifact.crossDomainBoundaries.recommendation).toEqual(
      expect.arrayContaining(["RIASEC remains candidate_signal, not recommender", "Big Five remains explanation_only, not recommender"])
    );
    expect(artifact.crossDomainBoundaries.freemium).toEqual(
      expect.arrayContaining(["SKU exists is not full_loop", "offer card exists is not full_loop", "backend_ready is not monetization-ready"])
    );
  });

  it("documents the overlay without changing runtime behavior or public copy", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.globalRules).toEqual(
      expect.arrayContaining([
        "Domain mapping does not create or weaken product claims.",
        "Domain mapping does not grant recommendation eligibility.",
        "Domain mapping does not grant profile write permission.",
        "Public copy remediation requires a separate scoped decision.",
      ])
    );
    expect(artifact.mustNotChange).toEqual(expect.arrayContaining(["public copy", "claim runtime", "recommendation runtime", "SEO/GEO output"]));
    expect(doc).toContain("No copy changes.");
    expect(doc).toContain("No recommendation runtime changes.");
  });
});
