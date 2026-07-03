#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { sanitizeDateSlug } from "./artifactSafety.mjs";

const repoRoot = process.cwd();
const auditDate = sanitizeDateSlug(process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10), "AUDIT_DATE");
const inputZip = process.env.INPUT_ZIP || "<uploaded_zip>/mbti64-content-package-pilot-v2-final.zip";
const packageRoot = path.join(
  repoRoot,
  "docs/seo/personality/content-packages/pilot-v2/mbti64-content-package-pilot-v2-final",
);
const primaryPath = path.join(packageRoot, "mbti64-content-package-pilot-v2.json");
const selfQaPath = path.join(packageRoot, "mbti64-content-package-pilot-v2-qa-report.json");
const intentMapPath = path.join(repoRoot, "docs/seo/personality/query-intent-map-pilot-v1.json");
const outputJsonPath = path.join(
  repoRoot,
  `docs/seo/personality/content-package-v2-qa-${auditDate}.json`,
);
const outputMarkdownPath = path.join(
  repoRoot,
  `docs/seo/personality/content-package-v2-qa-${auditDate}.md`,
);

const expectedFiles = [
  "README.md",
  "manifest.json",
  "mbti64-content-package-pilot-v2-qa-report.json",
  "mbti64-content-package-pilot-v2.json",
  "operator-notes.md",
  "qa-diff-summary.md",
  "validate-mbti64-content-package-v2.mjs",
  "pages/en__personality__intj-a-vs-intj-t.json",
  "pages/en__personality__intj-a.json",
  "pages/en__personality__intj-t.json",
  "pages/en__personality__intp-a-vs-intp-t.json",
  "pages/zh__personality__infp-t.json",
  "pages/zh__personality__intj-a.json",
  "pages/zh__personality__intj-t.json",
  "pages/zh__personality__istj-a.json",
];

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

const rootRequiredFields = ["artifact", "version", "status", "scope", "global_holds", "rows"];
const rowRequiredFields = [
  "url",
  "locale",
  "page_type",
  "primary_query",
  "secondary_queries",
  "excluded_queries",
  "target_intent",
  "target_test_route",
  "canonical_target",
  "seo",
  "content",
  "faq",
  "internal_links",
  "method_boundary",
  "trademark_boundary",
  "information_gain",
  "claim_risk_notes",
  "qa_flags_for_codex",
  "route_safety",
  "v2_optimization",
  "above_the_fold_module",
  "serp_ctr_package_v2",
  "status",
];
const seoRequiredFields = [
  "seo_title",
  "seo_description",
  "breadcrumb_title",
  "h1",
  "quick_answer_summary",
];
const variantSections = [
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
const comparisonSections = [
  "quick_answer",
  "side_by_side_summary",
  "core_traits_comparison",
  "stress_confidence",
  "career_work_style",
  "relationships_love",
  "which_one_fits",
];
const allowedRoutePatterns = [
  /^\/en\/personality(?:\/.*)?$/,
  /^\/zh\/personality(?:\/.*)?$/,
  /^\/en\/tests\/.*$/,
  /^\/zh\/tests\/.*$/,
  /^#[a-z0-9_-]+$/i,
];
const forbiddenRoutePatterns = [
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
const riskyClaimPatterns = [
  /official\s+MBTI/i,
  /official\s+32\s+types/i,
  /certified\s+MBTI/i,
  /Myers-Briggs\s+authorized/i,
  /official\s+Myers-Briggs\s+result/i,
  /official\s+MBTI\s+provider/i,
  /A\/T\s+is\s+an\s+official\s+native\s+MBTI\s+dimension/i,
  /官方\s*MBTI/i,
  /官方\s*32\s*型/i,
  /MBTI\s*官方/i,
  /A\/T.*官方.*维度/i,
];
const deterministicPatterns = [
  /clinical diagnosis/i,
  /mental-health diagnosis/i,
  /guaranteed\s+(career|job|relationship|partner|outcome|fit)/i,
  /determines?\s+(intelligence|morality|income|destiny|partner|career outcome)/i,
  /诊断/,
  /保证.*(职业|关系|伴侣|结果)/,
  /决定[^。；;.!?！？]{0,16}(智力|道德|收入|命运|伴侣|职业结果)/,
];

const knownHolds = [
  "/results/lookup sidecar classification blocks publish/search release",
  "Operator approval required before CMS import",
  "No sitemap/llms/search-release work in this PR",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableJson(value) {
  return JSON.stringify(value, null, 2);
}

function sha256(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    if (entry.isFile()) out.push(full);
  }
  return out;
}

function valueText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(valueText).join(" ");
  if (typeof value === "object") return Object.values(value).map(valueText).join(" ");
  return String(value);
}

function textHasMeaning(value) {
  return valueText(value).replace(/\s+/g, " ").trim().length > 0;
}

function normalizeText(value) {
  return valueText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value) {
  const text = normalizeText(value);
  if (!text) return new Set();
  return new Set(text.split(/\s+/).filter((token) => token.length > 2));
}

function jaccard(a, b) {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const token of setA) if (setB.has(token)) intersection += 1;
  return intersection / (setA.size + setB.size - intersection);
}

