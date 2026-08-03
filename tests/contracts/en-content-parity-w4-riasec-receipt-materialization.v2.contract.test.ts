import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKAGE_SHA = "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb";
const RECEIPT_ROOT = "generated/en-content-parity/v2/W4-riasec/f3f2463f/receipts/30781490356-1";
const RECEIPT_SHA = {
  "preflight.json": "9934855e5bd934e915d82fea96c23ad91a2d67afc9f6e8daf4f9065c475a4dc4",
  "draft-import.json": "98a17727fc317799d951aa8ee90befb4d81333491bb859bb40d17fed4fbef207",
  "publication.json": "f5702b23452a0e82bad58e57c762fced3dc6c3d6e9916d5d3b299e48a13f3e44",
  "live-qa.json": "8a8fb82ff3fb70518b471efcc7b293e3d3cce00d2d2a6b1b2974f22c2597a286",
};

function sha256(file: string) {
  return createHash("sha256").update(fs.readFileSync(path.join(ROOT, file))).digest("hex");
}

describe("W4 RIASEC receipt materialization", () => {
  it("binds the exact trusted 1550-row preflight and receipt chain", () => {
    const inputs = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-inputs.v2.json"), "utf8"));
    const master = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v2.json"), "utf8"));
    for (const [name, digest] of Object.entries(RECEIPT_SHA)) expect(sha256(`${RECEIPT_ROOT}/${name}`)).toBe(digest);
    const chain = inputs.receipt_chains.find((item: { lane_id: string }) => item.lane_id === "W4");
    expect(chain).toMatchObject({ lane_id: "W4", subscope: null, receipt_subscope: "riasec", package_sha256: PACKAGE_SHA, expected_count: 1550, target_status: "live_qa_pass" });
    const w4 = master.lanes.find((item: { lane_id: string }) => item.lane_id === "W4");
    expect(w4).toMatchObject({ status: "live_qa_pass", package_sha256: PACKAGE_SHA, promotion_row_count: 1550 });
    expect(w4.promotion_receipts).toEqual(chain.receipt_paths);
  });
});
