import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneAssetSlot,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
import type { TraitUnlockBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";

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

function createProjectionViewModel(
  dimensions: Array<Record<string, unknown>>,
): MbtiResultProjectionViewModel {
  return {
    canonicalTypeCode: "INFJ",
    displayType: "INFJ-A",
    variantCode: "A",
    typeName: "INFJ 类型",
    nickname: "",
    rarity: "",
    keywords: [],
    heroSummary: "",
    title: "INFJ 类型",
    subtitle: "",
    summary: "",
    tagline: "",
    publicTags: [],
    dimensions: dimensions as MbtiResultProjectionViewModel["dimensions"],
    sections: [],
    seo: null,
    rawProjection: null,
    hasProjection: true,
    personalization: null,
  };
}

function createAssetSlots(overrides?: Partial<Record<"hero", PersonalityDesktopCloneAssetSlot>>): PersonalityDesktopCloneAssetSlot[] {
  return [
    overrides?.hero ?? {
      slotId: "hero-illustration",
      label: "Hero",
      aspectRatio: "236:160",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "traits-illustration",
      label: "Traits",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "traits-summary-illustration",
      label: "Traits Summary",
      aspectRatio: "240:118",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "career-illustration",
      label: "Career",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "growth-illustration",
      label: "Growth",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "relationships-illustration",
      label: "Relationships",
      aspectRatio: "636:148",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
    {
      slotId: "final-offer-illustration",
      label: "Final Offer",
      aspectRatio: "252:220",
      status: "placeholder",
      assetRef: null,
      alt: null,
      meta: null,
    },
  ];
}

function createTraitsUnlock(tag: string, chapter: "career" | "growth" | "relationships"): TraitUnlockBlock {
  const createItem = (index: number) => ({
    id: `${chapter}-trait-${index}`,
    label: `${chapter} trait ${index} ${tag}`,
    role: `${chapter} role ${index} ${tag}`,
    definition: `${chapter} definition ${index} ${tag}`,
    whyItMatters: `${chapter} why ${index} ${tag}`,
    expression: `${chapter} expression ${index} ${tag}`,
    advantage: `${chapter} advantage ${index} ${tag}`,
    overuseRisk: `${chapter} overuse ${index} ${tag}`,
    realWorldSignal: `${chapter} signal ${index} ${tag}`,
    upgradeHint: `${chapter} hint ${index} ${tag}`,
  });

  return {
    title: `${chapter} traits unlock title ${tag}`,
    intro: `${chapter} traits unlock intro ${tag}`,
    items: [createItem(1), createItem(2), createItem(3), createItem(4)],
  };
}

function createStoragePayload(
  fullCode: "INFJ-A" | "ENTJ-T" | "ISTP-A",
  {
    assetSlots = createAssetSlots(),
  }: {
    assetSlots?: PersonalityDesktopCloneAssetSlot[];
  } = {},
): PersonalityDesktopCloneContentPayload {
  const tag = fullCode.toLowerCase();

  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "v1",
    fullCode,
    baseCode: fullCode.split("-")[0] ?? "INFJ",
    locale: "zh-CN",
    content: {
      hero: { summary: `hero ${tag}` },
      intro: { paragraphs: [`intro 1 ${tag}`, `intro 2 ${tag}`] },
      lettersIntro: {
        headline: `letters headline ${tag}`,
        letters: [
          { letter: "E", title: `letter E ${tag}`, description: `letter E body ${tag}` },
          { letter: "N", title: `letter N ${tag}`, description: `letter N body ${tag}` },
        ],
      },
      overview: {
        title: `overview title ${tag}`,
        paragraphs: [`overview 1 ${tag}`, `overview 2 ${tag}`],
      },
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
          strengths: {
            title: "职业优势",
            items: [{ title: `career strengths item ${tag}`, description: `career strengths body ${tag}` }],
          },
          weaknesses: {
            title: "职业短板",
            items: [{ title: `career weaknesses item ${tag}`, description: `career weaknesses body ${tag}` }],
          },
          matchedJobs: {
            title: "匹配岗位建议",
            fitBucket: "primary",
            summary: `matched jobs summary ${tag}`,
            fitReason: `matched jobs reason ${tag}`,
            jobExamples: [`job 1 ${tag}`, `job 2 ${tag}`],
          },
          matchedGuides: {
            title: "匹配阅读指南",
            summary: `matched guides summary ${tag}`,
            fitReason: `matched guides reason ${tag}`,
          },
          careerIdeas: {
            title: "职业方向建议",
            items: [{ title: `career ideas item ${tag}`, description: `career ideas body ${tag}` }],
          },
          workStyles: {
            title: "工作风格建议",
            items: [{ title: `work styles item ${tag}`, description: `work styles body ${tag}` }],
          },
          influentialTraits: [
            { label: `career trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `career trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `career trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `career trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          traitsUnlock: createTraitsUnlock(tag, "career"),
          visibleBlocks: [
            {
              title: "Strengths",
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: "Weaknesses",
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
              title: `career locked 1 ${tag}`,
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
              title: `career locked 2 ${tag}`,
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
          strengths: {
            title: "成长优势",
            items: [{ title: `growth strengths item ${tag}`, description: `growth strengths body ${tag}` }],
          },
          weaknesses: {
            title: "成长短板",
            items: [{ title: `growth weaknesses item ${tag}`, description: `growth weaknesses body ${tag}` }],
          },
          whatEnergizes: {
            title: "什么让你充电",
            items: [{ title: `what energizes item ${tag}`, description: `what energizes body ${tag}` }],
          },
          whatDrains: {
            title: "什么让你消耗",
            items: [{ title: `what drains item ${tag}`, description: `what drains body ${tag}` }],
          },
          influentialTraits: [
            { label: `growth trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `growth trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `growth trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `growth trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          traitsUnlock: createTraitsUnlock(tag, "growth"),
          visibleBlocks: [
            {
              title: "Strengths",
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: "Weaknesses",
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
              title: `growth locked 1 ${tag}`,
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
              title: `growth locked 2 ${tag}`,
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
          intro: [`relationships intro 1 ${tag}`, `relationships intro 2 ${tag}`],
          strengths: {
            title: "关系优势",
            items: [{ title: `relationships strengths item ${tag}`, description: `relationships strengths body ${tag}` }],
          },
          weaknesses: {
            title: "关系短板",
            items: [{ title: `relationships weaknesses item ${tag}`, description: `relationships weaknesses body ${tag}` }],
          },
          superpowers: {
            title: "关系超级优势",
            items: [{ title: `superpowers item ${tag}`, description: `superpowers body ${tag}` }],
          },
          pitfalls: {
            title: "关系潜在陷阱",
            items: [{ title: `pitfalls item ${tag}`, description: `pitfalls body ${tag}` }],
          },
          influentialTraits: [
            { label: `relationships trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `relationships trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `relationships trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `relationships trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          traitsUnlock: createTraitsUnlock(tag, "relationships"),
          visibleBlocks: [
            {
              title: "Strengths",
              items: [
                { title: "item 1", body: "body 1" },
                { title: "item 2", body: "body 2" },
                { title: "item 3", body: "body 3" },
                { title: "item 4", body: "body 4" },
                { title: "item 5", body: "body 5" },
                { title: "item 6", body: "body 6" },
              ],
            },
            {
              title: "Weaknesses",
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
              title: `relationships locked 1 ${tag}`,
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
              title: `relationships locked 2 ${tag}`,
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
    assetSlots,
    meta: null,
  };
}

function renderShell(typeCode: "INFJ-A" | "ENTJ-T" | "ISTP-A", locale: "zh" | "en" = "zh", isUnlocked = false) {
  return render(
    <MbtiDesktopCloneShell
      locale={locale}
      headline={createHeadline(typeCode)}
      tags={[]}
      dimensions={[]}
      highlights={[]}
      sections={[]}
      sectionUnlocks={createSectionUnlocks()}
      offers={[]}
      projectionViewModel={null}
      isUnlocked={isUnlocked}
      shareCtaLabel="分享"
      onShare={vi.fn()}
      retakeHref="/zh/test/mbti"
      primaryCtaLabel="去结算"
      primaryCtaHref="/zh/pay/checkout"
    />,
  );
}

function renderShellWithProjection({
  typeCode = "INFJ-A",
  locale = "zh",
  isUnlocked = false,
  projectionViewModel,
}: {
  typeCode?: "INFJ-A" | "ENTJ-T" | "ISTP-A";
  locale?: "zh" | "en";
  isUnlocked?: boolean;
  projectionViewModel: MbtiResultProjectionViewModel;
}) {
  return render(
    <MbtiDesktopCloneShell
      locale={locale}
      headline={createHeadline(typeCode)}
      tags={[]}
      dimensions={[]}
      highlights={[]}
      sections={[]}
      sectionUnlocks={createSectionUnlocks()}
      offers={[]}
      projectionViewModel={projectionViewModel}
      isUnlocked={isUnlocked}
      shareCtaLabel="分享"
      onShare={vi.fn()}
      retakeHref="/zh/test/mbti"
      primaryCtaLabel="去结算"
      primaryCtaHref="/zh/pay/checkout"
    />,
  );
}

function expectBefore(source: HTMLElement, target: HTMLElement) {
  expect(source.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
});

describe("MBTI desktop chapter premium teaser reset contract", () => {
  it("renders Career chapter-end premium teasers from compatibility fields after strengths/weaknesses without extra matched cards", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const section = document.querySelector("#career") as HTMLElement;
    const scoped = within(section);

    const traitsTitle = scoped.getByText("Influential Traits");
    const unlockTitle = scoped.getByText("解锁这一章的完整细节");
    const strengthsCard = scoped.getByTestId("mbti-p0-career-strengths");
    const weaknessesCard = scoped.getByTestId("mbti-p0-career-weaknesses");
    const firstTeaser = scoped.getByTestId("mbti-premium-career-career-ideas");
    const secondTeaser = scoped.getByTestId("mbti-premium-career-work-styles");
    const firstTeaserOverlay = scoped.getByTestId("mbti-premium-career-career-ideas-overlay");
    const secondTeaserOverlay = scoped.getByTestId("mbti-premium-career-work-styles-overlay");
    const nextSection = document.querySelector("#growth") as HTMLElement;

    expect(scoped.getByText("职业优势")).toBeInTheDocument();
    expect(scoped.getByText("职业短板")).toBeInTheDocument();
    expect(scoped.getByText("你可能会喜欢的职业选择")).toBeInTheDocument();
    expect(scoped.getByText("适合你的工作方式")).toBeInTheDocument();
    expect(scoped.queryByText("匹配岗位建议")).not.toBeInTheDocument();
    expect(scoped.queryByText("匹配阅读指南")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p0-career-matched-jobs")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p0-career-matched-guides")).not.toBeInTheDocument();
    expect(scoped.queryByText("Strengths")).not.toBeInTheDocument();
    expect(scoped.queryByText("Weaknesses")).not.toBeInTheDocument();
    expect(scoped.queryByText("职业方向建议")).not.toBeInTheDocument();
    expect(scoped.queryByText("工作风格建议")).not.toBeInTheDocument();
    expect(scoped.queryByText("解锁岗位簇")).not.toBeInTheDocument();
    expect(scoped.queryByText("解锁工作方式")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-career-career-ideas")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-career-work-styles")).not.toBeInTheDocument();
    expect(within(firstTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(within(secondTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();

    expect(screen.getAllByText("职业优势")).toHaveLength(1);
    expect(screen.getAllByText("职业短板")).toHaveLength(1);

    expectBefore(traitsTitle as HTMLElement, unlockTitle as HTMLElement);
    expectBefore(unlockTitle as HTMLElement, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);
    expectBefore(weaknessesCard, firstTeaser);
    expectBefore(firstTeaser, secondTeaser);
    expectBefore(secondTeaser, nextSection);
  });

  it("renders Growth chapter-end premium teasers from compatibility fields without floating unlock cards", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ENTJ-T"));

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    const section = document.querySelector("#growth") as HTMLElement;
    const scoped = within(section);

    const unlockTitle = scoped.getByText("解锁这一章的完整细节");
    const strengthsCard = scoped.getByTestId("mbti-p0-growth-strengths");
    const weaknessesCard = scoped.getByTestId("mbti-p0-growth-weaknesses");
    const firstTeaser = scoped.getByTestId("mbti-premium-growth-what-energizes");
    const secondTeaser = scoped.getByTestId("mbti-premium-growth-what-drains");
    const firstTeaserOverlay = scoped.getByTestId("mbti-premium-growth-what-energizes-overlay");
    const secondTeaserOverlay = scoped.getByTestId("mbti-premium-growth-what-drains-overlay");
    const nextSection = document.querySelector("#relationships") as HTMLElement;

    expect(scoped.getByText("成长优势")).toBeInTheDocument();
    expect(scoped.getByText("成长短板")).toBeInTheDocument();
    expect(scoped.getByText("什么能让你充满活力？")).toBeInTheDocument();
    expect(scoped.getByText("什么让你精力力竭？")).toBeInTheDocument();
    expect(scoped.queryByText("Strengths")).not.toBeInTheDocument();
    expect(scoped.queryByText("Weaknesses")).not.toBeInTheDocument();
    expect(scoped.queryByText("什么让你充电")).not.toBeInTheDocument();
    expect(scoped.queryByText("什么让你消耗")).not.toBeInTheDocument();
    expect(scoped.queryByText("解锁补能条件")).not.toBeInTheDocument();
    expect(scoped.queryByText("解锁耗损模式")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-growth-what-energizes")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-growth-what-drains")).not.toBeInTheDocument();
    expect(within(firstTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(within(secondTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();

    expect(screen.getAllByText("成长优势")).toHaveLength(1);
    expect(screen.getAllByText("成长短板")).toHaveLength(1);

    expectBefore(unlockTitle as HTMLElement, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);
    expectBefore(weaknessesCard, firstTeaser);
    expectBefore(firstTeaser, secondTeaser);
    expectBefore(secondTeaser, nextSection);
  });

  it("renders Relationships chapter-end premium teasers from compatibility fields without floating unlock cards", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ISTP-A"));

    renderShell("ISTP-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ISTP-A", "zh");
    });

    const section = document.querySelector("#relationships") as HTMLElement;
    const scoped = within(section);

    const unlockTitle = scoped.getByText("解锁这一章的完整细节");
    const strengthsCard = scoped.getByTestId("mbti-p0-relationships-strengths");
    const weaknessesCard = scoped.getByTestId("mbti-p0-relationships-weaknesses");
    const firstTeaser = scoped.getByTestId("mbti-premium-relationships-superpowers");
    const secondTeaser = scoped.getByTestId("mbti-premium-relationships-pitfalls");
    const firstTeaserOverlay = scoped.getByTestId("mbti-premium-relationships-superpowers-overlay");
    const secondTeaserOverlay = scoped.getByTestId("mbti-premium-relationships-pitfalls-overlay");
    const finalOffer = screen.getByTestId("mbti-offer-full");

    expect(scoped.getByText("关系优势")).toBeInTheDocument();
    expect(scoped.getByText("关系短板")).toBeInTheDocument();
    expect(scoped.getByText("你的人际关系优势")).toBeInTheDocument();
    expect(scoped.getByText("人际关系陷阱")).toBeInTheDocument();
    expect(scoped.queryByText("Strengths")).not.toBeInTheDocument();
    expect(scoped.queryByText("Weaknesses")).not.toBeInTheDocument();
    expect(scoped.queryByText("关系超级优势")).not.toBeInTheDocument();
    expect(scoped.queryByText("关系潜在陷阱")).not.toBeInTheDocument();
    expect(scoped.queryByText("解锁关系优势")).not.toBeInTheDocument();
    expect(scoped.queryByText("解锁关系盲点")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-relationships-superpowers")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-relationships-pitfalls")).not.toBeInTheDocument();
    expect(within(firstTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(within(secondTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();

    expect(screen.getAllByText("关系优势")).toHaveLength(1);
    expect(screen.getAllByText("关系短板")).toHaveLength(1);

    expectBefore(unlockTitle as HTMLElement, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);
    expectBefore(weaknessesCard, firstTeaser);
    expectBefore(firstTeaser, secondTeaser);
    expectBefore(secondTeaser, finalOffer);
  });

  it("keeps locked state on the existing central lock card and hides traits unlock detail panels", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const section = document.querySelector("#career") as HTMLElement;
    const scoped = within(section);

    expect(scoped.getByTestId("mbti-career-traits-lock-panel")).toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-career-traits-unlock-panel")).not.toBeInTheDocument();
  });

  it("renders unlocked traits detail panels directly under the trait row and before strengths/weaknesses", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A", "zh", true);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const careerSection = document.querySelector("#career") as HTMLElement;
    const careerScoped = within(careerSection);
    const traitsTitle = careerScoped.getByText("Influential Traits");
    const detailPanel = careerScoped.getByTestId("mbti-career-traits-unlock-panel");
    const strengthsCard = careerScoped.getByTestId("mbti-p0-career-strengths");
    const weaknessesCard = careerScoped.getByTestId("mbti-p0-career-weaknesses");

    expect(careerScoped.queryByTestId("mbti-career-traits-lock-panel")).not.toBeInTheDocument();
    expect(detailPanel).toHaveTextContent("career traits unlock title infj-a");
    expect(detailPanel).toHaveTextContent("career trait 1 infj-a");
    expect(detailPanel).toHaveTextContent("career definition 1 infj-a");
    expect(detailPanel).toHaveTextContent("career expression 1 infj-a");
    expect(detailPanel).toHaveTextContent("career advantage 1 infj-a");
    expectBefore(traitsTitle as HTMLElement, detailPanel);
    expectBefore(detailPanel, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);

    const growthScoped = within(document.querySelector("#growth") as HTMLElement);
    const relationshipsScoped = within(document.querySelector("#relationships") as HTMLElement);
    expect(growthScoped.getByTestId("mbti-growth-traits-unlock-panel")).toHaveTextContent("growth traits unlock title infj-a");
    expect(relationshipsScoped.getByTestId("mbti-relationships-traits-unlock-panel")).toHaveTextContent(
      "relationships traits unlock title infj-a",
    );
  });

  it("switches the unlocked traits detail panel when a different trait pill is selected", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A", "zh", true);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const careerScoped = within(document.querySelector("#career") as HTMLElement);
    const detailPanel = careerScoped.getByTestId("mbti-career-traits-unlock-panel");

    expect(detailPanel).toHaveTextContent("career trait 1 infj-a");
    expect(detailPanel).toHaveTextContent("career definition 1 infj-a");

    fireEvent.click(careerScoped.getByRole("button", { name: "career trait 3 infj-a: body 3" }));

    expect(detailPanel).toHaveTextContent("career trait 3 infj-a");
    expect(detailPanel).toHaveTextContent("career definition 3 infj-a");
    expect(detailPanel).toHaveTextContent("career expression 3 infj-a");
    expect(detailPanel).toHaveTextContent("career advantage 3 infj-a");
  });

  it("keeps hero/rail/final-offer and asset slots stable after convergence", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(
      createStoragePayload("INFJ-A", {
        assetSlots: createAssetSlots({
          hero: {
            slotId: "hero-illustration",
            label: "Hero Ready",
            aspectRatio: "236:160",
            status: "ready",
            assetRef: {
              provider: "cdn",
              path: "mbti/desktop/hero/infj-a/v1.webp",
              url: "https://cdn.example.com/mbti/desktop/hero/infj-a/v1.webp",
              version: "v1",
              checksum: "sha256:test",
            },
            alt: "Hero ready",
            meta: null,
          },
        }),
      }),
    );

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(await screen.findByTestId("mbti-hero")).toHaveTextContent("hero infj-a");
    expect(screen.getByTestId("mbti-sticky-rail")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-asset-slot-hero")).toHaveAttribute("data-slot-id", "hero-illustration");
  });

  it("keeps non-zh path stable without rendering desktop clone storage modules", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A", "en");

    await waitFor(() => {
      expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    });

    expect(fetchPersonalityDesktopCloneContent).not.toHaveBeenCalled();
    expect(screen.queryByText("职业优势")).not.toBeInTheDocument();
    expect(screen.queryByText("成长优势")).not.toBeInTheDocument();
    expect(screen.queryByText("关系优势")).not.toBeInTheDocument();
  });

  it("switches the right traits card when a different axis is selected and keeps left/right same-source", async () => {
    renderShellWithProjection({
      projectionViewModel: createProjectionViewModel([
        {
          axisCode: "EI",
          axisTitle: "Energy",
          leftPole: "Extraverted",
          rightPole: "Introverted",
          leftCode: "E",
          rightCode: "I",
          rawFirstPolePct: 35,
          dominantPole: "I",
          dominantLabel: "Introverted",
          dominantPct: 65,
          oppositePct: 35,
          strengthBand: "clear",
          summary: "You prefer fewer, deeper interactions and quieter spaces.",
          percent: 65,
          side: "I",
          sideLabel: "Introverted",
          label: "Energy",
        },
        {
          axisCode: "SN",
          axisTitle: "Mind",
          leftPole: "Observant",
          rightPole: "Intuitive",
          leftCode: "S",
          rightCode: "N",
          rawFirstPolePct: 25,
          dominantPole: "N",
          dominantLabel: "Intuitive",
          dominantPct: 75,
          oppositePct: 25,
          strengthBand: "clear",
          summary: "You focus on patterns and distant possibilities.",
          percent: 75,
          side: "N",
          sideLabel: "Intuitive",
          label: "Mind",
        },
        {
          axisCode: "TF",
          axisTitle: "Nature",
          leftPole: "Thinking",
          rightPole: "Feeling",
          leftCode: "T",
          rightCode: "F",
          rawFirstPolePct: 58,
          dominantPole: "T",
          dominantLabel: "Thinking",
          dominantPct: 58,
          oppositePct: 42,
          strengthBand: "moderate",
          summary: "You lean toward clear logic and consistent principles in decisions.",
          percent: 58,
          side: "T",
          sideLabel: "Thinking",
          label: "Nature",
        },
      ]),
    });

    const summaryPane = await screen.findByTestId("mbti-traits-summary-pane");
    const energyAxis = screen.getByTestId("mbti-traits-axis-EI");
    const mindAxis = screen.getByTestId("mbti-traits-axis-SN");
    const natureAxis = screen.getByTestId("mbti-traits-axis-TF");

    expect(energyAxis).toHaveAttribute("data-state", "active");
    expect(summaryPane).toHaveTextContent("Energy");
    expect(summaryPane).toHaveTextContent("65%");
    expect(summaryPane).toHaveTextContent("Introverted");
    expect(summaryPane).toHaveTextContent("You prefer fewer, deeper interactions and quieter spaces.");

    fireEvent.click(mindAxis);

    expect(mindAxis).toHaveAttribute("data-state", "active");
    expect(energyAxis).toHaveAttribute("data-state", "idle");
    expect(summaryPane).toHaveTextContent("Mind");
    expect(summaryPane).toHaveTextContent("75%");
    expect(summaryPane).toHaveTextContent("Intuitive");
    expect(summaryPane).toHaveTextContent("You focus on patterns and distant possibilities.");
    expect(summaryPane).not.toHaveTextContent("25%");

    fireEvent.click(natureAxis);

    expect(natureAxis).toHaveAttribute("data-state", "active");
    expect(summaryPane).toHaveTextContent("Nature");
    expect(summaryPane).toHaveTextContent("58%");
    expect(summaryPane).toHaveTextContent("Thinking");
    expect(summaryPane).toHaveTextContent("You lean toward clear logic and consistent principles in decisions.");
  });
});
