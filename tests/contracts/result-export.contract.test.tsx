import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { buildMbtiResultExport } from "@/lib/result-export/mbti";
import { defaultResultExportDraft, serializeResultExport, type ResultExportProjection } from "@/lib/result-export/contract";
import { downloadResultPdf } from "@/lib/result-export/download";
import type { ReportResponse } from "@/lib/api/v0_3";
import { RESULT_EXPORT_PROMPTS } from "@/lib/result-export/prompts";

function report(count = 93, locale = "en"): ReportResponse {
  return { report: { locale, versions: { engine: "engine-qa", account_id: "private-version-key" } }, mbti_form_v1: { form_code: `MBTI_${count}`, question_count: count },
    mbti_public_projection_v1: { display_type: "INFJ-A", summary_card: { summary: "Synthetic QA summary" }, dimensions: [
      { axis_code: "EI", dominant_pole: "I", dominant_pct: 51, raw_first_pole_pct: 49 },
      { axis_code: "SN", dominant_pole: "N", dominant_pct: 72 }, { axis_code: "AT", dominant_pole: "A", dominant_pct: 60 },
    ] }, token: "private-token-qa", attempt_id: "private-id-qa", answers: ["private-answer-qa"], email: "private-email-qa" };
}
afterEach(() => { vi.restoreAllMocks(); });
describe("shared result export", () => {
  it.each([93, 144])("exports actual %i form in both languages without identities or invented values", count => {
    for (const locale of ["zh", "en"] as const) {
      const projection = buildMbtiResultExport(report(count, locale === "zh" ? "zh-CN" : "en"), locale)!;
      const serialized = serializeResultExport(projection, defaultResultExportDraft(projection, locale), locale);
      expect(serialized).toContain(`MBTI_${count}`); expect(serialized).toContain("51"); expect(serialized).toContain("engine-qa");
      expect(serialized).not.toMatch(/private-(token|id|answer|email|version-key)-qa/);
      expect(projection.sections.find(s => s.id === "TF")?.fields[1].value).toBeNull();
      expect(projection.assessment.locale).toBe(locale === "zh" ? "zh-CN" : "en");
    }
  });
  it("does not infer missing language, form, percentages, quality or versions", () => {
    const p = buildMbtiResultExport({ mbti_public_projection_v1: { display_type: "INTP-T", dimensions: [{ axis_code: "EI", dominant_pct: Number.NaN }] } }, "en")!;
    expect(p.assessment).toEqual({ formCode: null, questionCount: null, locale: null });
    expect(p.sections[1].fields[1].value).toBeNull(); expect(p.quality).toEqual([]);
    expect(serializeResultExport(p, defaultResultExportDraft(p, "en"), "en")).toContain("Unknown (not provided)");
    expect(buildMbtiResultExport({ ...report(), generating: true }, "en")).toBeNull();
    expect(buildMbtiResultExport({}, "en")).toBeNull();
  });
  it("separates report material language from an unprovided original test language", () => {
    const p = buildMbtiResultExport({ ...report(), report: { _meta: { personalization: { locale: "en" } } }, meta: { scoring_spec_version: "qa-spec" } }, "zh")!;
    expect(p.assessment.locale).toBe("en");
    const output = serializeResultExport(p, defaultResultExportDraft(p, "en"), "en");
    expect(output).toContain("Test language: Unknown (not provided)");
    expect(output).toContain("Result material language: en");
    expect(output).toContain("qa-spec");
  });
  it("keeps missing or nonfinite adapter values unknown rather than zero", () => {
    const p = { ...buildMbtiResultExport(report(), "en")!, reference: [{ label: "Unprovided reference", value: Number.NaN }] };
    expect(serializeResultExport(p, defaultResultExportDraft(p, "en"), "en")).toContain("Unprovided reference: Unknown (not provided)");
  });
  it("preserves real quality flags alongside the reported grade without claiming accuracy", () => {
    const p = buildMbtiResultExport({ ...report(), quality: { level: "A", flags: ["INCONSISTENT"], client_duration_ms: 60000 } }, "en")!;
    const output = serializeResultExport(p, defaultResultExportDraft(p, "en"), "en");
    expect(output).toContain("INCONSISTENT"); expect(output).toContain("Reported quality level: A");
    expect(output).not.toContain("client_duration_ms");
  });
  it("preserves long literal text, emoji, CRLF, fences, HTML and the final field", () => {
    const p = buildMbtiResultExport(report(), "en")!;
    const draft = defaultResultExportDraft(p, "en");
    draft.goal = '<script>alert(1)</script> 🧪\r\n```\n~~~\n[private](javascript:alert(1))\n' + "long ".repeat(4000) + "LAST 🐈";
    const raw = serializeResultExport(p, draft, "en"); const md = serializeResultExport(p, draft, "en", "markdown");
    expect(raw).toContain(draft.goal); expect(md).toContain(draft.goal); expect(md).toContain("````\n"); expect(raw.length).toBeGreaterThan(20000);
    draft.selectedSections = ["summary"];
    expect(serializeResultExport(p, draft, "en")).toContain("Omitted (does not mean zero): EI, SN, TF, JP, Separate additional A/T");
  });
  it("allows all other products to consume the same contract and their own templates", () => {
    for (const product of Object.keys(RESULT_EXPORT_PROMPTS) as ResultExportProjection["product"][]) {
      const p = { ...buildMbtiResultExport(report(), "en")!, product };
      for (const locale of ["en", "zh"] as const) expect(serializeResultExport(p, defaultResultExportDraft(p, locale), locale)).toContain(RESULT_EXPORT_PROMPTS[product][locale]);
    }
  });
  it("waits for clipboard success; rejected copies preserve data and focus the full fallback", async () => {
    let resolve!: () => void;
    const writeText = vi.fn().mockImplementationOnce(() => new Promise<void>(done => { resolve = done; })).mockRejectedValueOnce(new DOMException("Denied", "NotAllowedError"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ResultExportPanel projection={buildMbtiResultExport(report(), "en")!} locale="en" pdfState="pending" />);
    fireEvent.click(screen.getByText("Choose, preview and take your results"));
    fireEvent.change(screen.getByLabelText("Goal and experience (your own words, optional)"), { target: { value: "My QA goal 🧪" } });
    const button = screen.getByRole("button", { name: "Copy prompt and selected results" });
    fireEvent.click(button); expect(screen.queryByText("Copied. Paste it into the AI you choose.")).toBeNull();
    resolve(); await waitFor(() => expect(screen.getByText("Copied. Paste it into the AI you choose.")).toBeTruthy());
    expect(writeText.mock.calls[0][0]).toBe((screen.getByLabelText("Full export preview") as HTMLTextAreaElement).value);
    fireEvent.click(button); await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Full export preview")));
    expect((screen.getByLabelText("Full export preview") as HTMLTextAreaElement).value).toContain("My QA goal 🧪");
    expect(screen.getByText(/PDF is still being prepared/)).toBeTruthy();
  });
  it("renders user HTML as text and gives an unsupported-clipboard fallback", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    render(<ResultExportPanel projection={buildMbtiResultExport(report(), "en")!} locale="en" />);
    fireEvent.click(screen.getByText("Choose, preview and take your results"));
    fireEvent.change(screen.getByLabelText("Goal and experience (your own words, optional)"), { target: { value: '<img src=x onerror="alert(1)">' } });
    expect(document.querySelector('img[src="x"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Copy prompt and selected results" }));
    await waitFor(() => expect(screen.getByText(/Copy was not available/)).toBeTruthy());
  });
  it("rejects JSON or HTML disguised as a PDF", async () => {
    await expect(downloadResultPdf(new Blob(['{"error":"pending"}'], { type: "application/json" }))).rejects.toThrow("PDF unavailable");
    await expect(downloadResultPdf(new Blob(["<html>error"], { type: "application/pdf" }))).rejects.toThrow();
  });
});