function includesExactPhrase(container, phrase) {
  const haystack = normalizeText(container);
  const needle = normalizeText(phrase);
  return needle.length > 0 && haystack.includes(needle);
}

function isExplicitForbiddenRouteNote(line) {
  return /\b(no|not|without|removed|absent|forbidden|hold|classification|required|does not|do not|content-only)\b/i.test(
    line,
  );
}

function isNegatedClaim(text) {
  return /\b(not|non-official|not an official|not official|is not official|not certified|not authorized|avoid|without|does not)\b/i.test(
    text,
  ) || /非官方|不是官方|不属于官方|避免官方|不得暗示官方|不决定|不能决定/.test(text);
}

function pageFileNameForUrl(url) {
  return `${url.replace(/^\//, "").replaceAll("/", "__")}.json`;
}

function sectionHasH2(value) {
  if (typeof value === "string") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return typeof value.h2 === "string" ? value.h2.trim().length > 0 : textHasMeaning(value);
  }
  return false;
}

function routeExistsEvidence(routePath) {
  const evidenceFiles = [
    "lib/seo/sitemapAuthorityAdapters.cjs",
    "docs/graph/generated/core-topic-graph-inventory.v1.json",
    "docs/personality-ia-spec.md",
    "scripts/check-cms-api-health.mjs",
  ];
  return evidenceFiles
    .filter((file) => fs.existsSync(path.join(repoRoot, file)))
    .filter((file) => fs.readFileSync(path.join(repoRoot, file), "utf8").includes(routePath));
}

function classifyDuplicateRisk(score) {
  if (score >= 0.72) return "high";
  if (score >= 0.48) return "medium";
  return "low";
}

const blockers = [];
const warnings = [];
const packageJsonFiles = [];

if (!fs.existsSync(inputZip)) {
  blockers.push(`Input ZIP missing: ${inputZip}`);
}
if (!fs.existsSync(packageRoot)) {
  blockers.push(`Extracted package directory missing: ${packageRoot}`);
}

const fileInventory = fs.existsSync(packageRoot)
  ? walkFiles(packageRoot).map((file) => path.relative(packageRoot, file)).sort()
  : [];
const missingExpectedFiles = expectedFiles.filter((file) => !fileInventory.includes(file));
if (missingExpectedFiles.length > 0) {
  blockers.push(`Missing expected files: ${missingExpectedFiles.join(", ")}`);
}

for (const file of fileInventory) {
  if (file.endsWith(".json")) {
    const full = path.join(packageRoot, file);
    packageJsonFiles.push(file);
    try {
      readJson(full);
    } catch (error) {
      blockers.push(`Invalid JSON in ${file}: ${error.message}`);
    }
  }
}

const pkg = fs.existsSync(primaryPath) ? readJson(primaryPath) : { rows: [] };
const selfQa = fs.existsSync(selfQaPath) ? readJson(selfQaPath) : null;
const intentMap = fs.existsSync(intentMapPath) ? readJson(intentMapPath) : { rows: [] };
const intentRows = Array.isArray(intentMap) ? intentMap : intentMap.rows || [];
const intentByUrl = new Map(intentRows.map((row) => [row.url, row]));
const rows = Array.isArray(pkg.rows) ? pkg.rows : [];

