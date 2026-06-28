#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-06-28";
const GENERATED_AT = process.env.GENERATED_AT ?? "2026-06-28T12:00:00.000Z";
const INPUT_PATH = resolvePath(
  getArgValue("--input") ??
    "docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-2026-06-28.json",
);
const OUTPUT_JSON = resolvePath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti64-remaining-58-competitor-gap-qa-v2-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolvePath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti64-remaining-58-competitor-gap-qa-v2-${GENERATED_DATE}.md`,
);

const EXPECTED_TARGET_COUNT = 58;
const COMPLETED_V2_PATHS = new Set([
  "/zh/personality/intp-a",
  "/en/personality/intp-a",
  "/zh/personality/esfp-a",
  "/en/personality/esfp-a",
  "/en/personality/enfj-a",
  "/zh/personality/enfj-a",
]);

const REQUIRED_SECTION_KEYS = [
  "how_to_read",
  "at_difference_table",
  "cognitive_function_mechanism",
  "work_scenario",
  "relationship_communication",
  "stress_growth",
  "common_misreads",
  "how_to_use_not_use",
];

const REQUIRED_SAFETY_FLAGS = [
  "cms_write",
  "approval_queue_write",
  "live_promotion",
  "publish_index_search",
  "sitemap_llms_mutation",
  "search_queue_mutation",
  "indexnow_submit",
  "frontend_runtime_change",
  "competitor_text_copied",
];

const TRADEMARK_PATTERNS = [
  /\bofficial\s+MBTI\b/i,
  /\bofficial\s+Myers[-\s]?Briggs\b/i,
  /\bMyers[-\s]?Briggs\s+(?:affiliated|certified|approved|endorsed)\b/i,
  /\bMBTI\s+(?:certified|approved|endorsed|officially)\b/i,
  /\bofficial\s+16\s+types?\b/i,
  /\bofficial\s+32\s+types?\b/i,
  /官方\s*(?:MBTI|迈尔斯|Myers[-\s]?Briggs|16\s*型|32\s*型)/i,
];

const DETERMINISTIC_PATTERNS = [
  /\bperfect\s+match\b/i,
  /\bguaranteed\b/i,
  /\bdestined\b/i,
  /\bmust\s+(?:choose|avoid|become|date|hire)\b/i,
  /\bwill\s+(?:always|never)\b/i,
  /\bbest\s+career\s+for\b/i,
  /\bideal\s+(?:career|partner|relationship)\b/i,
  /\bpredicts?\s+(?:your\s+)?(?:career|relationship|intelligence|success)\b/i,
  /\bIQ\s+(?:level|score|ranking|rank)\b/i,
  /\b命中注定\b/i,
  /\b保证\b/i,
  /\b必须(?:选择|避免|成为|雇佣)\b/i,
  /\b最适合的(?:职业|伴侣|关系)\b/i,
  /\b决定(?:职业|关系|命运|智商)\b/i,
];

const CLINICAL_RECRUITING_PATTERNS = [
  /\bclinical\s+(?:diagnosis|diagnostic|screening)\b/i,
  /\bdiagnos(?:e|is|tic)\s+(?:tool|signal|measure)\b/i,
  /\bmental\s+health\s+(?:diagnosis|screening)\b/i,
  /\bhiring\s+(?:screen|screening|filter|decision)\b/i,
  /\brecruit(?:ing|ment)\s+(?:screen|filter|decision)\b/i,
  /\b诊断(?:工具|依据|信号)\b/i,
  /\b临床(?:诊断|筛查)\b/i,
  /\b招聘(?:筛选|决策|过滤)\b/i,
];

const COMPETITOR_COPY_PATTERNS = [
  /\bcopied\s+from\b/i,
  /\bverbatim\s+(?:from|competitor)\b/i,
  /\b16personalities\s+wording\b/i,
  /\b123test\s+wording\b/i,
  /\btruity\s+wording\b/i,
  /\bcrystal\s+wording\b/i,
  /\bpersonalityjunkie\s+wording\b/i,
  /复制(?:竞品|16P|123test|Truity|Crystal)/i,
];

const PRIVATE_ROUTE_SEGMENTS = new Set([
  "result",
  "results",
  "order",
  "orders",
  "pay",
  "payment",
  "history",
  "private",
  "account",
  "share",
]);

const SENSITIVE_QUERY_PATTERNS = [/\btoken=/i, /\bsession=/i, /\bresult_id=/i, /\breport_id=/i, /\border_no=/i];

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolvePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function collectStringValues(value, values = []) {
  if (typeof value === "string") {
    values.push(value);
    return values;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, values);
    return values;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, values);
  }
  return values;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripSafeBoundarySentences(text) {
  return String(text)
    .replace(/\bNo\.\s+[^.。]*(?:affiliation|official|diagnosis|hiring|screen|ability|career|relationship)[^.。]*[.。]/gi, " ")
    .replace(/\bNo\s+[^.。]*(?:affiliation|official|diagnosis|hiring|screen|ability|career|relationship|clinical)[^.。]*[.。]/gi, " ")
    .replace(/\bDo\s+not\s+use[^.。]*(?:diagnosis|hiring|screen|career|relationship|intelligence|clinical)[^.。]*[.。]/gi, " ")
    .replace(/\bnot\s+(?:as\s+)?(?:a\s+)?(?:diagnosis|hiring\s+screen|ability\s+measure|career\s+verdict|relationship\s+prediction|clinical\s+truth)[^.。]*/gi, " ")
    .replace(/\bdoes\s+not\s+claim\s+affiliation[^.。]*/gi, " ")
    .replace(/\bwithout\s+copying\s+competitor\s+wording\b/gi, " ")
    .replace(/(?:is\s+this|this\s+page\s+is\s+not)[^.。]*(?:official\s+MBTI|affiliated)[^.。]*[.。]?/gi, " ")
    .replace(/这页是官方\s*MBTI[^。?？]*(?:吗|？|\?)?/gi, " ")
    .replace(/不(?:声称|暗示)[^。]*(?:官方|隶属|认证|授权|MBTI)[^。]*[。]?/gi, " ")
    .replace(/(?:没有|避免|不会)[^。]*(?:复制|照搬)[^。]*(?:竞品|16P|123test|Truity|Crystal|措辞)[^。]*[。]?/gi, " ")
    .replace(/不(?:用于|作为|是|应当|应该)?[^。]*(?:诊断|招聘|筛选|智商|职业决定|关系预测|官方|隶属)[^。]*[。]?/gi, " ")
    .replace(/不是[^。]*(?:诊断|官方|招聘|筛选|智商|职业决定|关系预测)[^。]*[。]?/gi, " ");
}

function patternHits(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function pathInfo(targetUrl) {
  try {
    const url = new URL(targetUrl);
    return { host: url.hostname, pathname: url.pathname };
  } catch {
    return { host: "", pathname: "" };
  }
}

function isVariantPath(pathname) {
  return /^\/(?:en|zh)\/personality\/(?:intj|intp|entj|entp|infj|infp|enfj|enfp|istj|isfj|estj|esfj|istp|isfp|estp|esfp)-[at]$/.test(
    pathname,
  );
}

function findPrivateRouteHits(item) {
  const hits = [];
  for (const value of collectStringValues(item)) {
    const text = value.trim();
    if (SENSITIVE_QUERY_PATTERNS.some((pattern) => pattern.test(text))) {
      hits.push(`sensitive_query:${text}`);
    }
    if (text.startsWith("/")) {
      if (isPrivatePath(text)) hits.push(`private_path:${text}`);
      continue;
    }
    if (!/^https?:\/\//i.test(text)) continue;
    try {
      const url = new URL(text);
      if (url.hostname === "fermatmind.com" && isPrivatePath(url.pathname)) {
        hits.push(`private_absolute_url:${url.pathname}`);
      }
    } catch {
      hits.push("malformed_absolute_url");
    }
  }
  return [...new Set(hits)];
}

function isPrivatePath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (!["en", "zh"].includes(segments[0])) return false;
  return PRIVATE_ROUTE_SEGMENTS.has(segments[1] ?? "");
}

function valueOfRecommended(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.recommended === "string") return value.recommended;
  return "";
}

function sectionKeys(row) {
  return (row.recommendations?.sections ?? []).map((section) => section.key ?? "");
}

function sectionTitles(row) {
  return (row.recommendations?.sections ?? []).map((section) => section.title ?? "");
}

function faqQuestions(row) {
  return (row.recommendations?.faq ?? []).map((faq) => faq.question ?? "");
}

function signature(parts) {
  return normalizeText(parts.join(" | "));
}

function groupBy(rows, getKey) {
  const groups = new Map();
  for (const row of rows) {
    const key = getKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

function counterpartPath(row) {
  return row.path?.startsWith("/en/")
    ? row.path.replace(/^\/en\//, "/zh/")
    : row.path?.replace(/^\/zh\//, "/en/");
}

function evaluateInventory(row, allRows) {
  const failures = [];
  const { host, pathname } = pathInfo(row.target_url);
  if (host !== "fermatmind.com") failures.push("target_url_not_fermatmind");
  if (row.path !== pathname) failures.push("path_target_url_mismatch");
  if (!isVariantPath(row.path ?? "")) failures.push("not_mbti_variant_path");
  if (String(row.path ?? "").includes("-vs-")) failures.push("comparison_path_included");
  if (COMPLETED_V2_PATHS.has(row.path)) failures.push("completed_v2_path_included");
  if (row.framework !== "mbti64") failures.push("framework_not_mbti64");
  if (row.page_type !== "variant") failures.push("page_type_not_variant");
  if (!["en", "zh", "zh-CN"].includes(row.locale)) failures.push("unsupported_locale");
  if (!allRows.some((candidate) => candidate.path === counterpartPath(row))) failures.push("missing_bilingual_counterpart");
  return failures;
}

function evaluateStructure(row) {
  const failures = [];
  const recommendation = row.recommendations ?? {};
  const title = valueOfRecommended(recommendation.title);
  const description = valueOfRecommended(recommendation.description);
  const h1 = valueOfRecommended(recommendation.h1);
  const quickAnswer = valueOfRecommended(recommendation.quick_answer);
  const sections = recommendation.sections ?? [];
  const faq = recommendation.faq ?? [];
  const keys = sectionKeys(row);

  if (!title || !title.includes("| FermatMind")) failures.push("title_missing_brand_suffix");
  if ((title.match(/FermatMind/g) ?? []).length !== 1) failures.push("title_brand_suffix_not_single");
  const minDescriptionLength = row.locale === "en" ? 80 : 45;
  if (!description || description.length < minDescriptionLength || description.length > 220) {
    failures.push("description_length_outside_v2_band");
  }
  if (!h1 || h1.includes("|")) failures.push("h1_missing_or_contains_brand_separator");
  if (!quickAnswer || quickAnswer.length < 120) failures.push("quick_answer_too_short");
  if (sections.length < 7 || sections.length > 9) failures.push("section_count_outside_7_9");
  for (const requiredKey of REQUIRED_SECTION_KEYS) {
    if (!keys.includes(requiredKey)) failures.push(`missing_section:${requiredKey}`);
  }
  if (faq.length < 8 || faq.length > 10) failures.push("faq_count_outside_8_10");
  if (!sections.some((section) => Array.isArray(section.comparison_rows) && section.comparison_rows.length >= 3)) {
    failures.push("missing_at_difference_table_rows");
  }
  if (!sections.some((section) => section.key === "cognitive_function_mechanism" && /\b(?:[FSNT][ei]-){3}[FSNT][ei]\b/i.test(section.title ?? ""))) {
    failures.push("missing_cognitive_function_stack_title");
  }
  if (!sections.some((section) => section.key === "work_scenario")) failures.push("missing_work_scenario");
  if (!sections.some((section) => section.key === "relationship_communication")) {
    failures.push("missing_relationship_communication_scenario");
  }
  if (!sections.some((section) => section.key === "how_to_use_not_use")) failures.push("missing_safe_use_boundary");
  if (!Array.isArray(recommendation.internal_links) || recommendation.internal_links.length < 3) {
    failures.push("internal_links_less_than_3");
  }
  return failures;
}

function evaluateClaimSafety(row) {
  const visibleText = collectStringValues(row.recommendations).join("\n");
  const riskText = stripSafeBoundarySentences(visibleText);
  return {
    trademark_affiliation_gate: patternHits(riskText, TRADEMARK_PATTERNS),
    deterministic_claim_gate: patternHits(riskText, DETERMINISTIC_PATTERNS),
    clinical_recruiting_gate: patternHits(riskText, CLINICAL_RECRUITING_PATTERNS),
  };
}

function evaluateCompetitorCopy(row, packageSafetyBoundary) {
  const failures = [];
  const serialized = JSON.stringify(row);
  if (packageSafetyBoundary?.competitor_text_copied !== false) failures.push("package_competitor_text_boundary_not_false");
  failures.push(...patternHits(stripSafeBoundarySentences(serialized), COMPETITOR_COPY_PATTERNS));
  if (!Array.isArray(row.recommendations?.source_ledger_refs) || row.recommendations.source_ledger_refs.length < 3) {
    failures.push("source_ledger_refs_missing_or_too_short");
  }
  return failures;
}

function evaluatePrivateRoutes(row) {
  const failures = findPrivateRouteHits(row);
  for (const link of row.recommendations?.internal_links ?? []) {
    if (link.safe_public_route !== true) failures.push(`unsafe_internal_link:${link.href ?? "missing_href"}`);
    if (typeof link.href !== "string" || !link.href.startsWith(row.locale === "en" ? "/en/" : "/zh/")) {
      failures.push(`wrong_locale_internal_link:${link.href ?? "missing_href"}`);
    }
  }
  return failures;
}

function buildDuplicateGroups(rows) {
  const fullGroups = groupBy(rows, (row) =>
    signature([
      valueOfRecommended(row.recommendations?.title),
      valueOfRecommended(row.recommendations?.description),
      valueOfRecommended(row.recommendations?.h1),
      valueOfRecommended(row.recommendations?.quick_answer),
      ...sectionTitles(row),
      ...faqQuestions(row),
    ]),
  );
  const quickAnswerGroups = groupBy(rows, (row) => signature([valueOfRecommended(row.recommendations?.quick_answer)]));
  const titleGroups = groupBy(rows, (row) => signature([valueOfRecommended(row.recommendations?.title)]));
  return {
    full_duplicate_groups: [...fullGroups.entries()].filter(([, group]) => group.length > 1),
    quick_answer_duplicate_groups: [...quickAnswerGroups.entries()].filter(([, group]) => group.length > 1),
    title_duplicate_groups: [...titleGroups.entries()].filter(([, group]) => group.length > 1),
  };
}

function evaluateBilingualParity(row, rowsByPath) {
  const failures = [];
  const counterpart = rowsByPath.get(counterpartPath(row));
  if (!counterpart) return ["missing_bilingual_counterpart"];
  if (row.type_code !== counterpart.type_code) failures.push("counterpart_type_code_mismatch");
  if (row.variant !== counterpart.variant) failures.push("counterpart_variant_mismatch");
  if (sectionKeys(row).join("|") !== sectionKeys(counterpart).join("|")) failures.push("section_key_parity_mismatch");
  if ((row.recommendations?.faq ?? []).length !== (counterpart.recommendations?.faq ?? []).length) {
    failures.push("faq_count_parity_mismatch");
  }
  if (signature([valueOfRecommended(row.recommendations?.quick_answer)]) === signature([valueOfRecommended(counterpart.recommendations?.quick_answer)])) {
    failures.push("literal_translation_or_duplicate_quick_answer_risk");
  }
  if (!row.recommendations?.bilingual_parity_notes?.some((note) => String(note).includes(counterpart.path))) {
    failures.push("bilingual_parity_note_missing_counterpart_path");
  }
  return failures;
}

function evaluateRow(row, context) {
  const claimSafety = evaluateClaimSafety(row);
  const gates = {
    inventory_gate: evaluateInventory(row, context.rows),
    structure_gate: evaluateStructure(row),
    trademark_affiliation_gate: claimSafety.trademark_affiliation_gate,
    deterministic_claim_gate: claimSafety.deterministic_claim_gate,
    clinical_recruiting_gate: claimSafety.clinical_recruiting_gate,
    competitor_copy_gate: evaluateCompetitorCopy(row, context.packageSafetyBoundary),
    duplicate_template_gate: [
      ...(context.duplicateGroups.full_duplicate_groups.some(([, group]) => group.includes(row)) ? ["full_duplicate_signature"] : []),
      ...(context.duplicateGroups.quick_answer_duplicate_groups.some(([, group]) => group.includes(row))
        ? ["quick_answer_duplicate_signature"]
        : []),
      ...(context.duplicateGroups.title_duplicate_groups.some(([, group]) => group.includes(row)) ? ["title_duplicate_signature"] : []),
    ],
    private_route_gate: evaluatePrivateRoutes(row),
    bilingual_structure_parity_gate: evaluateBilingualParity(row, context.rowsByPath),
  };
  const failedGates = Object.entries(gates)
    .filter(([, failures]) => failures.length > 0)
    .map(([gate]) => gate);
  return {
    target_url: row.target_url,
    path: row.path,
    locale: row.locale,
    page_type: row.page_type,
    type_code: row.type_code,
    section_count: row.recommendations?.sections?.length ?? 0,
    faq_count: row.recommendations?.faq?.length ?? 0,
    gates: Object.fromEntries(
      Object.entries(gates).map(([gate, failures]) => [
        gate,
        {
          status: failures.length === 0 ? "pass" : "fail",
          failures,
        },
      ]),
    ),
    qa_decision: failedGates.length === 0 ? "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC" : "NO_GO_QA_REPAIR_REQUIRED",
    blocked_reason: failedGates.length === 0 ? null : failedGates.join(","),
  };
}

function summarizeDuplicateGroups(duplicateGroups) {
  return Object.fromEntries(
    Object.entries(duplicateGroups).map(([key, groups]) => [
      key,
      groups.map(([duplicateSignature, rows]) => ({
        signature_sha256: sha256(duplicateSignature),
        count: rows.length,
        paths: rows.map((row) => row.path),
      })),
    ]),
  );
}

function evaluatePackage(pkg) {
  const rows = pkg.recommendations ?? [];
  const rowsByPath = new Map(rows.map((row) => [row.path, row]));
  const duplicateGroups = buildDuplicateGroups(rows);
  const context = {
    rows,
    rowsByPath,
    duplicateGroups,
    packageSafetyBoundary: pkg.safety_boundary,
  };
  const pageResults = rows.map((row) => evaluateRow(row, context));
  const blockers = [];
  const completedHits = rows.filter((row) => COMPLETED_V2_PATHS.has(row.path)).map((row) => row.path);
  const comparisonRows = rows.filter((row) => row.path?.includes("-vs-"));
  if (rows.length !== EXPECTED_TARGET_COUNT) blockers.push(`target_count:${rows.length}`);
  if (new Set(rows.map((row) => row.path)).size !== rows.length) blockers.push("duplicate_paths");
  if (completedHits.length > 0) blockers.push(`completed_v2_paths_included:${completedHits.join(",")}`);
  if (comparisonRows.length > 0) blockers.push(`comparison_paths_included:${comparisonRows.map((row) => row.path).join(",")}`);
  for (const flag of REQUIRED_SAFETY_FLAGS) {
    if (pkg.safety_boundary?.[flag] !== false) blockers.push(`safety_flag_not_false:${flag}`);
  }
  const failedRows = pageResults.filter((row) => row.qa_decision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
  const gateTotals = {};
  for (const row of pageResults) {
    for (const [gate, result] of Object.entries(row.gates)) {
      gateTotals[gate] ??= { passed: 0, failed: 0 };
      gateTotals[gate][result.status === "pass" ? "passed" : "failed"] += 1;
    }
  }
  return {
    pageResults,
    blockers,
    failedRows,
    gateTotals,
    duplicateGroups,
    summary: {
      target_count: rows.length,
      pass_count: pageResults.length - failedRows.length,
      blocked_count: failedRows.length,
      variant_pages: rows.filter((row) => row.page_type === "variant").length,
      comparison_pages: comparisonRows.length,
      completed_v2_exclusion_count: completedHits.length,
      section_count_min: Math.min(...pageResults.map((row) => row.section_count)),
      section_count_max: Math.max(...pageResults.map((row) => row.section_count)),
      faq_count_min: Math.min(...pageResults.map((row) => row.faq_count)),
      faq_count_max: Math.max(...pageResults.map((row) => row.faq_count)),
      duplicate_signature_group_count:
        duplicateGroups.full_duplicate_groups.length +
        duplicateGroups.quick_answer_duplicate_groups.length +
        duplicateGroups.title_duplicate_groups.length,
    },
  };
}

function buildMarkdown(report) {
  const failed = report.page_results.filter((row) => row.qa_decision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
  return `# MBTI64 Remaining 58 Competitor-Gap QA V2

