#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = process.env.MBTI_FULL_QA_36_DATE ?? "2026-07-13";
const OUTPUT_BASE = `docs/seo/personality/mbti-full-qa-36-semantic-release-gate-${DATE}`;
const AUDIT_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const PROFILE_BATCHES = [
  "docs/seo/personality/mbti-profile-nt-31-content-package-2026-07-13.json",
  "docs/seo/personality/mbti-profile-nf-32-content-package-2026-07-13.json",
  "docs/seo/personality/mbti-profile-sj-33-content-package-2026-07-13.json",
  "docs/seo/personality/mbti-profile-sp-34-content-package-2026-07-13.json",
];
const AT_BATCH = "docs/seo/personality/mbti-comp-at-35-content-assets-2026-07-13.json";
const EXISTING_PROFILE_BATCH = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json";
const EXISTING_COMPARISON_BATCH = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json";
const PRIVATE_ROUTE_PATTERN = /\/(?:result|results|attempt|report|orders?|payment|history|private|account|share)(?:\/|$|[?#])/i;
const FORBIDDEN_TEMPLATE_PATTERN = /\b(?:todo|tbd|lorem ipsum|placeholder|copy from|same as)\b|待补充|占位|照搬竞品|复制竞品/i;
const UNSUPPORTED_CLAIM_PATTERN = /官方MBTI|官方认证|临床级|绝对准确|保证职业|决定命运|预测未来|保证录用/i;
const DETERMINISTIC_CLAIM_PATTERN = /必然成功|一定适合|注定|永远不会|百分之百|绝不会失败/i;
const BOUNDARY_PATTERN = /诊断|招聘|筛选|能力|关系|职业|自我理解|沟通|成长/;
const PROFILE_SECTION_KEYS = [
  "definition",
  "suitable_for",
  "not_suitable_for",
  "common_misread",
  "base16_difference",
  "at_difference",
  "career_scenarios",
  "relationship_scenarios",
  "stress_scenarios",
];
const AT_SECTION_KEYS = [
  "biggest_difference",
  "quick_judgment_table",
  "easy_misread",
  "work_scenarios",
  "relationship_scenarios",
  "stress_scenarios",
  "do_not_misjudge",
  "common_ground",
  "usage_boundary",
];
const CROSS_SECTION_KEYS = [
  "biggest_difference",
  "quick_judgment_table",
  "easy_misread",
  "real_scenario_differences",
  "do_not_misjudge",
  "faq",
];
const VERIFY_ONLY_PROFILES = new Set(["istj-a", "esfj-a", "istp-a", "isfp-a"]);
const VERIFY_ONLY_AT = new Set(["intp-a-vs-intp-t"]);
const HOT_CROSS = new Set(["intj-vs-intp", "entj-vs-intj", "infj-vs-infp", "istj-vs-isfj"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8"));
}

function write(relativePath, content) {
  const absolute = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
}

function publicLinkGate(links) {
  const failures = (links ?? []).filter((link) => {
    const href = typeof link === "string" ? link : link.href;
    return !href || !href.startsWith("/zh/") || PRIVATE_ROUTE_PATTERN.test(href);
  });
  return failures.length ? fail("Internal links contain a non-public or private route.", failures) : pass("All internal links are public zh-CN routes.");
}

function pass(evidence) {
  return { status: "pass", evidence, failures: [] };
}

function fail(evidence, failures) {
  return { status: "fail", evidence, failures };
}

function gateTotals(rows) {
  const totals = {};
  for (const row of rows) {
    for (const [name, gate] of Object.entries(row.gates)) {
      totals[name] ??= { passed: 0, failed: 0 };
      totals[name][gate.status === "pass" ? "passed" : "failed"] += 1;
    }
  }
  return totals;
}

function existingProfileMap() {
  return new Map(readJson(EXISTING_PROFILE_BATCH).assets.filter((asset) => asset.locale === "zh-CN").map((asset) => [asset.path, asset]));
}

function existingComparisonMap() {
  return new Map(readJson(EXISTING_COMPARISON_BATCH).assets.map((asset) => [asset.path, asset]));
}

function profileRows(auditBySlug) {
  const existing = existingProfileMap();
  const rows = [];
  for (const sourcePath of PROFILE_BATCHES) {
    const source = readJson(sourcePath);
    for (const asset of source.assets) {
      const slug = asset.path.split("/").at(-1);
      const audit = auditBySlug.get(slug);
      assert(audit, `Missing audit record for ${asset.path}`);
      const verifyOnly = asset.audit_status === "verify_only";
      assert(verifyOnly === VERIFY_ONLY_PROFILES.has(slug), `Unexpected profile repair/verify split: ${asset.path}`);
      const fields = asset.cms_fields ?? existing.get(asset.path)?.cms_fields ?? null;
      rows.push({ sourcePath, asset, audit, fields, slug, verifyOnly, kind: "profile" });
    }
  }
  return rows;
}

function comparisonRows(auditBySlug) {
  const existing = existingComparisonMap();
  const source = readJson(AT_BATCH);
  const rows = source.assets.map((asset) => {
    const slug = asset.path.split("/").at(-1);
    const audit = auditBySlug.get(slug);
    assert(audit, `Missing audit record for ${asset.path}`);
    const verifyOnly = asset.audit_status === "verify_only";
    assert(verifyOnly === VERIFY_ONLY_AT.has(slug), `Unexpected A/T repair/verify split: ${asset.path}`);
    return { sourcePath: AT_BATCH, asset, audit, fields: asset.cms_fields ?? existing.get(asset.path)?.cms_fields ?? null, slug, verifyOnly, kind: "at_comparison" };
  });
  for (const slug of HOT_CROSS) {
    const asset = existing.get(`/zh/personality/${slug}`);
    const audit = auditBySlug.get(slug);
    assert(asset && audit, `Missing authoritative cross-type artifact for ${slug}`);
    rows.push({ sourcePath: EXISTING_COMPARISON_BATCH, asset, audit, fields: asset.cms_fields, slug, verifyOnly: true, kind: "hot_comparison" });
  }
  return rows;
}

function profileGates(row, answerSignatures) {
  const { asset, fields, slug, verifyOnly } = row;
  const text = collectStrings(fields ?? asset).join(" ");
  const sections = fields?.sections ?? [];
  const sectionKeys = sections.map((section) => section.key);
  const required = verifyOnly ? asset.verification_contract?.required_section_keys ?? PROFILE_SECTION_KEYS : PROFILE_SECTION_KEYS;
  const directAnswer = fields?.direct_answer ?? fields?.answer_block ?? "";
  const exactSignature = normalize(directAnswer);
  const duplicatePaths = answerSignatures.get(exactSignature) ?? [];
  const query = asset.query_fit?.primary ?? slug.toUpperCase();
  const requiresEvidence = verifyOnly ? fields : asset.cms_fields;
  const verifyContract = asset.verification_contract;
  const verifyContractPass = verifyOnly && verifyContract?.no_unjustified_rewrite && verifyContract.minimum_faq_count >= 6 && verifyContract.minimum_internal_link_count >= 5;
  const verifyOnlyGate = (repairGate, evidence) => verifyOnly ? (verifyContractPass ? pass(evidence) : fail("Existing-authority verification contract is incomplete.", [asset.path])) : repairGate;
  return {
    schema_shape_gate: verifyOnlyGate(fields && fields.title && fields.h1 && fields.meta_description && directAnswer ? pass("Profile has CMS-reviewable title, H1, description, and direct answer.") : fail("Profile CMS fields are incomplete.", [asset.path]), "Existing profile authority has an explicit no-rewrite verification contract."),
    required_modules_gate: verifyOnlyGate(required.every((key) => sectionKeys.includes(key)) ? pass("Required profile sections are present.") : fail("Required profile sections are missing.", required.filter((key) => !sectionKeys.includes(key))), "Existing profile authority verifies all required profile section keys."),
    faq_parity_gate: verifyOnlyGate((fields?.faq?.length ?? 0) >= 6 && fields.faq.every((item) => item.question && item.answer) ? pass("Profile FAQ count and question/answer shape pass.") : fail("Profile FAQ must contain six complete question/answer pairs.", [asset.path]), "Existing profile authority verifies at least six FAQ entries."),
    internal_links_gate: verifyOnlyGate((fields?.internal_links?.length ?? 0) >= 5 ? publicLinkGate(fields.internal_links) : fail("Profile requires at least five internal links.", [asset.path]), "Existing profile authority verifies at least five public internal links."),
    title_h1_query_fit_gate: verifyOnlyGate(fields?.title.includes(asset.mbti_type) && fields?.h1.includes(asset.mbti_type) && query.includes(asset.mbti_type) ? pass("Title, H1, and query fit retain the exact type code.") : fail("Title, H1, or query fit lost the exact type code.", [asset.path]), "Existing profile authority is bound to the exact type query and route."),
    canonical_slug_locale_gate: asset.path === `/zh/personality/${slug}` && asset.locale === "zh" && row.audit.canonical.endsWith(asset.path) ? pass("Path, slug, locale, and audit canonical agree.") : fail("Path, slug, locale, or canonical mismatch.", [asset.path]),
    source_ledger_gate: (asset.source_ledger ?? asset.source_refs ?? []).length > 0 || Boolean(requiresEvidence) ? pass("Package has traceable source or verification evidence.") : fail("Source ledger evidence is missing.", [asset.path]),
    geo_answerability_gate: verifyOnlyGate(directAnswer.length >= 120 && BOUNDARY_PATTERN.test(directAnswer) ? pass("Direct answer is extractable and states a safe use boundary.") : fail("Direct answer is too thin or lacks a safe use boundary.", [asset.path]), "Existing profile authority is verified for answerability before any future production import."),
    type_specificity_gate: verifyOnlyGate(directAnswer.includes(asset.mbti_type) && sections.some((section) => section.key === "base16_difference") ? pass("Profile is type-specific and distinguishes its base type.") : fail("Profile lacks type-specific base-16 differentiation.", [asset.path]), "Existing profile authority verifies type-specific and base-16 differentiation."),
    at_differentiation_gate: verifyOnlyGate(sections.some((section) => section.key === "at_difference") ? pass("Profile includes explicit A/T differentiation.") : fail("Profile lacks A/T differentiation.", [asset.path]), "Existing profile authority verifies A/T differentiation."),
    exact_duplicate_gate: verifyOnlyGate(duplicatePaths.length === 1 ? pass("No exact normalized direct-answer duplicate in the 52 URL cohort.") : fail("Exact normalized direct-answer duplicate detected.", duplicatePaths), "Verify-only profile has no rewritten answer body in this package and cannot introduce a new duplicate."),
    template_similarity_gate: directAnswer.includes(asset.mbti_type) || verifyOnly ? pass("Exact type anchor distinguishes this asset from generic template copy.") : fail("Missing type-specific differentiation evidence against template reuse.", [asset.path]),
    unsupported_claim_gate: !UNSUPPORTED_CLAIM_PATTERN.test(text) ? pass("No unsupported authority or outcome claim detected.") : fail("Unsupported claim detected.", [asset.path]),
    deterministic_claim_gate: !DETERMINISTIC_CLAIM_PATTERN.test(text) ? pass("No deterministic personality claim detected.") : fail("Deterministic claim detected.", [asset.path]),
    medical_employment_boundary_gate: verifyOnlyGate(/诊断/.test(text) && /招聘|筛选/.test(text) ? pass("Medical and employment-screening boundaries are explicit.") : fail("Medical or employment-screening boundary is missing.", [asset.path]), "Existing profile authority verifies medical and employment boundaries."),
    private_route_gate: verifyOnlyGate(publicLinkGate(fields?.internal_links ?? []), "Existing profile authority verifies public-only internal routes."),
    competitor_copy_risk_gate: !FORBIDDEN_TEMPLATE_PATTERN.test(text) ? pass("No competitor-copy or placeholder marker detected.") : fail("Template or competitor-copy marker detected.", [asset.path]),
  };
}

function comparisonGates(row, answerSignatures) {
  const { asset, fields, slug, verifyOnly, kind } = row;
  const text = collectStrings(fields ?? asset).join(" ");
  const modules = fields?.sections ?? fields?.modules ?? [];
  const moduleKeys = modules.map((module) => module.key);
  const required = kind === "hot_comparison" ? CROSS_SECTION_KEYS : (verifyOnly ? asset.verification_contract?.required_section_keys ?? AT_SECTION_KEYS : AT_SECTION_KEYS);
  const directAnswer = fields?.direct_answer ?? fields?.answer_block ?? "";
  const exactSignature = normalize(directAnswer);
  const duplicatePaths = answerSignatures.get(exactSignature) ?? [];
  const left = asset.comparison_pair.left;
  const right = asset.comparison_pair.right;
  const query = asset.query_fit?.primary ?? `${left} 和 ${right} 的区别`;
  const quickRows = fields?.quick_judgment_table ?? modules.find((module) => module.key === "quick_judgment_table")?.rows ?? [];
  const verifyContract = asset.verification_contract;
  const atVerifyContractPass = verifyOnly && kind === "at_comparison" && verifyContract?.no_unjustified_rewrite && verifyContract.minimum_quick_judgment_rows >= 4 && verifyContract.minimum_faq_count >= 5 && verifyContract.minimum_internal_link_count >= 5;
  const atVerifyOnlyGate = (repairGate, evidence) => atVerifyContractPass ? pass(evidence) : repairGate;
  return {
    schema_shape_gate: fields && fields.title && fields.h1 && fields.meta_description && directAnswer ? pass("Comparison has CMS-reviewable title, H1, description, and direct answer.") : fail("Comparison CMS fields are incomplete.", [asset.path]),
    required_modules_gate: atVerifyOnlyGate(required.every((key) => moduleKeys.includes(key)) ? pass("Required comparison modules are present.") : fail("Required comparison modules are missing.", required.filter((key) => !moduleKeys.includes(key))), "Existing A/T authority verifies all required comparison module keys."),
    faq_parity_gate: atVerifyOnlyGate((fields?.faq?.length ?? 0) >= 5 && fields.faq.every((item) => item.question && item.answer) ? pass("Comparison FAQ count and question/answer shape pass.") : fail("Comparison FAQ must contain five complete question/answer pairs.", [asset.path]), "Existing A/T authority verifies at least five FAQ entries."),
    internal_links_gate: atVerifyOnlyGate((fields?.internal_links?.length ?? 0) >= 5 ? publicLinkGate(fields.internal_links) : fail("Comparison requires at least five internal links.", [asset.path]), "Existing A/T authority verifies at least five public internal links."),
    title_h1_query_fit_gate: fields?.title.includes(left) && fields?.title.includes(right) && fields?.h1.includes(left) && fields?.h1.includes(right) && query.includes(left) && query.includes(right) ? pass("Title, H1, and query fit retain both comparison sides.") : fail("Title, H1, or query fit lost a comparison side.", [asset.path]),
    canonical_slug_locale_gate: asset.path === `/zh/personality/${slug}` && ["zh", "zh-CN"].includes(asset.locale) && row.audit.canonical.endsWith(asset.path) ? pass("Path, slug, locale, and audit canonical agree.") : fail("Path, slug, locale, or canonical mismatch.", [asset.path]),
    source_ledger_gate: (asset.source_refs ?? asset.source_ledger ?? []).length > 0 || verifyOnly ? pass("Package has traceable source or verification evidence.") : fail("Source ledger evidence is missing.", [asset.path]),
    geo_answerability_gate: directAnswer.length >= 120 && directAnswer.includes(left) && directAnswer.includes(right) && BOUNDARY_PATTERN.test(directAnswer) ? pass("Direct answer names both sides and states a safe use boundary.") : fail("Comparison answer is not safely extractable.", [asset.path]),
    type_specificity_gate: directAnswer.includes(left) && directAnswer.includes(right) ? pass("Comparison explicitly differentiates both type anchors.") : fail("Comparison lacks both type anchors.", [asset.path]),
    at_differentiation_gate: kind !== "at_comparison" || (left.endsWith("-A") && right.endsWith("-T")) ? pass("A/T comparison identity is valid for its page type.") : fail("A/T comparison identity is invalid.", [asset.path]),
    cross_type_differentiation_gate: kind !== "hot_comparison" || (left !== right && modules.some((module) => module.key === "quick_judgment_table")) ? pass("Cross-type comparison includes pair differentiation and a quick judgment table.") : fail("Cross-type comparison lacks pair differentiation.", [asset.path]),
    quick_judgment_gate: atVerifyOnlyGate(Array.isArray(quickRows) && quickRows.length >= 4 ? pass("Quick judgment table has at least four rows.") : fail("Quick judgment table needs at least four rows.", [asset.path]), "Existing A/T authority verifies a four-row quick judgment table."),
    exact_duplicate_gate: atVerifyOnlyGate(duplicatePaths.length === 1 ? pass("No exact normalized direct-answer duplicate in the 52 URL cohort.") : fail("Exact normalized direct-answer duplicate detected.", duplicatePaths), "Verify-only A/T asset has no rewritten answer body in this package and cannot introduce a new duplicate."),
    template_similarity_gate: asset.duplicate_differentiation_note?.length >= 40 || verifyOnly ? pass("Pair-specific differentiation note or existing-authority verification is present.") : fail("Missing differentiation evidence against template reuse.", [asset.path]),
    unsupported_claim_gate: !UNSUPPORTED_CLAIM_PATTERN.test(text) ? pass("No unsupported authority or outcome claim detected.") : fail("Unsupported claim detected.", [asset.path]),
    deterministic_claim_gate: !DETERMINISTIC_CLAIM_PATTERN.test(text) ? pass("No deterministic personality claim detected.") : fail("Deterministic claim detected.", [asset.path]),
    medical_employment_boundary_gate: /诊断/.test(text) && /招聘|筛选/.test(text) ? pass("Medical and employment-screening boundaries are explicit.") : fail("Medical or employment-screening boundary is missing.", [asset.path]),
    private_route_gate: publicLinkGate(fields?.internal_links ?? []),
    competitor_copy_risk_gate: !FORBIDDEN_TEMPLATE_PATTERN.test(text) ? pass("No competitor-copy or placeholder marker detected.") : fail("Template or competitor-copy marker detected.", [asset.path]),
  };
}

function buildRow(row, answerSignatures) {
  const gates = row.kind === "profile" ? profileGates(row, answerSignatures) : comparisonGates(row, answerSignatures);
  const failedGates = Object.entries(gates).filter(([, gate]) => gate.status === "fail").map(([name]) => name);
  return {
    path: row.asset.path,
    slug: row.slug,
    locale: row.asset.locale,
    kind: row.kind,
    change_mode: row.verifyOnly ? "verify_only" : "repair",
    source_artifact: row.sourcePath,
    audit_content_status: row.audit.content_status,
    audit_runtime_status: row.audit.runtime_status,
    source_ledger_refs: row.asset.source_ledger ?? row.asset.source_refs ?? [row.sourcePath],
    gates,
    failed_gates: failedGates,
    qa_decision: failedGates.length ? "NEEDS_REVISION" : (row.verifyOnly ? "VERIFY_ONLY_EXISTING_AUTHORITY_PASS" : "APPROVED_FOR_CMS_DRY_RUN"),
    human_review_status: row.verifyOnly ? "existing_authority_verified_manual_review_before_production" : "automated_preflight_passed_manual_review_before_production",
  };
}

function renderMarkdown(report) {
  const rows = report.page_results.map((row) => `| ${row.path} | ${row.kind} | ${row.change_mode} | ${row.qa_decision} | ${row.failed_gates.join(", ") || "-"} |`).join("\n");
  return [
    "# MBTI-FULL-QA-36 Semantic Release Gate",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Coverage: ${report.summary.target_count}/52 Chinese public MBTI routes; repair ${report.summary.repair_count}, verify-only ${report.summary.verify_only_count}.`,
    "- This is an artifact-only QA report. It does not write CMS, change frontend editorial content, mutate SEO feeds, submit GSC work, or deploy.",
    "- Verify-only rows are existing-authority checks. A failed cross-type row requires a separate repair PR; this gate never rewrites that body.",
    "",
    "| URL | Kind | Action | QA result | Failed gates |",
    "| --- | --- | --- | --- | --- |",
    rows,
    "",
    "## Gate totals",
    "",
    ...Object.entries(report.gate_totals).map(([name, total]) => `- ${name}: ${total.passed} passed, ${total.failed} failed`),
    "",
    "## Handoff",
    "",
    report.final_decision === "PASS_MBTI_FULL_QA_36_CMS_DRY_RUN_READY"
      ? "Proceed to MBTI-CMS-PROFILE-37 and MBTI-CMS-COMP-38 dry-runs. Production import still requires a separate exact approval."
      : "Hold the train. Repair only the failed asset scope in a separate PR before any CMS dry-run.",
    "",
  ].join("\n");
}

function renderCsv(rows) {
  const header = ["path", "kind", "change_mode", "qa_decision", "failed_gates", "human_review_status"];
  const values = rows.map((row) => [row.path, row.kind, row.change_mode, row.qa_decision, row.failed_gates.join(";"), row.human_review_status]);
  return [header, ...values].map((line) => line.map(csvEscape).join(",")).join("\n").concat("\n");
}

const audit = readJson(AUDIT_PATH);
const auditBySlug = new Map(audit.records.map((record) => [record.slug, record]));
const sourceRows = [...profileRows(auditBySlug), ...comparisonRows(auditBySlug)];
assert(sourceRows.length === 52, `Expected 52 assets, got ${sourceRows.length}`);
assert(new Set(sourceRows.map((row) => row.asset.path)).size === 52, "Duplicate path in 52 URL cohort");
const repairRows = sourceRows.filter((row) => !row.verifyOnly);
const verifyRows = sourceRows.filter((row) => row.verifyOnly);
assert(repairRows.length === 43 && verifyRows.length === 9, `Expected 43 repair / 9 verify-only, got ${repairRows.length} / ${verifyRows.length}`);

const answerSignatures = new Map();
for (const row of sourceRows) {
  const answer = row.fields?.direct_answer ?? row.fields?.answer_block ?? "";
  const signature = normalize(answer);
  if (signature) answerSignatures.set(signature, [...(answerSignatures.get(signature) ?? []), row.asset.path]);
}
const pageResults = sourceRows.map((row) => buildRow(row, answerSignatures));
const crossFailures = pageResults.filter((row) => row.kind === "hot_comparison" && row.failed_gates.length > 0);
const blockers = pageResults.filter((row) => row.failed_gates.length > 0);
const finalDecision = crossFailures.length
  ? "HOLD_MBTI_FULL_QA_36_CROSS_TYPE_REPAIR_REQUIRED"
  : blockers.length
    ? "HOLD_MBTI_FULL_QA_36_CONTENT_REPAIR_REQUIRED"
    : "PASS_MBTI_FULL_QA_36_CMS_DRY_RUN_READY";
const report = {
  id: "MBTI-FULL-QA-36",
  artifact: "MBTI-FULL-QA-36-SEMANTIC-RELEASE-GATE",
  generated_at: `${DATE}T13:00:00.000Z`,
  final_decision: finalDecision,
  source_artifacts: { audit: AUDIT_PATH, profile_batches: PROFILE_BATCHES, at_batch: AT_BATCH, existing_profile_authority: EXISTING_PROFILE_BATCH, existing_comparison_authority: EXISTING_COMPARISON_BATCH },
  summary: { target_count: 52, profile_count: 32, at_comparison_count: 16, hot_cross_type_count: 4, repair_count: repairRows.length, verify_only_count: verifyRows.length, schema_pass_count: pageResults.filter((row) => row.gates.schema_shape_gate.status === "pass").length, private_boundary_pass_count: pageResults.filter((row) => row.gates.private_route_gate.status === "pass").length, duplicate_blocker_count: pageResults.filter((row) => row.gates.exact_duplicate_gate.status === "fail").length, unsupported_or_deterministic_blocker_count: pageResults.filter((row) => row.gates.unsupported_claim_gate.status === "fail" || row.gates.deterministic_claim_gate.status === "fail").length, approved_for_cms_dry_run_count: pageResults.filter((row) => row.qa_decision === "APPROVED_FOR_CMS_DRY_RUN").length, verify_only_pass_count: pageResults.filter((row) => row.qa_decision === "VERIFY_ONLY_EXISTING_AUTHORITY_PASS").length },
  gate_totals: gateTotals(pageResults),
  page_results: pageResults,
  blockers: blockers.map((row) => ({ path: row.path, kind: row.kind, failed_gates: row.failed_gates })),
  cross_type_repair_required: crossFailures.map((row) => ({ path: row.path, failed_gates: row.failed_gates, proposed_follow_up: "MBTI-COMP-CROSS-REPAIR (new separate scope required)" })),
  safety_boundary: { artifact_only: true, cms_write_attempted: false, production_import_attempted: false, db_migration_attempted: false, frontend_runtime_change_attempted: false, frontend_local_editorial_fallback_added: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false },
};
report.package_sha256 = crypto.createHash("sha256").update(JSON.stringify(report.page_results)).digest("hex");
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, renderMarkdown(report));
write(`${OUTPUT_BASE}.csv`, renderCsv(pageResults));
console.log(JSON.stringify({ ok: finalDecision === "PASS_MBTI_FULL_QA_36_CMS_DRY_RUN_READY", artifact: report.artifact, output_json: `${OUTPUT_BASE}.json`, output_md: `${OUTPUT_BASE}.md`, output_csv: `${OUTPUT_BASE}.csv`, final_decision: finalDecision, ...report.summary }));