const schemaValidation = {
  root_required_fields_present: rootRequiredFields.every((field) => Object.hasOwn(pkg, field)),
  version_ok: pkg.version === "pilot-v2",
  status_ok: /draft/i.test(String(pkg.status || "")),
  row_count_ok: rows.length === 8,
  row_required_fields_ok: true,
  seo_required_fields_ok: true,
  variant_sections_ok: true,
  comparison_sections_ok: true,
  faq_min_7_ok: true,
  details: [],
};
for (const field of rootRequiredFields) {
  if (!Object.hasOwn(pkg, field)) schemaValidation.details.push(`missing root field: ${field}`);
}
if (!schemaValidation.version_ok) schemaValidation.details.push(`unexpected version: ${pkg.version}`);
if (!schemaValidation.status_ok) schemaValidation.details.push(`unexpected status: ${pkg.status}`);
if (!schemaValidation.row_count_ok) schemaValidation.details.push(`unexpected row count: ${rows.length}`);

const pilotOrderPreserved =
  rows.length === pilotUrls.length && rows.every((row, index) => row.url === pilotUrls[index]);
if (!pilotOrderPreserved) blockers.push("Pilot queue order changed or row set mismatch.");

const perPageResults = [];
const pageRowsByUrl = new Map();

for (const row of rows) {
  const rowContext = row.url || "unknown-url";
  const missingRowFields = rowRequiredFields.filter((field) => !Object.hasOwn(row, field));
  if (missingRowFields.length) {
    schemaValidation.row_required_fields_ok = false;
    schemaValidation.details.push(`${rowContext}: missing fields ${missingRowFields.join(", ")}`);
  }
  if (row.canonical_target !== row.url) blockers.push(`${rowContext}: canonical_target differs from URL.`);
  const missingSeoFields = seoRequiredFields.filter((field) => !textHasMeaning(row.seo?.[field]));
  if (missingSeoFields.length) {
    schemaValidation.seo_required_fields_ok = false;
    schemaValidation.details.push(`${rowContext}: missing seo fields ${missingSeoFields.join(", ")}`);
  }
  if (!Array.isArray(row.faq) || row.faq.length < 7) {
    schemaValidation.faq_min_7_ok = false;
    schemaValidation.details.push(`${rowContext}: fewer than 7 FAQ items`);
  }

  const requiredSections = row.page_type === "comparison" ? comparisonSections : variantSections;
  const missingSections = requiredSections.filter((section) => !textHasMeaning(row.content?.[section]));
  const missingH2Sections = requiredSections.filter((section) => !sectionHasH2(row.content?.[section]));
  if (missingSections.length || missingH2Sections.length) {
    const key = row.page_type === "comparison" ? "comparison_sections_ok" : "variant_sections_ok";
    schemaValidation[key] = false;
    schemaValidation.details.push(
      `${rowContext}: section issue missing=${missingSections.join(",") || "none"} missing_h2=${missingH2Sections.join(",") || "none"}`,
    );
  }
  if (row.page_type === "comparison") {
    const summaryRows = row.content?.side_by_side_summary?.rows;
    if (!Array.isArray(summaryRows) || summaryRows.length < 3) {
      schemaValidation.comparison_sections_ok = false;
      schemaValidation.details.push(`${rowContext}: side_by_side_summary lacks comparison rows`);
    }
  }

  const pageFile = path.join(packageRoot, "pages", pageFileNameForUrl(row.url));
  let pageFileStatus = "pass";
  let pageFileDetail = "";
  if (!fs.existsSync(pageFile)) {
    pageFileStatus = "fail";
    pageFileDetail = "missing page file";
    blockers.push(`${rowContext}: missing page file`);
  } else {
    const pageRow = readJson(pageFile);
    pageRowsByUrl.set(row.url, pageRow);
    if (pageRow.url !== row.url) {
      pageFileStatus = "fail";
      pageFileDetail = "url mismatch";
      blockers.push(`${rowContext}: page file URL mismatch`);
    } else if (stableJson(pageRow) !== stableJson(row)) {
      pageFileStatus = "fail";
      pageFileDetail = "page content differs from primary row";
      blockers.push(`${rowContext}: page file differs from primary package row`);
    }
  }
  perPageResults.push({ url: row.url, file: `pages/${pageFileNameForUrl(row.url)}`, status: pageFileStatus, detail: pageFileDetail });
}

