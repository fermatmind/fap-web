#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T15:35:00.000Z";
const PROFILE_PACKAGE_JSON = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.json";
const PROFILE_REVIEW_JSON = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.json";
const COMPARISON_PACKAGE_JSON = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.json";
const COMPARISON_REVIEW_JSON = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.json";
const OUT_JSON = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.csv";

const PROFILE_SECTION_KEYS = [
  "direct_answer",
  "who_it_fits",
  "who_it_does_not_fit",
  "common_misunderstanding",
  "at_difference",
  "career_scenario",
  "relationship_scenario",
  "stress_scenario",
];

const COMPARISON_SECTION_KEYS = [
  "direct_answer",
  "quick_judgment_table",
  "easy_misread",
  "real_scenario_differences",
  "do_not_misjudge",
  "next_reading",
];

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

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

function sha256Json(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function sectionKeys(record) {
  return (record.dry_run_payload.sections ?? []).map((section) => section.key);
}

function isSlugForPath(record) {
  return record.target_path === `/zh/personality/${record.slug}`;
}

function hasSeoFields(record) {
  const payload = record.dry_run_payload ?? {};
  return Boolean(payload.seo?.title) &&
    Boolean(payload.seo?.meta_description) &&
    Boolean(payload.seo?.primary_query) &&
    payload.canonical === record.target_url &&
    payload.robots === "noindex,follow";
}

function hasSafeFaq(record, minCount) {
  const faq = record.dry_run_payload.faq ?? [];
  return faq.length >= minCount &&
    faq.every((item) => String(item.question ?? "").trim() && String(item.answer ?? "").trim());
}

function hasIndexabilityHeld(record) {
  const payload = record.dry_run_payload ?? {};
  return payload.index_eligible === false &&
    payload.sitemap_eligible === false &&
    payload.llms_eligible === false &&
    payload.robots === "noindex,follow" &&
    record.validation?.indexability_held === true;
}

function hasCleanBoundary(record) {
  const values = Object.values(record.dry_run_payload.method_boundary ?? {});
  return values.length > 0 &&
    values.every((value) => value === false) &&
    record.production_write_allowed === false;
}

function validateBaseRecord(record) {
  const errors = [];
  if (record.locale !== "zh-CN") errors.push("INVALID_LOCALE");
  if (record.cms_key?.framework !== "mbti") errors.push("INVALID_CMS_FRAMEWORK");
  if (!record.target_path.startsWith("/zh/personality/")) errors.push("INVALID_TARGET_PATH");
  if (!isSlugForPath(record)) errors.push("SLUG_PATH_MISMATCH");
  if (!record.target_url.startsWith("https://fermatmind.com/zh/personality/")) errors.push("INVALID_TARGET_URL");
  if (!hasSeoFields(record)) errors.push("SEO_FIELDS_INCOMPLETE");
  if (!hasIndexabilityHeld(record)) errors.push("INDEXABILITY_NOT_HELD");
  if (!hasCleanBoundary(record)) errors.push("BOUNDARY_NOT_CLEAN");
  if (record.required_approval_before_import !== true) errors.push("MISSING_IMPORT_APPROVAL_GATE");
  return errors;
}

function validateProfile(record) {
  const errors = validateBaseRecord(record);
  const keys = sectionKeys(record);
  for (const key of PROFILE_SECTION_KEYS) {
    if (!keys.includes(key)) errors.push(`MISSING_PROFILE_SECTION_${key}`);
  }
  if (!hasSafeFaq(record, 8)) errors.push("PROFILE_FAQ_INCOMPLETE");
  if ((record.dry_run_payload.internal_links ?? []).length < 5) errors.push("PROFILE_INTERNAL_LINKS_INCOMPLETE");
  if (record.cms_resource !== "personality_profile") errors.push("INVALID_PROFILE_RESOURCE");
  if (record.dry_run_operation !== "upsert_profile_content_draft") errors.push("INVALID_PROFILE_OPERATION");
  if (!record.cms_key?.profile_code || record.cms_key.profile_code !== record.code) errors.push("PROFILE_CODE_MISMATCH");
  return errors;
}

function validateComparison(record) {
  const errors = validateBaseRecord(record);
  const keys = sectionKeys(record);
  for (const key of COMPARISON_SECTION_KEYS) {
    if (!keys.includes(key)) errors.push(`MISSING_COMPARISON_SECTION_${key}`);
  }
  if (!hasSafeFaq(record, 5)) errors.push("COMPARISON_FAQ_INCOMPLETE");
  if ((record.dry_run_payload.internal_links ?? []).length < 5) errors.push("COMPARISON_INTERNAL_LINKS_INCOMPLETE");
  if (record.cms_resource !== "personality_comparison") errors.push("INVALID_COMPARISON_RESOURCE");
  if (record.dry_run_operation !== "upsert_comparison_content_draft") errors.push("INVALID_COMPARISON_OPERATION");
  if (!Array.isArray(record.comparison_pair) || record.comparison_pair.length !== 2) errors.push("COMPARISON_PAIR_INCOMPLETE");
  if (record.cms_key?.left_code !== record.comparison_pair?.[0]) errors.push("LEFT_CODE_MISMATCH");
  if (record.cms_key?.right_code !== record.comparison_pair?.[1]) errors.push("RIGHT_CODE_MISMATCH");
  return errors;
}

function finalRecord(record, sourceReview, kind) {
  const errors = kind === "profile" ? validateProfile(record) : validateComparison(record);
  const payload = {
    cms_resource: record.cms_resource,
    dry_run_operation: record.dry_run_operation,
    cms_key: record.cms_key,
    payload: record.dry_run_payload,
  };

  return {
    dry_run_record_id: `mbti-cms-22:${kind}:${record.slug}`,
    source_record_id: record.record_id,
    source_review_id: sourceReview.id,
    kind,
    target_path: record.target_path,
    target_url: record.target_url,
    locale: record.locale,
    slug: record.slug,
    code: record.code,
    cms_resource: record.cms_resource,
    cms_key: record.cms_key,
    import_action: record.dry_run_operation,
    approval_state: "approved_for_final_dry_run",
    exact_payload_sha256: sha256Json(payload),
    schema_validation: {
      status: errors.length === 0 ? "pass" : "fail",
      errors,
      section_keys: sectionKeys(record),
      faq_count: record.dry_run_payload.faq?.length ?? 0,
      seo_title_present: Boolean(record.dry_run_payload.seo?.title),
      canonical_matches_target_url: record.dry_run_payload.canonical === record.target_url,
      indexability_held: hasIndexabilityHeld(record),
    },
    dry_run_payload: payload,
  };
}

function buildReport(profilePackage, profileReview, comparisonPackage, comparisonReview) {
  if (profileReview.final_decision !== "PASS_PROFILE_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN") {
    throw new Error(`Unexpected profile review decision: ${profileReview.final_decision}`);
  }
  if (comparisonReview.final_decision !== "PASS_COMPARISON_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN") {
    throw new Error(`Unexpected comparison review decision: ${comparisonReview.final_decision}`);
  }

  const approvedProfilePaths = new Set(profileReview.approval_lists.approved_for_final_dry_run);
  const verifyOnlyProfilePaths = new Set(profileReview.approval_lists.approved_verify_only);
  const approvedComparisonPaths = new Set(comparisonReview.approval_lists.approved_for_final_dry_run);

  const profileRecords = profilePackage.records
    .filter((record) => approvedProfilePaths.has(record.target_path))
    .map((record) => finalRecord(record, profileReview, "profile"));
  const comparisonRecords = comparisonPackage.records
    .filter((record) => approvedComparisonPaths.has(record.target_path))
    .map((record) => finalRecord(record, comparisonReview, "comparison"));
  const verifyOnlyRecords = profilePackage.records
    .filter((record) => verifyOnlyProfilePaths.has(record.target_path))
    .map((record) => ({
      target_path: record.target_path,
      code: record.code,
      reason: "approved_verify_only_no_body_import",
      no_body_rewrite: record.dry_run_payload.no_body_rewrite === true,
    }));

  const records = [...profileRecords, ...comparisonRecords];
  const blockers = records.flatMap((record) =>
    record.schema_validation.errors.map((error) => `${record.target_path}:${error}`),
  );

  const exactPackage = {
    package_id: "mbti-cms-22-final-dry-run-2026-07-05",
    generated_at: GENERATED_AT,
    target_environment: "fap-api CMS dry-run only",
    production_write_allowed: false,
    records: records.map((record) => ({
      dry_run_record_id: record.dry_run_record_id,
      cms_resource: record.cms_resource,
      cms_key: record.cms_key,
      import_action: record.import_action,
      exact_payload_sha256: record.exact_payload_sha256,
    })),
  };

  return {
    id: "MBTI-CMS-22",
    artifact: "MBTI-CMS-22-CMS-IMPORT-DRY-RUN-FINAL",
    generated_at: GENERATED_AT,
    source_artifacts: [
      { id: profilePackage.id, path: PROFILE_PACKAGE_JSON, final_decision: profilePackage.final_decision },
      { id: profileReview.id, path: PROFILE_REVIEW_JSON, final_decision: profileReview.final_decision },
      { id: comparisonPackage.id, path: COMPARISON_PACKAGE_JSON, final_decision: comparisonPackage.final_decision },
      { id: comparisonReview.id, path: COMPARISON_REVIEW_JSON, final_decision: comparisonReview.final_decision },
    ],
    status: blockers.length === 0 ? "final_dry_run_package_ready" : "blocked_by_final_schema_validation",
    final_decision: blockers.length === 0
      ? "PASS_CMS_IMPORT_DRY_RUN_FINAL_READY_FOR_AUTHORIZATION_PACKAGE"
      : "FAIL_CMS_IMPORT_DRY_RUN_FINAL",
    summary: {
      import_record_count: records.length,
      profile_import_count: profileRecords.length,
      comparison_import_count: comparisonRecords.length,
      verify_only_record_count: verifyOnlyRecords.length,
      validation_failure_count: blockers.length,
    },
    final_import_scope: {
      profiles: profileRecords.map((record) => record.target_path),
      comparisons: comparisonRecords.map((record) => record.target_path),
      verify_only_not_imported: verifyOnlyRecords.map((record) => record.target_path),
    },
    schema_gate: {
      locale: "zh-CN",
      profile_required_section_keys: PROFILE_SECTION_KEYS,
      comparison_required_section_keys: COMPARISON_SECTION_KEYS,
      required_checks: [
        "schema",
        "slug",
        "locale",
        "section_key",
        "faq",
        "seo",
        "canonical",
        "indexability_held",
        "production_write_blocked",
      ],
    },
    exact_package: {
      ...exactPackage,
      package_sha256: sha256Json(exactPackage),
    },
    safety_boundary: {
      artifact_only: true,
      final_dry_run_package_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    },
    records,
    verify_only_records: verifyOnlyRecords,
    blockers,
    recommended_next_task: "MBTI-CMS-23 production import authorization package; still do not execute production CMS import.",
  };
}

function markdown(report) {
  const lines = [
    "# MBTI-CMS-22 CMS Import Dry-Run Final",
    "",
    `Generated: ${report.generated_at}`,
    "",
    `Final decision: ${report.final_decision}`,
    "",
    "## Summary",
    "",
    `- Import records: ${report.summary.import_record_count}`,
    `- Profile imports: ${report.summary.profile_import_count}`,
    `- Comparison imports: ${report.summary.comparison_import_count}`,
    `- Verify-only not imported: ${report.summary.verify_only_record_count}`,
    `- Validation failures: ${report.summary.validation_failure_count}`,
    "",
    "## Exact Package",
    "",
    `- Package id: ${report.exact_package.package_id}`,
    `- Package SHA256: ${report.exact_package.package_sha256}`,
    `- Target: ${report.exact_package.target_environment}`,
    "- Production write allowed: false",
    "",
    "## Import Scope",
    "",
    "### Profiles",
    ...report.final_import_scope.profiles.map((item) => `- ${item}`),
    "",
    "### Comparisons",
    ...report.final_import_scope.comparisons.map((item) => `- ${item}`),
    "",
    "### Verify Only",
    ...report.final_import_scope.verify_only_not_imported.map((item) => `- ${item}`),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["- None."]),
  ];
  return `${lines.join("\n")}\n`;
}

