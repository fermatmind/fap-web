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

function createStoragePayload(fullCode: "INFJ-A" | "ENTJ-T" | "ISTP-A"): PersonalityDesktopCloneContentPayload {
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

describe("MBTI desktop clone p0 render contract", () => {
  it("renders INFJ-A letters intro overview while career matched cards stay removed from desktop main flow", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(await screen.findByTestId("mbti-p0-letters-intro")).toHaveTextContent("letters headline infj-a");
    expect(screen.getByTestId("mbti-p0-overview")).toHaveTextContent("overview title infj-a");
    expect(screen.queryByTestId("mbti-p0-career-matched-jobs")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-career-matched-guides")).not.toBeInTheDocument();
  });

  it("renders ENTJ-T growth strengths and weaknesses", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ENTJ-T"));

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    expect(await screen.findByTestId("mbti-p0-growth-strengths")).toHaveTextContent("growth strengths entj-t");
    expect(screen.getByTestId("mbti-p0-growth-weaknesses")).toHaveTextContent("growth weaknesses entj-t");
  });

  it("renders ISTP-A relationships strengths and weaknesses", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ISTP-A"));

    renderShell("ISTP-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ISTP-A", "zh");
    });

    expect(await screen.findByTestId("mbti-p0-relationships-strengths")).toHaveTextContent("relationships strengths istp-a");
    expect(screen.getByTestId("mbti-p0-relationships-weaknesses")).toHaveTextContent("relationships weaknesses istp-a");
  });

  it("keeps existing hero traits and final offer rendering stable", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(await screen.findByTestId("mbti-hero")).toHaveTextContent("hero infj-a");
    expect(screen.getAllByText("title infj-a").length).toBeGreaterThan(0);
    expect(screen.getByText("headline infj-a")).toBeInTheDocument();
  });

  it("keeps shell stable when one p0 module is missing", async () => {
    const payload = createStoragePayload("ENTJ-T");
    delete payload.content.chapters.growth.strengths;

    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(payload);

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    expect(await screen.findByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-growth-strengths")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-p0-growth-weaknesses")).toBeInTheDocument();
  });

  it("does not fetch or render p0 modules for non-zh locale", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A", "en");

    await waitFor(() => {
      expect(screen.getByTestId("mbti-desktop-clone-shell")).toBeInTheDocument();
    });

    expect(fetchPersonalityDesktopCloneContent).not.toHaveBeenCalled();
    expect(screen.queryByTestId("mbti-p0-letters-intro")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-overview")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-career-matched-jobs")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-career-matched-guides")).not.toBeInTheDocument();
  });
});
