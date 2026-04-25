import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EnneagramHistoryClient from "@/app/(localized)/[locale]/(app)/history/enneagram/EnneagramHistoryClient";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/history/enneagram",
  fetchEnneagramHistory: vi.fn(),
  fetchEnneagramObservation: vi.fn(),
  assignEnneagramObservation: vi.fn(),
  submitEnneagramObservationDay3: vi.fn(),
  submitEnneagramObservationDay7: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
}));

vi.mock("@/lib/i18n/locales", async () => {
  const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
  return {
    ...actual,
    getLocaleFromPathname: (pathname: string) => (pathname.startsWith("/zh") ? "zh" : "en"),
    localizedPath: (path: string, locale: "en" | "zh") => `/${locale}${path.startsWith("/") ? path : `/${path}`}`,
  };
});

vi.mock("@/lib/enneagram/api", () => ({
  fetchEnneagramHistory: hoisted.fetchEnneagramHistory,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");
  return {
    ...actual,
    fetchEnneagramObservation: hoisted.fetchEnneagramObservation,
    assignEnneagramObservation: hoisted.assignEnneagramObservation,
    submitEnneagramObservationDay3: hoisted.submitEnneagramObservationDay3,
    submitEnneagramObservationDay7: hoisted.submitEnneagramObservationDay7,
  };
});

vi.mock("@/components/big5/pdf/PdfDownloadButton", () => ({
  PdfDownloadButton: () => <button type="button">Download PDF</button>,
}));

function createObservationState(overrides: Record<string, unknown> = {}) {
  return {
    version: "enneagram_observation_state.v1",
    attempt_id: "attempt-observation-1",
    scale_code: "ENNEAGRAM",
    form_code: "enneagram_likert_105",
    interpretation_context_id: "ctx-observation-1",
    status: "initial_result",
    interpretation_scope: "close_call",
    close_call_pair: {
      type_a: "1",
      type_b: "6",
    },
    tasks: [],
    day3_observation_feedback: null,
    day7_resonance_feedback: null,
    user_confirmed_type: null,
    user_disagreed_reason: null,
    resonance_score: null,
    observation_completion_rate: 0,
    suggested_next_action: "observe_7_days",
    created_at: "2026-04-25T00:00:00Z",
    updated_at: "2026-04-25T00:00:00Z",
    ...overrides,
  };
}

function createObservationReport(scope: "clear" | "close_call" | "diffuse" | "low_quality" = "close_call"): ReportResponse {
  const reportV2 = {
    schema_version: "enneagram.report.v2",
    scale_code: "ENNEAGRAM",
    form: {
      form_code: "enneagram_likert_105",
      form_kind: "likert",
      methodology_variant: "e105_standard",
    },
    registry: {
      registry_version: "enneagram_registry.v1",
      registry_release_hash: "sha256:registry",
      content_maturity: "scaffold",
      release_id: "registry_release",
    },
    classification: {
      interpretation_scope: scope,
      confidence_level: "medium_confidence",
      interpretation_reason: `reason_for_${scope}`,
    },
    pages: [
      {
        page_key: "page_1_result_overview",
        title: "结果总览",
        purpose: "overview",
        visibility: "visible",
        source_registry_refs: [],
        modules: [
          {
            module_key: "instant_summary",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "即时结论",
              body: `body_for_${scope}`,
              primary_candidate: "1",
              secondary_candidate: "6",
              confidence_level: "medium_confidence",
              interpretation_scope: scope,
              form_badge: {
                label: "E105 标准版",
                body: "same model != same score space",
              },
              top_candidates: [
                { type: "1", display_score: 88, candidate_role: "primary_candidate" },
                { type: "6", display_score: 79, candidate_role: "second_candidate" },
                { type: "9", display_score: 63, candidate_role: "third_candidate" },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "scaffold",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
        ],
      },
      {
        page_key: "page_5_method_observation_next",
        title: "方法、观察与下一步",
        purpose: "method modules",
        visibility: "visible",
        source_registry_refs: [],
        modules: [
          {
            module_key: "seven_day_observation",
            kind: "observation_plan",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              interpretation_scope: scope,
              steps: [
                { day: 1, phase: "motivation", prompt: "Observe the recurring motive." },
                { day: 7, phase: "resonance", prompt: "Review which candidate still resonates." },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "scaffold",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
          {
            module_key: "form_recommendation",
            kind: "recommendation_card",
            visibility: "visible",
            state: scope,
            form_variant: "e105",
            content: {
              recommendation_key: "stay_with_current_form",
              recommended_first_action: "next action hint",
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "scaffold",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
        ],
      },
    ],
    modules: [],
    provenance: {
      projection_version: "enneagram_projection.v2",
      report_schema_version: "enneagram.report.v2",
      report_engine_version: "enneagram_report_engine.v2",
      interpretation_context_id: "ctx-observation-1",
      content_release_hash: "sha256:content",
      content_snapshot_status: "frozen",
      registry_release_hash: "sha256:registry",
      close_call_rule_version: "close_call_rule.v1",
      confidence_policy_version: "enneagram_confidence_policy.v1",
      quality_policy_version: "enneagram_quality_policy.v1",
    },
  };

  return {
    ok: true,
    attempt_id: "attempt-observation-1",
    scale_code: "ENNEAGRAM",
    locked: false,
    variant: "full",
    access_level: "full",
    enneagram_form_v1: {
      form_code: "enneagram_likert_105",
      label: "105-question Likert",
      short_label: "105Q Likert",
      question_count: 105,
      estimated_minutes: 12,
      scale_code: "ENNEAGRAM",
    },
    enneagram_report_v2: reportV2,
    report: {
      schema_version: "enneagram.report.v1",
      scale_code: "ENNEAGRAM",
      _meta: {
        enneagram_report_v2: reportV2,
      },
    },
  } as ReportResponse;
}

function renderObservationShell(scope: "clear" | "close_call" | "diffuse" | "low_quality" = "close_call") {
  const viewModel = assembleEnneagramResultViewModel({
    reportData: createObservationReport(scope),
    locale: "zh",
    gate: { isFreeVariant: false },
  });

  return render(
    <EnneagramResultShell
      locale="zh"
      attemptId="attempt-observation-1"
      reportLocked={false}
      accessProjection={null}
      viewModel={viewModel}
    />
  );
}

describe("enneagram observation surface contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/zh/history/enneagram";
    hoisted.fetchEnneagramObservation.mockResolvedValue({
      ok: true,
      observation_state_v1: createObservationState(),
    });
    hoisted.assignEnneagramObservation.mockResolvedValue({
      ok: true,
      observation_state_v1: createObservationState({
        status: "observation_assigned",
        tasks: [
          { day: 1, phase: "motivation", prompt: "Observe the recurring motive." },
          { day: 3, phase: "pressure", prompt: "Check whether the pressure response still matches." },
          { day: 7, phase: "resonance", prompt: "Review which candidate still resonates." },
        ],
        observation_completion_rate: 14,
      }),
    });
    hoisted.submitEnneagramObservationDay3.mockResolvedValue({
      ok: true,
      observation_state_v1: createObservationState({
        status: "day3_feedback_submitted",
        tasks: [{ day: 7, phase: "resonance", prompt: "Review which candidate still resonates." }],
        observation_completion_rate: 45,
        day3_observation_feedback: {
          more_like: "top1",
          scene_type: "work",
        },
      }),
    });
    hoisted.submitEnneagramObservationDay7.mockResolvedValue({
      ok: true,
      observation_state_v1: createObservationState({
        status: "user_confirmed",
        observation_completion_rate: 100,
        user_confirmed_type: "6",
        suggested_next_action: "do_fc144",
        day7_resonance_feedback: {
          final_resonance: "top2",
        },
      }),
    });
    hoisted.fetchEnneagramHistory.mockResolvedValue({
      ok: true,
      scale_code: "ENNEAGRAM",
      items: [
        {
          attempt_id: "attempt-observation-1",
          submitted_at: "2026-04-25T00:00:00Z",
          enneagram_form_v1: {
            form_code: "enneagram_likert_105",
            label: "105-question Likert",
            short_label: "105Q Likert",
            question_count: 105,
            estimated_minutes: 12,
            scale_code: "ENNEAGRAM",
          },
          enneagram_summary_v1: {
            primary_type: { code: "T1", label: "Type 1", score: 88, rank: 1 },
            top_types: [{ code: "T1", label: "Type 1", score: 88, rank: 1 }],
          },
          classification_summary_v1: {
            interpretation_scope: "close_call",
            confidence_level: "medium",
          },
          observation_state_v1: createObservationState({
            status: "user_confirmed",
            observation_completion_rate: 100,
            user_confirmed_type: "6",
            suggested_next_action: "do_fc144",
          }),
          observation_status: "user_confirmed",
          observation_completion_rate: 100,
          user_confirmed_type: "6",
          suggested_next_action: "do_fc144",
          day7_submitted: true,
          access_summary: {
            access_state: "ready",
            report_state: "ready",
            pdf_state: "ready",
            actions: {
              page_href: "/zh/result/attempt-observation-1",
              pdf_href: "/api/v0.3/attempts/attempt-observation-1/report.pdf",
            },
          },
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });
  });

  it("shows the assign CTA when no observation has been assigned yet", async () => {
    renderObservationShell("close_call");

    expect(await screen.findByTestId("enneagram-observation-guidance")).toHaveTextContent("Top1");
    expect(screen.getByTestId("enneagram-observation-assign")).toHaveTextContent("开始 7 天观察");
  });

  it("assigns observation and renders tasks plus feedback forms on page 5", async () => {
    renderObservationShell("clear");

    fireEvent.click(await screen.findByTestId("enneagram-observation-assign"));

    await waitFor(() => {
      expect(hoisted.assignEnneagramObservation).toHaveBeenCalledWith({
        attemptId: "attempt-observation-1",
      });
    });

    expect(await screen.findByTestId("enneagram-observation-progress")).toHaveTextContent("14%");
    expect(screen.getByText("Observe the recurring motive.")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-observation-day3-form")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-observation-day7-form")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-observation-next-action")).toHaveTextContent("继续观察");
  });

  it("submits Day3 feedback and updates the visible observation state", async () => {
    hoisted.fetchEnneagramObservation.mockResolvedValueOnce({
      ok: true,
      observation_state_v1: createObservationState({
        status: "observation_assigned",
        tasks: [{ day: 3, phase: "pressure", prompt: "Check whether the pressure response still matches." }],
        observation_completion_rate: 14,
      }),
    });

    renderObservationShell("clear");

    fireEvent.change(await screen.findByLabelText("证据句"), {
      target: { value: "在工作冲突中更像 Top1 的驱动。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Day3 feedback" }));

    await waitFor(() => {
      expect(hoisted.submitEnneagramObservationDay3).toHaveBeenCalledWith({
        attemptId: "attempt-observation-1",
        payload: expect.objectContaining({
          evidence_sentence: "在工作冲突中更像 Top1 的驱动。",
        }),
      });
    });

    expect(await screen.findByTestId("enneagram-observation-day3-summary")).toHaveTextContent("top1");
  });

  it("submits Day7 feedback and shows self-observation confirmation without rewriting the result", async () => {
    hoisted.fetchEnneagramObservation.mockResolvedValueOnce({
      ok: true,
      observation_state_v1: createObservationState({
        status: "day3_feedback_submitted",
        tasks: [{ day: 7, phase: "resonance", prompt: "Review which candidate still resonates." }],
        observation_completion_rate: 45,
        day3_observation_feedback: {
          more_like: "top1",
          scene_type: "work",
        },
      }),
    });

    renderObservationShell("clear");

    fireEvent.change(await screen.findByLabelText("自我观察确认号码"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Day7 resonance feedback" }));

    await waitFor(() => {
      expect(hoisted.submitEnneagramObservationDay7).toHaveBeenCalledWith({
        attemptId: "attempt-observation-1",
        payload: expect.objectContaining({
          user_confirmed_type: "6",
        }),
      });
    });

    const confirmation = await screen.findAllByTestId("enneagram-observation-user-confirmed");
    expect(confirmation[0]).toHaveTextContent("你的自我观察确认");
    expect(screen.getAllByText("这不会静默改写本次测量结果。它会作为你的自我观察证据记录在历史中。").length).toBeGreaterThan(0);
  });

  it("renders diffuse and low-quality guidance without hard retyping language", async () => {
    const diffuseRender = renderObservationShell("diffuse");
    expect(await screen.findByTestId("enneagram-observation-guidance")).toHaveTextContent("Top3");
    diffuseRender.unmount();

    renderObservationShell("low_quality");
    expect(await screen.findByTestId("enneagram-observation-guidance")).toHaveTextContent("重测同一题型");
  });

  it("shows observation progress on the history surface when the backend provides it", async () => {
    render(<EnneagramHistoryClient />);

    const row = await screen.findByTestId("enneagram-history-row-attempt-observation-1");
    expect(within(row).getByTestId("enneagram-history-row-observation-status-attempt-observation-1")).toHaveTextContent(
      "user_confirmed"
    );
    expect(within(row).getByTestId("enneagram-history-row-observation-progress-attempt-observation-1")).toHaveTextContent(
      "100%"
    );
    expect(within(row).getByTestId("enneagram-history-row-observation-confirmed-attempt-observation-1")).toHaveTextContent(
      "6"
    );
    expect(within(row).getByTestId("enneagram-history-row-observation-next-attempt-observation-1")).toHaveTextContent(
      "FC144"
    );
    expect(within(row).getByTestId("enneagram-history-row-observation-day7-attempt-observation-1")).toBeInTheDocument();
  });

  it("does not crash or render observation noise when history rows have no observation fields", async () => {
    hoisted.fetchEnneagramHistory.mockResolvedValueOnce({
      ok: true,
      scale_code: "ENNEAGRAM",
      items: [
        {
          attempt_id: "attempt-observation-2",
          submitted_at: "2026-04-25T00:00:00Z",
          enneagram_form_v1: {
            form_code: "enneagram_likert_105",
            label: "105-question Likert",
            short_label: "105Q Likert",
            question_count: 105,
            estimated_minutes: 12,
            scale_code: "ENNEAGRAM",
          },
          enneagram_summary_v1: {
            primary_type: { code: "T1", label: "Type 1", score: 88, rank: 1 },
            top_types: [{ code: "T1", label: "Type 1", score: 88, rank: 1 }],
          },
          access_summary: {
            access_state: "ready",
            report_state: "ready",
            pdf_state: "ready",
            actions: {
              page_href: "/zh/result/attempt-observation-2",
              pdf_href: "/api/v0.3/attempts/attempt-observation-2/report.pdf",
            },
          },
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<EnneagramHistoryClient />);

    const row = await screen.findByTestId("enneagram-history-row-attempt-observation-2");
    expect(within(row).queryByTestId("enneagram-history-row-observation-attempt-observation-2")).not.toBeInTheDocument();
  });
});
