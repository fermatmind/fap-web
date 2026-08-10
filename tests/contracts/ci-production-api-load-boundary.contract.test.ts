import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const staging = readFileSync(".github/workflows/deploy-staging.yml", "utf8");
const production = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const liveResultSmoke = readFileSync(".github/workflows/live-result-smoke.yml", "utf8");

const productionReadGroup = "group: fap-web-production-api-read";

describe("production API CI load boundary", () => {
  it("cancels stale CI runs for the same ref without serializing unrelated refs", () => {
    expect(ci).toContain("group: fap-web-ci-${{ github.ref }}");
    expect(ci).toContain("cancel-in-progress: true");
  });

  it("uses staging API for pull requests and production API only for main builds", () => {
    expect(ci).toContain(
      "NEXT_PUBLIC_API_URL: ${{ github.event_name == 'pull_request' && 'https://staging-api.fermatmind.com' || 'https://api.fermatmind.com' }}",
    );
    expect(ci).toContain("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(ci).toContain("'fap-web-production-api-read'");
    expect(ci).toContain("format('fap-web-ci-build-{0}', github.run_id)");
  });

  it("serializes every long-lived workflow that reads production API", () => {
    for (const workflow of [staging, production, liveResultSmoke]) {
      expect(workflow).toContain(productionReadGroup);
      expect(workflow).toContain("cancel-in-progress: false");
    }
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
