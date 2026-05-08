import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/core-decision-domain-readiness-dashboard.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/core-decision-domain-readiness-dashboard.md");
const REPORT_FREEMIUM_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-report-freemium-ledger.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-cdd-state.json");

const DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];
const FINAL_STATUS = ["ready", "partial", "blocked", "not_applicable", "requires_human_decision", "unknown"];
const DOMAIN_STATUS = [
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

type DashboardArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domains: string[];
  finalStatusEnum: string[];
  domainStatusEnum: string[];
  dashboard: Array<{
    domain_id: string;
    domain_readiness: string;
    runtime_readiness: string;
    decision: string;
    signals: Array<{ scale_code: string; role: string }>;
    evidence_cta_status: string;
    claim_boundary_status: string;
    report_freemium_status: string;
    human_decision_required: string[];
    must_not_expand: string[];
  }>;
  blockedAreas: string[];
  nextPhaseRecommendation: {
    phase: string;
    decision: string;
    recommended_next_safe_step: string;
    runtime_changes_allowed_now: boolean;
  };
  trainCompletionStatus: Record<string, string>;
  mustNotChange: string[];
};

function readArtifact(): DashboardArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as DashboardArtifact;
}

describe("Core decision domain readiness dashboard", () => {
  it("depends on PR-CDD-05 and updates train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-CDD-05")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/740",
    });
    expect(byId.get("PR-CDD-06")).toMatchObject({
      status: "in_progress",
      branch: "codex/pr-cdd-06-final-domain-readiness-dashboard",
      depends_on: ["PR-CDD-05"],
    });
    expect(fs.existsSync(REPORT_FREEMIUM_PATH)).toBe(true);
  });

  it("defines final dashboard entries only for approved domains and enums", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("core_decision_domain.readiness_dashboard.v1");
    expect(artifact.scope).toBe("PR-CDD-06");
    expect(artifact.trainName).toBe("core-decision-domain-governance-train");
    expect(artifact.dependsOn).toEqual(["PR-CDD-05"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.finalStatusEnum).toEqual(FINAL_STATUS);
    expect(artifact.domainStatusEnum).toEqual(DOMAIN_STATUS);
    expect(artifact.dashboard.map((entry) => entry.domain_id)).toEqual(DOMAINS);

    for (const entry of artifact.dashboard) {
      expect(FINAL_STATUS).toContain(entry.domain_readiness);
      expect(DOMAIN_STATUS).toContain(entry.runtime_readiness);
      expect(entry.signals.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.human_decision_required.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.must_not_expand.length, entry.domain_id).toBeGreaterThan(0);
    }
  });

  it("locks the requested final readiness decisions", () => {
    const byDomain = new Map(readArtifact().dashboard.map((entry) => [entry.domain_id, entry]));

    expect(byDomain.get("self_understanding")).toMatchObject({
      domain_readiness: "ready",
      runtime_readiness: "partial",
      decision: "artifact + matrix ready, no hub",
    });
    expect(byDomain.get("career_decision")).toMatchObject({
      domain_readiness: "partial",
      runtime_readiness: "dangerous_if_expanded",
      decision: "proceed only with strict claim/recommendation guards",
    });
    expect(byDomain.get("workstyle_decision")).toMatchObject({
      domain_readiness: "partial",
      runtime_readiness: "artifact_only",
      decision: "artifact-first, no public hub",
    });
  });

  it("keeps blocked areas and next phase recommendation explicit", () => {
    const artifact = readArtifact();

    expect(artifact.blockedAreas).toEqual(
      expect.arrayContaining([
        "new domain hub pages",
        "public decision routes",
        "recommendation expansion",
        "profile memory",
        "SEO/GEO expansion",
        "freemium domain bundle",
        "new tests",
        "Topic Graph expansion",
        "Career pSEO",
      ])
    );
    expect(artifact.nextPhaseRecommendation).toMatchObject({
      phase: "Phase 4B",
      recommended_next_safe_step: "Domain Runtime Integration Readiness Scan",
      runtime_changes_allowed_now: false,
    });
  });

  it("documents the dashboard without allowing runtime changes", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(Object.values(artifact.trainCompletionStatus)).toEqual(["ready", "ready", "ready", "ready", "ready", "ready"]);
    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining(["domain hub pages", "public routes", "runtime CTA", "SEO/GEO exposure", "recommendation runtime", "profile writes"])
    );
    expect(doc).toContain("Phase 4B should not start until humans approve whether domain runtime surfaces are needed.");
    expect(doc).toContain("Domain Runtime Integration Readiness Scan");
  });
});
