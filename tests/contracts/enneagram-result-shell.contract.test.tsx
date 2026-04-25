import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  fetchEnneagramObservation: vi.fn(),
  assignEnneagramObservation: vi.fn(),
  submitEnneagramObservationDay3: vi.fn(),
  submitEnneagramObservationDay7: vi.fn(),
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

function createV2ReportResponse({
  formCode = "enneagram_likert_105",
  scope = "clear",
  extraModule,
}: {
  formCode?: "enneagram_likert_105" | "enneagram_forced_choice_144";
  scope?: "clear" | "close_call" | "diffuse" | "low_quality";
  extraModule?: Record<string, unknown>;
} = {}): ReportResponse {
  const isFc144 = formCode === "enneagram_forced_choice_144";
  const overviewModules: Record<string, unknown>[] = [
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
      module_key: "type_deep_dive_summary",
      kind: "type_deep_dive_summary",
      visibility: "visible",
      state: scope,
      form_variant: "all",
      content: {
        primary_candidate: isFc144 ? "5" : "1",
        type_name_cn: isFc144 ? "理智型" : "完美型",
        type_name_en: isFc144 ? "The Investigator" : "The Reformer",
        short_title: "把事情拉回正确轨道的人",
        core_desire: "core desire scaffold",
        core_fear: "core fear scaffold",
        defense_pattern: "defense pattern scaffold",
        self_misread: "self misread scaffold",
        validation_hook: "validation hook scaffold",
      },
      data_refs: [],
      registry_refs: [],
      provenance: {
        projection_refs: [],
        registry_refs: [],
        policy_refs: [],
        content_maturity: "p0_ready",
        evidence_level: "theory_based",
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
        pair: scope === "close_call" ? { pair_key: "1_6", type_a: "1", type_b: "6", trigger_reason: "gap_below_threshold" } : null,
        pair_entry: scope === "close_call" ? { core_motivation_difference: "motivation contrast" } : null,
      },
      data_refs: [],
      registry_refs: scope === "close_call" ? ["enneagram_pair_registry:1_6"] : [],
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
      registry_refs: [],
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
    ...(extraModule ? [extraModule] : []),
  ];

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
      confidence_level: scope === "clear" ? "high_confidence" : scope,
      interpretation_reason: `reason_for_${scope}`,
    },
    pages: [
      {
        page_key: "page_1_result_overview",
        title: "结果总览",
        purpose: "首屏总览",
        visibility: "visible",
        source_registry_refs: [],
        modules: overviewModules,
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
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "工作风格",
              body: "work style scaffold",
              type_summary: "work mechanism scaffold",
              list_groups: [
                {
                  label_key: "ideal_environment",
                  items: [
                    { title: "clear boundaries", body: "ideal environment scaffold" },
                  ],
                },
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
            module_key: "collaboration_strengths",
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "协作优势",
              body: "strength scaffold",
              type_summary: "work advantage",
              list_groups: [
                {
                  label_key: "work_strengths",
                  items: [
                    { title: "steady value", body: "work strength scaffold" },
                    { title: "quality control", body: "second work strength scaffold" },
                    { title: "systems thinking", body: "third work strength scaffold" },
                    { title: "clean execution", body: "fourth work strength scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
          {
            module_key: "collaboration_friction",
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "协作摩擦点",
              body: "friction scaffold",
              type_summary: "internal tension scaffold",
              list_groups: [
                {
                  label_key: "work_friction_points",
                  items: [
                    { title: "over-correcting", body: "friction point scaffold" },
                    { title: "too rigid", body: "second friction point scaffold" },
                    { title: "recheck loop", body: "third friction point scaffold" },
                    { title: "hard to release", body: "fourth friction point scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
          {
            module_key: "managed_by_others",
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "被管理时更顺畅的方式",
              body: "managed by others scaffold",
              type_summary: "relationship summary scaffold",
              list_groups: [
                {
                  label_key: "collaboration_manual",
                  items: [
                    { title: "say priorities", body: "collaboration manual scaffold" },
                    { title: "name tradeoffs", body: "second collaboration manual scaffold" },
                    { title: "allow enough", body: "third collaboration manual scaffold" },
                  ],
                },
                {
                  label_key: "managed_by_others",
                  items: [
                    { title: "clear expectations", body: "managed by others scaffold" },
                    { title: "stable feedback", body: "second managed by others scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
          {
            module_key: "workplace_trigger_points",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              list_groups: [
                {
                  label_key: "workplace_trigger_points",
                  items: [
                    { title: "changing rules", body: "workplace trigger scaffold" },
                    { title: "ignored risks", body: "second workplace trigger scaffold" },
                  ],
                },
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
            fallback_policy: "fallback_to_generic",
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
              value: "growth axis scaffold",
              detail_label: "growth_principle",
              deep_dive_detail: "growth principle scaffold",
              type_name_cn: "完美型",
              type_name_en: "The Reformer",
              list_groups: [
                {
                  label_key: "growth_strengths",
                  items: [
                    { title: "clear standards", body: "growth strength scaffold" },
                    { title: "reliable judgment", body: "second growth strength scaffold" },
                    { title: "system care", body: "third growth strength scaffold" },
                    { title: "steady follow-through", body: "fourth growth strength scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "stress_trigger",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              value: "stress signal scaffold",
              type_name_cn: "完美型",
              type_name_en: "The Reformer",
              list_groups: [
                {
                  label_key: "early_warning_signs",
                  items: [
                    { title: "recheck loop", body: "early warning scaffold" },
                    { title: "short fuse", body: "second early warning scaffold" },
                    { title: "body tension", body: "third early warning scaffold" },
                    { title: "low satisfaction", body: "fourth early warning scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
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
              stress_signal: "stress signal scaffold",
              growth_principle: "growth principle scaffold",
              thirty_day_experiment: "thirty day experiment scaffold",
              list_groups: [
                {
                  label_key: "early_warning_signs",
                  items: [
                    { title: "recheck loop", body: "early warning scaffold" },
                    { title: "short fuse", body: "second early warning scaffold" },
                    { title: "body tension", body: "third early warning scaffold" },
                    { title: "low satisfaction", body: "fourth early warning scaffold" },
                  ],
                },
              ],
              disclaimer: "not a hard health-level judgement",
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
            module_key: "recovery_action",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              recovery_action: "recovery action",
              type_recovery_action: "type recovery action scaffold",
              growth_principle: "growth principle scaffold",
              thirty_day_experiment: "thirty day experiment scaffold",
              list_groups: [
                {
                  label_key: "recovery_protocol",
                  items: [
                    { title: "sort priorities", body: "recovery protocol scaffold" },
                    { title: "allow enough", body: "second recovery protocol scaffold" },
                    { title: "reset body", body: "third recovery protocol scaffold" },
                  ],
                },
                {
                  label_key: "small_experiments",
                  items: [
                    { title: "key issue only", body: "small experiment scaffold" },
                    { title: "invite not correct", body: "second small experiment scaffold" },
                    { title: "log enough", body: "third small experiment scaffold" },
                  ],
                },
              ],
              disclaimer: "not a hard health-level judgement",
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "strength_expression",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              items: [
                {
                  group_ref: "center:body",
                  group_type: "center",
                  group_key: "body",
                  description: "body center description",
                  value: "strength expression body",
                },
              ],
              status: "available",
              list_groups: [
                {
                  label_key: "growth_strengths",
                  items: [
                    { title: "clear standards", body: "growth strength scaffold" },
                    { title: "reliable judgment", body: "second growth strength scaffold" },
                    { title: "system care", body: "third growth strength scaffold" },
                    { title: "steady follow-through", body: "fourth growth strength scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "cost_expression",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              items: [
                {
                  group_ref: "stance:compliant",
                  group_type: "stance",
                  group_key: "compliant",
                  description: "compliant description",
                  value: "cost expression body",
                },
              ],
              status: "available",
              list_groups: [
                {
                  label_key: "growth_costs",
                  items: [
                    { title: "over-control", body: "growth cost scaffold" },
                    { title: "too tense", body: "second growth cost scaffold" },
                    { title: "emotion hidden", body: "third growth cost scaffold" },
                    { title: "relationship strain", body: "fourth growth cost scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
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
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "关系需要",
              body: "relationship need scaffold",
              type_summary: "relationship script scaffold",
              list_groups: [
                {
                  label_key: "partner_facing_notes",
                  items: [
                    { title: "responsibility is care", body: "partner note scaffold" },
                    { title: "clarity helps", body: "second partner note scaffold" },
                  ],
                },
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
            module_key: "relationship_strengths",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              value: "relationship strength summary scaffold",
              type_name_cn: "完美型",
              type_name_en: "The Reformer",
              list_groups: [
                {
                  label_key: "relationship_strengths",
                  items: [
                    { title: "reliable", body: "relationship strength scaffold" },
                    { title: "serious about issues", body: "second relationship strength scaffold" },
                    { title: "clear boundaries", body: "third relationship strength scaffold" },
                    { title: "care through action", body: "fourth relationship strength scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "misread_by_others",
            kind: "summary_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              value: "misread scaffold",
              type_name_cn: "完美型",
              type_name_en: "The Reformer",
              list_groups: [
                {
                  label_key: "relationship_traps",
                  items: [
                    { title: "sounds critical", body: "relationship trap scaffold" },
                    { title: "hard to soften", body: "second relationship trap scaffold" },
                    { title: "turns care into fixing", body: "third relationship trap scaffold" },
                    { title: "builds pressure", body: "fourth relationship trap scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "conflict_script",
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "冲突脚本",
              body: "conflict script body",
              type_summary: "conflict pattern scaffold",
              list_groups: [
                {
                  label_key: "conflict_trigger_points",
                  items: [
                    { title: "missed promises", body: "conflict trigger scaffold" },
                    { title: "moving standards", body: "second conflict trigger scaffold" },
                    { title: "problem minimised", body: "third conflict trigger scaffold" },
                  ],
                },
                {
                  label_key: "repair_language",
                  items: [
                    { title: "not trying to pick on you", body: "repair language scaffold" },
                    { title: "here is my concern", body: "second repair language scaffold" },
                    { title: "one issue first", body: "third repair language scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "theory_based",
            },
            fallback_policy: "required",
          },
          {
            module_key: "communication_manual",
            kind: "scenario_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              title: "沟通说明书",
              body: "communication manual scaffold",
              type_summary: "surface summary",
              list_groups: [
                {
                  label_key: "communication_manual",
                  items: [
                    { title: "name the feeling", body: "communication manual scaffold" },
                    { title: "align on shared goal", body: "second communication manual scaffold" },
                    { title: "say it earlier", body: "third communication manual scaffold" },
                  ],
                },
              ],
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
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
            module_key: "technical_note_link",
            kind: "link_card",
            visibility: "visible",
            state: scope,
            form_variant: "all",
            content: {
              label: "技术说明",
              technical_note_version: "unavailable",
              sections: [{ section_key: "test_goal", title: "测试目标" }],
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
              sample_key: "clear_sample",
              sample_type: "clear",
              form_code: "enneagram_likert_105",
              interpretation_scope: scope,
              top_types: ["8", "3", "1"],
              short_summary: "sample short summary",
              page_1_preview: "sample page 1 preview",
              method_boundary: "sample boundary",
              public_url_slug: "enneagram-clear-sample",
            },
            data_refs: [],
            registry_refs: [],
            provenance: {
              projection_refs: [],
              registry_refs: [],
              policy_refs: [],
              content_maturity: "p0_ready",
              evidence_level: "descriptive",
            },
            fallback_policy: "required",
          },
          {
            module_key: "history_share_retake_placeholder",
            kind: "placeholder_card",
            visibility: "placeholder",
            state: scope,
            form_variant: "all",
            content: {
              status: "placeholder",
              reason: "history_share_surface_not_shipped",
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
            fallback_policy: "fallback_to_generic",
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

async function renderShell(reportData: ReportResponse) {
  const viewModel = assembleEnneagramResultViewModel({
    reportData,
    locale: "zh",
    gate: { isFreeVariant: false },
  });

  const rendered = render(
    <EnneagramResultShell
      locale="zh"
      attemptId="attempt-v2"
      reportLocked={false}
      accessProjection={null}
      viewModel={viewModel}
    />
  );

  await waitFor(() => {
    expect(hoisted.fetchEnneagramObservation).toHaveBeenCalled();
  });

  return rendered;
}

describe("enneagram result shell contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.fetchEnneagramObservation.mockResolvedValue({
      ok: true,
      observation_state_v1: {
        version: "enneagram_observation_state.v1",
        attempt_id: "attempt-v2",
        scale_code: "ENNEAGRAM",
        status: "initial_result",
        interpretation_scope: "clear",
        tasks: [],
        observation_completion_rate: 0,
        suggested_next_action: "observe_7_days",
      },
    });
  });

  it("renders all five V2 pages from the backend payload", async () => {
    await renderShell(createV2ReportResponse());

    expect(screen.getByTestId("enneagram-v2-page-page_1_result_overview")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-v2-page-page_2_work_reality")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-v2-page-page_3_growth_spectrum")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-v2-page-page_4_relationship_conflict")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-v2-page-page_5_method_observation_next")).toBeInTheDocument();
  });

  it("renders page 2 scenario cards instead of falling back to the generic renderer", async () => {
    await renderShell(createV2ReportResponse());

    const page = screen.getByTestId("enneagram-v2-page-page_2_work_reality");
    expect(within(page).getByTestId("enneagram-module-workplace_trigger_points")).toHaveTextContent("工作触发点");
    expect(within(page).getByTestId("enneagram-module-work_style_summary")).toHaveTextContent("work style scaffold");
    expect(within(page).getByTestId("enneagram-module-work_style_summary")).toHaveTextContent("work mechanism scaffold");
    expect(within(page).getByTestId("enneagram-module-work_style_summary")).toHaveTextContent("ideal environment scaffold");
    expect(within(page).getByTestId("enneagram-module-collaboration_strengths")).toHaveTextContent("strength scaffold");
    expect(within(page).getByTestId("enneagram-module-collaboration_strengths")).toHaveTextContent("work strength scaffold");
    expect(within(page).getByTestId("enneagram-module-collaboration_friction")).toHaveTextContent("friction point scaffold");
    expect(within(page).getByTestId("enneagram-module-managed_by_others")).toHaveTextContent("managed by others scaffold");
    expect(within(page).getByTestId("enneagram-module-workplace_trigger_points")).toHaveTextContent("workplace trigger scaffold");
    expect(within(page).queryByText("当前模块使用通用渲染。")).not.toBeInTheDocument();
  });

  it("renders page 3 state spectrum and group overlays with boundary copy", async () => {
    await renderShell(createV2ReportResponse());

    const page = screen.getByTestId("enneagram-v2-page-page_3_growth_spectrum");
    expect(within(page).getByTestId("enneagram-module-state_spectrum")).toHaveTextContent("stable expression");
    expect(within(page).getByTestId("enneagram-module-state_spectrum")).toHaveTextContent("not a hard health-level judgement");
    expect(within(page).getByTestId("enneagram-module-stress_trigger")).toHaveTextContent("stress signal scaffold");
    expect(within(page).getByTestId("enneagram-module-stress_trigger")).toHaveTextContent("early warning scaffold");
    expect(within(page).getByTestId("enneagram-module-recovery_action")).toHaveTextContent("type recovery action scaffold");
    expect(within(page).getByTestId("enneagram-module-recovery_action")).toHaveTextContent("recovery protocol scaffold");
    expect(within(page).getByTestId("enneagram-module-recovery_action")).toHaveTextContent("thirty day experiment scaffold");
    expect(within(page).getByTestId("enneagram-module-growth_axis")).toHaveTextContent("growth principle scaffold");
    expect(within(page).getByTestId("enneagram-module-growth_axis")).toHaveTextContent("growth strength scaffold");
    expect(within(page).getByTestId("enneagram-module-strength_expression")).toHaveTextContent("strength expression body");
    expect(within(page).getByTestId("enneagram-module-cost_expression")).toHaveTextContent("growth cost scaffold");
  });

  it("renders page 4 relationship and conflict cards instead of generic fallback", async () => {
    await renderShell(createV2ReportResponse());

    const page = screen.getByTestId("enneagram-v2-page-page_4_relationship_conflict");
    expect(within(page).getByTestId("enneagram-module-relationship_need")).toHaveTextContent("relationship need scaffold");
    expect(within(page).getByTestId("enneagram-module-relationship_need")).toHaveTextContent("relationship script scaffold");
    expect(within(page).getByTestId("enneagram-module-relationship_need")).toHaveTextContent("partner note scaffold");
    expect(within(page).getByTestId("enneagram-module-relationship_strengths")).toHaveTextContent("relationship strength scaffold");
    expect(within(page).getByTestId("enneagram-module-misread_by_others")).toHaveTextContent("relationship trap scaffold");
    expect(within(page).getByTestId("enneagram-module-conflict_script")).toHaveTextContent("conflict pattern scaffold");
    expect(within(page).getByTestId("enneagram-module-conflict_script")).toHaveTextContent("repair language scaffold");
    expect(within(page).getByTestId("enneagram-module-communication_manual")).toHaveTextContent("communication manual scaffold");
    expect(within(page).queryByText("当前模块使用通用渲染。")).not.toBeInTheDocument();
  });

  it("renders page 1 type deep dive summary", async () => {
    await renderShell(createV2ReportResponse());

    const page = screen.getByTestId("enneagram-v2-page-page_1_result_overview");
    expect(within(page).getByTestId("enneagram-module-type_deep_dive_summary")).toHaveTextContent("core desire scaffold");
    expect(within(page).getByTestId("enneagram-module-type_deep_dive_summary")).toHaveTextContent("core fear scaffold");
    expect(within(page).getByTestId("enneagram-module-type_deep_dive_summary")).toHaveTextContent("self misread scaffold");
  });

  it("renders close-call state with the close_call_card module", async () => {
    await renderShell(createV2ReportResponse({ scope: "close_call" }));

    const moduleNode = screen.getByTestId("enneagram-module-close-call-card");
    expect(moduleNode).toBeInTheDocument();
    expect(within(moduleNode).getByText(/1 vs 6/)).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-v2-interpretation-scope")).toHaveTextContent("close_call");
  });

  it("renders diffuse state with the diffuse boundary module", async () => {
    await renderShell(createV2ReportResponse({ scope: "diffuse" }));

    expect(screen.getByTestId("enneagram-module-diffuse-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("enneagram-v2-summary-body")).toHaveTextContent("body_for_diffuse");
  });

  it("renders low-quality state with boundary copy and qc flags", async () => {
    await renderShell(createV2ReportResponse({ scope: "low_quality" }));

    const moduleNode = screen.getByTestId("enneagram-module-low-quality-boundary");
    expect(moduleNode).toBeInTheDocument();
    expect(within(moduleNode).getByText(/triggered_operational_signal/)).toBeInTheDocument();
    expect(within(moduleNode).getByText(/speed_too_fast/)).toBeInTheDocument();
  });

  it("uses different form badges for E105 and FC144 while keeping one shell", async () => {
    const firstRender = await renderShell(createV2ReportResponse({ formCode: "enneagram_likert_105" }));
    expect(screen.getByTestId("enneagram-form-badge")).toHaveTextContent("E105 标准版");
    firstRender.unmount();

    await renderShell(createV2ReportResponse({ formCode: "enneagram_forced_choice_144" }));
    expect(screen.getByTestId("enneagram-form-badge")).toHaveTextContent("FC144 深度版");
  });

  it("renders all9 profile completeness and top3 cards", async () => {
    await renderShell(createV2ReportResponse());

    expect(screen.getByTestId("enneagram-v2-all9-profile-count")).toHaveTextContent("9");
    const top3 = screen.getByTestId("enneagram-module-top3-cards");
    expect(within(top3).getByText(/#1/)).toBeInTheDocument();
    expect(within(top3).getByText("Type 6")).toBeInTheDocument();
  });

  it("keeps unknown modules safe with the generic fallback renderer", async () => {
    await renderShell(
      createV2ReportResponse({
        extraModule: {
          module_key: "unknown_future_module",
          kind: "future_card",
          visibility: "visible",
          state: "clear",
          form_variant: "all",
          content: {
            title: "Future module",
            body: "This module is using the generic renderer.",
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
          fallback_policy: "fallback_to_generic",
        },
      })
    );

    const moduleNode = screen.getByTestId("enneagram-module-unknown_future_module");
    expect(moduleNode).toBeInTheDocument();
    expect(moduleNode).toHaveTextContent("unknown_future_module");
    expect(moduleNode).toHaveTextContent("当前模块使用通用渲染");
  });

  it("links the technical note module to the dedicated technical note page", async () => {
    await renderShell(createV2ReportResponse());

    const link = screen.getByTestId("enneagram-technical-note-link");
    expect(link).toHaveAttribute("href", "/zh/tests/enneagram-personality-test-nine-types/technical-note");
    expect(link).toHaveTextContent("阅读技术说明");
  });

  it("renders sample report preview content instead of a slug-only placeholder", async () => {
    await renderShell(createV2ReportResponse());

    const moduleNode = screen.getByTestId("enneagram-module-sample-report-link");
    expect(moduleNode).toHaveTextContent("sample short summary");
    expect(moduleNode).toHaveTextContent("sample page 1 preview");
    expect(moduleNode).toHaveTextContent("sample boundary");
    expect(moduleNode).toHaveTextContent("enneagram-clear-sample");
  });

  it("renders page 5 placeholder modules without dropping into the generic renderer", async () => {
    await renderShell(createV2ReportResponse());

    const page = screen.getByTestId("enneagram-v2-page-page_5_method_observation_next");
    expect(within(page).getByTestId("enneagram-module-history_share_retake_placeholder")).toHaveTextContent(
      "history_share_surface_not_shipped",
    );
    expect(within(page).queryByText("当前模块使用通用渲染。")).not.toBeInTheDocument();
  });

  it("marks placeholder and unavailable modules without inventing fake long-form content", async () => {
    await renderShell(createV2ReportResponse());

    expect(screen.getByTestId("enneagram-module-workplace_trigger_points")).not.toHaveTextContent("占位模块");
    expect(screen.getByTestId("enneagram-module-blind_spot_card")).toHaveTextContent("暂不可用");
  });

  it("keeps deep dive rendering safe when fields are missing", async () => {
    const report = createV2ReportResponse();
    const pages = (report.enneagram_report_v2?.pages ?? []) as Array<{ modules?: Record<string, unknown>[] }>;
    const modules = (pages[0]?.modules ?? []) as Record<string, unknown>[];
    const summary = modules.find((module) => module.module_key === "type_deep_dive_summary");

    expect(summary).toBeDefined();
    if (summary) {
      summary.content = {
        core_desire: "partial deep dive",
      };
    }

    await renderShell(report);

    const moduleNode = screen.getByTestId("enneagram-module-type_deep_dive_summary");
    expect(moduleNode).toHaveTextContent("partial deep dive");
    expect(moduleNode).not.toHaveTextContent("core fear scaffold");
  });
});
