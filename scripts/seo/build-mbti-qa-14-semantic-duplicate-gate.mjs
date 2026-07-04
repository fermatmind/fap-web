#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = process.env.GENERATED_AT ?? "2026-07-04T23:30:00.000Z";
const GENERATED_DATE = getArgValue("--generated-date") ?? "2026-07-04";

const INPUTS = {
  remaining58:
    getArgValue("--remaining58") ??
    "docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-2026-06-28.json",
  comparison20:
    getArgValue("--comparison20") ??
    "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json",
};

const OUTPUT_JSON = resolvePath(
  getArgValue("--output-json") ??
    `docs/seo/personality/mbti-qa-14-semantic-duplicate-gate-${GENERATED_DATE}.json`,
);
const OUTPUT_MD = resolvePath(
  getArgValue("--output-md") ??
    `docs/seo/personality/mbti-qa-14-semantic-duplicate-gate-${GENERATED_DATE}.md`,
);

const REQUIRED_PROFILE_SECTIONS = [
  "how_to_read",
  "at_difference_table",
  "cognitive_function_mechanism",
  "work_scenario",
  "relationship_communication",
  "stress_growth",
  "common_misreads",
  "how_to_use_not_use",
];

const REQUIRED_COMPARISON_MODULES = [
  "biggest_difference",
  "quick_judgment_table",
  "easy_misread",
  "real_scenario_differences",
  "do_not_misjudge",
  "faq",
];

const FORBIDDEN_TEMPLATE_MARKERS = [
  "TODO",
  "TBD",
  "lorem ipsum",
  "replace this",
  "placeholder",
  "same as",
  "copy from",
  "复制竞品",
  "照搬竞品",
  "待补充",
  "占位",
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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolvePath(relativePath), "utf8"));
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

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectStrings(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, output);
  }
  return output;
}

function hasForbiddenTemplateText(value) {
  const text = normalizeText(collectStrings(value).join(" "));
  return FORBIDDEN_TEMPLATE_MARKERS.filter((marker) => text.includes(normalizeText(marker)));
}

function isPrivateHref(href) {
  if (!href || typeof href !== "string") return false;
  if (/token=|session=|result_id=|report_id=|order_no=/i.test(href)) return true;
  try {
    const url = href.startsWith("/") ? new URL(`https://fermatmind.com${href}`) : new URL(href);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.some((part) => PRIVATE_ROUTE_SEGMENTS.has(part.toLowerCase()));
  } catch {
    return false;
  }
}

function gate(status, evidence, failures = []) {
  return { status, evidence, failures };
}

function pass(evidence) {
  return gate("pass", evidence, []);
}

function fail(evidence, failures) {
  return gate("fail", evidence, failures);
}

function loadProfileRows(packageJson) {
  return packageJson.recommendations.map((item) => {
    const rec = item.recommendations;
    return {
      asset_id: item.recommendation_id,
      source_batch: "remaining58",
      target_url: item.target_url,
      path: item.path,
      locale: item.locale,
      page_type: "variant",
      type_code: item.type_code,
      mbti_type: item.mbti_type,
      comparison_pair: null,
      title: rec.title,
      h1: rec.h1,
      meta_description: rec.description,
      answer_block: rec.quick_answer,
      sections: rec.sections ?? [],
      modules: rec.sections ?? [],
      faq: rec.faq ?? [],
      internal_links: rec.internal_links ?? [],
      source: item,
    };
  });
}

function loadComparisonRows(packageJson) {
  return packageJson.assets.map((item) => ({
    asset_id: item.asset_id,
    source_batch: "comparison20",
    target_url: item.target_url,
    path: item.path,
    locale: item.locale,
    page_type: item.page_type,
    type_code: null,
    mbti_type: null,
    comparison_pair: item.comparison_pair,
    title: item.cms_fields.title,
    h1: item.cms_fields.h1,
    meta_description: item.cms_fields.meta_description,
    answer_block: item.cms_fields.answer_block,
    sections: item.cms_fields.modules ?? [],
    modules: item.cms_fields.modules ?? [],
    quick_judgment_table: item.cms_fields.quick_judgment_table ?? [],
    faq: item.cms_fields.faq ?? [],
    internal_links: item.cms_fields.internal_links ?? [],
    source: item,
  }));
}

