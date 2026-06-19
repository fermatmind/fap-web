import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "generated/career-ai-impact-v5-editorial-review-package");
const finalDir =
  process.env.AI_IMPACT_FINAL_REPAIRED_DIR ||
  "/Users/rainie/Desktop/GitHub/fap-web/generated/career-ai-impact-v5-1046-final-repaired";
const stagingImportDir =
  process.env.AI_IMPACT_STAGING_IMPORT_DIR ||
  "/private/tmp/career-ai-impact-v5-1046-staging-preview-import-post-c5de";
const expandedPageQaDir = path.join(repoRoot, "generated/career-ai-impact-v5-1046-expanded-page-qa");

const finalAssetPath = path.join(
  finalDir,
  "career_risk_future_ai_impact_1046_v5_final_repaired_assets.jsonl",
);
const finalEvidencePath = path.join(
  finalDir,
  "career_risk_future_ai_impact_1046_v5_final_repaired_evidence.jsonl",
);
const finalSynthesisPath = path.join(
  finalDir,
  "career_risk_future_ai_impact_1046_v5_final_repaired_synthesis.jsonl",
);
const finalSearchProjectionPath = path.join(
  finalDir,
  "career_risk_future_ai_impact_1046_v5_final_repaired_search_projection.jsonl",
);
const finalQaPath = path.join(finalDir, "final_independent_qa.json");
const expandedPageQaPath = path.join(expandedPageQaDir, "audit.json");
const stagingApiSmokePath = path.join(stagingImportDir, "staging_api_smoke_1046.json");
const stagingFailClosedPath = path.join(stagingImportDir, "fail_closed_smoke.json");

