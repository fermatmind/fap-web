import fs from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleRiasecResultViewModel, hasRiasecProjection } from "@/lib/riasec/resultAssembler";
import { applyRiasecReadingCopyRevision } from "@/lib/riasec/readingCopyRevision";
import copy from "@/lib/riasec/readingCopyRevision.json";
import nearTieSamples from "./fixtures/riasec/neartie-source-v1_8.projection.json";

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
    expect(vm.displayCopy).toMatchObject({ revision: copy.revision, approvedSourceHash: copy.reviewedSourceHash });
    expect(vm.displayCopy?.appliedKeys).toEqual(expect.arrayContaining(["lifecycle.low_quality_share", "lifecycle.score_faq", "lifecycle.share_safe_card", "lifecycle.F01", "lifecycle.F02", "lifecycle.F09"]));
    render(<RichResultReport locale="en" reportData={input} />);
    expect(screen.getByTestId("riasec-reading-report").getAttribute("data-riasec-display-copy-revision")).toBe(copy.revision);
    expect(screen.getByText(copy.faq.question.after)).toBeTruthy();
    expect(screen.queryByText(copy.faq.question.before)).toBeNull();
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
    const unknown = { ...vm, displayCopy: undefined, resultSummary: null, lifecycleCopy: null, deepContentSlots: null, activityExplorer: null };
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
    const hidden = { ...vm, displayCopy: undefined, deepContentSlots: null, activityExplorer: null, lifecycleCopy: { ...vm.lifecycleCopy!, status: "unavailable" } };
    expect(applyRiasecReadingCopyRevision(hidden)).toBe(hidden);
  });

  it.each(["en", "zh-CN"] as const)("refreshes only stable admitted slots and retains v1 corrections: %s", locale => {
    const vm = assembleRiasecResultViewModel(wire(`1.9/${locale}/riasec_140`), locale === "en" ? "en" : "zh");
    const rows = copy.slots.filter(row => row.locale === locale);
    // Exercise the complete finite mapping over already admitted slot models, not raw report truth.
    const slots = rows.map(row => {
      const original = vm.deepContentSlots!.slots.find(slot => slot.slotKey === row.slotKey)!;
      return { ...original, slotId: row.slotId, state: { ...original.state, slot_name: row.slotName },
        content: { [row.field]: row.before } };
    });
    const controlled = { ...vm, displayCopy: { revision: copy.previousRevision, approvedSourceHash: copy.publishedSourceHash,
      approvedCompiledHash: copy.publishedCompiledHash, appliedKeys: ["lifecycle.score_faq"] },
      deepContentSlots: { ...vm.deepContentSlots!, slots } };
    const before = structuredClone(controlled);
    const revised = applyRiasecReadingCopyRevision(controlled);
    expect(revised.deepContentSlots!.slots.map((slot, i) => slot.content[rows[i].field])).toEqual(rows.map(row => row.after));
    expect(revised.displayCopy?.appliedKeys).toContain("lifecycle.score_faq");
    expect(revised.authority).toBe(controlled.authority);
    expect(revised.reportContent).toBe(controlled.reportContent);
    expect(revised.dimensions).toBe(controlled.dimensions);
    expect(controlled).toEqual(before);
    expect(applyRiasecReadingCopyRevision(revised)).toBe(revised);
    const unrelated = { ...controlled, displayCopy: undefined, resultSummary: null, lifecycleCopy: null, activityExplorer: null,
      deepContentSlots: { ...controlled.deepContentSlots, slots: slots.map(slot => ({ ...slot, slotId: `unrelated:${slot.slotId}` })) } };
    expect(applyRiasecReadingCopyRevision(unrelated)).toBe(unrelated);
  });

  it("refreshes the nine activity leaves by activity identity and exact text without touching task facts", () => {
    const vm = assembleRiasecResultViewModel(wire("1.9/en/riasec_140"), "en");
    const original = vm.activityExplorer!.codeActivityPack.activities[0];
    const activities = copy.activities.map(row => ({ ...original, activityKey: row.activityKey,
      activityUserCopy: row.field === "activityUserCopy" ? row.before : "Keep this boundary",
      taskExamples: row.field === "taskExamples" ? Array.from({ length: 8 }, (_, i) => i === row.index ? row.before : `Keep task ${i}`) : original.taskExamples }));
    const controlled = { ...vm, displayCopy: undefined, activityExplorer: { ...vm.activityExplorer!,
      codeActivityPack: { ...vm.activityExplorer!.codeActivityPack, activities } } };
    const revised = applyRiasecReadingCopyRevision(controlled);
    for (const [i, row] of copy.activities.entries()) {
      const activity = revised.activityExplorer!.codeActivityPack.activities[i];
      expect(row.field === "activityUserCopy" ? activity.activityUserCopy : activity.taskExamples[row.index!]).toBe(row.after);
      expect(activity.riasecDimensions).toBe(activities[i].riasecDimensions);
      expect(activity.occupationExamples).toBe(activities[i].occupationExamples);
      if (row.field === "taskExamples") expect(activity.taskExamples.slice(0, 7)).toEqual(activities[i].taskExamples.slice(0, 7));
    }
    render(<RiasecResultShell locale="en" viewModel={revised} />);
    for (const row of copy.activities) {
      expect(screen.getByText(row.after)).toBeTruthy();
      expect(screen.queryByText(row.before)).toBeNull();
    }
  });

  it("renders refreshed FAQ, English cards and Chinese static comparison guidance from admitted snapshots", () => {
    const en = wire("1.8/en/riasec_140");
    render(<RichResultReport locale="en" reportData={en} />);
    for (const faq of copy.additionalFaqs) expect(screen.getByText(faq.question.after)).toBeTruthy();
    for (const slot of copy.slots.filter(row => row.locale === "en" && row.slotKey !== "near_tie_alternate_code_copy")) {
      expect(screen.getByText(slot.after)).toBeTruthy();
      expect(screen.queryByText(slot.before)).toBeNull();
    }
    cleanup();
    const zh = assembleRiasecResultViewModel(wire("1.9/zh-CN/riasec_140"), "zh");
    render(<RiasecResultShell locale="zh" viewModel={zh} displayMode="static" />);
    for (const slot of copy.slots.filter(row => row.locale === "zh-CN")) expect(screen.getByText(slot.after)).toBeTruthy();
  });

  it("keeps the selected second/third near-tie card readable after its bounded copy refresh", () => {
    const sample = nearTieSamples.cases.find(row => row.requested_state === "top2_top3_near_tie" && row.quality === "normal")!;
    const vm = assembleRiasecResultViewModel({ ok: true, scale_code: "RIASEC",
      riasec_public_projection_v2: sample.projection } as unknown as ReportResponse, "en");
    // Direct VM-level projection does not invent the binding missing from this historical test fixture.
    const revised = applyRiasecReadingCopyRevision(vm);
    render(<RiasecResultShell locale="en" viewModel={revised} />);
    const row = copy.slots.find(item => item.slotKey === "near_tie_alternate_code_copy")!;
    expect(screen.getByTestId("riasec-neartie-reading").textContent).toContain(row.after);
    expect(screen.queryByText(row.before)).toBeNull();
    expect(revised.interpretationState).toBe(vm.interpretationState);
  });

  it.each(["en", "zh-CN"] as const)("reads an unknown consistent canonical package without applying this copy revision: %s", locale => {
    const input = wire(`1.9/${locale}/riasec_140`);
    const rebind = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        if (["source_hash", "canonical_source_hash"].includes(key)) Reflect.set(value, key, "a".repeat(64));
        else if (["compiled_hash", "canonical_compiled_hash"].includes(key)) Reflect.set(value, key, "b".repeat(64));
        else rebind(child);
      }
    };
    rebind(input);
    const before = structuredClone(input);
    expect(hasRiasecProjection(input)).toBe(true);
    const vm = assembleRiasecResultViewModel(input, locale === "en" ? "en" : "zh");
    expect(vm.authority?.sourceHash).toBe("a".repeat(64));
    expect(vm.authority?.compiledHash).toBe("b".repeat(64));
    expect(vm.dimensions).toHaveLength(6);
    expect(vm.displayCopy).toBeUndefined();
    expect(applyRiasecReadingCopyRevision(vm)).toBe(vm);
    if (locale === "zh-CN") {
      const slot = vm.deepContentSlots?.slots.find(row => row.slotId === "structural_difference_copy:summary");
      expect(slot?.content.summary).toBe(copy.slots.find(row => row.locale === "zh-CN" && row.field === "summary")!.before);
    } else expect(vm.lifecycleCopy?.faqItems.some(row => row.q === copy.additionalFaqs[0].question.before)).toBe(true);
    expect(input).toEqual(before);
  });

  it.each(copy.acceptedCanonicalSources.flatMap(source => source.locales.map(locale => ({ source, locale }))))(
    "retains the finite reviewed pair $source.compilerVersion/$locale/$source.sourceHash", ({ source, locale }) => {
      const key = `${source.compilerVersion === "1.8.0" ? "1.8" : "1.9"}/${locale}/riasec_140`;
      const vm = assembleRiasecResultViewModel(wire(key), locale === "en" ? "en" : "zh");
      // VM-level admission matrix uses pairs traced to the native fixture or exact API manifest.
      // It does not construct or promote a new runtime report authority.
      const row = copy.slots.find(item => item.locale === locale && item.field === "summary")!;
      const original = vm.deepContentSlots!.slots.find(slot => slot.slotId === row.slotId)!;
      const controlled = { ...vm, displayCopy: undefined,
        authority: { ...vm.authority!, sourceHash: source.sourceHash, compiledHash: source.compiledHash,
          compilerVersion: source.compilerVersion, locale },
        deepContentSlots: { ...vm.deepContentSlots!, slots: [{ ...original, content: { ...original.content, summary: row.before } }] } };
      const revised = applyRiasecReadingCopyRevision(controlled);
      expect(revised.deepContentSlots!.slots[0].content.summary).toBe(row.after);
      expect(revised.displayCopy?.revision).toBe(copy.revision);
      expect(revised.authority).toBe(controlled.authority);
      expect(revised.dimensions).toBe(controlled.dimensions);
    });
});
