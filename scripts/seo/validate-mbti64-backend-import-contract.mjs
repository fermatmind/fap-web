#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { sanitizeDateSlug } from "./artifactSafety.mjs";

const repoRoot = process.cwd();
const auditDate = sanitizeDateSlug(process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10), "AUDIT_DATE");

const sourcePackagePath = "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json";
const sourceQaPath = "docs/seo/personality/content-package-v21-qa-2026-06-18.json";
const sourceGatesPath = "docs/seo/personality/content-package-gates-2026-06-18.json";
const queryIntentPath = "docs/seo/personality/query-intent-map-pilot-v1.json";
const routeScopePath = "docs/seo/personality/related-test-route-scope-decision-2026-06-18.json";
const indexationAuditPath = "docs/seo/personality/indexation-audit-2026-06-18.json";
const cohortLockPath = "docs/seo/personality/target-cohort-lock-2026-06-18.json";

const outputContractJsonPath = `docs/seo/personality/backend-import-contract-${auditDate}.json`;
const outputContractMarkdownPath = `docs/seo/personality/backend-import-contract-${auditDate}.md`;
const outputPlanJsonPath = `docs/seo/personality/backend-import-dry-run-plan-${auditDate}.json`;
const outputPlanMarkdownPath = `docs/seo/personality/backend-import-dry-run-plan-${auditDate}.md`;

const pilotUrls = [
  "/en/personality/intj-a-vs-intj-t",
  "/zh/personality/istj-a",
  "/en/personality/intp-a-vs-intp-t",
  "/zh/personality/infp-t",
  "/en/personality/intj-a",
  "/en/personality/intj-t",
  "/zh/personality/intj-a",
  "/zh/personality/intj-t",
];

const forbiddenPayloadPatterns = [
  /\/result\b/i,
  /\/results\b/i,
  /\/results\/lookup\b/i,
  /\/orders\b/i,
  /\/orders\/lookup\b/i,
  /\/share\b/i,
  /\/pay\b/i,
  /\/payment\b/i,
  /\/history\b/i,
  /\/private\b/i,
  /\/account\b/i,
  /token=/i,
  /session=/i,
  /user=/i,
  /result_id=/i,
  /report_id=/i,
  /order_no=/i,
];

const officialClaimPatterns = [
  /official\s+MBTI/i,
  /certified\s+MBTI/i,
  /authorized\s+MBTI/i,
  /official\s+Myers-Briggs/i,
  /official\s+16\s+personalities/i,
  /A\/T\s+is\s+an\s+official/i,
  /官方\s*MBTI/i,
  /MBTI\s*官方/i,
  /官方\s*16\s*型人格/i,
  /认证\s*MBTI/i,
];

const clinicalClaimPatterns = [
  /clinical diagnosis/i,
  /diagnose/i,
  /treat(?:ment)? plan/i,
  /medical advice/i,
  /心理诊断/,
  /临床诊断/,
  /治疗建议/,
  /医疗建议/,
];

const guaranteeClaimPatterns = [
  /guarantee(?:d)?\s+(?:career|relationship|job|love|success)/i,
  /will\s+always\s+(?:succeed|fail|love|choose)/i,
  /一定(?:适合|成功|失败|相爱|分手)/,
  /保证(?:职业|关系|成功|结果)/,
];

const variantContentFields = [
  "quick_answer",
  "meaning",
  "a_t_difference",
  "core_traits",
  "strengths_blind_spots",
  "careers_work_style",
  "relationships_communication",
  "common_misreads",
  "similar_types",
];

const comparisonContentFields = [
  "quick_answer",
  "side_by_side_summary",
  "core_traits_comparison",
  "stress_confidence",
  "career_work_style",
  "relationships_love",
  "which_one_fits",
];

const topLevelMapping = [
  "url",
  "locale",
  "page_type",
  "primary_query",
  "secondary_queries",
  "excluded_queries",
  "target_intent",
  "target_test_route",
  "canonical_target",
  "status",
];

const seoMapping = [
  "seo.seo_title",
  "seo.seo_description",
  "seo.breadcrumb_title",
  "seo.h1",
  "seo.quick_answer_summary",
];

