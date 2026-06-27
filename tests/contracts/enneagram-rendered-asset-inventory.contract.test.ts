import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const LEDGER_PATH = "docs/audits/enneagram-result-assets/01_rendered_asset_inventory.json";
const REPORT_PATH = "docs/audits/enneagram-result-assets/01_rendered_asset_inventory.md";

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
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function modulesByKey(ledger: Record<string, unknown>): Map<string, Record<string, unknown>> {
  const pages = asRecordArray(ledger.rendered_pages);
  const modules = pages.flatMap((page) => asRecordArray(page.modules));

  return new Map(modules.map((module) => [String(module.module_key), module]));
}

describe("Enneagram rendered asset inventory", () => {
  it("declares a read-only rendered inventory without runtime or production side effects", () => {
    const ledger = readJson(LEDGER_PATH);
    const boundary = asRecord(ledger.source_truth_boundary);

    expect(ledger.schema_version).toBe("fermatmind.enneagram_result_assets.rendered_inventory.v0.1");
    expect(ledger.verdict).toBe("RENDERED_ASSET_LEDGER_READY_FOR_MODULE_BATCH_THICKENING");
    expect(ledger.scale_code).toBe("ENNEAGRAM");
    expect(boundary).toMatchObject({
      frontend_role: "consumer_renderer_and_contract_ledger",
      backend_role: "content_asset_candidate_authority",
      content_generation_allowed: false,
      candidate_export_allowed: false,
      inactive_import_allowed: false,
      activation_allowed: false,
      runtime_switch_allowed: false,
      production_write_allowed: false,
      frontend_fallback_copy_allowed: false,
    });
  });

  it("maps the full backend-to-frontend content asset chain", () => {
    const ledger = readJson(LEDGER_PATH);
    const layers = asRecordArray(ledger.content_asset_chain);
    const layerIds = layers.map((layer) => layer.layer);
    const serialized = JSON.stringify(ledger);

    expect(layerIds).toEqual([
      "backend_source_ledger",
      "backend_asset_batches",
      "backend_candidate_and_import_harness",
      "backend_report_projection",
      "frontend_api_and_assembler",
      "frontend_renderer",
      "frontend_share_pdf_surfaces",
      "frontend_rendered_qa",
    ]);
    expect(serialized).toContain("backend/content_assets/enneagram/result_page/source_ledger/source_ledger.json");
    expect(serialized).toContain("backend/content_assets/enneagram/result_page/batch_1r_a/v0_1/assets.json");
    expect(serialized).toContain("backend/content_assets/enneagram/result_page/batch_1r_h/v0_1/assets.json");
    expect(serialized).toContain("EnneagramProductionEquivalentCandidatePayloadExporter.php");
    expect(serialized).toContain("EnneagramInactiveCandidateReleaseImporter.php");
    expect(serialized).toContain("lib/enneagram/resultAssembler.ts");
    expect(serialized).toContain("components/result/enneagram/EnneagramResultShell.tsx");
    expect(serialized).toContain("tests/e2e/enneagram-phase8c-production-equivalent-candidate-e2e.spec.ts");
  });

  it("inventories every rendered result-page module expected for module-by-module thickening", () => {
    const ledger = readJson(LEDGER_PATH);
    const pages = asRecordArray(ledger.rendered_pages);
    const modules = modulesByKey(ledger);

    expect(pages.map((page) => page.page_key)).toEqual([
      "page_1_result_overview",
      "page_2_work_reality",
      "page_3_growth_spectrum",
      "page_4_relationship_conflict",
      "page_5_method_observation_next",
    ]);
    expect([...modules.keys()]).toEqual(
      expect.arrayContaining([
        "instant_summary",
        "top3_cards",
        "type_deep_dive_summary",
        "all9_profile",
        "confidence_band_card",
        "dominance_gap_card",
        "close_call_card",
        "wing_hint_visual",
        "methodology_boundary_card",
        "work_style_summary",
        "collaboration_strengths",
        "collaboration_friction",
        "leadership_pattern",
        "managed_by_others",
        "workplace_trigger_points",
        "growth_axis",
        "strength_expression",
        "cost_expression",
        "stress_trigger",
        "recovery_action",
        "state_spectrum",
        "relationship_need",
        "relationship_strengths",
        "misread_by_others",
        "conflict_script",
        "communication_manual",
        "method_boundary",
        "seven_day_observation",
        "form_recommendation",
        "technical_note_link",
        "actions_pdf_retake_share",
      ])
    );
  });

  it("records concrete rendered gaps for scaffold copy, raw score display, raw metrics, localization, and share entry", () => {
    const ledger = readJson(LEDGER_PATH);
    const issues = asRecordArray(ledger.issue_ledger);
    const issuesById = new Map(issues.map((issue) => [String(issue.id), issue]));

    expect(issuesById.get("ENNEAGRAM-RESULT-ASSET-001")).toMatchObject({
      severity: "P0",
      type: "scaffold_copy_visible",
    });
    expect(asStringArray(issuesById.get("ENNEAGRAM-RESULT-ASSET-001")?.module_keys)).toContain("close_call_card");
    expect(String(issuesById.get("ENNEAGRAM-RESULT-ASSET-001")?.evidence)).toContain("当前只提供 scaffold 内容");

    expect(issuesById.get("ENNEAGRAM-RESULT-ASSET-002")).toMatchObject({
      severity: "P0",
      type: "raw_score_display_visible",
    });
    expect(String(issuesById.get("ENNEAGRAM-RESULT-ASSET-002")?.evidence)).toContain("10000");

    expect(issuesById.get("ENNEAGRAM-RESULT-ASSET-003")).toMatchObject({
      severity: "P1",
      type: "raw_metric_display_visible",
    });
    expect(asStringArray(issuesById.get("ENNEAGRAM-RESULT-ASSET-003")?.module_keys)).toContain("dominance_gap_card");

    expect(issuesById.get("ENNEAGRAM-RESULT-ASSET-004")).toMatchObject({
      type: "localized_type_label_gap",
    });
    expect(issuesById.get("ENNEAGRAM-RESULT-ASSET-006")).toMatchObject({
      type: "share_entry_gap",
    });
  });

  it("sets the module-batch execution order and forbidden claim families", () => {
    const ledger = readJson(LEDGER_PATH);
    const batches = asRecordArray(ledger.module_batch_plan);

    expect(batches.map((batch) => batch.batch_id)).toEqual([
      "ENNEAGRAM-RESULT-MODULE-BATCH-01",
      "ENNEAGRAM-RESULT-MODULE-BATCH-02",
      "ENNEAGRAM-RESULT-MODULE-BATCH-03",
      "ENNEAGRAM-RESULT-MODULE-BATCH-04",
      "ENNEAGRAM-RESULT-MODULE-BATCH-05",
      "ENNEAGRAM-RESULT-MODULE-BATCH-06",
      "ENNEAGRAM-RESULT-MODULE-BATCH-07",
    ]);
    expect(asStringArray(batches[0].module_keys)).toEqual(["instant_summary", "top3_cards", "type_deep_dive_summary"]);
    expect(asStringArray(batches[1].module_keys)).toEqual(["all9_profile", "confidence_band_card", "dominance_gap_card"]);
    expect(asStringArray(batches[2].module_keys)).toEqual(["close_call_card", "wing_hint_visual"]);
    expect(asStringArray(batches[3].blocked_claims)).toEqual(
      expect.arrayContaining(["hiring_screening", "salary_prediction", "performance_prediction"])
    );
    expect(asStringArray(batches[4].blocked_claims)).toEqual(
      expect.arrayContaining(["diagnosis", "therapy_treatment", "fixed_health_level"])
    );
    expect(asStringArray(batches[6].blocked_claims)).toEqual(
      expect.arrayContaining(["fc144_more_accurate", "private_attempt_id_public_leak", "pdf_private_link_leak"])
    );
  });

  it("defines future full-rendered validation requirements and keeps this PR deferred from mutation", () => {
    const ledger = readJson(LEDGER_PATH);
    const contract = asRecord(ledger.validation_contract);

    expect(asStringArray(contract.future_full_rendered_inventory_must_check)).toEqual(
      expect.arrayContaining([
        "no_scaffold_copy_visible",
        "no_raw_score_display_visible",
        "no_profile_entropy_display_visible",
        "no_dominance_gap_raw_metric_visible",
        "no_attempt_id_visible",
        "no_release_hash_visible",
        "no_final_type_certainty_claim",
        "no_diagnosis_or_treatment_claim",
        "share_surface_public_safe_when_enabled",
        "pdf_surface_private_safe_when_enabled",
        "module_distinctiveness_by_type_and_scope",
      ])
    );
    expect(asStringArray(ledger.deferred)).toEqual(
      expect.arrayContaining([
        "No candidate payload generation.",
        "No backend inactive import.",
        "No production activation.",
        "No runtime switch.",
        "No CMS write.",
        "No frontend renderer behavior change.",
      ])
    );
  });

  it("keeps the markdown summary aligned with the JSON ledger", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `RENDERED_ASSET_LEDGER_READY_FOR_MODULE_BATCH_THICKENING`");
    expect(report).toContain("The backend content asset chain exists");
    expect(report).toContain("Close-call");
    expect(report).toContain("Raw-like score display visible");
    expect(report).toContain("All 9 profile and score-band translation");
    expect(report).toContain("Relationship and conflict");
    expect(report).toContain("No candidate payload generation.");
    expect(report).toContain("No frontend renderer behavior change.");
  });
});
