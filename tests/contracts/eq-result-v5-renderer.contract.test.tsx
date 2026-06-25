import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { canRenderRichResultReport } from "@/components/result/RichResultReport";
import { isEqV5AccessRestricted, isEqV5ReportResponse, normalizeEqV5Report } from "@/components/result/eq/utils";
import type { EqAgentContextPayload, EqAgentRuntimeResponsePayload, ReportResponse } from "@/lib/api/v0_3";
import balancedEn from "@/tests/fixtures/eq/v5/eq60_v5_balanced_integrated_en.json";
import balancedZh from "@/tests/fixtures/eq/v5/eq60_v5_balanced_integrated_zh.json";
import highEmpathyEn from "@/tests/fixtures/eq/v5/eq60_v5_high_empathy_low_recovery_en.json";
import lowConfidenceEn from "@/tests/fixtures/eq/v5/eq60_v5_low_confidence_en.json";
import lowConfidenceZh from "@/tests/fixtures/eq/v5/eq60_v5_low_confidence_zh.json";

type EqV5Fixture = {
  case_id: string;
  locale: string;
  report_access: {
    access_state?: string;
    report_state?: string;
    payload?: Record<string, unknown>;
  };
  report: Record<string, unknown>;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function responseFromFixture(fixture: EqV5Fixture, overrides: Partial<ReportResponse> = {}): ReportResponse {
  const copy = clone(fixture);
  const payload = copy.report_access.payload ?? {};

  return {
    ok: true,
    locked: payload.locked === true,
    variant: typeof payload.variant === "string" ? payload.variant : "full",
    access_level: typeof payload.access_level === "string" ? payload.access_level : "full",
    upgrade_sku: typeof payload.upgrade_sku === "string" ? payload.upgrade_sku : undefined,
    upgrade_sku_effective:
      typeof payload.upgrade_sku_effective === "string" ? payload.upgrade_sku_effective : undefined,
    offers: Array.isArray(payload.offers) ? payload.offers : [],
    modules_allowed: Array.isArray(payload.modules_allowed) ? payload.modules_allowed.map(String) : [],
    modules_preview: Array.isArray(payload.modules_preview) ? payload.modules_preview.map(String) : [],
    view_policy: typeof payload.view_policy === "object" && payload.view_policy !== null ? payload.view_policy as Record<string, unknown> : undefined,
    scale_code: "EQ_60",
    report: copy.report as ReportResponse["report"],
    ...overrides,
  };
}

function reportPayload(reportData: ReportResponse): Record<string, unknown> {
  return reportData.report as Record<string, unknown>;
}

function removeResolvedFields(reportData: ReportResponse): ReportResponse {
  const copy = clone(reportData);
  const report = reportPayload(copy);
  const scores = (report.scores ?? {}) as Record<string, unknown>;
  const assets = (report.assets ?? {}) as Record<string, unknown>;

  delete report.dimension_summary;
  scores.dimensions = {};
  delete assets.mechanisms;
  delete assets.action_prescription;
  delete assets.reality_scenes;

  return copy;
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
    intent_context: {
      matched: true,
      matched_intent: "understand_my_result",
      safe_opening: "Start with one real situation from this report.",
    },
    ...overrides,
  };
}

function safeAgentRuntimeResponse(overrides: Partial<EqAgentRuntimeResponsePayload> = {}): EqAgentRuntimeResponsePayload {
  return {
    ok: true,
    schema: "eq.agent_runtime_response.v1",
    ready: true,
    mode: "deterministic_read_only",
    locale: "en",
    intent: {
      requested_intent: "understand_my_result",
      matched_intent: "understand_my_result",
      matched: true,
      allowed_response_mode: "explain_selected_report_assets",
    },
    assistant_response: {
      role: "assistant",
      text: "This answer stays inside the current report assets.",
      summary_points: ["Use the selected evidence point.", "Keep the report as the authority."],
      follow_up_question: "Which real situation should we apply this to?",
      source_asset_ids: ["eq.conversion.agent_entry"],
      boundary_claim_ids: [],
    },
    safety: {
      detected_forbidden_claim_ids: [],
      applied_forbidden_claim_ids: ["true_emotional_ability"],
      escalation_flags: [],
      no_paywall_language: true,
      no_sjt_entry: true,
      no_raw_technical_tags: true,
    },
    guardrails: {
      read_only: true,
      can_mutate_report: false,
      can_mutate_scores: false,
      can_override_formulation: false,
      can_enable_sjt: false,
      can_use_paid_unlock_language: false,
      can_expose_raw_technical_tags: false,
    },
    next_module: {
      available: false,
      module_code: "EQ_SJT_16",
      status: "planned",
    },
    ...overrides,
  };
}

