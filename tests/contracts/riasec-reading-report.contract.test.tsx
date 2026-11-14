import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { canonicalReport } from "./fixtures/riasec/canonicalReport";
import backendSamples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";
import profileSamples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-profile-samples.json";
import ecrSample from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/ecr-sample.json";
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

function summaryModel(sampleKey: "zh-CN-60" | "zh-CN-140", nearTie = true) {
  const source = structuredClone(backendSamples[sampleKey]);
  if (nearTie) {
    source.scores.dimensions.find((item) => item.code === "S")!.score = 70;
    Object.assign(source.interpretation_state.tie_display_v1, {
      kind: "near_tie",
      position: "top2_top3_near_tie",
      dimensions: ["A", "S"],
      groups: [],
      alternate_codes: ["ISA"],
      display_copy: {
        headline: "IAS",
        note: "这些维度分数接近，不宜据此强调先后顺序。",
        boundary: source.interpretation_state.alternate_code.display_boundary,
      },
    });
  }
  return assembleRiasecResultViewModel(
    {
      scale_code: "RIASEC",
      type_code: "IAS",
      riasec_public_projection_v2: source,
    } as unknown as ReportResponse,
    "zh",
  );
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

  it("uses the measured ECR profile in the 60-item portrait without repeating summary highlights", () => {
    const vm = assembleRiasecResultViewModel({
      scale_code: "RIASEC",
      type_code: "ECR",
      riasec_public_projection_v2: ecrSample,
    } as unknown as ReportResponse, "zh");
    render(<RiasecResultShell locale="zh" viewModel={vm} />);

    const hero = within(screen.getByTestId("riasec-trusted-result-card"));
    expect(hero.getByRole("heading", { name: /^企业型$/ })).toBeVisible();
    expect(hero.getByText("ECR（并列：R/S）", { exact: true })).toBeVisible();
    expect(hero.getByText(vm.resultSummary!.tieNote)).toBeVisible();

    const conventional = vm.resultSummary!.highlights.find(item => item.dimensionCode === "C")!;
    expect(hero.queryByText(conventional.text)).not.toBeInTheDocument();
    expect(screen.queryByText(conventional.text)).not.toBeInTheDocument();
    expect(screen.getByTestId("riasec-dimension-R")).toHaveTextContent("47.5");
    expect(screen.getByTestId("riasec-dimension-S")).toHaveTextContent("47.5");

    const sidebar = within(screen.getByTestId("riasec-report-sidebar"));
    const insight = sidebar.getByTestId("riasec-dimension-insight");
    expect(insight).toBeVisible();
    expect(insight).toHaveTextContent("E ·");
    fireEvent.click(screen.getByTestId("riasec-dimension-S"));
    expect(insight).toHaveTextContent("S ·");
  });

  it("keeps the original dimension insight and renders the separate 60-item atlas reading", () => {
    const vm = summaryModel("zh-CN-60", false);
    render(<RiasecResultShell locale="zh" viewModel={vm} />);

    fireEvent.mouseEnter(screen.getByTestId("riasec-dimension-R"));
    const insight = within(screen.getByTestId("riasec-dimension-insight"));
    expect(insight.getByRole("heading", { name: "R · 现实型" })).toBeVisible();
    expect(insight.queryByRole("heading", { name: "下一步" })).not.toBeInTheDocument();

    const card = within(screen.getByRole("heading", { name: /^现实型$/ }).closest("article")!);
    expect(card.getByText("42 分")).toBeVisible();
    expect(card.getByRole("heading", { name: "下一步" })).toBeVisible();
    const slot = vm.deepContentSlots!.slots.find(
      item => item.selection?.dimensionCode === "R",
    )!;
    const reading = String(slot.content[slot.selection!.selectedDetailKey]);
    const atlas = String(slot.content.atlas_reading);
    expect(card.getByText(atlas)).toBeVisible();
    expect(card.queryByText(reading)).not.toBeInTheDocument();
    expect(insight.getByText(reading)).toBeVisible();
    expect(insight.getByText(String(slot.content.core_drive))).toBeVisible();
    expect(insight.queryByText(atlas)).not.toBeInTheDocument();
  });

  it("shows the selected score interval in the sidebar and preserves the independent atlas copy", () => {
    const vm = assembleRiasecResultViewModel({
      scale_code: "RIASEC",
      type_code: "IAS",
      riasec_public_projection_v2: profileSamples.IAS,
    } as unknown as ReportResponse, "zh");
    render(<RiasecResultShell locale="zh" viewModel={vm} />);

    const insight = within(screen.getByTestId("riasec-dimension-insight"));
    const investigative = vm.deepContentSlots!.slots.find(
      slot => slot.selection?.dimensionCode === "I",
    )!;
    expect(insight.getByText(String(investigative.content.desktop_insight_reading))).toBeVisible();

    fireEvent.mouseEnter(screen.getByTestId("riasec-dimension-R"));
    const realistic = vm.deepContentSlots!.slots.find(
      slot => slot.selection?.dimensionCode === "R",
    )!;
    expect(insight.getByRole("heading", { name: "R · 现实型" })).toBeVisible();
    expect(insight.getByText(String(realistic.content.desktop_insight_reading))).toBeVisible();
    expect(insight.queryByText(String(realistic.content.core_drive))).not.toBeInTheDocument();
    const atlas = within(screen.getByRole("heading", { name: /^现实型$/ }).closest("article")!);
    expect(atlas.getByText(String(realistic.content.atlas_reading))).toBeVisible();
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
      vm.resultSummary!.highlights[0].text,
    );
  });

  it.each(["zh-CN-60", "zh-CN-140"] as const)(
    "preserves result boundaries and alternate reading orders alongside the %s summary",
    (sampleKey) => {
      const vm = summaryModel(sampleKey);
      expect(vm.resultSummary?.boundary).toBeTruthy();
      expect(vm.interpretationState?.tieDisplay?.alternateCodes).toEqual(["ISA"]);
      render(<RiasecResultShell locale="zh" viewModel={vm} />);
      const summary = screen.getByTestId("riasec-result-summary");
      expect(summary).toHaveTextContent(vm.resultSummary!.boundary);
      expect(summary).toHaveTextContent(vm.interpretationState!.tieDisplay!.boundary);
      expect(summary).toHaveTextContent("可同时参考的阅读顺序: ISA");
      expect(summary).not.toHaveTextContent(vm.resultSummary!.nextStep);
    },
  );

  it("keeps near-tie boundaries when the summary is absent and deduplicates equal boundaries", () => {
    const vm = summaryModel("zh-CN-60");
    const boundary = vm.interpretationState!.tieDisplay!.boundary;
    vm.resultSummary!.boundary = boundary;
    const { rerender } = render(<RiasecResultShell locale="zh" viewModel={vm} />);
    expect(within(screen.getByTestId("riasec-result-summary")).getAllByText(boundary)).toHaveLength(1);
    vm.resultSummary = null;
    rerender(<RiasecResultShell locale="zh" viewModel={vm} />);
    expect(within(screen.getByTestId("riasec-result-summary")).getAllByText(boundary)).toHaveLength(1);
    vm.moduleVisibilityPolicy!.modules.find((item) => item.key === "hero_activity_chain")!.visibility = "hidden";
    rerender(<RiasecResultShell locale="zh" viewModel={vm} />);
    expect(screen.queryByTestId("riasec-result-summary")).not.toBeInTheDocument();
  });

  it("shows a backend summary boundary without adding a reading order for a non-tied result", () => {
    const vm = summaryModel("zh-CN-140", false);
    vm.moduleVisibilityPolicy!.modules.find((item) => item.key === "hero_activity_chain")!.visibility = "hidden";
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    const summary = screen.getByTestId("riasec-result-summary");
    expect(summary).toHaveTextContent(vm.resultSummary!.boundary);
    expect(summary).not.toHaveTextContent("可同时参考的阅读顺序");
  });

  it("shows detailed copy after expanding optional reading", () => {
    const vm = model();
    vm.moduleVisibilityPolicy!.modules.find(
      (item) => item.key === "pair_blend",
    )!.visibility = "collapsed";
    render(<RiasecResultShell locale="zh" viewModel={vm} />);
    const text = screen.getByText("Backend fixture pair chemistry.");
    expect(text).not.toBeVisible();
    text.closest("details")!.open = true;
    expect(text).toBeVisible();
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
    expect(screen.getByTestId("riasec-six-dimension-map")).not.toHaveTextContent(vm.resultSummary.tieNote);
    expect(screen.getByTestId("riasec-result-summary")).toHaveTextContent(vm.resultSummary.tieNote);
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
      if (key === "zh-CN-60") {
        const work = report.querySelector("#riasec-combinations")!;
        const action = report.querySelector("#riasec-action-plan")!;
        const methods = screen.getByRole("region", { name: "测评方法与科学依据" });
        const careers = report.querySelector("#riasec-career-next")!;
        expect(careers.compareDocumentPosition(work) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(work.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(work).toHaveTextContent("研究型 × 艺术型");
        const pair = vm.deepContentSlots!.slots.find(slot => slot.state.pair_key === "I_A")!;
        expect(work).toHaveTextContent(String(pair.content.positive_value));
        expect(work).toHaveTextContent("研究型 × 社会型");
        expect(work).toHaveTextContent("艺术型 × 社会型");
        expect(action.querySelectorAll("ol > li")).toHaveLength(4);
        expect(action).toHaveTextContent("入行时，你们最看重哪一种证明");
        expect(report.querySelector("#riasec-activities")).toBeNull();
        expect(within(methods).getByText("六维分数怎么得出")).toBeVisible();
        expect(within(methods).getByRole("link", { name: "查看费马测评方法 →" })).toBeVisible();
      } else {
        expect(report).toHaveTextContent("研究-表达活动组合线索");
        expect(report).toHaveTextContent("定义一个问题");
      }
      const hero = screen.getByTestId("riasec-trusted-result-card");
      expect(hero).not.toHaveTextContent("你的兴趣结果摘要");
      expect(hero).not.toHaveTextContent("作答状态稳定");
      expect(screen.queryByTestId("riasec-form-version")).not.toBeInTheDocument();
      expect(hero).not.toHaveTextContent("RIASEC ·");
      expect(report).not.toHaveTextContent("当前结果没有可渲染的后端活动内容");
    },
  );
});

