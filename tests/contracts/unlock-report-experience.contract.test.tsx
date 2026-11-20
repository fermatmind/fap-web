import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UnlockReportExperience } from "@/components/career/UnlockReportExperience";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";

vi.mock("@/lib/career/riasecProfileMatch", () => ({ rankRiasecCareers: () => ({ jobs: [
  { slug: "first", name: "First role", summary: "First source description" },
  { slug: "second", name: "Second role", summary: "Second source description" },
  { slug: "third", name: "Third role", summary: "Third source description" },
] }) }));

function model() {
  const vm = assembleRiasecResultViewModel({}, "en");
  vm.primaryType = "I"; vm.topCode = "IAS"; vm.scoreKind = "dimension_scores_0_100";
  vm.dimensions = ["R", "I", "A", "S", "E", "C"].map((code, index) => ({ code, label: `Interest ${code}`, score: 30 + index * 10, scoreAvailable: true }));
  vm.moduleVisibilityPolicy = { schemaVersion: "riasec.module_visibility_policy.v1", policyId: "test", qualityState: "normal", profileShape: "clear", formCode: "riasec_60", modules: [{key: "six_dimension_map", visibility: "visible", reason: "fixture"}], fallbackPolicy: {unknownModule:"hidden",missingBackendState:"hidden",frontendInferenceAllowed:false} };
  return vm;
}
const premium = { dimensions: [{label:"Interest I",score:40,detail:"Source interpretation"}], preferences:[], condition_note:"Source boundary", actions:["Source experiment"], ai_prompt:"Source-based prompt" };
afterEach(() => vi.unstubAllGlobals());

describe("Separate unlock and sample presentation", () => {
  it("does not treat lower-ranked ties as a tie for the leading interest", () => {
    const vm=model();
    vm.interpretationState = { tieDisplay: { dimensions: ["S", "E"], note: "Lower-interest tie note" } } as NonNullable<typeof vm.interpretationState>;
    render(<UnlockReportExperience model={vm} locale="en" sampleHref="/sample" />);
    expect(screen.getByRole("heading",{level:1,name:"Interest I"})).toBeVisible();
    expect(screen.queryByText("Lower-interest tie note")).not.toBeInTheDocument();
  });
  it("supports a bounded two-career comparison without an order or result mutation", () => {
    const vm=model(); const before=JSON.stringify(vm);
    render(<UnlockReportExperience model={vm} locale="en" premium={premium} sampleHref="/sample" />);
    const choices=screen.getAllByRole("checkbox",{name:"Compare"});
    fireEvent.click(choices[0]); fireEvent.click(choices[1]);
    const comparison=within(screen.getByRole("region",{name:"Career comparison"}));
    expect(comparison.getByText("First role")).toBeVisible();
    expect(comparison.getByText("Second role")).toBeVisible();
    expect(choices[2]).toBeDisabled();
    fireEvent.click(choices[0]); expect(choices[2]).toBeEnabled();
    expect(JSON.stringify(vm)).toBe(before);
  });

  it("copies the provided prompt and invokes native print for the sample", async () => {
    const copy=vi.fn().mockResolvedValue(undefined); const print=vi.fn();
    Object.defineProperty(navigator,"clipboard",{value:{writeText:copy},configurable:true});
    vi.stubGlobal("print",print);
    render(<UnlockReportExperience model={model()} locale="en" premium={premium} sampleHref="/sample" />);
    fireEvent.click(screen.getByRole("button",{name:"Copy prompt"}));
    await waitFor(()=>expect(screen.getByRole("button",{name:"Copied"})).toBeVisible());
    expect(copy).toHaveBeenCalledWith("Source-based prompt");
    fireEvent.click(screen.getByRole("button",{name:"Print or save as PDF"}));
    expect(print).toHaveBeenCalledOnce();
  });

  it("keeps the sample destination separate from a disabled purchase action", () => {
    render(<UnlockReportExperience model={model()} locale="en" sampleHref="/en/sample" purchase={<button disabled>Payment preview</button>} />);
    expect(screen.queryByText("Source interpretation")).not.toBeInTheDocument();
    expect(screen.getByRole("link",{name:"Explore my full report"})).toHaveAttribute("href","#unlock-purchase");
    expect(screen.getByRole("link",{name:"View the full sample report"})).toHaveAttribute("target","_blank");
    expect(screen.getByRole("button",{name:"Payment preview"})).toBeDisabled();
  });
});