## Decision

${report.final_decision}

## Summary

- Input package: \`${report.input_artifact}\`
- Source package SHA256: \`${report.source_package_sha256}\`
- Target count: ${report.summary.target_count}
- Passed: ${report.summary.pass_count}
- Blocked: ${report.summary.blocked_count}
- Comparison pages: ${report.summary.comparison_pages}
- Completed V2 exclusions included: ${report.summary.completed_v2_exclusion_count}
- Section count range: ${report.summary.section_count_min}-${report.summary.section_count_max}
- FAQ count range: ${report.summary.faq_count_min}-${report.summary.faq_count_max}

## Gate Rollup

${Object.entries(report.gate_totals)
  .map(([gate, totals]) => `- ${gate}: ${totals.passed} pass / ${totals.failed} fail`)
  .join("\n")}

## Safety Boundary

- CMS write: ${report.safety_boundary.cms_write}
- Approval queue write: ${report.safety_boundary.approval_queue_write}
- Live promotion: ${report.safety_boundary.live_promotion}
- Publish/index/search: ${report.safety_boundary.publish_index_search}
- Sitemap/llms mutation: ${report.safety_boundary.sitemap_llms_mutation}
- Search queue mutation: ${report.safety_boundary.search_queue_mutation}
- IndexNow submit: ${report.safety_boundary.indexnow_submit}
- Frontend runtime change: ${report.safety_boundary.frontend_runtime_change}

## Failed Rows

${failed.length === 0 ? "None." : failed.map((row) => `- ${row.path}: ${row.blocked_reason}`).join("\n")}

## Next Task

\`${report.recommended_next_task}\`
`;
}

