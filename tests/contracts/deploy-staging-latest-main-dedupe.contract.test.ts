import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-staging.yml";
const workflow = readFileSync(WORKFLOW_PATH, "utf8");

function stepPosition(name: string): number {
  const position = workflow.indexOf(`- name: ${name}`);
  expect(position, `missing workflow step: ${name}`).toBeGreaterThanOrEqual(0);
  return position;
}

describe("staging latest-main deployment deduplication", () => {
  it("reconfirms latest main after artifact verification and before any SSH setup", () => {
    const provenance = stepPosition("Verify artifact provenance and integrity before SSH");
    const latestMain = stepPosition("Reconfirm latest-main immediately before SSH");
    const dedupe = stepPosition("Deduplicate exact-SHA staging deployment before SSH");
    const ssh = stepPosition("Set up SSH");

    expect(provenance).toBeLessThan(latestMain);
    expect(latestMain).toBeLessThan(dedupe);
    expect(dedupe).toBeLessThan(ssh);
    expect(workflow).toContain(
      "git fetch --no-tags --depth=1 origin main:refs/remotes/origin/main"
    );
    expect(workflow).toContain('if [ "$DEPLOY_SHA" != "$LATEST_MAIN_SHA" ]; then');
    expect(workflow).toContain("Skip stale staging deploy before SSH");
    expect(workflow).toContain(
      "Manual staging deploy failed closed before SSH: deploy_sha must equal latest origin/main."
    );
  });

  it("uses a dedicated non-cancelling staging lane and exact-SHA dedupe key", () => {
    expect(workflow).toContain("group: fap-web-staging-deploy");
    expect(workflow).not.toContain("group: fap-web-production-api-read");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain(
      "const dedupeKey = `${context.repo.owner}/${context.repo.repo}:staging:${sha}`;"
    );
    expect(workflow).toContain('const isManual = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";');
  });

  it("skips an existing successful receipt or active deployment without entering SSH", () => {
    expect(workflow).toContain('workflow_id: "deploy-staging.yml"');
    expect(workflow).toContain("head_sha: sha");
    expect(workflow).toContain("run.id !== currentRunId");
    expect(workflow).toContain('artifact.name === expectedReceiptName && !artifact.expired');
    expect(workflow).toContain('"success_receipt_exists"');
    expect(workflow).toContain('"deployment_running"');
    expect(workflow).toContain('core.exportVariable("STAGING_DEPLOY_SKIP", "true")');

    for (const step of [
      "Set up SSH",
      "Install pinned SSH known_hosts",
      "SSH preflight",
      "Transfer and activate verified immutable release",
      "Verify deployed revision",
      "Smoke staging career page",
      "Run read-only test landing regression smoke",
      "Write staging success receipt",
      "Upload exact-SHA staging success receipt",
    ]) {
      const start = stepPosition(step);
      const nextStep = workflow.indexOf("\n      - name:", start + 1);
      const block = workflow.slice(start, nextStep === -1 ? workflow.length : nextStep);
      expect(block).toContain("env.STAGING_DEPLOY_SKIP != 'true'");
    }
  });

  it("allows only explicit manual retry after an exact-SHA failure", () => {
    expect(workflow).toContain("currentRunAttempt > 1");
    expect(workflow).toContain('"failed_requires_manual_retry"');
    expect(workflow).toContain(
      "Skip automatic staging retry; a failed exact-SHA deployment requires explicit workflow_dispatch."
    );
    expect(workflow).toContain("if (isManual && failed)");
    expect(workflow).toContain("Explicit manual retry allowed after failed exact-SHA run");
  });

  it("only writes a new receipt after a non-skipped exact latest-main deployment", () => {
    const latestMain = stepPosition("Reconfirm latest-main immediately before SSH");
    const activation = stepPosition("Transfer and activate verified immutable release");
    const receipt = stepPosition("Write staging success receipt");

    expect(latestMain).toBeLessThan(activation);
    expect(activation).toBeLessThan(receipt);
    expect(workflow).toContain('STAGING_DEPLOY_SKIP: "false"');
    expect(workflow).toContain('echo "STAGING_DEPLOY_SKIP=true" >> "$GITHUB_ENV"');
    expect(workflow).toContain("source_sha: process.env.DEPLOY_SHA");
    expect(workflow).toContain('environment: "staging"');
    expect(workflow).toContain('result: "success"');
  });
});
