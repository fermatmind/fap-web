import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
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

describe("RichResultReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders authored overview, CTA mirrors, and recommended reads without leaking gated content", () => {
    const reportData = createReportFixture();
    expect(reportData.cta).toMatchObject({
      visible: true,
      kind: "upsell",
      target_sku: "MBTI_REPORT_FULL",
      target_sku_effective: "MBTI_REPORT_FULL_199",
    });
    if (!reportData.report) {
      throw new Error("Expected report payload");
    }
    if (!reportData.report.layers?.identity) {
      throw new Error("Expected identity layer");
    }
    reportData.cta = createCustomCta({
      title: "统一主 CTA 标题",
      subtitle: "统一主 CTA 副标题",
      primary_label: "立即查看正式方案",
      benefit_bullets: ["正式权益 A", "正式权益 B"],
      badge: "首选方案",
    });
    reportData.report.layers.identity = {
      ...reportData.report.layers.identity,
      title: "作者化人格标题",
      subtitle: "作者化人格副标题",
      one_liner: "作者化人格一句话",
      bullets: [
        "判断线索：你会先判断这段连接是否值得继续投入。",
        "社交方式：你会主动点亮气氛，但也需要保留回看空间。",
        "边界提醒：别把短期波动当成长期结论。",
      ],
      tags: ["作者化线索", "identity", "type:ENFP-T"],
    };
    reportData.report.recommended_reads = [
      {
        id: "read-1",
        type: "article",
        title: "职业环境对齐",
        desc: "继续阅读工作环境与节奏的匹配线索。",
        url: "https://example.com/read-1",
        cover: null,
        cta: "继续阅读职业篇",
        priority: 10,
        tags: ["职业", "环境"],
        estimated_minutes: 8,
        status: "published",
        published_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-02T00:00:00Z",
        canonical_id: "career-read-1",
        canonical_url: "https://example.com/read-1",
      },
      {
        id: "read-2",
        type: "article",
        title: "关系里的边界感",
        desc: "继续阅读关系互动中的边界与误读来源。",
        url: "https://example.com/read-2",
        cover: null,
        cta: "继续阅读关系篇",
        priority: 20,
        tags: ["关系"],
        estimated_minutes: 6,
        status: "published",
        published_at: "2026-03-03T00:00:00Z",
        updated_at: "2026-03-04T00:00:00Z",
        canonical_id: "relationship-read-1",
        canonical_url: "https://example.com/read-2",
      },
    ];

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-dimensions")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-dominant-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-highlights")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-overview")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-relationships")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-sticky-rail")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-mobile-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("作者化人格标题");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("作者化人格副标题");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("作者化人格一句话");

    const orderedChapters = [
      screen.getByTestId("mbti-chapter-career"),
      screen.getByTestId("mbti-chapter-growth"),
      screen.getByTestId("mbti-chapter-overview"),
      screen.getByTestId("mbti-chapter-relationships"),
    ];
    for (let index = 0; index < orderedChapters.length - 1; index += 1) {
      expect(orderedChapters[index].compareDocumentPosition(orderedChapters[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    const relationships = screen.getByTestId("mbti-chapter-relationships");
    const reads = screen.getByTestId("mbti-recommended-reads");
    const offers = screen.getByTestId("mbti-offer-comparison");
    expect(relationships.compareDocumentPosition(reads) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(reads.compareDocumentPosition(offers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const hero = screen.getByTestId("mbti-hero");
    expect(within(hero).getByRole("heading", { name: /ENFP-T/ })).toBeInTheDocument();
    expect(within(hero).getByText("费马人格档案")).toBeInTheDocument();
    expect(within(hero).getByText("浪漫热情但易纠结的灵感派")).toBeInTheDocument();
    expect(within(hero).getByText(/约 6–8%/)).toBeInTheDocument();
    expect(within(hero).getByText("热情")).toBeInTheDocument();
    expect(within(hero).getByText("高敏感")).toBeInTheDocument();
    expect(screen.queryByText("type:ENFP-T")).not.toBeInTheDocument();
    expect(screen.queryByText("role:NF")).not.toBeInTheDocument();
    expect(screen.queryByText("axis:EI:E")).not.toBeInTheDocument();
    expect(screen.queryByText("state:AT:clear")).not.toBeInTheDocument();

    expect(screen.getByText("优势亮点")).toBeInTheDocument();
    expect(screen.getByText("盲点提醒")).toBeInTheDocument();
    expect(screen.getByText("行动建议")).toBeInTheDocument();
    expect(screen.getByText("优势补齐：你更容易把复杂任务拆解成可执行步骤。（ENFP-T）")).toBeInTheDocument();
    expect(screen.queryByText("generated")).not.toBeInTheDocument();
    expect(screen.queryByText("selected:blindspot")).not.toBeInTheDocument();
    expect(screen.queryByText("action")).not.toBeInTheDocument();

    for (const chapter of orderedChapters) {
      expect(within(chapter).queryAllByTestId("mbti-chapter-unlock-card").length).toBeLessThanOrEqual(1);
    }
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
    expect(screen.queryByText("你的优势：执行推进力")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Content pack did not provide enough matched cards. Showing a safe fallback tip.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Turn strengths into a repeatable template")).not.toBeInTheDocument();

    expect(screen.getByTestId("mbti-offer-card-full")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-card-career")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-card-relationships")).toBeInTheDocument();
    expect(screen.getAllByText("完整人格报告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("职业道路模块").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("关系解读模块").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("E / I")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "分享结果" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "重新测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    const offerComparison = screen.getByTestId("mbti-offer-comparison");
    expect(within(offerComparison).getByText("统一主 CTA 标题")).toBeInTheDocument();
    expect(within(offerComparison).getByText("统一主 CTA 副标题")).toBeInTheDocument();
    expect(within(offerComparison).getByText("正式权益 A")).toBeInTheDocument();
    expect(within(offerComparison).getByText("正式权益 B")).toBeInTheDocument();
    expect(within(offerComparison).getByRole("button", { name: "立即查看正式方案" })).toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "立即查看正式方案" })).toHaveAttribute(
      "href",
      "#offers"
    );
    expect(within(screen.getByTestId("mbti-mobile-chrome")).getByRole("link", { name: "立即查看正式方案" })).toHaveAttribute(
      "href",
      "#offers"
    );
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "立即查看正式方案" })).toHaveAttribute(
      "href",
      "#offers"
    );
    expect(within(screen.getByTestId("mbti-sticky-rail")).queryByText("统一主 CTA 副标题")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-mobile-chrome")).queryByText("统一主 CTA 副标题")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-footer-cta")).queryByText("统一主 CTA 副标题")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-sticky-rail")).queryByText("正式权益 A")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-mobile-chrome")).queryByText("正式权益 A")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-footer-cta")).queryByText("正式权益 A")).not.toBeInTheDocument();
    expect(screen.getByText("职业环境对齐")).toBeInTheDocument();
    expect(screen.getByText("关系里的边界感")).toBeInTheDocument();
    expect(screen.queryByText("你的人格主轴是先看到人与机会之间尚未被点亮的连接。")).not.toBeInTheDocument();
    expect(screen.queryByText("Prefers explicit roles and reviewable workflows.")).not.toBeInTheDocument();
    expect(screen.queryByText("Reliable operator")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "继续阅读职业篇" }));
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "offer_primary_cta",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "recommended_reads",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "recommended_read_card",
        interaction: "click",
      })
    );
  });

  it("hides the recommended reads section when the array is empty", () => {
    const reportData = createReportFixture();
    if (!reportData.report) {
      throw new Error("Expected report payload");
    }
    reportData.report.recommended_reads = [];

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "offer_primary_cta",
      })
    );
  });

  it("keeps rendering when authored layers are missing", () => {
    const reportData = createReportFixture();
    if (reportData.report) {
      reportData.report.layers = undefined;
    }

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-dominant-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-overview-authored-intro")).not.toBeInTheDocument();
    expect(screen.queryByText("你的人格主轴是先看到人与机会之间尚未被点亮的连接。")).not.toBeInTheDocument();
  });
});