const pkg = readJson(INPUT_PATH);
const sourcePackageBytes = fs.readFileSync(INPUT_PATH, "utf8");
const sourcePackageSha256 = sha256(sourcePackageBytes);
const evaluation = evaluatePackage(pkg);
const pass = evaluation.blockers.length === 0 && evaluation.failedRows.length === 0;
const reportWithoutSha = {
  artifact: "MBTI64-REMAINING-58-COMPETITOR-GAP-QA-V2-01",
  generated_at: GENERATED_AT,
  input_artifact: rel(INPUT_PATH),
  source_package_sha256: sourcePackageSha256,
  page_results: evaluation.pageResults,
  summary: evaluation.summary,
  gate_totals: evaluation.gateTotals,
  duplicate_template_gate: {
    decision: evaluation.summary.duplicate_signature_group_count === 0 ? "pass" : "fail",
    duplicate_groups: summarizeDuplicateGroups(evaluation.duplicateGroups),
  },
  safety_boundary: {
    artifact_only: true,
    cms_write: false,
    approval_queue_write: false,
    live_promotion: false,
    publish_index_search: false,
    sitemap_llms_mutation: false,
    search_queue_mutation: false,
    indexnow_submit: false,
    frontend_runtime_change: false,
    url_truth_write: false,
    production_deploy: false,
    external_api_call: false,
  },
  blockers: evaluation.blockers,
  final_decision: pass ? "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC" : "NO_GO_QA_REPAIR_REQUIRED",
  recommended_next_task: pass
    ? "MBTI64-REMAINING-58-COMPETITOR-GAP-ARTIFACT-SYNC-01"
    : "MBTI64-REMAINING-58-COMPETITOR-GAP-CONTENT-EXPANSION-V2-REPAIR-01",
};
const report = {
  ...reportWithoutSha,
  qa_v2_sha256: sha256(JSON.stringify(reportWithoutSha)),
};

writeJson(OUTPUT_JSON, report);
writeText(OUTPUT_MD, buildMarkdown(report));

console.log(
  JSON.stringify(
    {
      ok: pass,
      output_json: rel(OUTPUT_JSON),
      output_md: rel(OUTPUT_MD),
      final_decision: report.final_decision,
      rows_evaluated: report.summary.target_count,
      rows_passed: report.summary.pass_count,
      rows_blocked: report.summary.blocked_count,
      qa_v2_sha256: report.qa_v2_sha256,
    },
    null,
    2,
  ),
);

if (!pass) {
  process.exitCode = 1;
}
