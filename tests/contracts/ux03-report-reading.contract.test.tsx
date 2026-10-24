import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Big5ReadingGuide } from "@/components/result/big5/Big5ReadingGuide";
import { buildBig5ReadingContext } from "@/lib/big5/reportReading";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import englishEngine from "@/tests/fixtures/big5/canonical-engine-en-120.json";
import { buildBig5ResultExport, buildBig5AiFacts } from "@/lib/big5/aiExport";
import { buildEnneagramResultExport, buildEnneagramAiFacts } from "@/lib/enneagram/aiExport";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import { canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";
import { createSevenChapterReport } from "@/tests/contracts/helpers/enneagramSevenChapterFixture";
import { BIG5_FACETS } from "@/lib/big5/taxonomy";

const gate = { isFreeVariant: false, modulesAllowed: new Set<string>(), modulesPreview: new Set<string>(), freeSections: null };

const readyAccess = { accessState: "ready", reportState: "ready", variant: "full", modulesAllowed: ["big5_full", "enneagram_full"], modulesPreview: [] } as unknown as AttemptReportAccessView;

describe("UX-03 report reading and domain export", () => {
  it("never converts missing, null or forbidden percentiles into population ranks", () => {
    const context = buildBig5ReadingContext({ projection: { trait_vector: [{ key: "O", mean: 0, percentile: 98 }], facet_vector: [{ key: "O1", percentile: 92 }] }, normEvidence: { show_precise_percentiles: true, comparison_allowed: false }, includeFacets: true });
    expect(context.domains[0]).toEqual({ code: "O", band: null, mean: 0, percentile: null });
    expect(context.facets[0].percentile).toBeNull();
    expect(context.domains[1].mean).toBeNull();
    expect(context.norm.region).toBe("");
  });
  it("keeps the actual quality notice visible before any domain is expanded", () => {
    const context = buildBig5ReadingContext({ projection: null, quality: { level: "D", notice_body: "This response pattern has limited confidence." } });
    render(<Big5ReadingGuide context={context} locale="en" />);
    expect(screen.getByRole("note")).toBeVisible();
    expect(screen.getByRole("note")).toHaveTextContent("limited confidence");
  });
  it("localizes both extreme facet bands without changing exported codes", () => {
    const context = buildBig5ReadingContext({ projection: { facet_vector: [{ key: "O1", bucket: "extreme_low" }, { key: "O2", bucket: "extreme_high" }] }, includeFacets: true });
    render(<Big5ReadingGuide context={context} locale="zh" />);
    fireEvent.click(screen.getByRole("button", { name: "展开全部面向" }));
    expect(screen.getByText("本次分档 极低")).toBeVisible();
    expect(screen.getByText("本次分档 极高")).toBeVisible();
    expect(context.facets[0].band).toBe("extreme_low");
  });
  for (const locale of ["zh", "en"] as const) {
    it(`makes all thirty existing facets reachable and records an optional action in ${locale}`, () => {
      const context = buildBig5ReadingContext({ projection: { trait_vector: [{ key: "O", mean: 2.7 }], facet_vector: BIG5_FACETS.map((row) => ({ key: row.facet_code, mean: 3.2 })) }, includeFacets: true });
      render(<Big5ReadingGuide context={context} locale={locale} />);
      fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "展开全部面向" : "Expand all facets" }));
      for (const facet of BIG5_FACETS) expect(screen.getByText(facet.display_label[locale])).toBeVisible();
      const guide = screen.getByTestId("big5-reading-guide");
      const fields = within(guide).getAllByRole("textbox");
      fireEvent.change(fields[0], { target: { value: "five-minute start, tomorrow" } });
      fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "选择这项行动" : "Choose this action" }));
      expect(screen.getByRole("status")).toHaveTextContent(locale === "zh" ? "刷新会清空" : "refreshing clears");
    });
    for (const formCode of ["big5_90", "big5_120"] as const) {
      it(`binds ${formCode}/${locale} export to ready access and the actual form, without default facets`, () => {
        const report = canonicalPrivateReport();
        if (locale === "en") Object.assign(report, { big5_report_engine_v2: structuredClone(englishEngine), big5_private_result_authority: englishEngine._meta.big5_private_result_authority });
        report.big5_report_engine_v2!.form_code = formCode;
        report.big5_form_v1!.form_code = formCode;
        report.big5_form_v1!.question_count = formCode === "big5_90" ? 90 : 120;
        const result = buildBig5ResultExport(report, locale, readyAccess)!;
        expect(result.assessment.formCode).toBe(formCode);
        expect(result.sections.filter((row) => row.defaultSelected).map((row) => row.id)).toEqual(["domains"]);
        expect(result.sections.flatMap((row) => row.fields).some((field) => field.unit === "percentile")).toBe(false);
        for (const state of ["pending", "locked", "unavailable", "expired"] as const) expect(buildBig5ResultExport(report, locale, { ...readyAccess, accessState: state })).toBeNull();
        report.big5_form_v1!.question_count = 999;
        expect(buildBig5ResultExport(report, locale, readyAccess)).toBeNull();
      });
    }
    for (const formCode of ["enneagram_likert_105", "enneagram_forced_choice_144"] as const) {
      it(`exports ${formCode}/${locale} candidates, not a wing or hidden identifiers`, () => {
        const report = createSevenChapterReport({ locale: locale === "zh" ? "zh-CN" : "en", formCode, scope: "close_call", top: [1, 6, 9] });
        Object.assign(report, { attempt_id: "PRIVATE-ID", fm_token: "SECRET", email: "private@example.com" });
        const view = assembleEnneagramResultViewModel({ reportData: report, locale, gate });
        const facts = buildEnneagramAiFacts(view, locale)!;
        expect(facts.candidates.map((row) => row.typeId)).toEqual(["1", "6", "9"]);
        expect(facts.distribution).toHaveLength(9);
        const exported = buildEnneagramResultExport(report, locale, readyAccess)!;
        expect(exported.assessment.formCode).toBe(formCode);
        expect("unit" in exported.sections[0].fields[0] ? exported.sections[0].fields[0].unit : null).toContain("0–100");
        expect(buildEnneagramResultExport(report, locale, { ...readyAccess, reportState: "pending" })).toBeNull();
        expect(facts.unit).toContain(formCode.includes("105") ? "likert_intensity" : "forced_choice_selection_rate");
        expect(JSON.stringify(facts)).not.toMatch(/PRIVATE-ID|SECRET|private@example|interpretation_context/);
        expect(buildEnneagramAiFacts(view, locale === "zh" ? "en" : "zh")).toBeNull();
      });
    }
  }
  it("rejects ready restricted reports rather than broadening their visible field set", () => {
    const report = canonicalPrivateReport();
    for (const label of ["free", "partial", "preview"]) {
      expect(buildBig5ResultExport({ ...report, variant: label }, "zh", readyAccess)).toBeNull();
      expect(buildBig5ResultExport({ ...report, access_level: label }, "zh", readyAccess)).toBeNull();
      expect(buildBig5ResultExport(report, "zh", { ...readyAccess, accessLevel: label })).toBeNull();
      expect(buildEnneagramResultExport({ ...createSevenChapterReport(), variant: label }, "en", readyAccess)).toBeNull();
    }
    expect(buildBig5ResultExport({ ...report, locked: true }, "zh", readyAccess)).toBeNull();
    expect(buildBig5ResultExport({ ...report, modules_allowed: ["big5_core"] }, "zh", readyAccess)).toBeNull();
    expect(buildEnneagramResultExport({ ...createSevenChapterReport(), modules_allowed: ["enneagram_core"] }, "en", readyAccess)).toBeNull();
    const restricted = { ...report, variant: "partial", view_policy: { free_sections: ["methodology_and_access"] } };
    expect(buildBig5ResultExport(restricted, "zh", readyAccess)).toBeNull();
    const view = assembleBig5ResultViewModel({ reportData: restricted, locale: "zh", gate: { ...gate, isFreeVariant: true, freeSections: new Set(["methodology_and_access"]) } });
    expect(view.readingContext.domains.every((row) => row.mean === null && row.percentile === null)).toBe(true);
  });
  it("keeps backend-locked engine chapters out of reading and export values", () => {
    const report = canonicalPrivateReport();
    for (const section of report.big5_report_engine_v2!.sections!) if (["domains_overview", "facet_details"].includes(section.section_key!)) { section.status = "locked"; section.blocks = []; }
    const view = assembleBig5ResultViewModel({ reportData: report, locale: "zh", gate });
    expect(view.readingContext.domains.every((row) => row.mean === null && row.percentile === null)).toBe(true);
    expect(view.readingContext.facets.every((row) => row.mean === null && row.percentile === null)).toBe(true);
    expect(buildBig5ResultExport(report, "zh", readyAccess)!.sections.filter((section) => section.id.startsWith("facets"))).toHaveLength(0);
  });
  it("does not leak gated facets through the reading context or export", () => {
    const report = canonicalPrivateReport();
    const view = assembleBig5ResultViewModel({ reportData: report, locale: "zh", gate: { ...gate, isFreeVariant: true, freeSections: new Set(["hero_summary", "domains_overview"]) } });
    expect(view.readingContext.facets.every((row) => row.mean === null && row.percentile === null)).toBe(true);
    expect(buildBig5AiFacts(view, "zh")!.facets).toEqual([]);
    expect(buildBig5AiFacts(view, "en")).toBeNull();
  });
});
