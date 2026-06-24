import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet.v1.json";
const REPORT_PATH = "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet-2026-06-24.md";
const COMMON_CONTRACT_PATH = "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json";
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

describe("Assessment Hub six-route metadata parity packet", () => {
  it("consumes the common contract and records the post-repair live PASS", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const status = asRecord(packet.route_metadata_packet_status);

    expect(packet.schema_version).toBe("fermatmind.assessment_hub_qa.route_metadata_parity_packet.v1");
    expect(packet.task_id).toBe("ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01");
    expect(packet.consumes_common_contract).toBe(common.task_id);
    expect(packet.verdict).toBe("PASS_ROUTE_METADATA_INDEXABILITY_SCHEMA_DISCOVERABILITY_PARITY");
    expect(status).toMatchObject({
      route_count: 12,
      pass_count: 12,
      hold_count: 0,
      fail_count: 0,
      status: "PASS",
    });
    expect(status.blocking_reason).toBeNull();
  });

  it("records the post-repair live recheck and superseded HOLD evidence", () => {
    const packet = readJson(PACKET_PATH);
    const rechecks = asRecordArray(packet.current_live_rechecks);

    expect(rechecks).toHaveLength(1);
    expect(rechecks[0].ok).toBe(true);
    expect(asRecord(rechecks[0].shared_resources).sitemap_status).toBe(200);
    expect(asRecord(rechecks[0].shared_resources).llms_full_status).toBe(200);
    expect(asRecord(rechecks[0].summary).failing_surfaces).toBe(0);
    expect(rechecks[0].repair_pr).toBe("https://github.com/fermatmind/fap-web/pull/1420");
    expect(rechecks[0].repair_merge_commit).toBe("71325857228de2283b69d4f84da415226d8f0ecd");
    expect(asRecordArray(packet.superseded_hold_rechecks)).toHaveLength(2);

    const spotChecks = asRecord(packet.direct_readonly_spot_checks);
    expect(spotChecks.llms_txt_contains_12_routes).toBe(true);
    expect(spotChecks.llms_full_txt_contains_12_routes).toBe(true);
    expect(spotChecks.sitemap_xml_contains_12_routes).toBe(true);
    expect(spotChecks.mutation_performed).toBe(false);
  });

  it("keeps all 12 public assessment routes in PASS with required metadata fields", () => {
    const packet = readJson(PACKET_PATH);
    const surfaces = asRecordArray(packet.surfaces);

    expect(surfaces).toHaveLength(12);
    expect(new Set(surfaces.map((surface) => surface.scale_code))).toEqual(
      new Set(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "RIASEC", "IQ_RAVEN", "EQ_60"])
    );
    expect(surfaces.every((surface) => surface.parity_verdict === "PASS")).toBe(true);
    expect(surfaces.every((surface) => surface.http_status === 200)).toBe(true);
    expect(surfaces.every((surface) => typeof surface.title === "string" && String(surface.title).length > 0)).toBe(true);
    expect(surfaces.every((surface) => typeof surface.meta_description === "string" && String(surface.meta_description).length > 0)).toBe(true);
    expect(surfaces.every((surface) => typeof surface.h1 === "string" && String(surface.h1).length > 0)).toBe(true);
    expect(surfaces.every((surface) => surface.sitemap_presence === true)).toBe(true);
    expect(surfaces.every((surface) => surface.llms_presence === true)).toBe(true);
    expect(surfaces.every((surface) => surface.llms_full_presence === true)).toBe(true);
    expect(surfaces.every((surface) => asRecord(surface.api_lookup).is_indexable === true)).toBe(true);
    expect(surfaces.every((surface) => asRecord(surface.sitemap_source).is_indexable === true)).toBe(true);
    expect(surfaces.map((surface) => String(surface.route)).sort()).toEqual([
      "/en/tests/big-five-personality-test-ocean-model",
      "/en/tests/enneagram-personality-test-nine-types",
      "/en/tests/eq-test-emotional-intelligence-assessment",
      "/en/tests/holland-career-interest-test-riasec",
      "/en/tests/iq-test-intelligence-quotient-assessment",
      "/en/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/big-five-personality-test-ocean-model",
      "/zh/tests/enneagram-personality-test-nine-types",
      "/zh/tests/eq-test-emotional-intelligence-assessment",
      "/zh/tests/holland-career-interest-test-riasec",
      "/zh/tests/iq-test-intelligence-quotient-assessment",
      "/zh/tests/mbti-personality-test-16-personality-types",
    ]);
  });

  it("preserves hard holds and defers take-flow CTA detail to PR3", () => {
    const packet = readJson(PACKET_PATH);
    const takeFlow = asRecord(packet.take_flow);

    expect(asStringArray(packet.hard_holds_preserved)).toEqual(
      expect.arrayContaining([
        "no_sitemap_mutation",
        "no_llms_mutation",
        "no_cms_write",
        "no_search_submission",
        "no_provider_call",
        "no_deploy",
        "no_private_result_access",
        "no_post_start_submit_result_api_call",
      ])
    );
    expect(takeFlow.cta_detail_packet).toBe("ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01");
    expect(takeFlow.current_packet_defers_cta_details).toBe(true);
  });

  it("keeps markdown, state, and branch scope aligned", () => {
    const report = readText(REPORT_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];
    const entry = stateEntries.find((item) => item.id === "ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01");
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(report).toContain("Verdict: `PASS_ROUTE_METADATA_INDEXABILITY_SCHEMA_DISCOVERABILITY_PARITY`");
    expect(report).toContain("post-repair read-only live recheck now supports the PASS claim");
    expect(report).toContain("Merge PR2 after checks pass");
    expect(entry).toBeTruthy();
    expect(scopeHelper).toContain("ASSESSMENT_HUB_SIX_ROUTE_METADATA_PARITY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-six-route-metadata-parity-packet-01");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-six-route-metadata-parity-packet.contract.test.ts");
  });
});
