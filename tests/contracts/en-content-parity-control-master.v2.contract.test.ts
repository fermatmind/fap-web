import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  RELEASE_POLICY,
  V2_ORDERED_STATES,
  applyMaterializationInputs,
  canonicalJson,
  mapV1Status,
  migrateV1ToV2,
} from "../../scripts/seo/build-en-content-parity-control-v2.mjs";
import {
  validatePromotionMonotonicity,
  validateReceiptChain,
  validateV2Control,
  validateV2Master,
} from "../../scripts/seo/validate-en-content-parity-control-v2.mjs";

const ROOT = process.cwd();
const V1_PATH = path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v1.json");
const V2_PATH = path.join(ROOT, "docs/seo/generated/en-content-parity-control-master.v2.json");
const PACKAGE_SHA = "1".repeat(64);
const POLICY_SHA = "cdb60508556e80762c353e73c8a1b9d128d041efb85d659739154957b2f49e9a";

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function receiptBytes(receipt: Record<string, unknown>) {
  const content = { ...receipt };
  delete content.receipt_content_sha256;
  const complete = { ...content, receipt_content_sha256: sha256(canonicalJson(content)) };
  return { receipt: complete, bytes: `${JSON.stringify(complete, null, 2)}\n` };
}

function validReceiptChain() {
  const common = {
    schema_version: "fermatmind.content_promotion_receipt.v2",
    result: "SUCCEEDED",
    adapter: "mbti_comparisons",
    lane: "W1",
    subscope: "W1-MBTI-COMPARISONS",
    source_repository: "fermatmind/fap-api",
    source_commit: "8e738763162ff7c1507e28fa30d1b8cb7154de85",
    package_path: "content_assets/en-content-parity/W1-mbti/comparisons",
    package_sha256: PACKAGE_SHA,
    executor_release_sha256: "2".repeat(64),
    release_policy_sha256: POLICY_SHA,
    workflow_run_id: "30715225574",
    workflow_run_attempt: 1,
    idempotency_key: "3".repeat(64),
    expected_count: 7,
    readback_count: 7,
    rollback_reference: "revision:previous-public",
    locale_check: "PASS",
    cjk_leakage_check: "PASS",
    identity_check: "PASS",
    privacy_redaction: true,
    private_payload_read_count: 0,
    server_topology_exposed: false,
    indexability_mutation_count: 0,
    sitemap_mutation_count: 0,
    llms_mutation_count: 0,
    search_mutation_count: 0,
    deploy_mutation_count: 0,
  };
  const draft = receiptBytes({
    ...common,
    receipt_kind: "cms_draft_import_receipt",
    phase: "draft-import",
    written_count: 7,
    published_count: 0,
    previous_receipt_sha256: null,
  });
  const publication = receiptBytes({
    ...common,
    receipt_kind: "cms_publication_receipt",
    phase: "publish",
    written_count: 0,
    published_count: 7,
    previous_receipt_sha256: sha256(draft.bytes),
  });
  const liveQa = receiptBytes({
    ...common,
    receipt_kind: "cms_live_qa_receipt",
    phase: "live-qa",
    written_count: 0,
    published_count: 7,
    previous_receipt_sha256: sha256(publication.bytes),
  });
  return [draft, publication, liveQa];
}

const expected = {
  lane: "W1",
  subscope: "W1-MBTI-COMPARISONS",
  packageSha256: PACKAGE_SHA,
  expectedCount: 7,
  releasePolicySha256: POLICY_SHA,
  targetStatus: "live_qa_pass" as const,
};

function trustedProvenance(chain: ReturnType<typeof validReceiptChain>) {
  const first = chain[0].receipt as Record<string, unknown>;
  return {
    verified: true,
    repository: "fermatmind/fap-api",
    workflow_path: ".github/workflows/content-promotion-automation.yml",
    event: "workflow_dispatch",
    head_branch: "main",
    head_sha: first.source_commit,
    source_commit: first.source_commit,
    status: "completed",
    conclusion: "success",
    run_id: first.workflow_run_id,
    run_attempt: first.workflow_run_attempt,
    artifact_name: `content-promotion-${first.lane}-${first.workflow_run_id}-${first.workflow_run_attempt}`,
    complete_receipt_count: chain.length,
    artifact_receipt_sha256s: chain.map((entry) => sha256(entry.bytes)),
  };
}

function validateChain(
  chain: ReturnType<typeof validReceiptChain>,
  targetStatus: "draft_imported" | "published" | "live_qa_pass" = "live_qa_pass",
) {
  return validateReceiptChain({
    entries: chain,
    ...expected,
    targetStatus,
    provenance: trustedProvenance(chain),
  });
}

