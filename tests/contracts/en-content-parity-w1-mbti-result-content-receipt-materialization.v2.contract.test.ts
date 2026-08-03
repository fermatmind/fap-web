import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { validateV2Control } from "../../scripts/seo/validate-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const PACKAGE_SHA = "9325013b870fd2496efc0882656240f91ce28ff4faaf1da42fb3dde3577b0ed3";
const RECEIPT_ROOT = "generated/en-content-parity/v2/W1-mbti/results/9325013b/receipts/30782204005-1";
const RECEIPT_PATHS = ["draft-import.json", "publication.json", "live-qa.json"].map((name) => `${RECEIPT_ROOT}/${name}`);
const RECEIPT_SHA256S = [
  "4d9e26f93d81406039efd5830c4a29fb627992c66e04321273ffe0fecaba4d74",
  "bc12c7416bf7ab4d4bf163a083a5cf815d1f6e157ca92a1c29eeca9c6945a3fc",
  "b7511b22abfeee1191a819d033398d52a038523df0109fa6cf75af8c94d72419",
];

function sha256(filePath: string) {
  return createHash("sha256").update(fs.readFileSync(path.join(ROOT, filePath))).digest("hex");
}

describe("W1 MBTI result-content V2 promotion receipt materialization", () => {
  it("binds the complete exact successful backend receipt chain and preserves comparison live QA", () => {
    const inputs = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-inputs.v2.json"), "utf8"));
    const master = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v2.json"), "utf8"));
    const chain = inputs.receipt_chains.find((entry: { lane_id: string; subscope: string }) => entry.lane_id === "W1" && entry.subscope === "W1-MBTI-RESULT-CONTENT");

    expect(chain).toMatchObject({ target_status: "live_qa_pass", receipt_subscope: "mbti-results", package_sha256: PACKAGE_SHA, expected_count: 46, receipt_paths: RECEIPT_PATHS });
    expect(RECEIPT_PATHS.map(sha256)).toEqual(RECEIPT_SHA256S);
    for (const receiptPath of RECEIPT_PATHS) expect(fs.lstatSync(path.join(ROOT, receiptPath)).isSymbolicLink()).toBe(false);

    const w1 = master.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W1");
    expect(w1.subscopes.find((subscope: { id: string }) => subscope.id === "W1-MBTI-RESULT-CONTENT")).toMatchObject({ status: "live_qa_pass", package_sha256: PACKAGE_SHA, promotion_receipts: RECEIPT_PATHS });
    expect(w1.subscopes.find((subscope: { id: string }) => subscope.id === "W1-MBTI-COMPARISONS")).toMatchObject({ status: "live_qa_pass" });
    expect(validateV2Control()).toMatchObject({ ok: true, receipt_count: 0 });
  });
});
