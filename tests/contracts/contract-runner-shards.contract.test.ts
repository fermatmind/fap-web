import { describe, expect, it } from "vitest";

import { createShardPlan, discoverContractFiles, parseArgs } from "@/scripts/testing/run-contract-shards.mjs";

describe("contract shard runner", () => {
  it("discovers contract tests in stable sorted order", () => {
    const files = discoverContractFiles();

    expect(files.length).toBeGreaterThan(600);
    expect(files).toContain("tests/contracts/contract-runner-shards.contract.test.ts");
    expect([...files].sort((a, b) => a.localeCompare(b))).toEqual(files);
    expect(files.every((file: string) => file.startsWith("tests/contracts/"))).toBe(true);
  });

  it("builds deterministic 4-8 shard plans without dropping files", () => {
    const files = [
      "tests/contracts/a.contract.test.ts",
      "tests/contracts/b.contract.test.ts",
      "tests/contracts/c.contract.test.ts",
      "tests/contracts/d.contract.test.ts",
      "tests/contracts/e.contract.test.ts",
      "tests/contracts/f.contract.test.ts",
      "tests/contracts/g.contract.test.ts",
      "tests/contracts/h.contract.test.ts",
      "tests/contracts/i.contract.test.ts",
    ];

    const plan = createShardPlan(files, 4);

    expect(plan).toHaveLength(4);
    expect(plan.flatMap((shard: { files: string[] }) => shard.files).sort((a, b) => a.localeCompare(b))).toEqual(files);
    expect(plan.map((shard: { files: string[] }) => shard.files.length)).toEqual([3, 2, 2, 2]);
    expect(plan[0]).toMatchObject({ index: 1, total: 4 });
    expect(plan[3]).toMatchObject({ index: 4, total: 4 });
  });

  it("enforces the operational shard range and supports one-shard diagnostics", () => {
    expect(parseArgs(["--shards=4", "--only-shard=2", "--timeout-ms=120000", "--reporter=dot"])).toMatchObject({
      shards: 4,
      onlyShard: 2,
      timeoutMs: 120000,
      passthrough: ["--reporter=dot"],
    });

    expect(() => parseArgs(["--shards=3"])).toThrow("--shards must be between 4 and 8");
    expect(() => parseArgs(["--shards=4", "--only-shard=5"])).toThrow("--only-shard must be between 1 and 4");
  });
});
