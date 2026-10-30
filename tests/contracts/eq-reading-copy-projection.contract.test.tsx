import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixtures from "@/tests/fixtures/eq/reading-copy-projections.json";
import nonbalanced from "@/tests/fixtures/eq/nonbalanced-reading-copy-projections.json";
import type { ReportResponse } from "@/lib/api/v0_3";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { normalizeEqV5Report } from "@/components/result/eq/utils";
import { buildEqResultExport } from "@/lib/eq/export";
import { defaultResultExportDraft, serializeResultExport } from "@/lib/result-export/contract";
import { EQ_READING_COPY_REVISION } from "@/lib/eq/readingCopyProjection";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
afterEach(cleanup);

describe("source-bound EQ reading copy from real local historical composer outputs", () => {
  it.each(["en", "zh-CN"] as const)("uses revised copy in the page and both export formats while preserving original reference: %s", key => {
    const raw = structuredClone(fixtures[key]), before = structuredClone(raw);
    const input = raw as unknown as ReportResponse, locale = key === "en" ? "en" : "zh";
    const vm = normalizeEqV5Report(input, locale)!;
    expect(vm).not.toBeNull();
    expect(vm.displayCopy?.revision).toBe(raw.eq60_reading_copy_v1.revision);
    expect(vm.authority.source_hash).toBe(raw.report._meta.eq60_private_result_authority.source_hash);
    expect(vm.displayCopy?.sourceHash).toBe("843d96bf99c6fa35feb0505832d01dd03ec7e9561fc7f93ca64f73b01a56f764");
    expect(vm.payload.scores).toEqual(raw.report.scores);
    expect(vm.methodology.norm_provenance?.norm_version).toBe("bootstrap_v1");
    expect(vm.assets.mechanisms.map(item => item.id)).toEqual(["SA_ER_mixed", "EM_RM_mixed"]);
    render(<EQResultV5 locale={locale} reportData={input} attemptId="" />);
    expect(screen.getAllByText(vm.assets.personalization_route.route_headline!).length).toBeGreaterThan(0);
    expect(screen.queryByText(raw.report.assets.personalization_route.route_headline)).not.toBeInTheDocument();
    expect(document.querySelector(`[data-reading-copy-revision="${raw.eq60_reading_copy_v1.revision}"]`)).not.toBeNull();
    expect(screen.getAllByText(/bootstrap_v1/).length).toBeGreaterThan(0);
    const projection = buildEqResultExport(input, locale)!;
    expect(projection).not.toBeNull();
    for (const format of ["text", "markdown"] as const) {
      const output = serializeResultExport(projection, defaultResultExportDraft(projection, locale), locale, format);
      expect(output).toContain("bootstrap_v1");
      expect(output).toContain("Bootstrap");
      expect(output).toContain(vm.assets.quality_confidence.do_not_overread);
      expect(output).toContain("POMP");
      expect(output).not.toMatch(/snapshot_binding|source_hash|compiled_hash|agent_context/);
    }
    expect(raw).toEqual(before);
  });

  it("keeps old-client compatibility when there is no reading view", () => {
    const raw = structuredClone(fixtures.en) as { eq60_reading_copy_v1?: unknown };
    delete raw.eq60_reading_copy_v1;
    const vm = normalizeEqV5Report(raw as ReportResponse, "en")!;
    expect(vm.displayCopy).toBeUndefined();
    expect(vm.assets.result_snapshot.headline).toBe(fixtures.en.report.assets.result_snapshot.headline);
  });

  it("rejects altered facts, original identity, reading identity and mechanism objects instead of falling back", () => {
    const changes = [
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.original_authority.source_hash = "a".repeat(64); },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.reading_authority.release_id = "-".repeat(36); },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.locale = "zh-CN"; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.revision = "eq60.reading_copy.future"; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.report.scores.global.standard_score = 150; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.report.quality.level = "D"; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.report.access.locked = true; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.report.next_module.available = true; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.report.methodology.norm_status = "missing"; },
      (v: typeof fixtures.en.eq60_reading_copy_v1) => { v.report.assets.mechanisms[0].state = "high_high"; },
    ];
    for (const change of changes) {
      const raw = structuredClone(fixtures.en); change(raw.eq60_reading_copy_v1);
      const input = raw as unknown as ReportResponse;
      expect(normalizeEqV5Report(input, "en")).toBeNull();
      expect(buildEqResultExport(input, "en")).toBeNull();
    }
  });

  it.each(["en", "zh"] as const)("keeps API unavailable separate from an ordinary historical response: %s", locale => {
    const raw = structuredClone(fixtures[locale === "en" ? "en" : "zh-CN"]) as { eq60_reading_copy_v1: unknown };
    raw.eq60_reading_copy_v1 = { schema_version: "eq60.reading_copy.v1", revision: EQ_READING_COPY_REVISION, status: "unavailable", reason: "historical_eq_report_not_supported" };
    const input = raw as ReportResponse;
    expect(normalizeEqV5Report(input, locale)).toBeNull();
    expect(buildEqResultExport(input, locale)).toBeNull();
    render(<EQResultV5 locale={locale} reportData={input} attemptId="" />);
    expect(screen.getByTestId("eq-result-v5-unavailable")).toBeInTheDocument();
    expect(document.querySelector("[data-reading-copy-revision]")).toBeNull();
  });
});


