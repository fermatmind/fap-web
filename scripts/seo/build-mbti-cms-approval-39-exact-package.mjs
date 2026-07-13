#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-13T15:00:00.000Z";
const BASE_URL = "https://fermatmind.com";
const OUTPUT_BASE = "docs/seo/personality/mbti-cms-approval-39-exact-package-2026-07-13";
const HASH_MANIFEST = "docs/seo/personality/mbti-cms-approval-39-hash-manifest-2026-07-13.json";
const URL_LIST = "docs/seo/personality/mbti-cms-approval-39-exact-url-list-2026-07-13.txt";
const PROFILE_PACKAGES = [
  "docs/seo/personality/mbti-profile-nt-31-content-package-2026-07-13.json",
  "docs/seo/personality/mbti-profile-nf-32-content-package-2026-07-13.json",
  "docs/seo/personality/mbti-profile-sj-33-content-package-2026-07-13.json",
  "docs/seo/personality/mbti-profile-sp-34-content-package-2026-07-13.json",
];
const AT_PACKAGE = "docs/seo/personality/mbti-comp-at-35-content-assets-2026-07-13.json";
const QA_PACKAGE = "docs/seo/personality/mbti-full-qa-36-semantic-release-gate-2026-07-13.json";
const EXPECTED_VERIFY_ONLY = new Set([
  "/zh/personality/istj-a",
  "/zh/personality/esfj-a",
  "/zh/personality/istp-a",
  "/zh/personality/isfp-a",
  "/zh/personality/intp-a-vs-intp-t",
  "/zh/personality/intj-vs-intp",
  "/zh/personality/entj-vs-intj",
  "/zh/personality/infj-vs-infp",
  "/zh/personality/istj-vs-isfj",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function write(relativePath, content) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sha256Json(value) {
  return sha256(JSON.stringify(value));
}

function sectionMap(fields) {
  return new Map((fields.sections ?? []).map((section) => [section.key, section]));
}

function sectionBody(sections, key) {
  const value = sections.get(key)?.body;
  assert(typeof value === "string" && value.trim().length > 0, `Missing required section body: ${key}`);
  return value;
}

function sourceDescriptor(relativePath) {
  const source = readJson(relativePath);
  return {
    path: relativePath,
    file_sha256: sha256(read(relativePath)),
    declared_package_sha256: source.package_sha256 ?? null,
    artifact: source.artifact ?? null,
    final_decision: source.final_decision ?? null,
  };
}

function profileImportPayload(asset) {
  const fields = asset.cms_fields;
  assert(fields && typeof fields === "object", `Profile CMS fields missing: ${asset.path}`);
  const sections = sectionMap(fields);
  const code = `${asset.mbti_type}-${asset.variant}`;
  const canonical = `${BASE_URL}${asset.path}`;
  return {
    url: asset.path,
    locale: "zh-CN",
    page_type: "variant",
    canonical_target: asset.path,
    identity: {
      canonical_type_code: asset.mbti_type,
      variant_code: asset.variant,
      runtime_type_code: code,
    },
    seo: {
      seo_title: fields.title,
      seo_description: fields.meta_description,
      breadcrumb_title: fields.h1,
      h1: fields.h1,
      quick_answer_summary: fields.direct_answer,
    },
    content: {
      quick_answer: fields.direct_answer,
      definition: sectionBody(sections, "definition"),
      suitable_for: sectionBody(sections, "suitable_for"),
      not_suitable_for: sectionBody(sections, "not_suitable_for"),
      common_misconception: sectionBody(sections, "common_misread"),
      base_type_difference: sectionBody(sections, "base16_difference"),
      at_difference: sectionBody(sections, "at_difference"),
      career_scenarios: sectionBody(sections, "career_scenarios"),
      relationship_scenarios: sectionBody(sections, "relationship_scenarios"),
      stress_scenarios: sectionBody(sections, "stress_scenarios"),
    },
    content_sections: fields.sections,
    faq: fields.faq,
    internal_links: fields.internal_links,
    structured_metadata: {
      primary_query: asset.query_fit?.primary ?? code,
      secondary_queries: asset.query_fit?.secondary ?? [],
      source_document: asset.source_ledger ?? [],
      claim_boundary: asset.claim_boundary ?? {},
      route_safety: "public_routes_only",
    },
    canonical,
    robots: "noindex,follow",
    import_visibility: {
      draft_only: true,
      no_public_promotion: true,
      no_indexability_mutation: true,
      no_sitemap_mutation: true,
      no_llms_mutation: true,
    },
  };
}

function comparisonImportPayload(asset) {
  const fields = asset.cms_fields;
  assert(fields && typeof fields === "object", `Comparison CMS fields missing: ${asset.path}`);
  const sections = sectionMap(fields);
  const [left, right] = [asset.comparison_pair?.left, asset.comparison_pair?.right];
  assert(left && right, `A/T comparison pair missing: ${asset.path}`);
  const canonical = `${BASE_URL}${asset.path}`;
  return {
    url: asset.path,
    locale: "zh-CN",
    page_type: "comparison",
    comparison_kind: "at",
    canonical_target: asset.path,
    identity: {
      comparison_kind: "at",
      comparison_slug: asset.path.split("/").at(-1),
      base_type_code: left.slice(0, 4),
      left_type_code: left,
      right_type_code: right,
    },
    seo: {
      seo_title: fields.title,
      seo_description: fields.meta_description,
      breadcrumb_title: fields.h1,
      h1: fields.h1,
      quick_answer_summary: fields.direct_answer,
    },
    content: {
      quick_answer: fields.direct_answer,
      max_difference: sectionBody(sections, "biggest_difference"),
      quick_judgment_table: fields.quick_judgment_table,
      confusion_reason: sectionBody(sections, "easy_misread"),
      real_scene_differences: [
        sectionBody(sections, "work_scenarios"),
        sectionBody(sections, "relationship_scenarios"),
        sectionBody(sections, "stress_scenarios"),
      ],
      misjudgment_warning: sectionBody(sections, "do_not_misjudge"),
    },
    content_sections: fields.sections,
    faq: fields.faq,
    internal_links: fields.internal_links,
    structured_metadata: {
      primary_query: asset.query_fit?.primary ?? `${left} vs ${right}`,
      secondary_queries: asset.query_fit?.secondary ?? [],
      source_document: asset.source_refs ?? [],
      route_safety: "public_routes_only",
    },
    canonical,
    robots: "noindex,follow",
    import_visibility: {
      draft_only: true,
      no_public_promotion: true,
      no_indexability_mutation: true,
      no_sitemap_mutation: true,
      no_llms_mutation: true,
    },
  };
}

function fieldMapping(kind) {
  if (kind === "profile") {
    return {
      cms_resource: "personality_profile",
      target_tables: [
        "personality_profile_variants",
        "personality_profile_variant_revisions",
        "personality_profile_variant_sections",
        "personality_profile_variant_seo_meta",
      ],
      fields: {
        "seo.seo_title": "personality_profile_variant_seo_meta.title",
        "seo.seo_description": "personality_profile_variant_seo_meta.meta_description",
        "seo.breadcrumb_title": "personality_profile_variant_seo_meta.breadcrumb_title",
        "seo.h1": "personality_profile_variant_revisions.snapshot_json.h1",
        "seo.quick_answer_summary": "personality_profile_variant_revisions.snapshot_json.quick_answer_summary",
        content: "personality_profile_variant_revisions.snapshot_json.content",
        content_sections: "personality_profile_variant_sections",
        faq: "personality_profile_variant_revisions.snapshot_json.faq",
        internal_links: "personality_profile_variant_revisions.snapshot_json.internal_links",
        structured_metadata: "personality_profile_variant_revisions.snapshot_json.structured_metadata",
      },
    };
  }
  return {
    cms_resource: "personality_comparison",
    target_tables: [
      "personality_profile_sections",
      "comparison_public_projection_v1",
    ],
    fields: {
      "seo.seo_title": "comparison_public_projection_v1.seo.title",
      "seo.seo_description": "comparison_public_projection_v1.seo.meta_description",
      "seo.breadcrumb_title": "comparison_public_projection_v1.seo.breadcrumb_title",
      "seo.h1": "comparison_public_projection_v1.seo.h1",
      "seo.quick_answer_summary": "comparison_public_projection_v1.seo.quick_answer_summary",
      content: "comparison_public_projection_v1.content",
      content_sections: "comparison_public_projection_v1.sections",
      faq: "comparison_public_projection_v1.faq",
      internal_links: "comparison_public_projection_v1.internal_links",
      structured_metadata: "comparison_public_projection_v1.structured_metadata",
    },
  };
}

function recordFrom({ asset, qa }) {
  const kind = qa.kind === "profile" ? "profile" : "at_comparison";
  const payload = kind === "profile" ? profileImportPayload(asset) : comparisonImportPayload(asset);
  const slug = asset.path.split("/").at(-1);
  const code = kind === "profile" ? `${asset.mbti_type}-${asset.variant}` : slug;
  const mapping = fieldMapping(kind);
  const cmsKey = kind === "profile"
    ? { locale: "zh-CN", framework: "mbti", profile_code: code, slug }
    : { locale: "zh-CN", framework: "mbti", comparison_slug: slug, left_code: asset.comparison_pair.left, right_code: asset.comparison_pair.right };
  const expectedPreState = {
    record_must_exist: true,
    locale: "zh-CN",
    framework: "mbti64",
    entity_kind: kind,
    cms_key: cmsKey,
    content_disposition: "needs_content_repair",
    public_projection_must_remain_unchanged_by_import: true,
  };
  const expectedPostState = {
    revision_staged: true,
    revision_visibility: "draft_only",
    content_payload_sha256: sha256Json(payload),
    public_projection_promoted: false,
    is_indexable_mutated: false,
    sitemap_eligibility_mutated: false,
    llms_eligibility_mutated: false,
  };
  return {
    approval_record_id: `mbti-cms-approval-39:${kind}:${slug}`,
    source_asset_id: asset.asset_id,
    target_path: asset.path,
    target_url: `${BASE_URL}${asset.path}`,
    locale: "zh-CN",
    slug,
    entity_kind: kind,
    code,
    cms_resource: mapping.cms_resource,
    cms_key: cmsKey,
    expected_pre_state: expectedPreState,
    expected_post_state: expectedPostState,
    field_mapping: mapping,
    import_payload: payload,
    exact_payload_sha256: sha256Json(payload),
    rollback_expectations: {
      atomic_batch_required: true,
      rollback_on_any_record_failure: true,
      no_partial_batch: true,
      rollback_target: "remove only the staged revision created by this exact payload; do not mutate the existing public projection",
    },
    readback_expectations: {
      cms_key: cmsKey,
      exact_payload_sha256: sha256Json(payload),
      required_fields_present: ["seo", "content", "content_sections", "faq", "internal_links", "structured_metadata"],
      public_indexability_unchanged_until_separate_promotion: true,
    },
    manual_review: {
      decision: "approved_for_fail_closed_importer_preflight",
      reviewed_against: "MBTI-FULL-QA-36",
      qa_decision: qa.qa_decision,
      production_import_authorized: false,
      notes: "Approval permits only the future importer preflight and dry-run contract. A separate exact authorization is required before any production CMS write.",
    },
  };
}

function buildReport() {
  const profileSources = PROFILE_PACKAGES.map(sourceDescriptor);
  const atSource = sourceDescriptor(AT_PACKAGE);
  const qaSource = sourceDescriptor(QA_PACKAGE);
  const qa = readJson(QA_PACKAGE);
  assert(qa.final_decision === "PASS_MBTI_FULL_QA_36_CMS_DRY_RUN_READY", "QA-36 is not ready for approval packaging");

  const assets = new Map();
  for (const packagePath of PROFILE_PACKAGES) {
    for (const asset of readJson(packagePath).assets ?? []) assets.set(asset.path, asset);
  }
  for (const asset of readJson(AT_PACKAGE).assets ?? []) assets.set(asset.path, asset);

  const qaRows = qa.page_results ?? [];
  assert(qaRows.length === 52, `QA-36 record count mismatch: ${qaRows.length}`);
  const repairRows = qaRows.filter((row) => row.change_mode === "repair");
  const verifyOnlyRows = qaRows.filter((row) => row.change_mode === "verify_only");
  assert(repairRows.length === 43, `Expected 43 repair records, found ${repairRows.length}`);
  assert(verifyOnlyRows.length === 9, `Expected 9 verify-only records, found ${verifyOnlyRows.length}`);
  assert(repairRows.every((row) => row.qa_decision === "APPROVED_FOR_CMS_DRY_RUN"), "A repair record lacks QA approval");
  assert(verifyOnlyRows.every((row) => EXPECTED_VERIFY_ONLY.has(row.path)), "Unexpected verify-only route");
  assert(verifyOnlyRows.every((row) => !assets.has(row.path) || row.kind !== "hot_comparison"), "Verify-only profile/A-T source asset should not be packaged for repair");

  const records = repairRows.map((qaRow) => {
    const asset = assets.get(qaRow.path);
    assert(asset, `Missing repair asset: ${qaRow.path}`);
    return recordFrom({ asset, qa: qaRow });
  });
  const profileRecords = records.filter((record) => record.entity_kind === "profile");
  const atRecords = records.filter((record) => record.entity_kind === "at_comparison");
  assert(profileRecords.length === 28, `Expected 28 profile repair records, found ${profileRecords.length}`);
  assert(atRecords.length === 15, `Expected 15 A/T repair records, found ${atRecords.length}`);
  assert(new Set(records.map((record) => record.target_path)).size === 43, "Repair routes must be unique");
  assert(records.every((record) => !EXPECTED_VERIFY_ONLY.has(record.target_path)), "Verify-only route entered repair package");

  const sourceManifest = {
    source_schema_version: "mbti-cms-approval-39-source-manifest-v1",
    profile_packages: profileSources,
    at_comparison_package: atSource,
    qa_gate: qaSource,
  };
  const sourcePackageSha256 = sha256Json(sourceManifest);
  const authorizationPayload = {
    package_id: "mbti-cms-approval-39-exact-package-2026-07-13",
    source_package_sha256: sourcePackageSha256,
    import_scope_mode: "full_chinese_mbti_repair_batch_only",
    record_count: records.length,
    records: records.map((record) => ({
      approval_record_id: record.approval_record_id,
      target_path: record.target_path,
      locale: record.locale,
      slug: record.slug,
      entity_kind: record.entity_kind,
      exact_payload_sha256: record.exact_payload_sha256,
      expected_pre_state: record.expected_pre_state,
      expected_post_state: record.expected_post_state,
      manual_review_decision: record.manual_review.decision,
    })),
  };
  const authorizationPayloadSha256 = sha256Json(authorizationPayload);

  const report = {
    id: "MBTI-CMS-APPROVAL-39",
    artifact: "MBTI-CMS-APPROVAL-39-EXACT-43-RECORD-REPAIR-APPROVAL-PACKAGE",
    generated_at: GENERATED_AT,
    status: "approved_for_fail_closed_importer_preflight",
    final_decision: "APPROVED_43_REPAIR_RECORDS_FOR_FAIL_CLOSED_IMPORTER_PREFLIGHT_NO_PRODUCTION_IMPORT_EXECUTED",
    source_manifest: sourceManifest,
    exact_package: {
      package_id: authorizationPayload.package_id,
      source_package_sha256: sourcePackageSha256,
      authorization_payload_sha256: authorizationPayloadSha256,
      import_scope_mode: authorizationPayload.import_scope_mode,
      record_count: records.length,
      production_import_authorized: false,
      production_import_executed: false,
    },
    summary: {
      repair_record_count: records.length,
      profile_repair_record_count: profileRecords.length,
      at_comparison_repair_record_count: atRecords.length,
      verify_only_record_count: verifyOnlyRows.length,
      approved_count: records.filter((record) => record.manual_review.decision.startsWith("approved")).length,
      needs_revision_count: 0,
    },
    repair_records: records,
    verify_only_records: verifyOnlyRows.map((row) => ({
      target_path: row.path,
      locale: "zh-CN",
      entity_kind: row.kind,
      manual_review_decision: "verify_only_existing_authority_no_repair_import",
      reason: "QA-36 verified existing authority; this record is intentionally excluded from the 43-record repair package.",
    })),
    manual_review: {
      approved: records.map((record) => record.target_path),
      needs_revision: [],
      decision: "approved_for_fail_closed_importer_preflight",
      production_import_authorized: false,
    },
    authorization_payload: authorizationPayload,
    safety_boundary: {
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      database_mutation_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_mutation_attempted: false,
      production_deploy_attempted: false,
    },
  };
  return report;
}

function buildHashManifest(report) {
  return {
    id: "MBTI-CMS-APPROVAL-39-HASH-MANIFEST",
    generated_at: GENERATED_AT,
    source_package_sha256: report.exact_package.source_package_sha256,
    authorization_payload_sha256: report.exact_package.authorization_payload_sha256,
    repair_record_count: report.repair_records.length,
    records: report.repair_records.map((record) => ({
      approval_record_id: record.approval_record_id,
      target_path: record.target_path,
      locale: record.locale,
      slug: record.slug,
      entity_kind: record.entity_kind,
      exact_payload_sha256: record.exact_payload_sha256,
    })),
  };
}

function renderMarkdown(report) {
  const lines = [
    "# MBTI-CMS-APPROVAL-39 Exact Repair Approval Package",
    "",
    `Final decision: \`${report.final_decision}\``,
    "",
    "## Exact Package",
    "",
    `- Repair records: \`${report.summary.repair_record_count}\``,
    `- Profile records: \`${report.summary.profile_repair_record_count}\``,
    `- A/T comparison records: \`${report.summary.at_comparison_repair_record_count}\``,
    `- Verify-only records excluded: \`${report.summary.verify_only_record_count}\``,
    `- Source package SHA256: \`${report.exact_package.source_package_sha256}\``,
    `- Authorization payload SHA256: \`${report.exact_package.authorization_payload_sha256}\``,
    `- Production import authorized: \`false\``,
    "",
    "## Approved Repair URLs",
    "",
    ...report.manual_review.approved.map((url) => `- ${url}`),
    "",
    "## Verify-Only Exclusions",
    "",
    ...report.verify_only_records.map((record) => `- ${record.target_path} (${record.entity_kind})`),
    "",
    "## Needs Revision",
    "",
    "- None. QA-36 approved all 43 repair records for importer preflight.",
    "",
    "## Import Boundary",
    "",
    "- This package authorizes no CMS write, production import, indexability, sitemap, llms, GSC, or deploy action.",
    "- A later importer must validate every expected pre-state, record hash, locale, slug, entity kind, and authorization payload before it can stage any revision.",
    "- Any future write must be atomic, draft-only, non-promoting, and separately authorized with these exact hashes.",
  ];
  return `${lines.join("\n")}\n`;
}

function renderCsv(report) {
  const header = [
    "approval_record_id",
    "target_path",
    "target_url",
    "locale",
    "slug",
    "entity_kind",
    "cms_resource",
    "payload_sha256",
    "manual_review_decision",
    "production_import_authorized",
  ];
  const rows = report.repair_records.map((record) => [
    record.approval_record_id,
    record.target_path,
    record.target_url,
    record.locale,
    record.slug,
    record.entity_kind,
    record.cms_resource,
    record.exact_payload_sha256,
    record.manual_review.decision,
    record.manual_review.production_import_authorized,
  ]);
  return `${[header, ...rows].map((row) => row.map((value) => csvEscape(value, { quoteAlways: false })).join(",")).join("\n")}\n`;
}

const report = buildReport();
const hashManifest = buildHashManifest(report);
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, renderMarkdown(report));
write(`${OUTPUT_BASE}.csv`, renderCsv(report));
write(URL_LIST, `${report.repair_records.map((record) => record.target_url).join("\n")}\n`);
write(HASH_MANIFEST, `${JSON.stringify(hashManifest, null, 2)}\n`);
console.log(JSON.stringify({
  ok: true,
  artifact: report.artifact,
  final_decision: report.final_decision,
  repair_record_count: report.summary.repair_record_count,
  profile_repair_record_count: report.summary.profile_repair_record_count,
  at_comparison_repair_record_count: report.summary.at_comparison_repair_record_count,
  verify_only_record_count: report.summary.verify_only_record_count,
  source_package_sha256: report.exact_package.source_package_sha256,
  authorization_payload_sha256: report.exact_package.authorization_payload_sha256,
}));
