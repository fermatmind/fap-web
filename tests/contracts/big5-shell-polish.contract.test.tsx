import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Big5ResultShell } from "@/components/result/big5/Big5ResultShell";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import liveBridgeV2ReportFixture from "@/tests/fixtures/big5/report_live_bridge_v2.projection.json";

function buildAccessProjection(): AttemptReportAccessView {
  return {
    attemptId: "attempt-big5-polish",
    accessState: "ready",
    reportState: "ready",
    pdfState: "ready",
    unlockStage: "full",
    unlockSource: "payment",
    reasonCode: "report_ready",
    accessLevel: "full",
    variant: "full",
    projectionVersion: 1,
    modulesAllowed: ["big5_core", "big5_full", "big5_action_plan"],
    modulesPreview: [],
    actions: {
      pageHref: "/zh/result/attempt-big5-polish",
      pdfHref: "/api/v0.3/attempts/attempt-big5-polish/report.pdf",
      waitHref: null,
      historyHref: "/zh/history/big5",
      lookupHref: "/zh/orders/lookup",
    },
    meta: {
      producedAt: "2026-04-23T00:00:00Z",
      refreshedAt: "2026-04-23T00:00:00Z",
    },
  };
}

function renderPolishedShell() {
  const reportData = structuredClone(liveBridgeV2ReportFixture) as ReportResponse;
  const assembled = assembleBig5ResultViewModel({
    locale: "zh",
    reportData,
    gate: {
      isFreeVariant: false,
      modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
      modulesPreview: new Set(["big5_core"]),
      freeSections: null,
    },
  });

  render(
    <Big5ResultShell
      locale="zh"
      attemptId="attempt-big5-polish"
      reportLocked={false}
      accessProjection={buildAccessProjection()}
      headline={{
        badge: "Big Five",
        typeCode: "O59 / C32 / E20 / A55 / N68",
        displayName: "高敏感 × 克制进入",
        supportingLine: "五维结果已进入完整阅读路径。",
        summary: "第一句 shell 需要保留。第二句不应留在壳层，因为 v2 正文会继续展开。",
        rarity: "标准样本",
      }}
      formSummaryLabel="Big Five · 90 题标准版"
      tags={["高敏感", "克制进入"]}
      dimensions={[]}
      projection={reportData.big5_public_projection_v1 ?? null}
      normsStatus="CALIBRATED"
      qualityLevel="D"
      visibleSections={assembled.visibleSections}
      lockedSections={assembled.lockedSections}
      recommendedOffers={[]}
    />
  );
}

describe("Big Five shell polish contract", () => {
  it("renders a Chinese on-this-page navigation over the existing eight section keys", () => {
    renderPolishedShell();

    const toc = screen.getByTestId("big5-on-this-page");
    expect(within(toc).getByText("本页目录")).toBeInTheDocument();
    expect(within(toc).getByRole("link", { name: "结果摘要" })).toHaveAttribute("href", "#big5-section-hero_summary");
    expect(within(toc).getByRole("link", { name: "行动建议" })).toHaveAttribute("href", "#big5-section-action_plan");
    expect(screen.getByTestId("big5-section-facet_details")).toHaveAttribute("id", "big5-section-facet_details");
    expect(screen.queryByText("Profile Summary")).not.toBeInTheDocument();
    expect(screen.queryByText("Norms Comparison")).not.toBeInTheDocument();
  });

  it("keeps the shell concise while preserving result metadata and the richer v2 body", () => {
    renderPolishedShell();

    expect(screen.getByTestId("big5-shell-concise-summary")).toHaveTextContent("第一句 shell 需要保留。");
    expect(screen.getByTestId("big5-shell-concise-summary")).not.toHaveTextContent("第二句不应留在壳层");
    expect(screen.getByTestId("big5-access-summary")).toBeInTheDocument();
    expect(screen.getByTestId("big5-dimensions")).toBeInTheDocument();
    expect(screen.getByTestId("big5-sections")).toBeInTheDocument();
  });

  it("groups PDF, history, compare, retake, and action anchors into explicit continuation surfaces", () => {
    renderPolishedShell();

    expect(screen.getByTestId("big5-actions-card")).toHaveTextContent("继续怎么用这份结果");
    expect(screen.getByTestId("big5-actions-card")).not.toHaveTextContent("结果之后");
    expect(screen.getByTestId("big5-actions-card")).not.toHaveTextContent("After the report");
    expect(screen.getByTestId("big5-pdf-entry")).toHaveTextContent("保存报告");
    expect(screen.getByTestId("big5-pdf-entry")).toHaveTextContent("PDF 导出已安全暂停");
    expect(within(screen.getByTestId("big5-pdf-entry")).getByRole("button", { name: "PDF 暂不可用" })).toBeDisabled();
    expect(screen.getByTestId("big5-history-entry")).toHaveTextContent("查看历史");
    expect(screen.getByTestId("big5-compare-entry")).toHaveTextContent("对比变化");
    expect(screen.getByTestId("big5-retake-entry")).toHaveTextContent("重新测一次");

    const continuation = screen.getByTestId("big5-continuation-strip");
    expect(within(continuation).getByText("把结果带回真实场景")).toBeInTheDocument();
    expect(screen.getByTestId("big5-action-anchor-entry")).toHaveAttribute("href", "#big5-section-action_plan");
    expect(within(continuation).getByRole("link", { name: /历史轨迹/ })).toHaveAttribute("href", "/zh/history/big5");
    expect(within(continuation).getByRole("link", { name: /对比近两次/ })).toHaveAttribute("href", "/zh/history/big5/compare");
  });
});