describe("finite v2 EQ copy in historical non-balanced reports", () => {
  it.each(Object.entries(nonbalanced))("renders the actual PHP reading projection without changing measurement facts: %s", (_key, captured) => {
    const raw = structuredClone(captured), before = structuredClone(raw);
    const locale = raw.locale === "zh-CN" ? "zh" : "en";
    const input = raw as unknown as ReportResponse;
    const vm = normalizeEqV5Report(input, locale)!;
    expect(vm).not.toBeNull();
    expect(vm.displayCopy?.revision).toBe(EQ_READING_COPY_REVISION);
    expect(vm.displayCopy?.sourceHash).toBe("6e8b606be9905dcf3c0313302e6af8d65bc3354d40f7884495440281bcae0a08");
    expect(vm.payload.scores).toEqual(raw.report.scores);
    expect(vm.payload._meta).toEqual(raw.report._meta);
    expect(vm.payload.interpretation).toEqual(raw.report.interpretation);
    expect(vm.payload.asset_refs).toEqual(raw.report.asset_refs);
    expect(vm.assets.mechanisms.map(item => ({ id: item.id, pair: item.pair, state: item.state })))
      .toEqual(raw.report.assets.mechanisms.map(item => ({ id: item.id, pair: item.pair, state: item.state })));
    render(<EQResultV5 locale={locale} reportData={input} attemptId="" />);
    for (const mechanism of raw.eq60_reading_copy_v1.report.assets.mechanisms) {
      expect(screen.getAllByText(mechanism.title).length).toBeGreaterThan(0);
    }
    const conversion = raw.eq60_reading_copy_v1.report.assets.commercial_conversion_actions.find(item => item.id === "eq.conversion.save_report")!;
    expect(screen.getAllByText(conversion.title).length).toBeGreaterThan(0);
    expect(screen.getAllByText(conversion.body).length).toBeGreaterThan(0);
    expect(screen.queryByText(raw.report.assets.commercial_conversion_actions.find(item => item.id === conversion.id)!.title)).not.toBeInTheDocument();
    expect(document.querySelector(`[data-reading-copy-revision="${EQ_READING_COPY_REVISION}"]`)).not.toBeNull();
    const exportView = buildEqResultExport(input, locale)!;
    expect(exportView).not.toBeNull();
    const text = serializeResultExport(exportView, defaultResultExportDraft(exportView, locale), locale, "text");
    expect(text).toContain("bootstrap_v1");
    expect(text).not.toMatch(/source_hash|snapshot_binding|agent_context/);
    expect(raw).toEqual(before);
  });

  it("does not relax mechanism identities, states or reference metadata for the added copy fields", () => {
    const fixture = nonbalanced["self_clear_repair_weak.en"];
    const mutations = [
      (view: typeof fixture.eq60_reading_copy_v1) => { view.report.assets.mechanisms[0].id = "unknown"; },
      (view: typeof fixture.eq60_reading_copy_v1) => { view.report.assets.mechanisms[0].state = "mixed"; },
      (view: typeof fixture.eq60_reading_copy_v1) => { view.report.methodology.norm_status = "missing"; },
      (view: typeof fixture.eq60_reading_copy_v1) => { view.report.scores.global.standard_score = 150; },
    ];
    for (const mutate of mutations) {
      const raw = structuredClone(fixture); mutate(raw.eq60_reading_copy_v1);
      expect(normalizeEqV5Report(raw as unknown as ReportResponse, "en")).toBeNull();
      expect(buildEqResultExport(raw as unknown as ReportResponse, "en")).toBeNull();
    }
  });
});
