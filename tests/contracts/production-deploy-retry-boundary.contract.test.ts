import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-production.yml";
const RETRY_HELPER_PATH = "scripts/production_deploy_retry.sh";

function runBash(script: string) {
  return spawnSync("bash", ["-c", script], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

describe("production deploy retry boundary", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");
  const helper = readFileSync(RETRY_HELPER_PATH, "utf8");

  it("reconnects after SSH transport exit code 255", () => {
    const transport = runBash(`
      set -euo pipefail
      source "${RETRY_HELPER_PATH}"
      attempts=0
      fake_ssh() {
        attempts=$((attempts + 1))
        if [ "$attempts" -eq 1 ]; then
          return 255
        fi
        return 0
      }
      SSH_RETRY_ATTEMPTS=3 SSH_RETRY_DELAY_SECONDS=0 retry_ssh_transport preflight fake_ssh
      test "$attempts" -eq 2
    `);

    expect(transport.status, transport.stderr).toBe(0);
    expect(transport.stderr).toContain("SSH transport failure");
  });

  it.each([1, 2, 126, 127, 137])(
    "propagates remote business exit code %i without reconnecting",
    (exitCode) => {
      const businessFailure = runBash(`
      set -euo pipefail
      source "${RETRY_HELPER_PATH}"
      attempts_file="$(mktemp)"
      printf '0\n' > "$attempts_file"
      fake_ssh() {
        attempts="$(cat "$attempts_file")"
        printf '%s\n' "$((attempts + 1))" > "$attempts_file"
        return ${exitCode}
      }
      set +e
      SSH_RETRY_ATTEMPTS=3 SSH_RETRY_DELAY_SECONDS=0 retry_ssh_transport preflight fake_ssh
      rc=$?
      set -e
      test "$rc" -eq ${exitCode}
      test "$(cat "$attempts_file")" -eq 1
      rm -f "$attempts_file"
    `);

      expect(businessFailure.status, businessFailure.stderr).toBe(0);
      expect(businessFailure.stderr).toContain("non-transport failure");
      expect(helper).toContain('if [ "$rc" -ne 255 ]; then');
    },
  );

  it("invokes the production business deploy at most once", () => {
    const deployStart = workflow.indexOf("- name: Deploy production with PM2");
    const revisionStart = workflow.indexOf("- name: Poll deployed revision endpoint");
    const deployStep = workflow.slice(deployStart, revisionStart);

    expect(deployStart).toBeGreaterThan(0);
    expect(revisionStart).toBeGreaterThan(deployStart);
    expect(deployStep.match(/bash '\$APP_DIR\/scripts\/deploy_web_pm2\.sh'/g)).toHaveLength(1);
    expect(deployStep).toContain("Business deploy is intentionally single-shot");
    expect(deployStep).not.toContain("retry_ssh_transport");
    expect(deployStep).not.toContain("for attempt in");
    expect(workflow).not.toContain("ssh_retry()");
    expect(workflow).not.toContain("SSH deploy attempt");
  });

  it("polls revision independently without SSH or another deploy invocation", () => {
    const revisionStart = workflow.indexOf("- name: Poll deployed revision endpoint");
    const smokeStart = workflow.indexOf("- name: Smoke production public surfaces");
    const revisionStep = workflow.slice(revisionStart, smokeStart);

    expect(revisionStart).toBeGreaterThan(0);
    expect(smokeStart).toBeGreaterThan(revisionStart);
    expect(revisionStep).toContain("poll_deployed_revision");
    expect(revisionStep).toContain('"${PUBLIC_BASE_URL%/}/revision" "$DEPLOY_SHA"');
    expect(revisionStep).not.toContain("ssh ");
    expect(revisionStep).not.toContain("deploy_web_pm2.sh");
    expect(revisionStep).not.toContain("retry_ssh_transport");
    expect(helper).toContain("curl --fail --silent --show-error");
  });
});
