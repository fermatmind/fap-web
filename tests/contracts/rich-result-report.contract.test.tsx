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

    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByRole("heading", { name: /ENFP-T/ })).toBeInTheDocument();
    expect(screen.getByText("敏感火花")).toBeInTheDocument();
    expect(screen.getByText(/约 6–8%/)).toBeInTheDocument();
    expect(screen.getByText("type:ENFP-T")).toBeInTheDocument();
    expect(screen.getByText("role:NF")).toBeInTheDocument();
    expect(screen.queryByText("热情")).not.toBeInTheDocument();

    expect(screen.getByText("优势亮点")).toBeInTheDocument();
    expect(screen.getByText("盲点提醒")).toBeInTheDocument();
    expect(screen.getByText("行动建议")).toBeInTheDocument();
    expect(screen.getAllByText("人格概览").length).toBeGreaterThan(0);
    expect(screen.getAllByText("职业道路").length).toBeGreaterThan(0);
    expect(screen.getAllByText("成长提示").length).toBeGreaterThan(0);
    expect(screen.getAllByText("人际与亲密关系").length).toBeGreaterThan(0);
    expect(screen.queryByText("你的优势：执行推进力")).not.toBeInTheDocument();
    expect(screen.queryByText("你的成长主线：把强项做成可复用资产")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Content pack did not provide enough matched cards. Showing a safe fallback tip.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Turn strengths into a repeatable template")).not.toBeInTheDocument();

    expect(screen.getByText("MBTI Full Report")).toBeInTheDocument();
    expect(screen.getByText("E / I")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View personality profile" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "重新测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.queryByText("Prefers explicit roles and reviewable workflows.")).not.toBeInTheDocument();
    expect(screen.queryByText("Reliable operator")).not.toBeInTheDocument();
  });
});
