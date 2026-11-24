import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerAssessmentResult } from "@/app/(localized)/[locale]/career/assessment/CareerAssessmentResult";
import { CuratedCareerRecommendations } from "@/components/career/CuratedCareerRecommendations";
import { recommendCuratedRiasecCareers } from "@/lib/career/curatedRiasecRecommendations";
import { RIASEC_DIMENSIONS } from "@/lib/career/riasecSimilarity";
import { assembleRiasecResultViewModel, type RiasecDimension } from "@/lib/riasec/resultAssembler";
import projection from "./fixtures/riasec/deep-copy-v1.projection.json";

const scores = (values: number[]): RiasecDimension[] => RIASEC_DIMENSIONS.map((code, index) => ({
  code, label: code, score: values[index], scoreAvailable: true,
}));
const sampleA = scores([50, 65, 60, 55, 52.5, 40]);
const sampleB = scores([62.5, 55, 37.5, 72.5, 67.5, 75]);

describe("Simplified Chinese curated career results", () => {
  it("renders the two IAS micro trials directly from the signed flat route", () => {
    render(<CuratedCareerRecommendations scores={sampleA} mode="holland" />);
    const routes = within(screen.getByTestId("curated-flat-routes"));
    expect(routes.getAllByRole("listitem")).toHaveLength(2);
    expect(routes.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual([
      "/zh/career/jobs/market-research-analysts",
      "/zh/career/jobs/instructional-coordinators",
    ]);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByTestId("riasec-profile-careers")).toBeNull();
  });

  it("keeps the exact boundary ranked and declines missing or invalid dimensions", () => {
    expect(recommendCuratedRiasecCareers(scores([40, 40, 40, 60, 60, 60])).state).toBe("ranked");
    expect(recommendCuratedRiasecCareers(sampleB.slice(1)).state).toBe("unavailable");
    expect(recommendCuratedRiasecCareers([...sampleB.slice(0, 5), { ...sampleB[5], score: NaN }]).state).toBe("unavailable");
  });

  it("recovers five distinct scenes after unrestricted ranking and keeps remaining specialized scenes accessible", () => {
    render(<CuratedCareerRecommendations scores={sampleB} mode="holland" />);
    const defaults = within(screen.getByTestId("riasec-profile-careers")).getAllByRole("listitem");
    expect(defaults.map(card => within(card).getByRole("heading").textContent)).toEqual([
      "酒店前台接待员", "客服专员", "信贷业务专员", "合规专员", "空乘人员",
    ]);
    expect(defaults.slice(0, 4).every(card => card.dataset.tier === "broad_mainstream")).toBe(true);
    expect(defaults[4]).toHaveTextContent("垂直赛道 / 特定门槛");
    const details = screen.getByText("更多高相关垂直方向（展开查看）").closest("details");
    expect(details).not.toHaveAttribute("open");
    const more = [...screen.getByTestId("curated-more-careers").querySelectorAll("li[data-scene]")];
    expect(more[0]).toHaveTextContent("殡仪服务安排人员");
    expect(more.every(card => card.getAttribute("data-tier") === "specialized_track")).toBe(true);
    const scenes = [...defaults, ...more].map(card => card.getAttribute("data-scene"));
    expect(new Set(scenes).size).toBe(scenes.length);
  });

  it("keeps Career94 overview and unlocked comparison distinct and renders actual evidence for both selected careers", () => {
    const model = assembleRiasecResultViewModel({ riasec_public_projection_v2: projection }, "zh");
    model.dimensions = sampleB;
    model.scoreKind = "dimension_scores_0_100";
    if (model.trustedResultCard) model.trustedResultCard.qualityState = "normal";
    if (model.interpretationState) model.interpretationState.readingStrength = "standard";
    const { rerender } = render(<CareerAssessmentResult model={model} locale="zh" />);
    expect(screen.getByTestId("riasec-profile-careers")).toBeVisible();
    expect(screen.queryByRole("region", { name: "职业比较" })).toBeNull();
    rerender(<CareerAssessmentResult model={model} locale="zh"
      premium={{ dimensions: [], preferences: [], actions: [], ai_prompt: "继续探索", condition_note: "核对条件" }} />);
    const comparison = within(screen.getByRole("region", { name: "职业比较" }));
    expect(comparison.getAllByRole("heading", { level: 4 }).map(heading => heading.textContent)).toEqual([
      "日常任务", "工作方式", "工作条件", "还需向雇主核实的信息",
    ]);
    const ranked = recommendCuratedRiasecCareers(sampleB);
    if (ranked.state !== "ranked") throw new Error("Expected ranked careers");
    for (const career of ranked.top.slice(0, 2)) {
      for (const field of career.comparison_facets.unknown_fields) expect(comparison.getAllByText(field).length).toBeGreaterThan(0);
      for (const facet of [career.comparison_facets.tasks, career.comparison_facets.work_style, career.comparison_facets.work_conditions]) {
        for (const item of facet) expect(comparison.getAllByText(item.text)[0].closest("li")).toHaveTextContent(item.status);
      }
    }
    expect(comparison.getByRole("link", { name: "打开职业对比工具 →" })).toHaveAttribute("href", "/zh/career/compare");
    expect(screen.getByRole("region", { name: "职业比较" })).not.toHaveTextContent(/[%％]/);
    fireEvent.click(screen.getByRole("checkbox", { name: "加入比较：客服专员" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "加入比较：信贷业务专员" }));
    expect(screen.getByRole("region", { name: "职业比较" })).toHaveTextContent("信贷业务专员");
    rerender(<CareerAssessmentResult model={model} locale="en" />);
    expect(document.querySelector("[data-curated-state]")).toBeNull();
  });
});
