#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const auditDate = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
const outputJsonPath = path.join(
  repoRoot,
  `docs/seo/personality/related-test-route-scope-decision-${auditDate}.json`,
);
const outputMarkdownPath = path.join(
  repoRoot,
  `docs/seo/personality/related-test-route-scope-decision-${auditDate}.md`,
);

const requiredInputs = [
  "docs/seo/personality/content-package-v2-qa-2026-06-18.json",
  "docs/seo/personality/content-package-v2-qa-2026-06-18.md",
  "docs/seo/personality/content-packages/pilot-v2/mbti64-content-package-pilot-v2-final/mbti64-content-package-pilot-v2.json",
  "docs/seo/personality/query-intent-map-pilot-v1.json",
];

const mergeCommits = {
  "#1183": "9f3522f4f073fabb47bf77d9fb277652d972f7ec",
  "#1186": "be5daee3b818fd55b9ebbd6e1c684f26039773a8",
};

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

const searchRoots = [
  "app",
  "components",
  "lib",
  "docs",
  "scripts",
  "tests",
  "public",
];

const routeRegex = /\/(?:en|zh)?\/?tests\/[a-z0-9-]*(?:big-five|ocean|five-factor|riasec|holland|career-interest|career-test|vocational-interest)[a-z0-9-]*(?:\/take)?/gi;
const quotedRouteRegex = /["'`]((?:\/(?:en|zh))?\/tests\/[^"'`\s<>)]+)["'`]/gi;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function walkFiles(dir) {
  const fullDir = path.join(repoRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = path.join(fullDir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(path.relative(repoRoot, full)));
    if (entry.isFile()) out.push(path.relative(repoRoot, full));
  }
  return out;
}

function textFile(relativePath) {
  try {
    const stat = fs.statSync(path.join(repoRoot, relativePath));
    if (stat.size > 2_500_000) return false;
    if (/docs\/seo\/personality\/related-test-route-scope-decision-\d{4}-\d{2}-\d{2}\.(json|md)$/.test(relativePath)) {
      return false;
    }
    return /\.(mjs|cjs|js|jsx|ts|tsx|json|md|mdx|csv|txt|xml|yaml|yml|html)$/i.test(relativePath);
  } catch {
    return false;
  }
}

function normalizeRoute(route) {
  let normalized = route.trim().replace(/^https?:\/\/[^/]+/i, "");
  normalized = normalized.split("|")[0];
  normalized = normalized.replace(/\/+$/, "");
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  return normalized;
}

function routeType(route) {
  if (/big-five|ocean|five-factor/i.test(route)) return "big_five";
  if (/riasec/i.test(route)) return "riasec";
  if (/holland/i.test(route)) return "holland";
  if (/career-interest|career-test|vocational-interest/i.test(route)) return "career";
  return "unknown";
}

function localeForRoute(route) {
  if (route.startsWith("/zh/")) return "zh";
  if (route.startsWith("/en/")) return "en";
  return "unknown";
}

function isForbidden(route) {
  return forbiddenPatterns.some((pattern) => pattern.test(route));
}

function includesExactRoute(fileText, route) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\/$/, "");
  const regex = new RegExp(`(?:https?:\\/\\/[^\\s<>'"]+)?${escaped}(?:\\/)?(?=$|[\\s<>'"?#)])`, "i");
  return regex.test(fileText);
}

function evidenceForRoute(route, files) {
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(repoRoot, file), "utf8");
    if (includesExactRoute(text, route)) hits.push(file);
  }
  return hits;
}

function routeAppearsIn(files, route, filter) {
  return files.filter(filter).some((file) => {
    const text = fs.readFileSync(path.join(repoRoot, file), "utf8");
    return includesExactRoute(text, route);
  });
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function safeForRelatedTest(candidate) {
  if (candidate.forbidden_pattern_seen === "yes") return "no";
  if (candidate.locale !== "en" && candidate.locale !== "zh") return "unknown";
  if (candidate.appears_public !== "yes") return "unknown";
  if (candidate.appears_test_route !== "yes") return "unknown";
  if (!["big_five", "riasec", "holland"].includes(candidate.route_type)) return "unknown";
  if (!/^\/(?:en|zh)\/tests\/[a-z0-9-]+$/.test(candidate.route)) return "unknown";
  if (candidate.appears_in_sitemap !== "yes") return "unknown";
  return "yes";
}

function markdownTable(rows, fields) {
  if (!rows.length) return "_None_";
  return [
    `| ${fields.join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`),
  ].join("\n");
}

for (const input of requiredInputs) {
  if (!fs.existsSync(path.join(repoRoot, input))) {
    throw new Error(`Required input missing: ${input}`);
  }
}

