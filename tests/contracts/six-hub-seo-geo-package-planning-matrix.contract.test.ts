import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetPath = path.join(repoRoot, "docs/seo/agent/six-hub-seo-geo-package-planning-matrix.v1.json");
const markdownPath = path.join(repoRoot, "docs/seo/agent/six-hub-seo-geo-package-planning-matrix-2026-06-25.md");
const batchPath = path.join(repoRoot, "docs/seo/agent/six-hub-seo-geo-batch-sequence-matrix.v1.json");
const statePath = path.join(repoRoot, "docs/codex/pr-train-state.json");

type PlanningRow = { scale_code: string; current_batch: string; can_generate_cms_package_now: boolean; final_package_decision: string; next_lane: string };
type BatchPacket = { batch_counts: Record<string, number> };
type TrainStatePr = { id: string; status: string; artifacts: string[]; scope_validation: { allowed_files: string[] } };

describe("Six Hub SEO/GEO package planning matrix", () => {
  const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const batch = JSON.parse(fs.readFileSync(batchPath, "utf8")) as BatchPacket;
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

  it("records final packet identity and dependencies", () => {
    expect(packet.schema_version).toBe("fermatmind.six_hub_seo_geo_package_planning_matrix.v1");
    expect(packet.task_id).toBe("SIX-HUB-SEO-GEO-PACKAGE-PLANNING-MATRIX-01");
    expect(packet.verdict).toBe("PACKAGE_PLANNING_MATRIX_COMPLETE_NO_RUNTIME_CHANGES");
    expect(packet.depends_on).toEqual([
      "SIX-HUB-SEO-GEO-PACKAGE-READINESS-PACKET-01",
      "SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01",
      "SIX-HUB-SEO-GEO-AEO-INTERNAL-LINK-PACKET-01",
      "SIX-HUB-SEO-GEO-BATCH-SEQUENCE-MATRIX-01",
    ]);
    expect(packet.route_count).toBe(12);
    expect(packet.scale_count).toBe(6);
  });

  it("preserves batch counts and blocks CMS package generation", () => {
    expect(packet.final_counts.review_first_scales).toBe(batch.batch_counts.batch_1_review_first_core_hubs);
    expect(packet.final_counts.big5_authority_repair_scales).toBe(1);
    expect(packet.final_counts.iq_eq_manual_review_scales).toBe(2);
    expect(packet.final_counts.cms_package_now_allowed).toBe(0);
    expect((packet.package_planning_matrix as PlanningRow[]).every((row) => row.can_generate_cms_package_now === false)).toBe(true);
  });

  it("chooses Big Five authority repair as the next lane", () => {
    expect(packet.final_next_lane_decision.next_task).toBe("BIG5-HUB-COMMERCIAL-FIELD-AUTHORITY-FIX-SCAN-01");
    const big5 = (packet.package_planning_matrix as PlanningRow[]).find((row) => row.scale_code === "BIG5_OCEAN");
    if (!big5) throw new Error("Missing Big Five planning row");
    expect(big5.current_batch).toBe("BATCH_2_BIG5_AUTHORITY_REPAIR");
    expect(big5.final_package_decision).toBe("HOLD_FOR_COMMERCIAL_FIELD_AUTHORITY_RECONCILIATION");
  });

  it("keeps final hold and negative guarantees", () => {
    expect(Object.values(packet.negative_guarantees).every((value) => value === false)).toBe(true);
    expect(packet.hold_actions).toContain("no_CMS_dry_run");
    expect(packet.hold_actions).toContain("no_deploy");
    expect(markdown).toContain("No CMS package generation");
    expect(markdown).toContain("Final next task: `BIG5-HUB-COMMERCIAL-FIELD-AUTHORITY-FIX-SCAN-01`");
    expect(markdown).toContain("Docs/contracts-only");
  });

  it("aligns ledger state with PR6", () => {
    const pr = (state.prs as TrainStatePr[]).find((entry) => entry.id === "SIX-HUB-SEO-GEO-PACKAGE-PLANNING-MATRIX-01");
    if (!pr) throw new Error("Missing PR6 train state");
    expect(["pending_dependency", "in_progress", "local_checks_passed_ready_to_push", "pr_open_pending_github_checks", "ready_to_merge", "merged_reconciled_post_merge_cleanup_complete"]).toContain(String(pr.status));
    expect(pr.artifacts).toContain("docs/seo/agent/six-hub-seo-geo-package-planning-matrix.v1.json");
    expect(pr.scope_validation.allowed_files).toContain("tests/contracts/six-hub-seo-geo-package-planning-matrix.contract.test.ts");
  });
});
