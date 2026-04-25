import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnneagramTechnicalNotePage } from "@/components/result/enneagram/EnneagramTechnicalNotePage";

const hoisted = vi.hoisted(() => ({
  fetchEnneagramTechnicalNote: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");
  return {
    ...actual,
    fetchEnneagramTechnicalNote: hoisted.fetchEnneagramTechnicalNote,
  };
});

function createTechnicalNoteResponse() {
  return {
    ok: true,
    scale_code: "ENNEAGRAM",
    technical_note_v1: {
      schema_version: "enneagram.technical_note.v1",
      scale_code: "ENNEAGRAM",
      registry_version: "enneagram_registry.v1",
      registry_release_hash: "sha256:registry-note",
      technical_note_version: "enneagram_technical_note.v0.1",
      generated_at: "2026-04-25T03:30:00Z",
      sections: [
        {
          section_key: "test_goal",
          title: "测试目标",
          body: "用于解释当前九型测量要回答的问题，不把它包装成诊断。",
          data_status: "currently_operational",
          metric_refs: [],
        },
        {
          section_key: "score_space_boundary",
          title: "分数空间边界",
          body: "同模型，不同分数空间，不默认跨 form 数值直比。",
          data_status: "currently_operational",
          metric_refs: [],
        },
        {
          section_key: "e105_fc144_agreement",
          title: "E105 / FC144 一致性",
          body: "需要继续积累双题型配对样本。",
          data_status: "pending_sample",
          metric_refs: ["e105_fc144_agreement"],
        },
      ],
      method_boundaries: {
        same_model_not_same_score_space: {
          label: "同模型，不同分数空间",
          copy: "E105 与 FC144 属于同一模型，但不默认直接比较数值。",
          evidence_level: "descriptive",
          content_maturity: "p0_ready",
        },
      },
      metric_definitions: [
        {
          metric_key: "close_call_rate",
          label: "Close-call Rate",
          description: "close_call 结果占比。",
          data_status: "currently_operational",
          data_status_source: "operational",
          minimum_sample_guidance: "样本达到稳定覆盖后可长期跟踪。",
          privacy_notes: "只显示聚合比例。",
          technical_note_visible: true,
        },
        {
          metric_key: "top1_resonance_rate",
          label: "Top1 Resonance Rate",
          description: "Day7 指向 top1 的比例。",
          data_status: "collecting_data",
          data_status_source: "collecting",
          minimum_sample_guidance: "需要稳定 Day7 回收样本。",
          privacy_notes: "只显示 observation 聚合结果。",
          technical_note_visible: true,
        },
        {
          metric_key: "retake_consistency_index",
          label: "Retake Consistency Index",
          description: "同 form 重测的一致性定义位。",
          data_status: "pending_sample",
          data_status_source: "pending_sample",
          minimum_sample_guidance: "需要累计稳定的同 form retake 样本。",
          privacy_notes: "只做匿名聚合。",
          technical_note_visible: true,
          value: 42.4242,
          sample_size: 9999,
        },
      ],
      data_status_summary: {
        metrics: {
          currently_operational: ["close_call_rate"],
          collecting_data: ["top1_resonance_rate"],
          pending_sample: ["retake_consistency_index"],
          unavailable: [],
        },
        not_claimed: ["clinical_validity", "hiring_screening_suitability"],
      },
      disclaimers: [
        {
          key: "not_diagnostic",
          label: "不是医学诊断",
          copy: "本测试用于人格模式理解与自我观察，不用于临床诊断或治疗建议。",
        },
        {
          key: "not_clinical",
          label: "不是临床判断",
          copy: "当前版本不声明外部临床效度、准确率或预测能力。",
        },
        {
          key: "not_hiring_screening",
          label: "不用于招聘筛选",
          copy: "本测试不用于招聘、晋升或淘汰判断。",
        },
        {
          key: "no_hard_theory_judgement",
          label: "不硬判 wing / arrow / subtype / health level",
          copy: "理论层提示不作为系统硬判结论。",
        },
        {
          key: "no_cross_form_numeric_compare",
          label: "E105 与 FC144 不默认直接比较数值",
          copy: "E105 与 FC144 不默认做跨 form 数值比较。",
        },
        {
          key: "user_confirmed_type_boundary",
          label: "user_confirmed_type 是自我观察证据，不是系统改判",
          copy: "user_confirmed_type 只作为自我观察证据保存，不会静默改写系统 primary_candidate。",
        },
      ],
    },
  };
}

describe("enneagram technical note page contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.fetchEnneagramTechnicalNote.mockResolvedValue(createTechnicalNoteResponse());
  });

  it("renders required sections, method boundaries, and version metadata", async () => {
    render(
      <EnneagramTechnicalNotePage
        locale="zh"
        testSlug="enneagram-personality-test-nine-types"
        testTitle="九型人格测试"
      />
    );

    expect(await screen.findByTestId("enneagram-technical-note-page")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-technical-note-meta")).toHaveTextContent("enneagram_technical_note.v0.1");
    expect(screen.getByTestId("enneagram-technical-note-section-test_goal")).toHaveTextContent("测试目标");
    expect(screen.getByTestId("enneagram-technical-note-section-score_space_boundary")).toHaveTextContent("分数空间边界");
    expect(screen.getByTestId("enneagram-technical-note-method-boundaries")).toHaveTextContent("同模型，不同分数空间");
  });

  it("renders public data-status badges and summary buckets without overstating pending metrics", async () => {
    render(
      <EnneagramTechnicalNotePage
        locale="zh"
        testSlug="enneagram-personality-test-nine-types"
        testTitle="九型人格测试"
      />
    );

    expect((await screen.findAllByText("当前已运行")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("正在积累数据").length).toBeGreaterThan(0);
    expect(screen.getAllByText("样本积累中").length).toBeGreaterThan(0);
    expect(screen.getAllByText("不作此类声明").length).toBeGreaterThan(0);
    expect(screen.getByTestId("enneagram-technical-note-metric-retake_consistency_index")).toHaveTextContent(
      "Retake Consistency Index"
    );
    expect(screen.queryByText("42.4242")).not.toBeInTheDocument();
    expect(screen.queryByText("9999")).not.toBeInTheDocument();
  });

  it("renders visible disclaimers and safe not-claimed entries", async () => {
    render(
      <EnneagramTechnicalNotePage
        locale="zh"
        testSlug="enneagram-personality-test-nine-types"
        testTitle="九型人格测试"
      />
    );

    const disclaimerSection = await screen.findByTestId("enneagram-technical-note-disclaimers");
    expect(within(disclaimerSection).getByText("不是医学诊断")).toBeInTheDocument();
    expect(within(disclaimerSection).getByText("不是临床判断")).toBeInTheDocument();
    expect(within(disclaimerSection).getByText("不用于招聘筛选")).toBeInTheDocument();
    expect(within(disclaimerSection).getByText("不硬判 wing / arrow / subtype / health level")).toBeInTheDocument();
    expect(within(disclaimerSection).getByText("E105 与 FC144 不默认直接比较数值")).toBeInTheDocument();
    expect(within(disclaimerSection).getByText("user_confirmed_type 是自我观察证据，不是系统改判")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-technical-note-data-status-summary")).toHaveTextContent("临床效度");
    expect(screen.getByTestId("enneagram-technical-note-data-status-summary")).toHaveTextContent("招聘筛选适用性");
  });

  it("renders status summary buckets even when backend mixes section and metric entries", async () => {
    const response = createTechnicalNoteResponse() as ReturnType<typeof createTechnicalNoteResponse> & {
      technical_note_v1: {
        data_status_summary?: Record<string, unknown>;
      };
    };
    response.technical_note_v1.data_status_summary = {
      currently_operational: ["test_goal"],
      metrics: {
        currently_operational: ["close_call_rate"],
        collecting_data: [],
        pending_sample: [],
        unavailable: [],
      },
      sections: {
        currently_operational: [],
        collecting_data: [],
        pending_sample: ["e105_fc144_agreement"],
        unavailable: [],
      },
      not_claimed: ["clinical_validity"],
    };
    hoisted.fetchEnneagramTechnicalNote.mockResolvedValueOnce(response);

    render(
      <EnneagramTechnicalNotePage
        locale="zh"
        testSlug="enneagram-personality-test-nine-types"
        testTitle="九型人格测试"
      />
    );

    const summary = await screen.findByTestId("enneagram-technical-note-data-status-summary");
    expect(summary).toHaveTextContent("测试目标");
    expect(summary).toHaveTextContent("Close-call Rate");
    expect(summary).toHaveTextContent("E105 / FC144 一致性");
    expect(summary).toHaveTextContent("临床效度");
  });

  it("renders a safe fallback when the technical note API fails", async () => {
    hoisted.fetchEnneagramTechnicalNote.mockRejectedValueOnce(new Error("network down"));

    render(
      <EnneagramTechnicalNotePage
        locale="zh"
        testSlug="enneagram-personality-test-nine-types"
        testTitle="九型人格测试"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("enneagram-technical-note-error")).toBeInTheDocument();
    });

    expect(screen.getByText("Technical Note 暂不可用")).toBeInTheDocument();
    expect(screen.getByText("当前无法读取 Technical Note。你仍可以先按结果页的方法边界阅读本次测量结果。")).toBeInTheDocument();
  });

  it("renders a safe fallback when the response shape is malformed", async () => {
    hoisted.fetchEnneagramTechnicalNote.mockResolvedValueOnce({
      ok: true,
      scale_code: "ENNEAGRAM",
      technical_note_v1: null,
    });

    render(
      <EnneagramTechnicalNotePage
        locale="zh"
        testSlug="enneagram-personality-test-nine-types"
        testTitle="九型人格测试"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("enneagram-technical-note-error")).toBeInTheDocument();
    });

    expect(screen.getByText("当前 Technical Note 暂时不可用。你仍可以先按结果页的方法边界阅读本次测量结果。")).toBeInTheDocument();
  });
});
