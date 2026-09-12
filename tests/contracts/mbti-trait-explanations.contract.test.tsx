import { fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { fetchMbtiTraitCatalog, MBTI_TRAIT_AXES, parseMbtiTraitCatalog, selectMbtiTraitEntry } from "@/lib/cms/mbti-trait-explanations";
import { useMbtiTraitCatalog } from "@/components/result/mbti/clone/useMbtiTraitCatalog";
import { MbtiCloneTraitsSection } from "@/components/result/mbti/clone/MbtiCloneTraitsSection";
import { traitCatalogResponse } from "@/tests/fixtures/mbti-trait-catalog";
vi.mock("@/lib/api-client", () => ({ apiClient: { get: vi.fn() } }));
const get = vi.mocked(apiClient.get);
const catalog = parseMbtiTraitCatalog(traitCatalogResponse())!;
const props = {
  locale: "zh" as const, title: "人格特质", illustrationSlotId: "traits-illustration" as const, illustrationLabel: "",
  dimensions: MBTI_TRAIT_AXES.map((axis) => ({ axisCode: axis, dominantPole: axis[1], dominantPct: 67, leftCode: axis[0], rightCode: axis[1],
    leftPole: axis === "EI" ? "外倾" : axis[0], rightPole: axis === "EI" ? "内倾" : axis[1], dominantLabel: axis === "EI" ? "内倾" : axis[1],
    summary: "Old generic A", strengthBand: "clear" })),
  summaryTitleFallback: "", summaryValueFallback: "", summaryLabelFallback: "", summaryDescriptionFallback: "Old fallback A",
  summarySlotId: "traits-summary-illustration" as const, summarySlotLabel: "", paragraphs: ["Unchanged chapter body"], bodySource: "traits" as const, tools: [],
  traitCatalog: catalog,
};
beforeEach(() => get.mockReset());

describe("backend-owned MBTI trait editorial bands", () => {
  it("covers every displayed integer for all ten poles, with shared tie content", () => {
    for (const axis of MBTI_TRAIT_AXES) for (const pole of axis) for (let score = 50; score <= 100; score++) {
      const entry = selectMbtiTraitEntry(catalog, axis, pole, score);
      expect(entry?.axis_code).toBe(axis);
      expect(entry?.pole).toBe(score === 50 ? "balanced" : pole);
      expect(entry?.min).toBe(score === 50 ? 50 : score < 60 ? 51 : score === 100 ? 90 : Math.floor(score / 10) * 10);
    }
    expect(selectMbtiTraitEntry(catalog, "EI", "I", 59.5)?.min).toBe(60);
  });
  it.each([undefined, null, NaN, Infinity, "67", 49.9, 100.1])("rejects an invalid score %s instead of clamping or inventing a reading", (score) => {
    expect(selectMbtiTraitEntry(catalog, "EI", "I", score)).toBeNull();
  });
  it("rejects incompatible/missing/overlapping content and incorrect identities", () => {
    for (const override of [{ locale: "en" }, { schema: "v2" }, { revision: 0 }, { content_hash: "bad" }, { entries: [] }, { ok: false }]) {
      expect(parseMbtiTraitCatalog({ ...traitCatalogResponse(), ...override })).toBeNull();
    }
    for (const override of [{ min: 52 }, { max: 60 }, { pole: "N" }, { a: "" }]) {
      const payload = traitCatalogResponse(); Object.assign(payload.entries[1], override);
      expect(parseMbtiTraitCatalog(payload)).toBeNull();
    }
    expect(selectMbtiTraitEntry(catalog, "EI", "N", 67)).toBeNull();
    expect(selectMbtiTraitEntry(catalog, "XX", "X", 67)).toBeNull();
  });
  it("requires all 32 distinct type variants with exactly two paragraphs", () => {
    expect(catalog.overviews).toHaveLength(32);
    for (const invalid of [[], catalog.overviews.slice(1), [...catalog.overviews.slice(1), catalog.overviews[1]],
      [{ ...catalog.overviews[0], paragraphs: ["one"] }, ...catalog.overviews.slice(1)]]) {
      expect(parseMbtiTraitCatalog({ ...traitCatalogResponse(), overviews: invalid })).toBeNull();
    }
  });
  it("keeps the colored percentage and pole together below the axis caption", () => {
    render(<MbtiCloneTraitsSection {...props} />);
    const pane = screen.getByTestId("mbti-traits-summary-pane");
    const value = within(pane).getByText("67%");
    expect(value).toHaveStyle({ color: "#4D9FC1" });
    expect(value.parentElement).toContainElement(within(pane).getByText("内向"));
    expect(value.closest("header")).toContainElement(within(pane).getByText("能量"));
  });
  it("reads the Chinese public API without auth", async () => {
    get.mockResolvedValueOnce(traitCatalogResponse());
    expect(await fetchMbtiTraitCatalog()).toEqual(catalog);
    expect(get).toHaveBeenCalledWith("/v0.5/personality/mbti/trait-explanations?locale=zh-CN", expect.objectContaining({ locale: "zh", skipAuth: true }));
  });
  it("switches both paragraphs and all five requested headings without legacy meta", () => {
    render(<MbtiCloneTraitsSection {...props} />);
    const pane = screen.getByTestId("mbti-traits-summary-pane");
    expect(within(pane).getByText("内向")).toBeInTheDocument();
    expect(screen.queryByText("外倾")).not.toBeInTheDocument();
    for (const [index, axis] of MBTI_TRAIT_AXES.entries()) {
      fireEvent.click(screen.getByTestId(`mbti-traits-axis-${axis}`));
      expect(within(pane).getByText(["能量", "心智", "天性", "应对方式", "身份特征"][index])).toBeInTheDocument();
      expect(screen.getByTestId("mbti-trait-a")).toHaveTextContent(`${axis} ${axis[1]} 60 A`);
      expect(screen.getByTestId("mbti-trait-b")).toHaveTextContent(`${axis} ${axis[1]} 60 B`);
      expect(pane).not.toHaveTextContent("清晰倾向");
      expect(pane).not.toHaveTextContent("Old generic");
    }
    expect(screen.getByText("Unchanged chapter body")).toBeInTheDocument();
  });
  it("updates the range and direction without retaining the prior pair", () => {
    const { rerender } = render(<MbtiCloneTraitsSection {...props} />);
    for (const score of [50, 51, 59, 60, 69, 70, 79, 80, 89, 90, 100]) {
      const dimensions = [{ ...props.dimensions[0], dominantPct: score, dominantPole: "E" }];
      rerender(<MbtiCloneTraitsSection {...props} dimensions={dimensions} />);
      expect(screen.getByTestId("mbti-trait-a")).toHaveTextContent(selectMbtiTraitEntry(catalog, "EI", "E", score)!.a);
      expect(screen.getByTestId("mbti-trait-b")).toHaveTextContent(selectMbtiTraitEntry(catalog, "EI", "E", score)!.b);
    }
  });
  it("distinguishes loading, unavailable and English legacy rendering", () => {
    const { rerender } = render(<MbtiCloneTraitsSection {...props} traitCatalog={null} traitCatalogPending />);
    expect(screen.getByTestId("mbti-trait-editorial")).toHaveAttribute("data-content-status", "loading");
    rerender(<MbtiCloneTraitsSection {...props} traitCatalog={null} />);
    expect(screen.getByTestId("mbti-trait-editorial")).toHaveAttribute("data-content-status", "unavailable");
    expect(screen.queryByText("Old generic A")).not.toBeInTheDocument();
    rerender(<MbtiCloneTraitsSection {...props} locale="en" traitCatalog={null} />);
    expect(screen.getByText("Old generic A")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-trait-editorial")).not.toBeInTheDocument();
  });
  it("does not fetch English content, and exposes Chinese API failure", async () => {
    const en = renderHook(() => useMbtiTraitCatalog("en"));
    expect(get).not.toHaveBeenCalled(); en.unmount();
    get.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useMbtiTraitCatalog("zh"));
    expect(result.current.pending).toBe(true);
    await waitFor(() => expect(result.current.unavailable).toBe(true));
    expect(result.current.content).toBeNull();
  });
});
