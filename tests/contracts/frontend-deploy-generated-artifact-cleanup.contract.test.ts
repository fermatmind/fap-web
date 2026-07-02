import { readFileSync } from "node:fs";

describe("frontend deploy generated artifact cleanup contract", () => {
  it("does not treat public sitemap as a deploy-time generated artifact by default", () => {
    const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");

    expect(deployScript).toContain('GENERATED_PUBLIC_ARTIFACTS="${GENERATED_PUBLIC_ARTIFACTS:-}"');
    expect(deployScript).toContain("restore_generated_public_artifacts()");
    expect(deployScript).toContain('git ls-files --error-unmatch "$artifact"');
    expect(deployScript).toContain('git diff --quiet -- "$artifact"');
    expect(deployScript).toContain('git restore -- "$artifact"');
    expect(deployScript).toContain("restored generated public artifact after standalone sync");

    const syncIndex = deployScript.indexOf('bash "$SYNC_STANDALONE_ASSETS_SCRIPT"');
    const restoreIndex = deployScript.lastIndexOf("restore_generated_public_artifacts");
    const reloadIndex = deployScript.indexOf("rolling reload pm2 app");

    expect(syncIndex).toBeGreaterThan(-1);
    expect(restoreIndex).toBeGreaterThan(syncIndex);
    expect(reloadIndex).toBeGreaterThan(restoreIndex);
  });
});
