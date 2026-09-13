import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { canonicalReport } from "./fixtures/riasec/canonicalReport";
import backendSamples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";
import projection from "./fixtures/riasec/deep-copy-v1.projection.json";
import { RichResultReport } from "@/components/result/RichResultReport";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
}));

function model() {
  const vm = assembleRiasecResultViewModel(
    {
      scale_code: "RIASEC",
      type_code: "IAS",
      riasec_public_projection_v2: projection,
    } as unknown as ReportResponse,
    "zh",
  );
  return vm;
}

describe("RIASEC interactive reading experience", () => {
  it("links chart and dimension controls to the selected insight without sorting scores", () => {
    const vm = model();
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    const insight = screen.getByTestId("riasec-dimension-insight");
    expect(insight).toHaveTextContent(`${vm.primaryType} ·`);
    const sidebar = screen.getByTestId("riasec-report-sidebar");
    expect(
      within(sidebar).getByRole("navigation", { name: "报告章节" }),
    ).toBeInTheDocument();
    const originalOrder = vm.dimensions.map((item) => item.code);
    fireEvent.click(screen.getByTestId("riasec-dimension-R"));
    expect(insight).toHaveTextContent("R ·");
    expect(screen.getByTestId("riasec-dimension-R")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const tabs = screen.getByLabelText("选择维度洞察");
    fireEvent.click(within(tabs).getByRole("button", { name: /^I ·/ }));
    expect(insight).toHaveTextContent("I ·");
    expect(vm.dimensions.map((item) => item.code)).toEqual(originalOrder);
  });

  it("omits hidden modules from both content and navigation, including their slots", () => {
    const vm = model();
    vm.moduleVisibilityPolicy!.modules.forEach((item) => {
      item.visibility = "hidden";
    });
    vm.deepContentSlots?.slots.forEach((slot) => {
      if (
        !vm.moduleVisibilityPolicy!.modules.some(
          (module) => module.key === slot.moduleKey,
        )
      ) {
        vm.moduleVisibilityPolicy!.modules.push({
          key: slot.moduleKey,
          visibility: "hidden",
          reason: "backend_hidden",
        });
      }
    });
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    expect(
      screen.queryByTestId("riasec-six-dimension-map"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("riasec-deep-content-slot"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("riasec-dimension-insight"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "报告章节" }),
    ).not.toHaveTextContent("六维解读");
    expect(
      screen.getByRole("navigation", { name: "报告章节" }),
    ).not.toHaveTextContent("活动建议");
  });

  it("retains the independent backend summary when the activity chain is hidden", () => {
    const vm = assembleRiasecResultViewModel(
      {
        scale_code: "RIASEC",
        type_code: "IAS",
        riasec_public_projection_v2: backendSamples["zh-CN-60"],
      } as unknown as ReportResponse,
      "zh",
    );
    vm.moduleVisibilityPolicy!.modules.find(
      (item) => item.key === "hero_activity_chain",
    )!.visibility = "hidden";
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    expect(screen.getByTestId("riasec-result-summary")).toBeVisible();
    expect(screen.getByTestId("riasec-result-summary")).toHaveTextContent(
      vm.resultSummary!.rankingDisplay,
    );
    expect(screen.getByTestId("riasec-result-summary")).toHaveTextContent(
      vm.resultSummary!.nextStep,
    );
  });

  it("shows allowed detailed copy directly without a disclosure button", () => {
    const vm = model();
    vm.moduleVisibilityPolicy!.modules.find(
      (item) => item.key === "pair_blend",
    )!.visibility = "collapsed";
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    const text = screen.getByText("Backend fixture pair chemistry.");
    expect(text).toBeVisible();
    expect(text.closest("details")).toBeNull();
    expect(screen.queryByText("详细解读")).not.toBeInTheDocument();
    expect(screen.getByText("Backend fixture pair boundary.")).toBeVisible();
  });

  it("shows missing interpretation explicitly and keeps tie wording when selecting another dimension", () => {
    const vm = model();
    vm.resultSummary = {
      schemaVersion: "riasec.result_summary.v1",
      locale: "zh-CN",
      estimatedReadSeconds: 180,
      snapshotBound: true,
      snapshotScope: "persisted_result",
      headline: "Backend headline",
      rankingDisplay: "IAS（并列：I/A）",
      tieNote: "这些维度得分相同，顺序不代表高低。",
      qualitySummary: "作答状态稳定",
      highlights: [],
      nextStep: "Backend next step",
      boundary: "Backend boundary",
    };
    vm.deepContentSlots = null;
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    fireEvent.click(screen.getByTestId("riasec-dimension-A"));
    expect(screen.getByTestId("riasec-dimension-insight")).toHaveTextContent(
      "该维度暂无可展示的解读",
    );
    expect(screen.getByTestId("riasec-dimension-insight")).toHaveTextContent(
      vm.resultSummary.tieNote,
    );
    expect(screen.getByTestId("riasec-trusted-result-card")).toHaveTextContent(
      vm.resultSummary.rankingDisplay,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "霍兰德职业兴趣报告",
    );
  });

  it.each(["zh", "en"] as const)(
    "places email at the end and removes the header version and retains action links in %s",
    (locale) => {
      const vm = model();
      vm.formCode = "riasec_60";
      vm.formLabel = "RIASEC 60Q";
      render(
        <RiasecResultShell
          locale={locale}
          viewModel={vm}
          emailRecovery={<div>Email recovery control</div>}
        />,
      );
      expect(
        screen.getByTestId("riasec-trusted-result-card"),
      ).not.toHaveTextContent("60Q");
      expect(
        screen.getByRole("link", {
          name: locale === "zh" ? "保存结果" : "Save result",
        }),
      ).toHaveAttribute("href", "#riasec-email-recovery");
      expect(
        screen.getByText("Email recovery control").closest("section"),
      ).toHaveAttribute("id", "riasec-email-recovery");
      expect(
        screen.getByRole("link", {
          name: locale === "zh" ? "重新测试" : "Retake test",
        }),
      ).toHaveAttribute("href", expect.stringContaining("riasec_60"));
    },
  );

  it("renders all allowed static content without interactive disclosures or sticky navigation", () => {
    render(
      <RiasecResultShell
        locale="zh"
        viewModel={model()}
        displayMode="static"
      />,
    );
    expect(
      screen.queryByTestId("riasec-reading-report"),
    ).not.toBeInTheDocument();
    expect(document.querySelector("details")).toBeNull();
    expect(screen.getByText("Backend fixture pair chemistry.")).toBeVisible();
    expect(screen.getByText("Backend fixture structure title")).toBeVisible();
  });
  it("restores collapse choices after browser printing", () => {
    const vm = model();
    vm.resultSummary = null;
    vm.moduleVisibilityPolicy!.modules.find((item) => item.key === "hero_activity_chain")!.visibility = "collapsed";
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    const info = document.querySelector("details")!;
    info.open = false;
    expect(info.open).toBe(false);
    fireEvent(window, new Event("beforeprint"));
    expect(
      Array.from(document.querySelectorAll("details")).every(
        (detail) => detail.open,
      ),
    ).toBe(true);
    fireEvent(window, new Event("afterprint"));
    expect(info.open).toBe(false);
  });

  it.each([false, true])(
    "shares the renderer with the rich report entry (static=%s)",
    (printSnapshotMode) => {
      render(
        <RichResultReport
          locale="zh"
          printSnapshotMode={printSnapshotMode}
          riasecEmailRecovery={<p>Recovery slot</p>}
          reportData={canonicalReport()}
        />,
      );
      expect(
        screen.getByTestId("riasec-trusted-result-card"),
      ).toBeInTheDocument();
      expect(Boolean(screen.queryByTestId("riasec-reading-report"))).toBe(
        !printSnapshotMode,
      );
      expect(Boolean(screen.queryByText("Recovery slot"))).toBe(
        !printSnapshotMode,
      );
    },
  );
});

describe("backend-generated Chinese reading samples", () => {
  it.each(["zh-CN-60", "zh-CN-140"] as const)(
    "renders canonical Chinese assets in %s",
    (key) => {
      const vm = assembleRiasecResultViewModel(
        {
          scale_code: "RIASEC",
          type_code: "IAS",
          riasec_public_projection_v2: backendSamples[key],
        } as unknown as ReportResponse,
        "zh",
      );
      render(<RiasecResultShell locale="zh" viewModel={vm} />);
      const report = screen.getByTestId("riasec-reading-report");
      expect(report).not.toHaveTextContent("Backend fixture");
      expect(report).toHaveTextContent("研究-表达活动组合线索");
      expect(report).toHaveTextContent("定义一个问题");
      const hero = screen.getByTestId("riasec-trusted-result-card");
      expect(hero).not.toHaveTextContent("你的兴趣结果摘要");
      expect(hero).not.toHaveTextContent("作答状态稳定");
      expect(hero).not.toHaveTextContent("RIASEC ·");
      expect(report).not.toHaveTextContent("当前结果没有可渲染的后端活动内容");
    },
  );
});

it("shows activity advice, occupation examples and report information without disclosure controls", () => {
  const vm = assembleRiasecResultViewModel(
    {
      scale_code: "RIASEC",
      type_code: "IAS",
      riasec_public_projection_v2: backendSamples["zh-CN-140"],
    } as unknown as ReportResponse,
    "zh",
  );
  for (const moduleEntry of vm.moduleVisibilityPolicy!.modules) {
    if (["activity_explorer", "occupation_examples"].includes(moduleEntry.key))
      moduleEntry.visibility = "collapsed";
  }
  render(<RiasecResultShell locale="zh" viewModel={vm} />);
  for (const label of ["查看活动建议", "职业活动例子", "报告信息"])
    expect(screen.queryByText(label, { exact: true })).not.toBeInTheDocument();
  for (const element of [
    screen.getByTestId("riasec-activity-pack"),
    ...screen.getAllByTestId("riasec-occupation-examples"),
  ]) {
    expect(element).toBeVisible();
    expect(element.closest("details")).toBeNull();
  }
  expect(screen.queryByTestId("riasec-measurement-boundary")).not.toBeInTheDocument();
  for (const label of ["140题增强版 · 140 题", "内容修订", "报告快照", "跨表分数对比"])
    expect(screen.queryByText(label, { exact: true })).not.toBeInTheDocument();
  expect(screen.getAllByText("行业研究助理").length).toBeGreaterThan(0);
});

it("keeps the interest map heading and chart expanded without a disclosure", () => {
  const vm = model();
  vm.moduleVisibilityPolicy!.modules.find(
    (entry) => entry.key === "six_dimension_map",
  )!.visibility = "collapsed";
  render(<RiasecResultShell locale="zh" viewModel={vm} />);
  const chart = screen.getByTestId("riasec-six-dimension-map");
  expect(
    within(chart).getByRole("heading", { name: "六维兴趣地图", level: 2 }),
  ).toBeVisible();
  expect(chart.querySelector("details")).toBeNull();
  expect(within(chart).getAllByRole("button")).toHaveLength(6);
  fireEvent.click(screen.getByTestId("riasec-dimension-E"));
  expect(screen.getByTestId("riasec-dimension-insight")).toHaveTextContent(
    "E ·",
  );
});


it("shows backend highlights separately and keeps insight and context copy expanded", () => {
  const vm = assembleRiasecResultViewModel({
    scale_code: "RIASEC", type_code: "IAS",
    riasec_public_projection_v2: backendSamples["zh-CN-140"],
  } as unknown as ReportResponse, "zh");
  render(<RiasecResultShell locale="zh" viewModel={vm} />);
  const summary = screen.getByTestId("riasec-result-summary");
  for (const item of vm.resultSummary!.highlights) {
    const text = within(summary).getByText(item.text);
    expect(text.closest("section")).toHaveTextContent(item.label);
    const link = within(text.closest("section")!).getByRole("link");
    expect(document.querySelector(link.getAttribute("href")!)).not.toBeNull();
  }
  expect(within(summary).getByText(vm.resultSummary!.nextStep)).toBeVisible();
  const insight = screen.getByTestId("riasec-dimension-insight");
  expect(insight.querySelector("details, summary")).toBeNull();
  expect(within(insight).queryByText("维度洞察")).not.toBeInTheDocument();
  expect(within(insight).queryByText("本次解读")).not.toBeInTheDocument();
  const context = document.getElementById("riasec-context")!;
  expect(context.querySelector("details, summary")).toBeNull();
  expect(context.textContent!.length).toBeGreaterThan(100);
  expect(screen.queryByText("增强版分层结果")).not.toBeInTheDocument();
});

it("keeps preference selection and removes the exercise form and navigation", () => {
  const vm = assembleRiasecResultViewModel({ scale_code: "RIASEC", type_code: "IAS", riasec_public_projection_v2: backendSamples["zh-CN-140"] } as unknown as ReportResponse, "zh");
  const originalScores = vm.dimensions.map((item) => item.score);
  render(<RiasecResultShell locale="zh" viewModel={vm} />);
  const context = document.getElementById("riasec-context")!;
  expect(document.getElementById("riasec-notes")).toBeNull();
  expect(document.getElementById("riasec-preference-insight")).toBeNull();
  expect(within(context).getByText("围绕一个问题，独立查资料、比较证据。")).toBeVisible();
  expect(screen.queryByRole("link", { name: "下一步行动" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  const focus = within(context).getByRole("button", { name: "独立钻研" });
  fireEvent.click(focus);
  expect(focus).toHaveAttribute("aria-pressed", "true");
  expect(within(context).queryByRole("button", { name: "清空" })).not.toBeInTheDocument();
  expect(within(context).queryByText(/这里记录你主动选择/)).not.toBeInTheDocument();
  fireEvent.click(focus);
  expect(focus).toHaveAttribute("aria-pressed", "false");
  expect(vm.dimensions.map((item) => item.score)).toEqual(originalScores);
});
