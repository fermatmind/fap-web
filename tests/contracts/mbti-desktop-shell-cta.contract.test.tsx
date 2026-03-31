import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/test-report",
}));

function createHeadline(): RichResultHeadline {
  return {
    badge: "MBTI",
    typeCode: "INFJ-T",
    displayName: "INFJ 类型",
    supportingLine: "INFJ supporting line",
    summary: "INFJ headline summary",
    rarity: "test rarity",
  };
}

function createSectionUnlocks(): Record<string, MbtiSectionUnlock> {
  return {
    traits: { teaser: "traits teaser", benefits: ["benefit one"], offer: null },
    career: { teaser: "career teaser", benefits: ["career benefit"], offer: null },
    growth: { teaser: "growth teaser", benefits: ["growth benefit"], offer: null },
    relationships: { teaser: "relationships teaser", benefits: ["relationships benefit"], offer: null },
  };
}

describe("MBTI desktop clone shell CTA wiring", () => {
  it("keeps slot CTA labels in locked overlays and falls back to href CTA in final offer", () => {
    render(
      <MbtiDesktopCloneShell
        locale="zh"
        headline={createHeadline()}
        tags={[]}
        dimensions={[]}
        highlights={[]}
        sections={[]}
        sectionUnlocks={createSectionUnlocks()}
        offers={[]}
        projectionViewModel={null}
        isUnlocked={false}
        shareCtaLabel="分享"
        onShare={vi.fn()}
        retakeHref="/zh/test/mbti"
        primaryCtaLabel="去结算"
        primaryCtaHref="/zh/pay/checkout"
      />,
    );

    const finalOfferCta = screen.getByTestId("mbti-offers-primary-cta");
    expect(finalOfferCta).toHaveTextContent("去结算");
    expect(finalOfferCta).toHaveAttribute("href", "/zh/pay/checkout");

    const lockedOverlayCtas = screen.getAllByText("解锁完整报告");
    expect(lockedOverlayCtas).toHaveLength(6);
  });
});
