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

  it("separates resumable artifact preparation from single-shot promotion", () => {
    const controlStart = workflow.indexOf("- name: Transfer production control scripts");
    const resumeStart = workflow.indexOf("- name: Resume and verify receipt-bound release archive");
    const deployStart = workflow.indexOf("- name: Promote receipt-bound immutable release");
    const revisionStart = workflow.indexOf("- name: Poll deployed revision endpoint");
    const controlStep = workflow.slice(controlStart, resumeStart);
    const resumeStep = workflow.slice(resumeStart, deployStart);
    const deployStep = workflow.slice(deployStart, revisionStart);

    expect(controlStart).toBeGreaterThan(0);
    expect(resumeStart).toBeGreaterThan(controlStart);
    expect(deployStart).toBeGreaterThan(resumeStart);
    expect(revisionStart).toBeGreaterThan(deployStart);

    expect(workflow).toContain("timeout-minutes: 75");
    expect(workflow).toContain(
      'remote_artifact_dir="${APP_DIR%/}/.deploy-artifacts/${DEPLOY_SHA}-${release_archive_sha256}"',
    );
    expect(workflow).toContain(
      'echo "REMOTE_CONTROL_DIR=${APP_DIR%/}/.deploy-incoming/${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"',
    );
    expect(workflow).toContain(
      'echo "REMOTE_RELEASE_ARCHIVE_PART=$remote_artifact_dir/fap-web-${DEPLOY_SHA}.tar.gz.part"',
    );

    expect(controlStep).toContain("retry_ssh_transport control-files");
    expect(controlStep).toContain("scripts/install_standalone_release.sh");
    expect(controlStep).toContain("ecosystem.config.cjs");
    expect(controlStep).not.toContain('"$RELEASE_ARCHIVE"');

    expect(resumeStep).toContain("--partial");
    expect(resumeStep).toContain("--append-verify");
    expect(resumeStep).toContain('--timeout="$ARTIFACT_TRANSFER_IO_TIMEOUT_SECONDS"');
    expect(resumeStep).toContain("10|12|30|35|255");
    expect(resumeStep).toContain("artifact-cache-check");
    expect(resumeStep).toContain("artifact-finalize");
    expect(resumeStep).toContain("sha256sum '$REMOTE_RELEASE_ARCHIVE_PART'");
    expect(resumeStep).toContain("mv -f '$REMOTE_RELEASE_ARCHIVE_PART' '$REMOTE_RELEASE_ARCHIVE'");

    expect(deployStep).toContain("Business promotion is intentionally single-shot");
    expect(deployStep).toContain(
      "install -m 0644 '$REMOTE_CONTROL_DIR/ecosystem.config.cjs' '$APP_DIR/ecosystem.config.cjs'",
    );
    expect(deployStep).toContain("PM2_CONFIG_SHA256");
    expect(deployStep).toContain("RELEASE_ARCHIVE='$REMOTE_RELEASE_ARCHIVE'");
    expect(deployStep).not.toContain("scp ");
    expect(deployStep).not.toContain("rsync");
    expect(deployStep).not.toContain("retry_ssh_transport");
    expect(deployStep).not.toContain("for ((attempt");
  });

  it("invokes the production business deploy at most once", () => {
    const deployStart = workflow.indexOf("- name: Promote receipt-bound immutable release");
    const revisionStart = workflow.indexOf("- name: Poll deployed revision endpoint");
    const deployStep = workflow.slice(deployStart, revisionStart);

    expect(deployStart).toBeGreaterThan(0);
    expect(revisionStart).toBeGreaterThan(deployStart);
    expect(deployStep.match(/bash '\$REMOTE_CONTROL_DIR\/install_standalone_release\.sh'/g)).toHaveLength(1);
    expect(deployStep).toContain("Business promotion is intentionally single-shot");
    expect(deployStep).not.toContain("scp ");
    expect(deployStep).not.toContain("rsync");
    expect(deployStep).not.toContain("retry_ssh_transport");
    expect(deployStep).not.toContain("for attempt in");
    expect(deployStep).not.toContain("for ((attempt");
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
    expect(revisionStep).toContain("retry_ssh_transport origin-revision");
    expect(revisionStep).toContain("http://127.0.0.1:${APP_PORT}/revision");
    expect(revisionStep).toContain("else");
    expect(revisionStep).toContain("poll_deployed_revision");
    expect(revisionStep).not.toContain("deploy_web_pm2.sh");
    expect(helper).toContain("curl --fail --silent --show-error");
  });
});
