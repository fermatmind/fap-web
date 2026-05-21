import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { isEqV5ReportResponse, normalizeEqV5Report } from "@/components/result/eq/utils";
import type { ReportResponse } from "@/lib/api/v0_3";

function createEqReportData(locale: "en" | "zh" = "en", overrides: Partial<ReportResponse> = {}): ReportResponse {
  const isZh = locale === "zh";

  const report = {
    scale_code: "EQ_60",
    eq_report_mode: "self_report",
    measurement_type: "self_report_trait_mixed_ei",
    access: {
      all_results_free: true,
      locked: false,
      blur: false,
      paywall: false,
    },
    scores: {
      global: {
        standard_score: 104,
        percentile: 61,
        band: "stable",
        label: isZh ? "情绪与关系综合指数" : "Emotional & Relational Functioning Index",
      },
      dimensions: {
        SA: { code: "SA", label: isZh ? "自我觉察" : "Self-Awareness", standard_score: 108, percentile: 70, band: "proficient" },
        ER: { code: "ER", label: isZh ? "情绪调节" : "Emotion Regulation", standard_score: 91, percentile: 28, band: "developing" },
        EM: { code: "EM", label: isZh ? "共情理解" : "Empathy", standard_score: 112, percentile: 76, band: "proficient" },
        RM: { code: "RM", label: isZh ? "关系管理" : "Relationship Management", standard_score: 99, percentile: 52, band: "stable" },
      },
    },
    dimension_summary: [
      { code: "SA", label: isZh ? "自我觉察" : "Self-Awareness", standard_score: 108, percentile: 70, band: "proficient" },
      { code: "ER", label: isZh ? "情绪调节" : "Emotion Regulation", standard_score: 91, percentile: 28, band: "developing" },
      { code: "EM", label: isZh ? "共情理解" : "Empathy", standard_score: 112, percentile: 76, band: "proficient" },
      { code: "RM", label: isZh ? "关系管理" : "Relationship Management", standard_score: 99, percentile: 52, band: "stable" },
    ],
    quality: {
      level: "A",
      confidence_label: "high",
      flags: [],
      explanation_asset_id: "eq.quality.level.A",
    },
    interpretation: {
      core_formulation_id: "high_empathy_low_recovery",
      strongest_dimension: "EM",
      development_lever: "ER",
      primary_mechanism_ids: ["EM_ER_high_low"],
      primary_scene_ids: ["feedback", "conflict", "relationship_boundary"],
      career_environment_ids: ["emotional_labor_high", "autonomy_recovery_medium"],
      action_prescription_id: "empathy_boundary",
    },
    next_module: {
      available: false,
      module_code: "EQ_SJT_16",
      status: "planned",
      cta_asset_id: "eq.sjt_bridge.planned",
    },
    methodology: {
      norm_status: "provisional",
      scoring_version: "v1.0_normed_validity",
      report_version: "eq_report_v5_assets",
      content_version: "EQ_60/v1",
    },
    report_tags: ["profile:high_empathy", "quality_level:A", "focus:ER", "bucket:eq"],
    asset_refs: {
      core_formulation_id: "high_empathy_low_recovery",
      mechanism_ids: ["EM_ER_high_low"],
      scene_ids: ["feedback", "conflict", "relationship_boundary"],
      career_environment_ids: ["emotional_labor_high", "autonomy_recovery_medium"],
      action_prescription_id: "empathy_boundary",
    },
    assets: {
      scientific_contract: {
        test_definition: isZh ? "这是一份基于 60 道自我报告题的情绪与关系模式报告。" : "This report is based on 60 self-report items.",
        self_report_statement: isZh ? "本报告反映主观感知，不等同于客观能力测验。" : "This report reflects subjective self-perception and is not an objective ability test.",
        non_clinical_statement: isZh ? "本报告不用于临床诊断。" : "This report is not for clinical diagnosis.",
        non_hiring_statement: isZh ? "本报告不用于招聘筛选。" : "This report is not for hiring selection.",
        non_ability_statement: isZh ? "本报告不是认证能力测验。" : "This report is not a certified ability assessment.",
        norm_status_statement: isZh ? "当前常模为阶段性常模。" : "Current norms are provisional.",
        quality_rules_statement: isZh ? "系统会参考作答质量信号给出解释置信度。" : "The system uses response quality signals to estimate interpretation confidence.",
        version_statement: "Report version eq_report_v5_assets.",
      },
      score_system: {
        global_index: {
          label: isZh ? "情绪与关系综合指数" : "Emotional & Relational Functioning Index",
          meaning: isZh ? "综合四个维度的自我报告信号。" : "A combined self-report signal across four dimensions.",
        },
        score_notes: {
          standard_score: isZh ? "标准分以阶段性常模为参照。" : "Standard scores are interpreted against provisional norms.",
          percentile: isZh ? "百分位表示相对位置。" : "Percentiles indicate relative position.",
        },
        bands: { proficient: isZh ? "熟练成熟" : "Proficient", developing: isZh ? "发展中" : "Developing", stable: isZh ? "稳定可用" : "Stable" },
        dimensions: {
          SA: { label: isZh ? "自我觉察" : "Self-Awareness", definition: "SA", band_explanations: { proficient: isZh ? "自我觉察较成熟。" : "Self-awareness is mature." } },
          ER: { label: isZh ? "情绪调节" : "Emotion Regulation", definition: "ER", band_explanations: { developing: isZh ? "情绪调节已有基础。" : "Emotion regulation has a base." } },
          EM: { label: isZh ? "共情理解" : "Empathy", definition: "EM", band_explanations: { proficient: isZh ? "共情理解较成熟。" : "Empathy is mature." } },
          RM: { label: isZh ? "关系管理" : "Relationship Management", definition: "RM", band_explanations: { stable: isZh ? "关系管理稳定可用。" : "Relationship management is stable." } },
        },
      },
      core_formulation: {
        id: "high_empathy_low_recovery",
        title: isZh ? "高共情，低恢复" : "High Empathy, Lower Recovery",
        one_liner: isZh ? "你容易理解他人感受，但恢复和边界是当前杠杆。" : "You tend to understand others, while recovery and boundaries are the current lever.",
        core_claim: isZh ? "你可能很快接住别人的情绪。" : "You may quickly pick up other people's emotions.",
        evidence_basis: ["EM high", "ER lower"],
        primary_strength: isZh ? "容易建立信任。" : "Trust can form quickly.",
        likely_cost: isZh ? "容易承接过多情绪。" : "You may carry too much emotion.",
        development_lever: isZh ? "共情之后保留恢复空间。" : "Keep recovery space after empathy.",
        do_not_overread: isZh ? "这不是能力认证。" : "This is not ability certification.",
      },
      mechanisms: [
        {
          id: "EM_ER_high_low",
          title: isZh ? "共情之后的恢复" : "Recovery After Empathy",
          why_it_matters: isZh ? "共情和恢复之间的差距会影响边界。" : "The gap between empathy and recovery affects boundaries.",
          what_it_feels_like: isZh ? "容易被他人状态带走。" : "Other people's states may pull you along.",
          strength: isZh ? "理解细腻。" : "Nuanced understanding.",
          cost: isZh ? "恢复变慢。" : "Recovery can slow down.",
          development_lever: isZh ? "暂停。" : "Pause.",
          micro_action: isZh ? "先命名自己的状态。" : "Name your own state first.",
        },
      ],
      reality_scenes: [
        { id: "feedback", title: isZh ? "反馈" : "Feedback", typical_response: isZh ? "先照顾对方感受。" : "You may attend to the other person's feeling first.", strength: isZh ? "降低对抗。" : "Reduces defensiveness.", cost: isZh ? "忽略自己。" : "You may miss yourself.", better_move: isZh ? "先分开信息和情绪。" : "Separate information from emotion first." },
        { id: "conflict", title: isZh ? "冲突" : "Conflict", typical_response: "response", strength: "strength", cost: "cost", better_move: "move" },
        { id: "relationship_boundary", title: isZh ? "关系边界" : "Relationship Boundary", typical_response: "response", strength: "strength", cost: "cost", better_move: "move" },
      ],
      career_environment: [
        { id: "emotional_labor_high", variable: "emotional_labor", level: "high", label: isZh ? "高情绪劳动" : "High emotional labor", meaning: isZh ? "经常承接他人情绪。" : "Frequent exposure to others' emotions.", fit_signal: isZh ? "能使用共情优势。" : "Empathy can be useful.", strain_signal: isZh ? "容易消耗。" : "Can be draining.", what_to_verify: isZh ? "是否有恢复空间。" : "Verify recovery space." },
        { id: "autonomy_recovery_medium", variable: "autonomy_recovery", level: "medium", label: isZh ? "中等自主恢复空间" : "Medium recovery autonomy", meaning: "meaning", fit_signal: "fit", strain_signal: "strain", what_to_verify: "verify" },
      ],
      action_prescription: {
        id: "empathy_boundary",
        title: isZh ? "共情边界处方" : "Empathy Boundary Prescription",
        why_this_matters: isZh ? "理解他人之后仍需要保留自己。" : "Understanding others still needs room for yourself.",
        do_today: isZh ? "写下一次你被带走的场景。" : "Write down one moment when you were pulled along.",
        script: isZh ? "我理解你的感受，我也需要一点时间整理。" : "I understand how you feel, and I need a moment to organize my response.",
        seven_day_plan: [isZh ? "第 1 天：记录触发点。" : "Day 1: record the trigger."],
        watch_out: isZh ? "不要把边界理解成冷漠。" : "Do not read boundaries as coldness.",
      },
      sjt_bridge: {
        id: "eq.sjt_bridge.planned",
        available: false,
        title: isZh ? "未来情境判断模块" : "Future Scenario Module",
        description: isZh ? "16 道情境判断题计划中。" : "A 16-item scenario module is planned.",
        complements: isZh ? "它补充自我报告。" : "It complements self-report.",
        not_this: isZh ? "它不是认证能力测验。" : "It is not a certified ability assessment.",
        completed_report_adds: [isZh ? "综合报告" : "Integrated report"],
        button_label: isZh ? "继续完成情境题" : "Continue scenario module",
      },
      quality: {
        explanation_asset_id: "eq.quality.level.A",
        confidence_label: "high",
      },
    },
  };

  return {
    ok: true,
    locked: false,
    variant: "full",
    access_level: "full",
    report,
    scale_code: "EQ_60",
    ...overrides,
  } as ReportResponse;
}

