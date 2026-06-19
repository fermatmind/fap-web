#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ALLOWED_LANES = new Set([
  "DOCS_ONLY_PR",
  "RUNTIME_QA_READONLY",
  "OPS_READMODEL_BRIDGE",
  "GSC_DATA_QUALITY_READONLY",
  "OPPORTUNITY_QUEUE_READONLY",
  "CMS_DRAFT_PACKAGE_DRY_RUN",
  "SEARCH_READINESS_REPORT",
  "BLOCKED_MUTATION",
]);

const REVIEW_VERDICTS = new Set(["REVIEW_PASS_NON_EXECUTING", "NEEDS_MORE_EVIDENCE", "BLOCKED"]);
const ACTION_RECOMMENDATIONS = new Set(["do_now", "do_next", "hold", "block"]);
const CLAIM_SEVERITIES = new Set(["low", "medium", "high", "blocked"]);
const SENSITIVE_LANES = new Set(["CMS_DRAFT_PACKAGE_DRY_RUN", "SEARCH_READINESS_REPORT", "BLOCKED_MUTATION"]);
const MUTATION_PATTERNS = [
  /cms\s+(save|publish|import|write|mutat)/i,
  /search[-\s]?provider\s+(submit|submission)/i,
  /request\s+indexing/i,
  /baidu|indexnow/i,
  /schema|hreflang|indexability/i,
];

function printHelp() {
  console.log(`Usage: node scripts/seo/check-seo-agent-gpt55-handoff.mjs <review.json> --packet <control-packet.json>

Validates that GPT 5.5 Pro review output is evidence-bound and non-executing.
The checker performs no CMS, Search Channel, provider, runtime, or network action.
`);
}

