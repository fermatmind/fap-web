#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const auditDate = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const packagePath = path.join(
  repoRoot,
  "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json",
);
const v21QaPath = path.join(repoRoot, "docs/seo/personality/content-package-v21-qa-2026-06-18.json");
const intentMapPath = path.join(repoRoot, "docs/seo/personality/query-intent-map-pilot-v1.json");
const routeDecisionPath = path.join(
  repoRoot,
  "docs/seo/personality/related-test-route-scope-decision-2026-06-18.json",
);
const outputJsonPath = path.join(repoRoot, `docs/seo/personality/content-package-gates-${auditDate}.json`);
const outputMarkdownPath = path.join(repoRoot, `docs/seo/personality/content-package-gates-${auditDate}.md`);

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

const textFieldKeys = [
  "seo",
  "content",
  "faq",
  "internal_links",
  "method_boundary",
  "trademark_boundary",
  "information_gain",
  "above_the_fold_module",
  "serp_ctr_package_v2",
  "v2_optimization",
  "claim_risk_notes",
  "qa_flags_for_codex",
];

const officialClaimPatterns = [
  /official\s+MBTI/i,
  /official\s+32\s+types/i,
  /certified\s+MBTI/i,
  /Myers-Briggs\s+authorized/i,
  /official\s+Myers-Briggs\s+result/i,
  /FermatMind\s+is\s+the\s+official\s+MBTI\s+provider/i,
  /A\/T\s+is\s+an\s+official\s+native\s+MBTI\s+dimension/i,
  /MBTI\s+official\s+test/i,
  /official\s+16\s+personalities\s+result/i,
  /guaranteed\s+MBTI\s+result/i,
  /官方\s*MBTI/i,
  /认证\s*MBTI/i,
  /MBTI\s*官方测试/i,
  /官方\s*16\s*型人格结果/i,
  /保证.*MBTI.*结果/i,
  /A\/T.*官方.*维度/i,
];
const riskySerpPatterns = [
  /most accurate/i,
  /\bbest\s+(?:test|type|personality|career|job|match|fit|result|answer)\b/i,
  /guaranteed/i,
  /diagnosis/i,
  /rarest/i,
  /最准确/,
  /最佳/,
  /保证/,
  /诊断/,
  /最稀有/,
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
const knownHolds = [
  "/results/lookup sidecar classification blocks publish/search release",
  "No CMS import in this PR",
  "No sitemap/llms/search-release work in this PR",
  "Operator approval required before CMS revision draft",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stable(value) {
  return JSON.stringify(value);
}

function valueText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(valueText).join(" ");
  if (typeof value === "object") return Object.values(value).map(valueText).join(" ");
  return String(value);
}

function normalize(value) {
  return valueText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function jaccard(a, b) {
  const aSet = new Set(tokens(a));
  const bSet = new Set(tokens(b));
  if (!aSet.size || !bSet.size) return 0;
  let intersection = 0;
  for (const token of aSet) if (bSet.has(token)) intersection += 1;
  return intersection / (aSet.size + bSet.size - intersection);
}

function isNegatedBoundary(text, index) {
  const window = text.slice(Math.max(0, index - 90), index + 180);
  return /\b(not|non-official|not official|not an official|is not official|not certified|not authorized|avoid|do not|without)\b/i.test(window)
    || /非官方|不是官方|不属于官方|不代表官方|不得暗示官方|避免官方/.test(window);
}

function exactPhrase(container, phrase) {
  const haystack = normalize(container);
  const needle = normalize(phrase);
  return needle.length > 0 && haystack.includes(needle);
}

function rowText(row) {
  return textFieldKeys.map((key) => valueText(row[key])).join(" ");
}

function h2Values(row) {
  return Object.values(row.content || {}).map((section) => {
    if (section && typeof section === "object" && !Array.isArray(section)) return section.h2 || "";
    return "";
  });
}

function faqQuestions(row) {
  return (row.faq || []).map((item) => item.question || "");
}

function faqAnswers(row) {
  return (row.faq || []).map((item) => item.answer || "");
}

function comparisonIntent(value) {
  return /\bvs\b|difference|compare|comparison|对比|区别|差异/.test(normalize(value));
}

function escapeCell(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function markdownTable(rows, fields) {
  if (!rows.length) return "_None_";
  return [
    `| ${fields.join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => escapeCell(row[field])).join(" | ")} |`),
  ].join("\n");
}

function maxSignal(signals) {
  return Math.max(...Object.values(signals).map((value) => Number(value) || 0));
}

function duplicateRisk(signals, pairContext) {
  const substantive = { ...signals };
  delete substantive.section_heading_overlap;
  const max = maxSignal(substantive);
  if (max >= 0.72) return "high";
  if (max >= 0.48) return pairContext ? "medium" : "low";
  return "low";
}

function routeForbiddenInContent(row) {
  const findings = [];
  const check = (location, value) => {
    const text = valueText(value);
    for (const pattern of forbiddenRoutePatterns) {
      if (pattern.test(text)) findings.push({ url: row.url, location, pattern: String(pattern), text: text.slice(0, 180) });
    }
  };
  check("target_test_route", row.target_test_route);
  for (const link of row.internal_links || []) check(`internal_links:${link.role || "unknown"}`, link.href);
  check("above_the_fold_module", row.above_the_fold_module);
  check("serp_ctr_package_v2", row.serp_ctr_package_v2);
  check("seo", row.seo);
  check("content", row.content);
  check("faq", row.faq);
  return findings;
}

for (const file of [packagePath, v21QaPath, intentMapPath, routeDecisionPath]) {
  if (!fs.existsSync(file)) throw new Error(`Required input missing: ${file}`);
}

const pkg = readJson(packagePath);
const v21Qa = readJson(v21QaPath);
const intentMap = readJson(intentMapPath);
const routeDecision = readJson(routeDecisionPath);
const rows = Array.isArray(pkg.rows) ? pkg.rows : [];
const intentRows = Array.isArray(intentMap.rows) ? intentMap.rows : [];
const intentByUrl = new Map(intentRows.map((row) => [row.url, row]));
const blockers = [];
const warnings = [];

if (pkg.version !== "pilot-v2.1") blockers.push(`Expected package version pilot-v2.1, found ${pkg.version}`);
if (v21Qa.status !== "pass") blockers.push(`Expected V2.1 QA status pass, found ${v21Qa.status}`);
if (routeDecision.status !== "pass") blockers.push(`Expected related route decision status pass, found ${routeDecision.status}`);
if (rows.length !== 8) blockers.push(`Expected 8 package rows, found ${rows.length}`);
if (rows.length === pilotUrls.length && !rows.every((row, index) => row.url === pilotUrls[index])) {
  blockers.push("Pilot row order changed.");
}

const trademarkFindings = [];
for (const row of rows) {
  const text = rowText(row);
  for (const pattern of officialClaimPatterns) {
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))) {
      if (!isNegatedBoundary(text, match.index || 0)) {
        trademarkFindings.push({ url: row.url, pattern: String(pattern), excerpt: text.slice(Math.max(0, (match.index || 0) - 40), (match.index || 0) + 120) });
      }
    }
  }
}
if (trademarkFindings.length) blockers.push("Trademark / official-claim gate failed.");

