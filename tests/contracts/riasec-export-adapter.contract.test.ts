import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { buildRiasecResultExport, getRiasecExportFacts } from "@/lib/riasec/exportAdapter";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import samples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";

describe("RIASEC read-only export facts", () => {
  it.each(["zh-CN-60", "zh-CN-140", "en-60", "en-140"] as const)("projects %s values without changing scores or inventing personal context", key => {
    const locale = key.startsWith("zh") ? "zh" : "en";
    const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: samples[key] } as unknown as ReportResponse, locale);
    const exported = buildRiasecResultExport({ riasec_public_projection_v2: samples[key] } as unknown as ReportResponse, locale);
    // Chinese canonical envelopes require an external matching authority.
    if (locale === "en") {
      expect(exported?.assessment.locale).toBe("en");
      expect(exported?.sections[1].fields).toHaveLength(6);
    }
    const before = structuredClone(vm);
    const facts = getRiasecExportFacts(vm, locale);
    expect(facts.form.code).toBe(vm.formCode);
    expect(facts.form.questionCount).toBe(vm.questionCount);
    expect(facts.form.scoreSpaceVersion).toBe(vm.trustedResultCard!.scoreSpaceVersion);
    expect(facts.dimensions.map(item => item.score)).toEqual(vm.dimensions.map(item => item.score));
    expect(facts.top3).toBe(vm.topCode);
    expect(facts.quality).toBe(vm.resultSummary!.qualitySummary);
    expect(facts.units).toContain("0–100");
    expect(vm).toEqual(before);
    const text = JSON.stringify(facts);
    expect(text).not.toMatch(/attempt_id|access_token|answers|snapshot_id|https?:\/\//i);
  });

  it("retains flat/near-tie backend alternatives and unknown fields without calculating new ones", () => {
    const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: samples["en-60"] } as unknown as ReportResponse, "en");
    vm.interpretationState!.profileShape = "flat";
    vm.interpretationState!.tieDisplay!.kind = "near_tie";
    vm.interpretationState!.tieDisplay!.alternateCodes = ["ISA", "SIA"];
    vm.dimensions[0].scoreAvailable = false;
    vm.scoreKind = null;
    vm.trustedResultCard!.scoreSpaceVersion = "";
    vm.qualityDisplay = null;
    vm.resultSummary = null;
    const facts = getRiasecExportFacts(vm, "en");
    expect(facts.profileShape).toBe("flat");
    expect(facts.closeScores!.alternatives).toEqual(["ISA", "SIA"]);
    expect(facts.dimensions[0].score).toContain("unknown");
    expect(facts.units).toContain("unknown");
    expect(facts.quality).toContain("unknown");
    expect(facts.form.scoreSpaceVersion).toContain("unknown");
  });

  it("does not create an export from pending, failed, or absent results", () => {
    for (const state of [{ generating: true }, { snapshot_error: "failed" }, {}]) {
      expect(buildRiasecResultExport(state as ReportResponse, "en")).toBeNull();
    }
  });

  it("omits hidden dimension/hero data instead of exporting beyond the shown scope", () => {
    const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: samples["en-140"] } as unknown as ReportResponse, "en");
    vm.resultSummary = null;
    vm.moduleVisibilityPolicy!.modules.forEach(module => module.visibility = "hidden");
    const facts = getRiasecExportFacts(vm, "en");
    expect(facts.dimensions).toEqual([]);
    expect(facts.top3).toContain("unknown");
    expect(facts.closeScores).toBeNull();
  });
});
