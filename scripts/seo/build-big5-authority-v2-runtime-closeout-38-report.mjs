#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATE = "2026-07-15";
const LIVE_EVIDENCE_PATH = `docs/seo/personality/big5-authority-v2-runtime-closeout-38-live-evidence-${DATE}.json`;
const OUTPUT_BASE = `docs/seo/personality/big5-authority-v2-runtime-closeout-38-report-${DATE}`;
const RECORD_VISUAL_QA = process.argv.includes("--record-visual-qa");
const REFRESH_ASSESSMENTS = process.argv.includes("--refresh-assessments");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function write(relativePath, value) {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  const temporaryPath = `${absolutePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, value);
  fs.renameSync(temporaryPath, absolutePath);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function status(condition, known = true) {
  if (!known) return "UNKNOWN";
  return condition ? "PASS" : "FAIL";
}

function expectedSchemaTypes(record) {
  if (record.page_family === "article") return ["Article", "BreadcrumbList"];
  if (["model_hub", "facet_hub"].includes(record.page_family)) return ["BreadcrumbList", "CollectionPage"];
  if (["domain", "range", "facet"].includes(record.page_family)) return ["BreadcrumbList", "WebPage"];
  if (record.page_family === "topic_hub") return ["CollectionPage", "BreadcrumbList"];
  if (record.page_family === "test_landing") return ["WebPage"];
  return [];
}

function refreshAssessments(evidence) {
  for (const record of evidence.records) {
    const publicKnown = record.expected_runtime_class !== "NEW_FAIL_CLOSED_DRAFT_PRIMARY"
      && record.observed?.http_status === 200;
    const expectedTypes = expectedSchemaTypes(record);
    const observedTypes = record.observed?.jsonld_types ?? [];
    const faqSchemaEligible = publicKnown
      && ["article", "model_hub", "domain", "range", "facet_hub", "facet", "test_landing"].includes(record.page_family);
    if (record.observed) record.observed.expected_jsonld_types = expectedTypes;
    record.assessment.json_ld = status(expectedTypes.every((type) => observedTypes.includes(type)), publicKnown && expectedTypes.length > 0);
    record.assessment.faq_json_ld = status(observedTypes.includes("FAQPage"), faqSchemaEligible);
    if (record.expected_runtime_class === "NEW_FAIL_CLOSED_DRAFT_PRIMARY") {
      record.assessment.http_runtime = status([404, 410].includes(record.observed?.http_status));
    }
  }
  return evidence;
}

function visualQaEvidence() {
  const samples = [
    {
      id: "existing-en-article",
      route: "/en/articles/big-five-personality-test-vs-mbti",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-en-article-${DATE}.png`,
      console_error_count: 3,
      assessment: { layout: "PASS", visible_content: "PASS", media: "FAIL", draft_boundary: "UNKNOWN" },
      note: "Article body, breadcrumb, byline, dates, FAQ, and references rendered; the hero media region remained an empty gradient.",
    },
    {
      id: "existing-zh-domain",
      route: "/zh/personality/big-five/agreeableness",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-zh-domain-${DATE}.png`,
      console_error_count: 2,
      assessment: { layout: "PASS", visible_content: "PASS", media: "PASS", draft_boundary: "UNKNOWN" },
      note: "Chinese domain hero, boundary copy, CTA, and navigation rendered without visible layout breakage.",
    },
    {
      id: "existing-en-topic",
      route: "/en/topics/big-five",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-en-topic-${DATE}.png`,
      console_error_count: 49,
      assessment: { layout: "FAIL", visible_content: "FAIL", media: "UNKNOWN", draft_boundary: "UNKNOWN" },
      note: "The public topic route remained on a skeleton with a large empty main region and 49 browser console errors.",
    },
    {
      id: "new-draft-soft-404",
      route: "/en/articles/apply-personality-research-without-overclaiming",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-draft-soft404-${DATE}.png`,
      console_error_count: 2,
      assessment: { layout: "PASS", visible_content: "PASS", media: "UNKNOWN", draft_boundary: "PASS" },
      note: "The new draft article did not render draft editorial content and showed the public unavailable shell under noindex.",
    },
    {
      id: "public-product-shell",
      route: "/en/tests/big-five-personality-test-ocean-model",
      screenshot: `docs/seo/personality/big5-authority-v2-runtime-closeout-38-visual-en-test-landing-${DATE}.png`,
      console_error_count: 7,
      assessment: { layout: "PASS", visible_content: "PASS", media: "UNKNOWN", draft_boundary: "PASS" },
      note: "The pre-existing product-code test landing remained publicly usable; the imported CMS candidate was not promoted.",
    },
  ];

  return samples.map((sample) => {
    const absolutePath = path.join(ROOT, sample.screenshot);
    assert(fs.existsSync(absolutePath), `Missing visual QA screenshot: ${sample.screenshot}`);
    const raw = fs.readFileSync(absolutePath);
    assert(raw.subarray(1, 4).toString("ascii") === "PNG", `Expected PNG screenshot: ${sample.screenshot}`);
    return {
      ...sample,
      viewport: { width: raw.readUInt32BE(16), height: raw.readUInt32BE(20) },
      screenshot_sha256: sha256(raw),
      screenshot_bytes: raw.length,
    };
  });
}

function assessmentCounts(records) {
  const counts = { PASS: 0, FAIL: 0, UNKNOWN: 0 };
  for (const record of records) {
    Object.values(record.assessment).forEach((value) => { counts[value] += 1; });
  }
  return counts;
}

function failureBreakdown(records) {
  const counts = {};
  for (const record of records) {
    for (const [key, value] of Object.entries(record.assessment)) {
      if (value === "FAIL") counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return Object.fromEntries(Object.entries(counts).sort((left, right) => right[1] - left[1]));
}

function buildReport(evidence) {
  const classes = evidence.records.reduce((grouped, record) => {
    grouped[record.expected_runtime_class] ??= [];
    grouped[record.expected_runtime_class].push(record);
    return grouped;
  }, {});
  const recordsWithFailure = evidence.records.filter((record) => Object.values(record.assessment).includes("FAIL"));
  const unknownNetworkRecords = evidence.records.filter((record) => record.error);
  const visualFailures = evidence.visual_qa.filter((sample) => Object.values(sample.assessment).includes("FAIL"));
  const redirectFailures = evidence.redirect_checks.filter((check) => check.assessment === "FAIL");
  const redirectUnknown = evidence.redirect_checks.filter((check) => check.assessment === "UNKNOWN");
  const draftRecords = classes.NEW_FAIL_CLOSED_DRAFT_PRIMARY ?? [];
  const preservedProductShells = classes.PUBLIC_PRODUCT_SHELL_PRESERVED ?? [];
  const publicRecords = [
    ...(classes.EXISTING_PUBLIC_PRIMARY_WITH_ISOLATED_REVISION ?? []),
    ...preservedProductShells,
  ];
  const criticalBoundaryFailures = draftRecords.filter((record) =>
    ["draft_non_public_boundary", "sitemap", "llms", "llms_full"].some((key) => record.assessment[key] !== "PASS"),
  );
  const report = {
    id: "BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38",
    artifact: "BIG5_AUTHORITY_V2_PRODUCTION_RUNTIME_CLOSEOUT",
    generated_at: evidence.generated_at,
    final_decision: criticalBoundaryFailures.length === 0
      && unknownNetworkRecords.length === 0
      && recordsWithFailure.length === 0
      && visualFailures.length === 0
      ? "PASS_PRODUCTION_RUNTIME_CLOSEOUT"
      : "FAIL_CLOSED_PUBLIC_RUNTIME_FINDINGS_RECORDED",
    source_identity: evidence.source_identity,
    exact_counts: {
      package_assets: evidence.records.length,
      new_fail_closed_primary: draftRecords.length + preservedProductShells.length,
      new_primary_with_public_product_shell_preserved: preservedProductShells.length,
      existing_public_primary_with_isolated_revision: (classes.EXISTING_PUBLIC_PRIMARY_WITH_ISOLATED_REVISION ?? []).length,
      publicly_withheld_new_content_primary: draftRecords.length,
      working_or_draft_revisions: evidence.production_import_readback.working_or_draft_revisions_created,
      public_content_overwrites: evidence.production_import_readback.existing_primary_public_content_overwrites,
    },
    summary: {
      assessment_counts: assessmentCounts(evidence.records),
      failure_breakdown: failureBreakdown(evidence.records),
      records_with_failures: recordsWithFailure.length,
      records_with_network_unknown: unknownNetworkRecords.length,
      critical_draft_boundary_failures: criticalBoundaryFailures.length,
      public_http_200: publicRecords.filter((record) => record.observed?.http_status === 200).length,
      draft_http_404_or_410: draftRecords.filter((record) => [404, 410].includes(record.observed?.http_status)).length,
      private_feed_url_leaks: evidence.private_feed_url_leaks.length,
      visual_qa_records: evidence.visual_qa.length,
      visual_qa_failures: visualFailures.length,
      legacy_redirect_passes: evidence.redirect_checks.filter((check) => check.assessment === "PASS").length,
      legacy_redirect_failures: redirectFailures.length,
      legacy_redirect_unknown: redirectUnknown.length,
      withheld_soft_404_http_200: draftRecords.filter((record) => record.observed?.http_status === 200).length,
    },
    production_import_readback: evidence.production_import_readback,
    feed_http_status: evidence.feed_http_status,
    private_feed_url_leaks: evidence.private_feed_url_leaks,
    redirect_checks: evidence.redirect_checks,
    visual_qa: evidence.visual_qa,
    records: evidence.records,
    stop_report: recordsWithFailure.length > 0 || visualFailures.length > 0 || redirectFailures.length > 0 || redirectUnknown.length > 0 ? {
      status: "RECORDED_FINDINGS_NO_RUNTIME_REPAIR_AUTHORIZED",
      failed_asset_ids: recordsWithFailure.map((record) => record.asset_id),
      failed_visual_samples: visualFailures.map((sample) => sample.id),
      failed_or_unknown_redirects: [...redirectFailures, ...redirectUnknown].map((check) => check.legacy_url),
      note: "PR38 records production findings only. It does not repair runtime, promote drafts, or mutate discoverability.",
    } : null,
    safety_boundary: evidence.safety_boundary,
    repository_rule_impact: "Read-only QA artifacts only; backend/CMS authority and frontend fallback behavior are unchanged.",
  };

  assert(report.exact_counts.package_assets === 231, "Expected 231 package assets");
  assert(report.exact_counts.new_fail_closed_primary === 106, "Expected 106 new fail-closed primary identities");
  assert(report.exact_counts.existing_public_primary_with_isolated_revision === 125, "Expected 125 existing public identities");
  assert(report.exact_counts.new_primary_with_public_product_shell_preserved === 2, "Expected two public product landing shells");
  assert(report.exact_counts.working_or_draft_revisions === 229, "Expected 229 working/draft revisions");
  assert(report.exact_counts.public_content_overwrites === 0, "Expected zero public content overwrites");
  assert(report.production_import_readback.public_runtime_fingerprint_before === report.production_import_readback.public_runtime_fingerprint_after, "Public runtime fingerprint changed");
  assert(report.summary.critical_draft_boundary_failures === 0, "Draft exposure boundary failure detected");
  assert(report.summary.private_feed_url_leaks === 0, "Private URL leak detected in public feeds");
  assert(report.summary.legacy_redirect_passes === 10, "Expected 10 exact legacy redirects");
  return report;
}

function markdown(report) {
  const lines = [
    "# BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38",
    "",
    `- Final decision: \`${report.final_decision}\``,
    `- Generated at: \`${report.generated_at}\``,
    `- Production deploy SHA: \`${report.source_identity.deploy_sha}\``,
    `- PR37 merge SHA: \`${report.source_identity.pr37_merge_sha}\``,
    `- Package assets: ${report.exact_counts.package_assets}`,
    `- New fail-closed primary identities: ${report.exact_counts.new_fail_closed_primary} (${report.exact_counts.publicly_withheld_new_content_primary} withheld routes plus ${report.exact_counts.new_primary_with_public_product_shell_preserved} pre-existing public product shells)`,
    `- Existing published identities with isolated revision: ${report.exact_counts.existing_public_primary_with_isolated_revision}`,
    `- Working/draft revisions: ${report.exact_counts.working_or_draft_revisions}`,
    `- Public content overwrites: ${report.exact_counts.public_content_overwrites}`,
    `- Assessment totals: PASS ${report.summary.assessment_counts.PASS}, FAIL ${report.summary.assessment_counts.FAIL}, UNKNOWN ${report.summary.assessment_counts.UNKNOWN}`,
    "",
    "## Runtime boundary",
    "",
    "The authorized import created draft-only primary records and isolated working revisions. It did not promote content or mutate public release, indexability, sitemap, LLMS, media, cache, or search state. The existing-public aggregate fingerprint was identical before and after the transaction.",
    "",
    "## Evidence summary",
    "",
    `- Public routes returning HTTP 200: ${report.summary.public_http_200}/127`,
    `- Draft-only routes returning HTTP 404/410: ${report.summary.draft_http_404_or_410}/${report.exact_counts.publicly_withheld_new_content_primary}`,
    `- Draft-only routes returning HTTP 200 noindex soft-404 shells: ${report.summary.withheld_soft_404_http_200}`,
    `- Critical draft boundary failures: ${report.summary.critical_draft_boundary_failures}`,
    `- Private URLs in sitemap/LLMS feeds: ${report.summary.private_feed_url_leaks}`,
    `- Records with any FAIL: ${report.summary.records_with_failures}`,
    `- Records with network UNKNOWN: ${report.summary.records_with_network_unknown}`,
    `- Visual QA records: ${report.summary.visual_qa_records}; failures: ${report.summary.visual_qa_failures}`,
    `- Legacy 301 redirects: PASS ${report.summary.legacy_redirect_passes}, FAIL ${report.summary.legacy_redirect_failures}, UNKNOWN ${report.summary.legacy_redirect_unknown}`,
    `- Failure breakdown: ${Object.entries(report.summary.failure_breakdown).map(([key, count]) => `${key}=${count}`).join(", ")}`,
    "",
    "## Recorded findings / stop report",
    "",
    "- All 104 withheld article and technical-trust routes correctly remained noindex and absent from sitemap/LLMS, but returned HTTP 200 unavailable shells instead of HTTP 404/410.",
    "- 116 public records lacked an eligible OG media URL, 82 lacked a visible date signal, nine visible article FAQ surfaces lacked FAQPage JSON-LD, and four articles lacked their eligible Article/Breadcrumb JSON-LD.",
    "- Three records each failed visible author, visible source, hreflang, or llms.txt checks; seven failed visible reviewer checks.",
    "- `/en/topics/big-five` remained on a loading skeleton with 49 browser console errors. The sampled existing article showed an empty hero media region.",
    "- All 10 defined Chinese legacy aliases returned the expected exact HTTP 301 targets.",
    "- These findings are evidence only. PR38 is not authorized to repair runtime, promote content, or mutate discoverability.",
    "",
    "## Visual QA",
    "",
    "| Sample | Route | Layout | Visible content | Media | Draft boundary | Console errors |",
    "| --- | --- | --- | --- | --- | --- | ---: |",
    ...report.visual_qa.map((sample) => `| ${sample.id} | ${sample.route} | ${sample.assessment.layout} | ${sample.assessment.visible_content} | ${sample.assessment.media} | ${sample.assessment.draft_boundary} | ${sample.console_error_count} |`),
    "",
    "## PASS / FAIL / UNKNOWN semantics",
    "",
    "- PASS: the read-only production observation met the applicable boundary.",
    "- FAIL: the observation did not meet an applicable public runtime boundary; this PR records it without repair.",
    "- UNKNOWN: the check was not applicable to a withheld draft or could not be established from public evidence.",
    "",
    "## Safety and authority",
    "",
    "Backend/CMS remains authoritative. This closeout did not deploy, write CMS content, promote revisions, alter discoverability, warm caches, upload media, or submit URLs to search providers. No frontend editorial fallback was added.",
    "",
  ];
  return lines.join("\n");
}

const evidence = readJson(LIVE_EVIDENCE_PATH);
if (REFRESH_ASSESSMENTS) refreshAssessments(evidence);
if (RECORD_VISUAL_QA) evidence.visual_qa = visualQaEvidence();
if (REFRESH_ASSESSMENTS || RECORD_VISUAL_QA) {
  write(LIVE_EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
}
const report = buildReport(evidence);
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
console.log(report.final_decision);
console.log(`ASSETS=${report.exact_counts.package_assets}/231`);
console.log(`PRIMARY_CREATE=${report.exact_counts.new_fail_closed_primary}/106`);
console.log(`EXISTING_REVISION=${report.exact_counts.existing_public_primary_with_isolated_revision}/125`);
console.log(`REVISION_CREATE=${report.exact_counts.working_or_draft_revisions}/229`);
console.log(`CRITICAL_DRAFT_BOUNDARY_FAILURES=${report.summary.critical_draft_boundary_failures}`);
console.log(`PRIVATE_FEED_URL_LEAKS=${report.summary.private_feed_url_leaks}`);
