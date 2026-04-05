import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import { getMbtiDesktopAnchorHash } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/test-report",
}));
vi.mock("@/lib/cms/personality-desktop-clone", () => ({
  fetchPersonalityDesktopCloneContent: vi.fn(async () => null),
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

function createStoragePayload(tag: string): PersonalityDesktopCloneContentPayload {
  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode: "INFJ-T",
    baseCode: "INFJ",
    locale: "zh-CN",
    content: {
      hero: {
        summary: `hero ${tag}`,
        profileIdentity: {
          code: "INFJ-T",
          name: `name ${tag}`,
          nickname: `nickname ${tag}`,
          rarity: `rarity ${tag}`,
          keywords: [
            `keyword 1 ${tag}`,
            `keyword 2 ${tag}`,
            `keyword 3 ${tag}`,
            `keyword 4 ${tag}`,
            `keyword 5 ${tag}`,
            `keyword 6 ${tag}`,
          ],
        },
      },
      intro: { paragraphs: [`intro 1 ${tag}`, `intro 2 ${tag}`] },
      traits: {
        summaryPane: {
          eyebrow: `eyebrow ${tag}`,
          title: `title ${tag}`,
          value: `value ${tag}`,
          body: `body ${tag}`,
        },
        body: [`traits 1 ${tag}`, `traits 2 ${tag}`],
      },
      chapters: {
        career: {
          intro: [`career intro 1 ${tag}`, `career intro 2 ${tag}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
        growth: {
          intro: [`growth intro 1 ${tag}`, `growth intro 2 ${tag}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
        relationships: {
          intro: [`rel intro 1 ${tag}`, `rel intro 2 ${tag}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${tag}`,
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
          lockedBlocks: [
            {
              title: `locked 1 ${tag}`,
              overlayTitle: "overlay 1",
              overlayBody: "overlay body 1",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: `locked 2 ${tag}`,
              overlayTitle: "overlay 2",
              overlayBody: "overlay body 2",
              overlayCtaLabel: "解锁完整报告",
              blurredItems: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
          ],
        },
      },
      finalOffer: {
        eyebrow: `eyebrow ${tag}`,
        headline: `headline ${tag}`,
        body: `body ${tag}`,
        priceLabel: `price label ${tag}`,
        ctaLabel: `cta ${tag}`,
        guarantee: `guarantee ${tag}`,
      },
    },
    assetSlots: [],
    meta: null,
  };
}

beforeEach(() => {
  vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
});

describe("MBTI desktop clone shell CTA wiring", () => {
  it("keeps chapter teaser lock-card CTA unified by locale and keeps final offer href CTA fallback", async () => {
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

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
    });

    const finalOfferCta = screen.getByTestId("mbti-offers-primary-cta");
    expect(finalOfferCta).toHaveTextContent("1.99元直接解锁");
    expect(finalOfferCta).toHaveAttribute("href", "/zh/pay/checkout");
    expect(screen.getByTestId("mbti-offers-invite-cta")).toHaveTextContent("邀2人测完领报告");

    const lockedOverlayPayCtas = screen.getAllByTestId(/mbti-.*-pay-cta/);
    expect(lockedOverlayPayCtas).toHaveLength(9);
    for (const cta of lockedOverlayPayCtas) {
      expect(cta).toHaveAttribute("href", getMbtiDesktopAnchorHash("offerFull"));
    }

    const rail = screen.getByTestId("mbti-sticky-rail");
    expect(within(rail).getByRole("link", { name: "1. Personality Traits" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("traits"),
    );
    expect(within(rail).getByRole("link", { name: "2. Your Career Path" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("career"),
    );
    expect(within(rail).getByRole("link", { name: "去结算" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull"),
    );
    expect(within(rail).getByRole("link", { name: "工作台" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull"),
    );
  });

  it("keeps runtime offer price while allowing storage copy to render", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("storage"));

    render(
      <MbtiDesktopCloneShell
        locale="zh"
        headline={createHeadline()}
        tags={[]}
        dimensions={[]}
        highlights={[]}
        sections={[]}
        sectionUnlocks={createSectionUnlocks()}
        offers={[
          {
            key: "MBTI_REPORT_FULL",
            title: "完整报告",
            price: "¥199",
            description: "desc",
            modules: [],
            moduleCodes: ["core_full"],
          },
        ]}
        projectionViewModel={null}
        isUnlocked={false}
        shareCtaLabel="分享"
        onShare={vi.fn()}
        retakeHref="/zh/test/mbti"
        primaryCtaLabel="去结算"
        primaryCtaHref="/zh/pay/checkout"
      />,
    );

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
      expect(screen.getByText("headline storage")).toBeInTheDocument();
    });

    expect(screen.getByText("price label storage")).toBeInTheDocument();
    expect(screen.getByText("¥199")).toBeInTheDocument();
  });

  it("renders the traits footer tools inside the same primary card shell", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("storage"));

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
        historyHref="/zh/history"
        pdfHref="/zh/result/test.pdf"
        pdfReady
        primaryCtaLabel="去结算"
        primaryCtaHref="/zh/pay/checkout"
      />,
    );

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-T", "zh");
    });

    const traitsTools = screen.getByTestId("mbti-traits-tools");
    expect(within(traitsTools).getByText("你可以继续保存、导出或查看历史结果。")).toBeInTheDocument();
    expect(within(traitsTools).getByRole("button", { name: "分享" })).toBeInTheDocument();
    expect(within(traitsTools).getByRole("link", { name: "导出 PDF" })).toHaveAttribute(
      "href",
      "/zh/result/test.pdf",
    );
    expect(within(traitsTools).getByRole("link", { name: "查看历史" })).toHaveAttribute(
      "href",
      "/zh/history",
    );
  });
});
