import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnneagramPreview } from "@/app/(localized)/[locale]/(app)/dev/enneagram-preview/EnneagramPreview";
import { candidateSectionIds, previewTypes } from "@/app/(localized)/[locale]/(app)/dev/enneagram-preview/previewContent";

describe("isolated Enneagram frontend preview", () => {
  it("contains seven chapters, 28 unique semantic sections and 70 content instances", () => {
    const { container } = render(<EnneagramPreview />);
    expect(container.querySelectorAll("[id^='chapter-']")).toHaveLength(7);
    const sections = [...container.querySelectorAll<HTMLElement>("[data-section-id]")];
    expect(sections).toHaveLength(28);
    expect(new Set(sections.map((section) => section.dataset.sectionId)).size).toBe(28);
    expect(sections.filter((section) => section.dataset.sectionScope === "report")).toHaveLength(7);
    expect(sections.filter((section) => section.dataset.sectionScope === "candidate")).toHaveLength(21);
    expect(screen.getByTestId("enneagram-preview")).toHaveAttribute("data-content-instance-count", "70");
    for (const id of [8, 3, 9] as const) {
      expect(Object.keys(previewTypes[id].sections)).toEqual(candidateSectionIds);
    }
  });

  it("uses one global candidate state without changing shared sections", () => {
    const { container } = render(<EnneagramPreview />);
    fireEvent.click(screen.getAllByRole("button", { name: /3 成就型/ })[0]);
    expect(container.querySelectorAll("[data-section-scope='candidate'][data-reading-type='3']")).toHaveLength(21);
    expect(container.querySelectorAll("[data-section-scope='report']")).toHaveLength(7);
    expect(screen.queryByText(/当前阅读/)).not.toBeInTheDocument();
  });

  it("removes preview annotations and shows the five verification questions directly", () => {
    const { container } = render(<EnneagramPreview />);
    expect(screen.getByRole("heading", { name: "九型人格类型测评结果", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("自我评测")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "你的九型人格测试结果" })).toBeInTheDocument();
    expect(screen.getByText("下图呈现九种人格类型在本次测评中的相对得分分布。扇区的径向长度与得分对应；越向外延伸，说明该类型倾向在本次作答中越突出。")).toBeInTheDocument();
    expect(screen.queryByText("前端设计预览")).not.toBeInTheDocument();
    expect(screen.queryByText("九型人格 · 候选深读报告")).not.toBeInTheDocument();
    expect(screen.queryByText("原创预览样稿 · 待理论审核")).not.toBeInTheDocument();
    expect(screen.queryByText("候选画像 · 需要继续核对")).not.toBeInTheDocument();
    expect(screen.queryByText("TYPE 8")).not.toBeInTheDocument();
    expect(screen.queryByText("核心画像与完整七章均可免费阅读")).not.toBeInTheDocument();
    expect(screen.queryByText("继续阅读 8 挑战型 的完整内容")).not.toBeInTheDocument();
    expect(screen.queryByText("展开五个核对问题")).not.toBeInTheDocument();
    const method = container.querySelector("[class*='method']");
    expect(method?.tagName).toBe("DIV");
    expect(method?.querySelectorAll("li")).toHaveLength(5);
  });

  it("preserves the selected action and user note while switching candidates", () => {
    render(<EnneagramPreview />);
    fireEvent.click(screen.getByRole("button", { name: /在定案前多问一个事实问题/ }));
    const note = screen.getByLabelText(/本次预览会话记录/);
    fireEvent.change(note, { target: { value: "一次具体观察" } });
    fireEvent.click(screen.getAllByRole("button", { name: /9 和平型/ })[0]);
    expect(screen.getByText("当前已选行动 · 来自 8 型建议")).toBeInTheDocument();
    expect(note).toHaveValue("一次具体观察");
  });

  it("provides all three comparison pairs and an always-visible nine-level structure", () => {
    const { container } = render(<EnneagramPreview />);
    fireEvent.click(screen.getAllByRole("button", { name: /候选对照/ })[0]);
    const dialog = screen.getByRole("dialog", { name: "8 型 × 3 型" });
    expect(within(dialog).getByRole("button", { name: "8 型 × 9 型" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "3 型 × 9 型" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "关闭候选对照" }));
    expect(screen.queryByText("展开九层结构样稿")).not.toBeInTheDocument();
    const levels = container.querySelector("#section-6\\.4 [aria-label='九层结构样稿']");
    expect(levels?.querySelectorAll("li")).toHaveLength(9);
    expect(levels?.querySelector("summary")).toBeNull();
    expect(container.querySelectorAll("form")).toHaveLength(0);
  });

  it("does not call backend APIs during reading, switching, comparison or note editing", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<EnneagramPreview />);
    fireEvent.click(screen.getAllByRole("button", { name: /3 成就型/ })[0]);
    fireEvent.change(screen.getByLabelText(/本次预览会话记录/), { target: { value: "local only" } });
    fireEvent.click(screen.getAllByRole("button", { name: /候选对照/ })[0]);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
