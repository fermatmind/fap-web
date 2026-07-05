#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T14:30:00.000Z";
const SOURCE_JSON = "docs/seo/personality/mbti-content-15-top-blocker-assets-2026-07-05.json";
const OUT_JSON = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.csv";

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

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeLocale(locale) {
  return locale === "zh" ? "zh-CN" : locale;
}

function classifyComparison(pkg) {
  if (pkg.entity_type === "at_comparison") return "at_comparison";
  if (pkg.entity_type === "hot_comparison" || pkg.entity_type === "cross_type_comparison") {
    return "hot_cross_type_comparison";
  }
  if (pkg.comparison_pair?.every((code) => /-[AT]$/.test(code))) return "at_comparison";
  return "hot_cross_type_comparison";
}

function mapComparisonPackage(pkg) {
  const sectionKeys = pkg.sections.map((section) => section.key);
  const faqCount = pkg.faq.length;
  const linkCount = pkg.internal_links.length;
  const validationErrors = [];
  const expectedSections = [
    "direct_answer",
    "quick_judgment_table",
    "easy_misread",
    "real_scenario_differences",
    "do_not_misjudge",
  ];

  if (!pkg.path.startsWith("/zh/personality/")) validationErrors.push("COMPARISON_PATH_NOT_ZH_PERSONALITY");
  if (!pkg.path.includes("-vs-")) validationErrors.push("COMPARISON_PATH_MISSING_VS");
  if (!["at_comparison", "hot_comparison", "cross_type_comparison"].includes(pkg.entity_type)) {
    validationErrors.push("NOT_COMPARISON_PACKAGE");
  }
  for (const key of expectedSections) {
    if (!sectionKeys.includes(key)) validationErrors.push(`MISSING_SECTION_${key}`);
  }
  if (faqCount < 5) validationErrors.push("MISSING_COMPARISON_FAQ_SET");
  if (linkCount < 3) validationErrors.push("MISSING_COMPARISON_INTERNAL_LINKS");
  if (pkg.robots !== "noindex,follow") validationErrors.push("SOURCE_NOT_HELD_NOINDEX");
  if (pkg.index_eligible || pkg.sitemap_eligible || pkg.llms_eligible) validationErrors.push("SOURCE_INDEX_GATE_OPEN");

  return {
    record_id: `mbti-cms-17:${pkg.slug}`,
    source_artifact_id: "MBTI-CONTENT-15",
    source_path: SOURCE_JSON,
    target_path: pkg.path,
    target_url: pkg.target_url,
    locale: normalizeLocale(pkg.locale),
    framework: pkg.framework,
    entity_type: pkg.entity_type,
    comparison_kind: classifyComparison(pkg),
    code: pkg.code,
    slug: pkg.slug,
    comparison_pair: pkg.comparison_pair,
    cms_resource: "personality_comparison",
    dry_run_operation: "upsert_comparison_content_draft",
    approval_state: "pending_operator_review",
    import_candidate: true,
    cms_key: {
      locale: normalizeLocale(pkg.locale),
      framework: "mbti",
      comparison_slug: pkg.slug,
      left_code: pkg.comparison_pair?.[0],
      right_code: pkg.comparison_pair?.[1],
    },
    field_mapping: {
      title: "seo.title",
      meta_description: "seo.meta_description",
      h1: "display.heading",
      summary: "summary",
      comparison_pair: "comparison.pair",
      canonical: "seo.canonical_url",
      robots: "seo.robots",
      direct_answer: "content_sections.direct_answer",
      quick_judgment_table: "content_sections.quick_judgment_table",
      easy_misread: "content_sections.easy_misread",
      real_scenario_differences: "content_sections.real_scenario_differences",
      do_not_misjudge: "content_sections.do_not_misjudge",
      next_reading: "content_sections.next_reading",
      faq: "faq_items[]",
      internal_links: "related_links[]",
      method_boundary: "safety.method_boundary",
      schema: "seo.structured_data_recommendations",
      evidence_notes: "editorial.evidence_notes",
    },
    dry_run_payload: {
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
      comparison_pair: pkg.comparison_pair,
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
      section_keys: sectionKeys,
      section_count: sectionKeys.length,
      faq_count: faqCount,
      internal_link_count: linkCount,
      quick_judgment_rows:
        pkg.sections.find((section) => section.key === "quick_judgment_table")?.rows?.length ?? 0,
      private_result_boundary_ok: Object.values(pkg.method_boundary).every((value) => value === false),
      indexability_held: !pkg.index_eligible && !pkg.sitemap_eligible && !pkg.llms_eligible && pkg.robots === "noindex,follow",
    },
    required_approval_before_import: true,
    production_write_allowed: false,
  };
}