if (rows.length === pilotUrls.length) {
  const extras = rows.map((row) => row.url).filter((url) => !pilotUrls.includes(url));
  const missing = pilotUrls.filter((url) => !rows.some((row) => row.url === url));
  if (extras.length || missing.length) blockers.push(`Pilot URL mismatch missing=${missing.join(",")} extra=${extras.join(",")}`);
}

const queryIntentDetails = [];
let queryIntentOk = true;
for (const row of rows) {
  const source = intentByUrl.get(row.url);
  if (!source) {
    queryIntentOk = false;
    queryIntentDetails.push(`${row.url}: missing from query intent map`);
    continue;
  }
  for (const field of [
    "url",
    "locale",
    "page_type",
    "primary_query",
    "target_intent",
    "target_test_route",
    "canonical_target",
  ]) {
    if (stableJson(row[field]) !== stableJson(source[field])) {
      queryIntentOk = false;
      queryIntentDetails.push(`${row.url}: ${field} differs from query intent map`);
    }
  }
  for (const field of ["excluded_queries"]) {
    if (stableJson(row[field]) !== stableJson(source[field])) {
      queryIntentOk = false;
      queryIntentDetails.push(`${row.url}: ${field} differs from query intent map`);
    }
  }
  const primary = normalizeText(row.primary_query);
  const targetIntent = normalizeText(row.target_intent);
  if (row.page_type === "variant" && (/\bvs\b|difference|对比|区别/.test(primary) || /\bvs\b|difference|对比|区别/.test(targetIntent))) {
    queryIntentOk = false;
    queryIntentDetails.push(`${row.url}: variant row targets comparison intent`);
  }
  if (row.page_type === "comparison" && !(/\bvs\b|difference|comparison|对比|区别/.test(primary) || /\bvs\b|difference|comparison|对比|区别/.test(targetIntent))) {
    queryIntentOk = false;
    queryIntentDetails.push(`${row.url}: comparison row does not target comparison intent`);
  }
  const seoSurface = [row.seo?.seo_title, row.seo?.h1, row.seo?.quick_answer_summary, row.content?.quick_answer].join(" ");
  for (const excluded of row.excluded_queries || []) {
    if (includesExactPhrase(seoSurface, excluded)) {
      queryIntentOk = false;
      queryIntentDetails.push(`${row.url}: SEO/above-fold surface contains excluded query "${excluded}"`);
    }
  }
  if (row.locale === "zh-CN" && !/[\u4e00-\u9fff]/.test(row.primary_query)) {
    queryIntentOk = false;
    queryIntentDetails.push(`${row.url}: zh-CN primary query is not native Chinese`);
  }
}

const routeIssues = [];
const rawForbiddenMentions = [];
for (const file of fileInventory) {
  const full = path.join(packageRoot, file);
  const text = fs.readFileSync(full, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (forbiddenRoutePatterns.some((pattern) => pattern.test(line)) && !isExplicitForbiddenRouteNote(line)) {
      rawForbiddenMentions.push({ file, line: index + 1, text: line.trim().slice(0, 220) });
    }
  });
}
if (rawForbiddenMentions.length) {
  blockers.push("Forbidden route/private-token patterns appear outside explicit QA hold notes.");
}

for (const row of rows) {
  for (const link of row.internal_links || []) {
    if (!link.href || !link.anchor_text || !link.role || link.safe_public_route !== true) {
      routeIssues.push(`${row.url}: malformed internal link ${stableJson(link)}`);
      continue;
    }
    if (!allowedRoutePatterns.some((pattern) => pattern.test(link.href))) {
      routeIssues.push(`${row.url}: internal link outside allowed public patterns: ${link.href}`);
    }
    if (forbiddenRoutePatterns.some((pattern) => pattern.test(link.href))) {
      routeIssues.push(`${row.url}: forbidden internal link route: ${link.href}`);
    }
  }
}
if (routeIssues.length) blockers.push("Internal link route safety failed.");

