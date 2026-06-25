import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/assessment-hub/assessment-hub-source-authority-indexability-packet.v1.json";
const REPORT_PATH = "docs/assessment-hub/assessment-hub-source-authority-indexability-packet-2026-06-24.md";
const COMMON_CONTRACT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json";
const METADATA_PACKET_PATH = "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet.v1.json";
const TAKE_FLOW_PACKET_PATH = "docs/assessment-hub/assessment-hub-take-flow-cta-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/assessment-hub/assessment-hub-free-full-report-claim-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const STATE_PATH = "docs/codex/pr-train-state.json";

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

describe("Assessment Hub source authority and indexability packet", () => {
  it("consumes all prior Assessment Hub QA packets and records the PASS verdict", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const metadata = readJson(METADATA_PACKET_PATH);
    const takeFlow = readJson(TAKE_FLOW_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const summary = asRecord(packet.scope_summary);

    expect(packet.schema_version).toBe("fermatmind.assessment_hub_qa.source_authority_indexability_packet.v1");
    expect(packet.task_id).toBe("ASSESSMENT-HUB-SOURCE-AUTHORITY-INDEXABILITY-PACKET-01");
    expect(packet.consumes_common_contract).toBe(common.task_id);
    expect(packet.consumes_route_metadata_packet).toBe(metadata.task_id);
    expect(packet.consumes_take_flow_cta_packet).toBe(takeFlow.task_id);
    expect(packet.consumes_free_full_report_claim_packet).toBe(claim.task_id);
    expect(packet.verdict).toBe("PASS_SOURCE_AUTHORITY_AND_INDEXABILITY_BOUNDARIES_RECORDED");
    expect(summary).toMatchObject({
      route_count: 12,
      scale_count: 6,
      live_recheck_ok: true,
      live_recheck_failing_surfaces: 0,
      sitemap_status: 200,
      llms_status: 200,
      llms_full_status: 200,
      indexable_route_count: 12,
      backend_authority_layers_separated: true,
      fap_web_consumer_is_not_authority: true,
      source_authority_decisions_deferred_for_claim_copy: true,
      sidecar_issue_count: 0,
      status: "PASS",
    });
  });

  it("keeps source authority layers separate from the fap-web consumer", () => {
    const packet = readJson(PACKET_PATH);
    const layers = asRecordArray(packet.authority_layers);
    const layerNames = layers.map((layer) => layer.layer);

    expect(layerNames).toEqual([
      "backend_registry_authority",
      "backend_landing_surface_v1_authority",
      "backend_lookup_projection",
      "cms_landing_surface_overlay",
      "fap_web_consumer_contract_not_authority",
      "sitemap_source_evidence",
      "llms_readonly_evidence",
      "manual_review_required",
    ]);
    expect(layers.find((layer) => layer.layer === "fap_web_consumer_contract_not_authority")).toMatchObject({
      must_not_infer_authority: ["claim approval", "indexability override", "paid unlock state", "CMS publication state"],
    });
    expect(layers.find((layer) => layer.layer === "cms_landing_surface_overlay")).toMatchObject({
      frontend_fallback_allowed: false,
    });
  });

  it("records all 12 public routes as indexability PASS without mutation", () => {
    const packet = readJson(PACKET_PATH);
    const routes = asRecordArray(packet.route_authority_matrix);
    const negative = asRecord(packet.negative_guarantees);
    const liveRecheck = asRecord(packet.live_recheck);

    expect(routes).toHaveLength(12);
    expect(new Set(routes.map((route) => route.scale_code))).toEqual(
      new Set(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "RIASEC", "IQ_RAVEN", "EQ_60"])
    );
    expect(routes.every((route) => asRecord(route.indexability).parity_status === "PASS")).toBe(true);
    expect(routes.every((route) => asRecord(route.indexability).sitemap_presence === true)).toBe(true);
    expect(routes.every((route) => asRecord(route.indexability).llms_presence === true)).toBe(true);
    expect(routes.every((route) => asRecord(route.indexability).llms_full_presence === true)).toBe(true);
    expect(routes.every((route) => asRecord(route.indexability).lookup_is_indexable === true)).toBe(true);
    expect(routes.every((route) => asRecord(route.indexability).sitemap_source_is_indexable === true)).toBe(true);
    expect(asRecord(liveRecheck.summary)).toMatchObject({ surface_count: 12, failing_surfaces: 0 });
    expect(negative).toMatchObject({
      runtime_code_changed: false,
      frontend_public_copy_changed: false,
      cms_write_performed: false,
      search_submission_performed: false,
      provider_call_performed: false,
      deployment_triggered: false,
      sitemap_or_llms_or_schema_mutated: false,
      private_attempt_or_result_accessed: false,
      post_start_submit_result_called: false,
      fap_api_modified: false,
    });
  });

  it("carries forward claim risks without approving runtime copy changes", () => {
    const packet = readJson(PACKET_PATH);
    const carryforward = asRecordArray(packet.claim_risk_carryforward);
    const routes = asRecordArray(packet.route_authority_matrix);

    expect(carryforward.map((risk) => risk.id)).toEqual([
      "P2_PAID_UNLOCK_DISABLED_COPY_RISK",
      "P2_FULL_RESULT_CLAIM_AUTHORITY_REVIEW",
      "P2_MANUAL_REVIEW_REQUIRED_FOR_CERTIFICATE_OR_ANSWER_KEY_CLAIMS",
    ]);
    expect(carryforward.filter((risk) => String(risk.pr5_disposition).includes("NO_RUNTIME_COPY_CHANGE"))).toHaveLength(2);
    expect(routes.filter((route) => asRecord(route.claim_boundary).full_result_claim_recorded === true)).toHaveLength(4);
    expect(routes.filter((route) => asRecord(route.claim_boundary).paid_unlock_disabled_copy_recorded === true)).toHaveLength(8);
    expect(packet.sidecar_issues).toEqual([]);
  });

  it("keeps markdown, state, and branch scope aligned", () => {
    const report = readText(REPORT_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    const entry = stateEntries.find((item) => item.id === "ASSESSMENT-HUB-SOURCE-AUTHORITY-INDEXABILITY-PACKET-01");
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(report).toContain("Verdict: `PASS_SOURCE_AUTHORITY_AND_INDEXABILITY_BOUNDARIES_RECORDED`");
    expect(report).toContain("Sidecar issue count: `0`");
    expect(report).toContain("Next Safe Action");
    expect(entry).toBeTruthy();
    expect(scopeHelper).toContain("ASSESSMENT_HUB_SOURCE_AUTHORITY_INDEXABILITY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-source-authority-indexability-packet-01");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-source-authority-indexability-packet.contract.test.ts");
  });
});
