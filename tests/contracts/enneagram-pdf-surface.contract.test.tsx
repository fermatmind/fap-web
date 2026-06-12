import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";

const hoisted = vi.hoisted(() => ({
  fetchAttemptReportPdfWithMeta: vi.fn(),
  createObjectURL: vi.fn(() => "blob:enneagram-report"),
  revokeObjectURL: vi.fn(),
  clickAnchor: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");
  return {
    ...actual,
    fetchAttemptReportPdfWithMeta: hoisted.fetchAttemptReportPdfWithMeta,
  };
});

describe("enneagram pdf surface contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = hoisted.createObjectURL;
    globalThis.URL.revokeObjectURL = hoisted.revokeObjectURL;
    vi.spyOn(window.HTMLAnchorElement.prototype, "click").mockImplementation(hoisted.clickAnchor);
  });

  it("uses the form-aware label and backend filename hint when downloading PDF", async () => {
    hoisted.fetchAttemptReportPdfWithMeta.mockResolvedValue({
      blob: new Blob(["pdf"], { type: "application/pdf" }),
      filenameHint: "fermatmind-enneagram-e105-2026-04-25.pdf",
      formLabel: "E105 标准版",
    });

    render(
      <PdfDownloadButton
        attemptId="attempt-enneagram-105"
        locked={false}
        locale="zh"
        filenamePrefix="enneagram-report"
        downloadLabel="E105 标准版"
      />
    );

    expect(screen.getByRole("button", { name: "下载 PDF · E105 标准版" })).toBeEnabled();

    const appendSpy = vi.spyOn(document.body, "appendChild");
    fireEvent.click(screen.getByRole("button", { name: "下载 PDF · E105 标准版" }));

    await waitFor(() => {
      expect(hoisted.fetchAttemptReportPdfWithMeta).toHaveBeenCalledWith({
        attemptId: "attempt-enneagram-105",
      });
    });

    const appendedAnchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement | undefined;
    expect(appendedAnchor?.download).toBe("fermatmind-enneagram-e105-2026-04-25.pdf");
    expect(hoisted.clickAnchor).toHaveBeenCalled();
  });

  it("does not fetch or trigger a blob download when safety-disabled on private result pages", () => {
    render(
      <PdfDownloadButton
        attemptId="attempt-enneagram-105"
        locked={false}
        locale="zh"
        filenamePrefix="enneagram-report"
        downloadLabel="E105 标准版"
        safetyDisabled
        safetyDisabledLabel="PDF 暂不可用"
        safetyDisabledReason="PDF 导出已安全暂停，避免私有结果链接进入文件页脚。"
      />
    );

    const button = screen.getByRole("button", { name: "PDF 暂不可用" });
    expect(button).toBeDisabled();
    expect(screen.getByText("PDF 导出已安全暂停，避免私有结果链接进入文件页脚。")).toBeInTheDocument();

    fireEvent.click(button);

    expect(hoisted.fetchAttemptReportPdfWithMeta).not.toHaveBeenCalled();
    expect(hoisted.clickAnchor).not.toHaveBeenCalled();
  });
});
