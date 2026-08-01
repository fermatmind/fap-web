import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("EN-PARITY-W9-W4-RIASEC-INDEPENDENT-QA-01", () => {
  it("validates all 1550 frozen W4 RIASEC rows without advancing the control master", () => {
    const result = JSON.parse(execFileSync("node", ["scripts/seo/validate-w4-riasec-w9-qa.mjs"], { encoding: "utf8" }));
    expect(result).toMatchObject({
      ok: true,
      package_sha256: "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33",
      rows: 1550,
      blocked_rows: 130,
      language_blocked_rows: 126,
      duplicate_blocked_rows: 4,
      verdict: "BLOCKED",
    });
  });
});