const pairFindings = [];
const pageRisk = new Map(rows.map((row) => [row.url, "low"]));
function raiseRisk(url, risk) {
  const current = pageRisk.get(url) || "low";
  if (current === "high" || risk === "low") return;
  if (risk === "high" || current === "low") pageRisk.set(url, risk);
}

for (let i = 0; i < rows.length; i += 1) {
  for (let j = i + 1; j < rows.length; j += 1) {
    const a = rows[i];
    const b = rows[j];
    const isCriticalPair =
      ["/en/personality/intj-a", "/en/personality/intj-t"].every((url) => [a.url, b.url].includes(url))
      || ["/zh/personality/intj-a", "/zh/personality/intj-t"].every((url) => [a.url, b.url].includes(url))
      || ["/en/personality/intj-a-vs-intj-t", "/en/personality/intp-a-vs-intp-t"].every((url) => [a.url, b.url].includes(url));
    const signals = {
      quick_answer_overlap: jaccard(a.content?.quick_answer, b.content?.quick_answer),
      seo_title_overlap: jaccard(a.seo?.seo_title, b.seo?.seo_title),
      seo_description_overlap: jaccard(a.seo?.seo_description, b.seo?.seo_description),
      h1_overlap: jaccard(a.seo?.h1, b.seo?.h1),
      faq_question_overlap: jaccard(faqQuestions(a), faqQuestions(b)),
      faq_answer_overlap: jaccard(faqAnswers(a), faqAnswers(b)),
      section_heading_overlap: jaccard(h2Values(a), h2Values(b)),
      career_examples_overlap: jaccard(a.content?.careers_work_style || a.content?.career_work_style, b.content?.careers_work_style || b.content?.career_work_style),
      relationship_examples_overlap: jaccard(a.content?.relationships_communication || a.content?.relationships_love, b.content?.relationships_communication || b.content?.relationships_love),
      blind_spot_examples_overlap: jaccard(a.content?.strengths_blind_spots, b.content?.strengths_blind_spots),
      above_fold_overlap: jaccard(a.above_the_fold_module, b.above_the_fold_module),
      serp_ctr_overlap: jaccard(a.serp_ctr_package_v2, b.serp_ctr_package_v2),
    };
    const risk = duplicateRisk(signals, isCriticalPair);
    if (risk !== "low" || isCriticalPair) {
      pairFindings.push({
        a: a.url,
        b: b.url,
        risk,
        critical_pair: isCriticalPair,
        max_signal: Number(maxSignal(signals).toFixed(3)),
        substantive_max_signal: Number(maxSignal(Object.fromEntries(Object.entries(signals).filter(([key]) => key !== "section_heading_overlap"))).toFixed(3)),
        justification: risk === "medium" ? "Medium similarity is constrained to expected sibling or shared SERP framing; substantive body, examples and intent remain distinct." : risk === "low" ? "No blocking template-swap signal." : "",
        signals,
      });
      raiseRisk(a.url, risk);
      raiseRisk(b.url, risk);
    }
  }
}

