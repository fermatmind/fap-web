import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { validateV2Control } from "../../scripts/seo/validate-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const PACKAGE_SHA = "deecc8175fb43ba3730d6513b496a0ab6834459108e3b24e25550bbf40e001a2";
const RECEIPT_ROOT = "generated/en-content-parity/v2/W1-mbti/comparisons/deecc8175f/receipts/30781185656-1";
const RECEIPT_PATHS = ["draft-import.json", "publication.json", "live-qa.json"].map((name) => `${RECEIPT_ROOT}/${name}`);
const RECEIPT_SHA256S = [
  "bbd88a1de202a34019e3b95345ab6dd7b2c5bb1e6ccf15407d7ca4b485ed70c8",
  "685082713cef70ae57b7389dd96e0137dca9768ecbe48ed8bfcdba225ea43f0c",
  "4a53ef4541d1cf86eb660ac7d7ab517adbb7fbf9a03febe421fe1fbbd486488e",
];

function sha256(filePath: string) {
  return createHash("sha256").update(fs.readFileSync(path.join(ROOT, filePath))).digest("hex");
}

describe("W1 MBTI comparison V2 promotion receipt materialization", () => {
  it("binds the complete exact successful backend receipt chain and leaves result content unchanged", () => {
    const inputs = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-inputs.v2.json"), "utf8"));
    const master = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v2.json"), "utf8"));
    const chain = inputs.receipt_chains.find((entry: { lane_id: string; subscope: string }) => entry.lane_id === "W1" && entry.subscope === "W1-MBTI-COMPARISONS");

    expect(chain).toMatchObject({
      target_status: "live_qa_pass",
      receipt_subscope: "mbti-comparisons",
      package_sha256: PACKAGE_SHA,
      expected_count: 7,
      release_policy_sha256: "cdb60508556e80762c353e73c8a1b9d128d041efb85d659739154957b2f49e9a",
      receipt_paths: RECEIPT_PATHS,
    });
    expect(RECEIPT_PATHS.map(sha256)).toEqual(RECEIPT_SHA256S);
    for (const receiptPath of RECEIPT_PATHS) expect(fs.lstatSync(path.join(ROOT, receiptPath)).isSymbolicLink()).toBe(false);

    const w1 = master.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W1");
    expect(w1.subscopes.find((subscope: { id: string }) => subscope.id === "W1-MBTI-COMPARISONS")).toMatchObject({
      status: "live_qa_pass",
      package_sha256: PACKAGE_SHA,
      promotion_receipts: RECEIPT_PATHS,
    });
    expect(w1.subscopes.find((subscope: { id: string }) => subscope.id === "W1-MBTI-RESULT-CONTENT")).toMatchObject({
      status: "dry_run_ready",
      promotion_receipts: [],
    });
    expect(validateV2Control()).toMatchObject({ ok: true, receipt_count: 0 });
  });
});
