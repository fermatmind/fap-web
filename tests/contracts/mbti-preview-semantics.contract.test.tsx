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
    expect(screen.getByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(previewSurface).toBeInTheDocument();
    expect(within(previewSurface).getByText("你的成长主线：把强项做成可复用资产")).toBeInTheDocument();
    expect(screen.queryByText("这个付费卡不应该在 preview 中出现")).not.toBeInTheDocument();
    expect(within(growthChapter).queryByTestId("mbti-chapter-unlock-card")).not.toBeInTheDocument();
    expect(within(growthChapter).getByText("部分预览已开放")).toBeInTheDocument();
  });

  it("keeps the teaser path when the preview module does not match", () => {
    render(<RichResultReport locale="zh" reportData={createPreviewFixture(["career"])} />);

    const growthChapter = screen.getByTestId("mbti-chapter-growth");

    expect(screen.queryByTestId("mbti-chapter-preview-growth")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(within(growthChapter).getByTestId("mbti-chapter-unlock-card")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-comparison")).toBeInTheDocument();
  });
});
