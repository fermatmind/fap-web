import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixtures from "@/tests/fixtures/big5/reading-copy-projections.json";
import type { ReportResponse } from "@/lib/api/v0_3";
import { RichResultReport } from "@/components/result/RichResultReport";
import { assembleBig5ResultViewModel, hasUsableBig5ReportEngineV2 } from "@/lib/big5/resultAssembler";
import { BIG5_READING_COPY_REVISION, withBig5ReadingCopy } from "@/lib/big5/readingCopyProjection";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
const gate = { isFreeVariant: false, modulesAllowed: new Set<string>(), modulesPreview: new Set<string>(), freeSections: null };
const wire = (key: keyof typeof fixtures) => structuredClone(fixtures[key]) as unknown as ReportResponse;
const values = (value: unknown): string[] => typeof value === "string" ? [value] : value && typeof value === "object" ? Object.values(value).flatMap(values) : [];
afterEach(cleanup);

describe("separate Big Five read projection over saved reports", () => {
  it.each(["en/big5_90", "zh-CN/big5_120"] as const)("reads the real PHP-generated view without changing source or scientific evidence: %s", key => {
    const input = wire(key), before = structuredClone(input), locale = key.startsWith("en") ? "en" : "zh";
    const revised = withBig5ReadingCopy(input)!;
    expect(revised).not.toBe(input);
    expect(revised.report?.norms).toEqual(input.report?.norms);
    expect(revised.report?.quality).toEqual(input.report?.quality);
    expect(revised.big5_report_engine_v2?.score_vector).toEqual(input.big5_report_engine_v2?.score_vector);
    const vm = assembleBig5ResultViewModel({ reportData: input, locale, gate });
    expect(hasUsableBig5ReportEngineV2(input)).toBe(true);
    expect(vm.displayCopy?.revision).toBe(BIG5_READING_COPY_REVISION);
    expect(vm.displayCopy?.compiledHash).toBe("fec180c7906370a084901cc792f006f1c69c886c6729f2af6139f41235b0d269");
    expect(vm.authority).toEqual(input.big5_private_result_authority);
    expect(vm.displayCopy?.compiledHash).not.toBe(vm.authority?.compiled_hash);
    render(<RichResultReport locale={locale} reportData={input} />);
    expect(screen.getByTestId("big5-result-shell")).toHaveAttribute("data-reading-copy-revision", BIG5_READING_COPY_REVISION);
    const oldText = new Set(values(input.big5_report_engine_v2?.sections));
    const newText = values(revised.big5_report_engine_v2?.sections).filter(text => !oldText.has(text));
    expect(newText.length).toBeGreaterThan(0);
    expect(newText.some(text => document.body.textContent?.includes(text))).toBe(true);
    expect(input).toEqual(before);
  });

  it("preserves source compatibility when the API emits no correction", () => {
    const input = wire("en/big5_90") as ReportResponse & { big5_reading_copy_v1?: unknown };
    delete input.big5_reading_copy_v1;
    expect(withBig5ReadingCopy(input)).toBe(input);
    expect(assembleBig5ResultViewModel({ reportData: input, locale: "en", gate }).displayCopy).toBeUndefined();
  });

  it("rejects mismatched source, locale, score and norm facts instead of falling back to the old interpretation", () => {
    const mutate = [
      (v: typeof fixtures["en/big5_90"]["big5_reading_copy_v1"]) => { v.original_authority.source_hash = "a".repeat(64); },
      (v: typeof fixtures["en/big5_90"]["big5_reading_copy_v1"]) => { v.locale = "zh-CN"; },
      (v: typeof fixtures["en/big5_90"]["big5_reading_copy_v1"]) => { v.revision = "unknown"; },
      (v: typeof fixtures["en/big5_90"]["big5_reading_copy_v1"]) => { v.report.norms.status = "UNRELATED_REFERENCE"; },
      (v: typeof fixtures["en/big5_90"]["big5_reading_copy_v1"]) => { v.report._meta.big5_report_engine_v2.score_vector.domains.O.percentile = 99; },
      (v: typeof fixtures["en/big5_90"]["big5_reading_copy_v1"]) => { v.report._meta.big5_public_projection_v1.trait_vector[0].percentile = 99; },
    ];
    for (const change of mutate) {
      const raw = structuredClone(fixtures["en/big5_90"]); change(raw.big5_reading_copy_v1);
      const input = raw as unknown as ReportResponse;
      expect(withBig5ReadingCopy(input)).toBeNull();
      expect(hasUsableBig5ReportEngineV2(input)).toBe(false);
      expect(assembleBig5ResultViewModel({ reportData: input, locale: "en", gate }).visibleSections).toEqual([]);
    }
    const bad = structuredClone(fixtures["en/big5_90"]); bad.big5_reading_copy_v1.revision = "unknown";
    render(<RichResultReport locale="en" reportData={bad as unknown as ReportResponse} />);
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("temporarily unavailable");
    expect(withBig5ReadingCopy(wire("en/big5_90"), "zh-CN")).toBeNull();
  });

  it("applies the existing section access gate after the copy projection", () => {
    const vm = assembleBig5ResultViewModel({ reportData: wire("en/big5_90"), locale: "en", gate: {
      ...gate, isFreeVariant: true, freeSections: new Set(["hero_summary", "domains_overview", "methodology_and_access"]),
    } });
    expect(vm.visibleSections.map(row => row.key)).toEqual(["hero_summary", "domains_overview", "methodology_and_access"]);
    expect(vm.lockedSections.length).toBeGreaterThan(0);
    expect(vm.lockedSections.every(row => row.blocks.length === 0)).toBe(true);
  });

  it.each(["en", "zh"] as const)("renders an explicit API unavailable view without any old-copy fallback: %s", locale => {
    const input = wire(locale === "en" ? "en/big5_90" : "zh-CN/big5_120") as ReportResponse & { big5_reading_copy_v1: unknown };
    input.big5_reading_copy_v1 = {
      schema_version: "big5.reading_copy.v1", revision: BIG5_READING_COPY_REVISION,
      status: "unavailable", reason: "locale_invalid_or_conflicting",
    };
    expect(withBig5ReadingCopy(input)).toBeNull();
    expect(hasUsableBig5ReportEngineV2(input)).toBe(false);
    expect(assembleBig5ResultViewModel({ reportData: input, locale, gate }).visibleSections).toEqual([]);
    render(<RichResultReport locale={locale} reportData={input} />);
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).not.toBeEmptyDOMElement();
  });
});