const mbtiRouteEvidence = [
  "/en/tests/mbti-personality-test-16-personality-types",
  "/zh/tests/mbti-personality-test-16-personality-types",
].map((route) => ({ route, evidence_files: routeExistsEvidence(route), verified: routeExistsEvidence(route).length > 0 }));
if (mbtiRouteEvidence.some((item) => !item.verified)) {
  warnings.push("MBTI public test route existence could not be fully verified from local route evidence.");
}
const relatedTestsNote = rows.some((row) => String(valueText(row.route_safety)).includes("not included until public canonical routes are confirmed"))
  ? "Big Five / RIASEC related_test links omitted pending route confirmation; operator must accept narrower V2 internal-link scope or request V2.1 content patch."
  : "No omission note found for Big Five / RIASEC related_test links.";
if (relatedTestsNote.startsWith("Big Five")) warnings.push(relatedTestsNote);

const trademarkFindings = [];
const deterministicFindings = [];
for (const row of rows) {
  const rowText = valueText(row);
  for (const pattern of riskyClaimPatterns) {
    const match = rowText.match(pattern);
    if (match && !isNegatedClaim(rowText.slice(Math.max(0, match.index - 80), match.index + 160))) {
      trademarkFindings.push(`${row.url}: risky claim pattern ${pattern}`);
    }
  }
  for (const pattern of deterministicPatterns) {
    const match = rowText.match(pattern);
    if (match && !isNegatedClaim(rowText.slice(Math.max(0, match.index - 80), match.index + 160)) && !/不能决定|不决定|does not decide|not determine/i.test(rowText.slice(Math.max(0, match.index - 80), match.index + 160))) {
      deterministicFindings.push(`${row.url}: deterministic/medical pattern ${pattern}`);
    }
  }
}
if (trademarkFindings.length) blockers.push("Trademark / official-claim scan failed.");
if (deterministicFindings.length) blockers.push("Medical / deterministic / guarantee scan failed.");

const duplicateComparisons = [];
for (let i = 0; i < rows.length; i += 1) {
  for (let j = i + 1; j < rows.length; j += 1) {
    const a = rows[i];
    const b = rows[j];
    const signals = {
      quick_answer: jaccard(a.content?.quick_answer, b.content?.quick_answer),
      seo_title: jaccard(a.seo?.seo_title, b.seo?.seo_title),
      seo_description: jaccard(a.seo?.seo_description, b.seo?.seo_description),
      faq_questions: jaccard((a.faq || []).map((item) => item.question), (b.faq || []).map((item) => item.question)),
      faq_answers: jaccard((a.faq || []).map((item) => item.answer), (b.faq || []).map((item) => item.answer)),
      career_examples: jaccard(a.content?.careers_work_style || a.content?.career_work_style, b.content?.careers_work_style || b.content?.career_work_style),
      relationship_examples: jaccard(a.content?.relationships_communication || a.content?.relationships_love, b.content?.relationships_communication || b.content?.relationships_love),
      h2: jaccard(
        Object.values(a.content || {}).map((section) => section?.h2 || ""),
        Object.values(b.content || {}).map((section) => section?.h2 || ""),
      ),
    };
    const substantiveSignals = { ...signals };
    delete substantiveSignals.h2;
    const substantiveMaxScore = Math.max(...Object.values(substantiveSignals));
    const h2OnlyScore = signals.h2;
    const maxScore = Math.max(substantiveMaxScore, h2OnlyScore);
    const risk = classifyDuplicateRisk(substantiveMaxScore);
    if (risk !== "low") {
      duplicateComparisons.push({
        a: a.url,
        b: b.url,
        risk,
        max_score: Number(maxScore.toFixed(3)),
        substantive_max_score: Number(substantiveMaxScore.toFixed(3)),
        h2_only_score: Number(h2OnlyScore.toFixed(3)),
        signals,
      });
    } else if (h2OnlyScore >= 0.72) {
      duplicateComparisons.push({
        a: a.url,
        b: b.url,
        risk: "low",
        max_score: Number(maxScore.toFixed(3)),
        substantive_max_score: Number(substantiveMaxScore.toFixed(3)),
        h2_only_score: Number(h2OnlyScore.toFixed(3)),
        note: "shared section-heading architecture only; substantive fields are below medium-risk threshold",
        signals,
      });
    }
  }
}
const highDuplicatePairs = duplicateComparisons.filter((item) => item.risk === "high");
if (highDuplicatePairs.length) {
  warnings.push("High duplicate-risk pairs require editorial review before CMS import.");
}

