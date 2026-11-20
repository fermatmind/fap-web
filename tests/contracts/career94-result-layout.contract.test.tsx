import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CareerAssessmentResult } from "@/app/(localized)/[locale]/career/assessment/CareerAssessmentResult";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { readCareer94FreeReport, saveCareer94FreeReport } from "@/lib/career/career94ReportSession";
import projection from "./fixtures/riasec/deep-copy-v1.projection.json";

vi.mock("next/link", () => ({ default: ({ children, href, prefetch, onClick, ...props }: ComponentProps<"a"> & { prefetch?: boolean }) => { void prefetch; return <a href={href} {...props} onClick={event => { event.preventDefault(); onClick?.(event); }}>{children}</a>; } }));
vi.mock("@/lib/career/riasecProfileMatch", () => ({ rankRiasecCareers: () => ({ jobs: [] }) }));

function model() {
  const vm = assembleRiasecResultViewModel({ riasec_public_projection_v2: projection }, "zh");
  vm.primaryType = "I";
  vm.topCode = "IRA";
  vm.dimensions = [
    { code: "I", label: "研究型", score: 100, scoreAvailable: true },
    { code: "R", label: "现实型", score: 75, scoreAvailable: true },
    { code: "A", label: "艺术型", score: 50, scoreAvailable: true },
    { code: "S", label: "社会型", score: 25, scoreAvailable: true },
    { code: "E", label: "企业型", score: 25, scoreAvailable: true },
    { code: "C", label: "常规型", score: 50, scoreAvailable: true },
  ];
  if (vm.interpretationState?.tieDisplay) {
    vm.interpretationState.tieDisplay.dimensions = ["A", "C"];
  }
  return vm;
}

describe("Career94 result and separate reading routes", () => {
  beforeEach(() => { sessionStorage.clear(); vi.restoreAllMocks(); });

  it("keeps the primary interest visible and gives the sample a separate, secondary destination", () => {
    const vm = model();
    render(<CareerAssessmentResult model={vm} locale="zh" purchase={<button>微信支付 · ¥2.99</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "研究型" })).toBeVisible();
    const offer = within(screen.getByRole("region", { name: "职业深度报告" }));
    expect(offer.getByRole("link", { name: "查看示例报告" })).toHaveAttribute("href", "/zh/career/assessment/sample");
    expect(offer.getByRole("link", { name: "查看示例报告" })).toHaveAttribute("target", "_blank");
    expect(screen.queryByText("展开一份示例 · 研究型与现实型")).not.toBeInTheDocument();
    expect(document.querySelector("#career94-free-report")).toBeNull();
    expect(screen.queryByRole("link", { name: "查看本次免费兴趣报告" })).not.toBeInTheDocument();
  });

  it("rejects malformed or expired browser reports", () => {
    const vm = model();
    expect(saveCareer94FreeReport(vm, "zh")).toBe(true);
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 3 * 60 * 60 * 1000);
    expect(readCareer94FreeReport("zh")).toBeNull();
    sessionStorage.setItem("fm_career94_free_report_v1", "{broken");
    expect(readCareer94FreeReport("zh")).toBeNull();
  });

});
