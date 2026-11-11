import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { normalizeAttemptReportAccess } from "@/lib/access/unifiedAccess";
import { RichResultReport } from "@/components/result/RichResultReport";
import { BIG5_COMPILED_HASH, BIG5_SOURCE_HASH, canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";

describe("Big Five PDF/rendered authority QA", () => {
  it("requests the advertised Taiwan PDF with the private report token in its header", async () => {
    const fetchPdf = vi.fn<typeof fetch>().mockResolvedValue(new Response(new Blob(["%PDF-fixture"]), {
      headers: { "Content-Type": "application/pdf" },
    }));
    vi.stubGlobal("fetch", fetchPdf);
    try {
      const access = normalizeAttemptReportAccess({
        ok: true, attempt_id: "fixture", access_state: "ready", report_state: "ready",
        pdf_state: "ready", pdf_display_locales: ["zh-TW"],
        actions: { pdf_href: "/api/v0.3/attempts/fixture/report.pdf" },
      }, "zh");
      render(<RichResultReport locale="zh" reportData={canonicalPrivateReport()} accessProjection={access}
        taiwanBigFivePdf={{ accessToken: "fixture-result-token" }} />);
      fireEvent.click(screen.getByRole("button", { name: "下載繁體 PDF" }));
      await waitFor(() => expect(fetchPdf).toHaveBeenCalledOnce());
      const [url, options] = fetchPdf.mock.calls[0];
      expect(String(url)).toMatch(/\/attempts\/fixture\/report\.pdf\?display_locale=zh-TW$/);
      expect(new Headers(options?.headers).get("X-Result-Access-Token")).toBe("fixture-result-token");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps print rendering bound to the same canonical hashes and backend copy", () => {
    const report = canonicalPrivateReport();
    const backendCopy = String(report.big5_report_engine_v2?.sections?.[0]?.blocks?.[0]?.resolved_copy?.body_core ?? "");
    render(<RichResultReport locale="zh" reportData={report} printSnapshotMode />);
    const shell = screen.getByTestId("big5-result-shell");
    expect(shell).toHaveAttribute("data-source-hash", BIG5_SOURCE_HASH);
    expect(shell).toHaveAttribute("data-compiled-hash", BIG5_COMPILED_HASH);
    expect(document.body.textContent).toContain(backendCopy);
    expect(document.body.textContent).not.toContain("frontend_fallback");
  });
});
