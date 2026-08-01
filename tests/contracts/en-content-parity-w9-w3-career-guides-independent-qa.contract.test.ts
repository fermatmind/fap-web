import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const output = path.join(root, "generated/en-content-parity/W9-independent-qa/career-guides/w3-career-guides-0b6728c9");

describe("EN-PARITY-W9-W3-CAREER-GUIDES-INDEPENDENT-QA-01", () => {
  it("retains a non-symlinked 20-row frozen snapshot and PASS-only candidate evidence", () => {
    const result = JSON.parse(execFileSync(process.execPath, ["scripts/seo/validate-w3-career-guides-w9-qa.mjs"], { cwd: root, encoding: "utf8" }));
    const report = JSON.parse(fs.readFileSync(path.join(output, "independent_qa_report.json"), "utf8"));
    expect(result).toMatchObject({ ok:true, rows:20, verdict:"PASS", package_sha256:"0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c" });
    expect(fs.lstatSync(path.join(output, "frozen_package")).isSymbolicLink()).toBe(false);
    expect(report.page_api_alignment_status).toBe("NOT_APPLICABLE");
    expect(Object.values(report.permissions)).toEqual(Array(7).fill(false));
  });
});
