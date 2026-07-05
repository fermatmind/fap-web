#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T16:25:00.000Z";
const SOURCE_JSON = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.json";
const SOURCE_PR_URL = "https://github.com/fermatmind/fap-web/pull/1617";
const SOURCE_MERGE_COMMIT = "a3c10a2d2120e9ad0543656c699ac8749c123368";
const OUT_JSON = "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-23-production-import-authorization-package-2026-07-05.csv";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeFile(relativePath, body) {
  const absolute = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, body);
}

function sha256Json(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function requireCms22Ready(source) {
  const blockers = [];
  if (source.final_decision !== "PASS_CMS_IMPORT_DRY_RUN_FINAL_READY_FOR_AUTHORIZATION_PACKAGE") {
    blockers.push(`CMS22_DECISION_NOT_READY:${source.final_decision}`);
  }
  if (source.summary?.import_record_count !== 9) blockers.push("CMS22_IMPORT_RECORD_COUNT_MISMATCH");
  if (source.summary?.validation_failure_count !== 0) blockers.push("CMS22_VALIDATION_FAILURES_PRESENT");
  if (source.exact_package?.production_write_allowed !== false) blockers.push("CMS22_WRITE_GATE_NOT_CLOSED");
  if (!/^[a-f0-9]{64}$/.test(source.exact_package?.package_sha256 ?? "")) blockers.push("CMS22_PACKAGE_HASH_MISSING");
  if (!Array.isArray(source.records) || source.records.length !== 9) blockers.push("CMS22_RECORDS_MISSING");

  for (const record of source.records ?? []) {
    if (record.schema_validation?.status !== "pass") blockers.push(`${record.target_path}:SCHEMA_NOT_PASS`);
    if (!/^[a-f0-9]{64}$/.test(record.exact_payload_sha256 ?? "")) {
      blockers.push(`${record.target_path}:PAYLOAD_HASH_MISSING`);
    }
    if (record.dry_run_payload?.payload?.robots !== "noindex,follow") {
      blockers.push(`${record.target_path}:INDEXABILITY_NOT_HELD`);
    }
  }

  return blockers;
}

function authorizationRecord(record) {
  return {
    authorization_record_id: `mbti-cms-23:${record.kind}:${record.slug}`,
    source_dry_run_record_id: record.dry_run_record_id,
    target_path: record.target_path,
    target_url: record.target_url,
    kind: record.kind,
    locale: record.locale,
    slug: record.slug,
    code: record.code,
    cms_resource: record.cms_resource,
    cms_key: record.cms_key,
    import_action: record.import_action,
    exact_payload_sha256: record.exact_payload_sha256,
    required_schema_status: record.schema_validation.status,
    faq_count: record.schema_validation.faq_count,
    section_keys: record.schema_validation.section_keys,
    indexability_held_before_import: record.schema_validation.indexability_held,
    production_import_authorized: false,
    operator_review_required: true,
  };
}

function buildReport(source) {
  const blockers = requireCms22Ready(source);
  const records = (source.records ?? []).map(authorizationRecord);
  const profileRecords = records.filter((record) => record.kind === "profile");
  const comparisonRecords = records.filter((record) => record.kind === "comparison");
  const approvalPayload = {
    source_package_id: source.exact_package.package_id,
    source_package_sha256: source.exact_package.package_sha256,
    source_merge_commit: SOURCE_MERGE_COMMIT,
    import_scope: {
      mode: "top_blocker_batch_only",
      profiles: profileRecords.map((record) => record.target_path),
      comparisons: comparisonRecords.map((record) => record.target_path),
      excluded_verify_only: source.final_import_scope.verify_only_not_imported,
    },
    records: records.map((record) => ({
      target_path: record.target_path,
      kind: record.kind,
      cms_resource: record.cms_resource,
      exact_payload_sha256: record.exact_payload_sha256,
    })),
  };

  const authorizationPackage = {
    package_id: "mbti-cms-23-production-import-authorization-2026-07-05",
    generated_at: GENERATED_AT,
    status: "not_authorized",
    production_import_authorized: false,
    exact_authorization_payload_sha256: sha256Json(approvalPayload),
    source_package_id: source.exact_package.package_id,
    source_package_sha256: source.exact_package.package_sha256,
    source_artifact: SOURCE_JSON,
    source_pr_url: SOURCE_PR_URL,
    source_merge_commit: SOURCE_MERGE_COMMIT,
    import_scope_mode: "top_blocker_batch_only",
    records,
  };

  return {
    id: "MBTI-CMS-23",
    artifact: "MBTI-CMS-23-PRODUCTION-IMPORT-AUTHORIZATION-PACKAGE",
    generated_at: GENERATED_AT,
    status: blockers.length === 0 ? "ready_for_operator_authorization" : "blocked",
    final_decision: blockers.length === 0
      ? "READY_FOR_OPERATOR_AUTHORIZATION_NO_PRODUCTION_IMPORT_EXECUTED"
      : "NEEDS_REVISION_BEFORE_OPERATOR_AUTHORIZATION",
    source_artifact: {
      id: source.id,
      path: SOURCE_JSON,
      pr_url: SOURCE_PR_URL,
      merge_commit: SOURCE_MERGE_COMMIT,
      final_decision: source.final_decision,
      package_id: source.exact_package.package_id,
      package_sha256: source.exact_package.package_sha256,
    },
    summary: {
      authorization_record_count: records.length,
      profile_record_count: profileRecords.length,
      comparison_record_count: comparisonRecords.length,
      verify_only_excluded_count: source.final_import_scope.verify_only_not_imported.length,
      blocker_count: blockers.length,
      production_import_authorized: false,
    },
    import_scope: {
      mode: "top_blocker_batch_only",
      profiles: profileRecords.map((record) => record.target_path),
      comparisons: comparisonRecords.map((record) => record.target_path),
      excluded_verify_only: source.final_import_scope.verify_only_not_imported,
    },
    authorization_package: authorizationPackage,
    operator_authorization_required: {
      required: true,
      accepted_decision_values: ["authorized_for_production_import", "needs_revision", "hold"],
      required_fields: [
        "decision",
        "source_merge_commit",
        "source_package_sha256",
        "authorization_payload_sha256",
        "import_scope_mode",
        "record_count",
      ],
      exact_values: {
        source_merge_commit: SOURCE_MERGE_COMMIT,
        source_package_sha256: source.exact_package.package_sha256,
        authorization_payload_sha256: authorizationPackage.exact_authorization_payload_sha256,
        import_scope_mode: "top_blocker_batch_only",
        record_count: records.length,
      },
      production_import_command_allowed_after_authorization: false,
      note: "This PR generates the authorization package only. A later operator-approved task must name these exact values before any CMS write/import.",
    },
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      fap_api_change_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_submission_attempted: false,
      deploy_attempted: false,
    },
    blockers,
  };
}

