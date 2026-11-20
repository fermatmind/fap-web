import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Career94FreeReport } from "@/app/(localized)/[locale]/career/assessment/Career94FreeReport";
import projection from "./fixtures/riasec/deep-copy-v1.projection.json";

vi.mock("@/components/result/riasec/RiasecReadingReport", () => ({ RiasecReadingReport: ({ reportTitle }: { reportTitle?: string }) => <h1>{reportTitle}</h1> }));

describe("Career94 separate sample reader", () => {
  beforeEach(() => { sessionStorage.clear(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("uses only the public questionnaire and non-persisting scorer, with no order or result save", async () => {
    const items = Array.from({ length: 94 }, (_, index) => ({
      id: `q${index + 1}`, section: index < 42 ? "interest" : index < 86 ? "style" : "context",
      axis: "I", reverse: index === 0,
    }));
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ form_version: "career_v1", items }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ riasec_public_projection_v2: projection }) });
    vi.stubGlobal("fetch", fetcher);
    render(<Career94FreeReport locale="zh" sample />);
    expect(await screen.findByRole("heading", { name: "职业兴趣报告示例" })).toBeVisible();
    expect(screen.getByText(/不是你的测试结果/)).toBeVisible();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0][0]).toMatch(/\/questions$/);
    expect(fetcher.mock.calls[1][0]).toMatch(/\/score$/);
    const request = fetcher.mock.calls[1][1];
    const body = JSON.parse(request.body);
    expect(request.credentials).toBe("omit");
    expect(body).toMatchObject({ form_version: "career_v1", include_report: true, locale: "zh", answers: { q1: 1, q2: 5, q87: null } });
    expect(sessionStorage.length).toBe(0);
  });

  it("shows a retryable error instead of fabricated report content when the native service fails", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetcher);
    render(<Career94FreeReport locale="zh" sample />);
    expect(await screen.findByRole("alert")).toHaveTextContent("示例报告暂时无法加载");
    expect(screen.queryByRole("heading", { name: "职业兴趣报告示例" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(fetcher.mock.calls.every(([url]) => url.endsWith("/questions"))).toBe(true);
  });

  it("does not call the network or fabricate a result when a private browser report is absent", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<Career94FreeReport locale="zh" />);
    expect(screen.getByRole("alert")).toHaveTextContent("没有可读取的结果");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
