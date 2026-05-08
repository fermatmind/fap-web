import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/core-decision-domain-v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/core-decision-domain-v1.md");
const TRAIN_MANIFEST_PATH = path.join(ROOT, "docs/codex/pr-train-cdd.yaml");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-cdd-state.json");
const UASP_DOMAIN_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json");
const SCALE_REGISTRY_PATH = path.join(ROOT, "docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json");

const ALLOWED_DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];
const DOMAIN_STATUS_ENUM = [
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
const FINAL_READINESS_ENUM = ["ready", "partial", "blocked", "not_applicable", "requires_human_decision", "unknown"];

type CoreDecisionDomainArtifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  allowedDomains: string[];
  domainStatusEnum: string[];
  finalReadinessEnum: string[];
  sourceArtifacts: Array<{ path: string; status: string; missing_artifact?: boolean }>;
  domains: Array<{
    domain_id: string;
    user_problem: string;
    allowed_signal_types: string[];
    prohibited_signal_types: string[];
    allowed_scales: string[];
    blocked_scales: string[];
    claim_boundary: string[];
    evidence_requirement: string;
    CTA_policy: string;
    SEO_GEO_policy: string;
    profile_policy: string;
    recommendation_policy: string;
    freemium_policy: string;
    runtime_status: string;
    readiness_status: string;
  }>;
  blockedDomains: string[];
  mustNotChange: string[];
  residualRisks: Array<{ title: string; status: string; evidence: string }>;
};

function readArtifact(): CoreDecisionDomainArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CoreDecisionDomainArtifact;
}

