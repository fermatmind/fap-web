import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createReportFixture(): ReportResponse {
  return structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
}

function createCustomCta(overrides: Partial<NonNullable<ReportResponse["cta"]>> = {}) {
  return {
    visible: true,
    kind: "upsell",
    title: "解锁完整 MBTI 报告",
    subtitle: "查看更完整的人格层、成长路线、关系洞察与推荐阅读。",
    primary_label: "解锁完整报告",
    secondary_label: "先看免费版",
    benefit_bullets: [
      "获得四大正式模块的完整正文与更深的分析视角",
      "查看稳定输出的推荐阅读与更完整的人格层内容",
      "继续沿用当前结果，无需重新测试即可解锁",
    ],
    badge: "完整版",
    target_sku: "MBTI_REPORT_FULL",
    target_sku_effective: "MBTI_REPORT_FULL_199",
    ...overrides,
  };
}

describe("MBTI shell authored fields contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders authored identity, top-level CTA, and non-empty recommended reads together", () => {
    const reportData = createReportFixture();
    if (!reportData.report || !reportData.report.layers?.identity) {
      throw new Error("Expected authored MBTI fixture");
    }

    reportData.cta = createCustomCta({
      title: "正式商业主位标题",
      subtitle: "正式商业主位副标题",
      primary_label: "解锁作者化完整版",
      benefit_bullets: ["权益一", "权益二"],
      badge: "主推",
    });
    reportData.report.layers.identity = {
      ...reportData.report.layers.identity,
      title: "作者化概览标题",
      subtitle: "作者化概览副标题",
      one_liner: "作者化概览一句话",
      bullets: [
        "优势线索：你很快就能发现人和机会之间的连接。",
        "表达方式：你愿意先点亮现场，再回头慢慢校准。",
      ],
      tags: ["作者化桥接", "identity", "type:ENFP-T"],
    };
    reportData.report.recommended_reads = [
      {
        id: "reads-1",
        type: "article",
        title: "作者化推荐阅读",
        desc: "这是第一篇推荐阅读。",
        url: "https://example.com/recommended-read",
        cover: null,
        cta: "继续阅读",
        priority: 1,
        tags: ["作者化"],
        estimated_minutes: 5,
        status: "published",
        published_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-02T00:00:00Z",
        canonical_id: "reads-1",
        canonical_url: "https://example.com/recommended-read",
      },
    ];

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("作者化概览标题");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("作者化概览一句话");
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁作者化完整版");
    expect(within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁作者化完整版" })).toBeInTheDocument();
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
  });

  it("falls back safely when layers.identity is absent and recommended reads are empty", () => {
    const reportData = createReportFixture();
    if (!reportData.report) {
      throw new Error("Expected report payload");
    }

    reportData.report.layers = {
      ...reportData.report.layers,
      identity: undefined,
    };
    reportData.report.recommended_reads = [];
    reportData.cta = createCustomCta({
      primary_label: "查看正式方案",
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-overview-authored-intro")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("查看正式方案");
    expect(screen.getByTestId("mbti-chapter-overview")).toHaveTextContent("把这一章看作整份报告的总览层");
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
  });

  it("falls back to default CTA copy when top-level cta is absent", () => {
    const reportData = createReportFixture();
    if (!reportData.report || !reportData.report.layers?.identity) {
      throw new Error("Expected report payload");
    }

    reportData.cta = undefined;
    reportData.report.recommended_reads = [];
    reportData.report.layers.identity = {
      ...reportData.report.layers.identity,
      title: "作者化标题仍然可见",
      subtitle: "作者化副标题仍然可见",
      one_liner: "作者化 bridge 仍然存在",
    };

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("作者化标题仍然可见");
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("查看解锁方案");
    expect(screen.getByTestId("mbti-offer-comparison")).toHaveTextContent("把零散 CTA 收口成一个正式比较区");
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "查看解锁方案" })).toHaveAttribute(
      "href",
      "#offers"
    );
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
  });
});