describe("EQ v5 result renderer contract", () => {
  it("renders all main EQ v5 sections from backend canonical resolved assets", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);

    expect(isEqV5ReportResponse(reportData)).toBe(true);
    expect(normalizeEqV5Report(reportData, "en")?.route.routeId).toBe("high_empathy_low_recovery");
    expect(normalizeEqV5Report(reportData, "en")?.route.signalSignature.match_pattern).toBe("EM_high_ER_low");
    expect(normalizeEqV5Report(reportData, "en")?.route.selectedAssetIds.action_prescription_id).toBe(
      "empathy_boundary"
    );
    render(<EQResultV5 locale="en" reportData={reportData} attemptId="eq-result-001" />);

    expect(screen.getByTestId("eq-result-v5")).toBeInTheDocument();
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("High Empathy, Slow Recovery");
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("You read the room quickly");
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("Practice understanding without taking over");
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent(
      "I can understand someone without carrying the whole emotional load"
    );
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("Save the report, retest later, or ask the Agent");
    expect(screen.getByTestId("eq-evidence-snapshot")).toHaveTextContent("Evidence Snapshot");
    expect(screen.getByTestId("eq-evidence-snapshot")).toHaveTextContent("Selected by backend route matrix");
    expect(screen.getByTestId("eq-quality-banner")).toHaveTextContent("Interpretation Confidence");
    expect(screen.getByTestId("eq-quality-banner")).toHaveTextContent("Why:");
    expect(screen.getByTestId("eq-quality-banner")).toHaveTextContent("Based on completion, response pace");
    expect(screen.getByTestId("eq-emotional-matrix")).toHaveTextContent("Emotional Matrix");
    expect(screen.getByTestId("eq-emotional-matrix")).toHaveTextContent("Self-Awareness");
    expect(screen.getByTestId("eq-mechanism-section")).toHaveTextContent(
      "Empathy × Emotion regulation: the first signal is stronger"
    );
    expect(screen.getByTestId("eq-reality-scenes")).toHaveTextContent("Feedback");
    expect(screen.getByTestId("eq-career-environment")).toHaveTextContent("Emotional labor: high");
    expect(screen.getByTestId("eq-career-environment")).toHaveTextContent("Interview check");
    expect(screen.getByTestId("eq-career-environment")).toHaveTextContent("Role observation checklist");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("Empathy with boundary");
    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("Future scenario module");
    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("future scenario choices");
    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("It supplements self-report");
    expect(screen.getByTestId("eq-scientific-boundary")).toHaveTextContent("Scientific Boundary");
    expect(screen.getByTestId("eq-scientific-boundary")).toHaveTextContent("Evidence is still being built");
    expect(screen.getByTestId("eq-save-share-related")).toHaveTextContent("Save your report");
    expect(screen.getByTestId("eq-save-share-related")).toHaveTextContent("Ask the Agent");
    expect(screen.getByTestId("eq-agent-entry-guard")).toBeInTheDocument();
    expect(screen.getByTestId("eq-save-share-related")).toHaveTextContent("Big Five");
    expect(screen.queryByText(/high_empathy_low_recovery|EM_ER_high_low|emotional_labor_high|eq60\.signal_signature\.v1/i)).not.toBeInTheDocument();
  });

  it("loads read-only EQ Agent context only after the guarded Agent entry is clicked", async () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);
    let calls = 0;

    render(
      <EQResultV5
        locale="en"
        reportData={reportData}
        attemptId="eq-result-001"
        loadAgentContext={async ({ attemptId, locale, intent }) => {
          calls += 1;
          expect(attemptId).toBe("eq-result-001");
          expect(locale).toBe("en");
          expect(intent).toBe("understand_my_result");
          return safeAgentContext();
        }}
      />
    );

    expect(calls).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Ask the Agent" }));

    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-ready")).toBeInTheDocument());
    expect(calls).toBe(1);
    expect(screen.getByTestId("eq-agent-entry-ready")).toHaveTextContent("Read-only context ready");
    expect(screen.getByTestId("eq-agent-entry-ready")).toHaveTextContent(
      "Start with one real situation from this report."
    );
    expect(screen.getByTestId("eq-agent-entry-ready")).toHaveTextContent("cannot change scores");
    expect(screen.queryByText(/locked|paywall|SKU_EQ_60_FULL_299|profile:|quality_level:|bucket:/i)).not.toBeInTheDocument();
  });

  it("opens the EQ Agent runtime drawer and sends a deterministic read-only message", async () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);
    let contextCalls = 0;
    let runtimeCalls = 0;

    render(
      <EQResultV5
        locale="en"
        reportData={reportData}
        attemptId="eq-result-001"
        loadAgentContext={async () => {
          contextCalls += 1;
          return safeAgentContext();
        }}
        sendAgentRuntimeMessage={async ({ attemptId, locale, intent, message }) => {
          runtimeCalls += 1;
          expect(attemptId).toBe("eq-result-001");
          expect(locale).toBe("en");
          expect(intent).toBe("understand_my_result");
          expect(message).toBe("How should I use this result this week?");
          return safeAgentRuntimeResponse();
        }}
      />
    );

    expect(contextCalls).toBe(0);
    expect(runtimeCalls).toBe(0);
    expect(screen.queryByTestId("eq-agent-runtime-drawer")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ask the Agent" }));
    await waitFor(() => expect(screen.getByTestId("eq-agent-runtime-drawer")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-ready")).toBeInTheDocument());
    expect(contextCalls).toBe(1);
    expect(runtimeCalls).toBe(0);

    fireEvent.change(screen.getByTestId("eq-agent-runtime-message"), {
      target: { value: "How should I use this result this week?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByTestId("eq-agent-runtime-response")).toBeInTheDocument());
    expect(runtimeCalls).toBe(1);
    expect(screen.getByTestId("eq-agent-runtime-response")).toHaveTextContent(
      "This answer stays inside the current report assets."
    );
    expect(screen.getByTestId("eq-agent-runtime-response")).toHaveTextContent("Use the selected evidence point.");
    expect(screen.getByTestId("eq-agent-runtime-response")).not.toHaveTextContent("eq.conversion.agent_entry");
    expect(screen.queryByText(/locked|paywall|SKU_EQ_60_FULL_299|EQ_60_FULL|profile:|quality_level:|focus:|bucket:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /scenario|sjt|continue/i })).not.toBeInTheDocument();
  });

  it("fails the EQ Agent runtime drawer closed when runtime guardrails are unsafe", async () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);

    render(
      <EQResultV5
        locale="en"
        reportData={reportData}
        attemptId="eq-result-001"
        loadAgentContext={async () => safeAgentContext()}
        sendAgentRuntimeMessage={async () =>
          safeAgentRuntimeResponse({
            guardrails: {
              read_only: true,
              can_mutate_report: false,
              can_mutate_scores: false,
              can_override_formulation: false,
              can_enable_sjt: true,
              can_use_paid_unlock_language: false,
              can_expose_raw_technical_tags: false,
            },
            next_module: {
              available: true,
              module_code: "EQ_SJT_16",
              status: "available",
            },
          })
        }
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ask the Agent" }));
    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-ready")).toBeInTheDocument());
    fireEvent.change(screen.getByTestId("eq-agent-runtime-message"), {
      target: { value: "Can I start the SJT now?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByTestId("eq-agent-runtime-unavailable")).toBeInTheDocument());
    expect(screen.queryByTestId("eq-agent-runtime-response")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /scenario|sjt|continue/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/unlock|purchase|SKU_EQ_60_FULL_299|EQ_60_FULL|profile:|quality_level:/i)).not.toBeInTheDocument();
  });

  it("fails Agent entry closed when context is not ready", async () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);

    render(
      <EQResultV5
        locale="en"
        reportData={reportData}
        attemptId="eq-result-001"
        loadAgentContext={async () => safeAgentContext({ ready: false, reason_code: "report_not_ready" })}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ask the Agent" }));

    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-unavailable")).toBeInTheDocument());
    expect(screen.getByTestId("eq-agent-entry-unavailable")).toHaveTextContent("Agent context is unavailable");
    expect(screen.queryByTestId("eq-agent-entry-ready")).not.toBeInTheDocument();
  });

  it("keeps Agent entry disabled when attempt id is missing", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByRole("button", { name: "Ask the Agent" })).toBeDisabled();
    expect(screen.getByTestId("eq-agent-entry-guard")).toHaveTextContent("Saved reports can continue");
  });

  it("fails Agent entry closed when backend guardrails allow mutation", async () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);

    render(
      <EQResultV5
        locale="en"
        reportData={reportData}
        attemptId="eq-result-001"
        loadAgentContext={async () =>
          safeAgentContext({
            guardrails: {
              read_only: true,
              can_mutate_report: true,
              can_mutate_scores: false,
              can_override_formulation: false,
              can_enable_sjt: false,
              can_create_paid_unlock_language: false,
              can_expose_raw_technical_tags: false,
            },
          })
        }
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ask the Agent" }));

    await waitFor(() => expect(screen.getByTestId("eq-agent-entry-unavailable")).toBeInTheDocument());
    expect(screen.queryByTestId("eq-agent-entry-ready")).not.toBeInTheDocument();
    expect(screen.queryByText(/modify report|edit scores|unlock|purchase|SKU_EQ_60_FULL_299/i)).not.toBeInTheDocument();
  });

  it("covers balanced_integrated canonical payload in zh-CN and en", () => {
    const zhReport = responseFromFixture(balancedZh as EqV5Fixture);
    const enReport = responseFromFixture(balancedEn as EqV5Fixture);

    expect(normalizeEqV5Report(zhReport, "zh")?.interpretation.core_formulation_id).toBe("balanced_integrated");
    expect(normalizeEqV5Report(enReport, "en")?.interpretation.core_formulation_id).toBe("balanced_integrated");
    expect(normalizeEqV5Report(enReport, "en")?.route.selectedAssetIds.mechanism_ids).toEqual([
      "SA_ER_high_high",
      "EM_RM_high_high",
    ]);

    const { rerender } = render(<EQResultV5 locale="zh" reportData={zhReport} />);
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("均衡整合型");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("情绪命名");

    rerender(<EQResultV5 locale="en" reportData={enReport} />);
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("Balanced Integrator");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("Emotion labeling");
  });

  it("orders resolved assets by backend selected_asset_ids", () => {
    const reportData = responseFromFixture(balancedEn as EqV5Fixture);
    const report = reportPayload(reportData);
    const assets = report.assets as Record<string, unknown>;
    assets.mechanisms = [...((assets.mechanisms as unknown[]) ?? [])].reverse();
    assets.reality_scenes = [...((assets.reality_scenes as unknown[]) ?? [])].reverse();
    assets.career_environment = [...((assets.career_environment as unknown[]) ?? [])].reverse();

    const viewModel = normalizeEqV5Report(reportData, "en");

    expect(viewModel?.route.routeId).toBe("balanced_integrated");
    expect(viewModel?.assets.mechanisms.map((item) => item.id)).toEqual(["SA_ER_high_high", "EM_RM_high_high"]);
    expect(viewModel?.assets.reality_scenes.map((item) => item.id)).toEqual([
      "feedback",
      "team_collaboration",
      "career_environment",
    ]);
    expect(viewModel?.assets.career_environment.map((item) => item.id)).toEqual([
      "interpersonal_density_medium",
      "feedback_intensity_medium",
      "autonomy_recovery_medium",
    ]);
  });

  it("keeps low_confidence_result cautious and does not render strong formulation claims", () => {
    const reportData = responseFromFixture(lowConfidenceEn as EqV5Fixture);
    const viewModel = normalizeEqV5Report(reportData, "en");

    expect(viewModel?.interpretation.core_formulation_id).toBe("low_confidence_result");
    expect(viewModel?.route.routeId).toBe("low_confidence_result");
    expect(viewModel?.route.signalSignature.match_pattern).toBe("quality_low_overrides_dimension_pattern");
    expect(viewModel?.interpretation.action_prescription_id).toBe("retest_reflection");

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("Lower-Confidence Result");
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("Read this result lightly");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("Reflection before retest");
    expect(screen.getByTestId("eq-result-hero")).not.toHaveTextContent("High Empathy, Slow Recovery");
    expect(screen.getByTestId("eq-result-hero")).not.toHaveTextContent("Balanced Integration");
    expect(screen.getByTestId("eq-mechanism-section")).toHaveTextContent("There is not enough signal");
  });

  it("renders low confidence zh-CN canonical payload without hardcoded English fallback", () => {
    const reportData = responseFromFixture(lowConfidenceZh as EqV5Fixture);

    render(<EQResultV5 locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("本次结果置信度较低");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("复测前观察");
    expect(screen.queryByText("Lower-Confidence Result")).not.toBeInTheDocument();
  });

  it("does not render clickable SJT entry when next_module.available is false", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("Planned, not available yet");
    expect(screen.queryByRole("link", { name: /scenario|sjt|continue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /scenario|sjt|continue/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/unlock|purchase|premium|SKU_EQ_60_FULL_299|EQ_60_FULL|paywall|blur_others|locked/i)).not.toBeInTheDocument();
  });

  it("keeps the SJT entry unavailable even if a payload marks it available before SJT launch", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);
    const report = reportPayload(reportData);
    const assets = report.assets as Record<string, unknown>;
    const bridge = assets.sjt_bridge as Record<string, unknown>;

    report.next_module = {
      available: true,
      module_code: "EQ_SJT_16",
      status: "available",
      cta_asset_id: "eq.sjt_bridge.available",
    };
    bridge.available = true;
    bridge.status = "available";
    bridge.button_label = "Continue scenario module";

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("Planned, not available yet");
    expect(screen.queryByTestId("eq-sjt-bridge-link")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /scenario|sjt|continue/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/unlock|purchase|premium|SKU_EQ_60_FULL_299|EQ_60_FULL|paywall|blur_others|locked/i)).not.toBeInTheDocument();
  });

  it("keeps SJT planned unavailable if backend status remains planned", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);
    const report = reportPayload(reportData);
    const assets = report.assets as Record<string, unknown>;
    const bridge = assets.sjt_bridge as Record<string, unknown>;

    report.next_module = {
      available: true,
      module_code: "EQ_SJT_16",
      status: "planned",
      cta_asset_id: "eq.sjt_bridge.planned",
    };
    bridge.available = true;
    bridge.status = "planned";
    bridge.button_label = "Continue scenario module";

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("Planned, not available yet");
    expect(screen.queryByTestId("eq-sjt-bridge-link")).not.toBeInTheDocument();
  });

  it("fails closed when root report access says the EQ v5 payload is locked or commerce restricted", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture, {
      locked: true,
      upgrade_sku: "SKU_EQ_60_FULL_299",
      upgrade_sku_effective: "EQ_60_FULL",
      offers: [{ sku: "SKU_EQ_60_FULL_299", title: "Paid EQ" }],
    });

    expect(isEqV5ReportResponse(reportData)).toBe(true);
    expect(isEqV5AccessRestricted(reportData)).toBe(true);
    expect(canRenderRichResultReport(reportData)).toBe(false);

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByTestId("eq-result-v5-access-restricted")).toHaveTextContent("not ready to view");
    expect(screen.queryByTestId("eq-result-v5")).not.toBeInTheDocument();
    expect(screen.queryByTestId("eq-result-hero")).not.toBeInTheDocument();
    expect(screen.queryByText("High Empathy, Slow Recovery")).not.toBeInTheDocument();
    expect(screen.queryByText(/SKU_EQ_60_FULL_299|EQ_60_FULL|purchase|premium|paywall|blur_others|Paid EQ/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/profile:|quality_level:|focus:|bucket:/i)).not.toBeInTheDocument();
  });

  it("fails closed when nested EQ v5 access metadata says locked, paywall, or blurred", () => {
    const reportData = responseFromFixture(highEmpathyEn as EqV5Fixture);
    const report = reportPayload(reportData);
    report.access = {
      locked: true,
      paywall: true,
      blur: true,
    };

    expect(isEqV5ReportResponse(reportData)).toBe(true);
    expect(isEqV5AccessRestricted(reportData)).toBe(true);
    expect(canRenderRichResultReport(reportData)).toBe(false);

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.getByTestId("eq-result-v5-access-restricted")).toHaveTextContent("not ready to view");
    expect(screen.queryByTestId("eq-emotional-matrix")).not.toBeInTheDocument();
    expect(screen.queryByText("Strong empathy, weaker boundaries and recovery")).not.toBeInTheDocument();
    expect(screen.queryByText(/profile:|quality_level:|focus:|bucket:/i)).not.toBeInTheDocument();
  });

  it("uses safe fallbacks when resolved fields are missing", () => {
    const reportData = removeResolvedFields(responseFromFixture(highEmpathyEn as EqV5Fixture));

    render(<EQResultV5 locale="en" reportData={reportData} />);

    const matrix = screen.getByTestId("eq-emotional-matrix");
    expect(within(matrix).getAllByText("This dimension is unavailable.")).toHaveLength(4);
    expect(screen.getByTestId("eq-mechanism-section")).toHaveTextContent("There is not enough signal");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("—");
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
    expect(screen.queryByText("null")).not.toBeInTheDocument();
  });
});