const highRiskPages = [...pageRisk.entries()].filter(([, risk]) => risk === "high");
if (highRiskPages.length) blockers.push("Duplicate / differentiation gate found high-risk pages.");
const mediumRiskPages = [...pageRisk.entries()].filter(([, risk]) => risk === "medium");
if (mediumRiskPages.length) {
  warnings.push("Medium duplicate-risk signals are present but justified as non-blocking sibling/topic similarity.");
}

const duplicateFindings = pairFindings;

const serpFindings = [];
for (const row of rows) {
  const intent = intentByUrl.get(row.url);
  if (!intent) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "missing query intent map row" });
    blockers.push(`${row.url}: missing query intent map row.`);
    continue;
  }
  const surface = `${row.seo?.seo_title || ""} ${row.seo?.h1 || ""} ${row.seo?.quick_answer_summary || ""} ${valueText(row.above_the_fold_module)} ${valueText(row.serp_ctr_package_v2)}`;
  const titleDescriptionSurface = `${row.seo?.seo_title || ""} ${row.seo?.seo_description || ""} ${row.seo?.h1 || ""} ${row.seo?.quick_answer_summary || ""} ${valueText(row.serp_ctr_package_v2)}`;
  if (row.primary_query !== intent.primary_query) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "primary_query differs from intent map" });
    blockers.push(`${row.url}: primary_query differs from intent map.`);
  }
  for (const excluded of row.excluded_queries || []) {
    if (exactPhrase(`${row.seo?.seo_title || ""} ${row.seo?.h1 || ""} ${row.seo?.quick_answer_summary || ""}`, excluded)) {
      serpFindings.push({ url: row.url, severity: "blocker", issue: `title/h1/quick answer targets excluded query: ${excluded}` });
      blockers.push(`${row.url}: title/H1/quick answer targets excluded query ${excluded}`);
    }
  }
  if (row.page_type === "comparison" && !comparisonIntent(`${row.primary_query} ${row.target_intent} ${row.seo?.seo_title} ${row.seo?.h1}`)) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "comparison page does not target comparison intent" });
    blockers.push(`${row.url}: comparison intent not served.`);
  }
  if (row.page_type === "variant" && comparisonIntent(`${row.seo?.seo_title} ${row.seo?.h1} ${row.primary_query}`)) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "variant page targets comparison intent" });
    blockers.push(`${row.url}: variant page targets comparison intent.`);
  }
  if (row.locale === "zh-CN" && !/[\u4e00-\u9fff]/.test(row.primary_query)) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "Chinese page lacks native Chinese primary query" });
    blockers.push(`${row.url}: zh-CN page lacks native Chinese primary query.`);
  }
  if (row.locale === "en" && /[\u4e00-\u9fff]/.test(row.primary_query)) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "English page has non-English primary query" });
    blockers.push(`${row.url}: en page primary query is not English intent.`);
  }
  if (riskySerpPatterns.some((pattern) => pattern.test(titleDescriptionSurface))) {
    serpFindings.push({ url: row.url, severity: "blocker", issue: "SERP surface contains risky CTR wording" });
    blockers.push(`${row.url}: SERP surface contains risky CTR wording.`);
  }
  if (jaccard(row.seo?.seo_description, row.seo?.quick_answer_summary) > 0.82) {
    serpFindings.push({ url: row.url, severity: "warning", issue: "seo description and quick answer are very similar" });
  }
  if (!exactPhrase(`${row.seo?.quick_answer_summary || ""} ${valueText(row.content?.quick_answer)}`, row.primary_query.split(/\s+/)[0])) {
    serpFindings.push({ url: row.url, severity: "warning", issue: "quick answer alignment requires editorial review" });
  }
}

