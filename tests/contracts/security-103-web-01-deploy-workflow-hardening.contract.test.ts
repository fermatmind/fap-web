import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecurity103Web01AllowedFile } from "./helpers/currentPrScope";

const SSH_AGENT_PIN = "webfactory/ssh-agent@e83874834305fe9a4a2997156cb26c5de65a8555";
const PRODUCTION_WORKFLOW_PATH = ".github/workflows/deploy-production.yml";
const STAGING_WORKFLOW_PATH = ".github/workflows/deploy-staging.yml";
const SECURITY_103_WEB_IDS = Array.from({ length: 8 }, (_, index) => `SECURITY-103-WEB-${String(index + 1).padStart(2, "0")}`);

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    let output = "";
    try {
      output = execFileSync("git", args, { encoding: "utf8" });
    } catch {
      // CI checks out a shallow synthetic PR merge ref; not every local diff source exists there.
      continue;
    }
    for (const line of output.split("\n")) {
      if (line.trim()) {
        files.add(line.trim());
      }
    }
  }
  return [...files].sort();
}

describe("SECURITY-103-WEB-01 deploy workflow hardening", () => {
  const productionWorkflow = read(PRODUCTION_WORKFLOW_PATH);
  const stagingWorkflow = read(STAGING_WORKFLOW_PATH);

  it("pins deploy SSH setup actions to the reviewed commit SHA", () => {
    expect(productionWorkflow).toContain(`uses: ${SSH_AGENT_PIN}`);
    expect(stagingWorkflow).toContain(`uses: ${SSH_AGENT_PIN}`);
    expect(productionWorkflow).not.toContain("webfactory/ssh-agent@v0.10.0");
    expect(stagingWorkflow).not.toContain("webfactory/ssh-agent@v0.10.0");
  });

  it("requires an explicit exact merged-main SHA input for manual production deploys", () => {
    const productionInput = [
      "deploy_sha:",
      '        description: "Exact merged main commit SHA to deploy. Manual dispatch may pin an older main ancestor."',
      "        required: true",
      "        type: string",
    ].join("\n");
    const stagingInput = [
      "deploy_sha:",
      '        description: "Exact latest main commit SHA to deploy."',
      "        required: true",
      "        type: string",
    ].join("\n");

    expect(productionWorkflow).toContain(productionInput);
    expect(stagingWorkflow).toContain(stagingInput);
    expect(productionWorkflow).toContain("Manual production deploy failed closed: deploy_sha is required.");
    expect(stagingWorkflow).toContain("Manual staging deploy failed closed: deploy_sha is required.");
    expect(productionWorkflow).not.toContain("process.env.DISPATCH_DEPLOY_SHA || process.env.GITHUB_SHA");
    expect(stagingWorkflow).not.toContain('DEPLOY_SHA="${DISPATCH_DEPLOY_SHA:-$GITHUB_SHA}"');
  });

  it("fail-closes deploy revisions unless the SHA is lowercase hex and authorized on main", () => {
    for (const workflow of [productionWorkflow, stagingWorkflow]) {
      expect(workflow).toContain("^[0-9a-f]{40}$");
      expect(workflow).toContain("LATEST_MAIN_SHA");
    }

    expect(productionWorkflow).toContain("git fetch --no-tags origin main:refs/remotes/origin/main");
    expect(productionWorkflow).toContain('if [[ "$AUTHORIZATION_MODE" == "automatic_benign" ]]');
    expect(productionWorkflow).toContain("test \"$DEPLOY_SHA\" = \"$LATEST_MAIN_SHA\"");
    expect(productionWorkflow).toContain('git merge-base --is-ancestor "$DEPLOY_SHA" origin/main');
    expect(productionWorkflow).toContain("deploy SHA ${deploySha} is not contained in main ${latestMainSha}");
    expect(stagingWorkflow).toContain("git fetch --no-tags --depth=1 origin main:refs/remotes/origin/main");
    expect(stagingWorkflow).toContain("if [ \"$DEPLOY_SHA\" != \"$LATEST_MAIN_SHA\" ]; then");
    expect(stagingWorkflow).toContain("Manual staging deploy failed closed: deploy_sha must equal latest origin/main.");
    expect(stagingWorkflow).toContain("git reset --hard '$DEPLOY_SHA'");
    expect(stagingWorkflow).not.toContain("git reset --hard '$GITHUB_SHA'");
  });

  it("keeps risky production PR metadata SHA-bound and environment-gated after verifying the exact main revision", () => {
    expect(productionWorkflow).toContain("listPullRequestsAssociatedWithCommit");
    expect(productionWorkflow).toContain("expected exactly one merged main PR");
    expect(productionWorkflow).toContain("Production auto-deploy policy passed for the complete verified main change range.");
    expect(productionWorkflow).toContain("Production auto-deploy blocked by policy.");
    expect(productionWorkflow).toContain("core.notice([");
    expect(productionWorkflow).toContain("riskyLabelPatterns");
    expect(productionWorkflow).toContain("riskyPathPatterns");
    expect(productionWorkflow).toContain("manual_risk_approval:");
    expect(productionWorkflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<40-character deploy SHA>");
    expect(productionWorkflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${deploySha}");
    expect(productionWorkflow).toContain("manual_risk_approval must exactly match the SHA-bound approval text");
    expect(productionWorkflow).toContain("if (!isManualDispatch)");
    expect(productionWorkflow).toContain("Risky production revisions require SHA-bound workflow_dispatch authorization");
    expect(productionWorkflow).toContain("The deploy job remains gated by the protected production GitHub Environment.");
  });

  it("moves staging deploy target settings out of the workflow body", () => {
    for (const key of [
      "WEB_STAGING_DEPLOY_HOST",
      "WEB_STAGING_DEPLOY_USER",
      "WEB_STAGING_DEPLOY_PORT",
      "WEB_STAGING_APP_DIR",
      "WEB_STAGING_APP_NAME",
      "WEB_STAGING_APP_PORT",
      "WEB_STAGING_APP_MANAGER",
      "WEB_STAGING_SYSTEMD_SERVICE",
      "WEB_STAGING_PUBLIC_BASE_URL",
      "WEB_STAGING_NEXT_PUBLIC_API_URL",
      "WEB_STAGING_NEXT_PUBLIC_SITE_URL",
      "WEB_STAGING_GIT_BRANCH",
      "WEB_STAGING_RUN_SITEMAP_HEALTH",
      "WEB_STAGING_CORE_PUBLIC_PATH",
    ]) {
      expect(stagingWorkflow).toContain(`\${{ secrets.${key} || vars.${key} }}`);
    }

    expect(stagingWorkflow).not.toContain('DEPLOY_HOST: "49.234.55.28"');
    expect(stagingWorkflow).not.toContain('DEPLOY_USER: "ubuntu"');
    expect(stagingWorkflow).not.toContain('APP_DIR: "/var/www/fap-web-staging/current"');
  });

  it("keeps the current PR diff inside the deploy workflow hardening scope", () => {
    const changed = changedFiles();
    if (changed.length === 0 && process.env.GITHUB_ACTIONS === "true") {
      expect(changed).toEqual([]);
      return;
    }

    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity103Web01AllowedFile), changed.join("\n")).toBe(true);
  });

  it("registers the authorized SECURITY-103 fap-web PR train entries", () => {
    const manifest = read("docs/codex/pr-train.yaml");
    const state = JSON.parse(read("docs/codex/pr-train-state.json")) as {
      prs?: Array<{ id?: string; branch?: string; depends_on?: string[]; status?: string }>;
    };
    const stateEntries = new Map((state.prs || []).map((entry) => [entry.id, entry]));

    for (const id of SECURITY_103_WEB_IDS) {
      const branch = `codex/security-103-web-${id.slice(-2)}`;
      expect(manifest).toContain(`id: ${id}`);
      expect(manifest).toContain(`branch: ${branch}`);
      expect(stateEntries.get(id)).toMatchObject({ branch });
    }

    const currentEntry = stateEntries.get("SECURITY-103-WEB-01");
    expect(currentEntry).toMatchObject({ depends_on: [] });
    expect([
      "in_progress",
      "local_checks_passed",
      "committed",
      "pr_opened",
      "github_checks_failed_fixing",
      "github_checks_fix_local_passed",
      "github_checks_passed",
      "ready_to_merge",
      "merged",
    ]).toContain(currentEntry?.status);
    for (const id of SECURITY_103_WEB_IDS.slice(1)) {
      const previousNumber = String(Number(id.slice(-2)) - 1).padStart(2, "0");
      expect(stateEntries.get(id)).toMatchObject({
        status: "planned",
        depends_on: [`SECURITY-103-WEB-${previousNumber}`],
      });
    }
  });
});
