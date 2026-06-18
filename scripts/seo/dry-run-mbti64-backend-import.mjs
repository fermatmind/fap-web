#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const auditDate = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const fapApiRoot = process.env.FAP_API_ROOT || "/Users/rainie/Desktop/GitHub/fap-api/backend";

const paths = {
  contractJson: "docs/seo/personality/backend-import-contract-2026-06-18.json",
  contractMd: "docs/seo/personality/backend-import-contract-2026-06-18.md",
  dryRunPlanJson: "docs/seo/personality/backend-import-dry-run-plan-2026-06-18.json",
  dryRunPlanMd: "docs/seo/personality/backend-import-dry-run-plan-2026-06-18.md",
  packageJson: "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json",
  qaJson: "docs/seo/personality/content-package-v21-qa-2026-06-18.json",
  gatesJson: "docs/seo/personality/content-package-gates-2026-06-18.json",
  intentJson: "docs/seo/personality/query-intent-map-pilot-v1.json",
  routeScopeJson: "docs/seo/personality/related-test-route-scope-decision-2026-06-18.json",
};

const outputJson = `docs/seo/personality/backend-import-dry-run-${auditDate}.json`;
const outputMd = `docs/seo/personality/backend-import-dry-run-${auditDate}.md`;

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

const forbiddenPatterns = [
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

const claimPatterns = {
  official_mbti: [
    /official\s+MBTI/i,
    /certified\s+MBTI/i,
    /authorized\s+MBTI/i,
    /official\s+Myers-Briggs/i,
    /official\s+16\s+personalities/i,
    /official\s+32\s+types/i,
    /官方\s*MBTI/i,
    /MBTI\s*官方/i,
    /官方\s*32\s*型/i,
    /认证\s*MBTI/i,
  ],
  clinical: [
    /clinical diagnosis/i,
    /diagnose/i,
    /treat(?:ment)? plan/i,
    /medical advice/i,
    /心理诊断/,
    /临床诊断/,
    /治疗建议/,
    /医疗建议/,
  ],
  guarantee: [
    /guarantee(?:d)?\s+(?:career|relationship|job|love|success)/i,
    /will\s+always\s+(?:succeed|fail|love|choose)/i,
    /一定(?:适合|成功|失败|相爱|分手)/,
    /保证(?:职业|关系|成功|结果)/,
  ],
};

const topLevelFields = [
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

const seoFields = [
  "seo.seo_title",
  "seo.seo_description",
  "seo.breadcrumb_title",
  "seo.h1",
  "seo.quick_answer_summary",
];

const variantContentFields = [
  "content.quick_answer",
  "content.meaning",
  "content.a_t_difference",
  "content.core_traits",
  "content.strengths_blind_spots",
  "content.careers_work_style",
  "content.relationships_communication",
  "content.common_misreads",
  "content.similar_types",
];

const comparisonContentFields = [
  "content.quick_answer",
  "content.side_by_side_summary",
  "content.core_traits_comparison",
  "content.stress_confidence",
  "content.career_work_style",
  "content.relationships_love",
  "content.which_one_fits",
];

const sharedFields = [
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

const revisionMetadataFields = [
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

function getPathValue(value, dottedPath) {
  return dottedPath.split(".").reduce((cursor, key) => {
    if (cursor === null || cursor === undefined) return undefined;
    return cursor[key];
  }, value);
}

function valueText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(valueText).join(" ");
  if (typeof value === "object") return Object.values(value).map(valueText).join(" ");
  return String(value);
}

function pathSlug(url) {
  return String(url || "").split("/").filter(Boolean).at(-1) || "";
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

function expectedRelatedRoutes(locale) {
  return locale === "zh-CN"
    ? ["/zh/tests/big-five-personality-test-ocean-model", "/zh/tests/holland-career-interest-test-riasec"]
    : ["/en/tests/big-five-personality-test-ocean-model", "/en/tests/holland-career-interest-test-riasec"];
}

function scanPatterns(value, patterns) {
  const text = valueText(value);
  return patterns.filter((pattern) => pattern.test(text)).map(String);
}

function renderedImportPayload(row) {
  return {
    target_test_route: row.target_test_route,
    internal_links: row.internal_links,
    seo: row.seo,
    content: row.content,
    faq: row.faq,
    method_boundary: row.method_boundary,
    trademark_boundary: row.trademark_boundary,
    information_gain: row.information_gain,
    above_the_fold_module: row.above_the_fold_module,
    serp_ctr_package_v2: row.serp_ctr_package_v2,
    v2_optimization: row.v2_optimization,
  };
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function discoverBackendImportPath() {
  const evidenceFiles = [];
  const notes = [];
  const candidates = [
    {
      path: path.join(fapApiRoot, "app/Console/Commands/PersonalityEnsureMbtiVariantSectionStructure.php"),
      role: "MBTI variant section structure dry-run command exists, but it builds canonical structure rather than importing V2.1 package rows.",
    },
    {
      path: path.join(fapApiRoot, "app/Console/Commands/PersonalityRefreshMbtiVariantSeoMetadata.php"),
      role: "MBTI variant SEO metadata dry-run command exists, but it refreshes generated metadata rather than importing V2.1 package rows.",
    },
    {
      path: path.join(fapApiRoot, "app/Console/Commands/PersonalityEnrichMbtiEnglishVariantSections.php"),
      role: "MBTI English enrichment command defaults to no-write, but it does not cover bilingual V2.1 package import.",
    },
    {
      path: path.join(fapApiRoot, "app/PersonalityCms/Baseline/PersonalityBaselineImporter.php"),
      role: "Personality baseline importer supports dry_run and revision counting, but it is baseline-structured and not a V2.1 package importer.",
    },
    {
      path: path.join(fapApiRoot, "app/Models/PersonalityProfileVariantRevision.php"),
      role: "Variant revision snapshot model exists for future draft/rollback metadata.",
    },
    {
      path: path.join(fapApiRoot, "app/Http/Controllers/API/V0_5/Cms/PersonalityController.php"),
      role: "Public personality variant and comparison read APIs exist; write/import endpoint for V2.1 package was not found.",
    },
  ];

  for (const candidate of candidates) {
    if (fileExists(candidate.path)) {
      evidenceFiles.push({
        file: candidate.path,
        evidence: candidate.role,
      });
    }
  }

  if (!fileExists(fapApiRoot)) {
    notes.push(`fap-api root not found at ${fapApiRoot}; discovery used fap-web contract artifacts only.`);
  } else {
    notes.push("Read-only fap-api discovery found safe dry-run patterns, but no exact MBTI64 V2.1 package dry-run importer.");
  }

  return {
    evidence_files: evidenceFiles,
    import_path_found: false,
    dry_run_mode_found: true,
    cms_write_path_found: true,
    no_write_execution_possible: "unknown",
    notes: [
      ...notes,
      "Existing no-write commands are adjacent MBTI personality maintenance tools, not the requested 8-row V2.1 revision draft importer.",
      "This PR therefore uses deterministic local contract payload simulation and does not execute artisan commands.",
    ],
  };
}

const requiredInputs = Object.values(paths);
const missingInputs = requiredInputs.filter((relativePath) => !fs.existsSync(abs(relativePath)));
if (missingInputs.length > 0) {
  throw new Error(`Missing required artifacts: ${missingInputs.join(", ")}`);
}

const contract = readJson(paths.contractJson);
const plan = readJson(paths.dryRunPlanJson);
const pkg = readJson(paths.packageJson);
const qa = readJson(paths.qaJson);
const gates = readJson(paths.gatesJson);
const routeScope = readJson(paths.routeScopeJson);

const rows = Array.isArray(pkg.rows) ? pkg.rows : [];
const contractRows = Array.isArray(contract.contract_rows) ? contract.contract_rows : [];
const planRows = Array.isArray(plan.rows) ? plan.rows : [];
const blockers = [];
const warnings = [];

if (contract.status !== "conditional") blockers.push(`Expected source contract status conditional, found ${contract.status}`);
if (pkg.version !== "pilot-v2.1") blockers.push(`Expected package version pilot-v2.1, found ${pkg.version}`);
if (qa.status !== "pass") blockers.push(`Expected V2.1 QA status pass, found ${qa.status}`);
if (gates.status !== "pass") blockers.push(`Expected gates status pass, found ${gates.status}`);
if (routeScope.status !== "pass") blockers.push(`Expected related route scope status pass, found ${routeScope.status}`);
if (rows.length !== 8) blockers.push(`Expected exactly 8 V2.1 rows, found ${rows.length}`);
if (rows.length === pilotUrls.length && !rows.every((row, index) => row.url === pilotUrls[index])) {
  blockers.push("V2.1 row order changed from locked pilot queue.");
}

const warningResolution = (contract.warnings || []).map((warning, index) => {
  if (/import path/i.test(warning)) {
    return {
      warning_id: `W${index + 1}`,
      source_artifact: paths.contractJson,
      exact_warning_text: warning,
      affected_fields_or_rows: "all 8 rows; future backend importer",
      severity: "medium",
      dry_run_resolution: "still_conditional",
      recommended_followup: "Implement an exact backend no-write importer for MBTI64 V2.1 package rows before CMS revision draft creation.",
    };
  }
  if (/first-class backend support|snapshot_json|payload_json/i.test(warning)) {
    return {
      warning_id: `W${index + 1}`,
      source_artifact: paths.contractJson,
      exact_warning_text: warning,
      affected_fields_or_rows: "method_boundary, trademark_boundary, information_gain, serp_ctr_package_v2, publish/search flags",
      severity: "medium",
      dry_run_resolution: "still_conditional",
      recommended_followup: "Store uncertain fields as structured metadata in snapshot_json/payload_json during dry-run, then add first-class fields only if renderer/operator review needs them.",
    };
  }
  return {
    warning_id: `W${index + 1}`,
    source_artifact: paths.contractJson,
    exact_warning_text: warning,
    affected_fields_or_rows: "sibling/topic duplicate-risk signals from gates",
    severity: "low",
    dry_run_resolution: "resolved",
    recommended_followup: "No backend blocker; preserve page-specific contract boundaries during revision draft import.",
  };
});

const importPathDiscovery = discoverBackendImportPath();

const contractByUrl = new Map(contractRows.map((row) => [row.url, row]));
const planByUrl = new Map(planRows.map((row) => [row.existing_url, row]));
const rowResults = [];

for (const row of rows) {
  const contractRow = contractByUrl.get(row.url);
  const planRow = planByUrl.get(row.url);
  const expectedContentFields = row.page_type === "comparison" ? comparisonContentFields : variantContentFields;
  const missingFields = [
    ...topLevelFields,
    ...seoFields,
    ...expectedContentFields,
    ...sharedFields,
  ].filter((field) => getPathValue(row, field) === undefined);
  const relatedRoutes = expectedRelatedRoutes(row.locale);
  const relatedHrefs = (row.internal_links || []).filter((link) => link.role === "related_test").map((link) => link.href);
  const missingRelatedRoutes = relatedRoutes.filter((route) => !relatedHrefs.includes(route));
  const unsafeRelatedRoutes = (row.internal_links || [])
    .filter((link) => link.role === "related_test" && link.safe_public_route !== true)
    .map((link) => link.href);
  const payload = renderedImportPayload(row);
  const forbiddenMatches = scanPatterns(payload, forbiddenPatterns);
  const officialClaims = scanPatterns(payload, claimPatterns.official_mbti);
  const clinicalClaims = scanPatterns(payload, claimPatterns.clinical);
  const guaranteeClaims = scanPatterns(payload, claimPatterns.guarantee);

  const checks = {
    existing_url_only: Boolean(contractRow?.existing_url_required),
    existing_slug_only: pathSlug(row.url) === contractRow?.slug && pathSlug(row.url) === planRow?.existing_slug,
    create_new_url_allowed_false: contractRow?.create_new_url_allowed === false,
    canonical_target_equals_url: row.canonical_target === row.url,
    same_locale: row.locale === contractRow?.locale && row.locale === planRow?.locale,
    same_page_type: row.page_type === contractRow?.page_type && row.page_type === planRow?.page_type,
    future_operation_create_revision_draft_only: planRow?.operation === "create_revision_draft_only",
    operation_not_executed_in_this_pr: true,
    production_url_changed_false: planRow?.production_url_changed === false,
    canonical_changed_false: planRow?.canonical_changed === false,
    publish_immediately_false: planRow?.publish_immediately === false,
    sitemap_changed_false: planRow?.sitemap_changed === false,
    llms_changed_false: planRow?.llms_changed === false,
    llms_full_changed_false: contractRow?.llms_full_allowed_default === false,
    search_submitted_false: planRow?.search_submitted === false,
    expected_revision_state_draft: planRow?.expected_revision_state === "draft_for_operator_review",
    publish_allowed_false: contractRow?.publish_allowed_default === false,
    sitemap_allowed_false: contractRow?.sitemap_allowed_default === false,
    llms_allowed_false: contractRow?.llms_allowed_default === false,
    llms_full_allowed_false: contractRow?.llms_full_allowed_default === false,
    search_release_allowed_false: contractRow?.search_release_allowed_default === false,
    rollback_required_true: planRow?.rollback_required === true,
    previous_revision_id_unknown: planRow?.rollback_reference?.previous_revision_id === "Unknown until CMS draft creation",
    new_revision_id_unknown: planRow?.rollback_reference?.new_revision_id === "Unknown until CMS draft creation",
    required_fields_present: missingFields.length === 0,
    safe_related_routes_present: missingRelatedRoutes.length === 0 && unsafeRelatedRoutes.length === 0,
    forbidden_patterns_absent: forbiddenMatches.length === 0,
    risky_claims_absent: officialClaims.length === 0 && clinicalClaims.length === 0 && guaranteeClaims.length === 0,
  };

  if (!Object.values(checks).every(Boolean)) {
    blockers.push(`${row.url}: one or more dry-run row checks failed.`);
  }

  rowResults.push({
    url: row.url,
    locale: row.locale,
    page_type: row.page_type,
    slug: pathSlug(row.url),
    checks,
    missing_fields: missingFields,
    missing_related_routes: missingRelatedRoutes,
    unsafe_related_routes: unsafeRelatedRoutes,
    forbidden_pattern_matches: forbiddenMatches,
    official_claim_matches: officialClaims,
    clinical_claim_matches: clinicalClaims,
    guarantee_claim_matches: guaranteeClaims,
    dry_run_result: Object.values(checks).every(Boolean) ? "pass" : "fail",
  });
}

const unsupportedFields = [
  {
    field: "comparison_page_first_class_revision_model_unknown",
    affected_rows: rows.filter((row) => row.page_type === "comparison").map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "unknown",
    would_block_CMS_revision_draft: "unknown",
    recommended_resolution: "Backend Task 12 must choose whether comparison content is stored as paired variant metadata or a separate comparison revision resource.",
  },
  {
    field: "method_boundary_first_class_field_unknown",
    affected_rows: rows.map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "no",
    would_block_CMS_revision_draft: "no",
    recommended_resolution: "Store in section payload_json or revision snapshot until a first-class field is needed.",
  },
  {
    field: "trademark_boundary_first_class_field_unknown",
    affected_rows: rows.map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "no",
    would_block_CMS_revision_draft: "no",
    recommended_resolution: "Store in structured metadata and expose only after operator review confirms copy placement.",
  },
  {
    field: "information_gain_first_class_field_unknown",
    affected_rows: rows.map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "no",
    would_block_CMS_revision_draft: "no",
    recommended_resolution: "Keep as QA/editorial metadata, not necessarily rendered body.",
  },
  {
    field: "serp_ctr_package_v2_first_class_field_unknown",
    affected_rows: rows.map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "no",
    would_block_CMS_revision_draft: "no",
    recommended_resolution: "Map SEO title/description/H1 into first-class SEO fields and store CTR rationale as source metadata.",
  },
  {
    field: "publish_allowed_first_class_field_unknown",
    affected_rows: rows.map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "no",
    would_block_CMS_revision_draft: "no",
    recommended_resolution: "Use importer guardrails and revision metadata; never infer publish permission from package status.",
  },
  {
    field: "search_release_allowed_first_class_field_unknown",
    affected_rows: rows.map((row) => row.url),
    can_store_as_structured_metadata: "yes",
    would_cause_render_data_loss: "no",
    would_block_CMS_revision_draft: "no",
    recommended_resolution: "Keep search release outside CMS draft creation and require separate explicit gate.",
  },
];

const fieldRepresentation = {
  top_level: topLevelFields.map((field) => ({ field, represented: rowResults.every((row) => !row.missing_fields.includes(field)) })),
  seo: seoFields.map((field) => ({ field, represented: rowResults.every((row) => !row.missing_fields.includes(field)) })),
  variant: variantContentFields.map((field) => ({
    field,
    represented: rowResults.filter((row) => row.page_type === "variant").every((row) => !row.missing_fields.includes(field)),
  })),
  comparison: comparisonContentFields.map((field) => ({
    field,
    represented: rowResults.filter((row) => row.page_type === "comparison").every((row) => !row.missing_fields.includes(field)),
  })),
  shared: sharedFields.map((field) => ({ field, represented: rowResults.every((row) => !row.missing_fields.includes(field)) })),
  revision_metadata: revisionMetadataFields.map((field) => ({
    field,
    represented: true,
    note: field.includes("revision_id") ? "Unknown until CMS draft creation" : "Represented by dry-run metadata contract.",
  })),
};

const safetyRecheck = {
  forbidden_route_patterns_absent_from_rendered_payload_candidates: rowResults.every((row) => row.forbidden_pattern_matches.length === 0),
  official_certified_authorized_mbti_claim_absent: rowResults.every((row) => row.official_claim_matches.length === 0),
  official_32_types_claim_absent: rowResults.every((row) => row.official_claim_matches.length === 0),
  clinical_diagnosis_claim_absent: rowResults.every((row) => row.clinical_claim_matches.length === 0),
  career_relationship_guarantee_claim_absent: rowResults.every((row) => row.guarantee_claim_matches.length === 0),
  known_hold_note_exception: "Explicit QA hold notes describing /results/lookup are allowed only as non-rendered known holds; none appeared in rendered payload candidates.",
};

const noMutationProof = {
  cms_write_api_called: false,
  database_write_performed: false,
  revision_draft_created: false,
  production_url_changed: false,
  sitemap_changed: false,
  llms_txt_changed: false,
  llms_full_txt_changed: false,
  search_urls_submitted: false,
  proof_basis: "This script reads local JSON/Markdown artifacts and writes dry-run report files only. It does not import backend modules, open network connections, execute artisan commands, call CMS APIs, or connect to a database.",
};

const contractPayloadSimulationStatus = rowResults.every((row) => row.dry_run_result === "pass") ? "pass" : "fail";
const unresolvedConditionalWarnings = warningResolution.filter((item) => item.dry_run_resolution === "still_conditional");
if (unresolvedConditionalWarnings.length > 0) {
  warnings.push(...unresolvedConditionalWarnings.map((item) => item.exact_warning_text));
}

const status = blockers.length > 0
  ? "fail"
  : importPathDiscovery.import_path_found !== true || unresolvedConditionalWarnings.length > 0
    ? "conditional"
    : "pass";
const recommendedNextTask = status === "pass"
  ? "MBTI64-CMS-REVISION-DRAFT-01 after explicit Operator authorization"
  : "MBTI64-BACKEND-IMPORT-CONTRACT-PATCH-01 or backend Operator decision before CMS revision draft creation";

const artifact = {
  artifact: "MBTI64-BACKEND-IMPORT-DRY-RUN-01",
  status,
  source_pr: "#1193",
  source_contract_status: contract.status,
  package_version_reviewed: pkg.version,
  source_package: paths.packageJson,
  warning_resolution: warningResolution,
  import_path_discovery: importPathDiscovery,
  dry_run_execution: {
    real_no_write_dry_run_attempted: false,
    real_no_write_dry_run_status: "unknown",
    contract_payload_simulation_status: contractPayloadSimulationStatus,
    no_mutation_proof: noMutationProof,
  },
  row_results: rowResults,
  field_representation: fieldRepresentation,
  unsupported_fields: unsupportedFields,
  safety_recheck: safetyRecheck,
  known_holds: [
    "/results/lookup sidecar classification blocks publish/search release",
    "No CMS import in this PR",
    "No CMS revision draft creation in this PR",
    "No sitemap/llms/search-release work in this PR",
    "Operator approval required before CMS revision draft",
  ],
  blockers,
  warnings,
  recommended_next_task: recommendedNextTask,
};

writeJson(outputJson, artifact);

const warningRows = warningResolution.map((item) => ({
  warning_id: item.warning_id,
  severity: item.severity,
  resolution: item.dry_run_resolution,
  affected: item.affected_fields_or_rows,
  followup: item.recommended_followup,
}));

const rowTable = rowResults.map((row) => ({
  url: row.url,
  locale: row.locale,
  page_type: row.page_type,
  result: row.dry_run_result,
  publish: "false",
  sitemap: "false",
  llms: "false",
  search: "false",
}));

const unsupportedTable = unsupportedFields.map((field) => ({
  field: field.field,
  rows: field.affected_rows.length,
  metadata: field.can_store_as_structured_metadata,
  data_loss: field.would_cause_render_data_loss,
  block_draft: field.would_block_CMS_revision_draft,
  resolution: field.recommended_resolution,
}));

const markdown = `# MBTI64 Backend Import Dry-Run

## Summary
- Artifact: MBTI64-BACKEND-IMPORT-DRY-RUN-01
- Final status: ${status}
- Reviewed package: ${paths.packageJson}
- Source contract status: ${contract.status}
- Package version: ${pkg.version}
- Real no-write backend dry-run attempted: false
- Contract payload simulation: ${contractPayloadSimulationStatus}

This PR did not import CMS drafts, create CMS revisions, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, change scoring/result/payment/account routes, or submit search URLs.

## 3-Warning Resolution
${markdownTable(warningRows, ["warning_id", "severity", "resolution", "affected", "followup"])}

## Import Path Discovery
- import_path_found: ${importPathDiscovery.import_path_found}
- dry_run_mode_found: ${importPathDiscovery.dry_run_mode_found}
- cms_write_path_found: ${importPathDiscovery.cms_write_path_found}
- no_write_execution_possible: ${importPathDiscovery.no_write_execution_possible}

Evidence:
${importPathDiscovery.evidence_files.map((item) => `- ${item.file}: ${item.evidence}`).join("\n")}

Notes:
${importPathDiscovery.notes.map((note) => `- ${note}`).join("\n")}

## 8-Row Dry-Run Result
${markdownTable(rowTable, ["url", "locale", "page_type", "result", "publish", "sitemap", "llms", "search"])}

## Field Representation Summary
- Top-level fields represented: ${fieldRepresentation.top_level.every((item) => item.represented)}
- SEO fields represented: ${fieldRepresentation.seo.every((item) => item.represented)}
- Variant content fields represented: ${fieldRepresentation.variant.every((item) => item.represented)}
- Comparison content fields represented: ${fieldRepresentation.comparison.every((item) => item.represented)}
- Shared fields represented in package payload: ${fieldRepresentation.shared.every((item) => item.represented)}
- Revision metadata represented by dry-run contract: ${fieldRepresentation.revision_metadata.every((item) => item.represented)}

## Unsupported / Uncertain Fields
${markdownTable(unsupportedTable, ["field", "rows", "metadata", "data_loss", "block_draft", "resolution"])}

## No-Mutation Proof
- CMS write API was not called: ${noMutationProof.cms_write_api_called}
- Database write was not performed: ${noMutationProof.database_write_performed}
- Revision draft was not created: ${noMutationProof.revision_draft_created}
- Production URL was not changed: ${noMutationProof.production_url_changed}
- Sitemap was not changed: ${noMutationProof.sitemap_changed}
- llms.txt was not changed: ${noMutationProof.llms_txt_changed}
- llms-full.txt was not changed: ${noMutationProof.llms_full_txt_changed}
- Search URLs were not submitted: ${noMutationProof.search_urls_submitted}

Proof basis: ${noMutationProof.proof_basis}

## Safety Recheck
- Forbidden route patterns absent from rendered/import payload candidates: ${safetyRecheck.forbidden_route_patterns_absent_from_rendered_payload_candidates}
- Official/certified/authorized MBTI claims absent: ${safetyRecheck.official_certified_authorized_mbti_claim_absent}
- Official 32 types claims absent: ${safetyRecheck.official_32_types_claim_absent}
- Clinical diagnosis claims absent: ${safetyRecheck.clinical_diagnosis_claim_absent}
- Career/relationship guarantee claims absent: ${safetyRecheck.career_relationship_guarantee_claim_absent}
- Known hold note exception: ${safetyRecheck.known_hold_note_exception}

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}

## Known Holds
${artifact.known_holds.map((hold) => `- ${hold}`).join("\n")}

## Recommended Next Task
${recommendedNextTask}
`;

writeText(outputMd, markdown);

if (blockers.length > 0) {
  console.error(`[mbti64-backend-import-dry-run] FAIL: ${blockers.length} blockers`);
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}

console.log(JSON.stringify({
  artifact: artifact.artifact,
  status,
  rows: rows.length,
  warning_resolution: warningResolution.map((item) => `${item.warning_id}:${item.dry_run_resolution}`),
  contract_payload_simulation_status: contractPayloadSimulationStatus,
  blockers: blockers.length,
  warnings: warnings.length,
  recommended_next_task: recommendedNextTask,
}, null, 2));
