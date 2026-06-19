#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REQUIRED_BLOCKS = new Set([
  "human_weekly_summary",
  "CONTROL_PACKET_JSON",
  "GPT55_HANDOFF_PROMPT",
  "APPROVAL_MATRIX",
]);
const REQUIRED_WINDOWS = new Set(["D1", "D7", "D14", "D28"]);
const MUTATION_LANES = new Set(["CMS_DRAFT_PACKAGE_DRY_RUN", "SEARCH_READINESS_REPORT", "BLOCKED_MUTATION"]);

function printHelp() {
  console.log(`Usage: node scripts/seo/check-seo-agent-weekly-control-packet.mjs <packet.json>

Validates that a weekly FermatMind SEO automation output is a read-only SEO Agent
control packet with GPT handoff and approval boundaries. This checker performs
no CMS, Search Channel, provider, runtime, network, or automation TOML writes.
`);
}

function readArgs(argv) {
  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const packetPath = argv.find((arg) => !arg.startsWith("--")) || "";
  if (!packetPath) {
    throw new Error("Packet path is required.");
  }
  return { packetPath };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectIssues(packet) {
  const issues = [];

  if (packet.schema_version !== "fermatmind.seo_agent.control_packet.v1") {
    issues.push("schema_version must be fermatmind.seo_agent.control_packet.v1");
  }
  if (packet.run_type !== "weekly") {
    issues.push("weekly checker requires run_type=weekly");
  }
  if (packet.mode !== "read_only") {
    issues.push("weekly automation packet must remain mode=read_only");
  }

  const automation = packet.automation_context || {};
  if (automation.read_only !== true) {
    issues.push("automation_context.read_only must be true");
  }
  if (automation.automation_toml_change_allowed !== false) {
    issues.push("automation_context.automation_toml_change_allowed must be false");
  }
  if (!String(automation.post_merge_authorization || "").includes("separate")) {
    issues.push("automation_context must document separate post-merge authorization for automation config changes");
  }

  const outputBlocks = new Set(asArray(automation.required_output_blocks));
  for (const block of REQUIRED_BLOCKS) {
    if (!outputBlocks.has(block)) {
      issues.push(`missing required weekly output block: ${block}`);
    }
  }

  const windows = new Set(asArray(packet.observation_windows).map((window) => window?.window));
  for (const window of REQUIRED_WINDOWS) {
    if (!windows.has(window)) {
      issues.push(`missing observation window: ${window}`);
    }
  }

  if (packet.gpt55_handoff?.required !== true) {
    issues.push("gpt55_handoff.required must be true");
  }
  if (!/cannot approve/i.test(String(packet.gpt55_handoff?.authority_boundary || ""))) {
    issues.push("gpt55_handoff.authority_boundary must state GPT cannot approve execution");
  }

  const sourceSummary = asArray(packet.source_summary);
  if (sourceSummary.length === 0) {
    issues.push("source_summary must classify all weekly packet sources");
  }
  for (const source of sourceSummary) {
    if (!source?.source_class || !source?.evidence_label) {
      issues.push(`source_summary item is missing classification: ${source?.source_id || "<missing>"}`);
    }
  }

  const gscUnknown = packet.gsc_status?.source_class === "UNKNOWN" ||
    ["UNKNOWN", "NEEDS_OPERATOR_CONFIRMATION", "ACCESS_REQUIRED"].includes(packet.gsc_status?.evidence_label);
  if (gscUnknown && packet.gsc_status?.can_drive_actions !== false) {
    issues.push("unknown or unverified GSC status cannot drive actions");
  }

  for (const action of asArray(packet.candidate_actions)) {
    if (MUTATION_LANES.has(action?.lane) && action?.verdict === "GO") {
      issues.push(`mutation-sensitive candidate cannot be GO in weekly read-only packet: ${action?.id || "<missing>"}`);
    }
    if (action?.requires_approval === true && !["HOLD", "BLOCKED", "NEEDS_MORE_EVIDENCE"].includes(action?.verdict)) {
      issues.push(`approval-required candidate must remain hold/block/evidence-gated: ${action?.id || "<missing>"}`);
    }
  }

  const blockedText = JSON.stringify(packet.blocked_actions || []);
  if (!/CMS/i.test(blockedText)) {
    issues.push("blocked_actions must include CMS mutation boundary");
  }
  if (!/GSC|Baidu|IndexNow|provider|Search/i.test(blockedText)) {
    issues.push("blocked_actions must include search-provider boundary");
  }

  const approvalsText = JSON.stringify(packet.approvals_required || []);
  if (!approvalsText.includes("AUTHORIZE_CMS_MUTATION")) {
    issues.push("approvals_required must include AUTHORIZE_CMS_MUTATION exact phrase");
  }
  if (!approvalsText.includes("AUTHORIZE_SEARCH_PROVIDER_SUBMISSION")) {
    issues.push("approvals_required must include AUTHORIZE_SEARCH_PROVIDER_SUBMISSION exact phrase");
  }

  if (asArray(packet.recommended_prs).length === 0) {
    issues.push("weekly packet must include recommended_prs for Codex planning");
  }

  return issues;
}

function main() {
  const args = readArgs(process.argv.slice(2));
  const packetPath = path.resolve(args.packetPath);
  const packet = readJson(packetPath);
  const issues = collectIssues(packet);
  const report = {
    schema_version: 1,
    runner: "check-seo-agent-weekly-control-packet",
    packet_path: path.relative(process.cwd(), packetPath),
    passed: issues.length === 0,
    issues,
    boundaries: {
      automation_toml_modified: false,
      cms_or_search_writes_attempted: false,
      provider_calls_attempted: false,
      network_calls_attempted: false,
    },
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) {
    process.exitCode = 1;
  }
}

main();