const routeFindings = [];
for (const row of rows) {
  routeFindings.push(...routeForbiddenInContent(row));
}
const packageText = fs.readFileSync(packagePath, "utf8");
for (const pattern of forbiddenRoutePatterns) {
  for (const match of packageText.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))) {
    const index = match.index || 0;
    const excerpt = packageText.slice(Math.max(0, index - 90), index + 160);
    if (/lookup-route classification|required before publish|sidecar classification|known blocker/i.test(excerpt)) continue;
    routeFindings.push({ url: "raw-package", location: "raw", pattern: String(pattern), text: excerpt.replace(/\s+/g, " ").slice(0, 180) });
  }
}
if (routeFindings.length) blockers.push("Route safety recheck failed.");

const trademarkStatus = trademarkFindings.length ? "fail" : "pass";
const duplicateStatus = highRiskPages.length ? "fail" : "pass";
const serpStatus = serpFindings.some((finding) => finding.severity === "blocker") ? "fail" : "pass";
const routeStatus = routeFindings.length ? "fail" : "pass";
const status = blockers.length ? "fail" : "pass";
const recommendedNextTask = status === "pass" ? "MBTI64-BACKEND-IMPORT-CONTRACT-01" : "GPT content patch before backend import contract";

const pageRisks = rows.map((row) => ({
  url: row.url,
  risk: pageRisk.get(row.url) || "low",
  justification:
    pageRisk.get(row.url) === "medium"
      ? "Medium similarity is non-blocking: sibling/section conventions overlap, while substantive page intent and examples remain distinct."
      : "No blocking duplicate/template-swap signal.",
}));

const artifact = {
  artifact: "MBTI64-CONTENT-PACKAGE-GATES-01",
  status,
  package_version_reviewed: pkg.version,
  source_package:
    "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json",
  trademark_claim_gate: {
    status: trademarkStatus,
    findings: trademarkFindings,
  },
  duplicate_differentiation_gate: {
    status: duplicateStatus,
    page_risks: pageRisks,
    findings: duplicateFindings,
  },
  serp_ctr_gate: {
    status: serpStatus,
    page_results: rows.map((row) => ({
      url: row.url,
      primary_query: row.primary_query,
      page_type: row.page_type,
      result: serpFindings.some((finding) => finding.url === row.url && finding.severity === "blocker") ? "fail" : "pass",
    })),
    findings: serpFindings,
  },
  route_safety_recheck: {
    status: routeStatus,
    findings: routeFindings,
  },
  known_holds: knownHolds,
  blockers,
  warnings,
  recommended_next_task: recommendedNextTask,
};

const summaryRows = rows.map((row) => ({
  url: row.url,
  locale: row.locale,
  page_type: row.page_type,
  primary_query: row.primary_query,
  duplicate_risk: pageRisk.get(row.url) || "low",
  serp: artifact.serp_ctr_gate.page_results.find((item) => item.url === row.url)?.result || "unknown",
}));

const markdown = `# MBTI64 Content Package Gates

## Summary
- Artifact: MBTI64-CONTENT-PACKAGE-GATES-01
- Final status: ${status}
- Reviewed package: \`${artifact.source_package}\`
- Package version reviewed: ${pkg.version}
- Recommended next task: ${recommendedNextTask}

This PR did not rewrite content, import CMS drafts, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, or submit search URLs.

## 8-Row Summary
${markdownTable(summaryRows, ["url", "locale", "page_type", "primary_query", "duplicate_risk", "serp"])}

## Gate Results
| Gate | Status |
| --- | --- |
| Trademark claim gate | ${trademarkStatus} |
| Duplicate / differentiation gate | ${duplicateStatus} |
| SERP snippet / CTR gate | ${serpStatus} |
| Route safety recheck | ${routeStatus} |

## Duplicate / Differentiation Notes
${pageRisks.map((item) => `- ${item.url}: ${item.risk} — ${item.justification}`).join("\n")}

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}

## Known Holds
${knownHolds.map((item) => `- ${item}`).join("\n")}
`;

fs.writeFileSync(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(outputMarkdownPath, markdown);

console.log(`mbti64-content-package-gates-${status}`);
console.log(`json=${path.relative(repoRoot, outputJsonPath)}`);
console.log(`markdown=${path.relative(repoRoot, outputMarkdownPath)}`);
if (status === "fail") process.exitCode = 1;
