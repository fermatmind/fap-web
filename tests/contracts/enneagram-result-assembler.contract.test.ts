import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleEnneagramResultViewModel, hasEnneagramProjection } from "@/lib/enneagram/resultAssembler";
import forcedChoice144Fixture from "@/tests/fixtures/enneagram/report_forced_choice_144.projection.json";
import likert105Fixture from "@/tests/fixtures/enneagram/report_likert_105.projection.json";

function asReport(fixture: unknown): ReportResponse {
  return structuredClone(fixture) as ReportResponse;
}

function createV2ReportResponse({
  formCode = "enneagram_likert_105",
  scope = "clear",
  includeTopLevel = true,
}: {
  formCode?: "enneagram_likert_105" | "enneagram_forced_choice_144";
  scope?: "clear" | "close_call" | "diffuse" | "low_quality";
  includeTopLevel?: boolean;
} = {}): ReportResponse {
  const isFc144 = formCode === "enneagram_forced_choice_144";
  const closeCallPair =
    scope === "close_call"
      ? {
          pair_key: "1_6",
          type_a: "1",
          type_b: "6",
          trigger_reason: "gap_below_threshold",
        }
      : null;

  const reportV2 = {
    schema_version: "enneagram.report.v2",
    scale_code: "ENNEAGRAM",
    form: {
      form_code: formCode,
      form_kind: isFc144 ? "forced_choice" : "likert",
      methodology_variant: isFc144 ? "fc144_forced_choice" : "e105_standard",
    },
    registry: {
      registry_version: "enneagram_registry.v1",
      registry_release_hash: "sha256:registry-v2",
      content_maturity: "scaffold",
      release_id: "enneagram_registry_release.v1",
    },
    classification: {
      interpretation_scope: scope,
      confidence_level: scope === "low_quality" ? "low_quality" : scope === "close_call" ? "close_call" : scope === "diffuse" ? "diffuse" : "high_confidence",
      interpretation_reason: `reason_for_${scope}`,
    },
    pages: [
      {
        page_key: "page_1_result_overview",
        title: "结果总览",
        purpose: "首屏总览",
        visibility: "visible",
        source_registry_refs: ["enneagram_ui_copy_registry"],
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
              primary_candidate: isFc144 ? "5" : "1",
              secondary_candidate: "6",
              confidence_level: scope === "clear" ? "high_confidence" : scope,
              interpretation_scope: scope,
              form_badge: {
                label: isFc144 ? "FC144 深度版" : "E105 标准版",
                body: "same model != same score space",
              },
              top_candidates: [
                { type: isFc144 ? "5" : "1", display_score: 88, candidate_role: "primary_candidate" },
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
          {
            module_key: "top3_cards",
            kind: "cards_grid",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              cards: [
                { type: isFc144 ? "5" : "1", candidate_role: "primary_candidate", display_score: 88, type_name_en: isFc144 ? "Type 5" : "Type 1", core_logic: "core 1" },
                { type: "6", candidate_role: "second_candidate", display_score: 79, type_name_en: "Type 6", core_logic: "core 6" },
                { type: "9", candidate_role: "third_candidate", display_score: 63, type_name_en: "Type 9", core_logic: "core 9" },
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
            module_key: "all9_profile",
            kind: "profile_chart",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              items: [
                { type: "1", type_name_en: "Type 1", score_display: 88, rank: 1 },
                { type: "2", type_name_en: "Type 2", score_display: 41, rank: 7 },
                { type: "3", type_name_en: "Type 3", score_display: 49, rank: 5 },
                { type: "4", type_name_en: "Type 4", score_display: 45, rank: 6 },
                { type: "5", type_name_en: "Type 5", score_display: 54, rank: 4 },
                { type: "6", type_name_en: "Type 6", score_display: 79, rank: 2 },
                { type: "7", type_name_en: "Type 7", score_display: 28, rank: 9 },
                { type: "8", type_name_en: "Type 8", score_display: 31, rank: 8 },
                { type: "9", type_name_en: "Type 9", score_display: 63, rank: 3 },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "derived",
              evidence_level: "computed",
            },
            fallback_policy: "required",
          },
          {
            module_key: "confidence_band_card",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              confidence_level: scope,
              confidence_label: scope === "clear" ? "high_confidence" : scope,
              interpretation_scope: scope,
              interpretation_reason: `reason_for_${scope}`,
              quality_level: scope === "low_quality" ? "retest" : "unavailable",
              low_quality_status: scope === "low_quality" ? "triggered_operational_signal" : "not_triggered_no_operational_signal",
              policy_versions: {
                close_call_rule_version: "close_call_rule.v1",
                confidence_policy_version: "enneagram_confidence_policy.v1",
                quality_policy_version: "enneagram_quality_policy.v1",
              },
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "derived",
              evidence_level: "computed",
            },
            fallback_policy: "required",
          },
          {
            module_key: "dominance_gap_card",
            kind: "metrics_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              dominance_gap_abs: 9,
              dominance_gap_pct: 10.2,
              normalized_gap: 0.41,
              profile_entropy: 0.72,
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "derived",
              evidence_level: "computed",
            },
            fallback_policy: "required",
          },
          {
            module_key: "close_call_card",
            kind: "comparison_card",
            visibility: scope === "close_call" ? "visible" : "collapsed",
            state: scope,
            form_variant: "all",
            content: {
              interpretation_scope: scope,
              pair: closeCallPair,
              pair_entry: closeCallPair
                ? {
                    core_motivation_difference: "motivation contrast",
                    stress_reaction_difference: "stress contrast",
                  }
                : null,
            },
            data_refs: [],
            registry_refs: closeCallPair ? ["enneagram_pair_registry:1_6"] : [],
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
            module_key: "blind_spot_card",
            kind: "placeholder_card",
            visibility: "unavailable",
            state: scope,
            form_variant: "all",
            content: {
              status: "unavailable",
              reason: "blind_spot_not_available",
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
            module_key: "center_summary",
            kind: "summary_card",
            visibility: "unavailable",
            state: scope,
            form_variant: "all",
            content: {
              status: "unavailable",
              reason: "center_scores_unavailable",
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
            module_key: "stance_summary",
            kind: "summary_card",
            visibility: "unavailable",
            state: scope,
            form_variant: "all",
            content: {
              status: "unavailable",
              reason: "stance_scores_unavailable",
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
            module_key: "harmonic_summary",
            kind: "summary_card",
            visibility: "unavailable",
            state: scope,
            form_variant: "all",
            content: {
              status: "unavailable",
              reason: "harmonic_scores_unavailable",
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
            module_key: "wing_hint_visual",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              left: "5",
              right: "9",
              strength: "soft",
              boundary_copy: "not formal wing judgement",
            },
            data_refs: [],
            registry_refs: ["enneagram_theory_hint_registry:wing_hint"],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "scaffold",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "methodology_boundary_card",
            kind: "boundary_card",
            visibility: "visible",
            state: scope,
            form_variant: isFc144 ? "fc144" : "e105",
            content: {
              form_badge: {
                label: isFc144 ? "FC144 深度版" : "E105 标准版",
                body: "same model != same score space",
              },
              methodology_copy: isFc144 ? "forced choice method" : "likert method",
              score_space_boundary: "same model != same score space",
              non_diagnostic_boundary: "non diagnostic",
            },
            data_refs: [],
            registry_refs: ["enneagram_method_registry"],
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
            module_key: "diffuse_boundary",
            kind: "boundary_card",
            visibility: scope === "diffuse" ? "visible" : "collapsed",
            state: scope,
            form_variant: "all",
            content: {
              title: "结果分散说明",
              interpretation_scope: scope,
              interpretation_reason: "entropy_high",
              profile_entropy: 0.91,
              dominance_gap_pct: 3.2,
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "derived",
              evidence_level: "computed",
            },
            fallback_policy: "required",
          },
          {
            module_key: "low_quality_boundary",
            kind: "boundary_card",
            visibility: scope === "low_quality" ? "visible" : "collapsed",
            state: scope,
            form_variant: "all",
            content: {
              title: "质量边界说明",
              interpretation_scope: scope,
              quality_level: "retest",
              low_quality_status: scope === "low_quality" ? "triggered_operational_signal" : "not_triggered_no_operational_signal",
              qc_flags: scope === "low_quality" ? ["speed_too_fast"] : [],
              signal_limitation: "no_signal",
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "derived",
              evidence_level: "computed",
            },
            fallback_policy: "required",
          },
        ],
      },
      {
        page_key: "page_2_work_reality",
        title: "工作现实",
        purpose: "work modules",
        visibility: "visible",
        source_registry_refs: [],
        modules: [
          {
            module_key: "work_style_summary",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "工作风格",
              body: "work style scaffold",
              type_summary: "work_summary_value",
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
            module_key: "collaboration_strengths",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "协作优势",
              body: "strength scaffold",
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
            module_key: "collaboration_friction",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "协作摩擦",
              body: "friction scaffold",
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
        page_key: "page_3_growth_spectrum",
        title: "成长光谱",
        purpose: "growth modules",
        visibility: "visible",
        source_registry_refs: [],
        modules: [
          {
            module_key: "growth_axis",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "成长轴",
              body: "growth axis scaffold",
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
            module_key: "state_spectrum",
            kind: "state_spectrum",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              stable_expression: "stable expression",
              average_expression: "average expression",
              strained_expression: "strained expression",
              recovery_action: "recovery action",
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
            module_key: "arrow_growth_reference_placeholder",
            kind: "placeholder_card",
            visibility: "placeholder",
            state: scope,
            form_variant: "all",
            content: {
              status: "placeholder",
              reason: "theory_placeholder",
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "scaffold",
              evidence_level: "theory_based",
            },
            fallback_policy: "fallback_to_generic",
          },
        ],
      },
      {
        page_key: "page_4_relationship_conflict",
        title: "关系与冲突",
        purpose: "relationship modules",
        visibility: "visible",
        source_registry_refs: [],
        modules: [
          {
            module_key: "relationship_need",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "关系需要",
              body: "relationship need scaffold",
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
            module_key: "conflict_script",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "冲突脚本",
              body: "conflict scaffold",
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
                { day: 1, phase: "pattern", prompt: "notice a repeated pattern" },
                { day: 2, phase: "trigger", prompt: "notice a trigger" },
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
            form_variant: isFc144 ? "fc144" : "e105",
            content: {
              recommendation_key: scope === "close_call" && !isFc144 ? "consider_fc144_followup" : "stay_with_current_form",
              interpretation_scope: scope,
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
          {
            module_key: "sample_report_link",
            kind: "link_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              sample_key: scope === "close_call" ? "close_call_sample" : "clear_sample",
              public_url_slug: "sample-report",
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
            module_key: "technical_note_link",
            kind: "link_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              label: "技术说明",
              technical_note_version: "unavailable",
              sections: [
                { section_key: "test_goal", title: "测试目标" },
                { section_key: "score_space_boundary", title: "分数空间边界" },
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
    ],
    modules: [],
    provenance: {
      projection_version: "enneagram_projection.v2",
      report_schema_version: "enneagram.report.v2",
      report_engine_version: "enneagram_report_engine.v2",
      interpretation_context_id: "ctx_123",
      content_release_hash: "sha256:content-v2",
      content_snapshot_status: "unavailable_until_registry_pack",
      registry_release_hash: "sha256:registry-v2",
      close_call_rule_version: "close_call_rule.v1",
      confidence_policy_version: "enneagram_confidence_policy.v1",
      quality_policy_version: "enneagram_quality_policy.v1",
    },
  };

  return {
    ok: true,
    attempt_id: "attempt-v2",
    scale_code: "ENNEAGRAM",
    locked: false,
    variant: "full",
    access_level: "full",
    enneagram_form_v1: {
      form_code: formCode,
      label: isFc144 ? "144-question Forced-Choice" : "105-question Likert",
      short_label: isFc144 ? "144Q Forced" : "105Q Likert",
      question_count: isFc144 ? 144 : 105,
      estimated_minutes: isFc144 ? 18 : 12,
      scale_code: "ENNEAGRAM",
    },
    enneagram_public_projection_v1: {
      schema_version: "enneagram.public_projection.v1",
      scale_code: "ENNEAGRAM",
      primary_type: {
        code: isFc144 ? "T5" : "T1",
        label: isFc144 ? "Type 5" : "Type 1",
        score: 88,
        rank: 1,
      },
      top_types: [
        { code: isFc144 ? "T5" : "T1", label: isFc144 ? "Type 5" : "Type 1", score: 88, rank: 1 },
        { code: "T6", label: "Type 6", score: 79, rank: 2 },
        { code: "T9", label: "Type 9", score: 63, rank: 3 },
      ],
      type_vector: [
        { code: "T1", label: "Type 1", score: 88, rank: 1 },
        { code: "T2", label: "Type 2", score: 41, rank: 7 },
        { code: "T3", label: "Type 3", score: 49, rank: 5 },
        { code: "T4", label: "Type 4", score: 45, rank: 6 },
        { code: "T5", label: "Type 5", score: 54, rank: 4 },
        { code: "T6", label: "Type 6", score: 79, rank: 2 },
        { code: "T7", label: "Type 7", score: 28, rank: 9 },
        { code: "T8", label: "Type 8", score: 31, rank: 8 },
        { code: "T9", label: "Type 9", score: 63, rank: 3 },
      ],
      summary: "legacy summary",
      confidence: {
        label: "stable",
      },
      quality: {
        level: "A",
      },
      _meta: {
        form_code: formCode,
      },
    },
    ...(includeTopLevel ? { enneagram_report_v2: reportV2 } : {}),
    report: {
      schema_version: "enneagram.report.v1",
      scale_code: "ENNEAGRAM",
      sections: [
        {
          key: "overview",
          title: "Overview",
          access_level: "free",
          blocks: [{ kind: "paragraph", body: "legacy section" }],
        },
        {
          key: "growth",
          title: "Growth",
          access_level: "paid",
          blocks: [{ kind: "paragraph", body: "locked section" }],
        },
      ],
      _meta: includeTopLevel ? {} : { enneagram_report_v2: reportV2 },
    },
  } as ReportResponse;
}

describe("enneagram result assembler contract", () => {
  it("parses top-level enneagram_report_v2 and prefers it over legacy derivation", () => {
    const reportData = createV2ReportResponse();
    const assembled = assembleEnneagramResultViewModel({
      reportData,
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(hasEnneagramProjection(reportData)).toBe(true);
    expect(assembled.schemaVersion).toBe("enneagram.report.v2");
    expect(assembled.pages).toHaveLength(5);
    expect(assembled.registryReleaseHash).toBe("sha256:registry-v2");
    expect(assembled.interpretationContextId).toBe("ctx_123");
    expect(assembled.summary).toBe("body_for_clear");
    expect(assembled.topTypes.map((type) => type.code)).toEqual(["1", "6", "9"]);
    expect(assembled.typeVector).toHaveLength(9);
    expect(assembled.moduleMap.instant_summary.formVariant).toBe("all");
  });

  it("parses report._meta.enneagram_report_v2 when the top-level sibling is absent", () => {
    const reportData = createV2ReportResponse({ includeTopLevel: false, formCode: "enneagram_forced_choice_144" });
    const assembled = assembleEnneagramResultViewModel({
      reportData,
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(assembled.formCode).toBe("enneagram_forced_choice_144");
    expect(assembled.formSummaryLabel).toBe("Enneagram · 144-question Forced-Choice");
    expect(assembled.methodologyVariant).toBe("fc144_forced_choice");
    expect(assembled.formVariant).toBe("fc144");
  });

  it("keeps the v1 fallback path working when V2 payload is absent", () => {
    const reportData = asReport(likert105Fixture);
    const assembled = assembleEnneagramResultViewModel({
      reportData,
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(assembled.reportV2).toBeNull();
    expect(assembled.formCode).toBe("enneagram_likert_105");
    expect(assembled.formSummaryLabel).toBe("Enneagram · 105-question Likert");
    expect(assembled.primaryType).toMatchObject({
      code: "T1",
      label: "Type 1",
      score: 88,
      rank: 1,
    });
    expect(assembled.topTypes.map((type) => type.code)).toEqual(["T1", "T5", "T6"]);
    expect(assembled.visibleSections.map((section) => section.key)).toEqual(["overview", "growth"]);
  });

  it("preserves retake form identity from persisted projection metadata when the form summary is absent", () => {
    const reportData = asReport(forcedChoice144Fixture);
    delete reportData.enneagram_form_v1;

    const assembled = assembleEnneagramResultViewModel({
      reportData,
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(assembled.formCode).toBe("enneagram_forced_choice_144");
    expect(assembled.formSummaryLabel).toBe("Enneagram · 144-question Forced-Choice");
    expect(assembled.estimatedMinutes).toBe(18);
  });

  it("splits paid legacy sections only by report access gate, not by recalculating Enneagram scores", () => {
    const assembled = assembleEnneagramResultViewModel({
      reportData: asReport(likert105Fixture),
      locale: "en",
      gate: { isFreeVariant: true },
    });

    expect(assembled.visibleSections.map((section) => section.key)).toEqual(["overview"]);
    expect(assembled.lockedSections.map((section) => section.key)).toEqual(["growth"]);
  });
});