function evaluateProfile(row) {
  const sectionKeys = row.sections.map((section) => section.key);
  const missingSections = REQUIRED_PROFILE_SECTIONS.filter((key) => !sectionKeys.includes(key));
  const typeCode = row.type_code;
  const text = collectStrings(row.source).join(" ");
  const forbidden = hasForbiddenTemplateText(row.source);
  const privateLinks = row.internal_links.filter((link) => isPrivateHref(link.href)).map((link) => link.href);
  const hasScenarioCoverage = ["work_scenario", "relationship_communication", "stress_growth"].every((key) =>
    sectionKeys.includes(key),
  );
  const hasTypeAnchor =
    row.answer_block.includes(typeCode) &&
    row.h1.includes(typeCode) &&
    row.title.includes(typeCode) &&
    normalizeText(text).includes(normalizeText(row.mbti_type));

  return {
    structure_gate: missingSections.length
      ? fail("Missing required remaining58 modules.", missingSections)
      : pass("All remaining58 profile modules are present."),
    answer_surface_gate:
      row.answer_block.length >= 140 && hasTypeAnchor
        ? pass("Quick answer is extractable and type-specific.")
        : fail("Quick answer must be long enough and include the exact type anchor.", [row.path]),
    scenario_specificity_gate:
      hasScenarioCoverage && row.sections.every((section) => String(section.body ?? "").length >= 90)
        ? pass("Work, relationship, stress, misread, and safe-use sections have enough depth.")
        : fail("Scenario sections are missing or too short.", [row.path]),
    faq_gate:
      row.faq.length >= 8 &&
      row.faq.every((faq) => String(faq.question ?? "").length >= 10 && String(faq.answer ?? "").length >= 45)
        ? pass("FAQ coverage is deep enough for remaining58 assets.")
        : fail("FAQ count or answer depth is too thin.", [row.path]),
    template_marker_gate: forbidden.length
      ? fail("Template or competitor-copy marker detected.", forbidden)
      : pass("No placeholder/template-copy marker detected."),
    private_route_gate: privateLinks.length
      ? fail("Private or sensitive route found in internal links.", privateLinks)
      : pass("Internal links stay on public routes."),
  };
}

function evaluateComparison(row) {
  const moduleKeys = row.modules.map((module) => module.key);
  const missingModules = REQUIRED_COMPARISON_MODULES.filter((key) => !moduleKeys.includes(key));
  const left = row.comparison_pair.left;
  const right = row.comparison_pair.right;
  const forbidden = hasForbiddenTemplateText(row.source);
  const privateLinks = row.internal_links.filter((link) => isPrivateHref(link.href)).map((link) => link.href);
  const answerHasPair = row.answer_block.includes(left) && row.answer_block.includes(right);
  const modulesHavePair = row.modules
    .filter((module) => module.key !== "faq")
    .every((module) => collectStrings(module).join(" ").includes(left) || collectStrings(module).join(" ").includes(right));

  return {
    structure_gate: missingModules.length
      ? fail("Missing required comparison modules.", missingModules)
      : pass("All required comparison modules are present."),
    answer_surface_gate:
      row.answer_block.length >= 140 && answerHasPair
        ? pass("Comparison answer block is extractable and pair-specific.")
        : fail("Comparison answer block must include both compared types.", [row.path]),
    quick_judgment_gate:
      row.quick_judgment_table.length >= 4 &&
      row.quick_judgment_table.every((item) => item.dimension && item.left && item.right)
        ? pass("Quick judgment table has enough paired rows.")
        : fail("Quick judgment table is missing paired decision rows.", [row.path]),
    scenario_specificity_gate:
      modulesHavePair && row.modules.every((module) => String(module.body ?? "").length >= 60)
        ? pass("Comparison modules contain pair-specific scenario and misread language.")
        : fail("Comparison modules are too generic or not pair-specific.", [row.path]),
    faq_gate:
      row.faq.length >= 5 &&
      row.faq.every((faq) => String(faq.question ?? "").length >= 10 && String(faq.answer ?? "").length >= 45)
        ? pass("Comparison FAQ coverage is sufficient.")
        : fail("Comparison FAQ count or answer depth is too thin.", [row.path]),
    template_marker_gate: forbidden.length
      ? fail("Template or competitor-copy marker detected.", forbidden)
      : pass("No placeholder/template-copy marker detected."),
    private_route_gate: privateLinks.length
      ? fail("Private or sensitive route found in internal links.", privateLinks)
      : pass("Internal links stay on public routes."),
  };
}

