import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/result/attempt-123",
}));

describe("RichResultReport", () => {
  it("renders only report-source free content for MBTI and does not leak gated sections", () => {
    const reportData = structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
    expect(reportData.cta).toMatchObject({
      visible: true,
      kind: "upsell",
      target_sku: "MBTI_REPORT_FULL",
      target_sku_effective: "MBTI_REPORT_FULL_199",
    });
    expect(Array.isArray(reportData.report?.recommended_reads)).toBe(true);
    expect(reportData.report?.layers?.identity).toMatchObject({
      title: "竞选者型 · 敏锐版",
      one_liner: "你的人格主轴是先看到人与机会之间尚未被点亮的连接。",
    });

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByRole("heading", { name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByText("费马人格档案")).toBeInTheDocument();
    expect(screen.getByText("浪漫热情但易纠结的灵感派")).toBeInTheDocument();
    expect(screen.getByText(/约 6–8%/)).toBeInTheDocument();
    expect(screen.getByText("热情")).toBeInTheDocument();
    expect(screen.getByText("高敏感")).toBeInTheDocument();
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

    expect(screen.getAllByTestId("locked-module-card")).toHaveLength(4);
    expect(screen.getAllByText("解锁后你将获得")).toHaveLength(4);
    expect(screen.queryByTestId("locked-insight-preview")).not.toBeInTheDocument();
    expect(screen.queryByText("你的优势：执行推进力")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Content pack did not provide enough matched cards. Showing a safe fallback tip.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Turn strengths into a repeatable template")).not.toBeInTheDocument();

    expect(screen.getAllByText("完整人格报告").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("职业道路模块").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("关系解读模块").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("E / I")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "分享结果" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "重新测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.queryByText("解锁完整 MBTI 报告")).not.toBeInTheDocument();
    expect(screen.queryByText("查看更完整的人格层、成长路线、关系洞察与推荐阅读。")).not.toBeInTheDocument();
    expect(screen.queryByText("你的人格主轴是先看到人与机会之间尚未被点亮的连接。")).not.toBeInTheDocument();
    expect(screen.queryByText("Prefers explicit roles and reviewable workflows.")).not.toBeInTheDocument();
    expect(screen.queryByText("Reliable operator")).not.toBeInTheDocument();
  });
});
