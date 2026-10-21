import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

const wideTable = "| Date | Question count | Accuracy | Median time | Common error | Strategy rate | State |\n| --- | --- | --- | --- | --- | --- | --- |\n| Example | 10 | 70% | 75 seconds | Premature assumptions | 60% | Average sleep |";

describe("IQ readable Markdown tables", () => {
  it("keeps a wide semantic table in a named keyboard-focusable scroll region", () => {
    render(<div>{renderSimpleMarkdown(wideTable, { locale: "en", scrollableTables: true })}</div>);
    const region = screen.getByRole("region", { name: "Horizontally scrollable table" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(screen.getByRole("table")).toHaveStyle({ minWidth: "1120px", tableLayout: "fixed" });
    expect(screen.getByRole("columnheader", { name: "Median time" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "75 seconds" })).toBeInTheDocument();
  });

  it("fits only the opted-in matrix headers while keeping the XOR table scrollable", () => {
    const matrix = "| Row | First cell | Second cell | Third cell |\n| --- | --- | --- | --- |\n| 3 | ○○○ | ○○○○ | ? |";
    render(<div>{renderSimpleMarkdown(`${matrix}\n\n${wideTable}`, {
      locale: "en", scrollableTables: true,
      compactMatrixHeaders: ["Row", "First cell", "Second cell", "Third cell"],
    })}</div>);
    const [grid, comparison] = screen.getAllByRole("table");
    expect(grid.style.minWidth).toBe("");
    expect(grid).toHaveStyle({ tableLayout: "fixed" });
    expect(screen.getByRole("cell", { name: "○○○○" })).toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("cell", { name: "?" })).toBeInTheDocument();
    expect(comparison).toHaveStyle({ minWidth: "1120px", tableLayout: "fixed" });
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("keeps the existing layout unless the caller opts in", () => {
    render(<div>{renderSimpleMarkdown(wideTable)}</div>);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).not.toHaveAttribute("style");
  });
});