function csv(report) {
  const header = [
    "target_path",
    "kind",
    "cms_resource",
    "locale",
    "slug",
    "code",
    "schema_status",
    "error_count",
    "payload_sha256",
  ];
  const rows = report.records.map((record) => [
    record.target_path,
    record.kind,
    record.cms_resource,
    record.locale,
    record.slug,
    record.code,
    record.schema_validation.status,
    record.schema_validation.errors.length,
    record.exact_payload_sha256,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

const outputJson = argValue("output-json", OUT_JSON);
const outputMd = argValue("output-md", OUT_MD);
const outputCsv = argValue("output-csv", OUT_CSV);

const report = buildReport(
  readJson(PROFILE_PACKAGE_JSON),
  readJson(PROFILE_REVIEW_JSON),
  readJson(COMPARISON_PACKAGE_JSON),
  readJson(COMPARISON_REVIEW_JSON),
);

writeFile(outputJson, JSON.stringify(report, null, 2) + "\n");
writeFile(outputMd, markdown(report));
writeFile(outputCsv, csv(report));

console.log(JSON.stringify({
  ok: report.blockers.length === 0,
  artifact: report.artifact,
  output_json: outputJson,
  output_md: outputMd,
  output_csv: outputCsv,
  import_record_count: report.summary.import_record_count,
  profile_import_count: report.summary.profile_import_count,
  comparison_import_count: report.summary.comparison_import_count,
  verify_only_record_count: report.summary.verify_only_record_count,
  final_decision: report.final_decision,
}, null, 2));
