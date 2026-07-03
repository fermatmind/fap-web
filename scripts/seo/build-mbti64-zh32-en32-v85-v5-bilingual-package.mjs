#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  findExactParagraphDuplicates,
  repairZhDuplicateParagraphsInPage,
} from "./repair-mbti64-zh32-v85-duplicate-paragraphs.mjs";

const ROOT = process.cwd();
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-07-01";
const GENERATED_AT = process.env.GENERATED_AT ?? "2026-07-01T12:00:00.000Z";

const ZH_DIR = resolveOptionalPath(getArgValue("--zh-dir") ?? process.env.MBTI64_ZH_DIR);
const EN_DIR = resolveOptionalPath(getArgValue("--en-dir") ?? process.env.MBTI64_EN_DIR);

const OUTPUT_PACKAGE = resolvePath(
  getArgValue("--output-package") ??
    `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-${GENERATED_DATE}.json`,
);
const OUTPUT_PACKAGE_MD = resolvePath(
  getArgValue("--output-package-md") ??
    `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-${GENERATED_DATE}.md`,
);
const OUTPUT_QA = resolvePath(
  getArgValue("--output-qa") ??
    `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-${GENERATED_DATE}.json`,
);
const OUTPUT_QA_MD = resolvePath(
  getArgValue("--output-qa-md") ??
    `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-${GENERATED_DATE}.md`,
);
const DEFAULT_PACKAGE_ARTIFACT = resolvePath(
  `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-${GENERATED_DATE}.json`,
);
const DEFAULT_PACKAGE_MD_ARTIFACT = resolvePath(
  `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-${GENERATED_DATE}.md`,
);
const DEFAULT_QA_ARTIFACT = resolvePath(
  `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-${GENERATED_DATE}.json`,
);
const DEFAULT_QA_MD_ARTIFACT = resolvePath(
  `docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-${GENERATED_DATE}.md`,
);

const TYPES = [
  "intj",
  "intp",
  "entj",
  "entp",
  "infj",
  "infp",
  "enfj",
  "enfp",
  "istj",
  "isfj",
  "estj",
  "esfj",
  "istp",
  "isfp",
  "estp",
  "esfp",
];
const VARIANTS = ["a", "t"];
const EXPECTED_PATHS = new Set(
  ["zh", "en"].flatMap((locale) =>
    TYPES.flatMap((type) => VARIANTS.map((variant) => `/${locale}/personality/${type}-${variant}`)),
  ),
);
const REQUIRED_READER_KEYS = [
  "thirty_second_overview",
  "ai_search_answer",
  "strengths",
  "watch_outs",
  "work_decision_card",
  "relationship_communication_card",
  "pressure_growth_card",
];
const REQUIRED_AI_ANSWER_KEYS = ["what_is", "at_difference", "work_pattern", "relationship_pattern", "not_for"];
const TRADEMARK_RISK = [
  /\bofficial\s+MBTI\b/i,
  /\bofficial\s+Myers[-\s]?Briggs\b/i,
  /\bMyers[-\s]?Briggs\s+(?:affiliated|certified|approved|endorsed)\b/i,
  /\bMBTI\s+(?:certified|approved|endorsed|officially)\b/i,
  /官方\s*(?:MBTI|迈尔斯|Myers[-\s]?Briggs|16\s*型|32\s*型)/i,
];
const DETERMINISTIC_RISK = [
  /\bguaranteed\b/i,
  /\bdestined\b/i,
  /\bmust\s+(?:choose|avoid|become|date|hire)\b/i,
  /\bbest\s+career\s+for\b/i,
  /\bpredicts?\s+(?:your\s+)?(?:career|relationship|intelligence|success)\b/i,
  /\bIQ\s+(?:level|score|ranking|rank)\b/i,
  /\b命中注定\b/i,
  /\b保证\b/i,
  /\b必须(?:选择|避免|成为|雇佣)\b/i,
  /\b最适合的(?:职业|伴侣|关系)\b/i,
  /\b决定(?:职业|关系|命运|智商)\b/i,
];
const CLINICAL_RECRUITING_RISK = [
  /\bclinical\s+(?:diagnosis|diagnostic|screening)\b/i,
  /\bdiagnos(?:e|is|tic)\s+(?:tool|signal|measure)\b/i,
  /\bmental\s+health\s+(?:diagnosis|screening)\b/i,
  /\bhiring\s+(?:screen|screening|filter|decision)\b/i,
  /\brecruit(?:ing|ment)\s+(?:screen|filter|decision)\b/i,
  /\b诊断(?:工具|依据|信号)\b/i,
  /\b临床(?:诊断|筛查)\b/i,
  /\b招聘(?:筛选|决策|过滤)\b/i,
];
const PRIVATE_SEGMENTS = new Set([
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
  "token",
]);

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function resolvePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function resolveOptionalPath(filePath) {
  return filePath ? resolvePath(filePath) : null;
}

