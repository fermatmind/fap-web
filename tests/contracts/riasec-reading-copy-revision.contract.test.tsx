import fs from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleRiasecResultViewModel, hasRiasecProjection } from "@/lib/riasec/resultAssembler";
import { applyRiasecReadingCopyRevision } from "@/lib/riasec/readingCopyRevision";
import copy from "@/lib/riasec/readingCopyRevision.json";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
const reports = JSON.parse(fs.readFileSync("tests/contracts/fixtures/riasec/native-report-source-authority.json", "utf8"));
function wire(key: string): ReportResponse {
  const report = structuredClone(reports[key]);
  return JSON.parse(JSON.stringify({ ok: true, scale_code: "RIASEC", type_code: report.top_code, report,
    riasec_public_projection_v1: report._meta.riasec_public_projection_v1,
    riasec_public_projection_v2: report._meta.riasec_public_projection_v2,
    riasec_private_result_authority: report._meta.riasec_private_result_authority ?? null }));
}
afterEach(cleanup);

describe("approved RIASEC reading copy over immutable snapshots", () => {
  it.each(["riasec_60", "riasec_140"])("repairs real legacy English reading without upgrading source identity: %s", form => {
    const input = wire(`1.8/en/${form}`);
    const before = structuredClone(input);
    expect(hasRiasecProjection(input)).toBe(true);
    const vm = assembleRiasecResultViewModel(input, "en");
    expect(vm.authority).toBeNull();
    expect(vm.reportContent).toBeNull();
    expect(vm.displayCopy).toMatchObject({ revision: copy.revision, approvedSourceHash: copy.publishedSourceHash });
    expect(vm.displayCopy?.appliedKeys.sort()).toEqual(["lifecycle.low_quality_share", "lifecycle.score_faq", "lifecycle.share_safe_card"]);
    render(<RichResultReport locale="en" reportData={input} />);
    expect(screen.getByTestId("riasec-reading-report")).toHaveAttribute("data-riasec-display-copy-revision", copy.revision);
    expect(screen.getByText(copy.faq.question.after)).toBeInTheDocument();
    expect(screen.queryByText(copy.faq.question.before)).not.toBeInTheDocument();
    expect(input).toEqual(before);
    expect(applyRiasecReadingCopyRevision(vm)).toBe(vm);
  });

  it("preserves the Gatekeeper legacy marker and binding while correcting its admitted text", () => {
    const input = wire("1.8/en/riasec_60");
    const marker = { schema_version: "fap.riasec.private_result_authority.v1", mode: "immutable_legacy_snapshot" as const,
      authority_id: "", locale: "en", source_hash: "", compiled_hash: "" };
    input.riasec_private_result_authority = marker;
    (input.report!._meta as Record<string, unknown>).riasec_private_result_authority = marker;
    const before = structuredClone(input);
    const vm = assembleRiasecResultViewModel(input, "en");
    expect(vm.authority?.mode).toBe("immutable_legacy_snapshot");
    expect(vm.displayCopy?.appliedKeys).toContain("lifecycle.score_faq");
    expect(input).toEqual(before);
  });

  it.each(["en", "zh-CN"] as const)("repairs only exact dimension-owned text, preserving all measured values: %s", locale => {
    const vm = assembleRiasecResultViewModel(wire(`1.9/${locale}/riasec_140`), locale === "en" ? "en" : "zh");
    // Unit-level synthetic highlights exercise all six copy keys; no fake report authority is constructed.
    const controlled = { ...vm, displayCopy: undefined, resultSummary: { ...vm.resultSummary!,
      highlights: Object.entries(copy.lowBands[locale]).map(([dimensionCode, row]) => ({ dimensionCode, label: dimensionCode, text: row.before })) } };
    const before = structuredClone(controlled);
    const revised = applyRiasecReadingCopyRevision(controlled);
    expect(revised.resultSummary?.highlights.map(row => row.text)).toEqual(Object.values(copy.lowBands[locale]).map(row => row.after));
    expect(revised.dimensions).toBe(controlled.dimensions);
    expect(revised.authority).toBe(controlled.authority);
    expect(revised.reportContent).toBe(controlled.reportContent);
    expect(revised.interpretationState).toBe(controlled.interpretationState);
    expect(revised.moduleVisibilityPolicy).toBe(controlled.moduleVisibilityPolicy);
    expect(controlled).toEqual(before);
    expect(revised.lifecycleCopy?.frontendFallbackAllowed).toBe(false);
  });

  it("uses FAQ and surface identity rather than array positions, and leaves unknown copy alone", () => {
    const vm = assembleRiasecResultViewModel(wire("1.8/en/riasec_140"), "en");
    const base = { ...vm, displayCopy: undefined, lifecycleCopy: { ...vm.lifecycleCopy!,
      surfaces: copy.surfaces.toReversed().map(row => ({ surface: row.surface, copy: row.before, publicSafe: false, rawScoresAllowed: false as const, rawFeedbackAllowed: false as const })),
      faqItems: [{ q: "Different question", a: copy.faq.answer.before }, { q: copy.faq.question.before, a: "Unknown answer" },
        { q: copy.faq.question.before, a: copy.faq.answer.before }] } };
    const revised = applyRiasecReadingCopyRevision(base);
    expect(revised.lifecycleCopy?.surfaces.map(row => row.copy)).toEqual(copy.surfaces.toReversed().map(row => row.after));
    expect(revised.lifecycleCopy?.faqItems.slice(0, 2)).toEqual(base.lifecycleCopy.faqItems.slice(0, 2));
    expect(revised.lifecycleCopy?.faqItems[2]).toEqual({ q: copy.faq.question.after, a: copy.faq.answer.after });
    const unknown = { ...vm, displayCopy: undefined, resultSummary: null, lifecycleCopy: null };
    expect(applyRiasecReadingCopyRevision(unknown)).toBe(unknown);
    expect(applyRiasecReadingCopyRevision({ ...unknown, resultLocale: "unsupported" })).toEqual({ ...unknown, resultLocale: "unsupported" });
  });

  it("does not repair rejected or wrong-locale authority, or add hidden lifecycle content", () => {
    const mismatch = wire("1.9/en/riasec_140");
    mismatch.riasec_private_result_authority = { ...mismatch.riasec_private_result_authority!, compiled_hash: "f".repeat(64) };
    expect(assembleRiasecResultViewModel(mismatch, "en").displayCopy).toBeUndefined();
    expect(assembleRiasecResultViewModel(wire("1.8/en/riasec_140"), "zh").displayCopy).toBeUndefined();
    for (const nestedAuthority of [
      { schema_version: "fap.riasec.private_result_authority.v1", mode: "canonical", compiled_hash: "broken" },
      wire("1.9/en/riasec_60").riasec_private_result_authority,
    ]) {
      const nestedConflict = wire("1.8/en/riasec_60");
      const meta = nestedConflict.report!._meta as Record<string, unknown>;
      (meta.riasec_public_projection_v2 as Record<string, unknown>).private_result_authority = nestedAuthority;
      expect(hasRiasecProjection(nestedConflict)).toBe(true);
      expect(assembleRiasecResultViewModel(nestedConflict, "en").displayCopy).toBeUndefined();
    }
    const vm = assembleRiasecResultViewModel(wire("1.8/en/riasec_140"), "en");
    const hidden = { ...vm, displayCopy: undefined, lifecycleCopy: { ...vm.lifecycleCopy!, status: "unavailable" } };
    expect(applyRiasecReadingCopyRevision(hidden)).toBe(hidden);
  });
});
