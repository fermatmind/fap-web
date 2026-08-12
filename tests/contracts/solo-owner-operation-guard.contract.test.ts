import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const guard = readFileSync("scripts/ops/fermatmind-operation-guard", "utf8");
const status = readFileSync("scripts/ops/fermatmind-task-status", "utf8");
const workflow = readFileSync(".github/workflows/deploy-staging.yml", "utf8");
const operatingModel = readFileSync(
  "docs/codex/fermatmind-codex-workflow-and-personalization.md",
  "utf8",
);

describe("solo-owner multi-window operation guard", () => {
  it("keeps controlled ownership persistent and fail closed", () => {
    expect(guard).toContain("fermatmind.local-operation.v1");
    expect(guard).toContain("CODEX_THREAD_ID or FERMATMIND_OPERATION_OWNER is required");
    expect(guard).toContain("controlled operations never allow stale takeover");
    expect(guard).toContain("decision=attached");
    expect(guard).toContain("return 75");
    expect(guard).not.toContain("CODEX_THREAD_ID=");
  });

  it("surfaces shared operation ownership in task status", () => {
    expect(status).toContain("== Operation ownership ==");
    expect(status).toContain("fermatmind-operation-guard");
  });

  it("documents installation and claim-before-dispatch", () => {
    expect(operatingModel).toContain("Multi-window Operation Ownership");
    expect(operatingModel).toContain("fermatmind-operation-guard claim");
    expect(operatingModel).toContain("fermatmind-operation-guard dispatch");
  });

  it("does not deploy an operation-control-only merge", () => {
    expect(workflow).toContain("paths-ignore:");
    for (const path of [
      "scripts/ops/fermatmind-operation-guard",
      "scripts/ops/fermatmind-task-status",
      "tests/ops/fermatmind-operation-guard.test.sh",
      "tests/contracts/solo-owner-operation-guard.contract.test.ts",
    ]) {
      expect(workflow).toContain(`- \"${path}\"`);
    }
  });
});
