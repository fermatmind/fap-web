import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";

type FormCode = "riasec_60" | "riasec_140";

function buildSlot(locale: string, formCodes: FormCode[], overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slot_key: "dimension_deep_copy",
    slot_group: "dimension_deep_copy",
    slot_id: "dimension_deep_copy:I",
    module_key: "six_dimension_map",
    slot_visibility: "visible",
    status: "authored",
    content_status: "authored",
    content_version: "contract.v1",
    review_status: "approved",
    source_status: "backend_authority",
    evidence_level: "method_boundary_v1",
    locale,
    frontend_fallback_allowed: false,
    fallback_behavior: "omit_module",
    applicability: {
      form_codes: formCodes,
      profile_shapes: ["clear_code"],
      quality_states: ["normal"],
      codes: ["IAS"],
      dimensions: ["I"],
    },
    state: {},
    content: {
      title: "Authoritative slot",
      summary: "Reader-visible content from the backend projection.",
    },
    boundaries: {
      user_visible_boundary: "Interest exploration only.",
      required_boundaries: ["interest_not_ability"],
      forbidden_claims: ["career_match"],
    },
    ...overrides,
  };
}

function buildProjection(locale: string, formCode: FormCode, slots: Record<string, unknown>[]): Record<string, unknown> {
  return {
    schema_version: "riasec.public_projection.v2",
    form: { form_code: formCode },
    deep_content_slots_v1: {
      schema_version: "riasec.deep_content_slots.v1",
      scale_code: "RIASEC",
      locale,
      content_authority: "backend_riasec_authority",
      snapshot_bound: true,
      source_policy: {
        frontend_fallback_allowed: false,
        missing_content_behavior: "omit_module_fail_closed",
        pending_content_behavior: "omit_module_fail_closed",
        unknown_slot_behavior: "hidden",
        formal_report_generation: "deterministic_backend_snapshot",
      },
      slot_visibility_policy: {
        module_visibility_policy_id: "riasec_module_visibility_policy_v1",
        hidden_slots_omitted: true,
        pending_or_unavailable_slots_omitted: true,
        frontend_inference_allowed: false,
      },
      slots,
    },
  };
}

function buildReport(projection: Record<string, unknown>, formCode: FormCode): ReportResponse {
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: { form_code: formCode, label: formCode, question_count: formCode === "riasec_140" ? 140 : 60 },
    riasec_public_projection_v1: { top_code: "IAS", scores_0_100: {} },
    riasec_public_projection_v2: projection,
  } as ReportResponse;
}

describe("RIASEC locale, form, and safe-surface guard", () => {
  it.each([
    ["en", "en", "riasec_60"],
    ["en", "en", "riasec_140"],
    ["zh", "zh-CN", "riasec_60"],
    ["zh", "zh-CN", "riasec_140"],
  ] as const)("allows exact %s %s projections for %s", (pageLocale, envelopeLocale, formCode) => {
    const slots = [buildSlot(envelopeLocale, [formCode])];
    if (formCode === "riasec_140") {
      slots.push(buildSlot(envelopeLocale, ["riasec_140"], {
        slot_key: "140q_task_card_copy",
        slot_group: "140q_layer_copy",
        slot_id: "140q_task_card_copy:task",
      }));
    }

    const viewModel = assembleRiasecResultViewModel(
      buildReport(buildProjection(envelopeLocale, formCode, slots), formCode),
      pageLocale as Locale
    );

    expect(viewModel.deepContentSlots?.slots).toHaveLength(formCode === "riasec_140" ? 2 : 1);
  });

  it("fails closed for envelope or slot locale mismatch and English Han leakage", () => {
    const base = buildProjection("en", "riasec_60", [buildSlot("en", ["riasec_60"])]);

    expect(assembleRiasecResultViewModel(buildReport(base, "riasec_60"), "zh").deepContentSlots).toBeNull();

    const slotLocaleMismatch = buildProjection("en", "riasec_60", [buildSlot("zh-CN", ["riasec_60"])]);
    expect(assembleRiasecResultViewModel(buildReport(slotLocaleMismatch, "riasec_60"), "en").deepContentSlots?.slots).toEqual([]);

    const hanLeak = buildProjection("en", "riasec_60", [buildSlot("en", ["riasec_60"], {
      content: { title: "English title", summary: "包含中文的 unsafe reader copy" },
    })]);
    expect(assembleRiasecResultViewModel(buildReport(hanLeak, "riasec_60"), "en").deepContentSlots?.slots).toEqual([]);
  });

  it("rejects contextual and structural slots for 60Q even if a malformed projection claims applicability", () => {
    const malformed60 = buildProjection("en", "riasec_60", [
      buildSlot("en", ["riasec_60"]),
      buildSlot("en", ["riasec_60"], {
        slot_key: "140q_task_card_copy",
        slot_group: "140q_layer_copy",
        slot_id: "140q_task_card_copy:malformed-60",
      }),
      buildSlot("en", ["riasec_60"], {
        slot_key: "structural_difference_copy",
        slot_group: "structural_difference_copy",
        slot_id: "structural_difference_copy:malformed-60",
      }),
    ]);

    expect(assembleRiasecResultViewModel(buildReport(malformed60, "riasec_60"), "en").deepContentSlots?.slots.map((slot) => slot.slotId))
      .toEqual(["dimension_deep_copy:I"]);
  });

  it("drops missing and duplicate identities, rejects non-safe surface variants, and keeps empty projections unrendered", () => {
    const duplicateAndMissing = buildProjection("zh-CN", "riasec_60", [
      buildSlot("zh-CN", ["riasec_60"]),
      buildSlot("zh-CN", ["riasec_60"]),
      buildSlot("zh-CN", ["riasec_60"], { slot_id: "" }),
    ]);
    const report = buildReport(duplicateAndMissing, "riasec_60");
    const viewModel = assembleRiasecResultViewModel(report, "zh");

    expect(viewModel.deepContentSlots?.slots.map((slot) => slot.slotId)).toEqual(["dimension_deep_copy:I"]);

    const unsafeSurfaceProjection = {
      ...duplicateAndMissing,
      lifecycle_copy_v1: {
        frontend_fallback_allowed: false,
        measured_payload_mutation_allowed: false,
        report_snapshot_mutation_allowed: false,
        raw_feedback_public_exposure_allowed: false,
        internal_snapshot_id_public_exposure_allowed: false,
        life_stage_public_exposure_allowed: false,
        organization_context_public_exposure_allowed: false,
        surfaces: [{ surface: "private_report", copy: "must not be consumed", public_safe: true, raw_scores_allowed: false, raw_feedback_allowed: false }],
      },
    };
    expect(assembleRiasecResultViewModel(buildReport(unsafeSurfaceProjection, "riasec_60"), "zh").lifecycleCopy?.surfaces).toEqual([]);

    const emptyViewModel = assembleRiasecResultViewModel(
      buildReport(buildProjection("en", "riasec_60", []), "riasec_60"),
      "en"
    );
    render(<RiasecResultShell locale="en" viewModel={emptyViewModel} />);
    expect(screen.queryByTestId("riasec-deep-content-slots")).not.toBeInTheDocument();
  });

  it("keeps the public shell free of private result, report, and history URL enumeration", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "components/result/riasec/RiasecResultShell.tsx"), "utf8");

    expect(source).not.toContain("/attempts/");
    expect(source).not.toContain("report-access");
    expect(source).not.toContain("private_history");
  });
});