describe("Core Decision Domain v1 overlay", () => {
  it("registers the CDD train and PR-CDD-01 state", () => {
    const manifest = fs.readFileSync(TRAIN_MANIFEST_PATH, "utf8");
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      train_name: string;
      pr_namespace: string;
      policy: Record<string, boolean>;
      prs: Array<{ id: string; branch: string; status: string; depends_on: string[] }>;
    };

    expect(manifest).toContain("train_name: core-decision-domain-governance-train");
    expect(manifest).toContain("pr_namespace: PR-CDD-*");
    expect(state.train_name).toBe("core-decision-domain-governance-train");
    expect(state.pr_namespace).toBe("PR-CDD-*");
    expect(state.policy.artifact_json_contract_only).toBe(true);
    expect(state.policy.runtime_behavior_changed).toBe(false);
    expect(state.prs.map((pr) => pr.id)).toEqual(["PR-CDD-01", "PR-CDD-02", "PR-CDD-03", "PR-CDD-04", "PR-CDD-05", "PR-CDD-06"]);
    expect(state.prs[0]).toMatchObject({
      id: "PR-CDD-01",
      branch: "codex/pr-cdd-01-domain-registry-overlay",
      depends_on: [],
    });
    expect(["in_progress", "merged"]).toContain(state.prs[0]?.status);
  });

  it("defines only the three approved Phase 4A domains and approved status enums", () => {
    const artifact = readArtifact();
    const uaspRegistry = JSON.parse(fs.readFileSync(UASP_DOMAIN_REGISTRY_PATH, "utf8")) as {
      domains: Array<{ domain_id: string }>;
    };
    const uaspDomainIds = new Set(uaspRegistry.domains.map((domain) => domain.domain_id));

    expect(artifact.version).toBe("core_decision_domain.v1");
    expect(artifact.scope).toBe("PR-CDD-01");
    expect(artifact.trainName).toBe("core-decision-domain-governance-train");
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.allowedDomains).toEqual(ALLOWED_DOMAINS);
    expect(artifact.domains.map((domain) => domain.domain_id)).toEqual(ALLOWED_DOMAINS);
    expect(artifact.domainStatusEnum).toEqual(DOMAIN_STATUS_ENUM);
    expect(artifact.finalReadinessEnum).toEqual(FINAL_READINESS_ENUM);

    for (const domain of artifact.domains) {
      expect(uaspDomainIds.has(domain.domain_id), domain.domain_id).toBe(true);
      expect(DOMAIN_STATUS_ENUM).toContain(domain.runtime_status);
      expect(DOMAIN_STATUS_ENUM).toContain(domain.readiness_status);
      expect(domain.user_problem.trim(), domain.domain_id).not.toBe("");
      expect(domain.allowed_scales.length, domain.domain_id).toBeGreaterThan(0);
      expect(domain.claim_boundary.length, domain.domain_id).toBeGreaterThan(0);
      expect(domain.evidence_requirement.trim(), domain.domain_id).not.toBe("");
      expect(domain.CTA_policy.trim(), domain.domain_id).not.toBe("");
      expect(domain.SEO_GEO_policy.trim(), domain.domain_id).not.toBe("");
      expect(domain.profile_policy.trim(), domain.domain_id).not.toBe("");
      expect(domain.recommendation_policy.trim(), domain.domain_id).not.toBe("");
      expect(domain.freemium_policy.trim(), domain.domain_id).not.toBe("");
    }
  });

  it("keeps first-batch scale membership aligned with UASP scale registry", () => {
    const artifact = readArtifact();
    const scaleRegistry = JSON.parse(fs.readFileSync(SCALE_REGISTRY_PATH, "utf8")) as {
      entries: Array<{ scale_code: string }>;
    };
    const firstBatchScales = new Set(scaleRegistry.entries.map((entry) => entry.scale_code));
    const selfUnderstanding = artifact.domains.find((domain) => domain.domain_id === "self_understanding");
    const careerDecision = artifact.domains.find((domain) => domain.domain_id === "career_decision");
    const workstyleDecision = artifact.domains.find((domain) => domain.domain_id === "workstyle_decision");

    expect(selfUnderstanding?.allowed_scales.filter((scale) => scale !== "Career Graph").every((scale) => firstBatchScales.has(scale))).toBe(true);
    expect(workstyleDecision?.allowed_scales.every((scale) => firstBatchScales.has(scale))).toBe(true);
    expect(careerDecision?.allowed_scales).toEqual(expect.arrayContaining(["RIASEC", "MBTI", "BIG5_OCEAN", "Career Graph"]));
    expect(careerDecision?.blocked_scales).toEqual(expect.arrayContaining(["ENNEAGRAM", "future_ability_tests"]));
    expect(workstyleDecision?.blocked_scales).toEqual(expect.arrayContaining(["RIASEC", "future_ability_tests"]));
  });

  it("preserves critical claim, recommendation, profile, SEO/GEO, and freemium boundaries", () => {
    const artifact = readArtifact();
    const byDomain = new Map(artifact.domains.map((domain) => [domain.domain_id, domain]));

    expect(byDomain.get("self_understanding")?.claim_boundary).toEqual(
      expect.arrayContaining(["no determinism", "no diagnosis", "no destiny framing", "not personality entertainment"])
    );
    expect(byDomain.get("career_decision")?.claim_boundary).toEqual(
      expect.arrayContaining(["no precise recommender", "no success guarantee", "no Big Five/RIASEC career matcher", "no AI planning claim"])
    );
    expect(byDomain.get("career_decision")?.recommendation_policy).toContain("RIASEC is candidate_signal");
    expect(byDomain.get("workstyle_decision")?.claim_boundary).toEqual(
      expect.arrayContaining(["no employment suitability", "no workplace performance prediction", "no HR screening claim", "no Big Five career matching"])
    );

    for (const domain of artifact.domains) {
      expect(domain.profile_policy).toContain("does not imply profile write");
      expect(domain.SEO_GEO_policy).toMatch(/Does not grant|guard-only|Artifact-only/);
      expect(domain.freemium_policy).not.toMatch(/full_loop automatically/i);
    }
  });

  it("anchors source artifacts, records missing graph edge schema, and documents no runtime change", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    for (const source of artifact.sourceArtifacts) {
      const exists = fs.existsSync(path.join(ROOT, source.path));
      if (source.missing_artifact) {
        expect(exists, source.path).toBe(false);
        expect(source.status).toBe("safe_to_defer");
      } else {
        expect(exists, source.path).toBe(true);
      }
      expect(DOMAIN_STATUS_ENUM).toContain(source.status);
    }
    expect(artifact.residualRisks.map((risk) => risk.title)).toContain("Generated graph edge schema artifact is absent");
    expect(artifact.mustNotChange).toEqual(expect.arrayContaining(["app routes", "public pages", "recommendation runtime", "profile runtime", "SEO/GEO output"]));
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
