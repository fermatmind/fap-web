import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { canRenderRichResultReport, RichResultReport } from "@/components/result/RichResultReport";
import { BIG5_RESULT_PAGE_V2_PAYLOAD_KEY } from "@/lib/big5/resultPageV2";
import { BIG5_SOURCE_HASH, canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";
import { createRuntimeV2Payload } from "@/tests/fixtures/big5/runtimeV2Payload";

describe("Big Five private result page consumer", () => {
  it("renders canonical payload with exact authority hashes", () => {
    const report = canonicalPrivateReport();
    expect(canRenderRichResultReport(report)).toBe(true);
    render(<RichResultReport locale="zh" reportData={report} />);
    expect(screen.getByTestId("big5-result-shell")).toHaveAttribute("data-authority-mode", "canonical");
    expect(screen.getByTestId("big5-result-shell")).toHaveAttribute("data-source-hash", BIG5_SOURCE_HASH);
  });

  it("ignores the retired result-page candidate for canonical attempts", () => {
    const report = canonicalPrivateReport();
    report[BIG5_RESULT_PAGE_V2_PAYLOAD_KEY] = createRuntimeV2Payload();
    render(<RichResultReport locale="zh" reportData={report} />);
    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("fails closed for missing or invalid canonical metadata", () => {
    const report = canonicalPrivateReport();
    report.big5_private_result_authority = { ...report.big5_private_result_authority!, source_hash: "invalid" };
    if (report.report?._meta) delete (report.report._meta as Record<string, unknown>).big5_private_result_authority;
    expect(canRenderRichResultReport(report)).toBe(false);
    expect(render(<RichResultReport locale="zh" reportData={report} />).container).toBeEmptyDOMElement();
  });

  it("allows a stored V2 shell only for an immutable legacy snapshot", () => {
    const report = canonicalPrivateReport();
    report.big5_private_result_authority = { schema_version: "fap.big5.private_result_authority.v1", mode: "immutable_legacy_snapshot", locale: "zh-CN", source_hash: "", compiled_hash: "" };
    report[BIG5_RESULT_PAGE_V2_PAYLOAD_KEY] = createRuntimeV2Payload();
    expect(canRenderRichResultReport(report)).toBe(true);
    render(<RichResultReport locale="zh" reportData={report} />);
    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
  });
});
