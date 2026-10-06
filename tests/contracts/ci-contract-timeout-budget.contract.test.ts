import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
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
    const contracts = jobBlock("contracts", "validation-receipt");

    expect(shards).toContain("timeout-minutes: 10");
    expect(shards).toContain("pnpm test:contract -- --shards=4 --only-shard=${{ matrix.shard }}");
    expect(contracts).toContain("timeout-minutes: 2");
  });

  it("keeps builds and consolidated consumer installs bounded", () => {
    expect(jobBlock("build", "contract-shards")).toContain("timeout-minutes: 20");
    const shards = jobBlock("contract-shards", "contracts");
    expect(shards).toContain("timeout-minutes: 10");
    expect(shards).toContain(".github/trunk/install-dependencies.sh && pnpm test:contract");
    expect(shards).toContain("--selection-input=trunk-path-classification.json");
  });

  it("selects every former freeze contract through the real consumer selector", () => {
    const selection = JSON.parse(execFileSync(process.execPath, [
      "--input-type=module", "-e",
      "import {selectTests} from './.github/trunk/test-consumers.mjs'; console.log(JSON.stringify(selectTests(['package.json'])));",
    ], { encoding: "utf8" }));
    const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
    const formerFreezeFiles = ["verify-big5-contract-freeze", "verify-enneagram-contract-freeze"]
      .flatMap((name) => scripts[name].match(/tests\/contracts\/\S+\.test\.tsx?/g) || []);
    expect(new Set(formerFreezeFiles).size).toBe(8);
    for (const file of formerFreezeFiles) {
      expect(selection.files.filter((selected: string) => selected === file)).toHaveLength(1);
    }
  });
});
