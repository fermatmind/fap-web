#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = "2026-07-14";
const PUBLIC_READBACK_GENERATED_AT = "2026-07-14T12:31:15.811Z";
const REPORT_GENERATED_AT = "2026-07-14T12:31:18.412Z";
const API_ORIGIN = "https://api.fermatmind.com/api/v0.5/personality";
const PACKAGE_PATH = "docs/seo/personality/mbti-cms-approval-39-exact-package-2026-07-13.json";
const CMS_EVIDENCE_PATH = `docs/seo/personality/mbti-verify-41-cms-draft-readback-${DATE}.json`;
const PUBLIC_EVIDENCE_PATH = `docs/seo/personality/mbti-verify-41-public-readback-${DATE}.json`;
const OUTPUT_BASE = `docs/seo/personality/mbti-verify-41-full-readback-${DATE}`;
const ALLOW_NETWORK = process.argv.includes("--allow-network");
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 4;
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;

const GROUPS = {
  NT: ["intj", "intp", "entj", "entp"],
  NF: ["infj", "infp", "enfj", "enfp"],
  SJ: ["istj", "isfj", "estj", "esfj"],
  SP: ["istp", "isfp", "estp", "esfp"],
};
const HOT_CROSS_TYPE = ["intj-vs-intp", "entj-vs-intj", "infj-vs-infp", "istj-vs-isfj"];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function write(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const temporaryPath = `${absolutePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, value);
  fs.renameSync(temporaryPath, absolutePath);
}

function sha256Json(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function targetList() {
  const profiles = Object.entries(GROUPS).flatMap(([group, types]) => (
    types.flatMap((type) => ["a", "t"].map((variant) => ({
      group,
      kind: "profile",
      slug: `${type}-${variant}`,
      route: `/zh/personality/${type}-${variant}`,
    })))
  ));
  const atComparisons = Object.entries(GROUPS).flatMap(([group, types]) => (
    types.map((type) => ({
      group,
      kind: "at_comparison",
      slug: `${type}-a-vs-${type}-t`,
      route: `/zh/personality/${type}-a-vs-${type}-t`,
    }))
  ));
  const crossTypeComparisons = HOT_CROSS_TYPE.map((slug) => ({
    group: "hot_cross_type",
    kind: "cross_type_comparison",
    slug,
    route: `/zh/personality/${slug}`,
  }));

  return [...profiles, ...atComparisons, ...crossTypeComparisons];
}

function safeLinks(links) {
  return Array.isArray(links)
    && links.length >= 5
    && links.every((link) => {
      const href = String(link?.href ?? "");
      return href.startsWith("/zh/") && !PRIVATE_PATH_PATTERN.test(href);
    });
}

function repairPayloadChecks(record) {
  const payload = record.import_payload ?? {};
  const faqMinimum = record.entity_kind === "profile" ? 6 : 5;
  const sourceRefs = payload?.structured_metadata?.source_document;
  const checks = {
    title_meta_h1: Boolean(
      payload?.seo?.seo_title
      && payload?.seo?.seo_description
      && payload?.seo?.h1,
    ),
    answer_block: Boolean(payload?.content?.quick_answer),
    faq: Array.isArray(payload?.faq) && payload.faq.length >= faqMinimum,
    sections: Array.isArray(payload?.content_sections) && payload.content_sections.length >= 9,
    internal_links: safeLinks(payload?.internal_links),
    source_refs: Array.isArray(sourceRefs) && sourceRefs.length > 0,
    expected_content_fingerprint: sha256Json(payload) === record.exact_payload_sha256
      && record.exact_payload_sha256 === record?.expected_post_state?.content_payload_sha256,
    no_private_links: safeLinks(payload?.internal_links),
  };
  return { checks, passed: Object.values(checks).every(Boolean) };
}

function publicContentMetrics(payload, kind) {
  if (kind === "profile") {
    return {
      title: String(payload?.profile?.title ?? "").trim(),
      meta_title: String(payload?.seo_meta?.seo_title ?? "").trim(),
      meta_description: String(payload?.seo_meta?.seo_description ?? "").trim(),
      answer_block_count: Array.isArray(payload?.answer_surface_v1?.summary_blocks)
        ? payload.answer_surface_v1.summary_blocks.length
        : 0,
      faq_count: Array.isArray(payload?.answer_surface_v1?.faq_blocks)
        ? payload.answer_surface_v1.faq_blocks.length
        : 0,
      section_count: Array.isArray(payload?.sections) ? payload.sections.length : 0,
      internal_links: Array.isArray(payload?.internal_links) ? payload.internal_links : [],
      source_refs: Array.isArray(payload?.answer_surface_v1?.evidence_refs)
        ? payload.answer_surface_v1.evidence_refs
        : [],
    };
  }

  const comparison = payload?.comparison ?? {};
  return {
    title: String(comparison.title ?? "").trim(),
    meta_title: String(payload?.seo_meta?.seo_title ?? comparison.seo_title ?? "").trim(),
    meta_description: String(payload?.seo_meta?.seo_description ?? comparison.seo_description ?? "").trim(),
    answer_block_count: String(comparison.summary ?? comparison.description ?? "").trim() ? 1 : 0,
    faq_count: Array.isArray(comparison.faq) ? comparison.faq.length : 0,
    section_count: Array.isArray(comparison.sections) ? comparison.sections.length : 0,
    internal_links: Array.isArray(comparison.internal_links) ? comparison.internal_links : [],
    source_refs: Array.isArray(comparison.source_refs) ? comparison.source_refs : [],
  };
}

function verifyOnlyChecks(metrics, kind) {
  const faqMinimum = kind === "profile" ? 4 : 5;
  const sectionMinimum = kind === "profile" ? 8 : 6;
  const checks = {
    title_meta_h1: Boolean(metrics.title && metrics.meta_title && metrics.meta_description),
    answer_block: metrics.answer_block_count >= 1,
    faq: metrics.faq_count >= faqMinimum,
    sections: metrics.section_count >= sectionMinimum,
    internal_links: safeLinks(metrics.internal_links),
    source_refs: metrics.source_refs.length > 0,
    no_private_links: safeLinks(metrics.internal_links),
  };
  return { checks, passed: Object.values(checks).every(Boolean) };
}

async function fetchJson(url, timeoutMs = 45_000) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "FermatMind MBTI VERIFY 41 read-only scan/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      return body?.data ?? body;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
      }
    }
  }
  throw lastError;
}

async function scanPublicApi(targets) {
  const records = new Array(targets.length);
  let cursor = 0;

  async function worker() {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      const target = targets[index];
      const apiUrl = target.kind === "profile"
        ? `${API_ORIGIN}/${target.slug}?locale=zh-CN`
        : `${API_ORIGIN}/comparisons/${target.slug}?locale=zh-CN`;
      const startedAt = Date.now();
      try {
        const payload = await fetchJson(apiUrl);
        const metrics = publicContentMetrics(payload, target.kind);
        records[index] = {
          ...target,
          api_url: apiUrl,
          api_status: "ok",
          latency_ms: Date.now() - startedAt,
          content_metrics: {
            title_present: Boolean(metrics.title),
            meta_title_present: Boolean(metrics.meta_title),
            meta_description_present: Boolean(metrics.meta_description),
            answer_block_count: metrics.answer_block_count,
            faq_count: metrics.faq_count,
            section_count: metrics.section_count,
            internal_link_count: metrics.internal_links.length,
            internal_link_hrefs: metrics.internal_links.map((link) => String(link?.href ?? "")),
            source_ref_count: metrics.source_refs.length,
            no_private_links: safeLinks(metrics.internal_links),
          },
        };
      } catch (error) {
        records[index] = {
          ...target,
          api_url: apiUrl,
          api_status: "error",
          latency_ms: Date.now() - startedAt,
          content_metrics: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  await Promise.all(Array.from({ length: MAX_CONCURRENCY }, worker));
  return {
    id: "MBTI-VERIFY-41-PUBLIC-READBACK",
    generated_at: PUBLIC_READBACK_GENERATED_AT,
    authority: "production_public_api_read_only",
    records,
    safety_boundary: {
      cms_write_attempted: false,
      deploy_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_mutation_attempted: false,
      credential_data_recorded: false,
    },
  };
}

function frontendAuthorityChecks() {
  const pageSource = read("app/(localized)/[locale]/personality/[type]/page.tsx");
  const adapterSource = read("lib/cms/personality.ts");
  return {
    profile_uses_backend_projection: pageSource.includes("getPersonalityProjectionDetailBySlugOrType"),
    comparison_uses_backend_projection: pageSource.includes("getPersonalityComparisonBySlug"),
    comparison_declares_no_editorial_fallback: pageSource.includes("comparison pages must not use frontend editorial fallback content"),
    no_frontend_gateway_fallback: !pageSource.includes("frontend_gateway_fallback")
      && !adapterSource.includes("frontend_gateway_fallback"),
  };
}

function buildReport() {
  const approvalPackage = readJson(PACKAGE_PATH);
  const cmsEvidence = readJson(CMS_EVIDENCE_PATH);
  const publicEvidence = readJson(PUBLIC_EVIDENCE_PATH);
  const targets = targetList();
  const repairByPath = new Map(approvalPackage.repair_records.map((record) => [record.target_path, record]));
  const verifyOnlyByPath = new Map(approvalPackage.verify_only_records.map((record) => [record.target_path, record]));
  const cmsByPath = new Map(cmsEvidence.records.map((record) => [record.target_path, record]));
  const publicByPath = new Map(publicEvidence.records.map((record) => [record.route, record]));
  const frontendChecks = frontendAuthorityChecks();
  const noFrontendFallback = Object.values(frontendChecks).every(Boolean);

  const records = targets.map((target) => {
    const repair = repairByPath.get(target.route);
    const verifyOnly = verifyOnlyByPath.get(target.route);
    const cms = cmsByPath.get(target.route);
    const publicRecord = publicByPath.get(target.route);
    const failures = [];
    const commonChecks = {
      public_api_record_exists: publicRecord?.api_status === "ok",
      no_frontend_fallback: noFrontendFallback,
    };
    let authorityChecks;
    let contentAuthority;

    if (repair) {
      const payloadResult = repairPayloadChecks(repair);
      authorityChecks = {
        ...payloadResult.checks,
        cms_draft_record_exists: Boolean(cms),
        cms_draft_fingerprint_matches: cms?.payload_sha256 === repair.exact_payload_sha256,
        cms_draft_only: cms?.visibility === "draft_only",
        public_projection_not_promoted: cms?.public_projection_promoted === false,
        discoverability_not_mutated: cms?.indexability_mutated === false
          && cms?.sitemap_eligibility_mutated === false
          && cms?.llms_eligibility_mutated === false,
      };
      contentAuthority = "production_cms_draft_revision";
    } else if (verifyOnly) {
      const metrics = publicRecord?.content_metrics
        ? {
            title: publicRecord.content_metrics.title_present ? "present" : "",
            meta_title: publicRecord.content_metrics.meta_title_present ? "present" : "",
            meta_description: publicRecord.content_metrics.meta_description_present ? "present" : "",
            answer_block_count: publicRecord.content_metrics.answer_block_count,
            faq_count: publicRecord.content_metrics.faq_count,
            section_count: publicRecord.content_metrics.section_count,
            internal_links: (publicRecord.content_metrics.internal_link_hrefs ?? []).map((href) => ({ href })),
            source_refs: Array.from({ length: publicRecord.content_metrics.source_ref_count }, () => "source"),
          }
        : { title: "", meta_title: "", meta_description: "", answer_block_count: 0, faq_count: 0, section_count: 0, internal_links: [], source_refs: [] };
      const publicResult = verifyOnlyChecks(metrics, target.kind);
      authorityChecks = {
        ...publicResult.checks,
        verify_only_not_overwritten: !cms,
      };
      contentAuthority = "existing_public_api_authority";
    } else {
      authorityChecks = { inventory_classified: false };
      contentAuthority = "unknown";
    }

    const checks = { ...commonChecks, ...authorityChecks };
    for (const [check, passed] of Object.entries(checks)) {
      if (!passed) failures.push(check);
    }

    return {
      ...target,
      content_authority: contentAuthority,
      disposition: repair ? "repair_draft_readback" : "verify_only_existing_authority",
      expected_content_fingerprint: repair?.exact_payload_sha256 ?? null,
      observed_content_fingerprint: cms?.payload_sha256 ?? null,
      public_api_latency_ms: publicRecord?.latency_ms ?? null,
      checks,
      status: failures.length === 0 ? "pass" : "fail",
      failures,
    };
  });

  const failedRecords = records.filter((record) => record.status === "fail").map((record) => ({
    route: record.route,
    failures: record.failures,
  }));
  const summary = {
    total_count: records.length,
    passed_count: records.length - failedRecords.length,
    failed_count: failedRecords.length,
    repair_draft_count: records.filter((record) => record.disposition === "repair_draft_readback").length,
    verify_only_count: records.filter((record) => record.disposition === "verify_only_existing_authority").length,
    cms_draft_readback_count: cmsEvidence.records.length,
    public_api_readback_count: publicEvidence.records.filter((record) => record.api_status === "ok").length,
  };
  const pass = records.length === 52
    && summary.repair_draft_count === 43
    && summary.verify_only_count === 9
    && summary.cms_draft_readback_count === 43
    && summary.public_api_readback_count === 52
    && failedRecords.length === 0;

  return {
    id: "MBTI-VERIFY-41",
    artifact: "MBTI-VERIFY-41-FULL-READBACK",
    generated_at: REPORT_GENERATED_AT,
    status: pass ? "pass" : "fail",
    final_decision: pass ? "PASS_MBTI_VERIFY_41_FULL_READBACK" : "HOLD_MBTI_VERIFY_41_FAILED_RECORDS",
    authority_model: {
      repair_records: "production CMS draft revisions; import is not public promotion",
      verify_only_records: "existing production public API authority",
      frontend: "consumer only; no local editorial authority",
    },
    exact_package: approvalPackage.exact_package,
    frontend_authority_checks: frontendChecks,
    summary,
    failed_records: failedRecords,
    records,
    safety_boundary: {
      read_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      public_promotion_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_mutation_attempted: false,
      production_deploy_attempted: false,
      frontend_editorial_fallback_added: false,
    },
  };
}

function markdown(report) {
  const failed = report.failed_records.length
    ? report.failed_records.map((record) => `- \`${record.route}\`: ${record.failures.join(", ")}`).join("\n")
    : "- None.";
  return `# MBTI-VERIFY-41 Full Readback\n\n- Decision: **${report.final_decision}**\n- Scope: 32 Profile + 16 A/T comparison + 4 hot cross-type comparison = 52 zh-CN URLs\n- CMS draft readback: ${report.summary.cms_draft_readback_count}/43\n- Public API readback: ${report.summary.public_api_readback_count}/52\n- Verify-only preserved: ${report.summary.verify_only_count}/9\n\n## Authority Boundary\n\nThe 43 repaired records are exact production CMS **draft revisions**. They are not public promotion evidence. The nine verify-only records remain on existing public API authority and must not have an Import-40 draft revision. Frontend runtime remains a consumer and does not supply editorial fallback content.\n\n## Failed Records\n\n${failed}\n\n## Safety\n\nThis task is read-only. It does not write CMS data, promote content, change indexability, mutate sitemap/LLMS, submit GSC, or deploy.\n`;
}

