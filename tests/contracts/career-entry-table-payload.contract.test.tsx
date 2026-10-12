import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDossierEntryDecisions } from "@/components/career/display/CareerDossierEntryDecisions";
import type { CareerContentV3, CareerContentV3Item } from "@/lib/career/contentV3";

function fixture(locale: "zh" | "en", type: "table" | "matrix") {
  const cells = locale === "zh"
    ? [["审计助理", "复核底稿", "记录差异"], ["财务实习", "核对交易", "保留证据"]]
    : [["Audit assistant", "Review workpapers", "Record differences"], ["Finance intern", "Check transactions", "Retain evidence"]];
  const item: CareerContentV3Item = {
    id: "entry-roles",
    copyKey: "career.item.entry-role-comparison",
    title: locale === "zh" ? "入门岗位" : "Entry roles",
    type,
    availability: "available",
    data: { column_keys: ["role", "tasks", "evidence"], column_labels: locale === "zh" ? ["岗位", "任务", "证据"] : ["Role", "Tasks", "Evidence"], rows: cells },
    factRefs: [],
    sourceRefs: ["reviewed-source"],
  };
  const content: CareerContentV3 = {
    contractVersion: "career.detail.content.v3",
    locale,
    subject: { canonicalSlug: "accountants-and-auditors", name: "Accountants and Auditors", summary: null },
    contentState: "enhanced",
    sourceContentSha256: "a".repeat(64),
    facts: [],
    sources: [{ id: "reviewed-source", name: "Reviewed source", publisher: "Reviewed source", url: "https://example.com/source", details: [], market: null, period: null, evidenceType: null, scope: null, limitation: null, accessedAt: null }],
    blocks: [],
  };
  return { item, content, cells };
}

describe("Career entry decision payload", () => {
  it.each([['zh', 'table'], ['zh', 'matrix'], ['en', 'table'], ['en', 'matrix']] as const)("renders every %s %s value once with accessible row/column headers", (locale, type) => {
    const { item, content, cells } = fixture(locale, type);
    const { container } = render(<CareerDossierEntryDecisions items={[item]} content={content} />);
    const table = screen.getByRole("table");
    expect(container.querySelectorAll("table")).toHaveLength(1);
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(within(table).getAllByRole("rowheader").map(node => node.textContent)).toEqual(cells.map(row => row[0]));
    expect(within(table).getAllByRole("cell").map(node => node.lastElementChild?.textContent)).toEqual(cells.flatMap(row => row.slice(1)));
    for (const value of cells.flat()) expect(screen.getAllByText(value, {exact: true})).toHaveLength(1);
    for (const cell of within(table).getAllByRole("cell")) {
      for (const id of cell.getAttribute("headers")!.split(" ")) expect(document.getElementById(id)).not.toBeNull();
    }
    expect(screen.getByRole("link", {name: "Reviewed source"})).toHaveAttribute("href", "https://example.com/source");
  });

  it("keeps unpublished items out of the single table", () => {
    const {item, content} = fixture("zh", "table");
    render(<CareerDossierEntryDecisions items={[item, {...item, id: "unpublished", availability: "missing", data: {rows: [["DO NOT PUBLISH"]]}}]} content={content} />);
    expect(screen.queryByText("DO NOT PUBLISH")).not.toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
  });

  it("escapes authoritative cell text without creating active markup", () => {
    const {item, content} = fixture("en", "table");
    item.data.rows = [["Literal example", '<script>alert("x")</script>', '<img src=x onerror="alert(1)">']];
    const {container} = render(<CareerDossierEntryDecisions items={[item]} content={content} />);
    expect(screen.getByText('<script>alert("x")</script>', {exact:true})).toBeInTheDocument();
    expect(container.querySelectorAll("script,img")).toHaveLength(0);
  });
});
