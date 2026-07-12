#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-04T12:00:00.000Z";
const GENERATED_DATE = "2026-07-04";

const INPUTS = {
  top10Profiles: "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
  comparison20: "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json",
  ops08: "docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-2026-07-04.json",
  discoverability: "docs/seo/personality/mbti-seo-07-discoverability-audit-2026-07-04.json",
  remaining58: "docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-2026-06-28.json",
  remaining58Qa: "docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-qa-2026-06-28.json",
};

const OUT_JSON = `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-${GENERATED_DATE}.json`;
const OUT_MD = `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-${GENERATED_DATE}.md`;
const OUT_CSV = `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-${GENERATED_DATE}.csv`;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(ROOT, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, relativePath), value);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function artifactPath(relativePath) {
  return relativePath;
}

function buildStateRows({ top10Profiles, comparison20, ops08, remaining58Qa }) {
  return [
    {
      state: "top10_profile_assets",
      asset_count: top10Profiles.summary.target_count,
      source_artifact: artifactPath(INPUTS.top10Profiles),
      authority_layer: "fap-api CMS/public personality profile authority",
      current_status: "non_production_cms_review_package_ready",
      next_pr: "MBTI-CMS-12",
      next_action: "Run backend profile import dry-run and schema/field mapping only.",
      gate: "No production CMS write until dry-run, QA, and operator approval pass.",
    },
    {
      state: "comparison20_assets",
      asset_count: comparison20.summary.target_count,
      source_artifact: artifactPath(INPUTS.comparison20),
      authority_layer: "fap-api CMS/public personality comparison authority",
      current_status: "non_production_cms_review_package_ready",
      next_pr: "MBTI-CMS-13",
      next_action: "Run backend comparison import dry-run and schema/field mapping only.",
      gate: "No production CMS write until dry-run, QA, and operator approval pass.",
    },
    {
      state: "remaining58",
      asset_count: remaining58Qa.summary.target_count,
      source_artifact: artifactPath(INPUTS.remaining58Qa),
      authority_layer: "content QA package, not runtime or CMS authority",
      current_status: "historical_review_input_ready_for_stronger_duplicate_gate",
      next_pr: "MBTI-QA-14",
      next_action: "Run stronger semantic quality, overlap, and template-risk QA before import planning.",
      gate: "Do not promote as CMS-ready until QA-14 passes against current query and content evidence.",
    },
    {
      state: "pending_gsc_query_export",
      asset_count: ops08.summary.query_export_pending_urls,
      source_artifact: artifactPath(INPUTS.ops08),
      authority_layer: "GSC evidence export, operator/API supplied",
      current_status: "pending_manual_or_api_query_evidence",
      next_pr: "MBTI-GSC-11",
      next_action: "Stabilize query evidence export packet so titles, FAQ, and answer blocks use real query data.",
      gate: "Stop if real GSC OAuth, credentials, or production Search Console mutation is required.",
    },
    {
      state: "pending_cms_import",
      asset_count: top10Profiles.summary.target_count + comparison20.summary.target_count,
      source_artifact: `${artifactPath(INPUTS.top10Profiles)}; ${artifactPath(INPUTS.comparison20)}`,
      authority_layer: "fap-api import dry-run only",
      current_status: "awaiting_backend_dry_run_no_production_write",
      next_pr: "MBTI-CMS-12 / MBTI-CMS-13",
      next_action: "Split profile and comparison import dry-runs in fap-api.",
      gate: "Production import is out of this train and requires exact approval.",
    },
  ];
}