const v2Qa = readJson("docs/seo/personality/content-package-v2-qa-2026-06-18.json");
readJson("docs/seo/personality/query-intent-map-pilot-v1.json");
readJson("docs/seo/personality/content-packages/pilot-v2/mbti64-content-package-pilot-v2-final/mbti64-content-package-pilot-v2.json");

const files = searchRoots.flatMap(walkFiles).filter(textFile);
const routeHits = new Map();

for (const file of files) {
  const text = fs.readFileSync(path.join(repoRoot, file), "utf8");
  const matches = [...text.matchAll(routeRegex)].map((match) => match[0]);
  for (const match of text.matchAll(quotedRouteRegex)) {
    const route = match[1];
    if (/(big-five|ocean|five-factor|riasec|holland|career-interest|career-test|vocational-interest)/i.test(route)) {
      matches.push(route);
    }
  }
  for (const match of matches) {
    const normalized = normalizeRoute(match);
    if (!routeHits.has(normalized)) routeHits.set(normalized, new Set());
    routeHits.get(normalized).add(file);
  }
}

const allRouteFiles = files.filter((file) => {
  const lower = file.toLowerCase();
  return lower.includes("sitemap") || lower.includes("llms") || lower.includes("route") || lower.includes("test") || lower.includes("graph") || lower.includes("authority") || lower.includes("registry") || lower.includes("config") || lower.includes("nav") || lower.includes("i18n");
});

const candidates = [...routeHits.entries()]
  .map(([route, hitFiles]) => {
    const evidenceFiles = [...new Set([...hitFiles, ...evidenceForRoute(route, allRouteFiles)])].sort();
    const locale = localeForRoute(route);
    const type = routeType(route);
    const appearsPublic = route.startsWith("/en/tests/") || route.startsWith("/zh/tests/") || route.startsWith("/tests/");
    const appearsTestRoute = /\/tests\//.test(route);
    const inSitemap = routeAppearsIn(
      files,
      route,
      (file) => file === "public/sitemap.xml" || file === "lib/seo/sitemapAuthorityAdapters.cjs",
    );
    const inLlms = routeAppearsIn(files, route, (file) => /(?:^|\/)(?:llms|.*llms.*)\b/i.test(file));
    const forbidden = isForbidden(route);
    const appearsIndexable = inSitemap ? "yes" : "unknown";
    const candidate = {
      route,
      locale,
      route_type: type,
      evidence_files: evidenceFiles,
      appears_public: yesNo(appearsPublic),
      appears_test_route: yesNo(appearsTestRoute),
      appears_indexable: appearsIndexable,
      appears_in_sitemap: yesNo(inSitemap),
      appears_in_llms: inLlms ? "yes" : "unknown",
      forbidden_pattern_seen: yesNo(forbidden),
      safe_for_related_test_link: "unknown",
      notes: "",
    };
    candidate.safe_for_related_test_link = safeForRelatedTest(candidate);
    if (candidate.safe_for_related_test_link === "yes") {
      candidate.notes = "Verified from repository source as public test route; no forbidden pattern detected.";
    } else if (candidate.forbidden_pattern_seen === "yes") {
      candidate.notes = "Unsafe: forbidden route pattern detected.";
    } else {
      candidate.notes = "Not enough repository evidence for safe related_test use.";
    }
    return candidate;
  })
  .filter((candidate) => candidate.locale === "en" || candidate.locale === "zh" || candidate.route.startsWith("/tests/"))
  .sort((a, b) => a.route.localeCompare(b.route));

const safeRoutes = candidates.filter((candidate) => candidate.safe_for_related_test_link === "yes");
const safeByLocale = {
  en: safeRoutes.filter((candidate) => candidate.locale === "en").map((candidate) => candidate.route),
  zh: safeRoutes.filter((candidate) => candidate.locale === "zh").map((candidate) => candidate.route),
};
const blockers = [];
const warnings = [];

if (v2Qa.status !== "conditional") {
  warnings.push(`Expected V2 QA status conditional, found ${v2Qa.status}`);
}

const hasSafeEn = safeByLocale.en.some((route) => /(big-five|ocean|riasec|holland)/i.test(route));
const hasSafeZh = safeByLocale.zh.some((route) => /(big-five|ocean|riasec|holland)/i.test(route));
const unsafeCandidates = candidates.filter((candidate) => candidate.forbidden_pattern_seen === "yes");
if (unsafeCandidates.length > 0) {
  warnings.push("Forbidden-pattern route examples were found in tests/docs and classified unsafe; they are not safe related_test landing routes.");
}

const status = blockers.length > 0 ? "fail" : hasSafeEn && hasSafeZh ? "pass" : candidates.length > 0 ? "conditional" : "fail";
if (status === "fail" && candidates.length === 0) {
  blockers.push("No plausible Big Five / RIASEC / Holland related test route exists in repository evidence.");
}
if (status === "conditional") {
  warnings.push("Safe related_test route coverage is partial or uncertain; operator decision is required.");
}

