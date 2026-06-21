import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATE = "2026-06-21";
const GENERATED_AT = process.env.GENERATED_AT || new Date().toISOString();
const INPUT_PATH = "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json";
const OUTPUT_JSON_PATH = `docs/seo/personality/mbti64-agent-expansion-88-qa-${DATE}.json`;
const OUTPUT_MD_PATH = `docs/seo/personality/mbti64-agent-expansion-88-qa-${DATE}.md`;

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

const PILOT_URLS = new Set([
  "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
  "https://fermatmind.com/zh/personality/istj-a",
  "https://fermatmind.com/en/personality/intp-a-vs-intp-t",
  "https://fermatmind.com/zh/personality/infp-t",
  "https://fermatmind.com/en/personality/intj-a",
  "https://fermatmind.com/en/personality/intj-t",
  "https://fermatmind.com/zh/personality/intj-a",
  "https://fermatmind.com/zh/personality/intj-t",
]);

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
  /\b必须\b/i,
];

const PRIVATE_ROUTE_PATTERNS = [
  /href=["']\/(?:en|zh)\/results?\b/i,
  /href=["']\/(?:en|zh)\/orders?\b/i,
  /href=["']\/(?:en|zh)\/pay(?:ment)?\b/i,
  /href=["']\/(?:en|zh)\/history\b/i,
  /href=["']\/(?:en|zh)\/private\b/i,
  /href=["']\/(?:en|zh)\/account\b/i,
  /\btoken=/i,
  /\bsession=/i,
  /\bresult_id=/i,
  /\breport_id=/i,
  /\border_no=/i,
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

const RESULT_LEAKAGE_PATTERNS = [
  /\byour\s+(?:result|score|percentile)\b/i,
  /\bthis\s+result\b/i,
  /\bresult\s+id\b/i,
  /\breport\s+engine\b/i,
  /\bfacet\s+anomaly\b/i,
  /\bpayload\b/i,
  /\bscore\s+space\b/i,
  /\b你(?:这次|的)?(?:结果|分数|百分位)\b/i,
  /\b当前画像\b/i,
  /\b报告引擎\b/i,
  /\b结果\s*ID\b/i,
];

const GRAMMAR_PATTERNS = [
  /\ban\s+Turbulent\b/i,
  /\ba\s+Assertive\b/i,
];

const MBTI_CODE_PATTERN = /\b(?:INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)(?:-[AT])?\b/gi;
const ZH_MBTI_CODE_PATTERN = /(?:INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)(?:-[AT])?/gi;
const STYLE_PATTERN = /\b(?:Assertive|Turbulent)\b/gi;
const ZH_STYLE_PATTERN = /(?:A 型|T 型|A型|T型)/gi;

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  fs.writeFileSync(path.join(ROOT, file), value);
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromUrl(url) {
  return new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
}

function pageTypeFromUrl(url) {
  return slugFromUrl(url).includes("-a-vs-") ? "comparison" : "variant";
}

function findPatternHits(text, patterns) {
  return patterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source);
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

function isPrivateLocalizedPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (!["en", "zh"].includes(segments[0])) return false;
  return PRIVATE_ROUTE_SEGMENTS.has(segments[1] ?? "");
}

function findPrivateRouteHits(item, serialized) {
  const hits = findPatternHits(serialized, PRIVATE_ROUTE_PATTERNS);
  for (const value of collectStringValues(item)) {
    const trimmed = value.trim();
    if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) continue;
    try {
      const url = new URL(trimmed);
      if (url.hostname === "fermatmind.com" && isPrivateLocalizedPath(url.pathname)) {
        hits.push(`private_absolute_url:${url.pathname}`);
      }
    } catch {
      hits.push("malformed_absolute_url");
    }
  }
  return [...new Set(hits)];
}

function findTrademarkHits(text) {
  const safeBoundaryStatements = [
    /\bnot\s+(?:as\s+)?(?:an\s+)?official\s+(?:native\s+)?MBTI\s+dimension\b/i,
    /\bnot\s+(?:an\s+)?official\s+MBTI\s+dimension\b/i,
    /不是\s*官方\s*MBTI\s*(?:原生)?(?:维度|分类)/i,
    /不把它表述为\s*官方\s*MBTI\s*(?:原生)?(?:维度|分类)/i,
  ];
  const normalizedText = text.replace(/\s+/g, " ");
  if (safeBoundaryStatements.some((pattern) => pattern.test(normalizedText))) {
    const withoutSafeBoundaries = safeBoundaryStatements.reduce(
      (nextText, pattern) => nextText.replace(pattern, " "),
      normalizedText,
    );
    return findPatternHits(withoutSafeBoundaries, TRADEMARK_PATTERNS);
  }
  return findPatternHits(normalizedText, TRADEMARK_PATTERNS);
}

function requiredShapeErrors(item) {
  const errors = [];
  const recommendation = item.recommendations ?? {};
  if (item.framework !== "mbti64") errors.push("framework_not_mbti64");
  if (!["en", "zh-CN"].includes(item.locale)) errors.push("unsupported_locale");
  if (item.status !== "draft_recommendation") errors.push("status_not_draft_recommendation");
  if (item.blocked_reason !== null) errors.push("unexpected_blocked_reason");
  if (!item.target_url?.startsWith("https://fermatmind.com/")) errors.push("target_url_not_canonical_host");
  if (PILOT_URLS.has(item.target_url)) errors.push("pilot_url_not_excluded");
  for (const key of ["title", "description", "h1", "quick_answer"]) {
    if (!recommendation[key]?.recommended) errors.push(`missing_${key}_recommendation`);
  }
  if (!Array.isArray(recommendation.faq) || recommendation.faq.length < 5) errors.push("faq_less_than_5");
  if (!Array.isArray(recommendation.internal_links) || recommendation.internal_links.length < 2) {
    errors.push("internal_links_less_than_2");
  }
  if (!Array.isArray(recommendation.differentiation_notes) || recommendation.differentiation_notes.length < 2) {
    errors.push("differentiation_notes_less_than_2");
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

function checkInternalLinks(item) {
  const links = item.recommendations?.internal_links ?? [];
  const errors = [];
  for (const link of links) {
    if (link.safe_public_route !== true) errors.push(`unsafe_internal_link:${link.href ?? "missing_href"}`);
    if (typeof link.href !== "string" || !link.href.startsWith(`/${item.locale === "zh-CN" ? "zh" : "en"}/`)) {
      errors.push(`wrong_locale_internal_link:${link.href ?? "missing_href"}`);
    }
  }
  return errors;
}

function visibleClaimText(item) {
  const recommendation = item.recommendations ?? {};
  const faqAnswerText = (recommendation.faq ?? [])
    .map((faq) => faq.answer ?? "")
    .join(" ");
  const internalLinkText = (recommendation.internal_links ?? [])
    .map((link) => `${link.href ?? ""} ${link.anchor_text ?? ""}`)
    .join(" ");

  return [
    recommendation.title?.recommended,
    recommendation.description?.recommended,
    recommendation.h1?.recommended,
    recommendation.quick_answer?.recommended,
    faqAnswerText,
    internalLinkText,
  ].join(" ");
}

function visibleEditorialText(item) {
  const recommendation = item.recommendations ?? {};
  const faqAnswerText = (recommendation.faq ?? [])
    .map((faq) => faq.answer ?? "")
    .join(" ");

  return [
    recommendation.quick_answer?.recommended,
    faqAnswerText,
  ].join(" ");
}

function buildDuplicateSignatures(recommendations) {
  const signatures = new Map();
  for (const item of recommendations) {
    const recommendation = item.recommendations ?? {};
    const signature = [
      normalizeText(recommendation.title?.recommended),
      normalizeText(recommendation.description?.recommended),
      normalizeText(recommendation.h1?.recommended),
      normalizeText(recommendation.quick_answer?.recommended),
      normalizeText((recommendation.faq ?? []).map((faq) => faq.question).join("|")),
    ].join(" :: ");
    const urls = signatures.get(signature) ?? [];
    urls.push(item.target_url);
    signatures.set(signature, urls);
  }
  return [...signatures.entries()]
    .filter(([, urls]) => urls.length > 1)
    .map(([signature, urls]) => ({ signature, urls }));
}

function buildNormalizedEditorialDuplicateSignatures(recommendations) {
  const signatures = new Map();
  for (const item of recommendations) {
    const signature = normalizeText(visibleEditorialText(item))
      .replace(MBTI_CODE_PATTERN, "TYPE")
      .replace(ZH_MBTI_CODE_PATTERN, "TYPE")
      .replace(STYLE_PATTERN, "STYLE")
      .replace(ZH_STYLE_PATTERN, "STYLE");
    const urls = signatures.get(signature) ?? [];
    urls.push(item.target_url);
    signatures.set(signature, urls);
  }
  return [...signatures.entries()]
    .filter(([, urls]) => urls.length > 1)
    .map(([signature, urls]) => ({ signature, urls }));
}

function buildBilingualConsistency(recommendations) {
  const byType = new Map();
  for (const item of recommendations) {
    const slug = slugFromUrl(item.target_url);
    const normalizedType = slug.replace(/-a-vs-.*/, "").replace(/-[at]$/, "");
    const entry = byType.get(normalizedType) ?? { en: 0, "zh-CN": 0 };
    entry[item.locale] += 1;
    byType.set(normalizedType, entry);
  }

  const asymmetricTypes = [...byType.entries()]
    .filter(([, counts]) => Math.abs(counts.en - counts["zh-CN"]) > 1)
    .map(([type, counts]) => ({ type, counts }));

  return {
    checked_type_count: byType.size,
    asymmetric_type_count: asymmetricTypes.length,
    asymmetric_types: asymmetricTypes,
  };
}

const input = readJson(INPUT_PATH);
const recommendations = input.recommendations ?? [];
const duplicateGroups = buildDuplicateSignatures(recommendations);
const normalizedEditorialDuplicateGroups = buildNormalizedEditorialDuplicateSignatures(recommendations);
const bilingualConsistency = buildBilingualConsistency(recommendations);

const pageResults = recommendations.map((item) => {
  const serialized = JSON.stringify(item);
  const visibleClaims = visibleClaimText(item);
  const schemaErrors = requiredShapeErrors(item);
  const internalLinkErrors = checkInternalLinks(item);
  const trademarkHits = findTrademarkHits(visibleClaims);
  const claimRiskHits = findPatternHits(visibleClaims, CLAIM_RISK_PATTERNS);
  const privateRouteHits = findPrivateRouteHits(item, serialized);
  const resultLeakageHits = findPatternHits(visibleClaims, RESULT_LEAKAGE_PATTERNS);
  const grammarHits = findPatternHits(visibleClaims, GRAMMAR_PATTERNS);
  const seoProjectionErrors = [];
  const title = item.recommendations?.title?.recommended ?? "";
  const description = item.recommendations?.description?.recommended ?? "";
  const titleMin = item.locale === "zh-CN" ? 10 : 24;
  const titleMax = item.locale === "zh-CN" ? 42 : 72;
  const descriptionMin = item.locale === "zh-CN" ? 38 : 80;
  const descriptionMax = item.locale === "zh-CN" ? 110 : 180;
  if (title.length < titleMin || title.length > titleMax) seoProjectionErrors.push("title_length_outside_ctr_working_range");
  if (description.length < descriptionMin || description.length > descriptionMax) {
    seoProjectionErrors.push("description_length_outside_ctr_working_range");
  }
  if (title.includes("| FermatMind | FermatMind")) seoProjectionErrors.push("duplicated_brand_suffix");

  const blockers = [
    ...schemaErrors,
    ...internalLinkErrors,
    ...trademarkHits.map((hit) => `trademark_hit:${hit}`),
    ...claimRiskHits.map((hit) => `claim_risk_hit:${hit}`),
    ...privateRouteHits.map((hit) => `private_route_hit:${hit}`),
    ...resultLeakageHits.map((hit) => `result_leakage_hit:${hit}`),
    ...grammarHits.map((hit) => `grammar_hit:${hit}`),
    ...seoProjectionErrors,
  ];

  const warnings = [];
  if (item.observed_signal?.evidence_state === "gsc_pending") warnings.push("GSC_EVIDENCE_PENDING");

  return {
    target_url: item.target_url,
    locale: item.locale,
    page_type: pageTypeFromUrl(item.target_url),
    gates: {
      schema_validation: schemaErrors.length === 0 ? "pass" : "fail",
      trademark_claim_gate: trademarkHits.length === 0 ? "pass" : "fail",
      claim_risk_gate: claimRiskHits.length === 0 ? "pass" : "fail",
      duplicate_template_gate: "pass",
      private_route_gate: privateRouteHits.length === 0 ? "pass" : "fail",
      result_page_leakage_gate: resultLeakageHits.length === 0 ? "pass" : "fail",
      seo_projection_gate: seoProjectionErrors.length === 0 ? "pass" : "fail",
      bilingual_consistency_gate: "pass",
    },
    blockers,
    warnings,
    decision: blockers.length === 0 ? "PASS_READY_FOR_CMS_DRAFT" : "NO_GO_BLOCKED_BY_QA",
  };
});

const duplicateBlockedUrls = new Set(duplicateGroups.flatMap((group) => group.urls));
const normalizedDuplicateBlockedUrls = new Set(normalizedEditorialDuplicateGroups.flatMap((group) => group.urls));
for (const result of pageResults) {
  if (duplicateBlockedUrls.has(result.target_url) || normalizedDuplicateBlockedUrls.has(result.target_url)) {
    result.gates.duplicate_template_gate = "fail";
    result.blockers.push(
      normalizedDuplicateBlockedUrls.has(result.target_url)
        ? "normalized_editorial_duplicate_template_signature"
        : "duplicate_template_signature",
    );
    result.decision = "NO_GO_BLOCKED_BY_QA";
  }
}

const blockers = pageResults.flatMap((result) => result.blockers.map((blocker) => `${result.target_url}: ${blocker}`));
const warnings = [
  ...new Set(pageResults.flatMap((result) => result.warnings)),
  ...(bilingualConsistency.asymmetric_type_count > 0 ? ["BILINGUAL_TYPE_DISTRIBUTION_REVIEW"] : []),
];
const passCount = pageResults.filter((result) => result.decision === "PASS_READY_FOR_CMS_DRAFT").length;
const blockedCount = pageResults.length - passCount;
const finalDecision =
  blockedCount === 0
    ? "PASS_READY_FOR_CMS_DRAFT"
    : passCount > 0
      ? "CONDITIONAL_REQUIRES_EDITORIAL_REPAIR"
      : "NO_GO_BLOCKED_BY_QA";

const report = {
  artifact: "MBTI64-PUBLIC-PROFILE-AGENT-EXPANSION-88-QA-01",
  generated_at: GENERATED_AT,
  status: finalDecision.toLowerCase(),
  input_artifact: INPUT_PATH,
  scope:
    "Artifact-only QA gate over 88 MBTI64 public profile draft recommendations. No CMS write, no publish, no index/search release, no sitemap/llms mutation.",
  gates: REQUIRED_GATES,
  summary: {
    checked_recommendation_count: pageResults.length,
    pass_ready_for_cms_draft_count: passCount,
    blocked_count: blockedCount,
    warning_count: warnings.length,
    duplicate_signature_group_count: duplicateGroups.length,
    normalized_editorial_duplicate_signature_group_count: normalizedEditorialDuplicateGroups.length,
    bilingual_asymmetric_type_count: bilingualConsistency.asymmetric_type_count,
    gsc_evidence_state: "GSC_EVIDENCE_PENDING",
  },
  gate_rollup: {
    schema_validation_failures: pageResults.filter((result) => result.gates.schema_validation === "fail").length,
    trademark_claim_failures: pageResults.filter((result) => result.gates.trademark_claim_gate === "fail").length,
    claim_risk_failures: pageResults.filter((result) => result.gates.claim_risk_gate === "fail").length,
    duplicate_template_failures: new Set([...duplicateBlockedUrls, ...normalizedDuplicateBlockedUrls]).size,
    private_route_failures: pageResults.filter((result) => result.gates.private_route_gate === "fail").length,
    result_page_leakage_failures: pageResults.filter((result) => result.gates.result_page_leakage_gate === "fail").length,
    seo_projection_failures: pageResults.filter((result) => result.gates.seo_projection_gate === "fail").length,
    bilingual_consistency_failures: bilingualConsistency.asymmetric_type_count,
    grammar_editorial_failures: pageResults.filter((result) =>
      result.blockers.some((blocker) => blocker.startsWith("grammar_hit:")),
    ).length,
  },
  duplicate_template_gate: {
    duplicate_signature_group_count: duplicateGroups.length,
    duplicate_groups: duplicateGroups,
    normalized_editorial_duplicate_signature_group_count: normalizedEditorialDuplicateGroups.length,
    normalized_editorial_duplicate_groups: normalizedEditorialDuplicateGroups,
  },
  bilingual_consistency_gate: bilingualConsistency,
  page_results: pageResults,
  blockers,
  warnings,
  final_decision: finalDecision,
  recommended_next_task:
    finalDecision === "PASS_READY_FOR_CMS_DRAFT"
      ? "MBTI64-CMS-PROJECTION-DRAFT-88-01"
      : "MBTI64-PUBLIC-PROFILE-AGENT-EXPANSION-88-EDITORIAL-REPAIR-01",
};

writeJson(OUTPUT_JSON_PATH, report);

const md = `# MBTI64 Agent Expansion 88 QA

## Decision

${finalDecision}

## Scope

This is an artifact-only QA gate over the 88 MBTI64 public profile draft recommendations. It does not write CMS revisions, publish content, change sitemap/llms, enqueue Search Queue items, or submit search channels.

## Inputs

- ${INPUT_PATH}

## Summary

| Metric | Value |
| --- | ---: |
| Checked recommendations | ${report.summary.checked_recommendation_count} |
| Ready for CMS draft | ${report.summary.pass_ready_for_cms_draft_count} |
| Blocked by QA | ${report.summary.blocked_count} |
| Duplicate signature groups | ${report.summary.duplicate_signature_group_count} |
| Normalized editorial duplicate groups | ${report.summary.normalized_editorial_duplicate_signature_group_count} |
| Private route failures | ${report.gate_rollup.private_route_failures} |
| Result leakage failures | ${report.gate_rollup.result_page_leakage_failures} |
| Trademark/official-claim failures | ${report.gate_rollup.trademark_claim_failures} |
| Claim risk failures | ${report.gate_rollup.claim_risk_failures} |
| SEO projection failures | ${report.gate_rollup.seo_projection_failures} |
| Grammar/editorial failures | ${report.gate_rollup.grammar_editorial_failures} |

## Gate Results

- Schema validation: ${report.gate_rollup.schema_validation_failures === 0 ? "PASS" : "FAIL"}
- Trademark / official MBTI affiliation: ${report.gate_rollup.trademark_claim_failures === 0 ? "PASS" : "FAIL"}
- Claim risk: ${report.gate_rollup.claim_risk_failures === 0 ? "PASS" : "FAIL"}
- Duplicate/template risk: ${report.gate_rollup.duplicate_template_failures === 0 ? "PASS" : "FAIL"}
- Private route: ${report.gate_rollup.private_route_failures === 0 ? "PASS" : "FAIL"}
- Result-page leakage: ${report.gate_rollup.result_page_leakage_failures === 0 ? "PASS" : "FAIL"}
- SEO projection: ${report.gate_rollup.seo_projection_failures === 0 ? "PASS" : "FAIL"}
- Bilingual consistency: ${report.gate_rollup.bilingual_consistency_failures === 0 ? "PASS" : "REVIEW"}

## Warnings

${warnings.length === 0 ? "- None." : warnings.map((warning) => `- ${warning}`).join("\n")}

## Blockers

${blockers.length === 0 ? "- None." : blockers.slice(0, 40).map((blocker) => `- ${blocker}`).join("\n")}

## Next Task

${report.recommended_next_task}
`;

writeText(OUTPUT_MD_PATH, md);

console.log(`Wrote ${OUTPUT_JSON_PATH}`);
console.log(`Wrote ${OUTPUT_MD_PATH}`);
console.log(finalDecision);
