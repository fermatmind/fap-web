#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const CLAIM_VERDICTS = new Set(["APPROVED_FOR_DRY_RUN", "NEEDS_HUMAN_REVIEW", "BLOCKED_CLAIM"]);
const CLAIM_RISK_LEVELS = new Set(["low", "medium", "high", "blocked"]);

function printHelp() {
  console.log(`Usage: node scripts/seo/check-seo-cms-draft-package-contract.mjs <draft-package.json>

Validates the dry-run FermatMind SEO CMS draft package contract. This checker
performs no CMS, Search Channel, provider, runtime, network, media, sitemap,
robots, schema, hreflang, or indexability writes.
`);
}

function readArgs(argv) {
  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const packagePath = argv.find((arg) => !arg.startsWith("--")) || "";
  if (!packagePath) {
    throw new Error("Draft package path is required.");
  }
  return { packagePath };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasBoundary(value, pattern) {
  return pattern.test(JSON.stringify(value || []));
}

function collectIssues(draftPackage) {
  const issues = [];

  if (draftPackage.schema_version !== "fermatmind.seo_agent.cms_draft_package_contract.v1") {
    issues.push("schema_version must be fermatmind.seo_agent.cms_draft_package_contract.v1");
  }
  if (draftPackage.mode !== "dry_run_contract_only") {
    issues.push("mode must be dry_run_contract_only");
  }
  if (!draftPackage.target?.url || !draftPackage.target?.locale || !draftPackage.target?.content_type) {
    issues.push("target must include url, locale, and content_type");
  }
  if (asArray(draftPackage.source_opportunities).length === 0) {
    issues.push("source_opportunities must include at least one opportunity id");
  }
  if (asArray(draftPackage.evidence_references).length === 0) {
    issues.push("evidence_references must include at least one evidence item");
  }

  const draft = draftPackage.proposed_draft || {};
  if (!draft.seo_title || !draft.meta_description) {
    issues.push("proposed_draft must include seo_title and meta_description");
  }
  if (asArray(draft.body_blocks).length === 0) {
    issues.push("proposed_draft.body_blocks must include at least one block");
  }
  if (draft.media_policy?.local_public_asset_write_allowed !== false) {
    issues.push("media_policy.local_public_asset_write_allowed must be false");
  }
  if (draft.media_policy?.media_library_required !== true) {
    issues.push("media_policy.media_library_required must be true");
  }

  if (draftPackage.claim_gate?.protocol !== "CLAIM_GATE_PROTOCOL") {
    issues.push("claim_gate.protocol must be CLAIM_GATE_PROTOCOL");
  }
  const evidenceIds = new Set(asArray(draftPackage.evidence_references).map((item) => item?.evidence_id));
  const claims = asArray(draftPackage.claim_gate?.claims);
  if (claims.length === 0) {
    issues.push("claim_gate.claims must include at least one claim");
  }
  for (const claim of claims) {
    const claimId = claim?.claim_id || "<missing>";
    if (!claim?.text) {
      issues.push(`claim text is required: ${claimId}`);
    }
    if (!CLAIM_RISK_LEVELS.has(claim?.risk_level)) {
      issues.push(`claim risk_level is invalid: ${claimId}`);
    }
    if (!CLAIM_VERDICTS.has(claim?.verdict)) {
      issues.push(`claim verdict is invalid: ${claimId}`);
    }
    const claimEvidence = asArray(claim?.evidence_ids);
    if (claimEvidence.length === 0) {
      issues.push(`claim must cite evidence_ids: ${claimId}`);
    }
    for (const evidenceId of claimEvidence) {
      if (!evidenceIds.has(evidenceId)) {
        issues.push(`claim cites unknown evidence_id: ${evidenceId}`);
      }
    }
    if (claim?.risk_level === "blocked" && claim?.verdict !== "BLOCKED_CLAIM") {
      issues.push(`blocked risk claim must have BLOCKED_CLAIM verdict: ${claimId}`);
    }
    if (claim?.risk_level === "high" && claim?.verdict === "APPROVED_FOR_DRY_RUN") {
      issues.push(`high risk claim cannot be auto-approved for dry run: ${claimId}`);
    }
  }

  if (!hasBoundary(draftPackage.approvals_required, /AUTHORIZE_CMS_MUTATION/)) {
    issues.push("approvals_required must include AUTHORIZE_CMS_MUTATION");
  }
  if (!hasBoundary(draftPackage.approvals_required, /APPROVE_CLAIM_GATE/)) {
    issues.push("approvals_required must include APPROVE_CLAIM_GATE");
  }
  if (!hasBoundary(draftPackage.approvals_required, /APPROVE_DRAFT_PACKAGE_HASH/)) {
    issues.push("approvals_required must include APPROVE_DRAFT_PACKAGE_HASH");
  }
  if (!hasBoundary(draftPackage.forbidden_actions, /CMS/i)) {
    issues.push("forbidden_actions must include CMS mutation boundary");
  }
  if (!hasBoundary(draftPackage.forbidden_actions, /Search|provider|Google|Baidu|IndexNow/i)) {
    issues.push("forbidden_actions must include search-provider boundary");
  }
  if (!hasBoundary(draftPackage.forbidden_actions, /sitemap|robots|llms|schema|hreflang|canonical|noindex|redirect|runtime SEO/i)) {
    issues.push("forbidden_actions must include runtime SEO mutation boundary");
  }

  return issues;
}

function main() {
  const args = readArgs(process.argv.slice(2));
  const packagePath = path.resolve(args.packagePath);
  const draftPackage = readJson(packagePath);
  const issues = collectIssues(draftPackage);
  const report = {
    schema_version: 1,
    runner: "check-seo-cms-draft-package-contract",
    package_path: path.relative(process.cwd(), packagePath),
    passed: issues.length === 0,
    issues,
    boundaries: {
      cms_writes_attempted: false,
      draft_created: false,
      media_upload_attempted: false,
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