let recommendedResolution = "";
let recommendedNextTask = "";
if (status === "pass") {
  recommendedResolution = "Use verified safe public related_test routes in a V2.1 content package patch.";
  recommendedNextTask = "MBTI64-CONTENT-PACKAGE-V2.1-RELATED-TEST-LINK-PATCH-01-GPT55";
} else if (status === "conditional") {
  recommendedResolution =
    "Operator must either accept V2 narrower internal-link scope for pilot, or request a V2.1 patch after safe routes are confirmed.";
  recommendedNextTask = "OPERATOR-ACCEPT-MBTI64-V2-NARROW-INTERNAL-LINK-SCOPE-01 or route confirmation.";
} else {
  recommendedResolution =
    "Do not patch content package. Keep V2 conditional and block CMS import until related test route policy is resolved.";
  recommendedNextTask = "MBTI64-RELATED-TEST-ROUTE-POLICY-REPAIR-01";
}

const artifact = {
  artifact: "MBTI64-RELATED-TEST-ROUTE-SCOPE-DECISION-01",
  status,
  source_pr: "#1186",
  source_merge_commits: mergeCommits,
  v2_qa_status: v2Qa.status,
  warning_under_review: "Big Five / RIASEC related_test links omitted",
  candidate_routes: candidates,
  safe_public_routes: safeByLocale,
  operator_decision_needed: status !== "pass",
  recommended_resolution: recommendedResolution,
  recommended_next_task: recommendedNextTask,
  blockers,
  warnings,
};

const blockedRoutes = candidates.filter((candidate) => candidate.safe_for_related_test_link !== "yes");
const safeTableRows = safeRoutes.map((candidate) => ({
  route: candidate.route,
  locale: candidate.locale,
  route_type: candidate.route_type,
  sitemap: candidate.appears_in_sitemap,
  llms: candidate.appears_in_llms,
}));
const candidateRows = candidates.map((candidate) => ({
  route: candidate.route,
  locale: candidate.locale,
  route_type: candidate.route_type,
  public: candidate.appears_public,
  test: candidate.appears_test_route,
  sitemap: candidate.appears_in_sitemap,
  llms: candidate.appears_in_llms,
  safe: candidate.safe_for_related_test_link,
}));
const blockedRows = blockedRoutes.map((candidate) => ({
  route: candidate.route,
  locale: candidate.locale,
  reason: candidate.notes,
}));

const markdown = `# MBTI64 Related Test Route Scope Decision

## Summary
- Artifact: MBTI64-RELATED-TEST-ROUTE-SCOPE-DECISION-01
- Source PR: #1186
- V2 QA status: ${v2Qa.status}
- Warning under review: Big Five / RIASEC related_test links omitted
- Final status: ${status}
- Operator decision needed: ${artifact.operator_decision_needed}
- Recommended resolution: ${recommendedResolution}
- Recommended next task: ${recommendedNextTask}

This PR did not import CMS drafts, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, or submit search URLs.

## Route Candidates
${markdownTable(candidateRows, ["route", "locale", "route_type", "public", "test", "sitemap", "llms", "safe"])}

## Safe Public Routes
${markdownTable(safeTableRows, ["route", "locale", "route_type", "sitemap", "llms"])}

## Blocked / Unsafe / Unknown Routes
${markdownTable(blockedRows, ["route", "locale", "reason"])}

## Decision
- V2.1 patch recommended: ${status === "pass" ? "yes" : "not until route scope is accepted or repaired"}
- Operator can accept narrower V2 internal-link scope: ${status === "pass" ? "not necessary; safe routes are verified" : "yes, if the operator accepts omitting Big Five/RIASEC related_test links for the pilot"}

## Evidence Notes
- Safe routes require repository evidence, public \`/en/tests/*\` or \`/zh/tests/*\` shape, no forbidden route pattern, and Big Five / RIASEC / Holland route type.
- Static \`llms.txt\` / \`llms-full.txt\` files are not committed in this repo snapshot. \`appears_in_llms\` is evidence-based and remains \`unknown\` unless exact route evidence appears in llms generator or llms artifact files.
- \`appears_in_sitemap\` is exact-route evidence from sitemap source or \`public/sitemap.xml\`.

## Blockers
${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings
${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}
`;

fs.writeFileSync(outputJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
fs.writeFileSync(outputMarkdownPath, markdown);

console.log(`related-test-route-scope-${status}`);
console.log(`safe_en=${safeByLocale.en.join(",") || "none"}`);
console.log(`safe_zh=${safeByLocale.zh.join(",") || "none"}`);
console.log(`json=${path.relative(repoRoot, outputJsonPath)}`);
console.log(`markdown=${path.relative(repoRoot, outputMarkdownPath)}`);
if (status === "fail") process.exitCode = 1;
