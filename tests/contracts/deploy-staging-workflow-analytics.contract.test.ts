import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-staging.yml";

describe("staging immutable artifact deployment workflow", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");
  const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");

  it("uses the production-compatible public build fingerprint instead of staging build overrides", () => {
    expect(workflow).toContain("NEXT_PUBLIC_API_URL: https://api.fermatmind.com");
    expect(workflow).toContain("NEXT_PUBLIC_SITE_URL: https://fermatmind.com");
    expect(workflow).toContain('NEXT_PUBLIC_ANALYTICS_ENABLED: "true"');
    expect(workflow).toContain('NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY: "false"');
    expect(workflow).toContain('NEXT_PUBLIC_RELEASE="$DEPLOY_SHA"');
    expect(workflow).toContain("--require-production-config");
    expect(workflow).not.toContain("WEB_STAGING_NEXT_PUBLIC_");
  });

  it("verifies exact-SHA provenance and integrity before the first SSH setup step", () => {
    const verifyIndex = workflow.indexOf("Verify artifact provenance and integrity before SSH");
    const sshIndex = workflow.indexOf("Set up SSH");

    expect(workflow).toContain("fap-web-standalone-${DEPLOY_SHA}");
    expect(workflow).toContain('test "$actual_artifact_digest" = "$EXPECTED_ARTIFACT_DIGEST"');
    expect(workflow).toContain('gh attestation verify "$artifact_zip"');
    expect(workflow).toContain('--source-digest "$DEPLOY_SHA"');
    expect(workflow).toContain('--expected-git-sha="$DEPLOY_SHA"');
    expect(workflow).toContain("RELEASE_MANIFEST_DIGEST=$manifest_digest");
    expect(verifyIndex).toBeGreaterThan(-1);
    expect(sshIndex).toBeGreaterThan(verifyIndex);
  });

  it("keeps server execution build-free and retries only SSH transport failures", () => {
    const serverSources = `${workflow}\n${deployScript}`;
    for (const forbidden of ["pnpm install", "npm install", "next build", "pnpm build", "pnpm run build"]) {
      expect(serverSources).not.toContain(forbidden);
    }
    expect(workflow.match(/if \[ "\$rc" -ne 255 \]; then return "\$rc"; fi/g)).toHaveLength(3);
    expect(workflow.match(/ServerAliveInterval=30/g)).toHaveLength(4);
    expect(workflow.match(/ServerAliveCountMax=20/g)).toHaveLength(4);
  });
});
