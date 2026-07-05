#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-05T18:20:00.000Z";
const SOURCE_JSON = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.json";
const OUT_JSON = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.json";
const OUT_MD = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-20-profile-approval-review-2026-07-05.csv";

const REQUIRED_SECTION_KEYS = [
  "direct_answer",
  "who_it_fits",
  "who_it_does_not_fit",
  "common_misunderstanding",
  "at_difference",
  "career_scenario",
  "relationship_scenario",
  "stress_scenario",
];

const REQUIRED_FIELD_MAPPING_KEYS = [
  "title",
  "meta_description",
  "h1",
  "summary",
  "canonical",
  "robots",
  "sections",
  "faq",
  "internal_links",
  "method_boundary",
];

const REQUIRED_PROFILE_LINKS = [
  { key: "hub", test: (href) => href === "/zh/personality" },
  { key: "mbti_test", test: (href) => href === "/zh/tests/mbti-personality-test-16-personality-types" },
  { key: "at_comparison", test: (href, slug) => href === `/zh/personality/${slug.replace(/-[at]$/, "")}-a-vs-${slug.replace(/-[at]$/, "")}-t` },
  { key: "opposite_variant", test: (href, slug) => href === `/zh/personality/${slug.endsWith("-a") ? slug.replace(/-a$/, "-t") : slug.replace(/-t$/, "-a")}` },
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

function hasAllRequiredLinks(record) {
  const hrefs = new Set((record.dry_run_payload.internal_links ?? []).map((link) => link.href));
  return REQUIRED_PROFILE_LINKS.every(({ test }) =>
    [...hrefs].some((href) => test(href, record.slug)),
  );
}

function reviewRecord(record) {
  const checks = [];
  const payload = record.dry_run_payload ?? {};
  const sections = sectionMap(record);
  const faq = payload.faq ?? [];
  const links = payload.internal_links ?? [];

  if (!record.import_candidate) {
    checks.push(
      { key: "verify_only_boundary", status: payload.no_body_rewrite === true ? "pass" : "fail" },
      { key: "verify_only_internal_links", status: links.length >= 5 && links.every((link) => link.safe_public_route) ? "pass" : "fail" },
      { key: "production_write_blocked", status: record.production_write_allowed === false ? "pass" : "fail" },
    );

    return {
      target_path: record.target_path,
      code: record.code,
      locale: record.locale,
      import_candidate: false,
      decision: checks.every((check) => check.status === "pass") ? "approved_verify_only" : "needs_revision",
      reasons: checks.filter((check) => check.status === "fail").map((check) => check.key),
      checks,
      required_next_action: checks.every((check) => check.status === "pass")
        ? "Keep as verify-only evidence; do not import profile body."
        : "Repair verify-only projection evidence before final dry-run.",
    };
  }

  const atRows = sections.get("at_difference")?.rows ?? [];
  const methodBoundary = payload.method_boundary ?? {};
  const faqText = faq.map((item) => `${item.question ?? ""} ${item.answer ?? ""}`).join("\n");

  checks.push(
    {
      key: "field_mapping_complete",
      status: REQUIRED_FIELD_MAPPING_KEYS.every((key) => Object.hasOwn(record.field_mapping ?? {}, key)) ? "pass" : "fail",
    },
    {
      key: "direct_answer_present",
      status: sections.has("direct_answer") && bodyLength(sections.get("direct_answer")) >= 100 ? "pass" : "fail",
    },
    {
      key: "profile_section_set_complete",
      status: REQUIRED_SECTION_KEYS.every((key) => sections.has(key)) ? "pass" : "fail",
    },
    {
      key: "fit_and_misfit_present",
      status:
        bodyLength(sections.get("who_it_fits")) >= 40 &&
        bodyLength(sections.get("who_it_does_not_fit")) >= 40
          ? "pass"
          : "fail",
    },
    {
      key: "common_misunderstanding_present",
      status: bodyLength(sections.get("common_misunderstanding")) >= 45 ? "pass" : "fail",
    },
    {
      key: "at_difference_table_present",
      status:
        bodyLength(sections.get("at_difference")) >= 50 &&
        atRows.length >= 3 &&
        atRows.every((row) => row.dimension && row.assertive && row.turbulent)
          ? "pass"
          : "fail",
    },
    {
      key: "career_relationship_pressure_present",
      status:
        bodyLength(sections.get("career_scenario")) >= 45 &&
        bodyLength(sections.get("relationship_scenario")) >= 35 &&
        bodyLength(sections.get("stress_scenario")) >= 45
          ? "pass"
          : "fail",
    },
    {
      key: "faq_complete",
      status:
        faq.length >= 8 &&
        /什么意思/.test(faqText) &&
        /区别/.test(faqText) &&
        /工作|职业/.test(faqText) &&
        /误解/.test(faqText) &&
        /关系/.test(faqText) &&
        /压力/.test(faqText) &&
        /诊断|招聘/.test(faqText)
          ? "pass"
          : "fail",
    },
    {
      key: "internal_link_loop_complete",
      status: links.length >= 5 && links.every((link) => link.safe_public_route) && hasAllRequiredLinks(record) ? "pass" : "fail",
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
    import_candidate: true,
    decision: failed.length === 0 ? "approved_for_final_dry_run" : "needs_revision",
    reasons: failed,
    checks,
    required_next_action: failed.length === 0
      ? "Eligible for MBTI-CMS-22 final import dry-run package; production import remains unauthorized."
      : "Repair listed CMS entry criteria before final import dry-run.",
  };
}

function buildReport(source) {
  if (source.final_decision !== "PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY") {
    throw new Error(`Unexpected CMS-16 source decision: ${source.final_decision}`);
  }

  const reviews = source.records.map(reviewRecord);
  const needsRevision = reviews.filter((review) => review.decision === "needs_revision");
  const approved = reviews.filter((review) => review.decision !== "needs_revision");
  const importApproved = reviews.filter((review) => review.decision === "approved_for_final_dry_run");

  return {
    id: "MBTI-CMS-20",
    artifact: "MBTI-CMS-20-PROFILE-APPROVAL-REVIEW",
    generated_at: GENERATED_AT,
    source_artifact: {
      id: source.id,
      path: SOURCE_JSON,
      final_decision: source.final_decision,
      profile_record_count: source.summary.profile_record_count,
    },
    status: needsRevision.length === 0 ? "profile_review_approved" : "profile_review_needs_revision",
    final_decision: needsRevision.length === 0
      ? "PASS_PROFILE_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN"
      : "FAIL_PROFILE_APPROVAL_REVIEW_NEEDS_REVISION",
    summary: {
      reviewed_profile_count: reviews.length,
      approved_count: approved.length,
      approved_import_candidate_count: importApproved.length,
      verify_only_approved_count: reviews.filter((review) => review.decision === "approved_verify_only").length,
      needs_revision_count: needsRevision.length,
    },
    cms_entry_standard: {
      required_field_mapping_keys: REQUIRED_FIELD_MAPPING_KEYS,
      required_section_keys: REQUIRED_SECTION_KEYS,
      required_profile_links: ["opposite_variant", "at_comparison", "hub", "mbti_test", "one_related_public_profile_or_comparison"],
      required_faq_topics: [
        "definition",
        "A/T difference",
        "career or work scene",
        "common misunderstanding",
        "relationship scene",
        "pressure or growth scene",
        "non-diagnostic/non-hiring boundary",
        "next internal-link action",
      ],
    },
    approval_lists: {
      approved_for_final_dry_run: importApproved.map((review) => review.target_path),
      approved_verify_only: reviews
        .filter((review) => review.decision === "approved_verify_only")
        .map((review) => review.target_path),
      needs_revision: needsRevision.map((review) => ({
        target_path: review.target_path,
        reasons: review.reasons,
      })),
    },
    safety_boundary: {
      artifact_only: true,
      profile_review_only: true,
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
    recommended_next_task: "MBTI-CMS-21 comparison approval review",
  };
}

function markdown(report) {
  const lines = [
    "# MBTI-CMS-20 Profile Approval Review",
    "",
    "This review audits the MBTI-CMS-16 profile approval package against CMS entry criteria. It does not write CMS, import production data, mutate frontend runtime, expand sitemap/llms, or submit GSC.",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Reviewed profiles: ${report.summary.reviewed_profile_count}`,
    `- Approved import candidates: ${report.summary.approved_import_candidate_count}`,
    `- Approved verify-only: ${report.summary.verify_only_approved_count}`,
    `- Needs revision: ${report.summary.needs_revision_count}`,
    "",
    "## Approved For Final Dry-Run",
    "",
    ...report.approval_lists.approved_for_final_dry_run.map((target) => `- ${target}`),
    "",
    "## Verify-Only Approved",
    "",
    ...report.approval_lists.approved_verify_only.map((target) => `- ${target}`),
    "",
    "## Needs Revision",
    "",
    report.approval_lists.needs_revision.length === 0
      ? "- None."
      : report.approval_lists.needs_revision.map((item) => `- ${item.target_path}: ${item.reasons.join(", ")}`).join("\n"),
    "",
    "## Review Matrix",
    "",
    "| Path | Decision | Failed checks |",
    "| --- | --- | --- |",
  ];

  for (const review of report.reviews) {
    lines.push(`| ${review.target_path} | ${review.decision} | ${review.reasons.join(", ") || "none"} |`);
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
  const header = ["target_path", "code", "decision", "import_candidate", "failed_checks", "required_next_action"];
  const rows = report.reviews.map((review) => [
    review.target_path,
    review.code,
    review.decision,
    review.import_candidate,
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
    ok: report.final_decision === "PASS_PROFILE_APPROVAL_REVIEW_READY_FOR_FINAL_DRY_RUN",
    artifact: report.artifact,
    output_json: outputJson,
    output_md: outputMd,
    output_csv: outputCsv,
    reviewed_profile_count: report.summary.reviewed_profile_count,
    approved_import_candidate_count: report.summary.approved_import_candidate_count,
    verify_only_approved_count: report.summary.verify_only_approved_count,
    needs_revision_count: report.summary.needs_revision_count,
    final_decision: report.final_decision,
  }),
);