function buildPrRoute() {
  return [
    {
      pr_id: "MBTI-ASSET-OPS-09",
      repo: "fap-web",
      scope: "Personality asset execution overview and batch SOP.",
      consumes_state: ["top10_profile_assets", "comparison20_assets", "remaining58", "pending_gsc_query_export", "pending_cms_import"],
      produces_state: ["asset_ops_sop_ready"],
      next_when_done: "MBTI-ASSET-SKILL-10",
    },
    {
      pr_id: "MBTI-ASSET-SKILL-10",
      repo: "fap-web",
      scope: "Optimize public-profile-seo-asset-factory MBTI runbook and agent matrix.",
      consumes_state: ["asset_ops_sop_ready"],
      produces_state: ["mbti_asset_factory_runbook_ready"],
      next_when_done: "MBTI-GSC-11",
    },
    {
      pr_id: "MBTI-GSC-11",
      repo: "fap-web",
      scope: "Stabilize GSC query evidence export artifacts without credentials or Search Console mutation.",
      consumes_state: ["pending_gsc_query_export", "mbti_asset_factory_runbook_ready"],
      produces_state: ["query_evidence_packet_ready_or_blocked_for_credentials"],
      next_when_done: "MBTI-CMS-12",
    },
    {
      pr_id: "MBTI-CMS-12",
      repo: "fap-api",
      scope: "Backend CMS profile import dry-run and schema/field mapping.",
      consumes_state: ["top10_profile_assets", "query_evidence_packet_ready_or_blocked_for_credentials"],
      produces_state: ["profile_import_dry_run_ready"],
      next_when_done: "MBTI-CMS-13",
    },
    {
      pr_id: "MBTI-CMS-13",
      repo: "fap-api",
      scope: "Backend CMS comparison import dry-run and schema/field mapping.",
      consumes_state: ["comparison20_assets", "profile_import_dry_run_ready"],
      produces_state: ["comparison_import_dry_run_ready"],
      next_when_done: "MBTI-QA-14",
    },
    {
      pr_id: "MBTI-QA-14",
      repo: "fap-web",
      scope: "Semantic quality and duplicate-risk gate for remaining58 and comparison batches.",
      consumes_state: ["remaining58", "comparison_import_dry_run_ready"],
      produces_state: ["semantic_duplicate_gate_ready"],
      next_when_done: null,
    },
  ];
}

function buildReport() {
  const top10Profiles = readJson(INPUTS.top10Profiles);
  const comparison20 = readJson(INPUTS.comparison20);
  const ops08 = readJson(INPUTS.ops08);
  const discoverability = readJson(INPUTS.discoverability);
  const remaining58 = readJson(INPUTS.remaining58);
  const remaining58Qa = readJson(INPUTS.remaining58Qa);

  const current_asset_status = buildStateRows({
    top10Profiles,
    comparison20,
    ops08,
    remaining58,
    remaining58Qa,
  });

  return {
    id: "MBTI-ASSET-OPS-09",
    title: "Personality asset execution overview and batch SOP",
    train_name: "mbti-personality-asset-operations-train",
    generated_at: GENERATED_AT,
    status: "ready",
    final_decision: "PASS_MBTI_ASSET_OPS_09_PERSONALITY_ASSET_SOP_READY",
    input_artifacts: INPUTS,
    completed_foundation: {
      frontend_hub_and_templates: ["MBTI-SEO-01", "MBTI-SEO-02", "MBTI-SEO-03", "MBTI-SEO-05", "MBTI-SEO-07"],
      cms_review_packages: ["MBTI-CMS-04", "MBTI-CMS-06"],
      operations_monitoring: ["MBTI-OPS-08"],
    },
    summary: {
      top10_profile_assets: top10Profiles.summary.target_count,
      comparison20_assets: comparison20.summary.target_count,
      comparison20_at_pages: comparison20.summary.at_comparison_pages,
      comparison20_hot_cross_type_pages: comparison20.summary.hot_comparison_pages,
      remaining58_assets: remaining58Qa.summary.target_count,
      remaining58_duplicate_signature_group_count: remaining58Qa.summary.duplicate_signature_group_count,
      pending_gsc_query_exports: ops08.summary.query_export_pending_urls,
      captured_gsc_query_rows: ops08.summary.query_rows_captured,
      pending_cms_import_assets: top10Profiles.summary.target_count + comparison20.summary.target_count,
      sitemap_detail_expansion_allowed_now: false,
      llms_url_expansion_allowed_now: false,
    },
    current_asset_status,
    pr_execution_route: buildPrRoute(),
    indexability_and_discoverability_gate: {
      current_sitemap_detail_policy: discoverability.current_authority.sitemap_xml.detail_paths,
      current_llms_authority: discoverability.current_authority.llms_txt.source,
      release_gates_before_url_expansion: discoverability.release_gates_before_url_expansion,
      next_pr_for_discoverability: "MBTI-SEO-07 remains audit-only; future URL expansion requires separate explicit authorization.",
    },
    safety_boundary: {
      cms_write_attempted: false,
      production_import_attempted: false,
      production_deploy_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      canonical_noindex_jsonld_runtime_mutation_attempted: false,
      gsc_api_call_attempted: false,
      search_console_mutation_attempted: false,
      local_editorial_fallback_added: false,
    },
    blockers: [],
    recommended_next_pr: "MBTI-ASSET-SKILL-10",
  };
}

