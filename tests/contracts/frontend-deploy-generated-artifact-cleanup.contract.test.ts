import { readFileSync } from "node:fs";

describe("frontend deploy generated artifact cleanup contract", () => {
  it("deploys the already-synced immutable standalone tree without mutating generated public assets", () => {
    const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");

    expect(deployScript).toContain('[[ ! -f "$STANDALONE_DIR/server.js" ]]');
    expect(deployScript).toContain('DEPLOYED_REVISION="$(tr -d \'[:space:]\' < "$STANDALONE_DIR/REVISION")"');
    expect(deployScript).not.toContain("sync_standalone_assets.sh");
    expect(deployScript).not.toContain("restore_generated_public_artifacts");
    expect(deployScript).not.toContain("git restore");
    expect(deployScript).not.toContain("pnpm install");
    expect(deployScript).not.toContain("pnpm run build");

    const activeReleaseIndex = deployScript.indexOf("active immutable release");
    const reloadIndex = deployScript.indexOf("rolling reload pm2 app");

    expect(activeReleaseIndex).toBeGreaterThan(-1);
    expect(reloadIndex).toBeGreaterThan(activeReleaseIndex);
  });
});
