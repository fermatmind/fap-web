/**
 * Production auto-deploy policy guard — pure logic helpers.
 *
 * These functions mirror the inline guard in .github/workflows/deploy-production.yml
 * so the policy can be unit-tested without GitHub Actions mocks.
 */

const RISKY_DEPLOY_APPROVAL_PREFIX = "APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:";

export const RISKY_LABEL_PATTERNS: ReadonlyArray<RegExp> = [
  /(^|[-_: ])no[-_: ]?auto[-_: ]?production($|[-_: ])/,
  /(^|[-_: ])manual[-_: ]?production($|[-_: ])/,
  /(^|[-_: ])production[-_: ]?manual($|[-_: ])/,
  /(^|[-_: ])requires[-_: ]?production[-_: ]?approval($|[-_: ])/,
  /(^|[-_: ])cms($|[-_: ])/,
  /(^|[-_: ])search($|[-_: ])/,
  /(^|[-_: ])sitemap($|[-_: ])/,
  /(^|[-_: ])llms($|[-_: ])/,
  /(^|[-_: ])content[-_: ]?release($|[-_: ])/,
  /(^|[-_: ])deploy($|[-_: ])/,
  /(^|[-_: ])secret(s)?($|[-_: ])/,
];

export const RISKY_PATH_PATTERNS: ReadonlyArray<RegExp> = [
  /^\.github\/workflows\//,
  /^\.github\/actions\//,
  /^deploy\//,
  /^docs\/deploy\//,
  /^scripts\/[^/]*deploy/i,
  /^scripts\/.*\/[^/]*deploy/i,
  /^scripts\/deploy_/i,
  /^scripts\/release_/i,
  /^scripts\/seo\//,
  /^lib\/seo\//,
  /^app\/sitemap\.xml\//,
  /^app\/llms\.txt\//,
  /^app\/llms-full\.txt\//,
  /^app\/api\/content-release\//,
  /^public\/sitemap\.xml$/,
  /^llms\.txt$/,
  /^llms-full\.txt$/,
  /(^|\/)\.env($|\.|-)/,
  /(^|\/).*secret.*$/i,
];

export const PRIVATE_ROUTE_PATTERNS: ReadonlyArray<RegExp> = [
  /\/result/,
  /\/results/,
  /\/orders/,
  /\/share/,
  /\/pay/,
  /\/payment/,
  /\/history/,
  /\/private/,
  /\/account/,
  /token=/,
  /session=/,
  /user=/,
  /result_id=/,
  /report_id=/,
  /order_no=/,
];

export const DEPLOY_SHA_RE = /^[0-9a-f]{40}$/;

export interface RequiredCheckRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
}

export interface RequiredCheckState {
  state: "ready" | "waiting" | "failed";
  pending: string[];
  failed: Array<{ name: string; conclusion: string }>;
}

/** Classify the newest run for every required check name. */
export function classifyRequiredChecks(
  requiredNames: readonly string[],
  runs: readonly RequiredCheckRun[]
): RequiredCheckState {
  const newestByName = new Map<string, RequiredCheckRun>();
  for (const run of runs) {
    if (!requiredNames.includes(run.name)) continue;
    const current = newestByName.get(run.name);
    if (!current || run.id > current.id) newestByName.set(run.name, run);
  }

  const pending: string[] = [];
  const failed: Array<{ name: string; conclusion: string }> = [];
  for (const name of requiredNames) {
    const run = newestByName.get(name);
    if (!run || run.status !== "completed") {
      pending.push(name);
      continue;
    }
    if (run.conclusion !== "success") {
      failed.push({ name, conclusion: run.conclusion || "missing" });
    }
  }

  return {
    state: failed.length > 0 ? "failed" : pending.length > 0 ? "waiting" : "ready",
    pending,
    failed,
  };
}