const duplicateRiskByPage = rows.map((row) => {
  const relevant = duplicateComparisons.filter((item) => item.a === row.url || item.b === row.url);
  const worst = relevant.some((item) => item.risk === "high") ? "high" : relevant.some((item) => item.risk === "medium") ? "medium" : "low";
  return { url: row.url, risk: worst, compared_pairs: relevant.length };
});

const serpIssues = [];
for (const row of rows) {
  const serp = row.serp_ctr_package_v2 || {};
  if (!textHasMeaning(serp.quick_answer_summary) || !includesExactPhrase(serp.quick_answer_summary, row.primary_query.split(/\s+/)[0])) {
    serpIssues.push(`${row.url}: SERP quick answer does not obviously align to primary query`);
  }
  for (const excluded of row.excluded_queries || []) {
    if (includesExactPhrase(serp, excluded)) serpIssues.push(`${row.url}: SERP package targets excluded query ${excluded}`);
  }
  if (/most accurate|certified|official|guaranteed|rarest|最准确|官方|认证|保证|最稀有/i.test(valueText(serp)) && !/avoid|non-official|非官方边界|官方测试暗示/.test(valueText(serp))) {
    serpIssues.push(`${row.url}: SERP package contains risky CTR language`);
  }
}
if (serpIssues.length) warnings.push("SERP CTR package has review warnings.");

const infoGainIssues = [];
for (const row of rows) {
  const info = row.information_gain || {};
  for (const field of ["why_this_page_is_not_template_content", "unique_user_value", "fermatmind_specific_path"]) {
    if (!textHasMeaning(info[field]) || valueText(info[field]).trim().length < 20) {
      infoGainIssues.push(`${row.url}: weak information_gain.${field}`);
    }
  }
}
if (infoGainIssues.length) blockers.push("Information gain validation failed.");

const selfQaComparison = {
  self_qa_status: selfQa?.status || "missing",
  self_qa_reported_pass: selfQa?.status === "pass",
  independent_blockers_found: blockers.length,
  independent_warnings_found: warnings.length,
  independent_validation_wins: true,
};

const status = blockers.length > 0 ? "fail" : warnings.length > 0 || highDuplicatePairs.length > 0 ? "conditional" : "pass";
const recommendedNextTask =
  status === "fail"
    ? "GPT V2.1 content patch, not CMS import"
    : "MBTI64-TRADEMARK-CLAIM-GATE-01 and MBTI64-DUPLICATE-DIFFERENTIATION-GATE-01 before any CMS import";

const qa = {
  artifact: "MBTI64-CONTENT-PACKAGE-QA-01",
  input_zip: inputZip,
  input_zip_sha256: sha256(inputZip),
  status,
  row_count: rows.length,
  pilot_order_preserved: pilotOrderPreserved,
  file_inventory: {
    expected_files: expectedFiles,
    present_files: fileInventory,
    missing_expected_files: missingExpectedFiles,
    json_files_parsed: packageJsonFiles,
  },
  schema_validation: schemaValidation,
  query_intent_validation: {
    status: queryIntentOk ? "pass" : "fail",
    details: queryIntentDetails,
  },
  route_safety_validation: {
    status: routeIssues.length || rawForbiddenMentions.length ? "fail" : "pass",
    internal_link_issues: routeIssues,
    raw_forbidden_mentions_outside_hold_notes: rawForbiddenMentions,
    mbti_test_route_evidence: mbtiRouteEvidence,
    related_tests_note: relatedTestsNote,
  },
  trademark_claim_validation: {
    status: trademarkFindings.length ? "fail" : "pass",
    findings: trademarkFindings,
  },
  medical_deterministic_claim_validation: {
    status: deterministicFindings.length ? "fail" : "pass",
    findings: deterministicFindings,
  },
  duplicate_differentiation_validation: {
    status: highDuplicatePairs.length ? "conditional" : "pass",
    duplicate_risk_by_page: duplicateRiskByPage,
    notable_pairs: duplicateComparisons,
  },
  serp_ctr_validation: {
    status: serpIssues.length ? "conditional" : "pass",
    findings: serpIssues,
  },
  information_gain_validation: {
    status: infoGainIssues.length ? "fail" : "pass",
    findings: infoGainIssues,
  },
  per_page_file_validation: {
    status: perPageResults.some((item) => item.status !== "pass") ? "fail" : "pass",
    pages: perPageResults,
  },
  package_self_qa_verification: selfQaComparison,
  known_holds: knownHolds,
  blockers,
  warnings,
  recommended_next_task: recommendedNextTask,
};

