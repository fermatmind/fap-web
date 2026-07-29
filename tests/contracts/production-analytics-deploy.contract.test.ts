import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");
const releaseScript = readFileSync("scripts/release/standalone-release.mjs", "utf8");

describe("production analytics deploy contract", () => {
  it("fails closed before activation when the artifact build configuration is missing or invalid", () => {
    expect(releaseScript).toContain("validateProductionConfig(process.env, revision)");
    expect(releaseScript).toContain("buildConfigSnapshot(process.env)");
    expect(releaseScript).toContain("release build configuration is incompatible");
    expect(releaseScript).toContain('NEXT_PUBLIC_ANALYTICS_ENABLED", "true"');
    expect(releaseScript).toContain("/^G-[A-Z0-9]{4,32}$/");
    expect(releaseScript).toContain("/^[a-f0-9]{16,64}$/");
    expect(deployScript).not.toContain("pnpm run build");
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

  it("keeps the verified artifact immutable instead of writing runtime analytics env files", () => {
    expect(deployScript).not.toContain("write_systemd_runtime_env");
    expect(deployScript).not.toContain(".env.production.local");
    expect(deployScript).not.toContain("NEXT_PUBLIC_ANALYTICS_ENABLED=%s");
    expect(deployScript).toContain('[[ ! -f .next/standalone/server.js ]]');

    const candidateIndex = deployScript.lastIndexOf("require_candidate_analytics_smoke");
    const activeReleaseIndex = deployScript.lastIndexOf("active immutable release");
    expect(activeReleaseIndex).toBeGreaterThan(-1);
    expect(candidateIndex).toBeGreaterThan(activeReleaseIndex);
  });
});
