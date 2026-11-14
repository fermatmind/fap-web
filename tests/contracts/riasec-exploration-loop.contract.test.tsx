import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";
import samples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";
import { ResultExportPanel } from "@/components/result-export/ResultExportPanel";
import { RESULT_EXPORT_PROMPTS } from "@/lib/result-export/prompts";
import { buildRiasecResultExport } from "@/lib/riasec/exportAdapter";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));

describe("RIASEC interest to trial loop", () => {
  it("shows one prompt card after the report and copies only the RIASEC prompt", async () => {
    const report = { riasec_public_projection_v2: samples["en-60"] } as unknown as ReportResponse;
    const vm = assembleRiasecResultViewModel(report, "en");
    render(<div data-result-visible-root>
      <RiasecResultShell locale="en" viewModel={vm} />
      <ResultExportPanel projection={buildRiasecResultExport(report, "en")!} locale="en" />
    </div>);
    const panel = screen.getByTestId("result-export-panel");
    const reader = screen.getByTestId("riasec-reading-report");
    expect(reader.compareDocumentPosition(panel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(within(reader).queryByRole("button", { name: "Explore your results with AI" })).toBeNull();
    expect(within(panel).getByRole("heading", { name: "Explore your career interests with AI" })).toBeVisible();
    expect(within(panel).queryByRole("button", { name: /Unlock|PDF/ })).toBeNull();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", Object.create(navigator, { clipboard: { value: { writeText } } }));
    try {
      fireEvent.click(within(panel).getByRole("button", { name: "Copy prompt" }));
      await within(panel).findByText("Prompt copied.");
      expect(writeText).toHaveBeenCalledExactlyOnceWith(RESULT_EXPORT_PROMPTS.RIASEC.en);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it.each(["zh-CN-60", "zh-CN-140", "en-60", "en-140"] as const)("keeps %s scores separate from optional personal notes and same-language resources", key => {
    const locale = key.startsWith("zh") ? "zh" : "en";
    const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: samples[key] } as unknown as ReportResponse, locale);
    const before = structuredClone(vm);
    const { unmount } = render(<RiasecResultShell locale={locale} viewModel={vm} />);
    expect(screen.queryByTestId("riasec-form-version")).not.toBeInTheDocument();
    expect(screen.getByTestId("riasec-six-dimension-map")).toHaveTextContent("0–100");
    expect(screen.queryByTestId("riasec-quality-display")).not.toBeInTheDocument();
    const candidates = screen.getByTestId("riasec-profile-careers");
    expect(screen.getByTestId("riasec-six-dimension-map").compareDocumentPosition(candidates)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    const choices = within(candidates).getAllByRole("checkbox");
    fireEvent.click(choices[0]);
    fireEvent.click(choices[1]);
    expect(screen.getByRole("region", { name: locale === "zh" ? "职业比较" : "Career comparison" })).toBeVisible();
    expect(screen.queryByRole("textbox")).toBeNull();
    fireEvent.click(within(candidates).getAllByRole("button", { name: locale === "zh" ? "记录试做" : "Plan a trial" })[0]);
    const note = "  <script>alert(1)</script>\n```\n[goal](https://example.invalid)  ";
    const task = screen.getByLabelText(locale === "zh" ? "我愿意反复做或试做的活动／真实任务" : "An activity or real task I would repeat or try");
    fireEvent.change(task, { target: { value: note } });
    const preview = screen.getByLabelText(locale === "zh" ? "本人记录预览（可选择后手动复制）" : "My record preview (select to copy manually)");
    expect((preview as HTMLTextAreaElement).value).toContain(note);
    expect(document.querySelector("script")).toBeNull();
    expect(vm).toEqual(before);
    const next = screen.getByTestId("riasec-career-next-steps");
    for (const link of within(next).getAllByRole("link")) {
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        expect(document.getElementById(href.slice(1))).toBeInTheDocument();
      } else {
        expect(href).toMatch(new RegExp(`^/${locale}/`));
      }
    }
    expect(next).not.toHaveTextContent(/仅支持工业设计师|industrial designers, graphic designers and architects only/);
    unmount();
    render(<RiasecResultShell locale={locale} viewModel={vm} />);
    expect(screen.queryByRole("textbox")).toBeNull();
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