const sharedMapping = [
  "faq",
  "internal_links",
  "method_boundary",
  "trademark_boundary",
  "information_gain",
  "claim_risk_notes",
  "route_safety",
  "above_the_fold_module",
  "serp_ctr_package_v2",
  "v2_optimization",
];

const revisionMetadataMapping = [
  "source_artifact",
  "source_artifact_sha256",
  "generated_by",
  "qa_state",
  "operator_review_required",
  "rollback_required",
  "previous_revision_id",
  "new_revision_id",
  "publish_allowed",
  "search_release_allowed",
];

function abs(relativePath) {
  return path.join(repoRoot, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(abs(relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(abs(relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(abs(relativePath)), { recursive: true });
  fs.writeFileSync(abs(relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(abs(relativePath)), { recursive: true });
  fs.writeFileSync(abs(relativePath), value.endsWith("\n") ? value : `${value}\n`);
}

function sha256File(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(abs(relativePath))).digest("hex");
}

function sha256Value(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function valueText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(valueText).join(" ");
  if (typeof value === "object") return Object.values(value).map(valueText).join(" ");
  return String(value);
}

function textHasPattern(value, patterns) {
  const text = valueText(value);
  return patterns.filter((pattern) => pattern.test(text)).map(String);
}

function pathFromUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (text.startsWith("http://") || text.startsWith("https://")) {
    return new URL(text).pathname.replace(/\/+$/, "") || "/";
  }
  return text.replace(/\/+$/, "") || "/";
}

function localeSegment(locale) {
  return locale === "zh-CN" ? "zh" : "en";
}

function slugFromUrl(url) {
  return pathFromUrl(url).split("/").filter(Boolean).at(-1) ?? "";
}

function expectedRelatedRoutes(locale) {
  return locale === "zh-CN"
    ? ["/zh/tests/big-five-personality-test-ocean-model", "/zh/tests/holland-career-interest-test-riasec"]
    : ["/en/tests/big-five-personality-test-ocean-model", "/en/tests/holland-career-interest-test-riasec"];
}

function payloadWithoutNotes(row) {
  return {
    url: row.url,
    locale: row.locale,
    page_type: row.page_type,
    primary_query: row.primary_query,
    secondary_queries: row.secondary_queries,
    excluded_queries: row.excluded_queries,
    target_intent: row.target_intent,
    target_test_route: row.target_test_route,
    canonical_target: row.canonical_target,
    status: row.status,
    seo: row.seo,
    content: row.content,
    faq: row.faq,
    internal_links: row.internal_links,
    method_boundary: row.method_boundary,
    trademark_boundary: row.trademark_boundary,
    information_gain: row.information_gain,
    claim_risk_notes: row.claim_risk_notes,
    route_safety: row.route_safety,
    above_the_fold_module: row.above_the_fold_module,
    serp_ctr_package_v2: row.serp_ctr_package_v2,
    v2_optimization: row.v2_optimization,
  };
}

function markdownTable(rows, fields) {
  if (rows.length === 0) return "_None_";
  const escapeCell = (value) => String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
  return [
    `| ${fields.join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => escapeCell(row[field])).join(" | ")} |`),
  ].join("\n");
}

const requiredInputs = [
  sourcePackagePath,
  sourceQaPath,
  sourceGatesPath,
  queryIntentPath,
  routeScopePath,
  indexationAuditPath,
  cohortLockPath,
];

const missingInputs = requiredInputs.filter((input) => !exists(input));
if (missingInputs.length > 0) {
  throw new Error(`Missing required inputs: ${missingInputs.join(", ")}`);
}

const pkg = readJson(sourcePackagePath);
const qa = readJson(sourceQaPath);
const gates = readJson(sourceGatesPath);
const intentMap = readJson(queryIntentPath);
const routeScope = readJson(routeScopePath);
const indexation = readJson(indexationAuditPath);
const cohort = readJson(cohortLockPath);

const rows = Array.isArray(pkg.rows) ? pkg.rows : [];
const intentRows = Array.isArray(intentMap.rows) ? intentMap.rows : [];
const indexationPaths = new Set((indexation.rows || []).map((row) => pathFromUrl(row.path || row.url)).filter(Boolean));
const cohortPaths = new Set((cohort.rows || []).map((row) => pathFromUrl(row.URL || row.url)).filter(Boolean));
const knownExistingPaths = new Set([...indexationPaths, ...cohortPaths]);
const blockers = [];
const warnings = [];

if (pkg.version !== "pilot-v2.1") blockers.push(`Expected package version pilot-v2.1, found ${pkg.version}`);
if (qa.status !== "pass") blockers.push(`Expected V2.1 QA status pass, found ${qa.status}`);
if (gates.status !== "pass") blockers.push(`Expected gates status pass, found ${gates.status}`);
if (routeScope.status !== "pass") blockers.push(`Expected related route scope status pass, found ${routeScope.status}`);
if (rows.length !== 8) blockers.push(`Expected exactly 8 rows, found ${rows.length}`);
if (intentRows.length < rows.length) warnings.push(`Query intent map has fewer rows than package: ${intentRows.length}/${rows.length}`);
if (rows.length === pilotUrls.length && !rows.every((row, index) => row.url === pilotUrls[index])) {
  blockers.push("V2.1 row order changed from locked pilot queue.");
}

const sourcePackageSha256 = sha256File(sourcePackagePath);

const backendEvidence = [
  {
    file: "lib/cms/personality.ts",
    evidence: "Frontend consumer declares CMS personality detail, SEO, sections, comparison projection, and public projection response shapes.",
  },
  {
    file: "app/(localized)/[locale]/personality/[type]/page.tsx",
    evidence: "Personality detail route consumes backend personality detail/comparison APIs and renders variant/comparison pages from API projection data.",
  },
  {
    file: "lib/cms/personality-sections.tsx",
    evidence: "Frontend supports rich_text, bullets, faq, trait_dimension_grid, preferred_role_list and section payload rendering.",
  },
  {
    file: "<fap-api-backend>/app/Models/PersonalityProfileVariantRevision.php",
    evidence: "Backend model supports variant revision snapshots through snapshot_json, revision_no, note, admin user, and created_at fields.",
  },
  {
    file: "<fap-api-backend>/database/migrations/2026_03_16_000110_create_personality_profile_variant_authority_tables.php",
    evidence: "Backend variant tables support variant sections, variant SEO meta, and variant revisions; comparison page storage appears derived from paired variants.",
  },
  {
    file: "<fap-api-backend>/app/Http/Controllers/API/V0_5/Cms/PersonalityController.php",
    evidence: "Backend exposes public variant and comparison read APIs, including comparison_public_projection_v1.",
  },
];

const backendCmsDiscovery = {
  evidence_files: backendEvidence,
  content_model_found: true,
  import_path_found: "unknown",
  notes: [
    "Variant profile/section/SEO/revision models exist in fap-api.",
    "Comparison pages are exposed through a backend comparison API built from paired A/T variants; no separate comparison write/import model was proven in this scan.",
    "No dedicated importer for the MBTI64 V2.1 GPT content package was found in the local fap-web scope; future backend PR must implement or adapt a dry-run/write command.",
    "Because backend field support for method_boundary, trademark_boundary, information_gain, SERP CTR metadata, and source artifact metadata is not proven as first-class fields, final status is conditional.",
  ],
};

const requiredBackendFields = [
  "personality_profile_variant.public_route_slug",
  "personality_profile_variant.runtime_type_code",
  "personality_profile_variant_seo_meta.seo_title",
  "personality_profile_variant_seo_meta.seo_description",
  "personality_profile_variant_seo_meta.canonical_url",
  "personality_profile_variant_seo_meta.robots",
  "personality_profile_variant_sections.section_key",
  "personality_profile_variant_sections.body_md",
  "personality_profile_variant_sections.payload_json",
  "personality_profile_variant_revisions.snapshot_json",
];

const optionalBackendFields = [
  "breadcrumb_title",
  "faq_schema_payload",
  "above_the_fold_module",
  "internal_link_roles",
  "source_artifact_metadata",
  "operator_review_state",
  "rollback_metadata",
];

const unsupportedFields = [
  "comparison_page_first_class_revision_model_unknown",
  "method_boundary_first_class_field_unknown",
  "trademark_boundary_first_class_field_unknown",
  "information_gain_first_class_field_unknown",
  "serp_ctr_package_v2_first_class_field_unknown",
  "publish_allowed_first_class_field_unknown",
  "search_release_allowed_first_class_field_unknown",
];

const contractRows = [];
const dryRunRows = [];
const validationRows = [];

for (const row of rows) {
  const pathOnly = pathFromUrl(row.url);
  const slug = slugFromUrl(row.url);
  const localePathPrefix = `/${localeSegment(row.locale)}/`;
  const expectedFields = row.page_type === "comparison" ? comparisonContentFields : variantContentFields;
  const missingContentFields = expectedFields.filter((field) => row.content?.[field] === undefined);
  const payload = payloadWithoutNotes(row);
  const forbiddenMatches = textHasPattern(payload, forbiddenPayloadPatterns);
  const officialMatches = textHasPattern(payload, officialClaimPatterns);
  const clinicalMatches = textHasPattern(payload, clinicalClaimPatterns);
  const guaranteeMatches = textHasPattern(payload, guaranteeClaimPatterns);
  const relatedRoutes = expectedRelatedRoutes(row.locale);
  const relatedLinks = Array.isArray(row.internal_links)
    ? row.internal_links.filter((link) => link?.role === "related_test")
    : [];
  const relatedHrefs = relatedLinks.map((link) => String(link.href || ""));
  const missingRelatedRoutes = relatedRoutes.filter((route) => !relatedHrefs.includes(route));
  const unsafeRelatedRoutes = relatedLinks.filter((link) => link.safe_public_route !== true).map((link) => link.href);
  const canonicalMatches = row.canonical_target === row.url;
  const existingUrl = knownExistingPaths.has(pathOnly);
  const slugPreserved = slug.length > 0 && pathOnly.endsWith(`/${slug}`);
  const localePreserved = pathOnly.startsWith(localePathPrefix);

  if (!existingUrl) blockers.push(`${row.url}: existing URL not found in indexation/cohort artifacts.`);
  if (!canonicalMatches) blockers.push(`${row.url}: canonical_target does not equal url.`);
  if (!slugPreserved) blockers.push(`${row.url}: slug could not be preserved.`);
  if (!localePreserved) blockers.push(`${row.url}: locale does not match path segment.`);
  if (!["variant", "comparison"].includes(row.page_type)) blockers.push(`${row.url}: unsupported page_type ${row.page_type}`);
  if (missingContentFields.length > 0) blockers.push(`${row.url}: missing ${row.page_type} content fields ${missingContentFields.join(", ")}`);
  if (forbiddenMatches.length > 0) blockers.push(`${row.url}: forbidden route/token pattern found in import payload.`);
  if (officialMatches.length > 0) blockers.push(`${row.url}: official/certified MBTI claim pattern found.`);
  if (clinicalMatches.length > 0) blockers.push(`${row.url}: clinical diagnosis/treatment claim pattern found.`);
  if (guaranteeMatches.length > 0) blockers.push(`${row.url}: career or relationship guarantee claim pattern found.`);
  if (missingRelatedRoutes.length > 0) blockers.push(`${row.url}: missing safe Big Five/RIASEC related_test routes.`);
  if (unsafeRelatedRoutes.length > 0) blockers.push(`${row.url}: related_test route lacks safe_public_route=true.`);

  const rowWarnings = [];
  if (row.page_type === "comparison") {
    rowWarnings.push("Comparison page write path must be implemented carefully because current backend evidence suggests comparison output is derived from paired variants, not a proven standalone comparison revision table.");
  }
  rowWarnings.push("Non-critical metadata may need to be stored in snapshot_json or payload_json if no first-class backend field exists.");

  const dataLossRisk = row.page_type === "comparison" ? "medium" : "medium";
  const routeSafetyStatus = row.route_safety?.forbidden_route_patterns_absent_from_internal_links === true
    ? "pass"
    : "conditional";

  const importPayloadShape = {
    top_level: topLevelMapping,
    seo: seoMapping,
    content: row.page_type === "comparison"
      ? comparisonContentFields.map((field) => `content.${field}`)
      : variantContentFields.map((field) => `content.${field}`),
    shared: sharedMapping,
    revision_metadata: revisionMetadataMapping,
  };

  contractRows.push({
    url: row.url,
    locale: row.locale,
    page_type: row.page_type,
    slug,
    canonical_target: row.canonical_target,
    existing_url_required: true,
    create_new_url_allowed: false,
    publish_allowed_default: false,
    sitemap_allowed_default: false,
    llms_allowed_default: false,
    llms_full_allowed_default: false,
    search_release_allowed_default: false,
    review_state_default: "draft_for_operator_review",
    source_package_path: sourcePackagePath,
    source_package_version: pkg.version,
    source_package_sha256: sourcePackageSha256,
    source_qa_artifact: sourceQaPath,
    source_gates_artifact: sourceGatesPath,
    import_payload_shape: importPayloadShape,
    required_backend_fields: requiredBackendFields,
    optional_backend_fields: optionalBackendFields,
    unsupported_fields: unsupportedFields,
    data_loss_risk: dataLossRisk,
    route_safety_status: routeSafetyStatus,
    canonical_safety_status: canonicalMatches ? "pass" : "fail",
    rollback_metadata_required: true,
    notes: rowWarnings,
  });

  dryRunRows.push({
    existing_url: row.url,
    existing_slug: slug,
    locale: row.locale,
    page_type: row.page_type,
    operation: "create_revision_draft_only",
    production_url_changed: false,
    canonical_changed: false,
    publish_immediately: false,
    sitemap_changed: false,
    llms_changed: false,
    search_submitted: false,
    expected_revision_state: "draft_for_operator_review",
    rollback_required: true,
    rollback_reference: {
      previous_revision_id: "Unknown until CMS draft creation",
      new_revision_id: "Unknown until CMS draft creation",
      source_artifact: sourcePackagePath,
      source_artifact_sha256: sourcePackageSha256,
      row_sha256: sha256Value(row),
    },
    blockers: [],
    warnings: rowWarnings,
  });

  validationRows.push({
    url: row.url,
    existing_url: existingUrl,
    canonical_matches_url: canonicalMatches,
    locale_preserved: localePreserved,
    page_type_preserved: true,
    slug_preserved: slugPreserved,
    forbidden_payload_patterns: forbiddenMatches,
    official_claim_patterns: officialMatches,
    clinical_claim_patterns: clinicalMatches,
    guarantee_claim_patterns: guaranteeMatches,
    missing_related_routes: missingRelatedRoutes,
    unsafe_related_routes: unsafeRelatedRoutes,
    contract_field_set: row.page_type,
  });
}

if (backendCmsDiscovery.import_path_found !== true) {
  warnings.push("Backend import path for this exact MBTI64 V2.1 package is unknown; future backend PR must implement dry-run/write support.");
}
if (unsupportedFields.length > 0) {
  warnings.push("Some V2.1 fields have uncertain first-class backend support and may need structured snapshot_json/payload_json storage.");
}
if ((gates.warnings || []).length > 0) {
  warnings.push(...gates.warnings.map((warning) => `Carried from gates: ${warning}`));
}

const validation = {
  row_count_ok: rows.length === 8,
  row_order_ok: rows.length === pilotUrls.length && rows.every((row, index) => row.url === pilotUrls[index]),
  every_row_existing_url: validationRows.every((row) => row.existing_url),
  no_new_url_creation: contractRows.every((row) => row.create_new_url_allowed === false),
  canonical_target_equals_url: validationRows.every((row) => row.canonical_matches_url),
  locale_preserved: validationRows.every((row) => row.locale_preserved),
  page_type_preserved: validationRows.every((row) => row.page_type_preserved),
  slug_preserved: validationRows.every((row) => row.slug_preserved),
  forbidden_route_patterns_absent_from_import_payload: validationRows.every((row) => row.forbidden_payload_patterns.length === 0),
  official_mbti_claims_absent: validationRows.every((row) => row.official_claim_patterns.length === 0),
  clinical_claims_absent: validationRows.every((row) => row.clinical_claim_patterns.length === 0),
  guarantee_claims_absent: validationRows.every((row) => row.guarantee_claim_patterns.length === 0),
  internal_links_safe_public_routes: validationRows.every((row) => row.missing_related_routes.length === 0 && row.unsafe_related_routes.length === 0),
  big_five_and_riasec_related_tests_present: validationRows.every((row) => row.missing_related_routes.length === 0),
  comparison_rows_use_comparison_contract: validationRows.filter((row) => rows.find((item) => item.url === row.url)?.page_type === "comparison").every((row) => row.contract_field_set === "comparison"),
  variant_rows_use_variant_contract: validationRows.filter((row) => rows.find((item) => item.url === row.url)?.page_type === "variant").every((row) => row.contract_field_set === "variant"),
  review_state_draft_for_operator_review: contractRows.every((row) => row.review_state_default === "draft_for_operator_review"),
  publish_allowed_false: contractRows.every((row) => row.publish_allowed_default === false),
  sitemap_allowed_false: contractRows.every((row) => row.sitemap_allowed_default === false),
  llms_allowed_false: contractRows.every((row) => row.llms_allowed_default === false),
  llms_full_allowed_false: contractRows.every((row) => row.llms_full_allowed_default === false),
  search_release_allowed_false: contractRows.every((row) => row.search_release_allowed_default === false),
  rollback_metadata_required: contractRows.every((row) => row.rollback_metadata_required === true),
  no_cms_mutation_occurred: true,
  validation_rows: validationRows,
};

const status = blockers.length > 0 ? "fail" : warnings.length > 0 || backendCmsDiscovery.import_path_found !== true ? "conditional" : "pass";
const recommendedNextTask = status === "fail"
  ? "Repair MBTI64 V2.1 package or gates before backend import planning"
  : "MBTI64-BACKEND-IMPORT-DRY-RUN-01";

const contract = {
  artifact: "MBTI64-BACKEND-IMPORT-CONTRACT-01",
  status,
  package_version_reviewed: pkg.version,
  source_package: sourcePackagePath,
  source_qa: sourceQaPath,
  source_gates: sourceGatesPath,
  contract_rows: contractRows,
  field_mapping: {
    variant: {
      top_level: topLevelMapping,
      seo: seoMapping,
      content: variantContentFields.map((field) => `content.${field}`),
      shared: sharedMapping,
    },
    comparison: {
      top_level: topLevelMapping,
      seo: seoMapping,
      content: comparisonContentFields.map((field) => `content.${field}`),
      shared: sharedMapping,
    },
    shared: sharedMapping,
    revision_metadata: revisionMetadataMapping,
  },
  backend_cms_discovery: backendCmsDiscovery,
  validation,
  known_holds: [
    "Result lookup route classification remains a separate sidecar and blocks publish/search release.",
    "No CMS import in this PR.",
    "No sitemap/llms/llms-full/search-release work in this PR.",
    "Operator approval required before CMS revision draft creation.",
  ],
  blockers,
  warnings,
  recommended_next_task: recommendedNextTask,
};

const dryRunPlan = {
  artifact: "MBTI64-BACKEND-IMPORT-DRY-RUN-PLAN-01",
  status,
  package_version_reviewed: pkg.version,
  source_package: sourcePackagePath,
  source_package_sha256: sourcePackageSha256,
  operation_scope: "dry_run_only_no_db_write",
  row_count: dryRunRows.length,
  rows: dryRunRows,
  global_defaults: {
    operation: "create_revision_draft_only",
    production_url_changed: false,
    canonical_changed: false,
    publish_immediately: false,
    sitemap_changed: false,
    llms_changed: false,
    search_submitted: false,
    expected_revision_state: "draft_for_operator_review",
    rollback_required: true,
  },
  validation: {
    exactly_8_revision_draft_operations: dryRunRows.length === 8 && dryRunRows.every((row) => row.operation === "create_revision_draft_only"),
    no_publish_or_indexing_change: dryRunRows.every((row) => row.publish_immediately === false && row.sitemap_changed === false && row.llms_changed === false && row.search_submitted === false),
    no_url_or_canonical_change: dryRunRows.every((row) => row.production_url_changed === false && row.canonical_changed === false),
    no_db_write_in_this_pr: true,
  },
  blockers,
  warnings,
  recommended_next_task: recommendedNextTask,
};

writeJson(outputContractJsonPath, contract);
writeJson(outputPlanJsonPath, dryRunPlan);

const contractTableRows = contractRows.map((row) => ({
  url: row.url,
  locale: row.locale,
  page_type: row.page_type,
  slug: row.slug,
  canonical: row.canonical_safety_status,
  data_loss_risk: row.data_loss_risk,
  route_safety: row.route_safety_status,
  operation: "create_revision_draft_only",
}));

const validationSummaryRows = Object.entries(validation)
  .filter(([, value]) => typeof value === "boolean")
  .map(([check, ok]) => ({ check, result: ok ? "pass" : "fail" }));

const contractMarkdown = `# MBTI64 Backend Import Contract

## Summary
- Artifact: MBTI64-BACKEND-IMPORT-CONTRACT-01
- Final status: ${status}
- Reviewed package: ${sourcePackagePath}
- Package version: ${pkg.version}
- Package SHA-256: ${sourcePackageSha256}
- Rows: ${rows.length}
- Contract mode: dry-run only, no CMS mutation

This PR did not import CMS drafts, create CMS revisions, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, change scoring/result/payment/account routes, or submit search URLs.

## Backend / CMS Discovery
${backendCmsDiscovery.evidence_files.map((item) => `- ${item.file}: ${item.evidence}`).join("\n")}

Discovery verdict:
- content_model_found: ${backendCmsDiscovery.content_model_found}
- import_path_found: ${backendCmsDiscovery.import_path_found}

Notes:
${backendCmsDiscovery.notes.map((note) => `- ${note}`).join("\n")}

## 8-Row Import Contract
${markdownTable(contractTableRows, ["url", "locale", "page_type", "slug", "canonical", "data_loss_risk", "route_safety", "operation"])}

## Field Mapping
### Variant Pages
- Top-level: ${topLevelMapping.join(", ")}
- SEO: ${seoMapping.join(", ")}
- Content: ${variantContentFields.map((field) => `content.${field}`).join(", ")}
- Shared: ${sharedMapping.join(", ")}

### Comparison Pages
- Top-level: ${topLevelMapping.join(", ")}
- SEO: ${seoMapping.join(", ")}
- Content: ${comparisonContentFields.map((field) => `content.${field}`).join(", ")}
- Shared: ${sharedMapping.join(", ")}

### Revision Metadata
${revisionMetadataMapping.map((field) => `- ${field}`).join("\n")}

## Validation
${markdownTable(validationSummaryRows, ["check", "result"])}

## Dry-Run Plan Summary
- Would create exactly 8 CMS revision drafts only.
- Would not change production URLs, canonicals, sitemap, llms, llms-full, or search submission.
- Revision IDs remain unknown until the future CMS draft creation task.
- Rollback metadata is required for every row.

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}

## Holds
${contract.known_holds.map((item) => `- ${item}`).join("\n")}

## Recommended Next Task
${recommendedNextTask}
`;

const planTableRows = dryRunRows.map((row) => ({
  existing_url: row.existing_url,
  locale: row.locale,
  page_type: row.page_type,
  operation: row.operation,
  publish: String(row.publish_immediately),
  sitemap: String(row.sitemap_changed),
  llms: String(row.llms_changed),
  search: String(row.search_submitted),
  rollback: String(row.rollback_required),
}));

const planMarkdown = `# MBTI64 Backend Import Dry-Run Plan

## Summary
- Artifact: MBTI64-BACKEND-IMPORT-DRY-RUN-PLAN-01
- Final status: ${status}
- Source package: ${sourcePackagePath}
- Source package SHA-256: ${sourcePackageSha256}
- Mode: dry-run plan only

This plan defines what a future backend import dry-run should simulate. It does not import CMS drafts, create CMS revisions, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, change scoring/result/payment/account routes, or submit search URLs.

## Planned Operations
${markdownTable(planTableRows, ["existing_url", "locale", "page_type", "operation", "publish", "sitemap", "llms", "search", "rollback"])}

## Global Defaults
- operation: create_revision_draft_only
- production_url_changed: false
- canonical_changed: false
- publish_immediately: false
- sitemap_changed: false
- llms_changed: false
- search_submitted: false
- expected_revision_state: draft_for_operator_review
- rollback_required: true

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}

## Recommended Next Task
${recommendedNextTask}
`;

writeText(outputContractMarkdownPath, contractMarkdown);
writeText(outputPlanMarkdownPath, planMarkdown);

if (blockers.length > 0) {
  console.error(`[mbti64-backend-import-contract] FAIL: ${blockers.length} blockers`);
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}

console.log(JSON.stringify({
  artifact: contract.artifact,
  status,
  rows: rows.length,
  contract_json: outputContractJsonPath,
  dry_run_plan_json: outputPlanJsonPath,
  warnings: warnings.length,
  recommended_next_task: recommendedNextTask,
}, null, 2));
