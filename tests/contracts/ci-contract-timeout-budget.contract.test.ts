import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

function jobBlock(start: string, end?: string): string {
  const startIndex = workflow.indexOf(`  ${start}:\n`);
  if (startIndex < 0) {
    throw new Error(`missing CI job: ${start}`);
  }

  if (!end) {
    return workflow.slice(startIndex);
  }

  const endIndex = workflow.indexOf(`  ${end}:\n`, startIndex + start.length + 3);
  if (endIndex < 0) {
    throw new Error(`missing CI job boundary: ${end}`);
  }

  return workflow.slice(startIndex, endIndex);
}

describe("CI contract timeout budget", () => {
  it("gives each contract matrix child enough time while keeping the aggregate small", () => {
    const shards = jobBlock("contract-shards", "contracts");
    const contracts = jobBlock("contracts", "verify-big5-contract-freeze");

    expect(shards).toContain("timeout-minutes: 10");
    expect(shards).toContain("pnpm test:contract -- --shards=4 --only-shard=${{ matrix.shard }}");
    expect(contracts).toContain("timeout-minutes: 2");
  });

  it("keeps required jobs bounded while allowing Big Five install network headroom", () => {
    expect(jobBlock("build", "contract-shards")).toContain("timeout-minutes: 20");
    expect(jobBlock("verify-big5-contract-freeze", "verify-enneagram-contract-freeze")).toContain(
      "timeout-minutes: 10"
    );
    expect(jobBlock("verify-enneagram-contract-freeze")).toContain("timeout-minutes: 5");
  });
});
