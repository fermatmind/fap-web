import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetPath = path.join(repoRoot, "docs/seo/agent/six-hub-seo-geo-batch-sequence-matrix.v1.json");
const markdownPath = path.join(repoRoot, "docs/seo/agent/six-hub-seo-geo-batch-sequence-matrix-2026-06-25.md");
const aeoPath = path.join(repoRoot, "docs/seo/agent/six-hub-seo-geo-aeo-internal-link-packet.v1.json");
const statePath = path.join(repoRoot, "docs/codex/pr-train-state.json");

type ScaleBatchRow = {
  scale_code: string;
  batch_id: string;
  current_package_action: string;
  can_enter_cms_package_now: boolean;
  exit_gate: string;
};

type RouteBatchRow = {
  scale_code: string;
  locale: string;
  batch_id: string;
  package_action: string;
  aeo_answer_block_decision: string;
};

type AeoPacket = {
  hard_hold_scales_before_copy_repair: string[];
  review_first_scales_before_geo_aeo_amplification: string[];
};

type TrainStatePr = {
  id: string;
  status: string;
  artifacts: string[];
  scope_validation: {
    allowed_files: string[];
  };
};

describe("Six Hub SEO/GEO batch sequence matrix", () => {
  const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const aeo = JSON.parse(fs.readFileSync(aeoPath, "utf8")) as AeoPacket;
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

  it("records the expected packet identity and dependencies", () => {
    expect(packet.schema_version).toBe("fermatmind.six_hub_seo_geo_batch_sequence_matrix.v1");
    expect(packet.task_id).toBe("SIX-HUB-SEO-GEO-BATCH-SEQUENCE-MATRIX-01");
    expect(packet.verdict).toBe("BATCH_SEQUENCE_MATRIX_READY_NO_RUNTIME_CHANGES");
    expect(packet.depends_on).toEqual([
      "SIX-HUB-SEO-GEO-PACKAGE-READINESS-PACKET-01",
      "SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01",
      "SIX-HUB-SEO-GEO-AEO-INTERNAL-LINK-PACKET-01",
    ]);
    expect(packet.route_count).toBe(12);
    expect(packet.scale_count).toBe(6);
    expect(packet.batch_sequence).toHaveLength(4);
  });

  it("assigns scales to the intended batches", () => {
    expect(packet.batch_counts).toMatchObject({
      batch_1_review_first_core_hubs: 3,
      batch_2_big5_authority_repair: 1,
      batch_3_iq_eq_manual_review: 2,
      cross_hub_support_tracks: 4,
    });
    const byScale = new Map((packet.scale_batch_matrix as ScaleBatchRow[]).map((row) => [row.scale_code, row]));
    expect(byScale.get("MBTI")?.batch_id).toBe("BATCH_1_REVIEW_FIRST_CORE_HUBS");
    expect(byScale.get("RIASEC")?.batch_id).toBe("BATCH_1_REVIEW_FIRST_CORE_HUBS");
    expect(byScale.get("ENNEAGRAM")?.batch_id).toBe("BATCH_1_REVIEW_FIRST_CORE_HUBS");
    expect(byScale.get("BIG5_OCEAN")?.batch_id).toBe("BATCH_2_BIG5_AUTHORITY_REPAIR");
    expect(byScale.get("IQ_RAVEN")?.batch_id).toBe("BATCH_3_IQ_EQ_MANUAL_REVIEW");
    expect(byScale.get("EQ_60")?.batch_id).toBe("BATCH_3_IQ_EQ_MANUAL_REVIEW");
  });

  it("keeps hard holds out of Batch 1 and blocks CMS package entry for every scale", () => {
    const rows = packet.scale_batch_matrix as ScaleBatchRow[];
    const hardHoldRows = rows.filter((row) => aeo.hard_hold_scales_before_copy_repair.includes(row.scale_code));
    expect(hardHoldRows).toHaveLength(3);
    expect(hardHoldRows.every((row) => row.batch_id !== "BATCH_1_REVIEW_FIRST_CORE_HUBS")).toBe(true);
    expect(rows.every((row) => row.can_enter_cms_package_now === false)).toBe(true);
    expect(rows.find((row) => row.scale_code === "BIG5_OCEAN")?.current_package_action).toBe(
      "HOLD_FOR_COMMERCIAL_FIELD_AUTHORITY_RECONCILIATION"
    );
  });

  it("keeps review-first scales architecture-only before package generation", () => {
    const rows = packet.scale_batch_matrix as ScaleBatchRow[];
    const reviewRows = rows.filter((row) => aeo.review_first_scales_before_geo_aeo_amplification.includes(row.scale_code));
    expect(reviewRows).toHaveLength(3);
    expect(reviewRows.every((row) => row.current_package_action === "REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE")).toBe(true);
    expect(reviewRows.every((row) => row.exit_gate.length > 20)).toBe(true);
  });

  it("covers all 12 routes with batch and AEO decisions", () => {
    const routes = packet.route_batch_matrix as RouteBatchRow[];
    expect(routes).toHaveLength(12);
    expect(routes.filter((row) => row.batch_id === "BATCH_1_REVIEW_FIRST_CORE_HUBS")).toHaveLength(6);
    expect(routes.filter((row) => row.batch_id === "BATCH_2_BIG5_AUTHORITY_REPAIR")).toHaveLength(2);
    expect(routes.filter((row) => row.batch_id === "BATCH_3_IQ_EQ_MANUAL_REVIEW")).toHaveLength(4);
    expect(routes.every((row) => row.aeo_answer_block_decision.length > 10)).toBe(true);
  });

  it("preserves negative guarantees and HOLD language", () => {
    expect(Object.values(packet.negative_guarantees).every((value) => value === false)).toBe(true);
    expect(packet.hold_actions).toContain("no_CMS_dry_run");
    expect(packet.hold_actions).toContain("no_deploy");
    expect(markdown).toContain("No CMS package generation");
    expect(markdown).toContain("No CMS package generation, CMS dry-run, CMS write, publish");
    expect(markdown).toContain("Docs/contracts-only");
  });

  it("aligns markdown and ledger state with PR5", () => {
    expect(markdown).toContain("Task: `SIX-HUB-SEO-GEO-BATCH-SEQUENCE-MATRIX-01`");
    expect(markdown).toContain("BATCH_SEQUENCE_MATRIX_READY_NO_RUNTIME_CHANGES");

    const pr = (state.prs as TrainStatePr[]).find(
      (entry) => entry.id === "SIX-HUB-SEO-GEO-BATCH-SEQUENCE-MATRIX-01"
    );
    if (!pr) throw new Error("Missing PR5 train state");
    expect([
      "pending_dependency",
      "in_progress",
      "local_checks_passed_ready_to_push",
      "pr_open_pending_github_checks",
      "ready_to_merge",
      "merged_reconciled_post_merge_cleanup_complete",
    ]).toContain(String(pr.status));
    expect(pr.artifacts).toContain("docs/seo/agent/six-hub-seo-geo-batch-sequence-matrix.v1.json");
    expect(pr.scope_validation.allowed_files).toContain(
      "tests/contracts/six-hub-seo-geo-batch-sequence-matrix.contract.test.ts"
    );
  });
});
