#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const auditDate = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const v2Path = path.join(
  repoRoot,
  "docs/seo/personality/content-packages/pilot-v2/mbti64-content-package-pilot-v2-final/mbti64-content-package-pilot-v2.json",
);
const v21Path = path.join(
  repoRoot,
  "docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json",
);
const routeDecisionPath = path.join(
  repoRoot,
  "docs/seo/personality/related-test-route-scope-decision-2026-06-18.json",
);
const outputJsonPath = path.join(
  repoRoot,
  `docs/seo/personality/content-package-v21-qa-${auditDate}.json`,
);
const outputMarkdownPath = path.join(
  repoRoot,
  `docs/seo/personality/content-package-v21-qa-${auditDate}.md`,
);

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
const forbiddenPatterns = [
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
const immutableRowFields = [
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
  "method_boundary",
  "trademark_boundary",
  "information_gain",
  "claim_risk_notes",
  "above_the_fold_module",
  "serp_ctr_package_v2",
  "status",
];
const allowedMutableRowFields = new Set([
  "internal_links",
  "route_safety",
  "qa_flags_for_codex",
  "v2_optimization",
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stable(value) {
  return JSON.stringify(value);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

function linkKey(link) {
  return `${link.role || ""}::${link.href || ""}::${link.anchor_text || ""}`;
}

function expectedRelatedRoutes(locale) {
  if (locale === "zh-CN") {
    return [
      "/zh/tests/big-five-personality-test-ocean-model",
      "/zh/tests/holland-career-interest-test-riasec",
    ];
  }
  return [
    "/en/tests/big-five-personality-test-ocean-model",
    "/en/tests/holland-career-interest-test-riasec",
  ];
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    if (entry.isFile()) out.push(full);
  }
  return out;
}

const blockers = [];
const warnings = [];
const v2 = readJson(v2Path);
const v21 = readJson(v21Path);
const routeDecision = readJson(routeDecisionPath);
const v2Rows = Array.isArray(v2.rows) ? v2.rows : [];
const v21Rows = Array.isArray(v21.rows) ? v21.rows : [];
const v2ByUrl = new Map(v2Rows.map((row) => [row.url, row]));

if (v21.version !== "pilot-v2.1") blockers.push(`Expected V2.1 version pilot-v2.1, found ${v21.version}`);
if (!/draft/i.test(String(v21.status || ""))) blockers.push(`Expected draft status, found ${v21.status}`);
if (v2Rows.length !== 8 || v21Rows.length !== 8) blockers.push(`Expected both V2 and V2.1 row count to be 8; got ${v2Rows.length}/${v21Rows.length}`);
const rowOrderUnchanged = v21Rows.length === pilotUrls.length && v21Rows.every((row, index) => row.url === pilotUrls[index]);
if (!rowOrderUnchanged) blockers.push("V2.1 row order changed.");
if (routeDecision.status !== "pass") blockers.push(`Expected related route decision status pass, found ${routeDecision.status}`);

const rowDiffs = [];
const relatedLinkResults = [];
const relatedRoutesByLocale = { en: routeDecision.safe_public_routes?.en || [], zh: routeDecision.safe_public_routes?.zh || [] };

for (const row of v21Rows) {
  const previous = v2ByUrl.get(row.url);
  if (!previous) {
    blockers.push(`V2.1 row not found in V2: ${row.url}`);
    continue;
  }
  for (const field of immutableRowFields) {
    if (stable(previous[field]) !== stable(row[field])) {
      rowDiffs.push({ url: row.url, field, status: "blocked" });
      blockers.push(`${row.url}: immutable field changed: ${field}`);
    }
  }
  const allFields = new Set([...Object.keys(previous), ...Object.keys(row)]);
  for (const field of allFields) {
    if (!immutableRowFields.includes(field) && !allowedMutableRowFields.has(field)) {
      if (stable(previous[field]) !== stable(row[field])) {
        rowDiffs.push({ url: row.url, field, status: "unexpected_mutable_field" });
        blockers.push(`${row.url}: unexpected mutable field changed: ${field}`);
      }
    }
  }

  const oldNonRelatedLinks = (previous.internal_links || []).filter((link) => link.role !== "related_test").map(linkKey).sort();
  const newNonRelatedLinks = (row.internal_links || []).filter((link) => link.role !== "related_test").map(linkKey).sort();
  if (stable(oldNonRelatedLinks) !== stable(newNonRelatedLinks)) {
    blockers.push(`${row.url}: non-related internal links changed.`);
  }

  const expectedRoutes = expectedRelatedRoutes(row.locale);
  const relatedLinks = (row.internal_links || []).filter((link) => link.role === "related_test");
  const relatedHrefs = relatedLinks.map((link) => link.href);
  const missingRoutes = expectedRoutes.filter((route) => !relatedHrefs.includes(route));
  const unsafeLinks = relatedLinks.filter((link) => link.safe_public_route !== true);
  const forbiddenLinks = relatedLinks.filter((link) => forbiddenPatterns.some((pattern) => pattern.test(link.href || "")));
  const routeDecisionMismatch = expectedRoutes.filter((route) => {
    const bucket = row.locale === "zh-CN" ? relatedRoutesByLocale.zh : relatedRoutesByLocale.en;
    return !bucket.includes(route);
  });
  if (missingRoutes.length) blockers.push(`${row.url}: missing related_test routes ${missingRoutes.join(", ")}`);
  if (unsafeLinks.length) blockers.push(`${row.url}: related_test link lacks safe_public_route=true`);
  if (forbiddenLinks.length) blockers.push(`${row.url}: forbidden related_test route detected`);
  if (routeDecisionMismatch.length) blockers.push(`${row.url}: expected related_test route not verified by #1188 artifact`);
  relatedLinkResults.push({
    url: row.url,
    locale: row.locale,
    related_test_hrefs: relatedHrefs,
    missing_routes: missingRoutes,
    unsafe_link_count: unsafeLinks.length,
    forbidden_link_count: forbiddenLinks.length,
  });

  const qaText = JSON.stringify(row.qa_flags_for_codex || []);
  const routeSafetyText = JSON.stringify(row.route_safety || {});
  if (/unknown Big Five|unknown RIASEC|not included until public canonical routes/i.test(`${qaText} ${routeSafetyText}`)) {
    blockers.push(`${row.url}: previous unknown Big Five/RIASEC route warning still present.`);
  }
}

const v21Files = walkFiles(path.dirname(v21Path));
const forbiddenRawMatches = [];
for (const file of v21Files) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (forbiddenPatterns.some((pattern) => pattern.test(line))) {
      forbiddenRawMatches.push({ file: relative(file), line: index + 1, text: line.trim().slice(0, 180) });
    }
  });
}
if (forbiddenRawMatches.length > 0) blockers.push("Forbidden raw route/token pattern found in V2.1 artifact.");

