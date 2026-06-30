#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_CONTRACT =
  "docs/seo/personality/mbti64-zh32-original-v8-3-content-contract-2026-06-30.json";
const DEFAULT_INPUT =
  "docs/seo/personality/mbti64-zh32-original-v8-3-gpt-package-2026-06-30.json";
const DEFAULT_NORMALIZED =
  "docs/seo/personality/mbti64-zh32-original-v8-3-normalized-package-2026-06-30.json";
const DEFAULT_QA = "docs/seo/personality/mbti64-zh32-original-v8-3-qa-2026-06-30.json";
const DEFAULT_MD = "docs/seo/personality/mbti64-zh32-original-v8-3-qa-2026-06-30.md";

const gateNames = [
  "inventory_gate",
  "schema_gate",
  "module_contract_gate",
  "depth_gate",
  "seo_geo_gate",
  "internal_link_gate",
  "source_ledger_gate",
  "trademark_affiliation_gate",
  "clinical_hiring_iq_gate",
  "deterministic_claim_gate",
  "competitor_copy_gate",
  "private_route_gate",
  "duplicate_template_gate",
  "safety_boundary_gate",
];

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    contract: DEFAULT_CONTRACT,
    outputNormalized: DEFAULT_NORMALIZED,
    outputQa: DEFAULT_QA,
    outputMd: DEFAULT_MD,
    expectedTargetSet: "auto",
    relaxedDepthForFixture: false,
  };

  for (const rawArg of argv.slice(2)) {
    const [key, ...rest] = rawArg.replace(/^--/, "").split("=");
    const value = rest.join("=");
    if (key === "input") args.input = value;
    if (key === "contract") args.contract = value;
    if (key === "output-normalized") args.outputNormalized = value;
    if (key === "output-qa") args.outputQa = value;
    if (key === "output-md") args.outputMd = value;
    if (key === "expected-target-set") args.expectedTargetSet = value;
    if (key === "relaxed-depth-for-fixture") args.relaxedDepthForFixture = true;
  }

  return args;
}

function absolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(absolute(filePath), "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(absolute(filePath)), { recursive: true });
  fs.writeFileSync(absolute(filePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(absolute(filePath)), { recursive: true });
  fs.writeFileSync(absolute(filePath), value);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");
}

function textValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textValue).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(textValue).join("\n");
  return "";
}

function compactText(value) {
  return textValue(value).replace(/\s+/g, " ").trim();
}

