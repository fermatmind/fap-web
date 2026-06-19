#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REQUIRED_COMPONENTS = [
  "impression_potential",
  "ctr_gap",
  "position_gap",
  "business_priority",
  "evidence_confidence",
  "implementation_risk",
];
const ALLOWED_STATUS = new Set(["READY_FOR_REVIEW", "NEEDS_MORE_EVIDENCE", "HOLD", "BLOCKED"]);
const ALLOWED_LANES = new Set([
  "DOCS_ONLY_PR",
  "RUNTIME_QA_READONLY",
  "OPPORTUNITY_QUEUE_READONLY",
  "CMS_DRAFT_PACKAGE_DRY_RUN",
  "SEARCH_READINESS_REPORT",
  "BLOCKED_MUTATION",
]);
const UNVERIFIED_SOURCE_CLASSES = new Set([
  "UNKNOWN",
  "ACCESS_REQUIRED",
  "NEEDS_OPERATOR_CONFIRMATION",
  "GSC_FIXTURE",
  "GSC_MOCK",
  "GSC_STALE",
  "INFERRED_ANALYTICS",
]);
const UNVERIFIED_LABELS = new Set([
  "UNKNOWN",
  "ACCESS_REQUIRED",
  "NEEDS_OPERATOR_CONFIRMATION",
  "NOT_VERIFIED",
  "STALE",
  "FIXTURE",
  "MOCK",
]);

function printHelp() {
  console.log(`Usage: node scripts/seo/check-seo-opportunity-queue-contract.mjs <queue-contract.json>

Validates the read-only FermatMind SEO opportunity queue contract. This checker
does not generate a queue and performs no CMS, Search Channel, provider,
runtime, network, sitemap, robots, schema, hreflang, or automation TOML writes.
`);
}

function readArgs(argv) {
  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const contractPath = argv.find((arg) => !arg.startsWith("--")) || "";
  if (!contractPath) {
    throw new Error("Contract path is required.");
  }
  return { contractPath };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function numeric(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function hasBoundary(value, pattern) {
  return pattern.test(JSON.stringify(value || []));
}

function collectIssues(contract) {
  const issues = [];

  if (contract.schema_version !== "fermatmind.seo_agent.opportunity_queue_contract.v1") {
    issues.push("schema_version must be fermatmind.seo_agent.opportunity_queue_contract.v1");
  }
  if (contract.mode !== "contract_only") {
    issues.push("mode must be contract_only");
  }
  if (contract.source_gate?.requires_gsc_quality_gate !== true) {
    issues.push("source_gate.requires_gsc_quality_gate must be true");
  }
  if (contract.source_gate?.allows_fixture_or_mock_gsc !== false) {
    issues.push("source_gate.allows_fixture_or_mock_gsc must be false");
  }
  if (contract.source_gate?.allows_stale_gsc !== false) {
    issues.push("source_gate.allows_stale_gsc must be false");
  }

  const componentSet = new Set(asArray(contract.scoring_components));
  for (const component of REQUIRED_COMPONENTS) {
    if (!componentSet.has(component)) {
      issues.push(`missing scoring component: ${component}`);
    }
  }

  if (!hasBoundary(contract.forbidden_actions, /CMS/i)) {
    issues.push("forbidden_actions must include CMS mutation boundary");
  }
  if (!hasBoundary(contract.forbidden_actions, /Search|provider|Google|Baidu|IndexNow/i)) {
    issues.push("forbidden_actions must include search-provider boundary");
  }
  if (!hasBoundary(contract.forbidden_actions, /sitemap|robots|llms|schema|hreflang|canonical|noindex|redirect|runtime SEO/i)) {
    issues.push("forbidden_actions must include runtime SEO mutation boundary");
  }
  if (!hasBoundary(contract.approval_boundaries, /AUTHORIZE_CMS_MUTATION/)) {
    issues.push("approval_boundaries must include AUTHORIZE_CMS_MUTATION");
  }
  if (!hasBoundary(contract.approval_boundaries, /AUTHORIZE_SEARCH_PROVIDER_SUBMISSION/)) {
    issues.push("approval_boundaries must include AUTHORIZE_SEARCH_PROVIDER_SUBMISSION");
  }

  for (const opportunity of asArray(contract.opportunities)) {
    const id = opportunity?.id || "<missing>";
    if (!opportunity?.url || !opportunity?.locale || !opportunity?.page_type) {
      issues.push(`opportunity missing url/locale/page_type: ${id}`);
    }
    if (!opportunity?.query_cluster?.primary_query) {
      issues.push(`opportunity missing primary query cluster: ${id}`);
    }
    if (!ALLOWED_STATUS.has(opportunity?.status)) {
      issues.push(`opportunity has invalid status: ${id}`);
    }
    if (!ALLOWED_LANES.has(opportunity?.recommended_lane)) {
      issues.push(`opportunity has invalid recommended_lane: ${id}`);
    }

    const sources = asArray(opportunity?.evidence_sources);
    if (sources.length === 0) {
      issues.push(`opportunity must include evidence_sources: ${id}`);
    }
    const hasUnverifiedSource = sources.some((source) =>
      UNVERIFIED_SOURCE_CLASSES.has(source?.source_class) || UNVERIFIED_LABELS.has(source?.evidence_label)
    );
    if (hasUnverifiedSource && !["HOLD", "BLOCKED", "NEEDS_MORE_EVIDENCE"].includes(opportunity?.status)) {
      issues.push(`unverified evidence cannot produce review-ready opportunity: ${id}`);
    }

    const scoringInputs = opportunity?.scoring_inputs || {};
    let expectedScore = 0;
    for (const component of REQUIRED_COMPONENTS) {
      const value = scoringInputs[component];
      if (!numeric(value)) {
        issues.push(`scoring input must be numeric for ${component}: ${id}`);
      } else {
        expectedScore += value;
      }
    }
    if (numeric(scoringInputs.implementation_risk) && scoringInputs.implementation_risk > 0) {
      issues.push(`implementation_risk must be zero or negative: ${id}`);
    }
    if (!numeric(opportunity?.score) || opportunity.score !== expectedScore) {
      issues.push(`score must equal sum of scoring_inputs (${expectedScore}): ${id}`);
    }
    if (!hasBoundary(opportunity?.blocked_actions, /AUTHORIZE_CMS_MUTATION/)) {
      issues.push(`blocked_actions must preserve CMS approval boundary: ${id}`);
    }
    if (!hasBoundary(opportunity?.blocked_actions, /AUTHORIZE_SEARCH_PROVIDER_SUBMISSION/)) {
      issues.push(`blocked_actions must preserve search-provider approval boundary: ${id}`);
    }
  }

  return issues;
}

function main() {
  const args = readArgs(process.argv.slice(2));
  const contractPath = path.resolve(args.contractPath);
  const contract = readJson(contractPath);
  const issues = collectIssues(contract);
  const report = {
    schema_version: 1,
    runner: "check-seo-opportunity-queue-contract",
    contract_path: path.relative(process.cwd(), contractPath),
    passed: issues.length === 0,
    issues,
    boundaries: {
      queue_generated: false,
      cms_or_search_writes_attempted: false,
      provider_calls_attempted: false,
      runtime_seo_changes_attempted: false,
      network_calls_attempted: false,
    },
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) {
    process.exitCode = 1;
  }
}

main();