function buildMarkdown(report) {
  const stateTable = [
    "| State | Count | Current status | Authority | Next PR | Gate |",
    "| --- | ---: | --- | --- | --- | --- |",
    ...report.current_asset_status.map(
      (row) =>
        `| ${row.state} | ${row.asset_count} | ${row.current_status} | ${row.authority_layer} | ${row.next_pr} | ${row.gate} |`,
    ),
  ].join("\n");

  const routeTable = [
    "| PR | Repo | Scope | Consumes | Produces | Next |",
    "| --- | --- | --- | --- | --- | --- |",
    ...report.pr_execution_route.map(
      (row) =>
        `| ${row.pr_id} | ${row.repo} | ${row.scope} | ${row.consumes_state.join(", ")} | ${row.produces_state.join(", ")} | ${
          row.next_when_done ?? ""
        } |`,
    ),
  ].join("\n");

  return [
    "# MBTI-ASSET-OPS-09 Personality Asset SOP",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "## Decision",
    "",
    `- Final decision: ${report.final_decision}`,
    `- Train: ${report.train_name}`,
    `- Next PR: ${report.recommended_next_pr}`,
    "- Scope: documentation, generated asset-status artifacts, contract guard, and PR-train ledger only.",
    "- Runtime, CMS write/import, sitemap, llms, canonical, noindex, JSON-LD, GSC API, and deployment mutations are out of scope.",
    "",
    "## Current Asset Status",
    "",
    stateTable,
    "",
    "## PR Execution Route",
    "",
    routeTable,
    "",
    "## Discoverability Gate",
    "",
    `- Current llms authority: ${report.indexability_and_discoverability_gate.current_llms_authority}`,
    `- Current sitemap detail policy: ${report.indexability_and_discoverability_gate.current_sitemap_detail_policy}`,
    "- Do not widen sitemap or llms URL sets until CMS/backend import dry-run, public/indexable API flags, and exact route-source evidence are ready.",
    "",
    "## Safety Boundary",
    "",
    ...Object.entries(report.safety_boundary).map(([key, value]) => `- ${key}: ${value}`),
    "",
  ].join("\n");
}

function buildCsv(report) {
  const header = [
    "state",
    "asset_count",
    "source_artifact",
    "authority_layer",
    "current_status",
    "next_pr",
    "next_action",
    "gate",
  ];
  return [
    header.join(","),
    ...report.current_asset_status.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
    "",
  ].join("\n");
}

const report = buildReport();
writeText(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeText(OUT_MD, buildMarkdown(report));
writeText(OUT_CSV, buildCsv(report));

console.log(`Wrote ${OUT_JSON}`);
console.log(`Wrote ${OUT_MD}`);
console.log(`Wrote ${OUT_CSV}`);
