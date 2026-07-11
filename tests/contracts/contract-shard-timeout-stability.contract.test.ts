import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("contract shard timeout stability", () => {
  it("gives tests enough headroom under full shard load without changing shard process limits", () => {
    const config = fs.readFileSync("vitest.config.ts", "utf8");
    const runner = fs.readFileSync("scripts/testing/run-contract-shards.mjs", "utf8");

    expect(config).toContain("testTimeout: 15_000");
    expect(config).toContain('pool: "forks"');
    expect(config).toContain("maxWorkers: 4");
    expect(runner).toContain("timeoutMs: options.timeoutMs");
  });
});
