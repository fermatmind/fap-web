#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T13:10:00.000Z";
const SOURCE_JSON = "docs/seo/personality/mbti-content-15-top-blocker-assets-2026-07-05.json";
const OUT_JSON = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.csv";

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

function normalizeLocale(locale) {
  return locale === "zh" ? "zh-CN" : locale;
}

function mapProfilePackage(pkg) {
  const isVerifyOnly = pkg.status === "verify_only_no_body_rewrite";
  const sectionKeys = pkg.sections.map((section) => section.key);
  const faqCount = pkg.faq.length;
  const linkCount = pkg.internal_links.length;
  const validationErrors = [];

  if (!pkg.path.startsWith("/zh/personality/")) validationErrors.push("PROFILE_PATH_NOT_ZH_PERSONALITY");
  if (pkg.entity_type !== "personality_profile_variant") validationErrors.push("NOT_PROFILE_VARIANT");
  if (!isVerifyOnly && sectionKeys.length < 8) validationErrors.push("MISSING_PROFILE_SECTION_SET");
  if (!isVerifyOnly && faqCount < 8) validationErrors.push("MISSING_PROFILE_FAQ_SET");
  if (linkCount < 5) validationErrors.push("MISSING_PROFILE_INTERNAL_LINKS");
  if (pkg.robots !== "noindex,follow") validationErrors.push("SOURCE_NOT_HELD_NOINDEX");
  if (pkg.index_eligible || pkg.sitemap_eligible || pkg.llms_eligible) validationErrors.push("SOURCE_INDEX_GATE_OPEN");

  return {
    record_id: `mbti-cms-16:${pkg.slug}`,
    source_artifact_id: "MBTI-CONTENT-15",
    source_path: SOURCE_JSON,
    target_path: pkg.path,
    target_url: pkg.target_url,
    locale: normalizeLocale(pkg.locale),
    framework: pkg.framework,
    entity_type: pkg.entity_type,
    code: pkg.code,
    slug: pkg.slug,
    cms_resource: "personality_profile",
    dry_run_operation: isVerifyOnly ? "verify_existing_profile_projection_only" : "upsert_profile_content_draft",
    approval_state: isVerifyOnly ? "verify_only_not_import_candidate" : "pending_operator_review",
    import_candidate: !isVerifyOnly,
    source_status: pkg.status ?? "repair_candidate",
    cms_key: {
      locale: normalizeLocale(pkg.locale),
      framework: "mbti",
      profile_code: pkg.code,
      slug: pkg.slug,
    },
    field_mapping: {
      title: "seo.title",
      meta_description: "seo.meta_description",
      h1: "display.heading",
      summary: "summary",
      canonical: "seo.canonical_url",
      robots: "seo.robots",
      sections: "content_sections[]",
      faq: "faq_items[]",
      internal_links: "related_links[]",
      method_boundary: "safety.method_boundary",
      schema: "seo.structured_data_recommendations",
      evidence_notes: "editorial.evidence_notes",
    },
    dry_run_payload: isVerifyOnly
      ? {
          title: pkg.title,
          summary: pkg.summary,
          existing_projection_check: pkg.verification_notes,
          internal_links: pkg.internal_links,
          no_body_rewrite: true,
        }
      : {
          title: pkg.title,
          summary: pkg.summary,
          seo: pkg.seo,
          canonical: pkg.canonical,
          hreflang: pkg.hreflang,
          robots: pkg.robots,
          launch_state: "draft_pending_import_approval",
          index_eligible: false,
          sitemap_eligible: false,
          llms_eligible: false,
          sections: pkg.sections,
          faq: pkg.faq,
          internal_links: pkg.internal_links,
          schema: pkg.schema,
          method_boundary: pkg.method_boundary,
          evidence_notes: pkg.evidence_notes,
        },
    validation: {
      status: validationErrors.length === 0 ? "pass" : "fail",
      errors: validationErrors,
      section_count: sectionKeys.length,
      faq_count: faqCount,
      internal_link_count: linkCount,
      private_result_boundary_ok: Object.values(pkg.method_boundary).every((value) => value === false),
      indexability_held: !pkg.index_eligible && !pkg.sitemap_eligible && !pkg.llms_eligible && pkg.robots === "noindex,follow",
    },
    required_approval_before_import: !isVerifyOnly,
    production_write_allowed: false,
  };
}

