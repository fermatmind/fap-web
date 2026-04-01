import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneAssetSlot,
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
            title: `career strengths ${tag}`,
            items: [{ title: `career strengths item ${tag}`, description: `career strengths body ${tag}` }],
          },
          weaknesses: {
            title: `career weaknesses ${tag}`,
            items: [{ title: `career weaknesses item ${tag}`, description: `career weaknesses body ${tag}` }],
          },
          matchedJobs: {
            title: `matched jobs ${tag}`,
            fitBucket: "primary",
            summary: `matched jobs summary ${tag}`,
            fitReason: `matched jobs reason ${tag}`,
            jobExamples: [`job 1 ${tag}`, `job 2 ${tag}`],
          },
          matchedGuides: {
            title: `matched guides ${tag}`,
            summary: `matched guides summary ${tag}`,
            fitReason: `matched guides reason ${tag}`,
          },
          careerIdeas: {
            title: `career ideas ${tag}`,
            items: [{ title: `career ideas item ${tag}`, description: `career ideas body ${tag}` }],
          },
          workStyles: {
            title: `work styles ${tag}`,
            items: [{ title: `work styles item ${tag}`, description: `work styles body ${tag}` }],
          },
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
          strengths: {
            title: `growth strengths ${tag}`,
            items: [{ title: `growth strengths item ${tag}`, description: `growth strengths body ${tag}` }],
          },
          weaknesses: {
            title: `growth weaknesses ${tag}`,
            items: [{ title: `growth weaknesses item ${tag}`, description: `growth weaknesses body ${tag}` }],
          },
          whatEnergizes: {
            title: `what energizes ${tag}`,
            items: [{ title: `what energizes item ${tag}`, description: `what energizes body ${tag}` }],
          },
          whatDrains: {
            title: `what drains ${tag}`,
            items: [{ title: `what drains item ${tag}`, description: `what drains body ${tag}` }],
          },
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
          intro: [`relationships intro 1 ${tag}`, `relationships intro 2 ${tag}`],
          strengths: {
            title: `relationships strengths ${tag}`,
            items: [{ title: `relationships strengths item ${tag}`, description: `relationships strengths body ${tag}` }],
          },
          weaknesses: {
            title: `relationships weaknesses ${tag}`,
            items: [{ title: `relationships weaknesses item ${tag}`, description: `relationships weaknesses body ${tag}` }],
          },
          superpowers: {
            title: `superpowers ${tag}`,
            items: [{ title: `superpowers item ${tag}`, description: `superpowers body ${tag}` }],
          },
          pitfalls: {
            title: `pitfalls ${tag}`,
            items: [{ title: `pitfalls item ${tag}`, description: `pitfalls body ${tag}` }],
          },
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
    assetSlots,
    meta: null,
  };
}

function renderShell(typeCode: "INFJ-A" | "ENTJ-T" | "ISTP-A", locale: "zh" | "en" = "zh") {
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
  vi.clearAllMocks();
  vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
});

describe("MBTI desktop clone p1 render contract", () => {
  it("renders INFJ-A career ideas and work styles", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(await screen.findByTestId("mbti-p1-career-career-ideas")).toHaveTextContent("career ideas infj-a");
    expect(screen.getByTestId("mbti-p1-career-work-styles")).toHaveTextContent("work styles infj-a");
  });

  it("renders ENTJ-T what energizes and what drains", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ENTJ-T"));

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    expect(await screen.findByTestId("mbti-p1-growth-what-energizes")).toHaveTextContent("what energizes entj-t");
    expect(screen.getByTestId("mbti-p1-growth-what-drains")).toHaveTextContent("what drains entj-t");
  });

  it("renders ISTP-A relationship superpowers and pitfalls", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ISTP-A"));

    renderShell("ISTP-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ISTP-A", "zh");
    });

    expect(await screen.findByTestId("mbti-p1-relationships-superpowers")).toHaveTextContent("superpowers istp-a");
    expect(screen.getByTestId("mbti-p1-relationships-pitfalls")).toHaveTextContent("pitfalls istp-a");
  });

  it("hides only the missing p1 module and keeps page stable", async () => {
    const payload = createStoragePayload("ENTJ-T");
    delete payload.content.chapters.growth.whatEnergizes;

    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(payload);

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    expect(await screen.findByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p1-growth-what-energizes")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-p1-growth-what-drains")).toBeInTheDocument();
  });

  it("keeps p1 modules before locked blocks in chapter flow", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    const careerSection = document.querySelector("#career");
    expect(careerSection).not.toBeNull();

    const scoped = within(careerSection as HTMLElement);
    const careerIdeas = await scoped.findByTestId("mbti-p1-career-career-ideas");
    const workStyles = scoped.getByTestId("mbti-p1-career-work-styles");
    const firstLockedTitle = scoped.getByText("locked 1 infj-a");

    expect(careerIdeas.compareDocumentPosition(firstLockedTitle) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(workStyles.compareDocumentPosition(firstLockedTitle) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  });

  it("does not fetch or render p1 modules for non-zh locale", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A", "en");

    await waitFor(() => {
      expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    });

    expect(fetchPersonalityDesktopCloneContent).not.toHaveBeenCalled();
    expect(screen.queryByTestId("mbti-p1-career-career-ideas")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p1-career-work-styles")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p1-growth-what-energizes")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p1-growth-what-drains")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p1-relationships-superpowers")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p1-relationships-pitfalls")).not.toBeInTheDocument();
  });

  it("keeps p0 modules CTA and asset-slot structure stable", async () => {
    const payload = createStoragePayload("INFJ-A", {
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
    });
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(payload);

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(await screen.findByTestId("mbti-p0-career-strengths")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-offers-primary-cta")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-asset-slot-hero")).toHaveAttribute("data-slot-id", "hero-illustration");
  });
});
