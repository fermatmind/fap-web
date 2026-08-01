import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const output = path.join(root, "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b");

describe("EN-PARITY-W9-W3-ARTICLES-INDEPENDENT-QA-REFROZEN-10-01", () => {
  it("retains a non-symlinked 17-row frozen snapshot and PASS-only candidate evidence", () => {
    const result = JSON.parse(execFileSync(process.execPath, ["scripts/seo/validate-w3-articles-refrozen-10-w9-qa.mjs"], { cwd: root, encoding: "utf8" }));
    const report = JSON.parse(fs.readFileSync(path.join(output, "independent_qa_report.json"), "utf8"));
    expect(result).toMatchObject({ ok: true, rows: 17, verdict: "PASS", package_sha256: "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a" });
    expect(fs.lstatSync(path.join(output, "frozen_package")).isSymbolicLink()).toBe(false);
    expect(report.page_api_alignment_status).toBe("NOT_APPLICABLE");
    expect(Object.values(report.permissions)).toEqual(Array(7).fill(false));
  });
});
