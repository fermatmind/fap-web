import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

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

function createProjectionReportFixture(): ReportResponse {
  return structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse;
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

  it("routes MBTI public hero and canonical sections through projection while keeping commerce and authored layers on legacy", () => {
    const reportData = createProjectionReportFixture();
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
      title: "Unified MBTI unlock plan",
      subtitle: "Use one primary commerce surface and keep the rest as mirrors.",
      primary_label: "Unlock the authored MBTI report",
      benefit_bullets: ["Formal entitlement A", "Formal entitlement B"],
      badge: "Primary",
    });

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
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("Legacy authored overview title");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("Legacy authored overview subtitle");
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent(
      "Legacy authored one-liner remains available for the authored intro card."
    );

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
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(hero).toHaveTextContent("Projection-first subtitle");
    expect(hero).toHaveTextContent("Projection-first summary that should replace the legacy hero copy on result pages.");
    expect(hero).toHaveTextContent("Around 6-8%");
    expect(within(hero).getByText("Projection Tag Alpha")).toBeInTheDocument();
    expect(within(hero).getByText("Projection Tag Beta")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Spark Navigator");
    expect(screen.queryByText("type:ENFP-T")).not.toBeInTheDocument();
    expect(screen.queryByText("axis:EI:E")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero summary should lose to projection summary.")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy keyword should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy rarity should lose")).not.toBeInTheDocument();

    expect(screen.getByText("Projection-ready highlight")).toBeInTheDocument();
    expect(screen.getByText("Legacy blindspot")).toBeInTheDocument();
    expect(screen.getByText("Legacy action")).toBeInTheDocument();

    for (const chapter of orderedChapters) {
      expect(within(chapter).queryAllByTestId("mbti-chapter-unlock-card").length).toBeLessThanOrEqual(1);
    }
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
    expect(screen.getByText("Projection letters intro headline.")).toBeInTheDocument();
    expect(screen.getByText("Projection overview public copy.")).toBeInTheDocument();
    expect(screen.getByText("Projection career summary public copy.")).toBeInTheDocument();
    expect(screen.getByText("Projection career advantage one")).toBeInTheDocument();
    expect(screen.getByText("Projection career weakness one")).toBeInTheDocument();
    expect(screen.getByText("Roles that reward exploratory leadership.")).toBeInTheDocument();
    expect(screen.getByText("Projection growth summary public copy.")).toBeInTheDocument();
    expect(screen.getByText("Projection motivators teaser.")).toBeInTheDocument();
    expect(screen.getByText("Projection relationships summary public copy.")).toBeInTheDocument();
    expect(screen.getByText("Projection relationship risks teaser.")).toBeInTheDocument();
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();

    expect(screen.getByTestId("mbti-offer-card-full")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-card-career")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-card-relationships")).not.toBeInTheDocument();
    expect(screen.getAllByText("完整人格报告").length).toBeGreaterThanOrEqual(1);
    expect(within(screen.getByTestId("mbti-offer-comparison")).queryByText("¥0.99")).not.toBeInTheDocument();
    expect(screen.getAllByText("E / I").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "分享结果" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "重新测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    const offerComparison = screen.getByTestId("mbti-offer-comparison");
    expect(within(offerComparison).getByText("Unified MBTI unlock plan")).toBeInTheDocument();
    expect(within(offerComparison).getByText("Use one primary commerce surface and keep the rest as mirrors.")).toBeInTheDocument();
    expect(within(offerComparison).getByText("Formal entitlement A")).toBeInTheDocument();
    expect(within(offerComparison).getByText("Formal entitlement B")).toBeInTheDocument();
    expect(within(offerComparison).getByRole("button", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(within(screen.getByTestId("mbti-mobile-chrome")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(within(screen.getByTestId("mbti-sticky-rail")).queryByText("Use one primary commerce surface and keep the rest as mirrors.")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-mobile-chrome")).queryByText("Use one primary commerce surface and keep the rest as mirrors.")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-footer-cta")).queryByText("Use one primary commerce surface and keep the rest as mirrors.")).not.toBeInTheDocument();
    expect(screen.getByText("Legacy recommended read remains visible")).toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Read the authored note" }));
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
    const reportData = createProjectionReportFixture();
    if (reportData.report) {
      reportData.report.layers = undefined;
    }

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-dominant-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-overview-authored-intro")).not.toBeInTheDocument();
    expect(screen.getByText("Projection overview public copy.")).toBeInTheDocument();
  });

  it("leaves non-MBTI branches on the legacy report normalizer", () => {
    const reportData = {
      report: {
        scale_code: "BIG5_OCEAN",
        sections: [
          {
            key: "overview",
            title: "Big Five overview",
            access_level: "free",
            blocks: [
              {
                kind: "paragraph",
                title: "Big Five overview",
                body: "Legacy Big Five copy remains unchanged.",
              },
            ],
          },
        ],
      },
      meta: {
        scale_code: "BIG5_OCEAN",
      },
    } satisfies ReportResponse;

    render(<RichResultReport locale="en" reportData={reportData} />);

    expect(screen.queryByTestId("mbti-result-shell")).not.toBeInTheDocument();
    expect(screen.getAllByText("Big Five overview").length).toBeGreaterThan(0);
    expect(screen.getByText("Legacy Big Five copy remains unchanged.")).toBeInTheDocument();
  });
});
