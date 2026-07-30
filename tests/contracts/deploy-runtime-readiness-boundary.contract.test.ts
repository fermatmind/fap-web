import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");
const stagingWorkflow = readFileSync(".github/workflows/deploy-staging.yml", "utf8");

describe("deploy runtime readiness boundary", () => {
  it("waits for a bounded local HTTP readiness probe after restart", () => {
    expect(deployScript).toContain('APP_READY_TIMEOUT_SEC="${APP_READY_TIMEOUT_SEC:-60}"');
    expect(deployScript).toContain(
      'APP_READY_POLL_INTERVAL_SEC="${APP_READY_POLL_INTERVAL_SEC:-1}"',
    );
    expect(deployScript).toContain("wait_for_local_app_ready() {");
    expect(deployScript).toContain('probe_url="http://${APP_HOST}:${APP_PORT}/zh"');
    expect(deployScript).toContain(
      'log "local application readiness timed out after ${APP_READY_TIMEOUT_SEC}s: ${probe_url}"',
    );

    const restart = deployScript.indexOf('log "restart systemd service ${SYSTEMD_SERVICE}"');
    const readiness = deployScript.lastIndexOf("wait_for_local_app_ready");
    const marker = deployScript.indexOf(
      'write_deployed_revision "$DEPLOYED_REVISION" "${APP_DIR}/REVISION"',
    );
    const revisionSmoke = deployScript.indexOf(
      'require_deployed_revision_endpoint "http://${APP_HOST}:${APP_PORT}${REVISION_PATH}" "$DEPLOYED_REVISION"',
    );

    expect(restart).toBeGreaterThanOrEqual(0);
    expect(readiness).toBeGreaterThan(restart);
    expect(marker).toBeGreaterThan(readiness);
    expect(revisionSmoke).toBeGreaterThan(marker);
    expect(deployScript).not.toContain('ss -ltnp | grep ":${APP_PORT}" >/dev/null');
  });

  it("bounds every deploy header and revision request", () => {
    expect(deployScript).toContain(
      'HTTP_CONNECT_TIMEOUT_SEC="${HTTP_CONNECT_TIMEOUT_SEC:-5}"',
    );
    expect(deployScript).toContain(
      'HTTP_REQUEST_TIMEOUT_SEC="${HTTP_REQUEST_TIMEOUT_SEC:-20}"',
    );

    const probeHeaders = deployScript.slice(
      deployScript.indexOf("probe_headers() {"),
      deployScript.indexOf("wait_for_local_app_ready() {"),
    );
    const revisionProbe = deployScript.slice(
      deployScript.indexOf("require_deployed_revision_endpoint() {"),
      deployScript.indexOf("require_analytics_bootstrap_contract() {"),
    );

    for (const body of [probeHeaders, revisionProbe]) {
      expect(body).toContain('--connect-timeout "$HTTP_CONNECT_TIMEOUT_SEC"');
      expect(body).toContain('--max-time "$HTTP_REQUEST_TIMEOUT_SEC"');
    }
  });

  it("keeps the non-cancelling staging lane while allowing cross-region transfer headroom", () => {
    expect(stagingWorkflow).toContain("timeout-minutes: 45");
    expect(stagingWorkflow).toContain("cancel-in-progress: false");
    expect(stagingWorkflow).toContain("ServerAliveInterval=30");
    expect(stagingWorkflow).toContain("ServerAliveCountMax=20");
  });
});
