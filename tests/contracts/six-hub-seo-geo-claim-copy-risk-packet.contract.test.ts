import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetPath = path.join(
  repoRoot,
  "docs/seo/agent/six-hub-seo-geo-claim-copy-risk-packet.v1.json"
);
const markdownPath = path.join(
  repoRoot,
  "docs/seo/agent/six-hub-seo-geo-claim-copy-risk-packet-2026-06-25.md"
);
const readinessPath = path.join(
  repoRoot,
  "docs/seo/agent/six-hub-seo-geo-package-readiness-packet.v1.json"
);
const statePath = path.join(repoRoot, "docs/codex/pr-train-state.json");

type ReadinessRow = {
  scale_code: string;
  locale: string;
  claim_risk_notes: string;
};

type RouteClaimRisk = {
  scale_code: string;
  locale: string;
  readiness_claim_risk_notes: string;
  forbidden_claims: string[];
  safe_copy_direction: string;
};

type ScaleRiskSummary = {
  scale_code: string;
  highest_risk: string;
  copy_gate_decision: string;
  observed_backend_tiers: string[];
  observed_backend_forms_counts: number[];
};

type TrainStatePr = {
  id: string;
  status: string;
  artifacts: string[];
  scope_validation: {
    allowed_files: string[];
  };
};

describe("Six Hub SEO/GEO claim copy risk packet", () => {
  const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const readiness = JSON.parse(fs.readFileSync(readinessPath, "utf8"));
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

  it("records the expected packet identity and route coverage", () => {
    expect(packet.schema_version).toBe("fermatmind.six_hub_seo_geo_claim_copy_risk_packet.v1");
    expect(packet.task_id).toBe("SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01");
    expect(packet.verdict).toBe("CLAIM_COPY_RISK_PACKET_READY_NO_RUNTIME_CHANGES");
    expect(packet.route_count).toBe(12);
    expect(packet.scale_count).toBe(6);
    expect(packet.route_claim_risks).toHaveLength(12);
    expect(packet.scale_risk_summary).toHaveLength(6);
  });

  it("keeps claim risks aligned with the readiness packet", () => {
    const readinessKeys = new Set(
      readiness.hub_readiness.map((row: ReadinessRow) => `${row.scale_code}:${row.locale}:${row.claim_risk_notes}`)
    );
    for (const row of packet.route_claim_risks as RouteClaimRisk[]) {
      expect(readinessKeys.has(`${row.scale_code}:${row.locale}:${row.readiness_claim_risk_notes}`)).toBe(true);
      expect(row.forbidden_claims.length).toBeGreaterThanOrEqual(3);
      expect(row.safe_copy_direction.length).toBeGreaterThan(20);
    }
  });

  it("separates hard holds from review-first copy risks", () => {
    expect(packet.hard_hold_scales_before_copy_repair.sort()).toEqual([
      "BIG5_OCEAN",
      "EQ_60",
      "IQ_RAVEN",
    ]);
    expect(packet.review_first_scales_before_geo_aeo_amplification.sort()).toEqual([
      "ENNEAGRAM",
      "MBTI",
      "RIASEC",
    ]);
    expect(packet.risk_counts).toMatchObject({ P1: 2, P2: 10 });

    const big5 = (packet.scale_risk_summary as ScaleRiskSummary[]).find((row) => row.scale_code === "BIG5_OCEAN");
    if (!big5) throw new Error("Missing BIG5_OCEAN risk summary");
    expect(big5.highest_risk).toBe("P1");
    expect(big5.copy_gate_decision).toBe("HOLD_FOR_SOURCE_AUTHORITY_RECONCILIATION_BEFORE_COPY_PACKAGE");
    expect(big5.observed_backend_tiers).toEqual(["PAID"]);

    const iq = (packet.scale_risk_summary as ScaleRiskSummary[]).find((row) => row.scale_code === "IQ_RAVEN");
    const eq = (packet.scale_risk_summary as ScaleRiskSummary[]).find((row) => row.scale_code === "EQ_60");
    if (!iq) throw new Error("Missing IQ_RAVEN risk summary");
    if (!eq) throw new Error("Missing EQ_60 risk summary");
    expect(iq.observed_backend_forms_counts).toEqual([0]);
    expect(eq.observed_backend_forms_counts).toEqual([0]);
  });

  it("preserves negative guarantees and HOLD language", () => {
    expect(Object.values(packet.negative_guarantees).every((value) => value === false)).toBe(true);
    expect(packet.hold_actions).toContain("no_CMS_dry_run");
    expect(packet.hold_actions).toContain("no_deploy");
    expect(markdown).toContain("No CMS package generation");
    expect(markdown).toContain("No CMS package generation, CMS dry-run, CMS write, publish");
    expect(markdown).toContain("Docs/contracts-only");
  });

  it("aligns markdown and ledger state with PR3", () => {
    expect(markdown).toContain("Task: \`SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01\`");
    expect(markdown).toContain("CLAIM_COPY_RISK_PACKET_READY_NO_RUNTIME_CHANGES");

    const pr = (state.prs as TrainStatePr[]).find(
      (entry) => entry.id === "SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01"
    );
    if (!pr) throw new Error("Missing PR3 train state");
    expect([
      "pending_dependency",
      "in_progress",
      "local_checks_passed_ready_to_push",
      "pr_open_pending_github_checks",
      "ready_to_merge",
      "merged_reconciled_post_merge_cleanup_complete",
    ]).toContain(String(pr.status));
    expect(pr.artifacts).toContain("docs/seo/agent/six-hub-seo-geo-claim-copy-risk-packet.v1.json");
    expect(pr.scope_validation.allowed_files).toContain(
      "tests/contracts/six-hub-seo-geo-claim-copy-risk-packet.contract.test.ts"
    );
  });
});
