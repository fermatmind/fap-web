import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { validateV2Control } from "../../scripts/seo/validate-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const PACKAGE_SHA = "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a";
const RECEIPT_ROOT = `generated/en-content-parity/v2/W3/articles/${PACKAGE_SHA}/receipts/30797235410-1`;
const RECEIPT_PATHS = ["draft-import.json", "publication.json", "live-qa.json"].map(
  (name) => `${RECEIPT_ROOT}/${name}`,
);
const RECEIPT_SHA256S = [
  "d7748f215fe01343778a47b3e2fb86983e8801fc9cc009676b1bec9c2af5631c",
  "8c9d51e88cff8a3a3dc09bd331f428ba4851631f6c3108d919be4dd2ce6b2e44",
  "bded51d0eda65222c850daede0c3e9e14a969a51077da2ba5b5deca980a159b2",
];

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

function sha256(file: string) {
  return createHash("sha256").update(fs.readFileSync(path.join(ROOT, file))).digest("hex");
}

describe("W3 Article V2 receipt-chain reconciliation", () => {
  it("materializes the exact 17-record trusted chain without confusing it with the one-row cohort envelope", () => {
    const inputs = readJson("docs/seo/generated/en-content-parity-control-inputs.v2.json");
    const master = readJson("docs/seo/generated/en-content-parity-control-master.v2.json");
    const chain = inputs.receipt_chains.find(
      (entry: { lane_id: string; subscope: string }) => entry.lane_id === "W3" && entry.subscope === "W3-ARTICLES",
    );

    expect(chain).toMatchObject({
      target_status: "live_qa_pass",
      receipt_subscope: "W3-ARTICLES",
      package_sha256: PACKAGE_SHA,
      expected_count: 17,
      release_policy_sha256: "cdb60508556e80762c353e73c8a1b9d128d041efb85d659739154957b2f49e9a",
      receipt_paths: RECEIPT_PATHS,
    });
    expect(RECEIPT_PATHS.map(sha256)).toEqual(RECEIPT_SHA256S);
    for (const receiptPath of RECEIPT_PATHS) {
      expect(fs.lstatSync(path.join(ROOT, receiptPath)).isSymbolicLink()).toBe(false);
    }

    const w3 = master.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W3");
    const articles = w3.subscopes.find((subscope: { id: string }) => subscope.id === "W3-ARTICLES");
    const careerGuides = w3.subscopes.find((subscope: { id: string }) => subscope.id === "W3-CAREER-GUIDES");
    expect(articles).toMatchObject({
      status: "live_qa_pass",
      package_sha256: PACKAGE_SHA,
      promotion_row_count: 1,
      promotion_receipts: RECEIPT_PATHS,
    });
    expect(careerGuides).toMatchObject({ status: "dry_run_ready", promotion_receipts: [] });
    expect(validateV2Control()).toMatchObject({ ok: true, receipt_count: 0 });
  });
});
