import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { MbtiPrintReportContext } from "@/app/(localized)/[locale]/(app)/result/[id]/print/MbtiPrintReportContext";

function report(count: number): ReportResponse {
  return {
    mbti_form_v1: { question_count: count },
    mbti_public_projection_v1: {
      display_type: "INTJ-A",
      dimensions: ["EI", "SN", "TF", "JP", "AT"].map((axis_code) => ({ axis_code, dominant_pole: axis_code[1], dominant_pct: 63, raw_first_pole_pct: 37, opposite_pct: 37, strength_band: "boundary" })),
    },
    meta: { scoring_spec_version: `2026.01.mbti_${count}`, pack_id: "PRIVATE_PACKAGE_MARKER", dir_version: "PRIVATE_DIRECTORY_MARKER" },
    report: { versions: { engine: "v1.2", content_package_version: "v0.3", profile_version: "v2.5", content_package_dir: "PRIVATE_PATH_MARKER" } },
    quality: {},
  } as unknown as ReportResponse;
}

describe("MBTI print report identity and measurement context", () => {
  it.each([93, 144])("preserves the %s-question source identity and five original numeric readings", (count) => {
    render(<MbtiPrintReportContext report={report(count)} locale="en" />);
    const context = screen.getByTestId("mbti-print-report-context");
    expect(context).toHaveTextContent(`MBTI · ${count} questions`);
    expect(context).toHaveTextContent(`2026.01.mbti_${count}`);
    expect(within(context).getAllByText("63%")).toHaveLength(5);
    expect(within(context).getAllByText("37%")).toHaveLength(10);
    expect(context).toHaveTextContent("Keep four preference pairs separate from A/T");
    expect(context).toHaveTextContent("Near the midpoint or tied; avoid fixed labels");
    expect(within(context).getAllByText("boundary")).toHaveLength(5);
    expect(context).toHaveTextContent("Not provided (Unknown)");
    expect(context).not.toHaveTextContent("PRIVATE_");
  });
  it("preserves reported quality disagreement and does not treat an empty flag list as proof", () => {
    const source = report(144);
    source.quality = { level: "B", grade: "C", flags: [], checks: { secret: "PRIVATE_CHECK_MARKER" } };
    render(<MbtiPrintReportContext report={source} locale="zh" />);
    const context = screen.getByTestId("mbti-print-report-context");
    expect(within(context).getByText("B")).toBeInTheDocument();
    expect(within(context).getByText("C")).toBeInTheDocument();
    expect(context).toHaveTextContent("未记录质量提示");
    expect(context).not.toHaveTextContent("PRIVATE_CHECK_MARKER");
  });
  it("fails closed when the source report is still generating", () => {
    const source = report(93); source.generating = true;
    const { container } = render(<MbtiPrintReportContext report={source} locale="en" />);
    expect(container.querySelector('[data-pdf-error="MBTI_REPORT_CONTEXT_UNAVAILABLE"]')).not.toBeNull();
    expect(container).not.toHaveTextContent("63%");
  });
});
