import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-v1.projection.json");

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readProjection(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as Record<string, unknown>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildReport(projection: Record<string, unknown>): ReportResponse {
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: {
      form_code: "riasec_140",
      label: "RIASEC 140Q",
      question_count: 140,
      estimated_minutes: 18,
    },
    riasec_public_projection_v1: {
      top_code: "IAS",
      primary_type: "I",
      secondary_type: "A",
      tertiary_type: "S",
      scores_0_100: { R: 42, I: 88, A: 74, S: 69, E: 36, C: 51 },
      clarity_index: 0.18,
      breadth_index: 0.67,
      quality_grade: "A",
      quality_flags: [],
      dimension_labels: {
        R: "现实型",
        I: "研究型",
        A: "艺术型",
        S: "社会型",
        E: "企业型",
        C: "常规型",
      },
    },
    riasec_public_projection_v2: projection,
  } as unknown as ReportResponse;
}

describe("RIASEC deep copy slot consumption", () => {
  it("parses authored backend deep content slots from projection v2", () => {
    const viewModel = assembleRiasecResultViewModel(buildReport(readProjection()));

    expect(viewModel.deepContentSlots).toMatchObject({
      schemaVersion: "riasec.deep_content_slots.v1",
      scaleCode: "RIASEC",
      contentAuthority: "backend_riasec_deep_copy_slot_registry",
      sourcePolicy: {
        frontendFallbackAllowed: false,
        missingContentBehavior: "omit_module_fail_closed",
        pendingContentBehavior: "omit_module_fail_closed",
        unknownSlotBehavior: "hidden",
      },
      slotVisibilityPolicy: {
        frontendInferenceAllowed: false,
        hiddenSlotsOmitted: true,
        pendingOrUnavailableSlotsOmitted: true,
      },
    });
    expect(viewModel.deepContentSlots?.slots.map((slot) => slot.slotId)).toEqual([
      "dimension_deep_copy:I",
      "pair_blend_copy:I_A",
      "140q_task_card_copy:task_activity_card",
      "structural_difference_copy:different_emphasis",
      "aspirations_calibration_copy:intro",
    ]);
    expect(viewModel.deepContentSlots?.slots.every((slot) => slot.frontendFallbackAllowed === false)).toBe(true);
    expect(viewModel.deepContentSlots?.slots[0]?.content.medium_score_reading).toBe("Backend fixture I medium score reading.");
  });

  it("renders medium_score_reading only when backend provides it", () => {
    const viewModel = assembleRiasecResultViewModel(buildReport(readProjection()));

    render(<RiasecResultShell locale="zh" viewModel={viewModel} attemptId="attempt_riasec_deep_copy" />);

    expect(screen.getByTestId("riasec-deep-content-slots")).toBeInTheDocument();
    expect(screen.getAllByTestId("riasec-deep-content-slot")).toHaveLength(5);
    expect(screen.getByText("Backend fixture I dimension title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I core drive.")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I medium score reading.")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I_A blend title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture pair chemistry.")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture 140Q task card")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture structure title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture aspirations title")).toBeInTheDocument();

    const projectionWithoutMedium = clone(readProjection());
    const firstSlot = ((projectionWithoutMedium.deep_content_slots_v1 as Record<string, unknown>).slots as Array<Record<string, unknown>>)[0];
    delete (firstSlot.content as Record<string, unknown>).medium_score_reading;
    const viewModelWithoutMedium = assembleRiasecResultViewModel(buildReport(projectionWithoutMedium));

    render(<RiasecResultShell locale="zh" viewModel={viewModelWithoutMedium} attemptId="attempt_riasec_deep_copy_missing_medium" />);

    expect(screen.getAllByTestId("riasec-deep-content-slots")).toHaveLength(2);
    expect(screen.queryAllByText("Backend fixture I medium score reading.")).toHaveLength(1);
  });

  it("fails closed for unknown, missing, pending, unavailable, or fallback-enabled slots", () => {
    const projection = clone(readProjection());
    const envelope = projection.deep_content_slots_v1 as Record<string, unknown>;
    const slots = envelope.slots as Array<Record<string, unknown>>;
    slots.push(
      {
        ...clone(slots[0]),
        slot_key: "future_unknown_slot",
        slot_id: "future_unknown_slot:fixture",
        content: { title: "Unknown backend slot should not render" },
      },
      {
        ...clone(slots[0]),
        slot_id: "dimension_deep_copy:R",
        status: "pending",
        content_status: "pending",
        content: { title: "Pending backend slot should not render" },
      },
      {
        ...clone(slots[0]),
        slot_id: "dimension_deep_copy:S",
        status: "unavailable",
        content_status: "unavailable",
        content: { title: "Unavailable backend slot should not render" },
      },
      {
        ...clone(slots[0]),
        slot_id: "dimension_deep_copy:E",
        frontend_fallback_allowed: true,
        content: { title: "Fallback enabled slot should not render" },
      },
      {
        ...clone(slots[0]),
        slot_id: "dimension_deep_copy:C",
        content: { title: "Known content renders", future_unknown_field: "Unknown backend field should not render" },
      }
    );

    const viewModel = assembleRiasecResultViewModel(buildReport(projection));

    expect(viewModel.deepContentSlots?.slots.map((slot) => slot.slotId)).toEqual([
      "dimension_deep_copy:I",
      "pair_blend_copy:I_A",
      "140q_task_card_copy:task_activity_card",
      "structural_difference_copy:different_emphasis",
      "aspirations_calibration_copy:intro",
      "dimension_deep_copy:C",
    ]);
    expect(viewModel.deepContentSlots?.slots.at(-1)?.content).toEqual({ title: "Known content renders" });

    render(<RiasecResultShell locale="zh" viewModel={viewModel} />);

    expect(screen.queryByText("Unknown backend slot should not render")).not.toBeInTheDocument();
    expect(screen.queryByText("Pending backend slot should not render")).not.toBeInTheDocument();
    expect(screen.queryByText("Unavailable backend slot should not render")).not.toBeInTheDocument();
    expect(screen.queryByText("Fallback enabled slot should not render")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown backend field should not render")).not.toBeInTheDocument();
  });

  it("omits deep content rendering when backend envelope is absent or fallback is allowed", () => {
    const missingProjection = readProjection();
    delete missingProjection.deep_content_slots_v1;
    const missingViewModel = assembleRiasecResultViewModel(buildReport(missingProjection));
    expect(missingViewModel.deepContentSlots).toBeNull();

    const unsafeProjection = clone(readProjection());
    const unsafeEnvelope = unsafeProjection.deep_content_slots_v1 as Record<string, unknown>;
    unsafeEnvelope.source_policy = {
      ...(unsafeEnvelope.source_policy as Record<string, unknown>),
      frontend_fallback_allowed: true,
    };
    const unsafeViewModel = assembleRiasecResultViewModel(buildReport(unsafeProjection));
    expect(unsafeViewModel.deepContentSlots).toBeNull();

    render(<RiasecResultShell locale="zh" viewModel={missingViewModel} />);
    expect(screen.queryByTestId("riasec-deep-content-slots")).not.toBeInTheDocument();
  });

  it("does not place backend fixture copy or forbidden claims in runtime source", () => {
    const runtimeSource = [
      read("lib/riasec/resultAssembler.ts"),
      read("components/result/riasec/RiasecResultShell.tsx"),
    ].join("\n");

    [
      "Backend fixture I dimension title",
      "Backend fixture I_A blend title",
      "Backend fixture 140Q task card",
      "Backend fixture structure title",
      "Backend fixture aspirations title",
      "Matches",
      "career recommendation",
      "job fit",
      "success prediction",
      "hiring suitability",
      "140Q more accurate",
      "60Q/140Q raw delta",
      "更准确",
      "职业推荐",
      "岗位匹配",
      "成功率",
    ].forEach((phrase) => {
      expect(runtimeSource).not.toContain(phrase);
    });
  });
});
