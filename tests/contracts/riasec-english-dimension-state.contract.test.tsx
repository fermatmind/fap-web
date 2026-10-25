import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import source from "./fixtures/riasec/english-dimension-state.projection.json";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

function model(projection = structuredClone(source.projections.agreement)) {
  return assembleRiasecResultViewModel({ ok: true, scale_code: "RIASEC", type_code: "RIA", riasec_public_projection_v2: projection } as unknown as ReportResponse, "en");
}

afterEach(cleanup);

describe("English dimension-state source consumption", () => {
  it.each(["agreement", "tension"] as const)("renders real compiler projection %s fields without changing report eligibility", state => {
    const projection = structuredClone(source.projections[state]);
    const vm = model(projection);
    expect(source.provenance.synthetic).toBe(true);
    expect(source.provenance.compiler_version).toBe("1.3.0");
    expect(projection.private_result_authority).toBeNull();
    expect(vm.deepContentSlots?.slots).toHaveLength(3);
    render(<RiasecResultShell locale="en" displayMode="static" viewModel={vm} />);
    for (const raw of projection.deep_content_slots_v1.slots) {
      const slot = vm.deepContentSlots!.slots.find(item => item.slotId === raw.slot_id)!;
      for (const [key, text] of Object.entries(raw.content)) {
        expect(slot.content[key]).toEqual(text);
        expect(screen.getAllByText(text, { exact: true }).length).toBeGreaterThan(0);
      }
      expect(screen.getAllByText(raw.boundaries.user_visible_boundary, { exact: true }).length).toBeGreaterThan(0);
    }
  });

  it("omits wrong locale, Chinese reader text, hidden states and 60Q-ineligible cards", () => {
    for (const mutation of ["locale", "cjk", "hidden", "60q"] as const) {
      const projection = structuredClone(source.projections.agreement);
      for (const slot of projection.deep_content_slots_v1.slots) {
        if (mutation === "locale") slot.locale = "zh-CN";
        if (mutation === "cjk") slot.content.summary = "中文";
        if (mutation === "hidden") slot.slot_visibility = "hidden";
      }
      if (mutation === "60q") projection.form.form_code = "riasec_60";
      expect(model(projection).deepContentSlots?.slots ?? []).toEqual([]);
    }
  });
});