function duplicateGroups(rows, extractText) {
  const groups = new Map();
  for (const row of rows) {
    const normalized = normalizeText(extractText(row));
    if (!normalized) continue;
    const key = sha256(normalized);
    const existing = groups.get(key) ?? [];
    existing.push(row.path);
    groups.set(key, existing);
  }
  return [...groups.values()].filter((paths) => paths.length > 1);
}

function buildPageResults(rows) {
  const answerDuplicates = duplicateGroups(rows, (row) => row.answer_block);
  const moduleDuplicates = duplicateGroups(rows, (row) => row.modules.map((module) => module.body).join("\n"));
  const duplicatePathSet = new Set([...answerDuplicates.flat(), ...moduleDuplicates.flat()]);

  return rows.map((row) => {
    const gates = row.source_batch === "remaining58" ? evaluateProfile(row) : evaluateComparison(row);
    gates.exact_duplicate_gate = duplicatePathSet.has(row.path)
      ? fail("Exact duplicate answer or module body detected.", [row.path])
      : pass("No exact duplicate answer block or module-body set detected.");

    const failed = Object.entries(gates)
      .filter(([, value]) => value.status !== "pass")
      .map(([key, value]) => ({ gate: key, failures: value.failures }));

    return {
      source_batch: row.source_batch,
      path: row.path,
      target_url: row.target_url,
      locale: row.locale,
      page_type: row.page_type,
      type_code: row.type_code,
      comparison_pair: row.comparison_pair,
      module_count: row.modules.length,
      faq_count: row.faq.length,
      internal_link_count: row.internal_links.length,
      gates,
      qa_decision: failed.length ? "BLOCKED_NEEDS_CONTENT_REVIEW" : "PASS_SEMANTIC_DUPLICATE_GATE",
      blocked_reason: failed.length ? failed : null,
    };
  });
}

function gateTotals(pageResults) {
  const totals = {};
  for (const result of pageResults) {
    for (const [name, gateResult] of Object.entries(result.gates)) {
      totals[name] ??= { passed: 0, failed: 0 };
      if (gateResult.status === "pass") totals[name].passed += 1;
      else totals[name].failed += 1;
    }
  }
  return totals;
}

function buildMarkdown(report) {
  const rows = [
    "| Batch | Count | Passed | Blocked |",
    "| --- | ---: | ---: | ---: |",
    `| remaining58 | ${report.summary.remaining58_count} | ${report.summary.remaining58_pass_count} | ${report.summary.remaining58_blocked_count} |`,
    `| comparison20 | ${report.summary.comparison20_count} | ${report.summary.comparison20_pass_count} | ${report.summary.comparison20_blocked_count} |`,
  ];

  const gates = [
    "| Gate | Passed | Failed |",
    "| --- | ---: | ---: |",
    ...Object.entries(report.gate_totals).map(([gateName, total]) => `| ${gateName} | ${total.passed} | ${total.failed} |`),
  ];

  const blockers = report.blockers.length
    ? report.blockers.map((item) => `- ${item}`).join("\n")
    : "- None";

  return [
    "# MBTI-QA-14 Semantic Quality And Duplicate Risk Gate",
    "",
    `Generated at: ${report.generated_at}`,
    "",
    "This is an artifact-only QA gate for MBTI remaining58 profile recommendations and comparison20 content assets. It does not write CMS content, import production data, mutate sitemap/llms, or touch frontend runtime rendering.",
    "",
    "## Summary",
    "",
    ...rows,
    "",
    "## Gates",
    "",
    ...gates,
    "",
    "## Blockers",
    "",
    blockers,
    "",
    "## Next Use",
    "",
    "- Use failed rows, if any, as CMS review blockers before import dry-run promotion.",
    "- Use pass rows as evidence that assets have extractable answer surfaces and no exact duplicate answer/module bodies.",
    "- Keep production CMS import and sitemap/llms expansion in separate authorized PRs.",
    "",
  ].join("\n");
}

