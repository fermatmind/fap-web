import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

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

describe("MBTI shell authored fields contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("keeps hero, dimensions, and canonical sections on projection-first authority while legacy authored fields stay available", () => {
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

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    const hero = screen.getByTestId("mbti-hero");
    expect(within(hero).getByRole("heading", { level: 1, name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("Projection Campaigner");
    expect(hero).toHaveTextContent("Projection-first subtitle");
    expect(hero).toHaveTextContent("Projection-first summary that should replace the legacy hero copy on result pages.");
    expect(hero).toHaveTextContent("Around 6-8%");
    expect(hero).toHaveTextContent("Projection Tag Alpha");
    expect(screen.getByText("Projection career summary public copy.")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-career-next-step")).toHaveTextContent("Projection career summary public copy.");
    expect(screen.getByTestId("mbti-career-next-step-cta")).toHaveAttribute(
      "href",
      "/zh/career/recommendations/mbti/enfp-t"
    );
    expect(screen.getByText("Projection career advantage one")).toBeInTheDocument();
    expect(screen.getByText("Projection relationship risks teaser.")).toBeInTheDocument();
    expect(screen.getByText("Projection trait grid summary.")).toBeInTheDocument();
    expect(screen.getByText("Legacy authored overview title")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁完整报告");
    expect(within(screen.getByTestId("mbti-sticky-rail")).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
    expect(screen.queryByText("Legacy Hero Title Should Lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero subtitle should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy hero summary should lose to projection summary.")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy keyword should lose")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy rarity should lose")).not.toBeInTheDocument();
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "view_result",
      expect.objectContaining({
        attemptIdMasked: "attemp...-123",
        typeCode: "ENFP-T",
        identity: "T",
        variantKey: "overview:EI.E.clear:identity.T:boundary.TF",
      })
    );
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
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁完整报告");
    expect(screen.getByTestId("mbti-chapter-overview")).toHaveTextContent("Projection overview public copy.");
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
      title: "Legacy authored title still visible",
      subtitle: "Legacy authored subtitle still visible",
      one_liner: "Legacy authored bridge still exists",
    };

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-overview-authored-intro")).toHaveTextContent("Legacy authored title still visible");
    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toHaveTextContent("解锁完整报告");
    expect(screen.getByTestId("mbti-offer-comparison")).toHaveTextContent("解锁完整 MBTI 报告");
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#offer-full"
    );
    expect(screen.getAllByTestId("mbti-chapter-unlock-card")).toHaveLength(4);
  });

  it("renders backend-supplied overview variants for the same type when EI strength changes", () => {
    const clearReportData = createReportFixture();
    const strongReportData = createReportFixture();

    const clearOverview = clearReportData.mbti_public_projection_v1?.sections?.find(
      (section) => section.key === "overview"
    ) as Record<string, unknown> | undefined;
    const strongOverview = strongReportData.mbti_public_projection_v1?.sections?.find(
      (section) => section.key === "overview"
    ) as Record<string, unknown> | undefined;

    if (!clearOverview || !strongOverview) {
      throw new Error("Expected overview sections in projection fixture");
    }

    const strongProjectionMeta = strongReportData.mbti_public_projection_v1?._meta as Record<string, unknown> | undefined;
    const strongProjectionPersonalization = strongProjectionMeta?.personalization as Record<string, unknown> | undefined;
    const strongReportMeta = strongReportData.report?._meta as Record<string, unknown> | undefined;
    const strongReportPersonalization = strongReportMeta?.personalization as Record<string, unknown> | undefined;

    for (const personalization of [strongProjectionPersonalization, strongReportPersonalization]) {
      if (!personalization) {
        continue;
      }

      (personalization.axis_bands as Record<string, string>).EI = "strong";
      (personalization.axis_vector as Record<string, Record<string, unknown>>).EI = {
        ...((personalization.axis_vector as Record<string, Record<string, unknown>>).EI ?? {}),
        pct: 77,
        delta: 27,
        state: "strong",
        band: "strong",
      };
      (personalization.variant_keys as Record<string, string>).overview =
        "overview:EI.E.strong:identity.T:boundary.TF";
    }

    const strongOverviewPayload = strongOverview.payload as Record<string, unknown>;
    const strongOverviewBlocks = strongOverviewPayload.blocks as Array<Record<string, unknown>>;
    strongOverviewBlocks[1] = {
      ...strongOverviewBlocks[1],
      id: "overview.axis_strength.EI.E.strong",
      text: "在能量方向上，你的外倾偏好已经很鲜明。你通常不会先停在中间，而会自然把注意力和行动拉向这一侧。",
    };
    (strongOverviewPayload.personalization as Record<string, unknown>).variant_key =
      "overview:EI.E.strong:identity.T:boundary.TF";
    (strongOverviewPayload.personalization as Record<string, unknown>).selected_blocks = [
      "overview.axis_strength.EI.E.strong",
      "overview.scene.EI.E",
      "overview.identity.t",
      "overview.boundary.TF",
    ];
    strongOverview._meta = {
      ...((strongOverview._meta as Record<string, unknown> | undefined) ?? {}),
      variant_key: "overview:EI.E.strong:identity.T:boundary.TF",
    };

    const { unmount } = render(<RichResultReport locale="zh" reportData={clearReportData} />);

    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveAttribute(
      "data-variant-key",
      "overview:EI.E.clear:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveTextContent(
      "你已经呈现出稳定的外倾倾向"
    );

    unmount();

    render(<RichResultReport locale="zh" reportData={strongReportData} />);

    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveAttribute(
      "data-variant-key",
      "overview:EI.E.strong:identity.T:boundary.TF"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).toHaveTextContent(
      "你的外倾偏好已经很鲜明"
    );
    expect(screen.getByTestId("mbti-projection-section-overview")).not.toHaveTextContent(
      "你已经呈现出稳定的外倾倾向"
    );
  });
});
