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
  it("gives the complete contract suite enough time without changing its command", () => {
    const contracts = jobBlock("contracts", "verify-big5-contract-freeze");

    expect(contracts).toContain("timeout-minutes: 10");
    expect(contracts).toContain("- run: pnpm test:contract");
  });

  it("does not broaden timeout budgets for the other required jobs", () => {
    expect(jobBlock("build", "contracts")).toContain("timeout-minutes: 10");
    expect(jobBlock("verify-big5-contract-freeze", "verify-enneagram-contract-freeze")).toContain(
      "timeout-minutes: 5"
    );
    expect(jobBlock("verify-enneagram-contract-freeze")).toContain("timeout-minutes: 5");
  });
});