function relativeToRoot(filePath) {
  return path.relative(ROOT, filePath);
}

function redactedInputPath(filePath) {
  const basename = path.basename(filePath);
  if (filePath.startsWith(ROOT)) {
    return relativeToRoot(filePath);
  }
  return `<external-mbti64-input>/${basename}`;
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

function readSource(dir, locale) {
  const complete = fs
    .readdirSync(dir)
    .find((file) => file.endsWith("_COMPLETE.json") || file.includes("_COMPLETE."));
  const qa = fs.readdirSync(dir).find((file) => file.endsWith("_QA.json"));
  if (!complete || !qa) {
    throw new Error(`Missing ${locale} COMPLETE/QA artifacts in ${dir}`);
  }
  const completePath = path.join(dir, complete);
  const qaPath = path.join(dir, qa);
  const completeText = fs.readFileSync(completePath, "utf8");
  const qaText = fs.readFileSync(qaPath, "utf8");
  return {
    locale,
    completePath,
    qaPath,
    completeSha256: sha256(completeText),
    qaSha256: sha256(qaText),
    package: JSON.parse(completeText),
    qa: JSON.parse(qaText),
  };
}

function sourceDirsAvailable() {
  return Boolean(ZH_DIR && EN_DIR && fs.existsSync(ZH_DIR) && fs.existsSync(EN_DIR));
}

function copyFileIfNeeded(from, to) {
  if (path.resolve(from) === path.resolve(to)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function pageTypeVariant(pathname) {
  const match = pathname.match(/^\/(zh|en)\/personality\/([a-z]{4})-([at])$/);
  if (!match) return null;
  return { locale: match[1], type: match[2], variant: match[3] };
}

function targetUrl(pathname) {
  return `https://fermatmind.com${pathname}`;
}

function h1For(page) {
  if (typeof page.h1 === "string" && page.h1.trim()) return page.h1.trim();
  if (page.locale === "zh") return `${page.type_code.toUpperCase()}-${page.variant.toUpperCase()} 人格特点`;
  return `${page.type_code.toUpperCase()}-${page.variant.toUpperCase()} Personality`;
}

function recommendationFromPage(page, source) {
  return {
    recommendation_id: `mbti64-zh32-en32-v8-5-v5:${page.path}:v1`,
    target_url: targetUrl(page.path),
    path: page.path,
    locale: page.locale,
    framework: "mbti64",
    page_type: "variant",
    type_code: page.type_code,
    variant: page.variant,
    variant_code: `${page.type_code}-${page.variant}`,
    h1: h1For(page),
    source_locale_package_sha256: source.completeSha256,
    source_locale_qa_sha256: source.qaSha256,
    seo: page.seo,
    geo_summary: page.geo_summary,
    reader_experience: page.reader_experience,
    modules: page.modules,
    faq: page.faq,
    internal_links: page.internal_links,
    source_ledger: page.source_ledger,
    safety_boundary: page.safety_boundary,
    core_tension: page.core_tension,
    qa_self_check: page.qa_self_check,
    forbidden_claims_absent: page.forbidden_claims_absent,
    quality_metrics: page.quality_metrics,
    source_page: {
      source_task: source.package.task,
      source_version: page.version ?? null,
      source_upgrade_task: page.upgrade_task ?? null,
      last_reviewed_at: page.last_reviewed_at ?? null,
    },
    raw_page: page,
  };
}

function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

function searchableText(row) {
  return collectStrings({
    seo: row.seo,
    geo_summary: row.geo_summary,
    reader_experience: row.reader_experience,
    modules: row.modules,
    faq: row.faq,
    internal_links: row.internal_links,
    source_ledger: row.source_ledger,
  }).join("\n");
}

function stripSafeBoundaryText(text) {
  return String(text)
    .replace(/\bnot\s+guaranteed[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bnot\s+as[^.。]*(?:diagnosis|hiring|screen|destiny)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bnot\s+used\s+as[^.。]*(?:diagnosis|hiring|screen|destiny)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bnot\s+(?:a\s+)?(?:diagnosis|hiring|screen|career|relationship|IQ|official)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bshould\s+not\s+be\s+used\s+for[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bshould\s+not\s+be\s+used\s+to[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bdo\s+not\s+use\s+it\s+for[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bdo\s+not\s+use[^.。]*(?:diagnosis|hiring|clinical|IQ|career|relationship|future)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bkept\s+out\s+of[^.。]*(?:clinical|hiring|IQ|destiny)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bmust\s+not\s+imply[^.。]*(?:endorsement|diagnosis|screening|outcomes)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bmust\s+not\s+imply[^.。]*(?:official|affiliation|diagnosis|hiring|screen|deterministic)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/\bno\s+(?:official|clinical|hiring|diagnosis|career|relationship|IQ)[^.。]*(?:[.。]|$)/gi, " ")
    .replace(/不(?:是|作为|用于|应用于)[^。]*(?:诊断|招聘|筛选|职业定论|关系定论|智商|官方)[^。]*(?:。|$)/g, " ")
    .replace(/不是[^。]*(?:诊断|招聘|筛选|职业定论|关系定论|智商|官方)[^。]*(?:。|$)/g, " ");
}

function patternHits(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function privateRouteHits(row) {
  const hits = [];
  for (const value of collectStrings({ path: row.path, internal_links: row.internal_links })) {
    const trimmed = value.trim();
    if (!trimmed.startsWith("/")) continue;
    const segments = trimmed.split(/[/?#]/)[1]?.split("/") ?? [];
    for (const segment of segments) {
      if (PRIVATE_SEGMENTS.has(segment)) hits.push(trimmed);
    }
    if (/[?&](?:token|session|result_id|report_id|order_no)=/i.test(trimmed)) hits.push(trimmed);
  }
  return [...new Set(hits)];
}

function requiredFieldGate(row) {
  const failures = [];
  if (!row.seo?.title || !row.seo?.description) failures.push("missing_seo_title_or_description");
  if (!row.h1) failures.push("missing_h1");
  if (!Array.isArray(row.seo?.primary_keywords) || row.seo.primary_keywords.length < 5) {
    failures.push("missing_primary_keywords");
  }
  if (!Array.isArray(row.seo?.search_intents) || row.seo.search_intents.length < 4) {
    failures.push("missing_search_intents");
  }
  if (!row.geo_summary?.direct_answer) failures.push("missing_geo_direct_answer");
  for (const key of REQUIRED_READER_KEYS) {
    if (!(key in (row.reader_experience ?? {}))) failures.push(`missing_reader_experience_${key}`);
  }
  const answer = row.reader_experience?.ai_search_answer ?? row.geo_summary?.ai_search_answer_block ?? {};
  for (const key of REQUIRED_AI_ANSWER_KEYS) {
    if (!answer[key]) failures.push(`missing_ai_answer_${key}`);
  }
  if (!Array.isArray(row.modules) || row.modules.length !== 10) failures.push("module_count_not_10");
  if (!Array.isArray(row.faq) || row.faq.length < 10 || row.faq.length > 12) failures.push("faq_count_not_10_to_12");
  if (!Array.isArray(row.internal_links) || row.internal_links.length < 6) failures.push("internal_links_lt_6");
  if (!Array.isArray(row.source_ledger) || row.source_ledger.length < 3) failures.push("source_ledger_lt_3");
  return failures;
}

function moduleDepthGate(row) {
  const failures = [];
  for (const section of row.modules ?? []) {
    if (!section.id || !section.title) failures.push(`module_missing_identity:${section.id ?? "unknown"}`);
    if (!Array.isArray(section.paragraphs) || section.paragraphs.length < 3) {
      failures.push(`module_too_thin:${section.id ?? section.title ?? "unknown"}`);
    }
    if (!section.insight) failures.push(`module_missing_insight:${section.id ?? section.title ?? "unknown"}`);
  }
  return failures;
}

function duplicateGate(rows) {
  const titleMap = new Map();
  const directAnswerMap = new Map();
  const failures = new Map(rows.map((row) => [row.path, []]));
  for (const row of rows) {
    addSignature(titleMap, normalize(row.seo?.title), row.path);
    addSignature(directAnswerMap, normalize(row.geo_summary?.direct_answer), row.path);
  }
  for (const [kind, map] of [
    ["duplicate_title", titleMap],
    ["duplicate_direct_answer", directAnswerMap],
  ]) {
    for (const paths of map.values()) {
      if (paths.length <= 1) continue;
      for (const pagePath of paths) failures.get(pagePath).push(`${kind}:${paths.join(",")}`);
    }
  }
  return failures;
}

function exactParagraphDuplicateGate(row) {
  return findExactParagraphDuplicates(row).map((duplicate) => {
    const first = duplicate.first;
    const next = duplicate.duplicate;
    return [
      `path:${row.path}`,
      `first:${first.module_id}[${first.paragraph_index}]`,
      `duplicate:${next.module_id}[${next.paragraph_index}]`,
      `text:${next.text_prefix}`,
    ].join("|");
  });
}

function addSignature(map, signature, pagePath) {
  if (!signature || signature.length < 16) return;
  const paths = map.get(signature) ?? [];
  paths.push(pagePath);
  map.set(signature, paths);
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function gate(status, failures = []) {
  return { status, failures };
}

function validatePackage(rows, sources) {
  const pageResults = [];
  const blockers = [];
  const duplicateFailures = duplicateGate(rows);
  const pathSet = new Set(rows.map((row) => row.path));

  if (rows.length !== 64) blockers.push(`expected_64_rows_got_${rows.length}`);
  for (const expected of EXPECTED_PATHS) {
    if (!pathSet.has(expected)) blockers.push(`missing_expected_path:${expected}`);
  }
  for (const row of rows) {
    if (!EXPECTED_PATHS.has(row.path)) blockers.push(`unexpected_path:${row.path}`);
  }

  const zhKeys = new Set(rows.filter((row) => row.locale === "zh").map((row) => `${row.type_code}-${row.variant}`));
  const enKeys = new Set(rows.filter((row) => row.locale === "en").map((row) => `${row.type_code}-${row.variant}`));
  const missingPairs = [];
  for (const key of zhKeys) if (!enKeys.has(key)) missingPairs.push(`missing_en_pair:${key}`);
  for (const key of enKeys) if (!zhKeys.has(key)) missingPairs.push(`missing_zh_pair:${key}`);

  for (const row of rows) {
    const parsed = pageTypeVariant(row.path);
    const rawText = searchableText(row);
    const claimText = stripSafeBoundaryText(rawText);
    const fieldFailures = requiredFieldGate(row);
    const moduleFailures = moduleDepthGate(row);
    const privateHits = privateRouteHits(row);
    const trademarkHits = patternHits(claimText, TRADEMARK_RISK);
    const deterministicHits = patternHits(claimText, DETERMINISTIC_RISK);
    const clinicalHits = patternHits(claimText, CLINICAL_RECRUITING_RISK);
    const duplicateHits = duplicateFailures.get(row.path) ?? [];
    const paragraphDuplicateHits = exactParagraphDuplicateGate(row);
    const bilingualFailures = missingPairs.filter((failure) => failure.endsWith(`${row.type_code}-${row.variant}`));
    const inventoryFailures = [];

    if (!parsed) inventoryFailures.push("not_mbti64_variant_path");
    if (parsed && parsed.locale !== row.locale) inventoryFailures.push("locale_path_mismatch");
    if (parsed && parsed.type !== row.type_code) inventoryFailures.push("type_path_mismatch");
    if (parsed && parsed.variant !== row.variant) inventoryFailures.push("variant_path_mismatch");
    if (row.page_type !== "variant") inventoryFailures.push("page_type_not_variant");
    if (row.path.includes("-vs-")) inventoryFailures.push("comparison_page_included");

    const gates = {
      inventory_gate: gate(inventoryFailures.length ? "fail" : "pass", inventoryFailures),
      field_completeness_gate: gate(fieldFailures.length ? "fail" : "pass", fieldFailures),
      module_depth_gate: gate(moduleFailures.length ? "fail" : "pass", moduleFailures),
      bilingual_alignment_gate: gate(bilingualFailures.length ? "fail" : "pass", bilingualFailures),
      trademark_affiliation_gate: gate(trademarkHits.length ? "fail" : "pass", trademarkHits),
      deterministic_claim_gate: gate(deterministicHits.length ? "fail" : "pass", deterministicHits),
      clinical_recruiting_gate: gate(clinicalHits.length ? "fail" : "pass", clinicalHits),
      duplicate_template_gate: gate(duplicateHits.length ? "fail" : "pass", duplicateHits),
      exact_paragraph_duplicate_gate: gate(
        paragraphDuplicateHits.length ? "fail" : "pass",
        paragraphDuplicateHits,
      ),
      private_route_gate: gate(privateHits.length ? "fail" : "pass", privateHits),
    };
    const failures = Object.entries(gates).flatMap(([name, result]) =>
      result.failures.map((failure) => `${name}:${failure}`),
    );

    pageResults.push({
      target_url: row.target_url,
      path: row.path,
      locale: row.locale,
      framework: row.framework,
      page_type: row.page_type,
      type_code: row.type_code,
      variant: row.variant,
      module_count: row.modules?.length ?? 0,
      faq_count: row.faq?.length ?? 0,
      internal_link_count: row.internal_links?.length ?? 0,
      source_ledger_count: row.source_ledger?.length ?? 0,
      gates,
      qa_decision: failures.length ? "NO_GO_QA_REPAIR_REQUIRED" : "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC",
      blocked_reason: failures.length ? failures.join("; ") : null,
    });
  }

  const gateTotals = {};
  for (const result of pageResults) {
    for (const [name, gateResult] of Object.entries(result.gates)) {
      gateTotals[name] ??= { passed: 0, failed: 0 };
      if (gateResult.status === "pass") gateTotals[name].passed += 1;
      else gateTotals[name].failed += 1;
    }
  }

  const passCount = pageResults.filter((result) => result.qa_decision === "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC").length;
  const blockedCount = pageResults.length - passCount;
  const sourceQaFailures = [];
  for (const source of sources) {
    if (source.qa.final_decision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC") {
      sourceQaFailures.push(`${source.locale}_qa_not_pass:${source.qa.final_decision}`);
    }
    if (source.qa.total_pages !== 32 || source.qa.pass_count !== 32 || source.qa.blocked_count !== 0) {
      sourceQaFailures.push(`${source.locale}_qa_counts_not_32_pass`);
    }
  }
  blockers.push(...sourceQaFailures);

  return {
    pageResults,
    gateTotals,
    blockers,
    passCount,
    blockedCount,
    finalDecision:
      blockers.length === 0 && passCount === 64 && blockedCount === 0
        ? "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC"
        : "NO_GO_QA_REPAIR_REQUIRED",
  };
}

function buildMarkdownPackage(pkg, qa) {
  return `# MBTI64 ZH32/EN32 V8.5/V5 Bilingual Package

- Artifact: \`${pkg.artifact}\`
- Generated: \`${pkg.generated_at}\`
- Final decision: \`${pkg.final_decision}\`
- Target count: ${pkg.target_count}
- zh pages: ${pkg.summary.zh_pages}
- en pages: ${pkg.summary.en_pages}
- Variant pages: ${pkg.summary.variant_pages}
- Comparison pages: ${pkg.summary.comparison_pages}
- Package SHA256: \`${pkg.package_sha256}\`

## Scope Boundary

This artifact is package/QA handoff only. It does not write CMS, approval queue, URL Truth, Search Queue, sitemap, llms, or frontend runtime.

## Next Task

\`${pkg.recommended_next_task}\`

## QA Summary

- QA decision: \`${qa.final_decision}\`
- Pass count: ${qa.summary.pass_count}
- Blocked count: ${qa.summary.blocked_count}
- Blockers: ${qa.blockers.length ? qa.blockers.join("; ") : "none"}
`;
}

function buildMarkdownQa(qa) {
  const gateLines = Object.entries(qa.gate_totals)
    .map(([name, totals]) => `| ${name} | ${totals.passed} | ${totals.failed} |`)
    .join("\n");
  return `# MBTI64 ZH32/EN32 V8.5/V5 Bilingual QA

- Artifact: \`${qa.artifact}\`
- Generated: \`${qa.generated_at}\`
- Final decision: \`${qa.final_decision}\`
- Target count: ${qa.summary.target_count}
- Pass count: ${qa.summary.pass_count}
- Blocked count: ${qa.summary.blocked_count}

## Gate Totals

| Gate | Passed | Failed |
|---|---:|---:|
${gateLines}

## Safety Boundary

- CMS write: ${qa.safety_boundary.cms_write}
- Approval queue write: ${qa.safety_boundary.approval_queue_write}
- Live promotion: ${qa.safety_boundary.live_promotion}
- Publish/index/search: ${qa.safety_boundary.publish_index_search}
- Sitemap/llms mutation: ${qa.safety_boundary.sitemap_llms_mutation}
- URL Truth write: ${qa.safety_boundary.url_truth_write}
- Production deploy: ${qa.safety_boundary.production_deploy}

## Next Task

\`${qa.recommended_next_task}\`
`;
}

function validateCommittedArtifacts(packagePath, qaPath) {
  if (!fs.existsSync(packagePath) || !fs.existsSync(qaPath)) {
    throw new Error(
      [
        "Local zh/en source directories are unavailable and committed package artifacts were not found.",
        `Missing package: ${relativeToRoot(packagePath)}`,
        `Missing QA: ${relativeToRoot(qaPath)}`,
      ].join("\n"),
    );
  }
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const qa = JSON.parse(fs.readFileSync(qaPath, "utf8"));
  const recommendations = Array.isArray(pkg.recommendations) ? pkg.recommendations : [];
  const validation = validatePackage(recommendations, []);
  const failures = [];

  if (pkg.final_decision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC") failures.push("package_final_decision");
  if (qa.final_decision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC") failures.push("qa_final_decision");
  if (recommendations.length !== 64) failures.push("package_recommendation_count");
  if (qa.summary?.target_count !== 64 || qa.summary?.pass_count !== 64 || qa.summary?.blocked_count !== 0) {
    failures.push("qa_summary_counts");
  }
  if (validation.finalDecision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC") {
    failures.push(`revalidated_package:${validation.finalDecision}`);
  }
  if (failures.length) {
    throw new Error(`Committed package QA validation failed: ${failures.join(", ")}`);
  }

  return {
    pkg,
    qa,
    recommendations,
    packageSha256: pkg.package_sha256 ?? sha256(JSON.stringify(pkg)),
    qaSha256: qa.qa_sha256 ?? sha256(JSON.stringify(qa)),
  };
}

function copyCommittedArtifactsForCi() {
  const committed = validateCommittedArtifacts(DEFAULT_PACKAGE_ARTIFACT, DEFAULT_QA_ARTIFACT);
  copyFileIfNeeded(DEFAULT_PACKAGE_ARTIFACT, OUTPUT_PACKAGE);
  copyFileIfNeeded(DEFAULT_PACKAGE_MD_ARTIFACT, OUTPUT_PACKAGE_MD);
  copyFileIfNeeded(DEFAULT_QA_ARTIFACT, OUTPUT_QA);
  copyFileIfNeeded(DEFAULT_QA_MD_ARTIFACT, OUTPUT_QA_MD);
  console.log(
    JSON.stringify(
      {
        ok: true,
        package_json: relativeToRoot(OUTPUT_PACKAGE),
        package_md: relativeToRoot(OUTPUT_PACKAGE_MD),
        qa_json: relativeToRoot(OUTPUT_QA),
        qa_md: relativeToRoot(OUTPUT_QA_MD),
        package_sha256: committed.packageSha256,
        qa_sha256: committed.qaSha256,
        rows_evaluated: committed.recommendations.length,
        rows_passed: committed.qa.summary.pass_count,
        rows_blocked: committed.qa.summary.blocked_count,
        final_decision: committed.qa.final_decision,
        source_mode: "committed_artifact_fallback",
      },
      null,
      2,
    ),
  );
}

function main() {
  if (!sourceDirsAvailable()) {
    copyCommittedArtifactsForCi();
    return;
  }

  const sources = [readSource(ZH_DIR, "zh"), readSource(EN_DIR, "en")];
  const recommendations = sources.flatMap((source) => {
    if (!Array.isArray(source.package.pages)) {
      throw new Error(`${source.locale} source package does not contain pages[]`);
    }
    return source.package.pages.map((page) => {
      const repairedPage = source.locale === "zh" ? repairZhDuplicateParagraphsInPage(page) : page;
      return recommendationFromPage(repairedPage, source);
    });
  });
  recommendations.sort((a, b) => a.path.localeCompare(b.path));

  const validation = validatePackage(recommendations, sources);
  const inputArtifacts = sources.map((source) => ({
    locale: source.locale,
    package_path: redactedInputPath(source.completePath),
    package_sha256: source.completeSha256,
    qa_path: redactedInputPath(source.qaPath),
    qa_sha256: source.qaSha256,
    final_decision: source.qa.final_decision,
    total_pages: source.qa.total_pages,
    pass_count: source.qa.pass_count,
  }));
  const safetyBoundary = {
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
  };

  const pkgWithoutHash = {
    artifact: "MBTI64-ZH32-EN32-V8_5-V5-BILINGUAL-PACKAGE-QA-01",
    generated_at: GENERATED_AT,
    status: validation.finalDecision === "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC" ? "pass" : "blocked",
    framework: "mbti64",
    package_version: "mbti64_zh32_en32_v8_5_v5_bilingual_v1",
    target_count: recommendations.length,
    final_decision: validation.finalDecision,
    input_artifacts: inputArtifacts,
    summary: {
      target_count: recommendations.length,
      zh_pages: recommendations.filter((row) => row.locale === "zh").length,
      en_pages: recommendations.filter((row) => row.locale === "en").length,
      variant_pages: recommendations.filter((row) => row.page_type === "variant").length,
      comparison_pages: recommendations.filter((row) => row.path.includes("-vs-")).length,
      type_count: new Set(recommendations.map((row) => row.type_code)).size,
      variant_codes: [...new Set(recommendations.map((row) => row.variant_code))].sort(),
      qa_pass_count: validation.passCount,
      qa_blocked_count: validation.blockedCount,
    },
    bilingual_alignment: {
      locale_count: 2,
      zh_en_type_variant_pairs_aligned: validation.blockers.every((blocker) => !blocker.includes("missing_")),
      expected_paths: [...EXPECTED_PATHS].sort(),
    },
    recommendations,
    safety_boundary: safetyBoundary,
    blockers: validation.blockers,
    recommended_next_task: "MBTI64-ZH32-EN32-V8_5-V5-ARTIFACT-SYNC-01",
  };

  const packageSha256 = sha256(JSON.stringify(pkgWithoutHash));
  const pkg = { ...pkgWithoutHash, package_sha256: packageSha256 };
  const qaWithoutHash = {
    artifact: "MBTI64-ZH32-EN32-V8_5-V5-BILINGUAL-PACKAGE-QA-01",
    generated_at: GENERATED_AT,
    input_artifact: relativeToRoot(OUTPUT_PACKAGE),
    input_package_sha256: packageSha256,
    final_decision: validation.finalDecision,
    recommended_next_task: "MBTI64-ZH32-EN32-V8_5-V5-ARTIFACT-SYNC-01",
    summary: {
      target_count: recommendations.length,
      pass_count: validation.passCount,
      blocked_count: validation.blockedCount,
      zh_pages: pkg.summary.zh_pages,
      en_pages: pkg.summary.en_pages,
      variant_pages: pkg.summary.variant_pages,
      comparison_pages: pkg.summary.comparison_pages,
      source_qa_pass: inputArtifacts.every((artifact) => artifact.final_decision === "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC"),
    },
    input_artifacts: inputArtifacts,
    gate_totals: validation.gateTotals,
    page_results: validation.pageResults,
    safety_boundary: safetyBoundary,
    blockers: validation.blockers,
  };
  const qa = { ...qaWithoutHash, qa_sha256: sha256(JSON.stringify(qaWithoutHash)) };

  writeJson(OUTPUT_PACKAGE, pkg);
  writeJson(OUTPUT_QA, qa);
  writeText(OUTPUT_PACKAGE_MD, buildMarkdownPackage(pkg, qa));
  writeText(OUTPUT_QA_MD, buildMarkdownQa(qa));

  console.log(
    JSON.stringify(
      {
        ok: validation.finalDecision === "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC",
        package_json: relativeToRoot(OUTPUT_PACKAGE),
        package_md: relativeToRoot(OUTPUT_PACKAGE_MD),
        qa_json: relativeToRoot(OUTPUT_QA),
        qa_md: relativeToRoot(OUTPUT_QA_MD),
        package_sha256: packageSha256,
        qa_sha256: qa.qa_sha256,
        rows_evaluated: recommendations.length,
        rows_passed: validation.passCount,
        rows_blocked: validation.blockedCount,
        final_decision: validation.finalDecision,
      },
      null,
      2,
    ),
  );

  if (validation.finalDecision !== "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC") {
    process.exitCode = 1;
  }
}

main();