function readArgs(argv) {
  const args = { reviewPath: "", packetPath: "" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--packet") {
      args.packetPath = argv[++index] || "";
      continue;
    }
    if (!args.reviewPath && !arg.startsWith("--")) {
      args.reviewPath = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.reviewPath || !args.packetPath) {
    throw new Error("Both <review.json> and --packet <control-packet.json> are required.");
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasMutationLanguage(value) {
  return MUTATION_PATTERNS.some((pattern) => pattern.test(String(value || "")));
}

function packetEvidenceMap(packet) {
  const evidence = new Map();
  for (const item of asArray(packet.evidence_items)) {
    if (typeof item?.id === "string") {
      evidence.set(item.id, item);
    }
  }
  return evidence;
}

function packetActionMap(packet) {
  const actions = new Map();
  for (const item of asArray(packet.candidate_actions)) {
    if (typeof item?.id === "string") {
      actions.set(item.id, item);
    }
  }
  return actions;
}

function collectIssues(review, packet) {
  const issues = [];
  const evidenceById = packetEvidenceMap(packet);
  const actionsById = packetActionMap(packet);

  if (review.schema_version !== "fermatmind.seo_agent.gpt55_review_response.v1") {
    issues.push("schema_version must be fermatmind.seo_agent.gpt55_review_response.v1");
  }
  if (!REVIEW_VERDICTS.has(review.verdict)) {
    issues.push("verdict must be non-executing and schema-approved");
  }
  if (review.verdict === "GO_FOR_EXECUTION") {
    issues.push("GPT 5.5 Pro review must not approve execution");
  }
  if (!ALLOWED_LANES.has(review.recommended_lane)) {
    issues.push(`recommended_lane is not allowed: ${review.recommended_lane}`);
  }
  if (review.reviewed_control_packet_run_id !== packet.run_id) {
    issues.push("reviewed_control_packet_run_id must match the packet run_id");
  }

  const evidenceUsed = asArray(review.evidence_used);
  if (evidenceUsed.length === 0) {
    issues.push("evidence_used must include at least one packet evidence id");
  }

  const usedIds = new Set();
  for (const item of evidenceUsed) {
    const id = item?.evidence_id;
    usedIds.add(id);
    if (!evidenceById.has(id)) {
      issues.push(`evidence_used references unknown packet evidence_id: ${id || "<missing>"}`);
    }
    if (String(item?.source_class || "").includes("INFERRED") || /inferred analytics/i.test(String(item?.how_used || ""))) {
      issues.push(`evidence_used may not rely on inferred analytics: ${id || "<missing>"}`);
    }
  }

  for (const action of asArray(review.ranked_actions)) {
    if (!Number.isInteger(action?.rank) || action.rank < 1) {
      issues.push(`ranked action has invalid rank: ${action?.action_id || "<missing>"}`);
    }
    if (!actionsById.has(action?.action_id)) {
      issues.push(`ranked action references unknown packet action_id: ${action?.action_id || "<missing>"}`);
    }
    if (!ALLOWED_LANES.has(action?.lane)) {
      issues.push(`ranked action lane is not allowed: ${action?.lane || "<missing>"}`);
    }
    if (!ACTION_RECOMMENDATIONS.has(action?.recommendation)) {
      issues.push(`ranked action has invalid recommendation: ${action?.action_id || "<missing>"}`);
    }
    const actionEvidenceIds = asArray(action?.evidence_ids);
    if (actionEvidenceIds.length === 0) {
      issues.push(`ranked action must cite evidence_ids: ${action?.action_id || "<missing>"}`);
    }
    for (const evidenceId of actionEvidenceIds) {
      if (!evidenceById.has(evidenceId) || !usedIds.has(evidenceId)) {
        issues.push(`ranked action cites uncited or unknown evidence_id: ${evidenceId}`);
      }
    }
    if (SENSITIVE_LANES.has(action?.lane) && action?.recommendation === "do_now") {
      issues.push(`sensitive lane cannot be recommended as do_now by GPT review: ${action?.action_id || "<missing>"}`);
    }
  }

  const unknownSources = asArray(packet.source_summary).filter((source) =>
    ["UNKNOWN", "ACCESS_REQUIRED", "NEEDS_OPERATOR_CONFIRMATION"].includes(source?.source_class) ||
    ["UNKNOWN", "ACCESS_REQUIRED", "NEEDS_OPERATOR_CONFIRMATION", "NOT_VERIFIED"].includes(source?.evidence_label)
  );
  if (unknownSources.length > 0 && asArray(review.unsupported_assumptions).length === 0) {
    issues.push("packet has unverified sources, so unsupported_assumptions must explicitly list the gap");
  }

  for (const risk of asArray(review.claim_risks)) {
    if (!CLAIM_SEVERITIES.has(risk?.severity)) {
      issues.push(`claim risk has invalid severity: ${risk?.risk || "<missing>"}`);
    }
    if (risk?.severity === "blocked" && review.verdict !== "BLOCKED") {
      issues.push("blocked claim risk requires verdict BLOCKED");
    }
    if (risk?.severity === "high" && review.verdict === "REVIEW_PASS_NON_EXECUTING") {
      issues.push("high claim risk cannot have pass verdict");
    }
  }

  const approvals = asArray(review.approvals_required);
  const hasCmsApproval = approvals.some((approval) => /cms|human approval/i.test(`${approval?.approval || ""} ${approval?.why_required || ""}`));
  const hasSearchApproval = approvals.some((approval) => /search|provider|indexing|baidu|indexnow/i.test(`${approval?.approval || ""} ${approval?.why_required || ""}`));
  const packetRequiresCms = asArray(packet.blocked_actions).some((item) => /cms/i.test(`${item?.action || ""} ${item?.reason || ""}`));
  const packetRequiresSearch = asArray(packet.blocked_actions).some((item) => /gsc|search|baidu|indexnow|provider/i.test(`${item?.action || ""} ${item?.reason || ""}`));

  if (packetRequiresCms && !hasCmsApproval) {
    issues.push("review must preserve exact human approval boundary for CMS mutations");
  }
  if (packetRequiresSearch && !hasSearchApproval) {
    issues.push("review must preserve separate approval boundary for search-provider submissions");
  }

  const blockedText = JSON.stringify(review.blocked_items || []);
  if (packetRequiresCms && !/cms/i.test(blockedText)) {
    issues.push("blocked_items must include CMS mutation boundary");
  }
  if (packetRequiresSearch && !/search|gsc|baidu|indexnow|provider/i.test(blockedText)) {
    issues.push("blocked_items must include search-provider boundary");
  }

  const reviewText = JSON.stringify(review);
  if (hasMutationLanguage(reviewText) && !/not approve|cannot approve|separate approval|human approval|blocked|hold/i.test(reviewText)) {
    issues.push("mutation-sensitive language must be framed as blocked or requiring separate exact approval");
  }

  return issues;
}

function main() {
  const args = readArgs(process.argv.slice(2));
  const reviewPath = path.resolve(args.reviewPath);
  const packetPath = path.resolve(args.packetPath);
  const review = readJson(reviewPath);
  const packet = readJson(packetPath);
  const issues = collectIssues(review, packet);
  const report = {
    schema_version: 1,
    runner: "check-seo-agent-gpt55-handoff",
    review_path: path.relative(process.cwd(), reviewPath),
    packet_path: path.relative(process.cwd(), packetPath),
    passed: issues.length === 0,
    issues,
    boundaries: {
      cms_or_search_writes_attempted: false,
      provider_calls_attempted: false,
      network_calls_attempted: false,
      execution_authority_granted: false,
    },
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) {
    process.exitCode = 1;
  }
}

main();
