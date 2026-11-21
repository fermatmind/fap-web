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
  it("offers three attributed sources and keeps all three prompts manually copyable", () => {
    render(<ResultEvidenceAndPrompts />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getAllByRole("textbox", { hidden: true })).toHaveLength(3);
    expect(screen.getByText(/不等于费马题本、分数/)).toBeInTheDocument();
    expect(screen.getByText(/不会自动把报告发送给 AI/)).toBeInTheDocument();
  });

  it("copies the selected prompt with concrete context and a request to ask before advising", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ResultEvidenceAndPrompts />);
    fireEvent.click(screen.getByRole("button", { name: /复制提示词\s*：职业探索/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toContain("请先问我 3 个问题");
    expect(writeText.mock.calls[0][0]).toContain("一次低成本试做");
    expect(await screen.findByText(/^已复制。/)).toBeInTheDocument();
  });

  it("retains selectable text and explains manual copying when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ResultEvidenceAndPrompts />);
    fireEvent.click(screen.getByRole("button", { name: /复制提示词\s*：职业探索/ }));
    expect(await screen.findByText(/未能自动复制/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /职业探索/ })).toHaveAttribute("readonly");
  });
});