/** Result of evaluating the deploy policy guard. */
export interface GuardResult {
  /** Whether the deploy is allowed. */
  allowed: boolean;
  /** The resolved deploy SHA. */
  deploySha: string;
  /** The associated PR number if found (null if auto-deploy or skipped). */
  associatedPr: number | null;
  /** Whether the approval was via manual risk approval. */
  manualRiskApprovalUsed: boolean;
  /** List of risky labels found on the PR (empty if not checked). */
  riskyLabels: string[];
  /** List of risky file paths in the PR (empty if not checked). */
  riskyFiles: string[];
  /** Failure reason if not allowed. */
  reason: string;
}

export interface GuardContext {
  isManualDispatch: boolean;
  deploySha: string;
  manualRiskApproval: string;
  associatedPull: {
    number: number;
    title: string;
    labels: string[];
    changedFiles: string[];
  } | null;
}

function findRisky(labels: string[], patterns: ReadonlyArray<RegExp>): string[] {
  return labels.filter((label) => patterns.some((p) => p.test(label)));
}

/** Validate the manual risk approval token against the deploy SHA. */
export function validateManualRiskApproval(approval: string, deploySha: string): boolean {
  if (approval.length === 0) return false;
  if (!approval.startsWith(RISKY_DEPLOY_APPROVAL_PREFIX)) return false;
  return approval === `${RISKY_DEPLOY_APPROVAL_PREFIX}${deploySha}`;
}

/** Evaluate the full deploy policy guard. */
export function evaluateDeployGuard(ctx: GuardContext): GuardResult {
  const empty = (reason: string): GuardResult => ({
    allowed: false,
    deploySha: ctx.deploySha,
    associatedPr: ctx.associatedPull?.number ?? null,
    manualRiskApprovalUsed: false,
    riskyLabels: [],
    riskyFiles: [],
    reason,
  });

  // 1. Deploy SHA is required and must be valid.
  if (ctx.isManualDispatch && !ctx.deploySha) {
    return empty("manual dispatch requires deploy_sha");
  }
  if (!DEPLOY_SHA_RE.test(ctx.deploySha)) {
    return empty("deploy SHA must be a 40-char lowercase hex");
  }

  // 2. Associated PR is required (1 merged main PR).
  if (!ctx.associatedPull) {
    return empty("no merged main PR found for deploy SHA");
  }

  // 3. Manual risk approval overrides risky-path checks.
  if (ctx.isManualDispatch && ctx.manualRiskApproval.length > 0) {
    if (validateManualRiskApproval(ctx.manualRiskApproval, ctx.deploySha)) {
      return {
        allowed: true,
        deploySha: ctx.deploySha,
        associatedPr: ctx.associatedPull.number,
        manualRiskApprovalUsed: true,
        riskyLabels: [],
        riskyFiles: [],
        reason: "manual risk approval validated",
      };
    }
    return empty("manual risk approval token invalid (must match APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<SHA>)");
  }

  // 4. Risky label check.
  const riskyLabels = findRisky(ctx.associatedPull.labels.map((l) => l.toLowerCase()), RISKY_LABEL_PATTERNS);

  // 5. Risky file check.
  const riskyFiles = findRisky(ctx.associatedPull.changedFiles, RISKY_PATH_PATTERNS);

  if (riskyLabels.length > 0 || riskyFiles.length > 0) {
    const parts = ["risky changes detected"];
    if (riskyLabels.length > 0) parts.push(`labels: ${riskyLabels.join(", ")}`);
    if (riskyFiles.length > 0) parts.push(`files: ${riskyFiles.join(", ")}`);
    if (ctx.isManualDispatch) parts.push("set manual_risk_approval=APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<SHA>");
    return {
      allowed: false,
      deploySha: ctx.deploySha,
      associatedPr: ctx.associatedPull.number,
      manualRiskApprovalUsed: false,
      riskyLabels,
      riskyFiles,
      reason: parts.join("; "),
    };
  }

  // 6. All checks passed.
  return {
    allowed: true,
    deploySha: ctx.deploySha,
    associatedPr: ctx.associatedPull.number,
    manualRiskApprovalUsed: false,
    riskyLabels: [],
    riskyFiles: [],
    reason: "passed",
  };
}