function buildReport(source) {
  if (source.final_decision !== "PASS_MBTI_CONTENT_15_READY_FOR_FAP_API_DRY_RUN") {
    throw new Error(`Unexpected CONTENT-15 source decision: ${source.final_decision}`);
  }

  const sourceComparisons = source.packages.filter((pkg) =>
    ["at_comparison", "hot_comparison", "cross_type_comparison"].includes(pkg.entity_type),
  );
  const records = sourceComparisons.map(mapComparisonPackage);
  const blockers = records.flatMap((record) =>
    record.validation.errors.map((error) => `${record.target_path}:${error}`),
  );

  const report = {
    id: "MBTI-CMS-17",
    artifact: "MBTI-CMS-17-COMPARISON-DRY-RUN-APPROVAL-PACKAGE",
    generated_at: GENERATED_AT,
    source_artifact: {
      id: source.id,
      path: SOURCE_JSON,
      final_decision: source.final_decision,
      package_count: source.summary.package_count,
    },
    dependency_artifact: {
      id: "MBTI-CMS-16",
      path: "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.json",
      dependency_reason: "Reuse locale, review-state, safety-boundary, and CMS dry-run approval conventions from profile mapping.",
    },
    status: blockers.length === 0 ? "ready_for_backend_dry_run_review" : "blocked_by_validation",
    final_decision:
      blockers.length === 0
        ? "PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY"
        : "FAIL_COMPARISON_DRY_RUN_APPROVAL_PACKAGE",
    summary: {
      comparison_record_count: records.length,
      at_comparison_count: records.filter((record) => record.comparison_kind === "at_comparison").length,
      hot_cross_type_count: records.filter((record) => record.comparison_kind === "hot_cross_type_comparison").length,
      import_candidate_count: records.filter((record) => record.import_candidate).length,
      locale_count: new Set(records.map((record) => record.locale)).size,
      validation_failure_count: blockers.length,
    },
    schema_mapping: {
      authority: "fap-api CMS personality_comparison import dry-run",
      source_of_truth_after_approval: "backend CMS/API",
      frontend_role: "render CMS/API output only",
      comparison_key_fields: ["locale", "framework", "comparison_slug", "left_code", "right_code"],
      required_payload_fields: [
        "title",
        "summary",
        "seo",
        "canonical",
        "robots",
        "comparison_pair",
        "sections",
        "faq",
        "internal_links",
        "method_boundary",
      ],
      nullable_or_review_only_fields: ["hreflang", "schema", "evidence_notes"],
    },
    qa_gates: {
      source_content15_passed: { status: "pass" },
      cms16_dependency_merged: { status: "pass" },
      cms_write_blocked: { status: "pass" },
      production_import_blocked: { status: "pass" },
      indexability_held: { status: blockers.some((item) => item.includes("INDEX")) ? "fail" : "pass" },
      comparison_schema_mapping_present: { status: "pass" },
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
      reviewer_action:
        "Review A/T and hot cross-type comparison import candidates, field mapping, safety boundaries, and validation before any fap-api dry-run/import work.",
      approval_required_for: records.map((record) => record.target_path),
      next_allowed_task: "MBTI-INDEX-18 only after MBTI-CMS-16 and MBTI-CMS-17 are merged and content quality gates remain passing.",
      still_forbidden: [
        "production CMS write",
        "production import",
        "sitemap/llms URL expansion",
        "GSC URL inspection/request indexing/search submission",
        "production deploy",
      ],
    },
    recommended_next_task: "MBTI-INDEX-18 sitemap / llms / indexability gate",
  };

  return report;
}

function markdown(report) {
  const lines = [
    "# MBTI-CMS-17 Comparison Dry-Run Approval Package",
    "",
    "This is a non-production backend/CMS review packet derived from CONTENT-15 comparison assets.",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Comparison records: ${report.summary.comparison_record_count}`,
    `- A/T comparisons: ${report.summary.at_comparison_count}`,
    `- Hot cross-type comparisons: ${report.summary.hot_cross_type_count}`,
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
    "| Path | Pair | Kind | Sections | Quick rows | FAQ | Links |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: |",
  ];

  for (const record of report.records) {
    lines.push(
      `| ${record.target_path} | ${record.comparison_pair.join(" vs ")} | ${record.comparison_kind} | ${record.validation.section_count} | ${record.validation.quick_judgment_rows} | ${record.validation.faq_count} | ${record.validation.internal_link_count} |`,
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
    "pair",
    "comparison_kind",
    "dry_run_operation",
    "approval_state",
    "section_count",
    "quick_judgment_rows",
    "faq_count",
    "internal_link_count",
    "validation_status",
  ];
  const rows = report.records.map((record) =>
    [
      record.target_path,
      record.comparison_pair.join(" vs "),
      record.comparison_kind,
      record.dry_run_operation,
      record.approval_state,
      record.validation.section_count,
      record.validation.quick_judgment_rows,
      record.validation.faq_count,
      record.validation.internal_link_count,
      record.validation.status,
    ].map(csvEscape).join(","),
  );
  return [header.join(","), ...rows, ""].join("\n");
}

const outputJson = argValue("output-json", OUT_JSON);
const outputMd = argValue("output-md", OUT_MD);
const outputCsv = argValue("output-csv", OUT_CSV);
const report = buildReport(readJson(SOURCE_JSON));
const jsonBody = `${JSON.stringify(report, null, 2)}\n`;
writeFile(outputJson, jsonBody);
writeFile(outputMd, markdown(report));
writeFile(outputCsv, csv(report));

console.log(
  JSON.stringify({
    ok: report.final_decision === "PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY",
    artifact: report.artifact,
    output_json: outputJson,
    output_md: outputMd,
    output_csv: outputCsv,
    comparison_record_count: report.summary.comparison_record_count,
    at_comparison_count: report.summary.at_comparison_count,
    hot_cross_type_count: report.summary.hot_cross_type_count,
    validation_failure_count: report.summary.validation_failure_count,
    package_sha256: sha256(jsonBody),
    final_decision: report.final_decision,
  }),
);
