import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { buildMbtiPromotedBodyFixture as fixture } from "@/tests/fixtures/mbtiPromotedBodyFixture";
import canonical from "@/tests/fixtures/mbti-promoted-decision-style.json";

vi.mock("@/lib/cms/personality-result-introduction", () => ({
  fetchPersonalityResultIntroduction: vi.fn(async (fullCode: string, locale: string) => ({
    fullCode, locale: locale === "zh" ? "zh-CN" : "en", revision: 1, contentHash: "a".repeat(64),
    paragraphs: ["Synthetic introduction one", "Synthetic introduction two"],
  })),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/en/result/fixed-synthetic-promoted-body" }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));


describe("MBTI promoted canonical body through the active English reader", () => {
  beforeEach(() => { vi.clearAllMocks(); window.sessionStorage.clear(); });

  it("preserves the backend authority marker with the canonical paragraphs and prompts", () => {
    const section = buildMbtiResultProjectionViewModel(fixture()).sections[0];
    expect(section).toMatchObject({ authoritySource: "content_promotion_w1_mbti_results_v2" });
    expect(section.bodyMd).toBe(canonical.body_template.join("\n\n"));
    expect(section.payload?.reflection_prompts).toEqual(canonical.reflection_prompts);
  });

  it("shows both canonical paragraphs, both prompts and the existing selected scenario", async () => {
    render(<RichResultReport locale="en" reportData={fixture()} />);
    const section = await screen.findByTestId("mbti-projection-section-traits-decision-style");
    for (const paragraph of canonical.body_template) expect(within(section).getByText(paragraph, { exact: false })).toBeInTheDocument();
    for (const prompt of canonical.reflection_prompts) expect(within(section).getByText(prompt)).toBeInTheDocument();
    expect(within(section).getByText("Existing selected scenario remains available.")).toBeInTheDocument();
    expect(screen.getAllByTestId("mbti-projection-section-traits-decision-style")).toHaveLength(1);
  });

  it("does not expose the canonical paragraphs or prompts on the locked reader", async () => {
    render(<RichResultReport locale="en" reportData={fixture({ locked: true })} />);
    await screen.findByTestId("mbti-result-shell");
    for (const text of [...canonical.body_template, ...canonical.reflection_prompts]) expect(screen.queryByText(text)).not.toBeInTheDocument();
  });

  it("keeps the existing selected-block behavior for sections without the promotion marker", async () => {
    render(<RichResultReport locale="en" reportData={fixture({ promoted: false })} />);
    const section = await screen.findByTestId("mbti-projection-section-traits-decision-style");
    expect(section).toHaveTextContent("Existing selected scenario remains available.");
    for (const text of [...canonical.body_template, ...canonical.reflection_prompts]) expect(within(section).queryByText(text)).not.toBeInTheDocument();
  });

  it("renders canonical paragraphs once when there are no selected blocks", async () => {
    render(<RichResultReport locale="en" reportData={fixture({ withBlocks: false })} />);
    const section = await screen.findByTestId("mbti-projection-section-traits-decision-style");
    for (const paragraph of canonical.body_template) expect(within(section).getAllByText(paragraph, { exact: false })).toHaveLength(1);
    for (const prompt of canonical.reflection_prompts) expect(within(section).getByText(prompt)).toBeInTheDocument();
  });
});