const previousWarningResolved = relatedLinkResults.every(
  (result) => result.missing_routes.length === 0 && result.unsafe_link_count === 0 && result.forbidden_link_count === 0,
) && blockers.every((blocker) => !/unknown Big Five|unknown RIASEC|not included until public canonical routes/i.test(blocker));

const status = blockers.length === 0 ? "pass" : "fail";
const recommendedNextTask = status === "pass" ? "MBTI64-CONTENT-PACKAGE-GATES-01" : "GPT V2.2 related_test link repair, not CMS import";

const artifact = {
  artifact: "MBTI64-CONTENT-PACKAGE-V2.1-QA-01",
  status,
  source_prs: ["#1186", "#1188"],
  v2_path: relative(v2Path),
  v21_path: relative(v21Path),
  row_count: v21Rows.length,
  row_order_unchanged: rowOrderUnchanged,
  previous_v2_warning_resolved: previousWarningResolved,
  immutable_fields_changed: rowDiffs.filter((diff) => diff.status === "blocked"),
  related_test_link_validation: relatedLinkResults,
  raw_forbidden_pattern_matches: forbiddenRawMatches,
  route_decision_status: routeDecision.status,
  safe_public_routes_source: routeDecision.safe_public_routes,
  allowed_change_summary: {
    version_status_metadata: true,
    related_test_additions: true,
    route_safety_updates: true,
    qa_flags_cleanup: true,
    v2_optimization_notes: true,
  },
  blockers,
  warnings,
  recommended_next_task: recommendedNextTask,
};

const rowTable = relatedLinkResults
  .map((row) => `| ${row.url} | ${row.locale} | ${row.related_test_hrefs.join("<br>")} | ${row.missing_routes.length} | ${row.unsafe_link_count} |`)
  .join("\n");
const markdown = `# MBTI64 Content Package V2.1 QA

## Summary
- Artifact: MBTI64-CONTENT-PACKAGE-V2.1-QA-01
- Final status: ${status}
- V2.1 version: ${v21.version}
- V2.1 rows: ${v21Rows.length}
- Row order unchanged: ${rowOrderUnchanged}
- Previous V2 warning resolved: ${previousWarningResolved}
- Recommended next task: ${recommendedNextTask}

This PR did not import CMS drafts, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, or submit search URLs.

## Related Test Link Validation
| URL | Locale | Related test hrefs | Missing expected routes | Unsafe link count |
| --- | --- | --- | --- | --- |
${rowTable}

## Immutable Content Comparison
- Immutable row fields checked: ${immutableRowFields.join(", ")}
- Immutable field changes: ${artifact.immutable_fields_changed.length}
- Non-related internal links changed: ${blockers.filter((item) => item.includes("non-related internal links")).length}

## Raw Forbidden Pattern Scan
- Matches: ${forbiddenRawMatches.length}

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}
`;

fs.writeFileSync(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(outputMarkdownPath, markdown);

console.log(`mbti64-content-package-v21-qa-${status}`);
console.log(`previous_warning_resolved=${previousWarningResolved}`);
console.log(`json=${relative(outputJsonPath)}`);
console.log(`markdown=${relative(outputMarkdownPath)}`);
if (status === "fail") process.exitCode = 1;