const requiredInputs = [
  finalAssetPath,
  finalEvidencePath,
  finalSynthesisPath,
  finalSearchProjectionPath,
  finalQaPath,
  expandedPageQaPath,
  stagingApiSmokePath,
  stagingFailClosedPath,
];

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`${filePath}:${index + 1}: ${error.message}`);
      }
    });
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function writeCsv(filePath, rows) {
  fs.writeFileSync(filePath, rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
}

function collectReaderText(asset) {
  const parts = [
    asset.summary,
    asset.items?.reader_boundary?.label,
    asset.items?.reader_boundary?.body,
  ];
  for (const group of [
    asset.items?.most_ai_exposed_workflows,
    asset.items?.human_accountability_anchors,
    asset.items?.how_to_prepare,
  ]) {
    for (const item of group || []) {
      parts.push(item.label, item.body);
    }
  }
  return parts.filter(Boolean).join("\n");
}

function highRiskCategory(asset) {
  const text = [
    asset.slug,
    asset.occupation?.title_en,
    asset.occupation?.title_zh,
    asset.micro_family,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const checks = [
    ["medical_clinical", /(nurse|physician|surgeon|medical|clinical|therap|health|dental|pharmac|paramedic|psychiatr|veterinar)/],
    ["aviation_transport_safety", /(aircraft|aviation|pilot|flight|air-traffic|air traffic|transportation|locomotive|rail|marine|ship|captain)/],
    ["legal_regulatory", /(law|legal|judge|hearing|arbitrator|compliance|regulatory|court|paralegal)/],
    ["military_command", /(military|army|navy|air force|marine|command|tactical|armored|artillery|infantry|special forces)/],
    ["education_counseling", /(teacher|education|instruction|school|counsel|advisor|tutor|library)/],
    ["creative_performance", /(actor|writer|artist|designer|music|perform|choreograph|producer|director|editor|photograph)/],
    ["physical_trade_service", /(mechanic|repair|installer|operator|driver|cook|chef|clean|maintenance|construction|carpenter|plumber|electrician|machinist|welder|food)/],
    ["engineering_architecture_validation", /(engineer|architect|technician|inspector|drafter|survey|quality|validation|aerospace|civil|industrial)/],
  ];
  return checks.find(([, pattern]) => pattern.test(text))?.[0] || "";
}

function isReadyAsset(asset) {
  const readerText = collectReaderText(asset);
  const findings = [];
  const internalLeakPattern =
    /\b(evidence_id|evidence id|row_hash|row hash|source_id|source id|search_projection|audit_fields|audit field|repair loop|gate failure|manual review seed)\b/i;
  const unsafeOutcomePattern =
    /(will replace|will be replaced|will disappear|career will disappear|occupation will disappear|guaranteed safe from AI|AI-proof career|guarantees? job security|会被 AI 取代|将被 AI 取代|会导致失业|会导致降薪|岗位会消失|职业会消失|保证不会被 AI 影响|AI 安全职业)/i;
  if (internalLeakPattern.test(readerText)) findings.push("internal_lineage_leak");
  if (unsafeOutcomePattern.test(readerText)) findings.push("unsafe_ai_outcome_wording");
  if (asset.locale === "en" && /[\u3400-\u9fff]/.test(readerText)) findings.push("english_contains_chinese");
  if (asset.locale === "zh-CN" && !/[\u3400-\u9fff]/.test(readerText)) findings.push("zh_cn_missing_chinese_context");
  if (!asset.ai_exposure_score || !asset.ai_exposure_score.score_1_to_10) findings.push("missing_score");
  for (const key of ["most_ai_exposed_workflows", "human_accountability_anchors", "how_to_prepare"]) {
    if (!Array.isArray(asset.items?.[key]) || asset.items[key].length === 0) {
      findings.push(`missing_${key}`);
    }
  }
  if (!asset.items?.reader_boundary?.body) findings.push("missing_reader_boundary");
  return findings;
}

function sampleRows(assets) {
  const bySlug = new Map();
  for (const asset of assets) {
    if (!bySlug.has(asset.slug)) bySlug.set(asset.slug, []);
    bySlug.get(asset.slug).push(asset);
  }
  const priority = [
    "accountants-and-auditors",
    "actuaries",
    "acute-care-nurses",
    "air-traffic-controllers",
    "airline-pilots-copilots-and-flight-engineers",
    "administrative-law-judges-adjudicators-and-hearing-officers",
    "armored-assault-vehicle-crew-members",
    "elementary-school-teachers-except-special-education",
    "writers-and-authors",
    "zoologists-and-wildlife-biologists",
  ];
  const chosen = new Set(priority.filter((slug) => bySlug.has(slug)));
  for (const [slug, slugAssets] of bySlug) {
    if (chosen.size >= 30) break;
    if (slugAssets.some((asset) => highRiskCategory(asset))) chosen.add(slug);
  }
  for (const slug of bySlug.keys()) {
    if (chosen.size >= 30) break;
    chosen.add(slug);
  }
  return [...chosen].flatMap((slug) => bySlug.get(slug));
}

for (const input of requiredInputs) {
  if (!fs.existsSync(input)) {
    throw new Error(`Missing required input: ${input}`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });

const assets = readJsonl(finalAssetPath);
const evidenceRows = readJsonl(finalEvidencePath).length;
const synthesisRows = readJsonl(finalSynthesisPath).length;
const searchProjectionRows = readJsonl(finalSearchProjectionPath).length;
const finalQa = readJson(finalQaPath);
const expandedPageQa = readJson(expandedPageQaPath);
const stagingApiSmoke = readJson(stagingApiSmokePath);
const stagingFailClosed = readJson(stagingFailClosedPath);

const slugs = new Set(assets.map((asset) => asset.slug));
const locales = new Map();
const findings = [];
const readyRows = [];
const repairRows = [["slug", "locale", "finding"]];
const blockedRows = [["slug", "locale", "finding"]];
const highRiskRows = [["slug", "locale", "occupation", "category", "score", "status", "notes"]];
const sampleReviewRows = [["slug", "locale", "occupation", "score", "sample_reason", "status"]];
const approvalRows = [["slug", "locale", "seed_ordinal", "score", "asset_row_hash", "approval_status"]];

for (const asset of assets) {
  const key = `${asset.slug}:${asset.locale}`;
  locales.set(key, true);
  const assetFindings = isReadyAsset(asset);
  if (assetFindings.length) {
    for (const finding of assetFindings) {
      findings.push({ slug: asset.slug, locale: asset.locale, finding });
      repairRows.push([asset.slug, asset.locale, finding]);
    }
  } else {
    readyRows.push([
      asset.slug,
      asset.locale,
      asset.occupation?.title_en || "",
      asset.occupation?.title_zh || "",
      asset.ai_exposure_score?.score_1_to_10 || "",
      asset.ai_exposure_score?.confidence || "",
    ]);
  }
  const category = highRiskCategory(asset);
  if (category) {
    highRiskRows.push([
      asset.slug,
      asset.locale,
      asset.occupation?.title_en || asset.occupation?.title_zh || "",
      category,
      asset.ai_exposure_score?.score_1_to_10 || "",
      assetFindings.length ? "repair_required" : "ready",
      assetFindings.join(";"),
    ]);
  }
  approvalRows.push([
    asset.slug,
    asset.locale,
    asset.seed_ordinal,
    asset.ai_exposure_score?.score_1_to_10 || "",
    asset.audit_fields?.row_hash || "",
    assetFindings.length ? "reject" : "approve",
  ]);
}

for (const asset of sampleRows(assets)) {
  sampleReviewRows.push([
    asset.slug,
    asset.locale,
    asset.occupation?.title_en || asset.occupation?.title_zh || "",
    asset.ai_exposure_score?.score_1_to_10 || "",
    highRiskCategory(asset) || "representative",
    "ready",
  ]);
}

const scoreDistribution = {};
for (const asset of assets) {
  const score = String(asset.ai_exposure_score?.score_1_to_10 ?? "missing");
  scoreDistribution[score] = (scoreDistribution[score] || 0) + 1;
}

const assetSha = sha256(finalAssetPath);
const finalQaSha = sha256(finalQaPath);
const expandedPageQaSha = sha256(expandedPageQaPath);
const stagingSmokeSha = sha256(stagingApiSmokePath);
const stagingFailClosedSha = sha256(stagingFailClosedPath);
const stagingSmokeSummary = stagingApiSmoke.summary || {};
const stagingFailClosedSummary = stagingFailClosed.summary || {};
const expandedChecks = expandedPageQa.checks || {};

const structureReady =
  assets.length === 2092 &&
  slugs.size === 1046 &&
  assets.filter((asset) => asset.locale === "zh-CN").length === 1046 &&
  assets.filter((asset) => asset.locale === "en").length === 1046 &&
  evidenceRows === 1046 &&
  synthesisRows === 2092 &&
  searchProjectionRows === 2092;
const upstreamReady =
  finalQa.final_conclusion === "READY_FOR_STAGING_PREVIEW_DESIGN" &&
  stagingSmokeSummary.final_conclusion === "AI_IMPACT_V5_1046_STAGING_API_SMOKE_PASS" &&
  stagingSmokeSummary.ready_rows === 2092 &&
  stagingSmokeSummary.failed_rows === 0 &&
  stagingFailClosedSummary.final_conclusion === "AI_IMPACT_V5_FAIL_CLOSED_PASS" &&
  expandedPageQa.final_conclusion === "EXPANDED_PAGE_QA_PASS" &&
  expandedChecks.rendering_ready_rows === expandedChecks.rendering_target_rows;
const finalConclusion =
  structureReady && upstreamReady && findings.length === 0
    ? "AI_IMPACT_V5_EDITORIAL_REVIEW_PASS"
    : "AI_IMPACT_V5_EDITORIAL_REVIEW_REPAIR_REQUIRED";

const approvalManifest = {
  schema_version: "career_ai_impact_v5_approval_manifest_v1",
  generated_at: new Date().toISOString(),
  final_conclusion: finalConclusion,
  production_import_allowed: false,
  next_allowed_transition: finalConclusion === "AI_IMPACT_V5_EDITORIAL_REVIEW_PASS" ? "approved" : "none",
  approved_rows: finalConclusion === "AI_IMPACT_V5_EDITORIAL_REVIEW_PASS" ? assets.length : readyRows.length,
  rejected_rows: findings.length,
  unique_slugs: slugs.size,
  final_repaired_asset_sha256: assetSha,
  final_independent_qa_sha256: finalQaSha,
  expanded_page_qa_sha256: expandedPageQaSha,
  staging_api_smoke_sha256: stagingSmokeSha,
  staging_fail_closed_sha256: stagingFailClosedSha,
  required_for_approved_transition: {
    asset_sha256: assetSha,
    final_independent_qa_sha256: finalQaSha,
    approval_manifest_sha256: "computed_after_write",
    row_count: 2092,
    slug_count: 1046,
  },
};

fs.writeFileSync(
  path.join(outputDir, "approval_manifest.json"),
  JSON.stringify(approvalManifest, null, 2) + "\n",
);
const approvalManifestSha = sha256(path.join(outputDir, "approval_manifest.json"));
approvalManifest.required_for_approved_transition.approval_manifest_sha256 = approvalManifestSha;
fs.writeFileSync(
  path.join(outputDir, "approval_manifest.json"),
  JSON.stringify(approvalManifest, null, 2) + "\n",
);

const audit = {
  schema_version: "career_ai_impact_v5_editorial_review_package_v1",
  generated_at: new Date().toISOString(),
  final_conclusion: finalConclusion,
  report_scope:
    "AI Impact v5 1046 editorial review package; report only; no production import, page runtime, or SEO surface changes",
  inputs: {
    final_repaired_dir: finalDir,
    final_repaired_asset_sha256: assetSha,
    final_independent_qa_sha256: finalQaSha,
    staging_api_smoke_sha256: stagingSmokeSha,
    expanded_page_qa_sha256: expandedPageQaSha,
    approval_manifest_sha256: sha256(path.join(outputDir, "approval_manifest.json")),
  },
  metrics: {
    asset_rows: assets.length,
    evidence_rows: evidenceRows,
    synthesis_rows: synthesisRows,
    search_projection_rows: searchProjectionRows,
    unique_slugs: slugs.size,
    zh_CN_assets: assets.filter((asset) => asset.locale === "zh-CN").length,
    en_assets: assets.filter((asset) => asset.locale === "en").length,
    score_distribution: scoreDistribution,
    high_risk_rows: highRiskRows.length - 1,
    sample_review_rows: sampleReviewRows.length - 1,
    findings: findings.length,
    rejected_rows: findings.length,
  },
  upstream_gates: {
    final_independent_qa: finalQa.final_conclusion,
    staging_api_smoke: stagingSmokeSummary.final_conclusion,
    staging_api_smoke_ready_rows: stagingSmokeSummary.ready_rows,
    staging_api_smoke_failed_rows: stagingSmokeSummary.failed_rows,
    staging_fail_closed: stagingFailClosedSummary.final_conclusion,
    expanded_page_qa: expandedPageQa.final_conclusion,
    expanded_page_rendering_ready_rows: expandedChecks.rendering_ready_rows,
    expanded_page_rendering_target_rows: expandedChecks.rendering_target_rows,
  },
  guarantees: {
    no_production_import: true,
    no_staging_write: true,
    no_page_runtime_change: true,
    no_sitemap_llms_canonical_noindex_jsonld_change: true,
    search_projection_not_in_reader_asset: true,
  },
  findings,
};

fs.writeFileSync(path.join(outputDir, "editorial_review.json"), JSON.stringify(audit, null, 2) + "\n");
fs.writeFileSync(
  path.join(outputDir, "editorial_review.md"),
  [
    "# AI Impact v5 1046 Editorial Review Package",
    "",
    `Final conclusion: \`${finalConclusion}\``,
    "",
    "This is a report-only package. It does not import production data, write staging data, change page runtime, or change SEO surfaces.",
    "",
    "## Inputs",
    "",
    `- Final repaired asset SHA-256: \`${assetSha}\``,
    `- Final independent QA: \`${finalQa.final_conclusion}\``,
    `- Staging API smoke: \`${stagingSmokeSummary.final_conclusion}\` (${stagingSmokeSummary.ready_rows}/${stagingSmokeSummary.target_rows})`,
    `- Staging fail-closed: \`${stagingFailClosedSummary.final_conclusion}\``,
    `- Expanded page QA: \`${expandedPageQa.final_conclusion}\` (${expandedChecks.rendering_ready_rows}/${expandedChecks.rendering_target_rows})`,
    "",
    "## Editorial Decision",
    "",
    `- Asset rows: ${assets.length}`,
    `- Unique slugs: ${slugs.size}`,
    `- zh-CN/en rows: ${audit.metrics.zh_CN_assets}/${audit.metrics.en_assets}`,
    `- Rejected rows: ${findings.length}`,
    `- Approval manifest SHA-256: \`${audit.inputs.approval_manifest_sha256}\``,
    "",
    "## Deferred",
    "",
    "- Production import remains blocked until a separate exact-SHA user approval.",
    "- Approved transition is a separate fap-api PR.",
    "- No sitemap, llms.txt, canonical, noindex, or JSON-LD behavior changes are made here.",
    "",
  ].join("\n"),
);

writeCsv(path.join(outputDir, "ready.csv"), [
  ["slug", "locale", "title_en", "title_zh", "score", "confidence"],
  ...readyRows,
]);
writeCsv(path.join(outputDir, "repair_required.csv"), repairRows);
writeCsv(path.join(outputDir, "blocked.csv"), blockedRows);
writeCsv(path.join(outputDir, "high_risk_review.csv"), highRiskRows);
writeCsv(path.join(outputDir, "sample_editorial_review.csv"), sampleReviewRows);
writeCsv(path.join(outputDir, "approve_reject_manifest.csv"), approvalRows);

const shaManifest = {};
for (const name of fs.readdirSync(outputDir).sort()) {
  const filePath = path.join(outputDir, name);
  if (fs.statSync(filePath).isFile()) {
    shaManifest[name] = sha256(filePath);
  }
}
fs.writeFileSync(path.join(outputDir, "sha256_manifest.json"), JSON.stringify(shaManifest, null, 2) + "\n");

console.log(finalConclusion);