const remaining58Package = readJson(INPUTS.remaining58);
const comparison20Package = readJson(INPUTS.comparison20);
const rows = [...loadProfileRows(remaining58Package), ...loadComparisonRows(comparison20Package)];
const pageResults = buildPageResults(rows);
const blockers = pageResults
  .filter((row) => row.qa_decision !== "PASS_SEMANTIC_DUPLICATE_GATE")
  .map((row) => `${row.path}: ${row.blocked_reason.map((item) => item.gate).join(", ")}`);

const summary = {
  target_count: pageResults.length,
  pass_count: pageResults.filter((row) => row.qa_decision === "PASS_SEMANTIC_DUPLICATE_GATE").length,
  blocked_count: blockers.length,
  remaining58_count: pageResults.filter((row) => row.source_batch === "remaining58").length,
  comparison20_count: pageResults.filter((row) => row.source_batch === "comparison20").length,
  remaining58_pass_count: pageResults.filter(
    (row) => row.source_batch === "remaining58" && row.qa_decision === "PASS_SEMANTIC_DUPLICATE_GATE",
  ).length,
  comparison20_pass_count: pageResults.filter(
    (row) => row.source_batch === "comparison20" && row.qa_decision === "PASS_SEMANTIC_DUPLICATE_GATE",
  ).length,
  remaining58_blocked_count: pageResults.filter(
    (row) => row.source_batch === "remaining58" && row.qa_decision !== "PASS_SEMANTIC_DUPLICATE_GATE",
  ).length,
  comparison20_blocked_count: pageResults.filter(
    (row) => row.source_batch === "comparison20" && row.qa_decision !== "PASS_SEMANTIC_DUPLICATE_GATE",
  ).length,
  remaining58_min_faq_count: Math.min(
    ...pageResults.filter((row) => row.source_batch === "remaining58").map((row) => row.faq_count),
  ),
  comparison20_min_faq_count: Math.min(
    ...pageResults.filter((row) => row.source_batch === "comparison20").map((row) => row.faq_count),
  ),
};

const report = {
  id: "MBTI-QA-14",
  artifact: "MBTI-QA-14-SEMANTIC-DUPLICATE-GATE",
  generated_at: GENERATED_AT,
  input_artifacts: {
    remaining58: INPUTS.remaining58,
    comparison20: INPUTS.comparison20,
  },
  final_decision:
    blockers.length === 0
      ? "PASS_MBTI_QA_14_SEMANTIC_DUPLICATE_GATE_READY"
      : "BLOCKED_MBTI_QA_14_CONTENT_REVIEW_REQUIRED",
  summary,
  gate_totals: gateTotals(pageResults),
  page_results: pageResults,
  safety_boundary: {
    artifact_only: true,
    cms_write_attempted: false,
    production_import_attempted: false,
    db_migration_attempted: false,
    frontend_runtime_change_attempted: false,
    frontend_local_editorial_fallback_added: false,
    sitemap_llms_mutation_attempted: false,
    gsc_api_call_attempted: false,
    search_submission_attempted: false,
    production_deploy_attempted: false,
  },
  blockers,
};

writeJson(OUTPUT_JSON, report);
writeText(OUTPUT_MD, buildMarkdown(report));

console.log(
  JSON.stringify({
    ok: blockers.length === 0,
    artifact: report.artifact,
    output_json: rel(OUTPUT_JSON),
    output_md: rel(OUTPUT_MD),
    target_count: summary.target_count,
    remaining58_count: summary.remaining58_count,
    comparison20_count: summary.comparison20_count,
    final_decision: report.final_decision,
  }),
);
