import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const RUNBOOK_PATH = "docs/deploy/502-recovery-runbook.md";

describe("deploy runbook redaction contract", () => {
  it("does not expose concrete production SSH targets", () => {
    const runbook = readFileSync(RUNBOOK_PATH, "utf8");

    expect(runbook).toContain("ssh <production-ssh-alias>");
    expect(runbook).toContain("internal secrets manager");
    expect(runbook).not.toMatch(/ssh\s+\w+@\d{1,3}(?:\.\d{1,3}){3}/);
    expect(runbook).not.toMatch(/\b(?!127\.0\.0\.1\b)(?:\d{1,3}\.){3}\d{1,3}\b/);
  });
});
