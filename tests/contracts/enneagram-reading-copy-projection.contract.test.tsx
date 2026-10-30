import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixtures from "@/tests/fixtures/enneagram/reading-copy-projections.json";
import type { ReportResponse } from "@/lib/api/v0_3";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { assembleEnneagramResultViewModel, hasEnneagramProjection } from "@/lib/enneagram/resultAssembler";
import { ENNEAGRAM_READING_COPY_REVISION, resolveEnneagramReadingReport } from "@/lib/enneagram/readingCopyProjection";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
const wire = (key: keyof typeof fixtures) => structuredClone(fixtures[key]) as unknown as ReportResponse;
afterEach(cleanup);

describe("source-bound separate Enneagram reading copy", () => {
  it.each(["en/enneagram_likert_105", "zh-CN/enneagram_forced_choice_144"] as const)("renders a real PHP copy projection with a fixture-only local release ID: %s", key => {
    const input = wire(key), before = structuredClone(input), locale = key.startsWith("en") ? "en" : "zh";
    expect(resolveEnneagramReadingReport(input, locale), 'separate copy binding').not.toBeNull();
    expect(hasEnneagramProjection(input, locale)).toBe(true);
    const vm = assembleEnneagramResultViewModel({ reportData: input, locale, gate: { isFreeVariant: false } });
    expect(vm.displayCopy?.revision).toBe(ENNEAGRAM_READING_COPY_REVISION);
    expect(vm.displayCopy?.sourceHash).toBe("cc7e5d6c0c0c3fd3bee701c3cb7636db7e0957aff1423c1a96aef5b0044de7c5");
    expect(vm.displayCopy?.compiledHash).toBe("a1b2b551fd45009f2d14d24206a755655cc2431b8c9d732867d13d02df5e8f1c");
    expect(vm.authority?.sourceHash).not.toBe(vm.displayCopy?.sourceHash);
    render(<EnneagramResultShell locale={locale} attemptId="" reportLocked={false} viewModel={vm} />);
    expect(document.querySelector(`[data-reading-copy-revision="${ENNEAGRAM_READING_COPY_REVISION}"]`)).not.toBeNull();
    const revised = vm.candidates[0].sections.find(section => section.sectionId === "6.4");
    expect(revised?.assignmentAllowed).toBe(false);
    expect(screen.getAllByText(revised!.title).length).toBeGreaterThan(0);
    expect(input).toEqual(before);
  });

  it("keeps ordinary unmodified canonical response compatibility", () => {
    const input = wire("en/enneagram_likert_105") as ReportResponse & { enneagram_reading_copy_v1?: unknown };
    delete input.enneagram_reading_copy_v1;
    expect(resolveEnneagramReadingReport(input, "en")).toBe(input.enneagram_report_v2);
    expect(assembleEnneagramResultViewModel({ reportData: input, locale: "en", gate: { isFreeVariant: false } }).displayCopy).toBeUndefined();
  });

  it("does not expose revised canonical chapters through the existing free gate", () => {
    const input = wire("en/enneagram_likert_105");
    const vm = assembleEnneagramResultViewModel({ reportData: input, locale: "en", gate: { isFreeVariant: true, modulesAllowed: new Set(["enneagram_core"]) } });
    expect(vm.reportV2).toBeNull();
    expect(vm.candidates).toEqual([]);
  });

  it("rejects altered original authority, language, score, classification and level assignment", () => {
    const changes = [
      (v: typeof fixtures["en/enneagram_likert_105"]["enneagram_reading_copy_v1"]) => { v.original_authority.source_hash = "a".repeat(64); },
      (v: typeof fixtures["en/enneagram_likert_105"]["enneagram_reading_copy_v1"]) => { v.locale = "zh-CN"; },
      (v: typeof fixtures["en/enneagram_likert_105"]["enneagram_reading_copy_v1"]) => { v.revision = "unknown"; },
      (v: typeof fixtures["en/enneagram_likert_105"]["enneagram_reading_copy_v1"]) => { v.report_v2.candidates[0].score_norm = 99; },
      (v: typeof fixtures["en/enneagram_likert_105"]["enneagram_reading_copy_v1"]) => { v.report_v2.classification.interpretation_scope = "clear"; },
      (v: typeof fixtures["en/enneagram_likert_105"]["enneagram_reading_copy_v1"]) => { v.report_v2.candidates[0].sections.find(section => section.section_id === "6.4")!.assignment_allowed = true; },
    ];
    for (const change of changes) {
      const raw = structuredClone(fixtures["en/enneagram_likert_105"]); change(raw.enneagram_reading_copy_v1);
      const input = raw as unknown as ReportResponse;
      expect(resolveEnneagramReadingReport(input, "en")).toBeNull();
      expect(hasEnneagramProjection(input, "en")).toBe(false);
      expect(assembleEnneagramResultViewModel({ reportData: input, locale: "en", gate: { isFreeVariant: false } }).reportV2).toBeNull();
    }
  });

  it.each(["en", "zh"] as const)("shows unavailable instead of old canonical text for an API rejected view: %s", locale => {
    const input = wire(locale === "en" ? "en/enneagram_likert_105" : "zh-CN/enneagram_forced_choice_144") as ReportResponse & { enneagram_reading_copy_v1: unknown };
    input.enneagram_reading_copy_v1 = { schema_version: "enneagram.reading_copy.v1", revision: ENNEAGRAM_READING_COPY_REVISION, status: "unavailable", reason: "locale_invalid_or_conflicting" };
    const vm = assembleEnneagramResultViewModel({ reportData: input, locale, gate: { isFreeVariant: false } });
    expect(vm.reportV2).toBeNull();
    expect(vm.candidates).toEqual([]);
    render(<EnneagramResultShell locale={locale} attemptId="" reportLocked={false} viewModel={vm} />);
    expect(screen.getByTestId("enneagram-canonical-payload-unavailable")).toBeInTheDocument();
    expect(document.querySelector("[data-reading-copy-revision]")).toBeNull();
  });
});
