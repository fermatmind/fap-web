import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const JSON_PATH = "docs/seo/agent/six-hub-seo-geo-package-readiness-packet.v1.json";
const DOC_PATH = "docs/seo/agent/six-hub-seo-geo-package-readiness-packet-2026-06-25.md";
const STATE_PATH = "docs/codex/pr-train-state.json";

const REQUIRED_FIELDS = [
  "scale_code", "locale", "url", "current_title", "current_meta_description", "current_h1", "canonical", "robots",
  "hreflang_count", "hreflang_values", "sitemap_presence", "llms_presence", "llms_full_presence", "jsonld_types",
  "visible_faq_status", "visible_free_full_report_claim", "visible_paywall_contradiction_or_paid_unlock_copy",
  "visible_methodology_boundary_note", "current_cta_take_labels", "current_internal_links_sample",
  "current_method_trust_science_links_count", "current_career_personality_article_links_count",
  "backend_lookup_status", "backend_lookup_is_indexable", "backend_commercial_price_tier", "backend_forms_count",
  "source_authority_classification", "latest_assessment_hub_qa_status", "package_readiness_verdict",
  "claim_risk_level", "seo_geo_priority_rank", "recommended_next_lane",
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

describe("Six Hub SEO/GEO package readiness packet", () => {
  it("preserves the scan verdict and 12-Hub readiness surface", () => {
    const packet = readJson(JSON_PATH);
    const conclusions = asRecord(packet.preserved_scan_conclusions);
    const rows = asRecordArray(packet.hub_readiness);
    expect(packet.schema_version).toBe("fermatmind.six_hub_seo_geo_package.readiness_packet.v1");
    expect(packet.task_id).toBe("SIX-HUB-SEO-GEO-PACKAGE-READINESS-PACKET-01");
    expect(packet.verdict).toBe("SIX_HUB_SEO_GEO_PACKAGE_READINESS_PARTIAL_NO_HARD_HOLD");
    expect(asStringArray(packet.depends_on)).toEqual(["SIX-HUB-SEO-GEO-PACKAGE-COMMON-CONTRACT-01"]);
    expect(packet.route_count).toBe(12);
    expect(rows).toHaveLength(12);
    expect(conclusions).toMatchObject({ all_12_hubs_indexable_and_discoverable: true, public_get_200_count: 12, public_get_failed_count: 0, sitemap_status: 200, llms_status: 200, llms_full_status: 200, lookup_200_count: 12, iq_indexability_mismatch_reproduced: false, cms_dry_run_authorized: false, runtime_copy_repair_authorized: false, search_submission_authorized: false });
  });

  it("includes every required readiness field for each Hub/locale row", () => {
    const packet = readJson(JSON_PATH);
    const rows = asRecordArray(packet.hub_readiness);
    for (const row of rows) {
      for (const field of REQUIRED_FIELDS) {
        expect(row, "missing " + field + " on " + row.scale_code + ":" + row.locale).toHaveProperty(field);
      }
      expect(row.backend_lookup_status).toBe(200);
      expect(row.backend_lookup_is_indexable).toBe(true);
      expect(row.robots).toBe("index, follow");
      expect(row.sitemap_presence).toBe(true);
      expect(row.llms_presence).toBe(true);
      expect(row.llms_full_presence).toBe(true);
      expect(Number(row.hreflang_count)).toBeGreaterThanOrEqual(3);
      expect(asStringArray(row.current_cta_take_labels).length).toBeGreaterThan(0);
    }
  });

  it("preserves scale-level readiness and known blockers", () => {
    const packet = readJson(JSON_PATH);
    const rows = asRecordArray(packet.hub_readiness);
    const byScale = new Map(rows.map((row) => [String(row.scale_code), row]));
    expect(byScale.get("MBTI")?.package_readiness_verdict).toBe("READY_WITH_P2_COPY_RISK");
    expect(byScale.get("RIASEC")?.package_readiness_verdict).toBe("READY_WITH_P2_COPY_RISK");
    expect(byScale.get("ENNEAGRAM")?.package_readiness_verdict).toBe("READY_WITH_P2_COPY_RISK");
    expect(byScale.get("BIG5_OCEAN")?.package_readiness_verdict).toBe("NEEDS_SOURCE_AUTHORITY_RECONCILIATION");
    expect(byScale.get("IQ_RAVEN")?.package_readiness_verdict).toBe("NEEDS_CLAIM_COPY_FIX");
    expect(byScale.get("EQ_60")?.package_readiness_verdict).toBe("NEEDS_CLAIM_COPY_FIX");
    expect(byScale.get("BIG5_OCEAN")?.backend_commercial_price_tier).toBe("PAID");
    expect(byScale.get("IQ_RAVEN")?.backend_forms_count).toBe(0);
    expect(byScale.get("EQ_60")?.backend_forms_count).toBe(0);
  });

  it("keeps HOLD actions and negative guarantees explicit", () => {
    const packet = readJson(JSON_PATH);
    const guarantees = asRecord(packet.negative_guarantees);
    expect(asStringArray(packet.hold_actions)).toEqual(expect.arrayContaining(["no_CMS_package_generation", "no_CMS_dry_run", "no_CMS_write", "no_publish", "no_runtime_copy_change", "no_backend_API_repair", "no_search_submission", "no_provider_call", "no_deploy", "no_sitemap_llms_schema_hreflang_canonical_noindex_mutation", "no_private_result_or_attempt_access", "no_attempt_creation", "no_answer_submission"]));
    expect(guarantees).toMatchObject({ cms_package_generated: false, cms_dry_run_performed: false, cms_write_performed: false, runtime_changed: false, public_copy_changed: false, backend_api_changed: false, search_submission_performed: false, provider_call_performed: false, deployment_triggered: false, private_data_accessed: false });
  });

  it("aligns markdown and ledger state with PR2", () => {
    const doc = readText(DOC_PATH);
    const state = readJson(STATE_PATH);
    const prs = asRecordArray(state.prs);
    expect(doc).toContain("Verdict: `SIX_HUB_SEO_GEO_PACKAGE_READINESS_PARTIAL_NO_HARD_HOLD`");
    expect(doc).toContain("`IQ_RAVEN` indexability mismatch did not reproduce.");
    expect(doc).toContain("`BIG5_OCEAN` zh/en: `NEEDS_SOURCE_AUTHORITY_RECONCILIATION`");
    expect(doc).toContain("No CMS package generation, CMS dry-run, CMS write, publish");
    expect(prs.some((pr) => pr.id === "SIX-HUB-SEO-GEO-PACKAGE-COMMON-CONTRACT-01" && pr.status === "merged_reconciled_post_merge_cleanup_complete")).toBe(true);
    expect(
      prs.some(
        (pr) =>
          pr.id === "SIX-HUB-SEO-GEO-PACKAGE-READINESS-PACKET-01" &&
          [
            "in_progress",
            "local_checks_passed_ready_to_push",
            "pr_open_pending_github_checks",
            "ready_to_merge",
          ].includes(String(pr.status))
      )
    ).toBe(true);
  });
});
