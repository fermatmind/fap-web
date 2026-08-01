import { createHash } from "node:crypto";
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
    conclusion: "success",
    run_id: first.workflow_run_id,
    run_attempt: first.workflow_run_attempt,
    artifact_name: `content-promotion-${first.lane}-${first.workflow_run_id}-${first.workflow_run_attempt}`,
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
      expect(v2Lane.status).toBe(mapV1Status(v1Lane.status));
      expect(v2Lane.counts).toEqual(v1Lane.counts);
      expect(v2Lane.package_sha256).toBe(v1Lane.package_sha256);
      expect(v2Lane.qa_report_ref).toBe(v1Lane.qa_report_ref);
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

  it("accepts only the exact chained backend import, publication and live-QA receipts", () => {
    expect(validateChain(validReceiptChain())).toEqual({ ok: true, errors: [] });
    expect(validateChain(validReceiptChain().slice(0, 1), "draft_imported")).toEqual({ ok: true, errors: [] });
    expect(validateChain(validReceiptChain().slice(0, 2), "published")).toEqual({ ok: true, errors: [] });
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
    const directory = fs.mkdtempSync(path.join(ROOT, ".v2-lane-manifest-w9-test-"));
    try {
      const reportRef = "generated/en-content-parity/W9-independent-qa/W8-career-job/example/report.json";
      const manifest = {
        $schema: "./en-content-parity-control-master.v2.schema.json",
        schema_version: "fermatmind.en_content_parity_lane_manifest.v2",
        artifact_kind: "lane_manifest",
        lane_id: "W8",
        subscope: null,
        status: "qa_pass",
        blocked_from_status: null,
        package_sha256: PACKAGE_SHA,
        qa_report_ref: reportRef,
        gate_lineage: [
          {
            status: "package_frozen",
            evidence_owner_lane_id: "W8",
            report_ref: "generated/en-content-parity/W8-career-job/editorial_review.json",
            report_sha256: "4".repeat(64),
            package_sha256: PACKAGE_SHA,
            accepted_at: "2026-08-02T00:00:00Z",
          },
          {
            status: "qa_pass",
            evidence_owner_lane_id: "W9",
            report_ref: reportRef,
            report_sha256: "5".repeat(64),
            package_sha256: PACKAGE_SHA,
            accepted_at: "2026-08-02T00:01:00Z",
          },
        ],
        legacy_lineage: [],
        blockers: [],
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
      const materialized = applyMaterializationInputs(v2, inputs);
      expect(materialized.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W8")).toMatchObject({
        status: "qa_pass",
        package_sha256: PACKAGE_SHA,
        qa_report_ref: reportRef,
      });
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
        expected_count: index + 1,
        release_policy_sha256: POLICY_SHA,
        target_status: "published",
        receipt_paths: [`receipt-${index}-draft.json`, `receipt-${index}-publication.json`],
      })),
    };
    const materialized = applyMaterializationInputs(v2, inputs);
    expect(materialized.lanes.find((lane: { lane_id: string }) => lane.lane_id === "W1").status).toBe("published");
  });
});
