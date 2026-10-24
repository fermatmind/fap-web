import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";
import samples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { buildRiasecResultExport } from "@/lib/riasec/exportAdapter";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));

describe("RIASEC interest to trial loop", () => {
  it("links the summary action to the authorized shared panel with keyboard focus", () => {
    const report = { riasec_public_projection_v2: samples["en-60"] } as unknown as ReportResponse;
    const vm = assembleRiasecResultViewModel(report, "en");
    render(<div data-result-visible-root>
      <RiasecResultShell locale="en" viewModel={vm} />
      <ResultExportPanel projection={buildRiasecResultExport(report, "en")!} locale="en" />
    </div>);
    const panel = screen.getByTestId("result-export-panel");
    const summary = panel.querySelector("summary")!;
    const scroll = vi.fn();
    Object.defineProperty(summary, "scrollIntoView", { value: scroll });
    fireEvent.click(screen.getByRole("button", { name: "Explore your results with AI" }));
    expect(summary).toHaveFocus();
    expect(scroll).toHaveBeenCalledWith({ block: "center" });
    expect((within(panel).getByLabelText("Full export preview") as HTMLTextAreaElement).value).toContain("riasec_60");
  });
  it.each(["zh-CN-60", "zh-CN-140", "en-60", "en-140"] as const)("keeps %s scores separate from optional personal notes and same-language resources", key => {
    const locale = key.startsWith("zh") ? "zh" : "en";
    const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: samples[key] } as unknown as ReportResponse, locale);
    const before = structuredClone(vm);
    const { unmount } = render(<RiasecResultShell locale={locale} viewModel={vm} />);
    expect(screen.getByTestId("riasec-form-version")).toHaveTextContent(vm.formCode!);
    expect(screen.getByTestId("riasec-six-dimension-map")).toHaveTextContent("0–100");
    expect(screen.getByTestId("riasec-quality-display")).toHaveTextContent(vm.resultSummary!.qualitySummary);
    const choice = screen.queryAllByRole("checkbox")[0];
    if (choice) {
      fireEvent.click(choice);
      expect(choice).toBeChecked();
      expect(screen.getByLabelText(locale === "zh" ? "已选活动" : "Selected activities")).toHaveTextContent(vm.activityExplorer!.codeActivityPack.activities[0].activityLabel);
    } else {
      expect(screen.getByTestId("riasec-governed-copy-empty")).toBeVisible();
    }
    const note = "  <script>alert(1)</script>\n```\n[goal](https://example.invalid)  ";
    const task = screen.getByLabelText(locale === "zh" ? "我愿意反复做或试做的活动／真实任务" : "An activity or real task I would repeat or try");
    fireEvent.change(task, { target: { value: note } });
    const preview = screen.getByLabelText(locale === "zh" ? "本人记录预览（可选择后手动复制）" : "My record preview (select to copy manually)");
    expect((preview as HTMLTextAreaElement).value).toContain(note);
    expect(document.querySelector("script")).toBeNull();
    expect(vm).toEqual(before);
    const next = screen.getByTestId("riasec-career-next-steps");
    for (const link of within(next).getAllByRole("link")) {
      expect(link.getAttribute("href")).toMatch(new RegExp(`^/${locale}/`));
      expect(link.getAttribute("href")).not.toContain("?");
    }
    expect(next).toHaveTextContent(locale === "zh" ? "仅支持工业设计师、平面设计师和建筑师" : "industrial designers, graphic designers and architects only");
    unmount();
    render(<RiasecResultShell locale={locale} viewModel={vm} />);
    expect(screen.getByLabelText(locale === "zh" ? "我愿意反复做或试做的活动／真实任务" : "An activity or real task I would repeat or try")).toHaveValue("");
  });

  it("does not fabricate zero for a missing score or expose hidden activity choices", () => {
    const source = structuredClone(samples["en-60"]) as unknown as Record<string, unknown>;
    const scores = source.scores as { dimensions: Array<{ code: string; score?: number }> };
    delete scores.dimensions[0].score;
    const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: source } as unknown as ReportResponse, "en");
    vm.moduleVisibilityPolicy!.modules.find(module => module.key === "activity_explorer")!.visibility = "hidden";
    render(<RiasecResultShell locale="en" viewModel={vm} />);
    expect(screen.getByTestId(`riasec-dimension-${vm.dimensions[0].code}`)).toHaveTextContent("Unknown");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByTestId("riasec-activity-pack")).not.toBeInTheDocument();
  });
});