function normalizedSignature(value) {
  return compactText(value)
    .toLowerCase()
    .replace(/[，。！？、；：“”‘’《》（）()\[\]{}.,!?;:'"`~\s-]+/g, "")
    .slice(0, 220);
}

function chineseishLength(value) {
  return compactText(value).replace(/\s+/g, "").length;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function linkPath(link) {
  if (typeof link === "string") return link;
  if (link && typeof link === "object") return link.path || link.href || link.url || "";
  return "";
}

function gate(status, failures = []) {
  return {
    status: status ? "pass" : "fail",
    failures,
  };
}

function inferTargetSet(contract, pages, expectedTargetSet) {
  if (expectedTargetSet !== "auto") return expectedTargetSet;
  const count = pages.length;
  for (const [targetSet, config] of Object.entries(contract.accepted_target_sets)) {
    if (config.target_count === count) return targetSet;
  }
  const actualPaths = new Set(pages.map((page) => page.path).filter(Boolean));
  const subsetMatches = Object.entries(contract.accepted_target_sets)
    .map(([targetSet, config]) => {
      const expectedPaths = new Set(config.paths);
      const extraCount = [...actualPaths].filter((item) => !expectedPaths.has(item)).length;
      const missingCount = config.paths.filter((item) => !actualPaths.has(item)).length;
      return { targetSet, extraCount, missingCount };
    })
    .filter((item) => item.extraCount === 0)
    .sort((a, b) => a.missingCount - b.missingCount);
  if (subsetMatches.length > 0) return subsetMatches[0].targetSet;
  return "unknown";
}

function extractTypeAndVariant(page) {
  const match = String(page.path || "").match(/^\/zh\/personality\/([a-z]{4})-([at])$/);
  return {
    type: match?.[1] || "",
    variant: match?.[2] || "",
  };
}

function expectedLinksFor(page, contract) {
  const { type, variant } = extractTypeAndVariant(page);
  const oppositeVariant = variant === "a" ? "t" : "a";
  return [
    ...contract.internal_link_policy.required_paths,
    contract.internal_link_policy.at_comparison_path_template.replaceAll("{type}", type),
    contract.internal_link_policy.paired_counterpart_path_template
      .replaceAll("{type}", type)
      .replaceAll("{opposite_variant}", oppositeVariant),
  ];
}

function hasRequiredFalseSafetyFlags(safetyBoundary) {
  const expectedFalse = [
    "cms_write",
    "approval_queue_write",
    "live_promotion",
    "publish_index_search",
    "sitemap_llms_mutation",
    "search_queue_mutation",
    "indexnow_submit",
    "frontend_runtime_change",
    "url_truth_write",
    "production_deploy",
    "external_api_call",
  ];
  return expectedFalse.every((flag) => safetyBoundary?.[flag] === false);
}

function forbiddenClaimPresence(text) {
  const patterns = [
    {
      gate: "trademark_affiliation_gate",
      reason: "official MBTI/Myers-Briggs affiliation wording",
      regex: /(官方\s*(mbti|myers|迈尔斯|布里格斯)|mbti\s*官方|myers-briggs\s*(official|certified|endorsed|owned)|迈尔斯.*官方|布里格斯.*官方)/i,
    },
    {
      gate: "clinical_hiring_iq_gate",
      reason: "clinical diagnosis, hiring, or IQ screening wording",
      regex: /(临床诊断|心理疾病诊断|精神科诊断|治疗替代|招聘筛选|录用筛选|入学筛选|智商排名|iq\s*排名|智力高低|适合用来招聘)/i,
    },
    {
      gate: "deterministic_claim_gate",
      reason: "deterministic career, relationship, or destiny wording",
      regex: /(注定|命中注定|一定成功|保证成功|完美职业|最佳职业就是|唯一适合|完美伴侣|一定适合|决定你的职业|决定你的关系|决定你的命运)/i,
    },
    {
      gate: "competitor_copy_gate",
      reason: "competitor signature or copied-wording boundary risk",
      regex: /(16personalities|16\s*personalities|truity|123test|crystal|personalityjunkie|architects are imaginative|plan for everything|people with the intj personality type)/i,
    },
  ];

  const failures = {};
  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      failures[pattern.gate] ||= [];
      failures[pattern.gate].push(pattern.reason);
    }
  }
  return failures;
}

function privateRouteFailures(paths, contract) {
  const patterns = contract.internal_link_policy.private_route_patterns_forbidden || [];
  return paths.filter((route) => patterns.some((pattern) => route.includes(pattern)));
}

function validatePage(page, contract, duplicateMap, options) {
  const failures = Object.fromEntries(gateNames.map((name) => [name, []]));
  const { type, variant } = extractTypeAndVariant(page);
  const expectedModules = contract.module_contract;
  const modules = asArray(page.modules);
  const faq = asArray(page.faq);
  const internalLinks = asArray(page.internal_links).map(linkPath).filter(Boolean);
  const sourceLedger = asArray(page.source_ledger);
  const bodyText = compactText(page);
  const bodyLength = chineseishLength({
    seo: page.seo,
    geo_summary: page.geo_summary,
    modules: page.modules,
    faq: page.faq,
  });

  if (page.locale !== "zh") failures.inventory_gate.push("locale must be zh");
  if (!/^\/zh\/personality\/[a-z]{4}-[at]$/.test(String(page.path || ""))) {
    failures.inventory_gate.push("path must be a zh MBTI variant path");
  }
  if (String(page.path || "").includes("-vs-")) failures.inventory_gate.push("comparison pages are not allowed");
  if (String(page.path || "").startsWith("/en/")) failures.inventory_gate.push("English pages are not allowed");
  if (String(page.type_code || "").toLowerCase() !== type) failures.inventory_gate.push("type_code must match path");
  if (String(page.variant || "").toLowerCase() !== variant) failures.inventory_gate.push("variant must match path");

  for (const field of contract.page_shape.required_fields) {
    if (!(field in page)) failures.schema_gate.push(`missing required field: ${field}`);
  }
  if (!page.seo?.title) failures.schema_gate.push("missing seo.title");
  if (!page.seo?.description) failures.schema_gate.push("missing seo.description");
  if (!page.geo_summary?.direct_answer) failures.schema_gate.push("missing geo_summary.direct_answer");
  if (!Array.isArray(page.modules)) failures.schema_gate.push("modules must be an array");
  if (!Array.isArray(page.faq)) failures.schema_gate.push("faq must be an array");
  if (!Array.isArray(page.internal_links)) failures.schema_gate.push("internal_links must be an array");
  if (!Array.isArray(page.source_ledger)) failures.schema_gate.push("source_ledger must be an array");

  if (modules.length !== expectedModules.length) {
    failures.module_contract_gate.push(`expected ${expectedModules.length} modules, got ${modules.length}`);
  }
  for (let index = 0; index < expectedModules.length; index += 1) {
    const expected = expectedModules[index];
    const contentModule = modules[index];
    if (!contentModule) continue;
    if (contentModule.id !== expected.id) failures.module_contract_gate.push(`module ${index + 1} id must be ${expected.id}`);
    if (Number(contentModule.order) !== expected.order) {
      failures.module_contract_gate.push(`module ${expected.id} order must be ${expected.order}`);
    }
    const paragraphs = asArray(contentModule.paragraphs);
    if (paragraphs.length < expected.min_paragraphs || paragraphs.length > expected.max_paragraphs) {
      failures.module_contract_gate.push(
        `module ${expected.id} must have ${expected.min_paragraphs}-${expected.max_paragraphs} paragraphs`,
      );
    }
    if (!compactText(contentModule.title)) failures.module_contract_gate.push(`module ${expected.id} missing title`);
  }

  const minBodyLength = options.relaxedDepthForFixture ? 1200 : contract.depth_requirements.body_chars_per_page_min;
  if (bodyLength < minBodyLength) {
    failures.depth_gate.push(`body text too short: ${bodyLength}, expected at least ${minBodyLength}`);
  }
  if (faq.length < contract.depth_requirements.faq_per_page_min || faq.length > contract.depth_requirements.faq_per_page_max) {
    failures.depth_gate.push(
      `FAQ count must be ${contract.depth_requirements.faq_per_page_min}-${contract.depth_requirements.faq_per_page_max}`,
    );
  }
  for (const scenario of contract.depth_requirements.required_scenario_types) {
    const found = bodyText.includes(scenario) || bodyText.includes({ work: "工作", relationship: "关系", stress_or_growth: "压力" }[scenario]);
    if (!found) failures.depth_gate.push(`missing scenario type: ${scenario}`);
  }

  if (asArray(page.seo?.primary_keywords).length < contract.seo_geo_requirements.primary_keywords_min) {
    failures.seo_geo_gate.push("primary_keywords below minimum");
  }
  if (asArray(page.seo?.search_intents).length < contract.seo_geo_requirements.search_intents_min) {
    failures.seo_geo_gate.push("search_intents below minimum");
  }
  if (asArray(page.geo_summary?.answer_targets).length < contract.seo_geo_requirements.geo_answer_targets_min) {
    failures.seo_geo_gate.push("geo answer_targets below minimum");
  }
  if (asArray(page.geo_summary?.answer_entities).length < contract.seo_geo_requirements.answer_entities_min) {
    failures.seo_geo_gate.push("geo answer_entities below minimum");
  }
  if (!page.geo_summary?.site_path) failures.seo_geo_gate.push("missing geo_summary.site_path");

  for (const expectedPath of expectedLinksFor(page, contract)) {
    if (!internalLinks.includes(expectedPath)) failures.internal_link_gate.push(`missing internal link: ${expectedPath}`);
  }

  if (sourceLedger.length < 3) failures.source_ledger_gate.push("source_ledger must contain at least 3 sources");
  if (!sourceLedger.some((source) => /mbti|myers|briggs|personality|人格|心理|big five|riasec/i.test(compactText(source)))) {
    failures.source_ledger_gate.push("source_ledger must include personality/scientific boundary evidence");
  }

  const forbidden = forbiddenClaimPresence(bodyText);
  for (const [gateName, gateFailures] of Object.entries(forbidden)) failures[gateName].push(...gateFailures);

  const privateRoutes = privateRouteFailures([...internalLinks, page.path || ""], contract);
  if (privateRoutes.length > 0) failures.private_route_gate.push(`private route leakage: ${privateRoutes.join(", ")}`);

  const duplicateFields = [
    page.seo?.title,
    page.seo?.description,
    page.geo_summary?.direct_answer,
    faq.map((item) => item.question || item.q || item.title || ""),
  ];
  for (const signature of duplicateFields.map(normalizedSignature).filter((value) => value.length > 24)) {
    const group = duplicateMap.get(signature) || [];
    if (group.length > 1) failures.duplicate_template_gate.push(`duplicate signature shared by ${group.join(", ")}`);
  }

  if (page.forbidden_claims_absent !== true && typeof page.forbidden_claims_absent !== "object") {
    failures.safety_boundary_gate.push("forbidden_claims_absent must be true or an object");
  }
  if (typeof page.forbidden_claims_absent === "object") {
    const unsafe = Object.entries(page.forbidden_claims_absent).filter(([, value]) => value !== true);
    if (unsafe.length > 0) failures.safety_boundary_gate.push(`forbidden_claims_absent contains non-true flags: ${unsafe.map(([key]) => key).join(", ")}`);
  }
  if (!page.qa_self_check || typeof page.qa_self_check !== "object") failures.safety_boundary_gate.push("qa_self_check object required");

  const gates = Object.fromEntries(
    gateNames.map((name) => [name, gate(failures[name].length === 0, failures[name])]),
  );
  const passed = Object.values(gates).every((result) => result.status === "pass");

  return {
    path: page.path || null,
    locale: page.locale || null,
    type_code: page.type_code || null,
    variant: page.variant || null,
    body_chars: bodyLength,
    module_count: modules.length,
    faq_count: faq.length,
    source_count: sourceLedger.length,
    gates,
    qa_decision: passed ? "PASS" : "NO_GO_QA_REPAIR_REQUIRED",
    blocked_reason: passed
      ? null
      : Object.entries(failures)
          .filter(([, gateFailures]) => gateFailures.length > 0)
          .map(([gateName, gateFailures]) => `${gateName}: ${gateFailures.join("; ")}`)
          .join(" | "),
  };
}

function buildDuplicateMap(pages) {
  const map = new Map();
  for (const page of pages) {
    const faq = asArray(page.faq);
    const values = [
      page.seo?.title,
      page.seo?.description,
      page.geo_summary?.direct_answer,
      faq.map((item) => item.question || item.q || item.title || ""),
    ];
    for (const signature of values.map(normalizedSignature).filter((value) => value.length > 24)) {
      const group = map.get(signature) || [];
      group.push(page.path || "(missing path)");
      map.set(signature, group);
    }
  }
  return map;
}

function createNormalizedPackage(packageInput, targetSet, targetConfig, pageResults) {
  const order = new Map(targetConfig.paths.map((item, index) => [item, index]));
  const pages = [...packageInput.pages].sort((a, b) => (order.get(a.path) ?? 999) - (order.get(b.path) ?? 999));
  const normalized = {
    artifact: "MBTI64-ZH32-ORIGINAL-V8_3-NORMALIZED-PACKAGE",
    generated_at: new Date().toISOString(),
    source_artifact: packageInput.artifact || null,
    framework: "mbti64",
    locale: "zh",
    package_mode: targetSet,
    target_count: pages.length,
    target_paths: pages.map((page) => page.path),
    pages,
    source_ledger: packageInput.source_ledger || [],
    safety_boundary: {
      artifact_only: true,
      ...(packageInput.safety_boundary || {}),
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
    page_hashes: Object.fromEntries(pages.map((page) => [page.path, sha256(page)])),
    qa_summary: {
      pass_count: pageResults.filter((row) => row.qa_decision === "PASS").length,
      blocked_count: pageResults.filter((row) => row.qa_decision !== "PASS").length,
    },
  };
  normalized.package_sha256 = sha256(normalized);
  return normalized;
}

function createQaArtifact({ contract, packageInput, targetSet, targetConfig, pageResults, normalizedPackage }) {
  const passCount = pageResults.filter((row) => row.qa_decision === "PASS").length;
  const blockedCount = pageResults.length - passCount;
  const inventoryFailures = [];
  const actualPaths = new Set(packageInput.pages.map((page) => page.path));
  const expectedPaths = new Set(targetConfig?.paths || []);
  const extraPaths = [...actualPaths].filter((item) => !expectedPaths.has(item));
  const missingPaths = [...expectedPaths].filter((item) => !actualPaths.has(item));
  if (!targetConfig) inventoryFailures.push(`unknown target set: ${targetSet}`);
  if (extraPaths.length > 0) inventoryFailures.push(`unexpected paths: ${extraPaths.join(", ")}`);
  if (missingPaths.length > 0) inventoryFailures.push(`missing paths: ${missingPaths.join(", ")}`);

  const topLevelFailures = [];
  if (packageInput.framework !== "mbti64") topLevelFailures.push("framework must be mbti64");
  if (packageInput.locale !== "zh") topLevelFailures.push("locale must be zh");
  if (!hasRequiredFalseSafetyFlags(packageInput.safety_boundary || {})) {
    topLevelFailures.push("top-level safety_boundary must keep all mutation flags false");
  }

  const blockers = [
    ...inventoryFailures,
    ...topLevelFailures,
    ...pageResults.filter((row) => row.qa_decision !== "PASS").map((row) => `${row.path}: ${row.blocked_reason}`),
  ];
  const passed = blockers.length === 0 && blockedCount === 0;
  const finalDecision = passed ? targetConfig.ready_decision : "NO_GO_QA_REPAIR_REQUIRED";

  const gateTotals = Object.fromEntries(
    gateNames.map((gateName) => [
      gateName,
      {
        passed: pageResults.filter((row) => row.gates[gateName]?.status === "pass").length,
        failed: pageResults.filter((row) => row.gates[gateName]?.status === "fail").length,
      },
    ]),
  );

  return {
    artifact: "MBTI64-ZH32-ORIGINAL-V8_3-QA-HANDOFF",
    generated_at: new Date().toISOString(),
    input_artifact: packageInput.artifact || null,
    contract_artifact: contract.artifact,
    framework: "mbti64",
    locale: "zh",
    package_mode: targetSet,
    final_decision: finalDecision,
    recommended_next_task:
      finalDecision === "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC"
        ? "MBTI64-ZH32-ORIGINAL-V8_3-FAP-API-ARTIFACT-SYNC-01"
        : finalDecision === "PASS_READY_FOR_GOLDEN_SAMPLE_MERGE"
          ? "MBTI64-ZH32-ORIGINAL-V8_3-GOLDEN-SAMPLE-MERGE-01"
          : "MBTI64-ZH32-ORIGINAL-V8_3-QA-REPAIR-01",
    summary: {
      target_count: pageResults.length,
      expected_target_count: targetConfig?.target_count || null,
      pass_count: passCount,
      blocked_count: blockedCount,
      missing_path_count: missingPaths.length,
      unexpected_path_count: extraPaths.length,
      min_body_chars: Math.min(...pageResults.map((row) => row.body_chars)),
      max_body_chars: Math.max(...pageResults.map((row) => row.body_chars)),
      min_faq_count: Math.min(...pageResults.map((row) => row.faq_count)),
      max_faq_count: Math.max(...pageResults.map((row) => row.faq_count)),
      normalized_package_sha256: normalizedPackage.package_sha256,
    },
    gate_totals: gateTotals,
    page_results: pageResults,
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
    blockers,
  };
}

function createMarkdownReport(qa) {
  const blockedRows = qa.page_results.filter((row) => row.qa_decision !== "PASS");
  const blockerLines =
    blockedRows.length === 0
      ? "- None"
      : blockedRows.map((row) => `- ${row.path}: ${row.blocked_reason}`).join("\n");

  return `# MBTI64 Zh32 Original V8.3 QA Handoff

## Decision

${qa.final_decision}

## Summary

- Package mode: ${qa.package_mode}
- Target count: ${qa.summary.target_count}
- Pass count: ${qa.summary.pass_count}
- Blocked count: ${qa.summary.blocked_count}
- Normalized package SHA256: ${qa.summary.normalized_package_sha256}

## Safety

This artifact is validation-only. It does not write CMS, approval queue, live promotion, publish/index/search state, sitemap, llms, URL Truth, Search Queue, IndexNow, frontend runtime, or external APIs.

## Blockers

${blockerLines}

## Next Task

${qa.recommended_next_task}
`;
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(args.contract);
  const packageInput = readJson(args.input);
  const pages = asArray(packageInput.pages);
  const targetSet = inferTargetSet(contract, pages, args.expectedTargetSet);
  const targetConfig = contract.accepted_target_sets[targetSet];
  const duplicateMap = buildDuplicateMap(pages);
  const pageResults = pages.map((page) => validatePage(page, contract, duplicateMap, args));
  const normalizedPackage = createNormalizedPackage(
    {
      ...packageInput,
      pages,
      safety_boundary: packageInput.safety_boundary || {},
    },
    targetSet,
    targetConfig || { paths: [], target_count: 0, ready_decision: "NO_GO_QA_REPAIR_REQUIRED" },
    pageResults,
  );
  const qa = createQaArtifact({ contract, packageInput: { ...packageInput, pages }, targetSet, targetConfig, pageResults, normalizedPackage });

  writeJson(args.outputNormalized, normalizedPackage);
  writeJson(args.outputQa, qa);
  writeText(args.outputMd, createMarkdownReport(qa));

  const ok = qa.final_decision !== "NO_GO_QA_REPAIR_REQUIRED";
  process.stdout.write(
    `${JSON.stringify(
      {
        ok,
        final_decision: qa.final_decision,
        package_mode: qa.package_mode,
        rows_evaluated: qa.summary.target_count,
        rows_passed: qa.summary.pass_count,
        rows_blocked: qa.summary.blocked_count,
        output_normalized: args.outputNormalized,
        output_qa: args.outputQa,
        output_md: args.outputMd,
      },
      null,
      2,
    )}\n`,
  );
  process.exitCode = ok ? 0 : 1;
}

main();
