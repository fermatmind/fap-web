import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

function jobBlock(start: string, end: string): string {
  const startIndex = workflow.indexOf(`  ${start}:\n`);
  const endIndex = workflow.indexOf(`  ${end}:\n`, startIndex + start.length + 3);

  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`missing CI job boundary: ${start} -> ${end}`);
  }

  return workflow.slice(startIndex, endIndex);
}

describe("CI contract shard matrix", () => {
  it("creates only required deterministic shard children", () => {
    const shards = jobBlock("contract-shards", "contracts");

    expect(shards).toContain("name: contract-shard-${{ matrix.shard }}");
    expect(shards).toContain("fail-fast: false");
    expect(shards).toContain("shard: ${{ fromJSON(needs.classify.outputs.shards) }}");
    expect(shards.match(/only-shard=/g)).toHaveLength(1);
    expect(shards).toContain("--shards=4 --only-shard=${{ matrix.shard }}");
    expect(shards).not.toContain("\n      - run: pnpm test:contract\n");
  });

  it("keeps contracts as an always-running aggregate that rejects every non-success conclusion", () => {
    const contracts = jobBlock("contracts", "validation-receipt");

    expect(contracts).toContain("name: contracts");
    expect(contracts).toContain("needs: [classify, contract-shards]");
    expect(contracts).toContain("if: always()");
    expect(contracts).toContain("CONTRACT_MATRIX_RESULT: ${{ needs.contract-shards.result }}");
    expect(contracts).toContain('test "$CONTRACT_MATRIX_RESULT" = success');
    expect(contracts).toContain('test "$CONTRACT_MATRIX_RESULT" = skipped');
    expect(contracts).toContain('CONTRACTS_REQUIRED');
    expect(contracts).toContain("exit 1");
  });

  it("keeps shard failures visible in retained GitHub job logs", () => {
    const shards = jobBlock("contract-shards", "contracts");

    expect(shards).toContain("name: Run selected consumer contracts once");
    expect(shards).not.toContain("continue-on-error");
  });
});
