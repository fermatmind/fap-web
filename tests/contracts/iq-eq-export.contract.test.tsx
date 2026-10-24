import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildIqResultExport } from "@/lib/iq/export";
import { buildEqResultExport } from "@/lib/eq/export";
import { EQResultV5 } from "@/components/result/eq/EQResultV5";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { defaultResultExportDraft, serializeResultExport } from "@/lib/result-export/contract";
import { buildEqRendererContractFixture } from "../fixtures/eq/v5/eq60RendererContractFixture";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";

const beta = { status: "available", source_kind: "designed_reference", model_version: "owner30_design_anchors_2026_10_14_v1", production_normed: false, population_percentile_eligible: false, standard_score: 110, display_score: 110, percentile: 74.75 };
function iq(locale: "zh" | "en", override = {}) {
  return { ok: true, schema_version: "iq.report.v1", scale_code: "IQ_INTELLIGENCE_QUOTIENT", locale: locale === "zh" ? "zh-CN" : "en", summary: { raw_score: 10, question_count: 30, beta_reference: beta }, scoring: { status: "scored", bank_id: "IQ_OWNER_ORIGINAL_30", scoring_engine_version: "synthetic-v1" }, duration_ms: 125000, quality: { level: "B" }, ...override } as unknown as ReportResponse;
}
const iqProjection = (locale: "zh" | "en", reportData = iq(locale), accessView: AttemptReportAccessView | null = null) => buildIqResultExport({ locale, reportData, resultData: null, accessView });
const eq = (locale: "zh" | "en") => buildEqRendererContractFixture(locale === "zh" ? "zh-CN" : "en").report as unknown as ReportResponse;

