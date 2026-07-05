#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T16:00:00.000Z";
const CMS16_JSON = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.json";
const CMS17_JSON = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.json";
const OUT_JSON = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-index-18-sitemap-llms-indexability-gate-2026-07-05.csv";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeFile(targetPath, body) {
  const absolute = path.isAbsolute(targetPath) ? targetPath : path.join(ROOT, targetPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, body);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function recordKind(record) {
  if (record.cms_resource === "personality_profile") return "profile";
  if (record.cms_resource === "personality_comparison") return "comparison";
  return "unknown";
}

function dryRunPayload(record) {
  return record.dry_run_payload ?? {};
}

function gateRecord(record, sourceArtifact) {
  const payload = dryRunPayload(record);
  const qualityPass = record.validation?.status === "pass";
  const cmsReviewReady =
    ["pending_operator_review", "verify_only_not_import_candidate"].includes(record.approval_state) &&
    record.production_write_allowed === false;
  const productionPromoted = false;
  const robotsPolicy = payload.robots ?? (record.validation?.indexability_held ? "noindex,follow" : "unknown");
  const robotsHeld = robotsPolicy === "noindex,follow";
  const sourceEligibilityHeld =
    (payload.index_eligible === false && payload.sitemap_eligible === false && payload.llms_eligible === false) ||
    record.validation?.indexability_held === true;
  const canExpandNow = qualityPass && cmsReviewReady && productionPromoted && !robotsHeld && !sourceEligibilityHeld;

  const blockers = [];
  if (!qualityPass) blockers.push("quality_gate_failed");
  if (!cmsReviewReady) blockers.push("cms_review_not_ready");
  if (!productionPromoted) blockers.push("production_promotion_not_completed");
  if (robotsHeld) blockers.push("robots_noindex_follow");
  if (sourceEligibilityHeld) blockers.push("source_index_sitemap_llms_flags_false");

  return {
    target_path: record.target_path,
    target_url: record.target_url,
    asset_kind: recordKind(record),
    source_artifact: sourceArtifact,
    source_record_id: record.record_id,
    cms_resource: record.cms_resource,
    approval_state: record.approval_state,
    import_candidate: record.import_candidate === true,
    quality_gate: qualityPass ? "pass" : "fail",
    cms_review_gate: cmsReviewReady ? "pass" : "fail",
    production_promotion_gate: productionPromoted ? "pass" : "blocked",
    robots_policy: robotsPolicy,
    source_index_eligible: payload.index_eligible === true,
    source_sitemap_eligible: payload.sitemap_eligible === true,
    source_llms_eligible: payload.llms_eligible === true,
    sitemap_decision: canExpandNow ? "allow_future_runtime_expansion" : "hold_do_not_expand",
    llms_decision: canExpandNow ? "allow_future_runtime_expansion" : "hold_do_not_expand",
    llms_full_decision: "hold_until_visible_evidence_and_backend_authority",
    gsc_decision: "not_in_scope_do_not_submit",
    runtime_mutation_allowed_in_this_pr: false,
    blockers,
    next_required_action: canExpandNow
      ? "Open a runtime sitemap/llms implementation PR with backend authority evidence."
      : "Complete backend dry-run review, operator approval, production promotion, robots/indexability authority, and visible evidence before URL expansion.",
  };
}