it("keeps activity advice and occupation examples in optional reading", () => {
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
    expect(element.closest("details")).not.toBeNull();
    expect(element).not.toBeVisible();
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


it("summarizes backend highlights and keeps work preferences visible", () => {
  const vm = assembleRiasecResultViewModel({
    scale_code: "RIASEC", type_code: "IAS",
    riasec_public_projection_v2: backendSamples["zh-CN-140"],
  } as unknown as ReportResponse, "zh");
  render(<RiasecResultShell locale="zh" viewModel={vm} />);
  const summary = screen.getByTestId("riasec-result-summary");
  for (const item of vm.resultSummary!.highlights) expect(summary).toHaveTextContent(item.text);
  expect(summary.querySelectorAll("h2")).toHaveLength(0);
  expect(screen.getByTestId("riasec-dimension-insight")).not.toBeVisible();
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
  expect(within(context).queryByRole("textbox")).not.toBeInTheDocument();
  const focus = within(context).getByRole("button", { name: "独立钻研" });
  fireEvent.click(focus);
  expect(focus).toHaveAttribute("aria-pressed", "true");
  expect(within(context).queryByRole("button", { name: "清空" })).not.toBeInTheDocument();
  expect(within(context).queryByText(/这里记录你主动选择/)).not.toBeInTheDocument();
  fireEvent.click(focus);
  expect(focus).toHaveAttribute("aria-pressed", "false");
  expect(vm.dimensions.map((item) => item.score)).toEqual(originalScores);
});


it("preserves optional backend time plans and hides them with the activity module", () => {
  const source = structuredClone(backendSamples["zh-CN-60"]);
  const plans = { "15min": "Read and try the supplied exercise.", "30min": "Repeat one short round if useful.", "2h": "Stop after a documented revision.", "1week": "Choose two dates for an optional repeat." };
  const firstActivity = source.activity_explorer_v0_1.code_activity_pack.activities[0];
  Object.assign(firstActivity, { action_duration_options: plans });
  const vm = assembleRiasecResultViewModel({ scale_code: "RIASEC", type_code: "IAS", riasec_public_projection_v2: source } as unknown as ReportResponse, "en");
  expect(vm.activityExplorer!.codeActivityPack.activities[0].actionDurationOptions).toEqual(plans);
  const { rerender } = render(<RiasecResultShell locale="en" viewModel={vm} />);
  const visiblePlans = screen.getByTestId("riasec-activity-duration-options");
  visiblePlans.closest("details")!.open = true;
  for (const text of Object.values(plans)) expect(visiblePlans).toHaveTextContent(text);
  for (const label of ["15 minutes", "30 minutes", "2 hours", "1 week"]) expect(within(visiblePlans).getByText(label)).toBeVisible();
  vm.moduleVisibilityPolicy!.modules.find((entry) => entry.key === "activity_explorer")!.visibility = "hidden";
  rerender(<RiasecResultShell locale="en" viewModel={vm} />);
  expect(screen.queryByTestId("riasec-activity-duration-options")).not.toBeInTheDocument();
});
