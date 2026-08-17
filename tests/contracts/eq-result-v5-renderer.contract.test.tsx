import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { canRenderRichResultReport } from "@/components/result/RichResultReport";
import { isEqV5AccessRestricted, isEqV5ReportResponse, normalizeEqV5Report, resolveEqV5Authority } from "@/components/result/eq/utils";
import type { EqAgentContextPayload, EqAgentRuntimeResponsePayload, ReportResponse } from "@/lib/api/v0_3";
import {
  buildEqRendererContractFixture,
  EQ_CONTRACT_COMPILED_HASH,
  EQ_CONTRACT_RELEASE_ID,
  EQ_CONTRACT_SOURCE_HASH,
  eqReportResponseFromContractFixture,
} from "@/tests/fixtures/eq/v5/eq60RendererContractFixture";

function standardResponse(locale: "zh-CN" | "en" = "en"): ReportResponse {
  return eqReportResponseFromContractFixture(buildEqRendererContractFixture(locale, "standard"));
}

function safeAgentContext(overrides: Partial<EqAgentContextPayload> = {}): EqAgentContextPayload {
  return {
    ok: true,
    schema: "eq.agent_context.v1",
    ready: true,
    locale: "en",
    scale_code_legacy: "EQ_60",
    guardrails: {
      read_only: true,
      can_mutate_report: false,
      can_mutate_scores: false,
      can_override_formulation: false,
      can_enable_sjt: false,
      can_create_paid_unlock_language: false,
      can_expose_raw_technical_tags: false,
      content_authority: "backend_content_pack_and_report_composer",
    },
    intent_context: { matched: true, matched_intent: "understand_my_result", safe_opening: "BACKEND_AGENT_CONTEXT" },
    ...overrides,
  };
}

function safeAgentResponse(overrides: Partial<EqAgentRuntimeResponsePayload> = {}): EqAgentRuntimeResponsePayload {
  return {
    ok: true,
    schema: "eq.agent_runtime_response.v1",
    ready: true,
    mode: "deterministic_read_only",
    locale: "en",
    intent: { requested_intent: "understand_my_result", matched_intent: "understand_my_result", matched: true, allowed_response_mode: "explain_selected_report_assets" },
    assistant_response: { role: "assistant", text: "BACKEND_AGENT_RESPONSE", summary_points: ["BACKEND_AGENT_POINT"], follow_up_question: "BACKEND_AGENT_FOLLOW_UP", source_asset_ids: [], boundary_claim_ids: [] },
    safety: { detected_forbidden_claim_ids: [], applied_forbidden_claim_ids: [], escalation_flags: [], no_paywall_language: true, no_sjt_entry: true, no_raw_technical_tags: true },
    guardrails: { read_only: true, can_mutate_report: false, can_mutate_scores: false, can_override_formulation: false, can_enable_sjt: false, can_use_paid_unlock_language: false, can_expose_raw_technical_tags: false },
    next_module: { available: false, module_code: "EQ_SJT_16", status: "planned" },
    ...overrides,
  };
}

