import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-report-freemium-ledger.v1.json");
const DOC_PATH = path.join(ROOT, "docs/assessment/domains/domain-report-freemium-ledger.md");
const CLAIM_OVERLAY_PATH = path.join(ROOT, "docs/assessment/domains/generated/domain-claim-boundary-overlay.v1.json");
const TRAIN_STATE_PATH = path.join(ROOT, "docs/codex/pr-train-cdd-state.json");

const DOMAINS = ["self_understanding", "career_decision", "workstyle_decision"];

type LedgerArtifact = {
  version: string;
  scope: string;
  trainName: string;
  dependsOn: string[];
  runtimeBehaviorChanged: boolean;
  executionMode: string;
  domains: string[];
  sourceArtifacts: string[];
  globalRules: string[];
  ledger: Array<{
    domain_id: string;
    status: string;
    report_value: string[];
    primary_report_sources: string[];
    freemium_status: string;
    full_loop_status: string;
    bundle_candidate_status: string;
    blocked_commerce_claims: string[];
    scale_dependencies: Array<{ scale_code: string; status: string }>;
    monetization_risks: string[];
    required_future_proof: string[];
  }>;
  mustNotChange: string[];
};

function readArtifact(): LedgerArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as LedgerArtifact;
}

describe("Domain report and freemium ledger", () => {
  it("depends on PR-CDD-04 and updates train state", () => {
    const state = JSON.parse(fs.readFileSync(TRAIN_STATE_PATH, "utf8")) as {
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[]; pr_url?: string }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(byId.get("PR-CDD-04")).toMatchObject({
      status: "merged",
      pr_url: "https://github.com/fermatmind/fap-web/pull/739",
    });
    expect(byId.get("PR-CDD-05")).toMatchObject({
      status: "merged",
      branch: "codex/pr-cdd-05-domain-report-freemium-ledger",
      depends_on: ["PR-CDD-04"],
      pr_url: "https://github.com/fermatmind/fap-web/pull/740",
    });
    expect(fs.existsSync(CLAIM_OVERLAY_PATH)).toBe(true);
  });

  it("defines report and freemium ledger entries only for the approved domains", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("core_decision_domain.report_freemium_ledger.v1");
    expect(artifact.scope).toBe("PR-CDD-05");
    expect(artifact.trainName).toBe("core-decision-domain-governance-train");
    expect(artifact.dependsOn).toEqual(["PR-CDD-04"]);
    expect(artifact.runtimeBehaviorChanged).toBe(false);
    expect(artifact.executionMode).toBe("artifact_json_contract_only");
    expect(artifact.domains).toEqual(DOMAINS);
    expect(artifact.ledger.map((entry) => entry.domain_id)).toEqual(DOMAINS);

    for (const entry of artifact.ledger) {
      expect(entry.report_value.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.primary_report_sources.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.blocked_commerce_claims.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.scale_dependencies.length, entry.domain_id).toBeGreaterThan(0);
      expect(entry.required_future_proof.length, entry.domain_id).toBeGreaterThan(0);
    }
  });

  it("blocks domain bundles and full-loop claims unless parity proof exists", () => {
    const artifact = readArtifact();
    const byDomain = new Map(artifact.ledger.map((entry) => [entry.domain_id, entry]));

    expect(artifact.globalRules).toEqual(
      expect.arrayContaining([
        "SKU exists is not full_loop.",
        "Offer card exists is not full_loop.",
        "backend_ready is not monetization-ready.",
        "Domain bundle remains blocked unless parity proof exists.",
      ])
    );
    expect(byDomain.get("self_understanding")?.bundle_candidate_status).toBe("blocked");
    expect(byDomain.get("career_decision")?.full_loop_status).toBe("blocked");
    expect(byDomain.get("career_decision")?.bundle_candidate_status).toBe("blocked");
    expect(byDomain.get("workstyle_decision")?.full_loop_status).toBe("blocked");
    expect(byDomain.get("workstyle_decision")?.bundle_candidate_status).toBe("blocked");
  });

  it("preserves career and workstyle commerce claim boundaries", () => {
    const byDomain = new Map(readArtifact().ledger.map((entry) => [entry.domain_id, entry]));

    expect(byDomain.get("career_decision")?.blocked_commerce_claims).toEqual(
      expect.arrayContaining(["full recommendation package", "precise best-career package", "career success guarantee", "placement guarantee"])
    );
    expect(byDomain.get("workstyle_decision")?.blocked_commerce_claims).toEqual(
      expect.arrayContaining(["workplace performance prediction", "employment suitability package", "HR screening package"])
    );
    expect(byDomain.get("career_decision")?.scale_dependencies).toEqual(
      expect.arrayContaining([
        { scale_code: "RIASEC", status: "frontend_partial" },
        { scale_code: "BIG5_OCEAN", status: "frontend_partial" },
      ])
    );
  });

  it("documents the ledger without changing commerce or report runtime", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.mustNotChange).toEqual(
      expect.arrayContaining(["checkout", "payment", "paywall UI", "report access", "entitlement", "offer cards", "report entitlement"])
    );
    expect(doc).toContain("No checkout changes.");
    expect(doc).toContain("No entitlement changes.");
    expect(doc).toContain("No bundle runtime.");
  });
});
