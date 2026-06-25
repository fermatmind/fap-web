import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetPath = path.join(
  repoRoot,
  "docs/seo/agent/six-hub-seo-geo-aeo-internal-link-packet.v1.json"
);
const markdownPath = path.join(
  repoRoot,
  "docs/seo/agent/six-hub-seo-geo-aeo-internal-link-packet-2026-06-25.md"
);
const claimPath = path.join(
  repoRoot,
  "docs/seo/agent/six-hub-seo-geo-claim-copy-risk-packet.v1.json"
);
const statePath = path.join(repoRoot, "docs/codex/pr-train-state.json");

type RouteArchitecture = {
  scale_code: string;
  locale: string;
  claim_risk_severity: string;
  aeo_answer_block_decision: string;
  internal_link_decision: string;
  faq_schema_decision: string;
  allowed_answer_block_slots: string[];
  current_internal_link_families: {
    test_take_links_present: boolean;
    topic_links_present: boolean;
    personality_links_present: boolean;
    career_recommendation_links_present: boolean;
  };
};

type ScaleArchitecture = {
  scale_code: string;
  aeo_package_status: string;
  internal_link_status: string;
  route_count: number;
};

type ClaimPacket = {
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

describe("Six Hub SEO/GEO AEO internal link packet", () => {
  const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const claim = JSON.parse(fs.readFileSync(claimPath, "utf8")) as ClaimPacket;
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

  it("records the expected packet identity and route coverage", () => {
    expect(packet.schema_version).toBe("fermatmind.six_hub_seo_geo_aeo_internal_link_packet.v1");
    expect(packet.task_id).toBe("SIX-HUB-SEO-GEO-AEO-INTERNAL-LINK-PACKET-01");
    expect(packet.verdict).toBe("AEO_INTERNAL_LINK_PACKET_READY_NO_RUNTIME_CHANGES");
    expect(packet.depends_on).toEqual(["SIX-HUB-SEO-GEO-PACKAGE-COMMON-CONTRACT-01"]);
    expect(packet.route_count).toBe(12);
    expect(packet.scale_count).toBe(6);
    expect(packet.route_aeo_internal_link_matrix).toHaveLength(12);
    expect(packet.scale_architecture_summary).toHaveLength(6);
  });

  it("maps claim packet hard holds and review-first scales into AEO decisions", () => {
    expect(packet.hard_hold_scales_before_copy_repair.sort()).toEqual(
      claim.hard_hold_scales_before_copy_repair.sort()
    );
    expect(packet.review_first_scales_before_geo_aeo_amplification.sort()).toEqual(
      claim.review_first_scales_before_geo_aeo_amplification.sort()
    );
    expect(packet.decision_counts).toMatchObject({
      review_first_architecture_only_routes: 6,
      hard_hold_no_aeo_package_routes: 6,
      no_new_faq_schema_routes: 12,
      no_new_internal_link_expansion_routes: 6,
    });

    const hardHoldRows = (packet.route_aeo_internal_link_matrix as RouteArchitecture[]).filter((row) =>
      packet.hard_hold_scales_before_copy_repair.includes(row.scale_code)
    );
    expect(hardHoldRows).toHaveLength(6);
    expect(hardHoldRows.every((row) => row.aeo_answer_block_decision === "HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR")).toBe(true);
    expect(hardHoldRows.every((row) => row.allowed_answer_block_slots.length === 0)).toBe(true);
  });

  it("keeps review-first routes architecture-only with visible authority slots", () => {
    const reviewRows = (packet.route_aeo_internal_link_matrix as RouteArchitecture[]).filter((row) =>
      packet.review_first_scales_before_geo_aeo_amplification.includes(row.scale_code)
    );
    expect(reviewRows).toHaveLength(6);
    for (const row of reviewRows) {
      expect(row.aeo_answer_block_decision).toBe("REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET");
      expect(row.internal_link_decision).toBe("PRESERVE_EXISTING_LINKS_REVIEW_BEFORE_NEW_AEO_LINKING");
      expect(row.faq_schema_decision).toBe("NO_NEW_FAQ_SCHEMA_OR_HIDDEN_ANSWER_EXPANSION");
      expect(row.allowed_answer_block_slots).toContain("direct_answer_summary_from_visible_authority_only");
      expect(row.current_internal_link_families.test_take_links_present).toBe(true);
    }
  });

  it("summarizes scale-level AEO and link statuses", () => {
    const summaries = packet.scale_architecture_summary as ScaleArchitecture[];
    const byScale = new Map(summaries.map((row) => [row.scale_code, row]));
    expect(byScale.get("BIG5_OCEAN")?.aeo_package_status).toBe("HARD_HOLD");
    expect(byScale.get("IQ_RAVEN")?.internal_link_status).toBe("NO_NEW_LINK_EXPANSION");
    expect(byScale.get("EQ_60")?.internal_link_status).toBe("NO_NEW_LINK_EXPANSION");
    expect(byScale.get("MBTI")?.aeo_package_status).toBe("REVIEW_FIRST_ARCHITECTURE_ONLY");
    expect(byScale.get("RIASEC")?.route_count).toBe(2);
    expect(byScale.get("ENNEAGRAM")?.route_count).toBe(2);
  });

  it("preserves negative guarantees and HOLD language", () => {
    expect(Object.values(packet.negative_guarantees).every((value) => value === false)).toBe(true);
    expect(packet.hold_actions).toContain("no_CMS_dry_run");
    expect(packet.hold_actions).toContain("no_deploy");
    expect(markdown).toContain("No CMS package generation");
    expect(markdown).toContain("No CMS package generation, CMS dry-run, CMS write, publish");
    expect(markdown).toContain("Docs/contracts-only");
  });

  it("aligns markdown and ledger state with PR4", () => {
    expect(markdown).toContain("Task: `SIX-HUB-SEO-GEO-AEO-INTERNAL-LINK-PACKET-01`");
    expect(markdown).toContain("AEO_INTERNAL_LINK_PACKET_READY_NO_RUNTIME_CHANGES");

    const pr = (state.prs as TrainStatePr[]).find(
      (entry) => entry.id === "SIX-HUB-SEO-GEO-AEO-INTERNAL-LINK-PACKET-01"
    );
    if (!pr) throw new Error("Missing PR4 train state");
    expect([
      "pending_dependency",
      "in_progress",
      "local_checks_passed_ready_to_push",
      "pr_open_pending_github_checks",
      "ready_to_merge",
      "merged_reconciled_post_merge_cleanup_complete",
    ]).toContain(String(pr.status));
    expect(pr.artifacts).toContain("docs/seo/agent/six-hub-seo-geo-aeo-internal-link-packet.v1.json");
    expect(pr.scope_validation.allowed_files).toContain(
      "tests/contracts/six-hub-seo-geo-aeo-internal-link-packet.contract.test.ts"
    );
  });
});