function csv(report) {
  const header = ["route", "kind", "disposition", "content_authority", "status", "failures", "expected_content_fingerprint", "observed_content_fingerprint", "public_api_latency_ms"];
  const rows = report.records.map((record) => [
    record.route,
    record.kind,
    record.disposition,
    record.content_authority,
    record.status,
    record.failures.join("|"),
    record.expected_content_fingerprint ?? "",
    record.observed_content_fingerprint ?? "",
    record.public_api_latency_ms ?? "",
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

const targets = targetList();
if (ALLOW_NETWORK) {
  const evidence = await scanPublicApi(targets);
  write(PUBLIC_EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
}

if (!fs.existsSync(path.join(ROOT, CMS_EVIDENCE_PATH))) {
  throw new Error(`Missing read-only CMS evidence: ${CMS_EVIDENCE_PATH}`);
}
if (!fs.existsSync(path.join(ROOT, PUBLIC_EVIDENCE_PATH))) {
  throw new Error(`Missing public API evidence: ${PUBLIC_EVIDENCE_PATH}; rerun with --allow-network`);
}

const report = buildReport();
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(report));

console.log(report.final_decision);
console.log(`CMS_DRAFT=${report.summary.cms_draft_readback_count}/43`);
console.log(`PUBLIC_API=${report.summary.public_api_readback_count}/52`);
console.log(`FAILED=${report.summary.failed_count}`);
if (report.failed_records.length > 0) {
  for (const record of report.failed_records) {
    console.log(`FAIL ${record.route}: ${record.failures.join(",")}`);
  }
  process.exitCode = 1;
}
