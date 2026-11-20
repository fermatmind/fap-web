import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RiasecReadingReport } from "@/components/result/riasec/RiasecReadingReport";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";
import samples from "@/app/(localized)/[locale]/(app)/dev/riasec-reading/backend-samples.json";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
afterEach(cleanup);
function model() {
  const source = structuredClone(samples["zh-CN-60"]);
  const vm = assembleRiasecResultViewModel({ scale_code: "RIASEC", riasec_public_projection_v2: source } as unknown as ReportResponse, "zh");
  for (const slot of vm.deepContentSlots?.slots ?? []) if (slot.selection?.dimensionCode) {
    const code = slot.selection.dimensionCode;
    slot.content.atlas_examples = Array.from({ length: 4 }, (_, i) => `${code} activity ${i}`);
    slot.content.atlas_next_steps = Array.from({ length: 4 }, (_, i) => `${code} next ${i}`);
    slot.content.desktop_insight_questions = Array.from({ length: 3 }, (_, i) => `${code} check ${i}`);
  }
  return vm;
}
describe("Score-bound RIASEC reading depth", () => {
  it("renders all four backend activities and actions and switches the three insight prompts without changing scores", () => {
    const vm = model();
    const before = structuredClone(vm);
    const { container } = render(<RiasecReadingReport viewModel={vm} locale="zh" actions={null} />);
    for (const code of ["R", "I", "A", "S", "E", "C"]) {
      const card = container.querySelector(`#riasec-reading-${code}`)!;
      for (let i = 0; i < 4; i++) {
        expect(within(card as HTMLElement).getByText(`${code} activity ${i}`)).toBeInTheDocument();
        expect(within(card as HTMLElement).getByText(`${code} next ${i}`)).toBeInTheDocument();
      }
    }
    fireEvent.click(screen.getByTestId("riasec-dimension-R"));
    const insight = within(screen.getByTestId("riasec-dimension-insight"));
    expect(insight.getAllByRole("listitem")).toHaveLength(3);
    expect(insight.getByText("R check 0")).toBeInTheDocument();
    expect(vm).toEqual(before);
  });
  it("opens the work chapter and its allowed scenarios on a normal result", () => {
    const vm = model();
    const { container } = render(<RiasecReadingReport viewModel={vm} locale="zh" actions={null} />);
    expect(container.querySelector("#riasec-combinations > details")).toHaveAttribute("open");
    expect(container.querySelectorAll("#riasec-combinations details:not([open])")).toHaveLength(0);
  });
  it("keeps hidden dimension copy and suppressed work combinations out of the page", () => {
    const vm = model();
    vm.moduleVisibilityPolicy!.modules = vm.moduleVisibilityPolicy!.modules.map(row => ({ ...row, visibility: "hidden" }));
    const { container } = render(<RiasecReadingReport viewModel={vm} locale="zh" actions={null} />);
    expect(screen.queryByText("R check 0")).not.toBeInTheDocument();
    expect(screen.queryByText("R next 0")).not.toBeInTheDocument();
    expect(container.querySelector("#riasec-combinations")).toBeNull();
  });
});
