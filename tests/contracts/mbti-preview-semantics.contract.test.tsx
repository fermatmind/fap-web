import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-preview-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

function getPrimaryByTestId(testId: string): HTMLElement {
  const [node] = screen.getAllByTestId(testId);
  if (!node) {
    throw new Error(`Missing test id: ${testId}`);
  }

  return node;
}

function createPreviewFixture(modulesPreview: string[] = ["career", "relationships", "core_full"]): ReportResponse {
  const reportData = applyMbtiPhase2Fixture(
    structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse
  );
  const freeFixture = structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
  const projectionSections = reportData.report?.sections as Record<string, unknown> | undefined;
  const freeSections = freeFixture.report?.sections as Record<string, unknown> | undefined;

  if (!projectionSections || !freeSections) {
    throw new Error("Expected MBTI sections in preview fixture");
  }

  projectionSections.growth = structuredClone(freeSections.growth);
  const growthSection = projectionSections.growth as { cards?: Array<Record<string, unknown>> };
  growthSection.cards = [
    ...(Array.isArray(growthSection.cards) ? growthSection.cards : []),
    {
      id: "growth_paid_hidden",
      title: "这个付费卡不应该在 preview 中出现",
      desc: "Paid-only content should remain hidden.",
      access_level: "paid",
      module_code: "core_full",
    },
  ];

  reportData.locked = true;
  reportData.variant = "free";
  reportData.access_level = "free";
  reportData.modules_allowed = ["core_free"];
  reportData.modules_preview = modulesPreview;
  const growthPreviewVisible = modulesPreview.includes("core_full");
  reportData.mbti_preview_v1 = {
    mode: growthPreviewVisible ? "module_preview" : "none",
    modules: modulesPreview,
    sections: growthPreviewVisible
      ? [
          {
            key: "growth",
            module_code: "core_full",
            has_preview_content: true,
            visible_preview_cards: [
              {
                id: "growth_preview_dto_1",
                title: "你的成长主线：把强项做成可复用资产",
                body: "先把已经稳定出现的强项沉淀成自己的方法，再逐步扩展到更复杂的场景。",
                bullets: ["把优势写成流程", "优先选择可复用的增长动作"],
                tips: ["先从一周内能重复执行的动作开始"],
                tags: ["Growth", "Preview"],
                module_code: "core_full",
                access_level: "preview",
              },
            ],
            has_locked_remainder: true,
          },
        ]
      : [],
  };

  return reportData;
}

describe("MBTI preview semantics contract", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("renders preview cards inside MBTI chapters when the preview module is allowed", () => {
    render(<RichResultReport locale="zh" reportData={createPreviewFixture()} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");
    const previewSurface = screen.getByTestId("mbti-chapter-preview-growth");

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(previewSurface).toBeInTheDocument();
    expect(within(previewSurface).getByText("你的成长主线：把强项做成可复用资产")).toBeInTheDocument();
    expect(screen.queryByText("这个付费卡不应该在 preview 中出现")).not.toBeInTheDocument();
    expect(within(growthChapter).queryByTestId("mbti-chapter-unlock-card")).not.toBeInTheDocument();
    expect(within(growthChapter).getByText("部分预览已开放")).toBeInTheDocument();
    expect(within(growthChapter).queryByText("解锁后重点")).not.toBeInTheDocument();
  });

  it("prefers mbti_preview_v1 even when the raw section no longer carries preview cards", () => {
    const reportData = createPreviewFixture();
    const sections = reportData.report?.sections as Record<string, unknown> | undefined;
    const growthSection = sections?.growth as { cards?: Array<Record<string, unknown>> } | undefined;

    if (!growthSection) {
      throw new Error("Expected growth section in MBTI fixture");
    }

    growthSection.cards = growthSection.cards?.filter((card) => card.access_level !== "preview") ?? [];

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");
    const previewSurface = screen.getByTestId("mbti-chapter-preview-growth");

    expect(previewSurface).toBeInTheDocument();
    expect(within(previewSurface).getByText("你的成长主线：把强项做成可复用资产")).toBeInTheDocument();
    expect(within(growthChapter).queryByTestId("mbti-chapter-unlock-card")).not.toBeInTheDocument();
    expect(within(growthChapter).getByText("部分预览已开放")).toBeInTheDocument();
    expect(within(growthChapter).queryByText("解锁后重点")).not.toBeInTheDocument();
  });

  it("keeps the teaser path when the preview module does not match", () => {
    render(<RichResultReport locale="zh" reportData={createPreviewFixture(["career"])} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");

    expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-chapter-unlock-card")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
  });
});
