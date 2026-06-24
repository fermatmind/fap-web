import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json";
const REPORT_PATH = "docs/public-personality/enneagram-public-personality-source-authority-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

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
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

describe("Enneagram Public Personality source authority packet", () => {
  it("declares the dependency and source-authority verdict", () => {
    const packet = readJson(PACKET_PATH);
    const dependency = asRecord(packet.dependency);

    expect(packet.schema_version).toBe("fermatmind.enneagram_public_personality_source_authority_packet.v1");
    expect(packet.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-SOURCE-AUTHORITY-PACKET-01");
    expect(packet.verdict).toBe("MAPPED_PARTIAL");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(dependency.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01");
    expect(dependency.status).toBe("MERGED");
    expect(dependency.pr_url).toBe("https://github.com/fermatmind/fap-web/pull/1386");
    expect(dependency.merge_commit).toBe("2f7deb6e3b594267ea1ade7c01bfbe3e8d749f21");
  });

  it("preserves producing and receiving agent alignment from the common contract", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);

    expect(packet.producing_agent).toBe(common.producing_agent);
    expect(packet.receiving_agent).toBe(common.receiving_agent);
    expect(packet.first_public_personality_scope).toEqual(common.first_public_personality_scope);
    expect(packet.canonical_test_slug).toBe("enneagram-personality-test-nine-types");
  });

  it("keeps fap-api read-only and classifies backend authority sources by path", () => {
    const packet = readJson(PACKET_PATH);
    const repos = asRecord(packet.source_repositories);
    const sources = asRecordArray(packet.consumed_sources);
    const sourceIds = sources.map((source) => source.id);

    expect(repos.fap_api_access_mode).toBe("read_only_evidence_source_only");
    expect(repos.fap_api_mutation).toBe("none");
    expect(repos.private_data_access).toBe("none");
    expect(sourceIds).toEqual(
      expect.arrayContaining([
        "backend_source_ledger",
        "backend_public_projection_service",
        "backend_report_composer",
        "backend_share_summary_contracts",
      ])
    );
    expect(sources.find((source) => source.id === "backend_public_projection_service")?.path).toBe(
      "backend/app/Services/Enneagram/EnneagramPublicProjectionService.php"
    );
    expect(sources.find((source) => source.id === "backend_source_ledger")?.public_personality_source_ledger_state).toBe(
      "missing"
    );
  });

  it("maps fap-web handoff packets without promoting consumer contracts to authority", () => {
    const packet = readJson(PACKET_PATH);
    const sources = asRecordArray(packet.consumed_sources);

    expect(sources.find((source) => source.id === "standard_alignment_proposal")?.current_readiness).toBe(
      "ready_readonly"
    );
    expect(sources.find((source) => source.id === "runtime_qa_consumption_packet")?.runtime_status).toBe("HOLD");
    expect(sources.find((source) => source.id === "analytics_consumption_packet")?.event_emission_status).toBe("HOLD");
    expect(sources.find((source) => source.id === "safety_gate_consumption_packet")?.candidate_generation_status).toBe(
      "HOLD"
    );
    expect(sources.find((source) => source.id === "fap_web_public_profile_boundary_contract")?.classification).toBe(
      "frontend_consumer_contract_not_authority"
    );
  });

  it("asserts reviewed public-safe source authority over fallback, private result text, and unreviewed payloads", () => {
    const packet = readJson(PACKET_PATH);
    const assertions = asRecord(packet.authority_assertions);

    expect(assertions.public_personality_agent_consumes).toBe("reviewed_public_safe_sources_only");
    expect(assertions.backend_public_projection_stronger_than_fap_web_fallback).toBe(true);
    expect(assertions.frontend_consumer_contract_is_content_authority).toBe(false);
    expect(assertions.private_result_text_is_content_authority).toBe(false);
    expect(assertions.unreviewed_candidate_payload_is_content_authority).toBe(false);
    expect(assertions.public_personality_source_ledger_required_before_generation).toBe(true);
    expect(assertions.first_scope_may_plan_hub_and_9_core_types).toBe(true);
    expect(assertions.centers_or_triads_require_source_authority_confirmation).toBe(true);
    expect(assertions.wing_or_instinct_pages_may_be_promoted).toBe(false);
  });

  it("records missing authority gaps required before public content generation or CMS dry run", () => {
    const packet = readJson(PACKET_PATH);
    const gaps = asRecordArray(packet.missing_or_blocked_authority);

    expect(gaps.map((gap) => gap.gap)).toEqual([
      "public_personality_source_ledger",
      "centers_or_triads_source_authority",
      "wing_and_instinct_public_page_authority",
      "cms_generation_package",
    ]);
    expect(gaps.find((gap) => gap.gap === "public_personality_source_ledger")?.status).toBe("missing");
    expect(gaps.find((gap) => gap.gap === "wing_and_instinct_public_page_authority")?.status).toBe("blocked");
  });

  it("preserves CMS, runtime, search, private data, provider, generated page, and fap-api mutation holds", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.hold_actions)).toEqual(
      expect.arrayContaining([
        "cms",
        "publish",
        "search_submission",
        "provider_calls",
        "deploy",
        "runtime_instrumentation",
        "public_personality_runtime_mutation",
        "generated_pages",
        "backend_import",
        "candidate_activation",
        "candidate_payload_generation",
        "private_data",
        "source_ledger_write",
        "fap_api_mutation",
      ])
    );
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.raw_private_result_accessed).toBe("none");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `MAPPED_PARTIAL`");
    expect(report).toContain("fap-api is a read-only evidence source only");
    expect(report).toContain("`reviewed_public_safe_sources_only`");
    expect(report).toContain("Public Personality source ledger state is still `missing`");
    expect(report).toContain("Wing, instinct, subtype, and 54 wing x instinct pages are blocked");
    expect(report).toContain("fap-api mutation: none");
  });

  it("keeps current branch scope limited to PR2 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_PUBLIC_PERSONALITY_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-public-personality-source-authority-packet-01");
    expect(scopeHelper).toContain(
      "docs/public-personality/enneagram-public-personality-source-authority-packet-2026-06-23.md"
    );
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json");
    expect(scopeHelper).toContain(
      "tests/contracts/enneagram-public-personality-source-authority-packet.contract.test.ts"
    );
  });
});