describe("English content parity automation control V2", () => {
  it("materializes a deterministic V1 shadow without losing lane state", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const v2 = JSON.parse(fs.readFileSync(V2_PATH, "utf8"));
    expect(validateV2Master({ v1, v2 })).toEqual({ ok: true, errors: [] });
    expect(validateV2Control()).toMatchObject({ ok: true, lane_count: 9, receipt_count: 0 });
    expect(v2.state_machine.ordered_states).toEqual(V2_ORDERED_STATES);
    expect(v2.state_machine.ordered_states).not.toContain("editorial_approved");
    for (const v1Lane of v1.lanes) {
      const v2Lane = v2.lanes.find((lane: { lane_id: string }) => lane.lane_id === v1Lane.lane_id);
      if (v2Lane.lane_manifest_ref === null) {
        expect(v2Lane.status).toBe(mapV1Status(v1Lane.status));
      } else {
        expect(v2Lane.status).not.toBe("blocked");
      }
      expect(v2Lane.counts).toEqual(v1Lane.counts);
      if (v2Lane.lane_manifest_ref === null) {
        expect(v2Lane.package_sha256).toBe(v1Lane.package_sha256);
        expect(v2Lane.qa_report_ref).toBe(v1Lane.qa_report_ref);
      }
    }
  });

  it("maps editorial approval to draft import and isolates human evidence", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const lane = v1.lanes.find((item: { lane_id: string }) => item.lane_id === "W8");
    lane.status = "editorial_approved";
    lane.gate_lineage = [{
      status: "editorial_approved",
      evidence_owner_lane_id: "CONTROL",
      report_ref: "generated/en-content-parity/CONTROL-approvals/legacy.json",
      report_sha256: "4".repeat(64),
      package_sha256: "5".repeat(64),
      accepted_at: "2026-08-02T00:00:00Z",
    }];
    const migrated = migrateV1ToV2(v1, "6".repeat(64));
    const migratedLane = migrated.lanes.find((item: { lane_id: string }) => item.lane_id === "W8")!;
    expect(migratedLane.status).toBe("draft_imported");
    expect(migratedLane.gate_lineage).toEqual([]);
    expect(migratedLane.legacy_lineage).toHaveLength(1);
    expect(migratedLane.legacy_lineage[0].transition_dependency_allowed).toBe(false);
  });

  it("fixes one automatic release policy for every producer lane", () => {
    const v2 = JSON.parse(fs.readFileSync(V2_PATH, "utf8"));
    expect(v2.release_policy_template).toEqual(RELEASE_POLICY);
    for (const lane of v2.lanes.filter((item: { lane_kind: string }) => item.lane_kind === "producer")) {
      expect(lane.release_policy).toEqual(RELEASE_POLICY);
    }
    expect(v2.qa_policy).toMatchObject({
      execution_mode: "independent_required_check_in_same_producer_pr",
      blocked_behavior: "fail_current_producer_pr_and_repair_in_same_pr",
      separate_w9_evidence_pr_allowed: false,
      blocked_control_reset_pr_allowed: false,
      refreeze_acceptance_pr_allowed: false,
    });
    expect(v2.state_machine.state_control_pr_required).toBe(false);
  });

  it("gives required contract CI read-only GitHub authentication for receipt provenance", () => {
    const workflow = fs.readFileSync(path.join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(workflow).toContain("actions: read");
    expect(workflow).toContain("GH_TOKEN: ${{ github.token }}");
    expect(workflow).toContain("EN_PARITY_CURRENT_PR_HEAD: ${{ github.event.pull_request.head.sha || '' }}");
    expect(workflow).toContain("fetch-depth: 0");
  });

  it("requires deployed-source ancestry and the T1 workflow repair without coupling receipts to the newest main head", () => {
    const validator = fs.readFileSync(path.join(ROOT, "scripts/seo/validate-en-content-parity-control-v2.mjs"), "utf8");
    expect(validator).toContain("1f863f4b8f63d86149d5bc0fe7563c4936e86446");
    expect(validator).toContain("receipt_source_is_not_reachable_from_workflow_head");
    expect(validator).toContain("workflow_head_predates_deployed_executor_provenance_repair");
    expect(validator).toContain("receipt_source_predates_minimum_executor_commit");
    expect(validator).not.toContain("run.head_sha !== receipt.source_commit");
  });

  it("accepts only the exact chained backend import, publication and live-QA receipts", () => {
    expect(validateChain(validReceiptChain())).toEqual({ ok: true, errors: [] });
    expect(validateChain(validReceiptChain().slice(0, 1), "draft_imported")).toEqual({ ok: true, errors: [] });
    expect(validateChain(validReceiptChain().slice(0, 2), "published")).toEqual({ ok: true, errors: [] });
  });

  it("accepts a newer trusted main workflow head while preserving the deployed receipt source commit", () => {
    const chain = validReceiptChain();
    expect(validateReceiptChain({
      entries: chain,
      ...expected,
      provenance: { ...trustedProvenance(chain), head_sha: "f".repeat(40) },
    })).toEqual({ ok: true, errors: [] });
  });

  it("rejects provenance whose declared deployed source commit differs from the receipt chain", () => {
    const chain = validReceiptChain();
    expect(validateReceiptChain({
      entries: chain,
      ...expected,
      provenance: { ...trustedProvenance(chain), source_commit: "e".repeat(40) },
    }).errors).toContain("workflow provenance source commit mismatch");
  });

  it("preserves a verified prefix when a later workflow phase fails", () => {
    const prefix = validReceiptChain().slice(0, 2);
    expect(validateReceiptChain({
      entries: prefix,
      ...expected,
      targetStatus: "published",
      provenance: { ...trustedProvenance(prefix), conclusion: "failure" },
    })).toEqual({ ok: true, errors: [] });
  });

  it("rejects a truncated registered prefix and an unpinned release policy", () => {
    const fullChain = validReceiptChain();
    const prefix = fullChain.slice(0, 1);
    expect(validateReceiptChain({
      entries: prefix,
      ...expected,
      targetStatus: "draft_imported",
      provenance: trustedProvenance(fullChain),
    }).ok).toBe(false);

    const changedPolicy = "9".repeat(64);
    const changedChain = validReceiptChain().map((entry) => receiptBytes({
      ...entry.receipt,
      release_policy_sha256: changedPolicy,
    }));
    expect(validateReceiptChain({
      entries: changedChain,
      ...expected,
      releasePolicySha256: changedPolicy,
      provenance: trustedProvenance(changedChain),
    }).errors).toContain("release policy SHA is not the pinned V2 policy");
  });

  it.each([
    ["missing receipt", (chain: ReturnType<typeof validReceiptChain>) => chain.slice(0, 2)],
    ["duplicate dispatch", (chain: ReturnType<typeof validReceiptChain>) => [...chain, chain[2]]],
    ["cross lane", (chain: ReturnType<typeof validReceiptChain>) => {
      chain[1] = receiptBytes({ ...chain[1].receipt, lane: "W2" });
      return chain;
    }],
    ["cross package", (chain: ReturnType<typeof validReceiptChain>) => {
      chain[0] = receiptBytes({ ...chain[0].receipt, package_sha256: "9".repeat(64) });
      return chain;
    }],
    ["wrong count", (chain: ReturnType<typeof validReceiptChain>) => {
      chain[2] = receiptBytes({ ...chain[2].receipt, readback_count: 6 });
      return chain;
    }],
    ["forged predecessor", (chain: ReturnType<typeof validReceiptChain>) => {
      chain[2] = receiptBytes({ ...chain[2].receipt, previous_receipt_sha256: "8".repeat(64) });
      return chain;
    }],
  ])("rejects %s", (_name, mutate) => {
    expect(validateChain(mutate(validReceiptChain())).ok).toBe(false);
  });

  it("rejects human approval evidence as a promotion receipt", () => {
    const chain = validReceiptChain();
    chain[0] = receiptBytes({ ...chain[0].receipt, receipt_kind: "controlled_transition_approval" });
    expect(validateChain(chain).ok).toBe(false);
  });

  it("rejects locally fabricated receipt bytes without trusted GitHub provenance", () => {
    const chain = validReceiptChain();
    expect(validateReceiptChain({ entries: chain, ...expected, provenance: null }).ok).toBe(false);
  });

  it("keeps lane-local receipt validity independent of unrelated master changes", () => {
    const before = validateChain(validReceiptChain());
    const v2 = JSON.parse(fs.readFileSync(V2_PATH, "utf8"));
    v2.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8").next_action = "unrelated lane update";
    const after = validateChain(validReceiptChain());
    expect(before).toEqual({ ok: true, errors: [] });
    expect(after).toEqual(before);
  });

  it("materializes an exact SHA-bound lane manifest instead of discarding it", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const inputs: {
      schema_version: string;
      artifact_kind: string;
      lane_manifests: Array<Record<string, unknown>>;
      receipt_chains: Array<Record<string, unknown>>;
    } = {
      schema_version: "fermatmind.en_content_parity_control_inputs.v2",
      artifact_kind: "control_materialization_inputs",
      lane_manifests: [],
      receipt_chains: [],
    };
    const directory = fs.mkdtempSync(path.join(ROOT, ".v2-lane-manifest-test-"));
    try {
      const inventoryEvidencePath = path.join(directory, "inventory-evidence.json");
      const productionEvidencePath = path.join(directory, "production-evidence.json");
      fs.writeFileSync(inventoryEvidencePath, '{"ok":true}\n');
      fs.writeFileSync(productionEvidencePath, '{"ok":true}\n');
      const manifestPath = path.join(directory, "lane.json");
      const relativePath = path.relative(ROOT, manifestPath);
      const laneManifest = {
        $schema: "./en-content-parity-control-master.v2.schema.json",
        schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
        artifact_kind: "lane_manifest",
        lane_id: "W8",
        subscope: null,
        status: "package_in_progress",
        blocked_from_status: null,
        package_sha256: null,
        qa_report_ref: null,
        gate_lineage: [],
        legacy_lineage: [],
        blockers: [],
        transition_trace: [
          {
            from_status: "not_started",
            to_status: "inventory_frozen",
            evidence_ref: path.relative(ROOT, inventoryEvidencePath),
            evidence_sha256: sha256(fs.readFileSync(inventoryEvidencePath)),
            recorded_at: "2026-08-02T00:00:00Z",
          },
          {
            from_status: "inventory_frozen",
            to_status: "package_in_progress",
            evidence_ref: path.relative(ROOT, productionEvidencePath),
            evidence_sha256: sha256(fs.readFileSync(productionEvidencePath)),
            recorded_at: "2026-08-02T00:01:00Z",
          },
        ],
        reviewed_source_commit: null,
        expected_count: null,
      };
      fs.writeFileSync(manifestPath, `${JSON.stringify(laneManifest, null, 2)}\n`);
      inputs.lane_manifests.push({ lane_id: "W8", subscope: null, path: relativePath, sha256: sha256(fs.readFileSync(manifestPath)) });
      const v1Bytes = fs.readFileSync(V1_PATH);
      const inputsBytes = Buffer.from(JSON.stringify(inputs));
      const v2 = migrateV1ToV2(v1, sha256(v1Bytes), inputs, sha256(inputsBytes));
      const materialized = applyMaterializationInputs(v2, inputs);
      const w8 = materialized.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8");
      expect(w8.status).toBe("package_in_progress");
      expect(w8.lane_manifest_ref).toBe(relativePath);
      expect(validateV2Master({
        v1,
        v2: materialized,
        inputs,
        v1Bytes,
        inputsBytes,
        expectedV2: materialized,
      })).toEqual({ ok: true, errors: [] });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects promotion facts and self-declared QA from lane manifests", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const v2 = migrateV1ToV2(v1, "6".repeat(64));
    const directory = fs.mkdtempSync(path.join(ROOT, ".v2-lane-manifest-guard-test-"));
    try {
      const base = {
        $schema: "./en-content-parity-control-master.v2.schema.json",
        schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
        artifact_kind: "lane_manifest",
        lane_id: "W8",
        subscope: null,
        blocked_from_status: null,
        package_sha256: PACKAGE_SHA,
        qa_report_ref: null,
        gate_lineage: [],
        legacy_lineage: [],
        blockers: [],
        transition_trace: [],
        reviewed_source_commit: null,
        expected_count: null,
      };
      for (const [name, manifest] of [
        ["promotion", { ...base, status: "published" }],
        ["self-qa", { ...base, status: "qa_pass" }],
      ] as const) {
        const manifestPath = path.join(directory, `${name}.json`);
        fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        const inputs = {
          schema_version: "fermatmind.en_content_parity_control_inputs.v2",
          artifact_kind: "control_materialization_inputs",
          lane_manifests: [{
            lane_id: "W8",
            subscope: null,
            path: path.relative(ROOT, manifestPath),
            sha256: sha256(fs.readFileSync(manifestPath)),
          }],
          receipt_chains: [],
        };
        expect(() => applyMaterializationInputs(structuredClone(v2), inputs)).toThrow(/lane_manifest_/);
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("accepts QA only with gap-free package and independent W9 lineage", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const v2 = migrateV1ToV2(v1, "6".repeat(64));
    const directory = fs.mkdtempSync(
      path.join(ROOT, "generated/en-content-parity/W9-independent-qa/.v2-lane-manifest-w9-test-"),
    );
    try {
      const reviewedSourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
      const evidencePaths = ["inventory", "production", "package"].map((name) => path.join(directory, `${name}.json`));
      for (const evidencePath of evidencePaths.slice(0, 2)) fs.writeFileSync(evidencePath, '{"ok":true}\n');
      const packageRoot = path.join(directory, "package");
      fs.mkdirSync(packageRoot);
      const payloadPath = path.join(packageRoot, "assets.jsonl");
      const recordIds = Array.from({ length: 1046 }, (_, index) => `career-job-${index + 1}`);
      fs.writeFileSync(
        payloadPath,
        recordIds.map((assetId) => JSON.stringify({ asset_id: assetId })).join("\n") + "\n",
      );
      const packageRootRef = path.relative(ROOT, packageRoot);
      const payloads = [{
        path: path.relative(ROOT, payloadPath),
        sha256: sha256(fs.readFileSync(payloadPath)),
        row_count: 1046,
      }];
      const packageManifestPath = path.join(packageRoot, "sha256_manifest.json");
      const packageManifest = {
        schema_version: "fermatmind.en_content_parity_package_payload_manifest.v2",
        artifact_kind: "package_payload_manifest",
        package_root: packageRootRef,
        record_identity_field: "asset_id",
        record_ids_sha256: sha256(canonicalJson([...recordIds].sort())),
        payloads,
      };
      fs.writeFileSync(packageManifestPath, `${JSON.stringify(packageManifest, null, 2)}\n`);
      const packageIdentity = {
        lane_id: "W8",
        subscope_id: null,
        expected_count: 1046,
        asset_ids: ["ENPARITY-W8-CAREER-JOB-PROJECTION"],
        package_root: packageRootRef,
        package_manifest_ref: path.relative(ROOT, packageManifestPath),
        package_manifest_sha256: sha256(fs.readFileSync(packageManifestPath)),
        record_identity_field: "asset_id",
        record_ids_sha256: sha256(canonicalJson([...recordIds].sort())),
        payloads,
      };
      const packageSha = sha256(canonicalJson(packageIdentity));
      const packageEvidence = {
        $schema: "./en-content-parity-control-master.v2.schema.json",
        schema_version: "fermatmind.en_content_parity_package_freeze.v2",
        artifact_kind: "package_freeze_evidence",
        ...packageIdentity,
        package_sha256: packageSha,
      };
      fs.writeFileSync(evidencePaths[2], `${JSON.stringify(packageEvidence, null, 2)}\n`);
      const reportPath = path.join(directory, "report.json");
      const reportRef = path.relative(ROOT, reportPath);
      const report = {
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v2",
        artifact_kind: "independent_qa_report",
        qa_lane_id: "W9",
        producer_lane_id: "W8",
        subscope_id: null,
        package_sha256: packageSha,
        reviewed_source_commit: reviewedSourceCommit,
        reviewed_asset_ids: ["ENPARITY-W8-CAREER-JOB-PROJECTION"],
        reviewed_row_count: 1046,
        verdict: "PASS",
        checks: {
          language_naturalness: "PASS",
          grammar: "PASS",
          markdown_integrity: "PASS",
          source_equivalence: "PASS",
          chinese_leakage: "PASS",
          claim_boundary: "PASS",
          asset_integrity: "PASS",
        },
      };
      fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
      const reportSha = sha256(fs.readFileSync(reportPath));
      const manifest = {
        $schema: "./en-content-parity-control-master.v2.schema.json",
        schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
        artifact_kind: "lane_manifest",
        lane_id: "W8",
        subscope: null,
        status: "qa_pass",
        blocked_from_status: null,
        package_sha256: packageSha,
        qa_report_ref: reportRef,
        gate_lineage: [
          {
            status: "package_frozen",
            evidence_owner_lane_id: "W8",
            report_ref: path.relative(ROOT, evidencePaths[2]),
            report_sha256: sha256(fs.readFileSync(evidencePaths[2])),
            package_sha256: packageSha,
            accepted_at: "2026-08-02T00:00:00Z",
          },
          {
            status: "qa_pass",
            evidence_owner_lane_id: "W9",
            report_ref: reportRef,
            report_sha256: reportSha,
            package_sha256: packageSha,
            accepted_at: "2026-08-02T00:01:00Z",
          },
        ],
        legacy_lineage: [],
        blockers: [],
        transition_trace: [
          ...[
            ["not_started", "inventory_frozen", evidencePaths[0]],
            ["inventory_frozen", "package_in_progress", evidencePaths[1]],
            ["package_in_progress", "package_frozen", evidencePaths[2]],
            ["package_frozen", "qa_pass", reportPath],
          ].map(([fromStatus, toStatus, evidencePath], index) => ({
            from_status: fromStatus,
            to_status: toStatus,
            evidence_ref: path.relative(ROOT, evidencePath),
            evidence_sha256: sha256(fs.readFileSync(evidencePath)),
            recorded_at: `2026-08-02T00:0${index}:00Z`,
          })),
        ],
        reviewed_source_commit: reviewedSourceCommit,
        expected_count: 1046,
      };
      const manifestPath = path.join(directory, "lane.json");
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const inputs = {
        schema_version: "fermatmind.en_content_parity_control_inputs.v2",
        artifact_kind: "control_materialization_inputs",
        lane_manifests: [{
          lane_id: "W8",
          subscope: null,
          path: path.relative(ROOT, manifestPath),
          sha256: sha256(fs.readFileSync(manifestPath)),
        }],
        receipt_chains: [],
      };
      manifest.expected_count = 7;
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const incompleteInputs = structuredClone(inputs);
      incompleteInputs.lane_manifests[0].sha256 = sha256(fs.readFileSync(manifestPath));
      expect(() => applyMaterializationInputs(v2, incompleteInputs)).toThrow(
        "lane_manifest_independent_w9_lineage_invalid=W8",
      );
      manifest.expected_count = 1046;
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const forgedCountManifest = {
        ...manifest,
        counts: {
          cohort_count: 1,
          expected_en_assets: 7,
          current_en_assets: 7,
          remaining_en_assets: 0,
          unknown_inventory_cohorts: 0,
        },
      };
      fs.writeFileSync(manifestPath, `${JSON.stringify(forgedCountManifest, null, 2)}\n`);
      const forgedCountInputs = structuredClone(inputs);
      forgedCountInputs.lane_manifests[0].sha256 = sha256(fs.readFileSync(manifestPath));
      expect(() => applyMaterializationInputs(structuredClone(v2), forgedCountInputs)).toThrow(
        "lane_manifest_counts_forbidden=W8",
      );
      const originalPayloadBytes = fs.readFileSync(payloadPath);
      fs.writeFileSync(
        payloadPath,
        Array.from({ length: 1046 }, () => JSON.stringify({ asset_id: "duplicate-career-job" })).join("\n") + "\n",
      );
      payloads[0].sha256 = sha256(fs.readFileSync(payloadPath));
      fs.writeFileSync(packageManifestPath, `${JSON.stringify(packageManifest, null, 2)}\n`);
      packageEvidence.package_manifest_sha256 = sha256(fs.readFileSync(packageManifestPath));
      fs.writeFileSync(evidencePaths[2], `${JSON.stringify(packageEvidence, null, 2)}\n`);
      manifest.gate_lineage[0].report_sha256 = sha256(fs.readFileSync(evidencePaths[2]));
      manifest.transition_trace[2].evidence_sha256 = sha256(fs.readFileSync(evidencePaths[2]));
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const duplicateIdentityInputs = structuredClone(inputs);
      duplicateIdentityInputs.lane_manifests[0].sha256 = sha256(fs.readFileSync(manifestPath));
      expect(() => applyMaterializationInputs(structuredClone(v2), duplicateIdentityInputs)).toThrow(
        "lane_manifest_package_record_identity_set_invalid=W8",
      );
      fs.writeFileSync(payloadPath, originalPayloadBytes);
      payloads[0].sha256 = sha256(originalPayloadBytes);
      fs.writeFileSync(packageManifestPath, `${JSON.stringify(packageManifest, null, 2)}\n`);
      packageEvidence.package_manifest_sha256 = sha256(fs.readFileSync(packageManifestPath));
      fs.writeFileSync(evidencePaths[2], "{}\n");
      manifest.gate_lineage[0].report_sha256 = sha256(fs.readFileSync(evidencePaths[2]));
      manifest.transition_trace[2].evidence_sha256 = sha256(fs.readFileSync(evidencePaths[2]));
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const invalidFreezeInputs = structuredClone(inputs);
      invalidFreezeInputs.lane_manifests[0].sha256 = sha256(fs.readFileSync(manifestPath));
      expect(() => applyMaterializationInputs(structuredClone(v2), invalidFreezeInputs)).toThrow(
        "lane_manifest_package_freeze_evidence_invalid=W8",
      );
      fs.writeFileSync(evidencePaths[2], `${JSON.stringify(packageEvidence, null, 2)}\n`);
      manifest.gate_lineage[0].report_sha256 = sha256(fs.readFileSync(evidencePaths[2]));
      manifest.transition_trace[2].evidence_sha256 = sha256(fs.readFileSync(evidencePaths[2]));
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const originalExpectedHead = process.env.EN_PARITY_CURRENT_PR_HEAD;
      process.env.EN_PARITY_CURRENT_PR_HEAD = reviewedSourceCommit;
      let materialized;
      try {
        materialized = applyMaterializationInputs(v2, inputs);
      } finally {
        if (originalExpectedHead === undefined) delete process.env.EN_PARITY_CURRENT_PR_HEAD;
        else process.env.EN_PARITY_CURRENT_PR_HEAD = originalExpectedHead;
      }
      expect(materialized.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8")).toMatchObject({
        status: "qa_pass",
        package_sha256: packageSha,
        qa_report_ref: reportRef,
      });

      const preflightPath = path.join(directory, "preflight.json");
      const preflightRef = path.relative(ROOT, preflightPath);
      const preflight = receiptBytes({
        schema_version: "fermatmind.content_promotion_receipt.v2",
        receipt_kind: "content_promotion_preflight_receipt",
        result: "SUCCEEDED",
        phase: "preflight",
        adapter: "career_jobs",
        lane: "W8",
        subscope: null,
        source_repository: "fermatmind/fap-api",
        source_commit: "8e738763162ff7c1507e28fa30d1b8cb7154de85",
        package_path: "content_assets/en-content-parity/W8-career-jobs",
        package_sha256: packageSha,
        executor_release_sha256: "2".repeat(64),
        release_policy_sha256: POLICY_SHA,
        workflow_run_id: "30715225574",
        workflow_run_attempt: 1,
        idempotency_key: "3".repeat(64),
        expected_count: 1046,
        written_count: 0,
        readback_count: 1046,
        published_count: 0,
        previous_receipt_sha256: null,
        rollback_reference: null,
        locale_check: "PASS",
        cjk_leakage_check: "PASS",
        identity_check: "PASS",
        privacy_redaction: true,
        private_payload_read_count: 0,
        server_topology_exposed: false,
        indexability_mutation_count: 0,
        sitemap_mutation_count: 0,
        llms_mutation_count: 0,
        search_mutation_count: 0,
        deploy_mutation_count: 0,
      });
      fs.writeFileSync(preflightPath, preflight.bytes);
      manifest.status = "dry_run_ready";
      manifest.gate_lineage.push({
        status: "dry_run_ready",
        evidence_owner_lane_id: "fap-api",
        report_ref: preflightRef,
        report_sha256: sha256(preflight.bytes),
        package_sha256: packageSha,
        accepted_at: "2026-08-02T00:02:00Z",
      });
      manifest.transition_trace.push({
        from_status: "qa_pass",
        to_status: "dry_run_ready",
        evidence_ref: preflightRef,
        evidence_sha256: sha256(preflight.bytes),
        recorded_at: "2026-08-02T00:02:00Z",
      });
      const dryRunLineage = manifest.gate_lineage.at(-1);
      const dryRunTransition = manifest.transition_trace.at(-1);
      if (!dryRunLineage || !dryRunTransition) throw new Error("dry run test fixture is incomplete");
      fs.writeFileSync(preflightPath, "{}\n");
      dryRunLineage.report_sha256 = sha256(fs.readFileSync(preflightPath));
      dryRunTransition.evidence_sha256 = sha256(fs.readFileSync(preflightPath));
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const invalidDryRunInputs = structuredClone(inputs);
      invalidDryRunInputs.lane_manifests[0].sha256 = sha256(fs.readFileSync(manifestPath));
      const originalDryRunExpectedHead = process.env.EN_PARITY_CURRENT_PR_HEAD;
      process.env.EN_PARITY_CURRENT_PR_HEAD = reviewedSourceCommit;
      try {
        expect(() => applyMaterializationInputs(migrateV1ToV2(v1, "6".repeat(64)), invalidDryRunInputs)).toThrow(
          "lane_manifest_dry_run_evidence_invalid=W8",
        );

        fs.writeFileSync(preflightPath, preflight.bytes);
        dryRunLineage.report_sha256 = sha256(preflight.bytes);
        dryRunTransition.evidence_sha256 = sha256(preflight.bytes);
        fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        const validDryRunInputs = structuredClone(inputs);
        validDryRunInputs.lane_manifests[0].sha256 = sha256(fs.readFileSync(manifestPath));
        expect(applyMaterializationInputs(migrateV1ToV2(v1, "6".repeat(64)), validDryRunInputs)
          .lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8").status).toBe("dry_run_ready");
      } finally {
        if (originalDryRunExpectedHead === undefined) delete process.env.EN_PARITY_CURRENT_PR_HEAD;
        else process.env.EN_PARITY_CURRENT_PR_HEAD = originalDryRunExpectedHead;
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("recomputes split-lane status from the least-progressed subscope", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const v2 = migrateV1ToV2(v1, "6".repeat(64));
    const w1 = v2.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W1");
    const inputs = {
      schema_version: "fermatmind.en_content_parity_control_inputs.v2",
      artifact_kind: "control_materialization_inputs",
      lane_manifests: [],
      receipt_chains: w1.subscopes.map((subscope: { id: string; package_sha256: string }, index: number) => ({
        lane_id: "W1",
        subscope: subscope.id,
        package_sha256: subscope.package_sha256,
        expected_count: [7, 46][index],
        release_policy_sha256: POLICY_SHA,
        target_status: "published",
        receipt_paths: [`receipt-${index}-draft.json`, `receipt-${index}-publication.json`],
      })),
    };
    expect(() => applyMaterializationInputs(structuredClone(v2), {
      ...inputs,
      receipt_chains: [inputs.receipt_chains[0], inputs.receipt_chains[0]],
    })).toThrow(/duplicate_receipt_chain_binding/);
    const wrongCountInputs = structuredClone(inputs);
    wrongCountInputs.receipt_chains[0].expected_count = 1;
    expect(() => applyMaterializationInputs(structuredClone(v2), wrongCountInputs)).toThrow(
      "receipt_chain_registered_count_mismatch=W1:W1-MBTI-COMPARISONS",
    );
    const materialized = applyMaterializationInputs(v2, inputs);
    expect(materialized.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W1").status).toBe("published");
  });

  it("lets a migrated qa_pass lane retain its V1 QA lineage when entering dry-run", () => {
    const v1 = JSON.parse(fs.readFileSync(V1_PATH, "utf8"));
    const v2 = migrateV1ToV2(v1, "6".repeat(64));
    const w2 = v2.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W2");
    const directory = fs.mkdtempSync(path.join(ROOT, ".v2-migrated-qa-dry-run-test-"));
    try {
      const preflightPath = path.join(directory, "preflight.json");
      const preflight = receiptBytes({
        schema_version: "fermatmind.content_promotion_receipt.v2",
        receipt_kind: "content_promotion_preflight_receipt",
        result: "SUCCEEDED",
        phase: "preflight",
        adapter: "big_five",
        lane: "W2",
        subscope: null,
        source_repository: "fermatmind/fap-api",
        source_commit: "8e738763162ff7c1507e28fa30d1b8cb7154de85",
        package_path: "content_packs/BIG5_OCEAN/v2/packages/en_parity/w2_result_content_v1",
        package_sha256: w2.package_sha256,
        executor_release_sha256: "2".repeat(64),
        release_policy_sha256: POLICY_SHA,
        workflow_run_id: "30715225574",
        workflow_run_attempt: 1,
        idempotency_key: "3".repeat(64),
        expected_count: 118,
        written_count: 0,
        readback_count: 118,
        published_count: 0,
        previous_receipt_sha256: null,
        rollback_reference: null,
        locale_check: "PASS",
        cjk_leakage_check: "PASS",
        identity_check: "PASS",
        privacy_redaction: true,
        private_payload_read_count: 0,
        server_topology_exposed: false,
        indexability_mutation_count: 0,
        sitemap_mutation_count: 0,
        llms_mutation_count: 0,
        search_mutation_count: 0,
        deploy_mutation_count: 0,
      });
      fs.writeFileSync(preflightPath, preflight.bytes);
      const preflightRef = path.relative(ROOT, preflightPath);
      const manifest = {
        $schema: "./en-content-parity-control-master.v2.schema.json",
        schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
        artifact_kind: "lane_manifest",
        lane_id: "W2",
        subscope: null,
        status: "dry_run_ready",
        blocked_from_status: null,
        package_sha256: w2.package_sha256,
        qa_report_ref: w2.qa_report_ref,
        gate_lineage: [...w2.gate_lineage, {
          status: "dry_run_ready",
          evidence_owner_lane_id: "fap-api",
          report_ref: preflightRef,
          report_sha256: sha256(preflight.bytes),
          package_sha256: w2.package_sha256,
          accepted_at: "2026-08-02T00:00:00Z",
        }],
        legacy_lineage: w2.legacy_lineage,
        blockers: [],
        transition_trace: [{
          from_status: "qa_pass",
          to_status: "dry_run_ready",
          evidence_ref: preflightRef,
          evidence_sha256: sha256(preflight.bytes),
          recorded_at: "2026-08-02T00:00:00Z",
        }],
        reviewed_source_commit: null,
        expected_count: null,
      };
      const manifestPath = path.join(directory, "lane.json");
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const inputs = {
        schema_version: "fermatmind.en_content_parity_control_inputs.v2",
        artifact_kind: "control_materialization_inputs",
        lane_manifests: [{
          lane_id: "W2",
          subscope: null,
          path: path.relative(ROOT, manifestPath),
          sha256: sha256(fs.readFileSync(manifestPath)),
        }],
        receipt_chains: [],
      };
      expect(applyMaterializationInputs(v2, inputs).lanes.find((lane: { lane_id: string }) => lane.lane_id === "W2").status)
        .toBe("dry_run_ready");
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects replacing a verified receipt state with an older prefix for the same package", () => {
    const previous = migrateV1ToV2(JSON.parse(fs.readFileSync(V1_PATH, "utf8")), "6".repeat(64));
    const current = structuredClone(previous);
    const previousW8 = previous.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8");
    const currentW8 = current.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8");
    Object.assign(previousW8, { status: "live_qa_pass", package_sha256: PACKAGE_SHA });
    Object.assign(currentW8, { status: "draft_imported", package_sha256: PACKAGE_SHA });
    expect(validatePromotionMonotonicity(current, previous)).toEqual({
      ok: false,
      errors: ["promotion_state_regression=W8:-:live_qa_pass->draft_imported"],
    });
  });
});
