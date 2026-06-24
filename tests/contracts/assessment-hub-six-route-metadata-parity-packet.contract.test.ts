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
  it("consumes the common contract but refuses to claim a false live PASS", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const status = asRecord(packet.route_metadata_packet_status);

    expect(packet.schema_version).toBe("fermatmind.assessment_hub_qa.route_metadata_parity_packet.v1");
    expect(packet.task_id).toBe("ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01");
    expect(packet.consumes_common_contract).toBe(common.task_id);
    expect(packet.verdict).toBe("HOLD_LIVE_DISCOVERABILITY_UNSTABLE");
    expect(status).toMatchObject({
      route_count: 12,
      pass_count: 0,
      hold_count: 12,
      status: "HOLD",
    });
  });

  it("records the two read-only live rechecks and unstable shared resources", () => {
    const packet = readJson(PACKET_PATH);
    const rechecks = asRecordArray(packet.current_live_rechecks);

    expect(rechecks).toHaveLength(2);
    expect(rechecks.every((row) => row.ok === false)).toBe(true);
    expect(asRecord(rechecks[0].shared_resources).sitemap_status).toBe(200);
    expect(asRecord(rechecks[0].shared_resources).llms_full_status).toBe(200);
    expect(asRecord(rechecks[0].repeated_issue).check).toBe("llms_full.route");
    expect(asRecord(rechecks[1].shared_resources).sitemap_status).toBe(500);
    expect(asRecord(rechecks[1].repeated_issue).check).toBe("sitemap.status");

    const spotChecks = asRecord(packet.direct_readonly_spot_checks);
    expect(spotChecks.llms_txt_contains_12_routes).toBe(true);
    expect(spotChecks.llms_full_txt_contains_assessment_urls).toBe(true);
    expect(spotChecks.sitemap_xml_observed_500_once).toBe(true);
    expect(spotChecks.mutation_performed).toBe(false);
  });

  it("keeps all 12 public assessment routes in HOLD until discoverability stabilizes", () => {
    const packet = readJson(PACKET_PATH);
    const surfaces = asRecordArray(packet.surfaces);

    expect(surfaces).toHaveLength(12);
    expect(new Set(surfaces.map((surface) => surface.scale_code))).toEqual(
      new Set(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "RIASEC", "IQ_RAVEN", "EQ_60"])
    );
    expect(surfaces.every((surface) => surface.packet_status === "HOLD")).toBe(true);
    expect(surfaces.every((surface) => surface.hold_reason === "live_discoverability_recheck_unstable")).toBe(true);
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

    expect(report).toContain("Verdict: `HOLD_LIVE_DISCOVERABILITY_UNSTABLE`");
    expect(report).toContain("cannot truthfully record the requested `12/12 PASS`");
    expect(report).toContain("Stop the Assessment Hub QA PR train at PR2");
    expect(entry).toBeTruthy();
    expect(scopeHelper).toContain("ASSESSMENT_HUB_SIX_ROUTE_METADATA_PARITY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/assessment-hub-six-route-metadata-parity-packet-01");
    expect(scopeHelper).toContain("tests/contracts/assessment-hub-six-route-metadata-parity-packet.contract.test.ts");
  });
});
