import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Career94FreeReport } from "@/app/(localized)/[locale]/career/assessment/Career94FreeReport";
import Career94SamplePage, { generateMetadata } from "@/app/(localized)/[locale]/career/assessment/sample/page";
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

  it("localizes the public sample metadata and exposes two start links even if the report fails to load", async () => {
    const params = Promise.resolve({ locale: "zh" });
    const metadata = await generateMetadata({ params });
    expect(metadata).toMatchObject({
      title: { absolute: "免费职业测试（94题）公开报告样例｜费马测试" },
      description: expect.stringContaining("公开合成报告样例"),
      robots: { index: false, follow: true },
    });
    expect(await generateMetadata({ params: Promise.resolve({ locale: "en" }) })).toEqual({
      title: "Career interest report sample | FermatMind", robots: { index: false, follow: true },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const { container } = render(await Career94SamplePage({ params }));
    expect(screen.getByText("费马职业兴趣与工作偏好测评（94题）")).toBeVisible();
    expect(screen.getByRole("link", { name: /免费开始 94 题测试/ })).toHaveAttribute("href", "/zh/career/assessment/take");
    expect(screen.getByRole("link", { name: /开始我的免费职业测试/ })).toHaveAttribute("href", "/zh/career/assessment/take");
    expect(await screen.findByRole("alert")).toHaveTextContent("示例报告暂时无法加载");
    expect(container.querySelectorAll("main a")).toHaveLength(2);
  });

  it("does not call the network or fabricate a result when a private browser report is absent", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<Career94FreeReport locale="zh" />);
    expect(screen.getByRole("alert")).toHaveTextContent("没有可读取的结果");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
