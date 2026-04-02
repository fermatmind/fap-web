import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
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

function createHeadline(typeCode: string, displayName = "MBTI 类型"): RichResultHeadline {
  return {
    badge: "MBTI",
    typeCode,
    displayName,
    supportingLine: `${typeCode} supporting line`,
    summary: `${displayName} headline summary`,
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

function createStoragePayload(fullCode: "INFJ-A" | "ENTJ-T", readySlot: "hero-illustration" | "growth-illustration"): PersonalityDesktopCloneContentPayload {
  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode,
    baseCode: fullCode.split("-")[0] ?? "INFJ",
    locale: "zh-CN",
    content: {
      hero: {
        summary: `hero ${fullCode}`,
        profileIdentity: {
          code: fullCode,
          name: `name ${fullCode}`,
          nickname: `nickname ${fullCode}`,
          rarity: `rarity ${fullCode}`,
          keywords: [
            `keyword 1 ${fullCode}`,
            `keyword 2 ${fullCode}`,
            `keyword 3 ${fullCode}`,
            `keyword 4 ${fullCode}`,
            `keyword 5 ${fullCode}`,
            `keyword 6 ${fullCode}`,
          ],
        },
      },
      intro: { paragraphs: [`intro 1 ${fullCode}`, `intro 2 ${fullCode}`] },
      traits: {
        summaryPane: {
          eyebrow: `eyebrow ${fullCode}`,
          title: `title ${fullCode}`,
          value: `value ${fullCode}`,
          body: `body ${fullCode}`,
        },
        body: [`traits 1 ${fullCode}`, `traits 2 ${fullCode}`],
      },
      chapters: {
        career: {
          intro: [`career intro 1 ${fullCode}`, `career intro 2 ${fullCode}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${fullCode}`,
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
              title: `locked 1 ${fullCode}`,
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
              title: `locked 2 ${fullCode}`,
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
          intro: [`growth intro 1 ${fullCode}`, `growth intro 2 ${fullCode}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${fullCode}`,
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
              title: `locked 1 ${fullCode}`,
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
              title: `locked 2 ${fullCode}`,
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
          intro: [`relationships intro 1 ${fullCode}`, `relationships intro 2 ${fullCode}`],
          influentialTraits: [
            { label: "trait 1", body: "body 1", colorKey: "blue" },
            { label: "trait 2", body: "body 2", colorKey: "gold" },
            { label: "trait 3", body: "body 3", colorKey: "green" },
            { label: "trait 4", body: "body 4", colorKey: "purple" },
          ],
          visibleBlocks: [
            {
              title: `visible ${fullCode}`,
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
              title: `locked 1 ${fullCode}`,
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
              title: `locked 2 ${fullCode}`,
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
        eyebrow: `eyebrow ${fullCode}`,
        headline: `headline ${fullCode}`,
        body: `body ${fullCode}`,
        priceLabel: `price label ${fullCode}`,
        ctaLabel: `cta ${fullCode}`,
        guarantee: `guarantee ${fullCode}`,
      },
    },
    assetSlots: [
      {
        slotId: "hero-illustration",
        label: "Hero illustration",
        aspectRatio: "236:160",
        status: readySlot === "hero-illustration" ? "ready" : "placeholder",
        assetRef: readySlot === "hero-illustration"
          ? {
              provider: "cdn",
              path: "mbti/desktop/hero/path.webp",
              url: "https://cdn.example.com/mbti/desktop/hero/path.webp",
              version: "v1",
              checksum: "sha256:hero",
            }
          : null,
        alt: "Hero",
        meta: null,
      },
      {
        slotId: "traits-illustration",
        label: "Traits illustration",
        aspectRatio: "636:148",
        status: "placeholder",
        assetRef: null,
        alt: null,
        meta: null,
      },
      {
        slotId: "traits-summary-illustration",
        label: "Traits summary",
        aspectRatio: "240:118",
        status: "disabled",
        assetRef: null,
        alt: null,
        meta: null,
      },
      {
        slotId: "career-illustration",
        label: "Career illustration",
        aspectRatio: "636:148",
        status: "placeholder",
        assetRef: null,
        alt: null,
        meta: null,
      },
      {
        slotId: "growth-illustration",
        label: "Growth illustration",
        aspectRatio: "636:148",
        status: readySlot === "growth-illustration" ? "ready" : "placeholder",
        assetRef: readySlot === "growth-illustration"
          ? {
              provider: "cdn",
              path: "mbti/desktop/growth/path.webp",
              url: "https://cdn.example.com/mbti/desktop/growth/path.webp",
              version: "v1",
              checksum: "sha256:growth",
            }
          : null,
        alt: "Growth",
        meta: null,
      },
      {
        slotId: "relationships-illustration",
        label: "Relationships illustration",
        aspectRatio: "636:148",
        status: "placeholder",
        assetRef: null,
        alt: null,
        meta: null,
      },
      {
        slotId: "final-offer-illustration",
        label: "Final offer illustration",
        aspectRatio: "252:220",
        status: "placeholder",
        assetRef: null,
        alt: null,
        meta: null,
      },
    ],
    meta: null,
  };
}

function renderShell(typeCode: string) {
  return render(
    <MbtiDesktopCloneShell
      locale="zh"
      headline={createHeadline(typeCode)}
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
}

beforeEach(() => {
  vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
});

describe("MBTI desktop asset slot consumption contract", () => {
  it("renders INFJ-A ready hero asset from storage", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(
      createStoragePayload("INFJ-A", "hero-illustration"),
    );

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const heroSlot = screen.getByTestId("mbti-asset-slot-hero");
    await waitFor(() => {
      expect(heroSlot).toHaveAttribute("data-slot-mode", "ready");
    });

    const heroImage = heroSlot.querySelector("img");
    expect(heroImage?.getAttribute("src")).toBe("https://cdn.example.com/mbti/desktop/hero/path.webp");
    expect(screen.getByTestId("mbti-asset-slot-traits-summary")).toHaveAttribute("data-slot-mode", "disabled");
  });

  it("renders ENTJ-T ready growth asset from storage", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(
      createStoragePayload("ENTJ-T", "growth-illustration"),
    );

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    const growthSlot = screen.getByTestId("mbti-asset-slot-growth");
    await waitFor(() => {
      expect(growthSlot).toHaveAttribute("data-slot-mode", "ready");
    });

    const growthImage = growthSlot.querySelector("img");
    expect(growthImage?.getAttribute("src")).toBe("https://cdn.example.com/mbti/desktop/growth/path.webp");
  });

  it("keeps placeholder fallback stable when storage misses or slot is disabled", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(null);

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(screen.getByTestId("mbti-asset-slot-hero")).toHaveAttribute("data-slot-mode", "placeholder");
    expect(screen.getByTestId("mbti-asset-slot-traits-summary")).toHaveAttribute("data-slot-mode", "placeholder");
  });
});
