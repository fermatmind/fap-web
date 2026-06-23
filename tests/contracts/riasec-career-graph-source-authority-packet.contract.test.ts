import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/career-graph/riasec-career-graph-source-authority-packet.v1.json";
const REPORT_PATH = "docs/career-graph/riasec-career-graph-source-authority-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json";
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

describe("RIASEC Career Graph source authority packet", () => {
  it("declares the dependency and source-authority verdict", () => {
    const packet = readJson(PACKET_PATH);
    const dependency = asRecord(packet.dependency);

    expect(packet.schema_version).toBe("fermatmind.riasec_career_graph_source_authority_packet.v1");
    expect(packet.task_id).toBe("RIASEC-CAREER-GRAPH-SOURCE-AUTHORITY-PACKET-01");
    expect(packet.verdict).toBe("MAPPED_PARTIAL");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(dependency.task_id).toBe("RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01");
    expect(dependency.status).toBe("MERGED");
    expect(dependency.pr_url).toBe("https://github.com/fermatmind/fap-web/pull/1378");
  });

  it("preserves canonical landing, two supported forms, and common bridge contract alignment", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);

    expect(packet.canonical_landing).toBe("holland-career-interest-test-riasec");
    expect(asStringArray(packet.supported_forms)).toEqual(["riasec_60", "riasec_140"]);
    expect(packet.supported_forms).toEqual(common.supported_forms);
  });

  it("keeps fap-api read-only and classifies backend authority sources by path", () => {
    const packet = readJson(PACKET_PATH);
    const repos = asRecord(packet.source_repositories);
    const sources = asRecordArray(packet.consumed_sources);
    const sourceIds = sources.map((source) => source.id);

    expect(repos.fap_api_access_mode).toBe("read_only_evidence_source_only");
    expect(repos.fap_api_mutation).toBe("none");
    expect(sourceIds).toEqual(
      expect.arrayContaining([
        "fap_api_riasec_runtime_career_analytics_handoff",
        "riasec_public_projection_service",
        "riasec_report_composer",
        "riasec_content_registry_slot_contract",
      ])
    );
    expect(sources.find((source) => source.id === "riasec_public_projection_service")?.path).toBe(
      "backend/app/Services/Riasec/RiasecPublicProjectionService.php"
    );
    expect(sources.find((source) => source.id === "riasec_content_registry_slot_contract")?.classification).toBe(
      "backend_reviewed_content_slot_contract"
    );
  });

  it("maps fap-web career and graph evidence without promoting partial authority", () => {
    const packet = readJson(PACKET_PATH);
    const sources = asRecordArray(packet.consumed_sources);

    expect(sources.find((source) => source.id === "career_public_authority_inventory")?.observed_status).toBe("partial");
    expect(sources.find((source) => source.id === "career_public_authority_inventory")?.runtime_expansion_allowed).toBe(
      false
    );
    expect(sources.find((source) => source.id === "career_backend_asset_taxonomy_export")?.observed_status).toBe(
      "incomplete"
    );
    expect(sources.find((source) => source.id === "core_topic_graph_inventory")?.riasec_graph_state).toBe(
      "blocked_7_partial_1"
    );
    expect(sources.find((source) => source.id === "riasec_gaokao_major_cluster_claim_boundary")?.observed_status).toBe(
      "planning_contract_only"
    );
  });

  it("asserts backend public projection authority over fap-web fallback or unreviewed CMS text", () => {
    const packet = readJson(PACKET_PATH);
    const assertions = asRecord(packet.authority_assertions);

    expect(assertions.bridge_consumes).toBe("reviewed_public_projection_only");
    expect(assertions.backend_public_projection_stronger_than_fap_web_fallback).toBe(true);
    expect(assertions.frontend_fallback_copy_is_authority).toBe(false);
    expect(assertions.unreviewed_cms_text_is_authority).toBe(false);
    expect(assertions.riasec_graph_entities_may_be_promoted).toBe(false);
    expect(assertions.career_or_major_examples).toBe("examples_only_exploration_prompts");
  });

  it("records missing authority gaps required before public page, CMS, or recommendation promotion", () => {
    const packet = readJson(PACKET_PATH);
    const gaps = asRecordArray(packet.missing_or_blocked_authority);

    expect(gaps.map((gap) => gap.gap)).toEqual([
      "major_cluster_authority",
      "review_ledger",
      "cms_dry_run_package",
      "riasec_graph_entities",
    ]);
    expect(gaps.find((gap) => gap.gap === "riasec_graph_entities")?.status).toBe("blocked_or_partial");
  });

  it("preserves production import, runtime, CMS, search, private data, and generated page holds", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.hold_actions)).toEqual(
      expect.arrayContaining([
        "production_import",
        "runtime",
        "cms",
        "search",
        "private_data",
        "career_graph_runtime_mutation",
        "generated_pages",
        "deterministic_career_recommendation",
        "provider_calls",
        "deploy",
      ])
    );
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
  });

  it("keeps markdown aligned with the packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `MAPPED_PARTIAL`");
    expect(report).toContain("fap-api is a read-only evidence source only");
    expect(report).toContain("`reviewed_public_projection_only`");
    expect(report).toContain("`riasec.public_projection.v2`");
    expect(report).toContain("RIASEC graph readiness: blocked 7, partial 1");
    expect(report).toContain("`planning_contract_only`");
    expect(report).toContain("fap-api mutation: none");
  });

  it("keeps current branch scope limited to PR2 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RIASEC_CAREER_GRAPH_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/riasec-career-graph-source-authority-packet-01");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-source-authority-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/career-graph/riasec-career-graph-source-authority-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/riasec-career-graph-source-authority-packet.contract.test.ts");
  });
});
