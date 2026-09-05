import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");
const converge = readFileSync(
  ".github/trunk/converge-content-release-runtime.sh",
  "utf8",
);
const remoteControl = readFileSync(
  "scripts/content_release_revalidation_runtime_config.sh",
  "utf8",
);

describe("content-release revalidation runtime deploy control", () => {
  it("runs inside the existing exact-SHA deploy control plane", () => {
    expect(deploy).toContain("infrastructure: ${{ steps.receipt.outputs.infrastructure }}");
    expect(deploy).toContain(
      "infrastructure=$(jq -r .classification.flags.deployment_infrastructure",
    );
    expect(deploy).toContain("content-release-runtime:");
    expect(deploy).toContain("needs: [policy, production]");
    expect(deploy).toContain(
      "needs.production.result == 'success' && needs.policy.outputs.infrastructure == 'true'",
    );
    expect(deploy).toContain("environment: production");
    expect(deploy).toContain("Confirm runtime control remains latest main");
    expect(deploy).toContain('test "$(git rev-parse origin/main)" = "$DEPLOY_SHA"');
    expect(deploy).not.toMatch(/workflow_dispatch\s*:/);
  });

  it("sources only the protected runtime credentials and preserves sanitized receipts", () => {
    for (const name of [
      "CONTENT_RELEASE_REVALIDATE_SECRET",
      "CONTENT_RELEASE_REVALIDATE_REDIS_URL",
      "CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN",
    ]) {
      expect(deploy).toContain(`${name}: \${{ secrets.${name} }}`);
      expect(converge).toContain(`export ${name}=%q`);
    }
    expect(deploy).toContain("content-release-runtime-receipts/*.json");
    expect(deploy).toContain("if-no-files-found: error");
    expect(converge).toContain(".secret_values_output == false");
  });

  it("binds preflight and apply to the deployed SHA without revalidating content", () => {
    expect(converge).toContain("EXPECTED_CONTROL_PLANE_SHA=%q");
    expect(converge).toContain("EXPECTED_FRONTEND_SHA=%q");
    expect(converge).toContain("PASS_RUNTIME_CONFIG_ALREADY_CONVERGED");
    expect(converge).toContain("PASS_RUNTIME_CONFIG_CONVERGED");
    expect(converge).toContain("runtime_setting_write_count == 3");
    expect(converge).toContain(".cache_revalidation == false");
    expect(converge).not.toContain("/api/content-release/revalidate");
    expect(remoteControl).toContain('[[ "$AUTHORIZATION_PHRASE" == "$expected_phrase" ]]');
    expect(remoteControl).toContain('pm2 reload "$APP_NAME" --update-env');
  });
});
