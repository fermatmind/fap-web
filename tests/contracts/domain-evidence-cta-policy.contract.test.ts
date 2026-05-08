import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-evidence-cta-policy.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/domain-evidence-cta-policy.md");
const ROLE_MATRIX_PATH = path.join(ROOT, "docs/assessment/domains/generated/signal-to-domain-role-matrix.v1.json");
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

type PolicyArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domains: string[];
  globalRules: string[];
  sourceArtifacts: string[];
  policies: Array<{
    domain_id: string;
    evidence_requirement: string;
    answer_surface_requirement: string;
    FAQ_requirement: string;
    CTA_policy: string;
    next_step_policy: string;
    private_flow_policy: string;
    fallback_policy: string;
    page_family_candidates: string[];
    domain_owned_CTA_status: string;
    evidence_status: string;
    CTA_status: string;
  }>;
  mustNotChange: string[];
};

function readArtifact(): PolicyArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as PolicyArtifact;
}

describe("Domain evidence and CTA policy", () => {
  it("depends on PR-CDD-02 and updates train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-CDD-02")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/737",
    });
    expect(byId.get("PR-CDD-03")).toMatchObject({
      status: "in_progress",
      branch: "codex/pr-cdd-03-domain-evidence-cta-policy",
      depends_on: ["PR-CDD-02"],
    });
    expect(fs.existsSync(ROLE_MATRIX_PATH)).toBe(true);
  });

  it("defines evidence and CTA policy for only the approved domains", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("core_decision_domain.evidence_cta_policy.v1");
    expect(artifact.scope).toBe("PR-CDD-03");
    expect(artifact.trainName).toBe("core-decision-domain-governance-train");
    expect(artifact.dependsOn).toEqual(["PR-CDD-02"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.policies.map((policy) => policy.domain_id)).toEqual(DOMAINS);

    for (const policy of artifact.policies) {
      expect(policy.evidence_requirement.trim(), policy.domain_id).not.toBe("");
      expect(policy.answer_surface_requirement.trim(), policy.domain_id).not.toBe("");
      expect(policy.FAQ_requirement.trim(), policy.domain_id).not.toBe("");
      expect(policy.CTA_policy.trim(), policy.domain_id).not.toBe("");
      expect(policy.next_step_policy.trim(), policy.domain_id).not.toBe("");
      expect(policy.private_flow_policy).toContain("Private result/pay/order/take flows are not public evidence targets");
      expect(policy.fallback_policy).toContain("cannot become domain authority");
      expect(policy.page_family_candidates.length, policy.domain_id).toBeGreaterThan(0);
      expect(STATUS_VALUES).toContain(policy.domain_owned_CTA_status);
      expect(STATUS_VALUES).toContain(policy.evidence_status);
      expect(STATUS_VALUES).toContain(policy.CTA_status);
    }
  });

  it("locks global evidence, FAQ, fallback, private-flow, and no-runtime-CTA rules", () => {
    const artifact = readArtifact();

    expect(artifact.globalRules).toEqual(
      expect.arrayContaining([
        "FAQ-only is not enough.",
        "Evidence must be visible.",
        "Evidence must be backed by Answer Surface, Evidence Container, backend/CMS authority, or artifact-approved source authority.",
        "CTA must be backend/CMS-owned or artifact-governed.",
        "Frontend fallback CTA cannot become domain authority.",
        "Private result/pay/order/take flows are not public evidence targets.",
        "No new CTA runtime.",
      ])
    );
    expect(artifact.mustNotChange).toEqual(expect.arrayContaining(["CTA rendering", "CTA copy", "Evidence rendering", "runtime pages"]));
  });

  it("classifies current domain evidence and CTA readiness without promoting domain-owned CTAs", () => {
    const artifact = readArtifact();
    const byDomain = new Map(artifact.policies.map((policy) => [policy.domain_id, policy]));

    expect(byDomain.get("self_understanding")).toMatchObject({
      evidence_status: "partial",
      CTA_status: "partial",
      domain_owned_CTA_status: "blocked",
    });
    expect(byDomain.get("career_decision")?.CTA_policy).toContain("snapshot/direction only");
    expect(byDomain.get("career_decision")?.next_step_policy).toContain("not precise recommendation");
    expect(byDomain.get("workstyle_decision")?.CTA_policy).toContain("No domain-owned workstyle CTA yet");
  });

  it("anchors source artifacts and documents no runtime changes", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    for (const source of artifact.sourceArtifacts) {
      expect(fs.existsSync(path.join(ROOT, source)), source).toBe(true);
    }
    expect(doc).toContain("Runtime behavior changed: no");
    expect(doc).toContain("FAQ-only is not enough");
    expect(doc).toContain("No Runtime Change Statement");
    expect(doc).not.toContain("Runtime behavior changed: yes");
  });
});
