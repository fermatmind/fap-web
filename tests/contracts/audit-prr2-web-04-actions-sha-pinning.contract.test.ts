import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const WORKFLOWS = path.join(process.cwd(), ".github/workflows");
const IMMUTABLE_ACTION = /^\s*(?:-\s*)?uses:\s+([^\s@]+)@([0-9a-f]{40})(?:\s+#\s+\S.*)?$/;

describe("AUDIT-PRR2-WEB-04 immutable GitHub Actions", () => {
  it("pins every external workflow action to a full commit SHA", () => {
    const violations: string[] = [];

    for (const name of fs.readdirSync(WORKFLOWS).filter((file) => file.endsWith(".yml"))) {
      const lines = fs.readFileSync(path.join(WORKFLOWS, name), "utf8").split("\n");
      lines.forEach((line, index) => {
        if (/^\s*(?:-\s*)?uses:/.test(line) && !IMMUTABLE_ACTION.test(line)) {
          violations.push(`${name}:${index + 1}:${line.trim()}`);
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
