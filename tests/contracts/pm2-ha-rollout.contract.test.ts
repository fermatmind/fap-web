import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
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

  afterEach(() => {
    if (originalInstances === undefined) {
      delete process.env.PM2_INSTANCES;
      return;
    }
    process.env.PM2_INSTANCES = originalInstances;
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
});
