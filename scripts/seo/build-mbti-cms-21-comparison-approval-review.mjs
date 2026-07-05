#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T19:05:00.000Z";
const SOURCE_JSON = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.json";
const OUT_JSON = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-21-comparison-approval-review-2026-07-05.csv";

const REQUIRED_SECTION_KEYS = [
  "direct_answer",
  "quick_judgment_table",
  "easy_misread",
  "real_scenario_differences",
  "do_not_misjudge",
  "next_reading",
];

const REQUIRED_FIELD_MAPPING_KEYS = [
  "title",
  "meta_description",
  "h1",
  "summary",
  "comparison_pair",
  "canonical",
  "robots",
  "direct_answer",
  "quick_judgment_table",
  "easy_misread",
  "real_scenario_differences",
  "do_not_misjudge",
  "faq",
  "internal_links",
  "method_boundary",
];

const HOT_PRIORITY = [
  "/zh/personality/intp-a-vs-intp-t",
  "/zh/personality/intj-vs-intp",
  "/zh/personality/entj-vs-intj",
  "/zh/personality/infj-vs-infp",
  "/zh/personality/istj-vs-isfj",
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

function sectionMap(record) {
  return new Map((record.dry_run_payload.sections ?? []).map((section) => [section.key, section]));
}

function bodyLength(section) {
  return String(section?.body ?? "").trim().length;
}

function quickTableRows(record) {
  return sectionMap(record).get("quick_judgment_table")?.rows ?? [];
}

function reviewRecord(record) {
  const checks = [];
  const payload = record.dry_run_payload ?? {};
  const sections = sectionMap(record);
  const rows = quickTableRows(record);
  const faq = payload.faq ?? [];
  const faqText = faq.map((item) => `${item.question ?? ""} ${item.answer ?? ""}`).join("\n");
  const links = payload.internal_links ?? [];
  const pair = payload.comparison_pair ?? [];
  const methodBoundary = payload.method_boundary ?? {};

  checks.push(
    {
      key: "field_mapping_complete",
      status: REQUIRED_FIELD_MAPPING_KEYS.every((key) => Object.hasOwn(record.field_mapping ?? {}, key)) ? "pass" : "fail",
    },
    {
      key: "comparison_pair_complete",
      status: pair.length === 2 && pair.every((item) => typeof item === "string" && item.length >= 4) ? "pass" : "fail",
    },
    {
      key: "max_difference_present",
      status: sections.has("direct_answer") && bodyLength(sections.get("direct_answer")) >= 55 ? "pass" : "fail",
    },
    {
      key: "quick_judgment_table_present",
      status:
        rows.length >= 4 &&
        rows.every((row) => row.dimension && pair.every((code) => row[code]))
          ? "pass"
          : "fail",
    },
    {
      key: "easy_misread_present",
      status: bodyLength(sections.get("easy_misread")) >= 45 ? "pass" : "fail",
    },
    {
      key: "real_scenario_differences_present",
      status: bodyLength(sections.get("real_scenario_differences")) >= 55 ? "pass" : "fail",
    },
    {
      key: "do_not_misjudge_present",
      status: bodyLength(sections.get("do_not_misjudge")) >= 45 ? "pass" : "fail",
    },
    {
      key: "comparison_section_set_complete",
      status: REQUIRED_SECTION_KEYS.every((key) => sections.has(key)) ? "pass" : "fail",
    },
    {
      key: "faq_complete",
      status:
        faq.length >= 5 &&
        /最大区别/.test(faqText) &&
        /混淆/.test(faqText) &&
        /工作|场景/.test(faqText) &&
        /误判|犯什么错/.test(faqText) &&
        /职业|关系|决定/.test(faqText)
          ? "pass"
          : "fail",
    },
    {
      key: "internal_link_loop_complete",
      status:
        links.length >= 5 &&
        links.every((link) => link.safe_public_route) &&
        links.some((link) => link.href === "/zh/personality") &&
        links.some((link) => link.href === "/zh/tests/mbti-personality-test-16-personality-types")
          ? "pass"
          : "fail",
    },
    {
      key: "seo_fields_present",
      status:
        Boolean(payload.seo?.title) &&
        Boolean(payload.seo?.meta_description) &&
        Boolean(payload.seo?.primary_query) &&
        payload.canonical === record.target_url
          ? "pass"
          : "fail",
    },
    {
      key: "method_boundary_clean",
      status:
        Object.values(methodBoundary).every((value) => value === false) &&
        record.validation.private_result_boundary_ok === true
          ? "pass"
          : "fail",
    },
    {
      key: "indexability_still_held",
      status:
        payload.robots === "noindex,follow" &&
        payload.index_eligible === false &&
        payload.sitemap_eligible === false &&
        payload.llms_eligible === false &&
        record.validation.indexability_held === true
          ? "pass"
          : "fail",
    },
    {
      key: "production_write_blocked",
      status: record.production_write_allowed === false ? "pass" : "fail",
    },
  );

  const failed = checks.filter((check) => check.status === "fail").map((check) => check.key);

  return {
    target_path: record.target_path,
    code: record.code,
    locale: record.locale,
    comparison_kind: record.comparison_kind,
    comparison_pair: pair,
    priority_rank: HOT_PRIORITY.indexOf(record.target_path) + 1 || null,
    decision: failed.length === 0 ? "approved_for_final_dry_run" : "needs_revision",
    reasons: failed,
    checks,
    required_next_action: failed.length === 0
      ? "Eligible for MBTI-CMS-22 final import dry-run package; production import remains unauthorized."
      : "Repair listed comparison CMS entry criteria before final import dry-run.",
  };
}

function buildReport(source) {
  if (source.final_decision !== "PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY") {
    throw new Error(`Unexpected CMS-17 source decision: ${source.final_decision}`);
  }

  const reviews = source.records.map(reviewRecord);
  const needsRevision = reviews.filter((review) => review.decision === "needs_revision");
  const approved = reviews.filter((review) => review.decision === "approved_for_final_dry_run");
  const hotPriority = [...approved].sort((a, b) => (a.priority_rank ?? 999) - (b.priority_rank ?? 999));

  return {
    id: "MBTI-CMS-21",
    artifact: "MBTI-CMS-21-COMPARISON-APPROVAL-REVIEW",
    generated_at: GENERATED_AT,
    source_artifact: {
      id: source.id,
      path: SOURCE_JSON,
      final_decision: source.final_decision,
      comparison_record_count: source.summary.comparison_record_count,
    },
    status: needsRevision.length === 0 ? "comparison_review_approved" : "comparison_review_needs_revision",
    final_decision: needsRevision.length === 0
      ? "PASS_COMPARISON_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN"
      : "FAIL_COMPARISON_APPROVAL_REVIEW_NEEDS_REVISION",
    summary: {
      reviewed_comparison_count: reviews.length,
      approved_count: approved.length,
      needs_revision_count: needsRevision.length,
      at_comparison_count: reviews.filter((review) => review.comparison_kind === "at_comparison").length,
      hot_cross_type_count: reviews.filter((review) => review.comparison_kind.includes("hot_cross_type")).length,
    },
    cms_entry_standard: {
      required_field_mapping_keys: REQUIRED_FIELD_MAPPING_KEYS,
      required_section_keys: REQUIRED_SECTION_KEYS,
      required_faq_topics: [
        "maximum difference",
        "why easily confused",
        "work or real scenario",
        "do-not-misjudge warning",
        "non-diagnostic/non-decision boundary",
      ],
    },
    approval_lists: {
      approved_for_final_dry_run: approved.map((review) => review.target_path),
      needs_revision: needsRevision.map((review) => ({
        target_path: review.target_path,
        reasons: review.reasons,
      })),
    },
    hot_comparison_priority: hotPriority.map((review) => ({
      rank: review.priority_rank,
      target_path: review.target_path,
      comparison_kind: review.comparison_kind,
      comparison_pair: review.comparison_pair,
      recommended_next_action: review.required_next_action,
    })),
    safety_boundary: {
      artifact_only: true,
      comparison_review_only: true,
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
    reviews,
    blockers: needsRevision.flatMap((review) =>
      review.reasons.map((reason) => `${review.target_path}:${reason}`),
    ),
    recommended_next_task: "MBTI-CMS-22 CMS import dry-run final",
  };
}

function markdown(report) {
  const lines = [
    "# MBTI-CMS-21 Comparison Approval Review",
    "",
    "This review audits the MBTI-CMS-17 comparison approval package against comparison CMS entry criteria. It does not write CMS, import production data, mutate frontend runtime, expand sitemap/llms, or submit GSC.",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Reviewed comparisons: ${report.summary.reviewed_comparison_count}`,
    `- Approved: ${report.summary.approved_count}`,
    `- Needs revision: ${report.summary.needs_revision_count}`,
    `- A/T comparisons: ${report.summary.at_comparison_count}`,
    `- Hot cross-type comparisons: ${report.summary.hot_cross_type_count}`,
    "",
    "## Approved For Final Dry-Run",
    "",
    ...report.approval_lists.approved_for_final_dry_run.map((target) => `- ${target}`),
    "",
    "## Hot Comparison Priority",
    "",
    ...report.hot_comparison_priority.map((item) =>
      `${item.rank}. ${item.target_path} (${item.comparison_pair.join(" vs ")})`,
    ),
    "",
    "## Needs Revision",
    "",
    report.approval_lists.needs_revision.length === 0
      ? "- None."
      : report.approval_lists.needs_revision.map((item) => `- ${item.target_path}: ${item.reasons.join(", ")}`).join("\n"),
    "",
    "## Review Matrix",
    "",
    "| Path | Kind | Decision | Failed checks |",
    "| --- | --- | --- | --- |",
  ];

  for (const review of report.reviews) {
    lines.push(`| ${review.target_path} | ${review.comparison_kind} | ${review.decision} | ${review.reasons.join(", ") || "none"} |`);
  }

  lines.push(
    "",
    "## Boundary",
    "",
    "- No CMS write.",
    "- No production import.",
    "- No frontend runtime or editorial fallback change.",
    "- No sitemap, llms, GSC, search submission, or deploy action.",
    "",
  );

  return lines.join("\n");
}

function csv(report) {
  const header = ["target_path", "code", "comparison_kind", "priority_rank", "decision", "failed_checks", "required_next_action"];
  const rows = report.reviews.map((review) => [
    review.target_path,
    review.code,
    review.comparison_kind,
    review.priority_rank ?? "",
    review.decision,
    review.reasons.join(";"),
    review.required_next_action,
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
    ok: report.final_decision === "PASS_COMPARISON_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN",
    artifact: report.artifact,
    output_json: outputJson,
    output_md: outputMd,
    output_csv: outputCsv,
    reviewed_comparison_count: report.summary.reviewed_comparison_count,
    approved_count: report.summary.approved_count,
    needs_revision_count: report.summary.needs_revision_count,
    final_decision: report.final_decision,
  }),
);