describe("EQ v5 result renderer contract", () => {
  it("renders the EQ-specific v5 sections from resolved backend assets", () => {
    render(<EQResultV5 locale="en" reportData={createEqReportData("en")} attemptId="eq-result-001" />);

    expect(screen.getByTestId("eq-result-v5")).toBeInTheDocument();
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("High Empathy, Lower Recovery");
    expect(screen.getByTestId("eq-evidence-snapshot")).toHaveTextContent("Evidence Snapshot");
    expect(screen.getByTestId("eq-quality-banner")).toHaveTextContent("Interpretation Confidence");
    expect(screen.getByTestId("eq-emotional-matrix")).toHaveTextContent("Self-Awareness");
    expect(screen.getByTestId("eq-mechanism-section")).toHaveTextContent("Recovery After Empathy");
    expect(screen.getByTestId("eq-reality-scenes")).toHaveTextContent("Feedback");
    expect(screen.getByTestId("eq-career-environment")).toHaveTextContent("High emotional labor");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("Empathy Boundary Prescription");
    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("Planned, not available yet");
    expect(screen.getByTestId("eq-scientific-boundary")).toHaveTextContent("This report is based on 60 self-report items.");
  });

  it("normalizes backend payload and keeps low confidence from becoming a strong personality claim", () => {
    const reportData = createEqReportData("en");
    const report = reportData.report as Record<string, unknown>;
    report.interpretation = {
      core_formulation_id: "low_confidence_result",
      strongest_dimension: "",
      development_lever: "",
      primary_mechanism_ids: [],
      primary_scene_ids: ["pressure_recovery"],
      career_environment_ids: [],
      action_prescription_id: "retest_reflection",
    };
    report.assets = {
      ...(report.assets as Record<string, unknown>),
      core_formulation: {
        id: "low_confidence_result",
        title: "Low Confidence Result",
        one_liner: "This result is better treated as an initial reference.",
        core_claim: "The response pattern does not support a strong interpretation.",
        primary_strength: "",
        likely_cost: "",
        development_lever: "Retake under steadier conditions.",
        do_not_overread: "Do not overread this result.",
      },
      mechanisms: [],
      action_prescription: {
        id: "retest_reflection",
        title: "Retest Reflection",
        why_this_matters: "A steadier retake gives a clearer basis.",
        do_today: "Note what affected your response.",
        script: "",
        seven_day_plan: [],
        watch_out: "Avoid forcing a label from this result.",
      },
    };

    const viewModel = normalizeEqV5Report(reportData, "en");
    expect(viewModel?.interpretation.core_formulation_id).toBe("low_confidence_result");

    render(<EQResultV5 locale="en" reportData={reportData} />);
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("Low Confidence Result");
    expect(screen.getByTestId("eq-result-hero")).not.toHaveTextContent("High Empathy, Lower Recovery");
  });

  it("does not render clickable SJT entry or payment language when the next module is planned", () => {
    render(<EQResultV5 locale="en" reportData={createEqReportData("en")} />);

    expect(screen.getByTestId("eq-sjt-bridge")).toHaveTextContent("Planned, not available yet");
    expect(screen.queryByRole("link", { name: /scenario|sjt|continue/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/unlock|purchase|premium|SKU_EQ_60_FULL_299|paywall|blur|locked/i)).not.toBeInTheDocument();
  });

  it("ignores anomalous paid fields and raw technical tags in the user-visible renderer", () => {
    const reportData = createEqReportData("en", {
      locked: true,
      upgrade_sku: "SKU_EQ_60_FULL_299",
      offers: [{ sku: "SKU_EQ_60_FULL_299", title: "Paid EQ" }],
    });

    render(<EQResultV5 locale="en" reportData={reportData} />);

    expect(screen.queryByText(/SKU_EQ_60_FULL_299|purchase|premium|paywall|blur/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/profile:|quality_level:|focus:|bucket:/i)).not.toBeInTheDocument();
  });

  it("uses safe dimension fallbacks when scores.dimensions and dimension_summary are missing", () => {
    const reportData = createEqReportData("en");
    const report = reportData.report as Record<string, unknown>;
    report.dimension_summary = [];
    report.scores = { global: { standard_score: 100 } };

    render(<EQResultV5 locale="en" reportData={reportData} />);

    const matrix = screen.getByTestId("eq-emotional-matrix");
    expect(within(matrix).getAllByText("This dimension is unavailable.")).toHaveLength(4);
  });

  it("renders zh-CN and en resolved assets without frontend report copy", () => {
    const zhReport = createEqReportData("zh");
    const enReport = createEqReportData("en");

    expect(isEqV5ReportResponse(zhReport)).toBe(true);
    expect(isEqV5ReportResponse(enReport)).toBe(true);

    const { rerender } = render(<EQResultV5 locale="zh" reportData={zhReport} />);
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("高共情，低恢复");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("共情边界处方");

    rerender(<EQResultV5 locale="en" reportData={enReport} />);
    expect(screen.getByTestId("eq-result-hero")).toHaveTextContent("High Empathy, Lower Recovery");
    expect(screen.getByTestId("eq-action-prescription")).toHaveTextContent("Empathy Boundary Prescription");
  });
});
