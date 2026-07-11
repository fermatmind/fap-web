import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");

describe("production analytics deploy contract", () => {
  it("fails closed before build when the analytics configuration is missing or invalid", () => {
    expect(deployScript).toContain("require_analytics_build_config");
    expect(deployScript).toContain('analytics_enabled=PASS');
    expect(deployScript).toContain('ga_measurement_id=PASS');
    expect(deployScript).toContain('baidu_tongji_id=PASS');
    expect(deployScript).toContain('^G-[A-Z0-9]{4,32}$');
    expect(deployScript).toContain('^[a-f0-9]{16,64}$');
  });

  it("checks a candidate server before reload and rechecks production afterwards", () => {
    expect(deployScript).toContain("require_candidate_analytics_smoke");
    expect(deployScript).toContain('phase=${phase} path=${path}');
    expect(deployScript).toContain("fm-analytics-bootstrap");
    expect(deployScript).toContain("data-analytics-bootstrap");
    expect(deployScript).toContain(
      'ANALYTICS_PUBLIC_PATHS="${ANALYTICS_PUBLIC_PATHS:-/zh /zh/personality /zh/articles}"',
    );
    expect(deployScript).not.toContain(
      'ANALYTICS_PUBLIC_PATHS="${ANALYTICS_PUBLIC_PATHS:-/zh /zh/personality/intj-a',
    );
    expect(deployScript).toContain("/zh/articles");
    expect(deployScript).toContain("/zh/result/SYNTHETIC_DO_NOT_USE");
    expect(deployScript).toContain("/zh/orders/lookup");
    expect(deployScript).toContain("/zh/pay/wait");
    expect(deployScript).toContain("/zh/payment/stripe/cancel");

    const candidateIndex = deployScript.lastIndexOf("require_candidate_analytics_smoke");
    const reloadIndex = deployScript.indexOf("rolling reload pm2 app");
    const productionSmokeIndex = deployScript.lastIndexOf(
      'require_analytics_bootstrap_contract "$PUBLIC_BASE_URL" "production"',
    );
    expect(candidateIndex).toBeGreaterThan(-1);
    expect(reloadIndex).toBeGreaterThan(candidateIndex);
    expect(productionSmokeIndex).toBeGreaterThan(reloadIndex);
  });

  it("persists validated analytics settings for the systemd standalone runtime", () => {
    expect(deployScript).toContain("write_systemd_analytics_runtime_env");
    expect(deployScript).toContain(
      'runtime_env="${APP_DIR}/.next/standalone/.env.production.local"',
    );
    expect(deployScript).toContain("NEXT_PUBLIC_ANALYTICS_ENABLED=%s");
    expect(deployScript).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID=%s");
    expect(deployScript).toContain("NEXT_PUBLIC_BAIDU_TONGJI_ID=%s");
    expect(deployScript).toContain('chmod 600 "$runtime_env"');

    const writeRuntimeEnvIndex = deployScript.lastIndexOf(
      "write_systemd_analytics_runtime_env",
    );
    const candidateIndex = deployScript.lastIndexOf("require_candidate_analytics_smoke");
    expect(writeRuntimeEnvIndex).toBeGreaterThan(-1);
    expect(candidateIndex).toBeGreaterThan(writeRuntimeEnvIndex);
  });
});
