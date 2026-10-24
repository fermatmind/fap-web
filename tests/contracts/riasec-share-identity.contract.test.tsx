import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { normalizeAttemptReportAccess, type AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { createAttemptShare } from "@/lib/api/v0_3";
import { authority, canonicalReport } from "./fixtures/riasec/canonicalReport";

vi.mock("@/lib/api/v0_3", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/api/v0_3")>(),
  createAttemptShare: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));

const writeText = vi.fn();

function readyAccess(overrides: Partial<AttemptReportAccessView> = {}) {
  return {
    ...normalizeAttemptReportAccess({
      ok: true,
      attempt_id: "current-attempt",
      access_state: "ready",
      report_state: "ready",
      pdf_state: "unavailable",
    }, "zh")!,
    ...overrides,
  };
}

function report(attemptId?: string) {
  const value = canonicalReport();
  if (attemptId !== undefined) value.attempt_id = attemptId;
  value.riasec_public_projection_v2!.module_visibility_policy = {
    schema_version: "riasec.module_visibility_policy.v1",
    modules: [{ key: "share_card", visibility: "visible" }],
    fallback_policy: { frontend_inference_allowed: false },
  };
  return value;
}

beforeEach(() => {
  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  writeText.mockResolvedValue(undefined);
  vi.mocked(createAttemptShare).mockResolvedValue({
    ok: true,
    share_url: "https://fermatmind.com/zh/share/public-summary",
    riasec_private_result_authority: authority(),
  });
});

describe("RIASEC rich report share identity", () => {
  it.each([undefined, "", "   "])("shares using ready context when report identity is %s", async (id) => {
    render(<RichResultReport locale="zh" reportData={report(id)} accessProjection={readyAccess()} />);
    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));
    await screen.findByRole("button", { name: "分享链接已复制" });
    expect(createAttemptShare).toHaveBeenCalledExactlyOnceWith({ attemptId: "current-attempt", locale: "zh" });
    expect(writeText).toHaveBeenCalledExactlyOnceWith("https://fermatmind.com/zh/share/public-summary");
  });

  it.each([undefined, null])("preserves top-level identity compatibility without context (%s)", async (context) => {
    render(<RichResultReport locale="zh" reportData={report("legacy-attempt")} accessProjection={context} />);
    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));
    await screen.findByRole("button", { name: "分享链接已复制" });
    expect(createAttemptShare).toHaveBeenCalledExactlyOnceWith({ attemptId: "legacy-attempt", locale: "zh" });
  });

  it("accepts matching report and context identities", async () => {
    render(<RichResultReport locale="zh" reportData={report("current-attempt")} accessProjection={readyAccess()} />);
    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));
    await screen.findByRole("button", { name: "分享链接已复制" });
    expect(createAttemptShare).toHaveBeenCalledExactlyOnceWith({ attemptId: "current-attempt", locale: "zh" });
  });

  it.each([
    ["no identity", undefined, null],
    ["empty context identity", "legacy-attempt", readyAccess({ attemptId: " " })],
    ["conflicting identities", "other-attempt", readyAccess()],
    ["locked access", "current-attempt", readyAccess({ accessState: "locked" })],
    ["expired access", undefined, readyAccess({ accessState: "expired" })],
    ["pending report", "current-attempt", readyAccess({ reportState: "pending" })],
    ["unavailable report", undefined, readyAccess({ reportState: "unavailable" })],
  ] as const)("fails closed for %s without creating a share", async (_name, id, context) => {
    render(<RichResultReport locale="zh" reportData={report(id)} accessProjection={context} />);
    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));
    await screen.findByRole("button", { name: "重试分享" });
    expect(createAttemptShare).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("keeps the existing backend module share restriction", () => {
    const value = report();
    value.riasec_public_projection_v2!.module_visibility_policy = {
      schema_version: "riasec.module_visibility_policy.v1",
      modules: [{ key: "share_card", visibility: "hidden" }],
      fallback_policy: { frontend_inference_allowed: false },
    };
    render(<RichResultReport locale="zh" reportData={value} accessProjection={readyAccess()} />);
    expect(screen.queryByRole("button", { name: "分享结果" })).not.toBeInTheDocument();
    expect(createAttemptShare).not.toHaveBeenCalled();
  });

  it("preserves authority mismatch rejection after a share response", async () => {
    vi.mocked(createAttemptShare).mockResolvedValue({ ok: true, share_url: "https://fermatmind.com/zh/share/wrong", riasec_private_result_authority: authority("c".repeat(64)) });
    render(<RichResultReport locale="zh" reportData={report()} accessProjection={readyAccess()} />);
    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));
    await screen.findByRole("button", { name: "重试分享" });
    expect(createAttemptShare).toHaveBeenCalledOnce();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("retains a retryable failure and reuses the same identity", async () => {
    vi.mocked(createAttemptShare).mockRejectedValueOnce(new Error("unavailable"));
    render(<RichResultReport locale="zh" reportData={report()} accessProjection={readyAccess()} />);
    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));
    fireEvent.click(await screen.findByRole("button", { name: "重试分享" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(createAttemptShare).toHaveBeenNthCalledWith(2, { attemptId: "current-attempt", locale: "zh" });
  });
});
