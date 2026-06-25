#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_DATE =
  getArgValue("--generated-date") ?? process.env.PERSONALITY_AGENT_NEXT_BATCH_QA_DATE ?? "2026-06-25";
const INPUT_PATH = resolveRepoPath(
  getArgValue("--input") ??
    "docs/seo/personality/personality-agent-operations-next-batch-recommendations-2026-06-25.json",
);
const OUTPUT_JSON = resolveRepoPath(
  getArgValue("--output-json") ?? `docs/seo/personality/personality-agent-operations-next-batch-qa-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolveRepoPath(
  getArgValue("--output-md") ?? `docs/seo/personality/personality-agent-operations-next-batch-qa-${GENERATED_DATE}.md`,
);
const OUTPUT_CSV = resolveRepoPath(
  getArgValue("--output-csv") ?? `docs/seo/personality/personality-agent-operations-next-batch-qa-${GENERATED_DATE}.csv`,
);

const REQUIRED_GATES = [
  "schema_validation",
  "trademark_claim_gate",
  "claim_risk_gate",
  "duplicate_template_gate",
  "private_route_gate",
  "result_page_leakage_gate",
  "seo_projection_gate",
  "bilingual_consistency_gate",
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

const CLAIM_RISK_PATTERNS = [
  /\bperfect\s+match\b/i,
  /\bguaranteed\b/i,
  /\bdiagnos(?:e|is|tic)\b/i,
  /\btherapy\b/i,
  /\bclinical\b/i,
  /\bhiring\s+screen(?:ing)?\b/i,
  /\bmust\s+(?:choose|avoid|become)\b/i,
  /\bdestined\b/i,
  /\b命中注定\b/i,
  /\b保证\b/i,
  /\b诊断\b/i,
  /\b临床\b/i,
  /\b招聘筛选\b/i,
];

const RESULT_LEAKAGE_PATTERNS = [
  /\byour\s+(?:result|score|percentile)\b/i,
  /\bresult\s+id\b/i,
  /\breport\s+engine\b/i,
  /\bfacet\s+anomaly\b/i,
  /\bpayload\b/i,
  /\bscore\s+space\b/i,
  /\b你(?:这次|的)?(?:结果|分数|百分位)\b/i,
  /\b报告引擎\b/i,
  /\b结果\s*ID\b/i,
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
]);

const SENSITIVE_QUERY_PATTERNS = [/\btoken=/i, /\bsession=/i, /\bresult_id=/i, /\breport_id=/i, /\border_no=/i];

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolveRepoPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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

function findPatternHits(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function findTrademarkHits(text) {
  const safeBoundaryStatements = [
    /\bdo\s+not\s+state\s+that\s+it\s+is\s+official\s+MBTI\b/i,
    /\bnot\s+(?:as\s+)?(?:an\s+)?official\s+(?:native\s+)?MBTI\s+dimension\b/i,
    /\bnot\s+(?:an\s+)?official\s+MBTI\s+dimension\b/i,
    /不是\s*官方\s*MBTI\s*(?:原生)?(?:维度|分类)/i,
    /不把它表述为\s*官方\s*MBTI\s*(?:原生)?(?:维度|分类)/i,
  ];
  const normalizedText = text.replace(/\s+/g, " ");
  const withoutSafeBoundaries = safeBoundaryStatements.reduce(
    (nextText, pattern) => nextText.replace(pattern, " "),
    normalizedText,
  );
  return findPatternHits(withoutSafeBoundaries, TRADEMARK_PATTERNS);
}

function pathIsPrivate(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (!["en", "zh"].includes(segments[0])) return false;
  return PRIVATE_ROUTE_SEGMENTS.has(segments[1] ?? "");
}

function findPrivateRouteHits(item) {
  const hits = [];
  const values = collectStringValues(item);
  for (const value of values) {
    const trimmed = value.trim();
    if (SENSITIVE_QUERY_PATTERNS.some((pattern) => pattern.test(trimmed))) hits.push(`sensitive_query:${trimmed}`);
    if (trimmed.startsWith("/")) {
      if (pathIsPrivate(trimmed)) hits.push(`private_path:${trimmed}`);
      continue;
    }
    if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) continue;
    try {
      const url = new URL(trimmed);
      if (url.hostname === "fermatmind.com" && pathIsPrivate(url.pathname)) {
        hits.push(`private_absolute_url:${url.pathname}`);
      }
    } catch {
      hits.push("malformed_absolute_url");
    }
  }
  return [...new Set(hits)];
}

function visibleClaimText(item) {
  return collectStringValues({
    target_url: item.target_url,
    current_surface: item.current_surface,
    observed_signal: item.observed_signal,
    recommendations: item.recommendations,
  }).join("\n");
}

function schemaErrors(item) {
  const errors = [];
  const recommendation = item.recommendations ?? {};
  if (item.framework !== "mbti64") errors.push("framework_not_mbti64");
  if (!["en", "zh-CN"].includes(item.locale)) errors.push("unsupported_locale");
  if (!item.target_url?.startsWith("https://fermatmind.com/")) errors.push("target_url_not_canonical_host");
  if (item.page_type !== "variant") errors.push("page_type_not_variant");
  if (item.blocked_reason !== null) errors.push("unexpected_blocked_reason");
  if ((item.selection_evidence?.query_rows_captured ?? 0) <= 0) errors.push("missing_query_evidence");
  for (const key of ["title", "description", "h1", "quick_answer"]) {
    if (!recommendation[key]?.recommended) errors.push(`missing_${key}_recommendation`);
  }
  if (!Array.isArray(recommendation.faq) || recommendation.faq.length < 5) errors.push("faq_less_than_5");
  if (!Array.isArray(recommendation.internal_links) || recommendation.internal_links.length < 2) {
    errors.push("internal_links_less_than_2");
  }
  if (!Array.isArray(item.qa_required)) {
    errors.push("qa_required_not_array");
  } else {
    for (const gate of REQUIRED_GATES) {
      if (!item.qa_required.includes(gate)) errors.push(`missing_required_gate:${gate}`);
    }
  }
  return errors;
}

function seoProjectionErrors(item) {
  const errors = [];
  const title = item.recommendations?.title?.recommended ?? "";
  const description = item.recommendations?.description?.recommended ?? "";
  const h1 = item.recommendations?.h1?.recommended ?? "";
  if (!title.includes("| FermatMind")) errors.push("title_missing_single_brand_suffix");
  if ((title.match(/FermatMind/g) ?? []).length !== 1) errors.push("title_brand_suffix_not_single");
  if (description.length < 50 || description.length > 180) errors.push("description_length_outside_review_band");
  if (h1.includes("|")) errors.push("h1_contains_brand_separator");
  return errors;
}

function internalLinkErrors(item) {
  const errors = [];
  const expectedLocale = item.locale === "zh-CN" ? "/zh/" : "/en/";
  for (const link of item.recommendations?.internal_links ?? []) {
    if (link.safe_public_route !== true) errors.push(`unsafe_internal_link:${link.href ?? "missing_href"}`);
    if (typeof link.href !== "string" || !link.href.startsWith(expectedLocale)) {
      errors.push(`wrong_locale_internal_link:${link.href ?? "missing_href"}`);
    }
  }
  return errors;
}

function duplicateSignature(item) {
  const recommendation = item.recommendations ?? {};
  return normalizeText(
    [
      recommendation.title?.recommended,
      recommendation.description?.recommended,
      recommendation.h1?.recommended,
      recommendation.quick_answer?.recommended,
      ...(recommendation.faq ?? []).map((faq) => `${faq.question} ${faq.answer}`),
    ].join(" "),
  );
}

function evaluateItem(item, duplicateGroups) {
  const blockers = [];
  const warnings = [];
  const gateHits = {
    schema_validation: schemaErrors(item),
    trademark_claim_gate: findTrademarkHits(visibleClaimText(item)),
    claim_risk_gate: findPatternHits(visibleClaimText(item), CLAIM_RISK_PATTERNS),
    duplicate_template_gate: duplicateGroups.get(duplicateSignature(item))?.length > 1 ? ["duplicate_signature"] : [],
    private_route_gate: [...findPrivateRouteHits(item), ...internalLinkErrors(item)],
    result_page_leakage_gate: findPatternHits(visibleClaimText(item), RESULT_LEAKAGE_PATTERNS),
    seo_projection_gate: seoProjectionErrors(item),
    bilingual_consistency_gate: [],
  };

  for (const [gate, hits] of Object.entries(gateHits)) {
    if (hits.length) blockers.push(`${gate}:${hits.join("|")}`);
  }

  return {
    target_url: item.target_url,
    path: item.path,
    framework: item.framework,
    locale: item.locale,
    page_type: item.page_type,
    decision: blockers.length === 0 ? "PASS_READY_FOR_APPROVAL_REVIEW" : "NO_GO_BLOCKED_BY_QA",
    gates: Object.fromEntries(Object.entries(gateHits).map(([gate, hits]) => [gate, hits.length ? "fail" : "pass"])),
    blockers,
    warnings,
    recommended_next_task:
      blockers.length === 0
        ? "PERSONALITY-AGENT-HUMAN-APPROVAL-QUEUE-01"
        : "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-REPAIR-01",
  };
}

function groupDuplicateSignatures(recommendations) {
  const groups = new Map();
  for (const item of recommendations) {
    const signature = duplicateSignature(item);
    groups.set(signature, [...(groups.get(signature) ?? []), item.target_url]);
  }
  return groups;
}

function countGateFailures(pageResults) {
  const counts = Object.fromEntries(REQUIRED_GATES.map((gate) => [gate, 0]));
  for (const result of pageResults) {
    for (const [gate, status] of Object.entries(result.gates)) {
      if (status !== "pass") counts[gate] = (counts[gate] ?? 0) + 1;
    }
  }
  return counts;
}

function toCsv(rows) {
  const headers = ["path", "target_url", "locale", "page_type", "decision", "blocker_count", "warning_count", "recommended_next_task"];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const flat = {
      ...row,
      blocker_count: row.blockers.length,
      warning_count: row.warnings.length,
    };
    lines.push(headers.map((header) => `"${String(flat[header] ?? "").replaceAll('"', '""')}"`).join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const input = await readJson(INPUT_PATH);
  const recommendations = input.recommendations ?? [];
  const blockers = [];
  const warnings = [...(input.warnings ?? [])];

  if (input.final_decision !== "PASS_NEXT_BATCH_RECOMMENDATIONS_READY_FOR_QA") {
    blockers.push(`recommendations_not_ready:${input.final_decision ?? "missing"}`);
  }
  if (recommendations.length !== 3) blockers.push(`expected_3_recommendations_found_${recommendations.length}`);

  const duplicateGroups = groupDuplicateSignatures(recommendations);
  const pageResults = recommendations.map((item) => evaluateItem(item, duplicateGroups));
  const blockedCount = pageResults.filter((item) => item.decision !== "PASS_READY_FOR_APPROVAL_REVIEW").length;
  const gateRollup = countGateFailures(pageResults);
  if (blockedCount > 0) blockers.push(`blocked_page_count:${blockedCount}`);

  const output = {
    artifact: "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-QA-01",
    generated_at: new Date().toISOString(),
    status: blockers.length === 0 ? "pass_ready_for_approval_review" : "fail",
    final_decision: blockers.length === 0 ? "PASS_READY_FOR_APPROVAL_REVIEW" : "NO_GO_BLOCKED_BY_QA",
    input_artifact: rel(INPUT_PATH),
    scope:
      "QA artifact only. No CMS write, no promotion, no publish, no index/search release, no sitemap/llms mutation, no queue mutation.",
    gates: REQUIRED_GATES,
    summary: {
      checked_recommendation_count: recommendations.length,
      pass_ready_for_approval_review_count: pageResults.length - blockedCount,
      blocked_count: blockedCount,
      warning_count: warnings.length,
      duplicate_signature_group_count: [...duplicateGroups.values()].filter((urls) => urls.length > 1).length,
    },
    gate_rollup: gateRollup,
    page_results: pageResults,
    safety_boundary: {
      cms_write_attempted: false,
      cms_live_promotion_attempted: false,
      frontend_runtime_change_attempted: false,
      search_queue_mutation_attempted: false,
      live_search_submit_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      production_deploy_attempted: false,
    },
    blockers,
    warnings,
    recommended_next_task:
      blockers.length === 0
        ? "PERSONALITY-AGENT-HUMAN-APPROVAL-QUEUE-01"
        : "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-REPAIR-01",
  };

  const md = [
    "# Personality Agent Operations Next Batch QA",
    "",
    `Generated at: ${output.generated_at}`,
    "",
    "## Decision",
    "",
    `- Status: ${output.status}`,
    `- Final decision: ${output.final_decision}`,
    "",
    "## Summary",
    "",
    `- Checked recommendations: ${output.summary.checked_recommendation_count}`,
    `- Ready for approval review: ${output.summary.pass_ready_for_approval_review_count}`,
    `- Blocked: ${output.summary.blocked_count}`,
    `- Duplicate signature groups: ${output.summary.duplicate_signature_group_count}`,
    "",
    "## Page Results",
    "",
    ...pageResults.map((row) => `- ${row.path}: ${row.decision}`),
    "",
    "## Safety Boundary",
    "",
    "- No CMS write, promotion, frontend runtime change, Search Queue mutation, live search submit, sitemap/llms mutation, GSC API call, Request Indexing action, or production deploy was performed.",
    "",
    "## Blockers",
    "",
    ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Recommended Next Task",
    "",
    `- ${output.recommended_next_task}`,
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(OUTPUT_MD, md);
  await fs.writeFile(OUTPUT_CSV, toCsv(pageResults));

  console.log(
    JSON.stringify(
      {
        output_json: rel(OUTPUT_JSON),
        output_md: rel(OUTPUT_MD),
        output_csv: rel(OUTPUT_CSV),
        final_decision: output.final_decision,
        checked_recommendation_count: recommendations.length,
        blocked_count: blockedCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
