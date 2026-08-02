import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { applyMaterializationInputs, buildV2, canonicalJson, migrateV1ToV2 } from "../../scripts/seo/build-en-content-parity-control-v2.mjs";
import { validateV2Control } from "../../scripts/seo/validate-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const ARTIFACT_ROOT = "generated/en-content-parity/v2/W5-enneagram-private-results/8a1653b5";
const BACKEND_SHA = "8a1653b5053b7ab910957543c8bb831b8c0759aaec82a7200e5c13c08a5e98d5";
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const read = (relativePath: string) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

describe("W5 Enneagram private-result V2 control envelope", () => {
  it("binds the exact non-symlinked fap-api package, every physical file, and all 630 identities", () => {
    const evidence = read(`${ARTIFACT_ROOT}/external_package_evidence.json`);
    const packageManifest = read(evidence.snapshot.package_manifest_ref);
    const records = fs.readFileSync(path.join(ROOT, `${ARTIFACT_ROOT}/package/records.jsonl`), "utf8")
      .trim().split("\n").map((line) => JSON.parse(line));

    expect(evidence.source_repository).toBe("fermatmind/fap-api");
    expect(evidence.source_commit).toBe("e2470dab99c21f5776f8a0e848ceb81eddfa0c51");
    expect(evidence.backend_package_sha256).toBe(BACKEND_SHA);
    expect(evidence.authority_target).toMatchObject({
      lane_id: "W5",
      subscope: null,
      production_subscope: "enneagram-results",
      asset_ids: ["ENPARITY-W5-ENNEAGRAM-RESULT-CONTENT"],
      expected_count: 630,
      source_asset_count: 1332,
      public_control_count: 58,
    });
    expect(evidence.snapshot.package_file_count).toBe(649);
    expect(evidence.snapshot.physical_file_count).toBe(650);
    expect(packageManifest.files).toEqual(evidence.snapshot.files);
    expect(hash(packageManifest.files.map((file: { path: string; sha256: string }) => `${file.path}\0${file.sha256.toLowerCase()}\n`).join(""))).toBe(BACKEND_SHA);
    expect(evidence.payloads).toHaveLength(630);
    expect(records).toHaveLength(630);
    expect(new Set(records.map((record: { asset_id: string }) => record.asset_id)).size).toBe(630);
    for (const file of evidence.snapshot.files) {
      const physicalPath = path.join(ROOT, evidence.snapshot.root, file.path);
      expect(fs.lstatSync(physicalPath).isSymbolicLink()).toBe(false);
      expect(hash(fs.readFileSync(physicalPath))).toBe(file.sha256);
    }
  });

  it("uses only the fap-api W9 PASS report and does not treat it as a fap-web source commit", () => {
    const evidence = read(`${ARTIFACT_ROOT}/external_package_evidence.json`);
    const sourceReport = read(evidence.w9.source_report_ref);
    const normalized = read("generated/en-content-parity/W9-independent-qa/enneagram/w5-enneagram-private-results-8a1653b5/independent_qa_report.json");

    expect(sourceReport).toMatchObject({
      schema_version: "fermatmind.en_parity.independent_w9_report.v1",
      review_kind: "independent_w9",
      verdict: "PASS",
      lane_id: "W5",
      subscope: "enneagram-results",
      package_sha256: BACKEND_SHA,
      reviewed_row_count: 630,
    });
    expect(Object.values(sourceReport.checks)).toEqual(expect.arrayContaining(["PASS"]));
    expect(Object.values(sourceReport.checks).every((value) => value === "PASS")).toBe(true);
    expect(normalized).toMatchObject({
      qa_lane_id: "W9",
      producer_lane_id: "W5",
      subscope_id: null,
      reviewed_source_repository: "fermatmind/fap-api",
      reviewed_source_commit: sourceReport.reviewed_source_commit,
      reviewed_row_count: 630,
      verdict: "PASS",
      external_report: {
        source_repository: "fermatmind/fap-api",
        report_ref: evidence.w9.source_report_ref,
        report_sha256: evidence.w9.source_report_sha256,
      },
    });
  });

  it("materializes W5 deterministically and rejects cross-lane input bindings", () => {
    const inputs = read("docs/seo/generated/en-content-parity-control-inputs.v2.json");
    const w5 = inputs.lane_manifests.find((entry: { lane_id: string }) => entry.lane_id === "W5");
    expect(w5).toBeDefined();
    expect(buildV2().lanes.find((lane: { lane_id: string }) => lane.lane_id === "W5")).toMatchObject({
      status: "qa_pass",
      package_sha256: "30308bb091bae1e5ada0125aada144e696ab9c1fa8bd5951c9f80a136ffc2048",
    });
    expect(validateV2Control()).toMatchObject({ ok: true, lane_count: 9, receipt_count: 0 });
    const crossLane = { ...inputs, lane_manifests: [{ ...w5, lane_id: "W4" }] };
    const v1 = read("docs/seo/generated/en-content-parity-control-master.v1.json");
    expect(() => applyMaterializationInputs(migrateV1ToV2(v1, hash(fs.readFileSync(path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v1.json")))), crossLane)).toThrow("lane_manifest_identity_mismatch");
    expect(canonicalJson(w5)).toContain("W5-enneagram-private-results");
  });
});