function buildReport(source) {
  if (source.final_decision !== "PASS_MBTI_CONTENT_15_READY_FOR_FAP_API_DRY_RUN") {
    throw new Error(`Unexpected CONTENT-15 source decision: ${source.final_decision}`);
  }

  const sourceProfiles = source.packages.filter((pkg) => pkg.entity_type === "personality_profile_variant");
  const records = sourceProfiles.map(mapProfilePackage);
  const blockers = records.flatMap((record) =>
    record.validation.errors.map((error) => `${record.target_path}:${error}`),
  );

  const report = {
    id: "MBTI-CMS-16",
    artifact: "MBTI-CMS-16-PROFILE-DRY-RUN-APPROVAL-PACKAGE",
    generated_at: GENERATED_AT,
    source_artifact: {
      id: source.id,
      path: SOURCE_JSON,
      final_decision: source.final_decision,
      package_count: source.summary.package_count,
    },
    status: blockers.length === 0 ? "ready_for_backend_dry_run_review" : "blocked_by_validation",
    final_decision:
      blockers.length === 0
        ? "PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY"
        : "FAIL_PROFILE_DRY_RUN_APPROVAL_PACKAGE",
    summary: {
      profile_record_count: records.length,
      import_candidate_count: records.filter((record) => record.import_candidate).length,
      verify_only_count: records.filter((record) => !record.import_candidate).length,
      locale_count: new Set(records.map((record) => record.locale)).size,
      validation_failure_count: blockers.length,
    },
    schema_mapping: {
      authority: "fap-api CMS personality_profile import dry-run",
      source_of_truth_after_approval: "backend CMS/API",
      frontend_role: "render CMS/API output only",
      profile_key_fields: ["locale", "framework", "profile_code", "slug"],
      required_payload_fields: [
        "title",
        "summary",
        "seo",
        "canonical",
        "robots",
        "sections",
        "faq",
        "internal_links",
        "method_boundary",
      ],
      nullable_or_review_only_fields: ["hreflang", "schema", "evidence_notes"],
    },
    qa_gates: {
      source_content15_passed: { status: "pass" },
      cms_write_blocked: { status: "pass" },
      production_import_blocked: { status: "pass" },
      indexability_held: { status: blockers.some((item) => item.includes("INDEX")) ? "fail" : "pass" },
      profile_schema_mapping_present: { status: "pass" },
      operator_approval_required: { status: "pass" },
    },
    safety_boundary: {
      artifact_only: true,
      dry_run_package_only: true,
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
    blockers,
    approval_packet: {
      reviewer_action: "Review import candidates, field mapping, safety boundaries, and validation before any fap-api dry-run/import work.",
      approval_required_for: records
        .filter((record) => record.import_candidate)
        .map((record) => record.target_path),
      verify_only_not_imported: records
        .filter((record) => !record.import_candidate)
        .map((record) => record.target_path),
      next_allowed_task: "MBTI-CMS-17 after MBTI-CMS-16 is merged; fap-api production import remains separately unauthorized.",
    },
    recommended_next_task: "MBTI-CMS-17 comparison dry-run approval package",
  };

  return report;
}

function markdown(report) {
  const lines = [
    "# MBTI-CMS-16 Profile Dry-Run Approval Package",
    "",
    "This is a non-production backend/CMS review packet derived from CONTENT-15 profile assets.",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Profile records: ${report.summary.profile_record_count}`,
    `- Import candidates: ${report.summary.import_candidate_count}`,
    `- Verify-only records: ${report.summary.verify_only_count}`,
    `- Validation failures: ${report.summary.validation_failure_count}`,
    "",
    "## Scope Boundary",
    "",
    "- No CMS write.",
    "- No production import.",
    "- No frontend runtime or editorial fallback change.",
    "- No sitemap, llms, GSC, search submission, or deploy action.",
    "",
    "## Approval Queue",
    "",
    "| Path | Code | Operation | Approval state | Sections | FAQ | Links |",
    "| --- | --- | --- | --- | ---: | ---: | ---: |",
  ];

  for (const record of report.records) {
    lines.push(
      `| ${record.target_path} | ${record.code} | ${record.dry_run_operation} | ${record.approval_state} | ${record.validation.section_count} | ${record.validation.faq_count} | ${record.validation.internal_link_count} |`,
    );
  }

  lines.push(
    "",
    "## Field Mapping",
    "",
    ...Object.entries(report.records[0]?.field_mapping ?? {}).map(([source, target]) => `- \`${source}\` -> \`${target}\``),
    "",
    "## Blockers",
    "",
    report.blockers.length === 0 ? "- None." : report.blockers.map((blocker) => `- ${blocker}`).join("\n"),
    "",
  );

  return lines.join("\n");
}

function csv(report) {
  const header = [
    "target_path",
    "code",
    "locale",
    "dry_run_operation",
    "approval_state",
    "import_candidate",
    "section_count",
    "faq_count",
    "internal_link_count",
    "validation_status",
  ];
  const rows = report.records.map((record) => [
    record.target_path,
    record.code,
    record.locale,
    record.dry_run_operation,
    record.approval_state,
    record.import_candidate,
    record.validation.section_count,
    record.validation.faq_count,
    record.validation.internal_link_count,
    record.validation.status,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

const outputJson = argValue("output-json", OUT_JSON);
const outputMd = argValue("output-md", OUT_MD);
const outputCsv = argValue("output-csv", OUT_CSV);
const report = buildReport(readJson(SOURCE_JSON));

writeFile(outputJson, JSON.stringify(report, null, 2) + "\n");
writeFile(outputMd, markdown(report));
writeFile(outputCsv, csv(report));

console.log(
  JSON.stringify({
    ok: report.final_decision === "PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY",
    artifact: report.artifact,
    output_json: outputJson,
    output_md: outputMd,
    output_csv: outputCsv,
    profile_record_count: report.summary.profile_record_count,
    import_candidate_count: report.summary.import_candidate_count,
    verify_only_count: report.summary.verify_only_count,
    final_decision: report.final_decision,
  }),
);
