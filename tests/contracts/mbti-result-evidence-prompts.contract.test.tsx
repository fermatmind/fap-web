import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultEvidenceAndPrompts } from "@/app/(localized)/[locale]/(app)/dev/mbti-direct-result/ResultEvidenceAndPrompts";

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
afterEach(() => {
  if (clipboardDescriptor) Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
  vi.restoreAllMocks();
});

describe("MBTI preview evidence and AI prompts", () => {
  it("shows the illustrated career prompt without removed sections", () => {
    render(<ResultEvidenceAndPrompts />);
    expect(screen.getByTestId("mbti-ai-prompt-text")).toBeVisible();
    expect(screen.queryByRole("button", { name: /查看提示词/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "与AI探索人生" })).toBeInTheDocument();
    expect(screen.queryByText(/科学依据/)).not.toBeInTheDocument();
    expect(screen.queryByText(/个人成长：/)).not.toBeInTheDocument();
    expect(screen.queryByText(/关系沟通：/)).not.toBeInTheDocument();
    expect(screen.queryByText(/不会自动把报告发送给 AI/)).not.toBeInTheDocument();
    expect(document.querySelector('img')?.getAttribute("src")).toContain("/ai-conversation/isfj.webp");
    expect(screen.getByRole("link", { name: /付费.*下载完整PDF/ })).toHaveAttribute("href", "https://fermatmind.com/zh/history/mbti");
  });

  it("copies the selected prompt with concrete context and a request to ask before advising", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ResultEvidenceAndPrompts />);
    fireEvent.click(screen.getByRole("button", { name: "复制 AI 对话提示词" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toContain("请先问我 3 个问题");
    expect(writeText.mock.calls[0][0]).toContain("一次低成本试做");
    expect(writeText.mock.calls[0][0]).toBe(screen.getByTestId("mbti-ai-prompt-text").textContent);
    expect(await screen.findByRole("button", { name: "已复制" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("retains selectable text and explains manual copying when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ResultEvidenceAndPrompts />);
    fireEvent.click(screen.getByRole("button", { name: "复制 AI 对话提示词" }));
    expect(await screen.findByText(/未能自动复制/)).toBeInTheDocument();
    expect(screen.getByTestId("mbti-ai-prompt-text")).toBeVisible();
  });
});