for (const locale of ["zh", "en"] as const) describe(`IQ/EQ actual export projection in ${locale}`, () => {
  it("carries original IQ counts, guarded Beta and source without private fields or legacy reconstruction", () => {
    const report = iq(locale, { attempt_id: "PRIVATE_ID", answer_key: "PRIVATE_KEY", token: "PRIVATE_TOKEN", email: "PRIVATE_EMAIL" });
    const projection = iqProjection(locale, report)!;
    expect(projection).not.toBeNull();
    expect(projection.assessment).toEqual({ formCode: "IQ_OWNER_ORIGINAL_30", questionCount: 30, locale: locale === "zh" ? "zh-CN" : "en" });
    const output = serializeResultExport(projection, defaultResultExportDraft(projection, locale), locale);
    expect(output).toContain("110"); expect(output).toContain("74.75"); expect(output).toContain(beta.model_version);
    expect(output).not.toMatch(/PRIVATE_(ID|KEY|TOKEN|EMAIL)/);
    expect(output).toContain(locale === "zh" ? "模型参考百分位" : "Model-reference percentile");
    const noBeta = iqProjection(locale, iq(locale, { summary: { raw_score: 10, question_count: 30, beta_reference: null, beta_standard_score: 145 } }))!;
    expect(noBeta.sections.some(section => section.id === "reference-score")).toBe(false);
    expect(noBeta.sections[0].fields[0].value).toBe(10);
  });
  it("preserves an atomic qualified normative source and never completes an ineligible one", () => {
    const normative_reasoning = { status: "available", eligible: true, standard_score: 110, percentile: 75, reference_population: { label_zh: "合成参照", label_en: "Synthetic reference" }, model_version: "synthetic-model", norm_table_version: "synthetic-norm" };
    const projection = iqProjection(locale, iq(locale, { summary: { raw_score: 10, question_count: 30, beta_reference: null, normative_reasoning } }))!;
    expect(projection.reference[0].value).toContain("synthetic-norm");
    const ineligible = iqProjection(locale, iq(locale, { summary: { raw_score: 10, question_count: 30, normative_reasoning: { ...normative_reasoning, eligible: false } } }))!;
    expect(ineligible.sections.some(section => section.id === "reference-score")).toBe(false);
  });
  it.each(["pending", "failed", "locked", "placeholder", "identity-missing"])("does not export IQ in %s state", state => {
    const report = state === "placeholder" ? iq(locale, { scoring: { bank_id: "IQ_BETA_50_ORIGINAL" } }) : state === "identity-missing" ? iq(locale, { scoring: {} }) : iq(locale);
    const access = state === "pending" || state === "failed" || state === "locked" ? { accessState: "ready", reportState: state } as AttemptReportAccessView : null;
    expect(iqProjection(locale, report, access)).toBeNull();
  });
  it("preserves EQ dimension names, score units and quality from the canonical visible report only", () => {
    const report = eq(locale);
    const projection = buildEqResultExport(report, locale)!;
    expect(projection.assessment.formCode).toBe("EQ_60");
    expect(projection.sections.map(section => section.id)).toEqual(["summary", "SA", "ER", "EM", "RM"]);
    expect(projection.sections[1].title).toBe(`BACKEND_COPY[${locale === "zh" ? "zh-CN" : "en"}:score.SA.label]`);
    expect(projection.sections[1].fields.map(field => field.unit)).toEqual(["raw_sum", "standard_score", "percentile (0–100)"]);
    expect(projection.limitations.join(" ")).toContain("POMP");
    const encoded = JSON.stringify(projection);
    expect(encoded).not.toMatch(/attempt_id|snapshot_binding|compiled_hash|agent_context|source_hash/);
    const fixture = buildEqRendererContractFixture(locale === "zh" ? "zh-CN" : "en", "low_confidence");
    expect(buildEqResultExport(fixture.report as unknown as ReportResponse, locale)).toBeNull();
    expect(buildEqResultExport({ ...report, generating: true }, locale)).toBeNull();
    expect(buildEqResultExport({ ...report, access: { locked: true } } as unknown as ReportResponse, locale)).toBeNull();
  });
  it("uses the same EQ canonical score node for raw sum without converting POMP", () => {
    const report = eq(locale) as unknown as { scores: { dimensions: Record<string, { raw_score?: number }> } };
    report.scores.dimensions.SA.raw_score = 43;
    const projection = buildEqResultExport(report as unknown as ReportResponse, locale)!;
    expect(projection.sections[1].fields[0].value).toBe(43);
  });
  it("does not offer the metadata-only EQ PDF as a complete result when the generic parent says ready", () => {
    const onDownloadPdf = vi.fn().mockResolvedValue(undefined);
    render(<EQResultV5 locale={locale} reportData={eq(locale)} exportPdfState="ready" onDownloadPdf={onDownloadPdf} />);
    fireEvent.click(screen.getByText(locale === "zh" ? "选择、预览并带走结果" : "Choose, preview and take your results"));
    expect(screen.queryByRole("button", { name: /下载现有报告 PDF|Download existing report PDF/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^TXT$/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /^Markdown$/ })).toBeEnabled();
    expect(screen.getByText(locale === "zh" ? /此处未提供可用 PDF/ : /A PDF is not available here/)).toBeInTheDocument();
    expect(onDownloadPdf).not.toHaveBeenCalled();
  });
  it.each(["IQ", "EQ"])("offers %s real data, copy rejection recovery, optional sections and pending PDF fallback", async product => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } });
    const projection = product === "IQ" ? iqProjection(locale)! : buildEqResultExport(eq(locale), locale)!;
    render(<ResultExportPanel projection={projection} locale={locale} pdfState="pending" />);
    fireEvent.click(screen.getByText(locale === "zh" ? "选择、预览并带走结果" : "Choose, preview and take your results"));
    const preview = screen.getByRole("textbox", { name: locale === "zh" ? "完整导出预览" : "Full export preview" });
    expect((preview as HTMLTextAreaElement).value).toContain(product === "IQ" ? "74.75" : "POMP");
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "复制提示词和所选结果" : "Copy prompt and selected results" }));
    await waitFor(() => expect(preview).toHaveFocus());
    expect((preview as HTMLTextAreaElement).value.length).toBeGreaterThan(1000);
    expect(screen.getByText(locale === "zh" ? /PDF 仍在准备/ : /PDF is still being prepared/)).toBeInTheDocument();
  });
});
