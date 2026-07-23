#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-23T01:20:00+08:00";
const EDITORIAL_APPROVED_AT = "2026-07-23T08:40:09+08:00";
const APPROVED_PENDING_PACKAGE_SHA256 = "1c7e94b856725ee4aa4f5e50a07faf5fbba482099e52d6fb09dd5a1401866fb6";
const EDITORIAL_APPROVAL_STATEMENT =
  "I explicitly approve MBTI-CROSS-APPROVAL-48 operator editorial approval for exact package SHA 1c7e94b856725ee4aa4f5e50a07faf5fbba482099e52d6fb09dd5a1401866fb6 covering only enfp-vs-entp, estj-vs-entj, and isfp-vs-infp. This approval permits finalizing and merging PR #1801 and proceeding to MBTI-CROSS-PUBLISHER-49; it does not authorize production CMS/DB writes, publication/indexability changes, sitemap/llms changes, or search submission.";
const PACKAGE_PATH = "docs/seo/personality/mbti-cross-approval-48-package-2026-07-23.json";
const HASH_PATH = "docs/seo/personality/mbti-cross-approval-48-hash-manifest-2026-07-23.json";
const CONTRACT_PATH = "docs/seo/personality/mbti-cross-approval-48-rollback-readback-2026-07-23.md";
const SOURCE_PACKAGE = "mbti-cross-type-comparison-content-assets-draft-20260702";
const SOURCE_COMMIT = "1f78f9b2ed53d22c800c5560f12d381d17754bf3";
const SECTION_IDS = [
  "quick_answer",
  "why_they_are_confused",
  "shared_traits",
  "core_difference",
  "work_and_learning",
  "communication_and_relationships",
  "stress_and_growth",
  "misconceptions",
];
const SOURCES = [
  {
    slug: "enfp-vs-entp",
    snapshot: "docs/seo/personality/mbti-cross-approval-48-source-enfp-vs-entp-2026-07-02.json",
    original: "backend/docs/seo/import-packages/mbti-cross-type-comparison-content-assets-draft-20260702/comparisons/FermatMind_ENFP_vs_ENTP_CMS_READY.json",
    rawSha256: "725c9f4764040604e08d6b1a78939c5cdd5a4d642208eded6ebfafee0f99e147",
    staleDeclaredSha256: "907c8d9a4b20246b9c206af96f67a5fbc00c728fab1543481cdac6b5540eb6c1",
  },
  {
    slug: "estj-vs-entj",
    snapshot: "docs/seo/personality/mbti-cross-approval-48-source-estj-vs-entj-2026-07-02.json",
    original: "backend/docs/seo/import-packages/mbti-cross-type-comparison-content-assets-draft-20260702/comparisons/FermatMind_ESTJ_vs_ENTJ_CMS_READY.json",
    rawSha256: "3a7febb8c31848938c63e3a76375d6b2d2b48665b6bf3cf2afdd53d0cf39fe75",
    staleDeclaredSha256: "35a91214cc6c3e472b52e813cd1bb7ba2c492f1b8c2e442b2411bf68ad0428a2",
  },
  {
    slug: "isfp-vs-infp",
    snapshot: "docs/seo/personality/mbti-cross-approval-48-source-isfp-vs-infp-2026-07-02.json",
    original: "backend/docs/seo/import-packages/mbti-cross-type-comparison-content-assets-draft-20260702/comparisons/FermatMind_ISFP_vs_INFP_CMS_READY.json",
    rawSha256: "3c25e03b72812921964b9efcb0391af96793c4081f54a02bbf0c33f08e591ac5",
    staleDeclaredSha256: "0dc7d7852ad5c751aa9f03bb3c668590b0e8c71f418adff8b8276d8e7f0a8bea",
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256Json(value) {
  return sha256(JSON.stringify(stable(value)));
}

function textLength(value) {
  if (typeof value === "string") return value.trim().length;
  if (Array.isArray(value)) return value.reduce((total, item) => total + textLength(item), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((total, item) => total + textLength(item), 0);
  return 0;
}

function validateAsset(asset, source, raw) {
  assert(sha256(raw) === source.rawSha256, `${source.slug}: source snapshot raw SHA drift`);
  assert(asset.slug === source.slug, `${source.slug}: slug mismatch`);
  assert(asset.comparison_type === "mbti_cross_type", `${source.slug}: comparison type mismatch`);
  assert(asset.locale === "zh-CN", `${source.slug}: locale mismatch`);
  assert(/^[A-Z]{4}$/.test(asset.left_type) && /^[A-Z]{4}$/.test(asset.right_type), `${source.slug}: type identity missing`);
  for (const field of ["title", "seo_title", "seo_description", "summary", "claim_boundary"]) {
    assert(typeof asset[field] === "string" && asset[field].trim().length >= 20, `${source.slug}: ${field} missing or short`);
  }
  assert(Array.isArray(asset.sections) && asset.sections.length === SECTION_IDS.length, `${source.slug}: expected eight sections`);
  assert(JSON.stringify(asset.sections.map((section) => section.id)) === JSON.stringify(SECTION_IDS), `${source.slug}: section order mismatch`);
  for (const section of asset.sections) {
    assert(typeof section.title === "string" && section.title.trim().length > 0, `${source.slug}: section title missing`);
    assert(textLength(section) >= 80, `${source.slug}: section ${section.id} content is too short`);
  }
  assert(Array.isArray(asset.faq) && asset.faq.length === 8, `${source.slug}: expected eight FAQ entries`);
  assert(asset.faq.every((item) => textLength(item.question) >= 8 && textLength(item.answer) >= 20), `${source.slug}: incomplete FAQ`);
  assert(Array.isArray(asset.internal_links) && asset.internal_links.length === 7, `${source.slug}: expected seven internal links`);
  assert(asset.review_status === "draft", `${source.slug}: source review state must remain draft`);
  assert(asset.publish_status === "draft", `${source.slug}: source publish state must remain draft`);
  assert(asset.indexability_status === "pending_review", `${source.slug}: source indexability state must remain pending_review`);
}

function normalizeAssetForRuntime(asset) {
  return {
    ...asset,
    sections: asset.sections.map(({ groups, items, ...section }) => {
      const body = Array.isArray(section.body)
        ? section.body
        : Array.isArray(groups)
          ? groups.flatMap((group) => group.items.map((item) => `${group.title}：${item}`))
          : items;
      return { ...section, body };
    }),
    internal_links: asset.internal_links.map((link) => {
      const baseProfileMatch = link.href.match(/^\/zh\/personality\/([a-z]{4})$/);
      const profileType = baseProfileMatch?.[1]?.toUpperCase();
      return {
        label: profileType ? link.anchor_text.replace(profileType, `${profileType}-A`) : link.anchor_text,
        href: baseProfileMatch ? `${link.href}-a` : link.href,
        reason: profileType ? `${link.link_intent}（canonical ${profileType}-A 公开画像）` : link.link_intent,
      };
    }),
  };
}

function releasePayload(records) {
  return {
    schema_version: "mbti.cross_type_comparison.content_release_candidate.v1",
    phase: "content_revision_only",
    exact_slugs: records.map((record) => record.slug),
    records: records.map((record) => ({ slug: record.slug, content_sha256: record.content_sha256 })),
    invariants: {
      atomic_exact_three: true,
      keep_noindex: true,
      keep_out_of_sitemap: true,
      keep_out_of_llms: true,
      no_indexability_mutation: true,
    },
  };
}

async function build() {
  const records = [];
  for (const source of SOURCES) {
    const raw = await readFile(path.join(ROOT, source.snapshot), "utf8");
    const asset = JSON.parse(raw);
    validateAsset(asset, source, raw);
    const candidatePayload = normalizeAssetForRuntime(asset);
    assert(candidatePayload.sections.every((section) => Array.isArray(section.body) && section.body.length > 0), `${source.slug}: runtime body normalization failed`);
    assert(candidatePayload.internal_links.every((link) => link.label && link.href && link.reason), `${source.slug}: runtime link normalization failed`);
    assert(candidatePayload.internal_links.every((link) => !/^\/zh\/personality\/[a-z]{4}$/.test(link.href)), `${source.slug}: legacy base profile link remains`);
    const canonical = `https://fermatmind.com/zh/personality/${source.slug}`;
    const contentSha256 = sha256Json(candidatePayload);
    records.push({
      approval_record_id: `mbti-cross-approval-48:${source.slug}`,
      slug: source.slug,
      locale: "zh-CN",
      comparison_type: "mbti_cross_type",
      source: {
        package_id: SOURCE_PACKAGE,
        source_repository: "fermatmind/fap-api",
        source_repository_commit: SOURCE_COMMIT,
        original_path: source.original,
        snapshot_path: source.snapshot,
        raw_file_sha256: source.rawSha256,
        stale_source_manifest_declared_sha256: source.staleDeclaredSha256,
        declared_hash_matches_snapshot: false,
      },
      content_sha256: contentSha256,
      candidate_payload: candidatePayload,
      expected_content_contract: {
        section_count: SECTION_IDS.length,
        section_ids: SECTION_IDS,
        section_sha256: sha256Json(candidatePayload.sections),
        faq_count: 8,
        faq_sha256: sha256Json(asset.faq),
        internal_link_count: 7,
        internal_links_sha256: sha256Json(candidatePayload.internal_links),
      },
      expected_seo_contract: {
        canonical_url: canonical,
        seo_title: asset.seo_title,
        seo_description: asset.seo_description,
        content_phase_robots: "noindex,follow",
        indexability_phase_robots: "index,follow",
      },
      initial_public_state_expectation: {
        api_http_status: 200,
        page_http_status: 200,
        publish_status: "draft",
        is_indexable: false,
        indexability_status: "pending_review",
        robots: "noindex,follow",
      },
      rollback_contract: {
        capture_prewrite_revision_and_payload_hash: true,
        atomic_exact_three_required: true,
        rollback_all_three_on_any_write_or_readback_failure: true,
        restore_only_exact_slug_prewrite_state: true,
        preserve_publication_and_indexability_state: true,
        prohibit_fourth_record: true,
      },
      content_phase_readback_contract: {
        api_http_status: 200,
        page_http_status: 200,
        authority_must_be_db_or_cms: true,
        exact_content_sha256: contentSha256,
        exact_section_ids: SECTION_IDS,
        exact_section_sha256: sha256Json(candidatePayload.sections),
        exact_faq_sha256: sha256Json(asset.faq),
        exact_internal_links_sha256: sha256Json(candidatePayload.internal_links),
        canonical_url: canonical,
        robots: "noindex,follow",
        is_indexable: false,
        sitemap_eligible: false,
        llms_eligible: false,
      },
      manual_review: {
        source_review_status: asset.review_status,
        operator_editorial_approval: "pending_reapproval_after_runtime_shape_repair",
        previously_approved_pending_package_sha256: APPROVED_PENDING_PACKAGE_SHA256,
        previous_approval_statement_sha256: sha256(EDITORIAL_APPROVAL_STATEMENT),
        content_release_authorized: false,
        indexability_release_authorized: false,
      },
    });
  }

  assert(JSON.stringify(records.map((record) => record.slug)) === JSON.stringify(SOURCES.map((source) => source.slug)), "Exact record set drift");
  const contentCandidate = releasePayload(records);
  const indexabilityTemplate = {
    schema_version: "mbti.cross_type_comparison.indexability_release_template.v1",
    phase: "indexability_after_successful_content_readback_only",
    exact_slugs: records.map((record) => record.slug),
    required_inputs: ["exact_promoted_revision_ids", "successful_content_readback_sha256", "separate_operator_authorization_sha256"],
    allowed_mutations: ["is_indexable", "robots", "sitemap_eligibility", "llms_txt_eligibility", "llms_full_eligibility"],
    prohibited_mutations: ["content", "sections", "faq", "canonical", "any_fourth_record"],
    search_submission_allowed: false,
  };
  const packageCore = {
    schema_version: "mbti.cross_type_comparison.approval.v1",
    id: "MBTI-CROSS-APPROVAL-48",
    generated_at: GENERATED_AT,
    status: "pending_operator_editorial_reapproval",
    final_decision: "PENDING_EXACT_THREE_EDITORIAL_REAPPROVAL_AFTER_RUNTIME_SHAPE_REPAIR_NO_PRODUCTION_ACTION_AUTHORIZED",
    summary: {
      record_count: records.length,
      exact_slugs: records.map((record) => record.slug),
      source_hash_drift_count: records.filter((record) => !record.source.declared_hash_matches_snapshot).length,
      approved_count: 0,
      pending_count: records.length,
    },
    editorial_approval: {
      decision: "reapproval_required_after_runtime_shape_repair",
      approved_at: EDITORIAL_APPROVED_AT,
      previously_approved_pending_package_sha256: APPROVED_PENDING_PACKAGE_SHA256,
      previous_approval_statement_sha256: sha256(EDITORIAL_APPROVAL_STATEMENT),
      invalidation_reason: "Runtime adapter compatibility repairs normalize section body arrays, internal-link field names, and canonical profile hrefs; the repaired payload requires a new exact editorial approval.",
      exact_slugs: records.map((record) => record.slug),
      permits_pr_48_finalization_and_merge: false,
      permits_pr_49_implementation: false,
      production_content_write_authorized: false,
      publication_or_indexability_change_authorized: false,
      sitemap_or_llms_change_authorized: false,
      search_submission_authorized: false,
    },
    source_package: {
      package_id: SOURCE_PACKAGE,
      source_repository: "fermatmind/fap-api",
      source_repository_commit: SOURCE_COMMIT,
      original_manifest_path: "backend/docs/seo/import-packages/mbti-cross-type-comparison-content-assets-draft-20260702/source_manifest.json",
      declared_hash_drift_detected: true,
      provenance_policy: "Bind the exact committed snapshots and retain stale declared hashes as evidence; never silently substitute the obsolete manifest hashes.",
    },
    records,
    content_release_candidate: {
      payload: contentCandidate,
      payload_sha256: sha256Json(contentCandidate),
      authorization_status: "blocked_pending_editorial_reapproval_and_separate_production_content_write_authorization",
    },
    indexability_release_template: {
      payload: indexabilityTemplate,
      template_sha256: sha256Json(indexabilityTemplate),
      authorization_status: "blocked_until_content_promotion_and_readback_pass",
    },
    safety_boundary: {
      artifact_only: true,
      frontend_runtime_authority: false,
      production_deploy_attempted: false,
      cms_or_database_write_attempted: false,
      publication_or_indexability_mutation_attempted: false,
      sitemap_or_llms_mutation_attempted: false,
      search_submission_attempted: false,
      credentials_or_user_data_included: false,
    },
  };
  const packageSha256 = sha256Json(packageCore);
  const report = { ...packageCore, package_sha256: packageSha256 };
  const hashManifest = {
    schema_version: "mbti.cross_type_comparison.approval_hash_manifest.v1",
    id: "MBTI-CROSS-APPROVAL-48-HASH-MANIFEST",
    generated_at: GENERATED_AT,
    record_count: records.length,
    exact_slugs: records.map((record) => record.slug),
    package_sha256: packageSha256,
    previously_approved_pending_package_sha256: APPROVED_PENDING_PACKAGE_SHA256,
    previous_approval_statement_sha256: report.editorial_approval.previous_approval_statement_sha256,
    content_release_candidate_sha256: report.content_release_candidate.payload_sha256,
    indexability_release_template_sha256: report.indexability_release_template.template_sha256,
    records: records.map((record) => ({
      slug: record.slug,
      source_raw_sha256: record.source.raw_file_sha256,
      content_sha256: record.content_sha256,
      sections_sha256: record.expected_content_contract.section_sha256,
      faq_sha256: record.expected_content_contract.faq_sha256,
      internal_links_sha256: record.expected_content_contract.internal_links_sha256,
    })),
  };
  const markdown = `# MBTI-CROSS-APPROVAL-48 rollback/readback contract\n\n- Status: pending operator editorial reapproval after runtime-shape repair\n- Previously approved pending package SHA-256: \`${APPROVED_PENDING_PACKAGE_SHA256}\`\n- Previous approval statement SHA-256: \`${report.editorial_approval.previous_approval_statement_sha256}\`\n- Repaired package SHA-256: \`${packageSha256}\`\n- Exact records: ${records.map((record) => record.slug).join(", ")}\n- Record count: 3\n- Content-release candidate SHA-256: \`${report.content_release_candidate.payload_sha256}\`\n- Indexability template SHA-256: \`${report.indexability_release_template.template_sha256}\`\n- Runtime-shape repair: every section now has a non-empty body array; internal links use label/href/reason; four-letter profile hrefs are normalized to explicit canonical A-variant targets.\n- Source hash drift: all three current committed snapshots differ from the stale source-manifest declarations; the exact snapshot hashes remain the provenance inputs, while the candidate payload is a deterministic runtime-compatible projection.\n\n## Content revision phase\n\nThe repaired package requires a new exact editorial approval, which still does not authorize a production write. A future executor must also require a separate exact production package/authorization hash, capture each pre-write revision and payload hash, write only the exact three records atomically, keep all three noindex and outside sitemap/llms, and roll back all three on any write or readback failure.\n\n## Readback\n\nReadback must prove DB/CMS authority, exact content/section/FAQ/internal-link hashes, canonical parity, HTTP 200 API/page responses, visible complete body, robots \`noindex,follow\`, and no sitemap/llms eligibility. A local approval asset or frontend fallback cannot satisfy readback.\n\n## Indexability phase\n\nIndexability is a separate future authorization after successful content promotion/readback. It may change only robots/indexability/sitemap/llms eligibility for the exact three records and must not modify content or request search indexing.\n`;

  for (const [relativePath, content] of [
    [PACKAGE_PATH, `${JSON.stringify(report, null, 2)}\n`],
    [HASH_PATH, `${JSON.stringify(hashManifest, null, 2)}\n`],
    [CONTRACT_PATH, markdown],
  ]) {
    const target = path.join(ROOT, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }
  process.stdout.write(`${JSON.stringify({ ok: true, record_count: records.length, package_sha256: packageSha256, approval_status: report.status })}\n`);
}

await build();
