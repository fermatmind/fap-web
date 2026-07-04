import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizTakeHeaderV2 } from "@/components/quiz/QuizTakeHeaderV2";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/marketing/LiveCompletedCounter", () => ({
  LiveCompletedCounter: ({ className, suffix = "" }: { className?: string; suffix?: string }) => (
    <span className={className}>1,201,183{suffix}</span>
  ),
}));

describe("QuizTakeHeaderV2 contract", () => {
  const baseProps = {
    brand: "九型人格测试",
    completedPrefix: "累计测试人数：",
    completedSuffix: "",
    estimatedTimeLabel: "预计用时",
    minutesUnit: "分钟",
    estimatedMinutes: 18,
    progressText: "第 18 题 / 共 144 题",
    current: 18,
    total: 144,
    answered: 18,
  };

  it("can hide the live completed-count row on take flows that should only show progress", () => {
    render(<QuizTakeHeaderV2 {...baseProps} showCompletedCount={false} />);

    expect(screen.getByText("九型人格测试")).toBeInTheDocument();
    expect(screen.getByText("第 18 题 / 共 144 题")).toBeInTheDocument();
    expect(screen.queryByText("过去30天已完成")).not.toBeInTheDocument();
    expect(screen.queryByText("1,049,304")).not.toBeInTheDocument();
    expect(screen.queryByText("次测评")).not.toBeInTheDocument();
  });

  it("renders the backend cumulative total label with the unchanged live completed counter", () => {
    render(
      <QuizTakeHeaderV2
        {...baseProps}
      />
    );

    expect(screen.getByText("累计测试人数：")).toBeInTheDocument();
    expect(screen.getByText("1,201,183+")).toBeInTheDocument();
    expect(screen.queryByText("过去30天已完成")).not.toBeInTheDocument();
    expect(screen.queryByText("次测评")).not.toBeInTheDocument();
    expect(screen.queryByText("返回详情")).not.toBeInTheDocument();
  });
});
