import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKAGE = path.join(ROOT, "generated/en-content-parity/W3-editorial-cms/career-guides");

describe("W3 Career Guide complete frozen package candidate", () => {
  it("binds both partial witnesses into one exact 20-row package_frozen candidate without changing master", () => {
    const ledger = JSON.parse(fs.readFileSync(path.join(PACKAGE, "source_ledger.json"), "utf8"));
    const candidate = JSON.parse(fs.readFileSync(path.join(PACKAGE, "master_manifest_patch.candidate.json"), "utf8"));
    const master = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v1.json"), "utf8"));
    const guides = master.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W3").subscopes.find((scope: { id: string }) => scope.id === "W3-CAREER-GUIDES");
    expect(ledger.rows).toHaveLength(20);
    expect(new Set(ledger.rows.map((row: { guide_code: string }) => row.guide_code)).size).toBe(20);
    expect(ledger.source_batches.map((batch: { package_sha256: string }) => batch.package_sha256)).toEqual(["5b423b9eef7877d0ee6c5c5fb74a89d236958fd4a3d5ccc1ad5d90782f1a15cd", "53458328d70d3035c7f29deb1038ba3edf96295db72cae4ca0ce61aace33b9d9"]);
    expect(candidate.proposed_status).toBe("package_frozen");
    expect(candidate).not.toHaveProperty("partial_batch");
    expect(Object.values(candidate.permissions)).toEqual(Array(7).fill(false));
    expect(guides).toMatchObject({ status: "package_in_progress", package_sha256: null, qa_report_ref: null, gate_lineage: [] });
    expect(execFileSync(process.execPath, [path.join(ROOT, "scripts/seo/validate-w3-career-guides-package-freeze.mjs")], { cwd: ROOT, encoding: "utf8" })).toContain('"ok":true');
  });
});
