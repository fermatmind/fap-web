import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const deploy = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("production API CI load boundary", () => {
  it("keeps every exact SHA CI run while serializing its production API build reads", () => {
    expect(ci).toContain("group: fap-web-ci-${{ github.repository }}-${{ github.sha }}");
    expect(ci).toContain("cancel-in-progress: false");
    expect(ci).toContain("'fap-web-production-api-read'");
  });

  it("uses staging API for pull requests and production API only for main builds", () => {
    expect(ci).toContain(
      "NEXT_PUBLIC_API_URL: ${{ github.event_name == 'pull_request' && 'https://staging-api.fermatmind.com' || 'https://api.fermatmind.com' }}",
    );
    expect(ci).toContain("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(ci).toContain("'fap-web-production-api-read'");
    expect(ci).toContain("format('fap-web-ci-build-{0}', github.run_id)");
  });

  it("serializes the complete staging-to-production activation lane", () => {
    expect(deploy).toContain("group: trunk-deploy-${{ github.repository }}");
    expect(deploy).toContain("cancel-in-progress: false");
    expect(deploy).toContain("needs: [policy, staging]");
  });

  it("binds deployment to the successful exact-main CI artifact", () => {
    expect(deploy).toContain("test \"$HEAD_BRANCH\" = main");
    expect(deploy).toContain("test \"$CI_EVENT\" = push");
    expect(deploy).toContain("trunk-validation-${process.env.DEPLOY_SHA}");
  });

  it("does not move API-independent contract and freeze jobs into the production lane", () => {
    for (const job of [
      "contract-shards:",
      "contracts:",
      "verify-big5-contract-freeze:",
      "verify-enneagram-contract-freeze:",
    ]) {
      const start = ci.indexOf(`  ${job}`);
      expect(start).toBeGreaterThanOrEqual(0);
      const nextJob = ci.indexOf("\n  ", start + 3);
      const body = ci.slice(start, nextJob === -1 ? ci.length : nextJob);
      expect(body).not.toContain("fap-web-production-api-read");
    }
  });
});