function buildReport() {
  const cms16 = readJson(CMS16_JSON);
  const cms17 = readJson(CMS17_JSON);

  if (cms16.final_decision !== "PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY") {
    throw new Error(`Unexpected CMS16 decision: ${cms16.final_decision}`);
  }
  if (cms17.final_decision !== "PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY") {
    throw new Error(`Unexpected CMS17 decision: ${cms17.final_decision}`);
  }

  const records = [
    ...cms16.records.map((record) => gateRecord(record, "MBTI-CMS-16")),
    ...cms17.records.map((record) => gateRecord(record, "MBTI-CMS-17")),
  ];
  const expandableNow = records.filter(
    (record) => record.sitemap_decision === "allow_future_runtime_expansion" && record.llms_decision === "allow_future_runtime_expansion",
  );

  const report = {
    id: "MBTI-INDEX-18",
    artifact: "MBTI-INDEX-18-SITEMAP-LLMS-INDEXABILITY-GATE",
    generated_at: GENERATED_AT,
    source_artifacts: [
      {
        id: "MBTI-CMS-16",
        path: CMS16_JSON,
        final_decision: cms16.final_decision,
        record_count: cms16.summary.profile_record_count,
      },
      {
        id: "MBTI-CMS-17",
        path: CMS17_JSON,
        final_decision: cms17.final_decision,
        record_count: cms17.summary.comparison_record_count,
      },
    ],
    status: expandableNow.length === 0 ? "held_until_backend_promotion" : "ready_for_runtime_expansion_pr",
    final_decision:
      expandableNow.length === 0
        ? "PASS_INDEXABILITY_GATE_HELD_NO_URL_EXPANSION"
        : "PASS_INDEXABILITY_GATE_READY_FOR_SEPARATE_URL_EXPANSION_PR",
    summary: {
      checked_url_count: records.length,
      profile_url_count: records.filter((record) => record.asset_kind === "profile").length,
      comparison_url_count: records.filter((record) => record.asset_kind === "comparison").length,
      quality_pass_count: records.filter((record) => record.quality_gate === "pass").length,
      production_promotion_blocked_count: records.filter((record) => record.production_promotion_gate === "blocked").length,
      sitemap_expand_now_count: expandableNow.length,
      llms_expand_now_count: expandableNow.length,
      gsc_submit_now_count: 0,
    },
    gate_policy: {
      source_of_truth: "fap-api CMS/public APIs after operator-approved promotion",
      frontend_role: "consume backend sitemap/llms/indexability authority only",
      required_before_sitemap_or_llms_expansion: [
        "CMS dry-run approval package reviewed",
        "operator approval recorded",
        "backend import/promotion completed outside this PR",
        "robots policy changed to index,follow by backend authority",
        "index_eligible/sitemap_eligible/llms_eligible true from backend authority",
        "visible page evidence and JSON-LD/schema gates verified",
      ],
      gsc_submission: "deferred_to_MBTI_GSC_19_after_indexability_gate_allows_urls",
    },
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_runtime_mutation_attempted: false,
      llms_runtime_mutation_attempted: false,
      llms_full_runtime_mutation_attempted: false,
      canonical_noindex_jsonld_runtime_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submission_attempted: false,
      staging_deploy_wait_attempted: false,
      production_deploy_attempted: false,
    },
    records,
    expansion_queue: expandableNow.map((record) => record.target_path),
    held_queue: records.map((record) => record.target_path),
    blockers: records.flatMap((record) => record.blockers.map((blocker) => `${record.target_path}:${blocker}`)),
    recommended_next_task:
      expandableNow.length === 0
        ? "Complete backend approval/import promotion before MBTI-GSC-19 or any sitemap/llms runtime expansion."
        : "Open a separate sitemap/llms runtime expansion PR, then MBTI-GSC-19.",
  };

  return report;
}

function markdown(report) {
  const lines = [
    "# MBTI-INDEX-18 Sitemap / llms / Indexability Gate",
    "",
    "This is an artifact-only indexability gate for the MBTI profile and comparison approval packages.",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Checked URLs: ${report.summary.checked_url_count}`,
    `- Sitemap expand now: ${report.summary.sitemap_expand_now_count}`,
    `- llms expand now: ${report.summary.llms_expand_now_count}`,
    `- GSC submit now: ${report.summary.gsc_submit_now_count}`,
    "",
    "## Decision",
    "",
    "No sitemap, llms, llms-full, canonical, robots, JSON-LD, GSC, or production deployment mutation is allowed in this PR.",
    "",
    "## Gate Table",
    "",
    "| Path | Kind | Quality | Promotion | Robots | Sitemap | llms | Next |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const record of report.records) {
    lines.push(
      `| ${record.target_path} | ${record.asset_kind} | ${record.quality_gate} | ${record.production_promotion_gate} | ${record.robots_policy} | ${record.sitemap_decision} | ${record.llms_decision} | ${record.next_required_action} |`,
    );
  }

  lines.push(
    "",
    "## Required Before Expansion",
    "",
    ...report.gate_policy.required_before_sitemap_or_llms_expansion.map((item) => `- ${item}`),
    "",
    "## Blockers",
    "",
    report.blockers.length === 0 ? "- None." : report.blockers.map((blocker) => `- ${blocker}`).join("\n"),
    "",
    "## Next Task",
    "",
    report.recommended_next_task,
    "",
  );

  return lines.join("\n");
}

function csv(report) {
  const header = [
    "target_path",
    "asset_kind",
    "quality_gate",
    "production_promotion_gate",
    "robots_policy",
    "sitemap_decision",
    "llms_decision",
    "gsc_decision",
    "blockers",
  ];
  const rows = report.records.map((record) => [
    record.target_path,
    record.asset_kind,
    record.quality_gate,
    record.production_promotion_gate,
    record.robots_policy,
    record.sitemap_decision,
    record.llms_decision,
    record.gsc_decision,
    record.blockers.join(";"),
  ]);

  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

const report = buildReport();
writeFile(OUT_JSON, JSON.stringify(report, null, 2) + "\n");
writeFile(OUT_MD, markdown(report));
writeFile(OUT_CSV, csv(report));

console.log(JSON.stringify({
  artifact: report.artifact,
  final_decision: report.final_decision,
  checked_url_count: report.summary.checked_url_count,
  sitemap_expand_now_count: report.summary.sitemap_expand_now_count,
  llms_expand_now_count: report.summary.llms_expand_now_count,
  gsc_submit_now_count: report.summary.gsc_submit_now_count,
}, null, 2));