const summaryRows = rows
  .map((row) => {
    const dup = duplicateRiskByPage.find((item) => item.url === row.url)?.risk || "unknown";
    return `| ${row.url} | ${row.locale} | ${row.page_type} | ${row.primary_query} | ${dup} | ${row.target_test_route} |`;
  })
  .join("\n");

const markdown = `# MBTI64 Content Package V2 QA

## Summary
- Artifact: MBTI64-CONTENT-PACKAGE-QA-01
- Input ZIP: ${inputZip}
- ZIP SHA256: ${qa.input_zip_sha256 || "missing"}
- Final status: ${status}
- Row count: ${rows.length}
- Pilot order preserved: ${pilotOrderPreserved}
- Recommended next task: ${recommendedNextTask}

This PR did not import CMS drafts, publish pages, change sitemap, change llms, change llms-full, or submit search URLs.

## File Inventory
- Present files: ${fileInventory.length}
- Missing expected files: ${missingExpectedFiles.length ? missingExpectedFiles.join(", ") : "none"}
- JSON files parsed: ${packageJsonFiles.length}

## 8-Row Summary
| URL | Locale | Page type | Primary query | Duplicate risk | Target test route |
| --- | --- | --- | --- | --- | --- |
${summaryRows}

## Validation Results
| Gate | Status |
| --- | --- |
| Schema validation | ${schemaValidation.root_required_fields_present && schemaValidation.row_required_fields_ok && schemaValidation.seo_required_fields_ok ? "pass" : "fail"} |
| Query intent validation | ${qa.query_intent_validation.status} |
| Route safety validation | ${qa.route_safety_validation.status} |
| Trademark / official-claim validation | ${qa.trademark_claim_validation.status} |
| Medical / deterministic / guarantee validation | ${qa.medical_deterministic_claim_validation.status} |
| Duplicate / differentiation validation | ${qa.duplicate_differentiation_validation.status} |
| SERP CTR validation | ${qa.serp_ctr_validation.status} |
| Information gain validation | ${qa.information_gain_validation.status} |
| Per-page file validation | ${qa.per_page_file_validation.status} |

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}

## Route Safety
- Forbidden route/private-token patterns outside explicit QA hold notes: ${rawForbiddenMentions.length}
- Internal link route issues: ${routeIssues.length}
- MBTI test route evidence:
${mbtiRouteEvidence.map((item) => `  - ${item.route}: ${item.verified ? `verified via ${item.evidence_files.join(", ")}` : "conditional"}`).join("\n")}
- Big Five/RIASEC related test scope: ${relatedTestsNote}

## Trademark Result
${trademarkFindings.length ? trademarkFindings.map((item) => `- ${item}`).join("\n") : "- No un-negated official/certified/authorized MBTI claim detected."}

## Duplicate / Differentiation Result
${duplicateRiskByPage.map((item) => `- ${item.url}: ${item.risk}`).join("\n")}

## Package Self-QA Cross-Check
- Self-QA status: ${selfQaComparison.self_qa_status}
- Independent blockers found: ${selfQaComparison.independent_blockers_found}
- Independent warnings found: ${selfQaComparison.independent_warnings_found}
- Final authority: independent Codex validation

## Known Holds
${knownHolds.map((item) => `- ${item}`).join("\n")}
`;

fs.writeFileSync(outputJsonPath, `${stableJson(qa)}\n`);
fs.writeFileSync(outputMarkdownPath, markdown);

console.log(`mbti64-content-package-v2-qa-${status}`);
console.log(`json=${path.relative(repoRoot, outputJsonPath)}`);
console.log(`markdown=${path.relative(repoRoot, outputMarkdownPath)}`);
if (status === "fail") {
  process.exitCode = 1;
}