describe("EQ v5 pure renderer contract", () => {
  it("passes backend copy through every result layer and retains one immutable authority identity", () => {
    const reportData = standardResponse();
    const viewModel = normalizeEqV5Report(reportData, "en");

    expect(isEqV5ReportResponse(reportData)).toBe(true);
    expect(viewModel?.authority).toMatchObject({ release_id: EQ_CONTRACT_RELEASE_ID, source_hash: EQ_CONTRACT_SOURCE_HASH, compiled_hash: EQ_CONTRACT_COMPILED_HASH });
    expect(viewModel?.snapshotBinding).toMatchObject({ canonical_release_id: EQ_CONTRACT_RELEASE_ID, canonical_source_hash: EQ_CONTRACT_SOURCE_HASH, canonical_compiled_hash: EQ_CONTRACT_COMPILED_HASH });

    render(<EQResultV5 locale="en" reportData={reportData} attemptId="eq-contract-001" />);

    const result = screen.getByTestId("eq-result-v5");
    for (const marker of [
      "BACKEND_COPY[en:route.route_headline]",
      "BACKEND_COPY[en:route.evidence_snapshot_label]",
      "BACKEND_COPY[en:quality.body]",
      "BACKEND_COPY[en:score.SA.band]",
      "BACKEND_COPY[en:mechanism.why_it_matters]",
      "BACKEND_COPY[en:scene.typical_response]",
      "BACKEND_COPY[en:career.meaning]",
      "BACKEND_COPY[en:action.do_today]",
      "BACKEND_COPY[en:science.non_clinical_statement]",
      "BACKEND_COPY[en:cross.claim_boundary]",
      "BACKEND_COPY[en:agent_entry.body]",
    ]) expect(result).toHaveTextContent(marker);
    expect(screen.queryByTestId("eq-sjt-bridge")).not.toBeInTheDocument();
  });

  it("renders Chinese backend placeholders while localizing only UI and technical enum labels", () => {
    render(<EQResultV5 locale="zh" reportData={standardResponse("zh-CN")} />);
    const result = screen.getByTestId("eq-result-v5");
    expect(result).toHaveTextContent("BACKEND_COPY[zh-CN:route.route_headline]");
    expect(result).toHaveTextContent("科学边界");
    expect(result).toHaveTextContent("阶段性");
    expect(result).not.toHaveTextContent("BACKEND_COPY[en:");
  });

  it("renders low-confidence explanations and retest guidance only from backend assets", () => {
    const reportData = eqReportResponseFromContractFixture(buildEqRendererContractFixture("en", "low_confidence"));
    render(<EQResultV5 locale="en" reportData={reportData} />);
    const result = screen.getByTestId("eq-result-v5");
    expect(result).toHaveTextContent("BACKEND_COPY[en:quality.body]");
    expect(result).toHaveTextContent("BACKEND_COPY[en:action.do_today]");
    expect(result).toHaveTextContent("SPEEDING");
    expect(result).not.toHaveTextContent("Responses were completed unusually quickly");
    expect(screen.queryByTestId("eq-evidence-snapshot")).not.toBeInTheDocument();
    expect(screen.queryByTestId("eq-agent-entry-guard")).not.toBeInTheDocument();
  });

  it.each([
    ["missing authority", (report: Record<string, unknown>) => { delete (report._meta as Record<string, unknown>).eq60_private_result_authority; }],
    ["missing release", (report: Record<string, unknown>) => { ((report._meta as Record<string, unknown>).eq60_private_result_authority as Record<string, unknown>).release_id = ""; }],
    ["bad source hash", (report: Record<string, unknown>) => { ((report._meta as Record<string, unknown>).eq60_private_result_authority as Record<string, unknown>).source_hash = "bad"; }],
    ["mismatched compiled hash", (report: Record<string, unknown>) => { ((report._meta as Record<string, unknown>).snapshot_binding_v1 as Record<string, unknown>).canonical_compiled_hash = "d".repeat(64); }],
    ["incompatible schema", (report: Record<string, unknown>) => { report.schema_version = "eq_60.report.v1"; }],
    ["missing backend hero copy", (report: Record<string, unknown>) => { ((report.assets as Record<string, unknown>).personalization_route as Record<string, unknown>).route_headline = ""; }],
  ])("fails closed for %s without compatibility prose", (_label, mutate) => {
    const reportData = structuredClone(standardResponse());
    mutate(reportData.report as Record<string, unknown>);
    expect(normalizeEqV5Report(reportData, "en")).toBeNull();
    render(<EQResultV5 locale="en" reportData={reportData} />);
    expect(screen.getByTestId("eq-result-v5-unavailable")).toHaveTextContent("integrity checks");
    expect(screen.queryByTestId("eq-result-hero")).not.toBeInTheDocument();
  });

  it("fails closed when requested locale and canonical authority locale differ", () => {
    const reportData = standardResponse("zh-CN");
    expect(resolveEqV5Authority(reportData, "en")).toBeNull();
    render(<EQResultV5 locale="en" reportData={reportData} />);
    expect(screen.getByTestId("eq-result-v5-unavailable")).toBeInTheDocument();
  });

  it("fails closed when an English canonical payload contains Chinese editorial copy", () => {
    const reportData = structuredClone(standardResponse());
    ((reportData.report as Record<string, unknown>).assets as Record<string, Record<string, unknown>>).result_snapshot.headline = "不应出现在英文报告";
    render(<EQResultV5 locale="en" reportData={reportData} />);
    expect(screen.getByTestId("eq-result-v5-unavailable")).toBeInTheDocument();
  });

  it("keeps access restrictions separate and prevents the generic renderer from taking over", () => {
    const reportData = { ...standardResponse(), locked: true, offers: [{ sku: "PRIVATE" }] };
    expect(isEqV5AccessRestricted(reportData)).toBe(true);
    expect(canRenderRichResultReport(reportData)).toBe(false);
    render(<EQResultV5 locale="en" reportData={reportData} />);
    expect(screen.getByTestId("eq-result-v5-access-restricted")).toBeInTheDocument();
    expect(screen.queryByText("PRIVATE")).not.toBeInTheDocument();
  });

  it("renders only a backend Agent response after both read-only guards pass", async () => {
    render(<EQResultV5 locale="en" reportData={standardResponse()} attemptId="eq-contract-001" loadAgentContext={async () => safeAgentContext()} sendAgentRuntimeMessage={async () => safeAgentResponse()} />);
    fireEvent.click(screen.getByRole("button", { name: "BACKEND_COPY[en:agent_entry.cta_label]" }));
    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-ready")).toHaveTextContent("BACKEND_AGENT_CONTEXT"));
    fireEvent.change(screen.getByTestId("eq-agent-runtime-message"), { target: { value: "contract question" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(screen.getByTestId("eq-agent-runtime-response")).toHaveTextContent("BACKEND_AGENT_RESPONSE"));
    expect(screen.getByTestId("eq-agent-runtime-response")).toHaveTextContent("BACKEND_AGENT_POINT");
  });

  it("does not render an unsafe Agent response", async () => {
    render(<EQResultV5 locale="en" reportData={standardResponse()} attemptId="eq-contract-001" loadAgentContext={async () => safeAgentContext()} sendAgentRuntimeMessage={async () => safeAgentResponse({ next_module: { available: true, module_code: "EQ_SJT_16", status: "available" } })} />);
    fireEvent.click(screen.getByRole("button", { name: "BACKEND_COPY[en:agent_entry.cta_label]" }));
    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-ready")).toBeInTheDocument());
    fireEvent.change(screen.getByTestId("eq-agent-runtime-message"), { target: { value: "contract question" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(screen.getByTestId("eq-agent-runtime-unavailable")).toBeInTheDocument());
    expect(screen.queryByText("BACKEND_AGENT_RESPONSE")).not.toBeInTheDocument();
  });
});
