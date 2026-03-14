import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

type Pm2AppConfig = {
  name?: string;
  exec_mode?: string;
  instances?: number | string;
};

const ROOT = process.cwd();
const requireFromTest = createRequire(import.meta.url);

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function loadEcosystem(): { apps?: Pm2AppConfig[] } {
  const ecosystemPath = path.join(ROOT, "ecosystem.config.cjs");
  const resolvedPath = requireFromTest.resolve(ecosystemPath);
  delete requireFromTest.cache[resolvedPath];
  return requireFromTest(ecosystemPath) as { apps?: Pm2AppConfig[] };
}

describe("pm2 high-availability rollout contract", () => {
  const originalInstances = process.env.PM2_INSTANCES;
  const tempDirs: string[] = [];

  afterEach(() => {
    if (originalInstances === undefined) {
      delete process.env.PM2_INSTANCES;
    } else {
      process.env.PM2_INSTANCES = originalInstances;
    }

    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("uses cluster mode and clamps default instance count to >= 2", () => {
    delete process.env.PM2_INSTANCES;
    const defaultConfig = loadEcosystem();
    const defaultApp = defaultConfig.apps?.find((item) => item.name === "fap-web");
    expect(defaultApp).toBeDefined();
    expect(defaultApp?.exec_mode).toBe("cluster");
    expect(Number(defaultApp?.instances)).toBeGreaterThanOrEqual(2);

    process.env.PM2_INSTANCES = "1";
    const clampedConfig = loadEcosystem();
    const clampedApp = clampedConfig.apps?.find((item) => item.name === "fap-web");
    expect(clampedApp).toBeDefined();
    expect(Number(clampedApp?.instances)).toBeGreaterThanOrEqual(2);
  });

  it("deploy script uses rolling reload helper without destructive pm2 delete", () => {
    const deployScript = read("scripts/deploy_web_pm2.sh");
    expect(deployScript).toContain("rolling_reload_pm2.sh");
    expect(deployScript).toMatch(/ROLLING_RELOAD_SCRIPT=/);
    expect(deployScript).toMatch(/"\$ROLLING_RELOAD_SCRIPT"\s+"\$APP_NAME"/);
    expect(deployScript).not.toContain('pm2 delete "$APP_NAME"');
  });

  it("healthcheck script validates multi-instance online count and minimum instance floor", () => {
    const healthcheckScript = read("scripts/healthcheck_web.sh");
    expect(healthcheckScript).toContain("HEALTHCHECK_MIN_INSTANCES");
    expect(healthcheckScript).toContain("onlineCount");
    expect(healthcheckScript).toContain("instanceCount");
    expect(healthcheckScript).toContain('item.pm2_env.status === "online"');
    expect(healthcheckScript).toContain("status=online");
  });

  it("rolling_reload_pm2 child script returns 0 after drift recreate reaches aligned shape", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pm2-rollout-contract-"));
    tempDirs.push(tempDir);

    const appDir = path.join(tempDir, "app");
    const standaloneDir = path.join(appDir, ".next", "standalone");
    const execPath = path.join(standaloneDir, "server.js");
    const configPath = path.join(appDir, "ecosystem.config.cjs");
    const pm2StatePath = path.join(tempDir, "pm2-state.txt");
    const pm2LogPath = path.join(tempDir, "pm2-calls.log");
    const fakePm2Path = path.join(tempDir, "pm2");

    fs.mkdirSync(standaloneDir, { recursive: true });
    fs.writeFileSync(execPath, "// fake standalone server\n");
    fs.writeFileSync(configPath, "module.exports = {};\n");
    fs.writeFileSync(pm2StatePath, "drifted\n");
    fs.writeFileSync(pm2LogPath, "");

    fs.writeFileSync(
      fakePm2Path,
      `#!/usr/bin/env bash
set -euo pipefail

cmd="\${1:-}"
shift || true
printf '%s %s\\n' "$cmd" "$*" >> "$FAKE_PM2_LOG"
state="$(cat "$FAKE_PM2_STATE")"
exec_path="\${APP_DIR%/}/.next/standalone/server.js"

case "$cmd" in
  jlist)
    if [[ "$state" == "drifted" ]]; then
      cat <<JSON
[{"name":"fap-web","pm2_env":{"status":"online","exec_mode":"fork_mode","pm_exec_path":"$exec_path"}}]
JSON
    else
      cat <<JSON
[{"name":"fap-web","pm2_env":{"status":"online","exec_mode":"cluster_mode","pm_exec_path":"$exec_path"}},{"name":"fap-web","pm2_env":{"status":"online","exec_mode":"cluster_mode","pm_exec_path":"$exec_path"}}]
JSON
    fi
    ;;
  delete)
    printf 'deleted\\n' > "$FAKE_PM2_STATE"
    ;;
  start)
    printf 'aligned\\n' > "$FAKE_PM2_STATE"
    ;;
  *)
    printf 'unexpected command: %s\\n' "$cmd" >&2
    exit 1
    ;;
esac
`,
    );
    fs.chmodSync(fakePm2Path, 0o755);

    const result = spawnSync("bash", ["scripts/rolling_reload_pm2.sh", "fap-web"], {
      cwd: ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        APP_DIR: appDir,
        PM2_BIN: fakePm2Path,
        PM2_INSTANCES: "2",
        ROLLING_TIMEOUT_SEC: "2",
        FAKE_PM2_STATE: pm2StatePath,
        FAKE_PM2_LOG: pm2LogPath,
      },
    });

    const output = `${result.stdout}${result.stderr}`;
    const callLog = fs.readFileSync(pm2LogPath, "utf8");

    expect(result.status).toBe(0);
    expect(output).toContain("detected drift, recreating from ecosystem config");
    expect(output).toContain("post-check:");
    expect(output).toContain("convergence succeeded");
    expect(callLog).toContain("delete fap-web");
    expect(callLog).toContain(`start ${configPath} --only fap-web --update-env`);
  });
});
