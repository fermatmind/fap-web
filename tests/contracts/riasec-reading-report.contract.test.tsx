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
    const vm = assembleRiasecResultViewModel({ scale_code: "RIASEC", type_code: "IAS", riasec_public_projection_v2: backendSamples["zh-CN-60"] } as unknown as ReportResponse, "zh");
    vm.moduleVisibilityPolicy!.modules.find((item) => item.key === "hero_activity_chain")!.visibility = "hidden";
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    expect(screen.getByTestId("riasec-result-summary")).toBeVisible();
    expect(screen.getByTestId("riasec-result-summary")).toHaveTextContent(vm.resultSummary!.rankingDisplay);
    expect(screen.getByTestId("riasec-result-summary")).toHaveTextContent(vm.resultSummary!.nextStep);
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
    render(<RiasecResultShell locale="zh" viewModel={model()} />);
    const info = screen.getByText("报告信息").closest("details")!;
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
