import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { BIG5_COMPILED_HASH, BIG5_SOURCE_HASH, canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";

describe("Big Five PDF/rendered authority QA", () => {
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