function renderMarkdown(report) {
  const lines = [
    "# MBTI-CMS-23 Production Import Authorization Package",
    "",
    `Final decision: ${report.final_decision}`,
    "",
    "## Source",
    "",
    `- Source artifact: \`${report.source_artifact.path}\``,
    `- Source PR: ${report.source_artifact.pr_url}`,
    `- Source merge commit: \`${report.source_artifact.merge_commit}\``,
    `- Source package SHA256: \`${report.source_artifact.package_sha256}\``,
    "",
    "## Authorization Status",
    "",
    "- Production import authorized: `false`",
    "- Production CMS write executed: `false`",
    "- This artifact is an approval package only.",
    "",
    "## Required Exact Authorization Values",
    "",
    `- source_merge_commit: \`${report.operator_authorization_required.exact_values.source_merge_commit}\``,
    `- source_package_sha256: \`${report.operator_authorization_required.exact_values.source_package_sha256}\``,
    `- authorization_payload_sha256: \`${report.operator_authorization_required.exact_values.authorization_payload_sha256}\``,
    `- import_scope_mode: \`${report.operator_authorization_required.exact_values.import_scope_mode}\``,
    `- record_count: \`${report.operator_authorization_required.exact_values.record_count}\``,
    "",
    "## Import Scope",
    "",
    "### Profiles",
    ...report.import_scope.profiles.map((targetPath) => `- ${targetPath}`),
    "",
    "### Comparisons",
    ...report.import_scope.comparisons.map((targetPath) => `- ${targetPath}`),
    "",
    "### Excluded Verify-Only",
    ...report.import_scope.excluded_verify_only.map((targetPath) => `- ${targetPath}`),
    "",
    "## Operator Authorization Template",
    "",
    "```yaml",
    "decision: authorized_for_production_import",
    `source_merge_commit: ${report.operator_authorization_required.exact_values.source_merge_commit}`,
    `source_package_sha256: ${report.operator_authorization_required.exact_values.source_package_sha256}`,
    `authorization_payload_sha256: ${report.operator_authorization_required.exact_values.authorization_payload_sha256}`,
    "import_scope_mode: top_blocker_batch_only",
    `record_count: ${report.operator_authorization_required.exact_values.record_count}`,
    "```",
    "",
    "## Safety Boundary",
    "",
    "- No production CMS write/import was attempted.",
    "- No sitemap, llms, GSC, frontend runtime, DB migration, or deploy action was attempted.",
  ];
  return `${lines.join("\n")}\n`;
}

function renderCsv(report) {
  const header = [
    "target_path",
    "kind",
    "cms_resource",
    "locale",
    "slug",
    "code",
    "import_action",
    "payload_sha256",
    "production_import_authorized",
  ];
  const rows = report.authorization_package.records.map((record) => [
    record.target_path,
    record.kind,
    record.cms_resource,
    record.locale,
    record.slug,
    record.code,
    record.import_action,
    record.exact_payload_sha256,
    record.production_import_authorized,
  ]);
  return `${[header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`;
}

const source = readJson(SOURCE_JSON);
const report = buildReport(source);
writeFile(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFile(OUT_MD, renderMarkdown(report));
writeFile(OUT_CSV, renderCsv(report));

console.log(JSON.stringify({
  ok: report.blockers.length === 0,
  artifact: report.artifact,
  output_json: OUT_JSON,
  output_md: OUT_MD,
  output_csv: OUT_CSV,
  final_decision: report.final_decision,
  authorization_record_count: report.summary.authorization_record_count,
  production_import_authorized: false,
}, null, 2));
