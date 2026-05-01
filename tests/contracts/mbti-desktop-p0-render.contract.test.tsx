import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiDesktopCloneShell } from "@/components/result/mbti/clone/MbtiDesktopCloneShell";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import {
  fetchPersonalityDesktopCloneContent,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
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

function createAxisExplainers() {
  return {
    EI: {
      E: {
        light: { bandNuance: "你明显更容易被外部世界激活，但这种外倾仍保留着收回来整理自己的能力；你不是一直要热闹，而是更容易在互动中启动状态。" },
        clear: { bandNuance: "你的外倾已经比较明确。和人碰撞、即时反馈、现场感与变化感，通常会比独自封闭处理更能让你进入状态。" },
        strong: { bandNuance: "你的外倾倾向非常清楚。你往往需要通过对话、行动、连接与现场推进来保持能量，一旦长期被关在低反馈环境里，就很容易迅速失活。" },
      },
      I: {
        light: { bandNuance: "你更偏向把能量收回到内在世界，但这种内倾并不排斥连接；在合适的关系和话题里，你依然愿意打开自己。" },
        clear: { bandNuance: "你的内倾已经比较明确。独处、沉淀、内在加工和低刺激环境，会更稳定地帮助你恢复专注和判断。" },
        strong: { bandNuance: "你的内倾倾向非常清楚。你通常需要较大的心理空间来整理体验和形成观点，过多社交或持续外部打断会明显削弱你的能量质量。" },
      },
    },
    SN: {
      S: {
        light: { bandNuance: "你更偏向从可见事实和现实线索出发，但并不是拒绝想象；你只是更相信脚下能落地的东西。" },
        clear: { bandNuance: "你的实感倾向已经比较明确。你更容易先抓住证据、细节、步骤和现实限制，再决定怎么行动。" },
        strong: { bandNuance: "你的实感倾向非常清楚。你天然会优先信任眼前可验证的信息，对脱离现实支点的推演和空泛设想会更快失去耐心。" },
      },
      N: {
        light: { bandNuance: "你更偏向看见趋势、含义和可能性，但仍保留对现实条件的基本感知；你不是脱离地面，只是更容易先看到远方。" },
        clear: { bandNuance: "你的直觉倾向已经比较明确。你通常会比别人更早想到模式、方向和潜在空间，而不只盯着眼前事实。" },
        strong: { bandNuance: "你的直觉倾向非常清楚。你天然会沿着意义、隐含结构和未来可能性去理解世界，单纯停留在表层信息里会让你很快感到局促。" },
      },
    },
    TF: {
      T: {
        light: { bandNuance: "你更常从逻辑、效果和一致性切入判断，但并不是忽略感受；只是你会先问这件事是否合理、是否有效。" },
        clear: { bandNuance: "你的思考倾向已经比较明确。你在决策时更容易优先考虑结构、效率、边界和结果，而不是先被情绪牵引。" },
        strong: { bandNuance: "你的思考倾向非常清楚。你往往会本能地把问题拆开、排序、判断利弊，再决定行动方向；当环境过度情绪化时，你会更想把它拉回理性轨道。" },
      },
      F: {
        light: { bandNuance: "你更常从感受、关系与价值切入判断，但并不是没有逻辑；你只是更在意这件事对人意味着什么。" },
        clear: { bandNuance: "你的情感倾向已经比较明确。你在决策时更容易优先考虑关系质量、价值一致与情绪承接，而不只看表面的效率。" },
        strong: { bandNuance: "你的情感倾向非常清楚。你会天然把人的处境、关系影响和内在价值放进判断核心，因此很难长期接受只讲结果、不顾人感受的做法。" },
      },
    },
    JP: {
      J: {
        light: { bandNuance: "你更偏向先形成框架和判断，但仍保留一定弹性；你喜欢知道大致怎么走，只是不一定把一切都锁死。" },
        clear: { bandNuance: "你的判断倾向已经比较明确。你通常更安心于有计划、有节点、有预期的推进方式，不喜欢长期处在悬而未决的状态。" },
        strong: { bandNuance: "你的判断倾向非常清楚。你会自然追求结构、秩序、提前安排和收束感，长期模糊、频繁改动或毫无边界的节奏会很快消耗你。" },
      },
      P: {
        light: { bandNuance: "你更偏向保留空间和灵活应对，但并不是无法规划；你只是更希望计划能跟着现实一起调整。" },
        clear: { bandNuance: "你的感知倾向已经比较明确。你通常更自在于边走边看、动态修正和根据现场反馈调整节奏，而不是过早把一切定死。" },
        strong: { bandNuance: "你的感知倾向非常清楚。你会天然保留探索空间和变招余地，过度僵硬的规则、过细的预设和无法调整的流程会明显压缩你的状态。" },
      },
    },
    AT: {
      A: {
        light: { bandNuance: "你更偏向内在稳定和自我信任，但并不是完全不受波动影响；只是你比较容易在起伏里重新站稳。" },
        clear: { bandNuance: "你的果断倾向已经比较明确。你通常更容易保持心理重心，不会因为一时反馈就迅速推翻自己。" },
        strong: { bandNuance: "你的果断倾向非常清楚。你往往能在压力下维持较稳定的内在秩序和自我判断，不容易长期被外部噪音牵着走。" },
      },
      T: {
        light: { bandNuance: "你更偏向警觉、自我校准和反复审视，但这种敏感也让你保留了细腻与修正空间。" },
        clear: { bandNuance: "你的敏感倾向已经比较明确。你通常更容易察觉风险、缺口和未完成之处，因此会持续调整自己和周围环境。" },
        strong: { bandNuance: "你的敏感倾向非常清楚。你会天然保持较高的自我要求和环境警觉度，这会带来推进力与精细度，但也更容易让你长期紧绷、难以彻底放松。" },
      },
    },
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
      hero: {
        summary: `hero ${tag}`,
        profileIdentity: {
          code: fullCode,
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
        axisExplainers: createAxisExplainers(),
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
      canLoadDesktopCloneStorage
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
  projectionViewModel,
}: {
  typeCode?: "INFJ-A" | "ENTJ-T" | "ISTP-A";
  locale?: "zh" | "en";
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
      isUnlocked={false}
      canLoadDesktopCloneStorage
      shareCtaLabel="分享"
      onShare={vi.fn()}
      retakeHref="/zh/test/mbti"
      primaryCtaLabel="去结算"
      primaryCtaHref="/zh/pay/checkout"
    />,
  );
}

function expectBefore(before: HTMLElement, after: HTMLElement) {
  expect(before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValue(null);
});

describe("MBTI desktop clone p0 render contract", () => {
  it("removes desktop first-screen letters and overview cards while moving overview copy under traits", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const traitsBody = await screen.findByTestId("mbti-traits-body");

    expect(screen.queryByTestId("mbti-p0-letters-intro")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-overview")).not.toBeInTheDocument();
    expect(traitsBody).toHaveAttribute("data-body-source", "overview");
    expect(traitsBody).toHaveTextContent("overview 1 infj-a");
    expect(traitsBody).toHaveTextContent("overview 2 infj-a");
    expect(screen.queryByText("traits 1 infj-a")).not.toBeInTheDocument();
    expect(screen.queryByText("traits 2 infj-a")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-career-matched-jobs")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-career-matched-guides")).not.toBeInTheDocument();
  });

  it("keeps the first-screen order aligned to hero intro traits overview body then career", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const hero = await screen.findByTestId("mbti-hero");
    const introParagraph = screen.getByText("intro 1 infj-a");
    const traitsHeading = screen.getByRole("heading", { level: 2, name: "Personality Traits" });
    const traitsBody = screen.getByTestId("mbti-traits-body");
    const careerHeading = screen.getByRole("heading", { level: 2, name: "Your Career Path" });

    expectBefore(hero, introParagraph);
    expectBefore(introParagraph, traitsHeading);
    expectBefore(traitsHeading, traitsBody);
    expectBefore(traitsBody, careerHeading);
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
    expect(screen.getByTestId("mbti-asset-slot-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-asset-slot-traits-summary")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-sticky-rail")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Your Career Path" })).toBeInTheDocument();
    expect(screen.getByText("headline infj-a")).toBeInTheDocument();
  });

  it("renders hero identity from authored profileIdentity without local maps", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const hero = await screen.findByTestId("mbti-hero");
    expect(hero).toHaveTextContent("INFJ-A");
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("name infj-a · nickname infj-a");
    expect(screen.getByTestId("mbti-hero-rarity")).toHaveTextContent("稀有度：rarity infj-a");
    expect(screen.getByTestId("mbti-hero-keywords")).toHaveTextContent("keyword 1 infj-a");
    expect(hero).toHaveTextContent("hero infj-a");
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
    expect(screen.getByTestId("mbti-traits-body")).toHaveAttribute("data-body-source", "traits");
    expect(screen.queryByTestId("mbti-p0-career-matched-jobs")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-p0-career-matched-guides")).not.toBeInTheDocument();
  });

  it("renders dominant-side percent instead of raw first-pole percent in the traits bars", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShellWithProjection({
      projectionViewModel: createProjectionViewModel([
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
      ]),
    });

    const traitsAxis = await screen.findByTestId("mbti-traits-axis-SN");
    expect(traitsAxis).toHaveTextContent("75%");
    expect(traitsAxis).toHaveTextContent("Intuitive");
    expect(traitsAxis).not.toHaveTextContent("25%");

    const summaryPane = screen.getByTestId("mbti-traits-summary-pane");
    expect(summaryPane).toHaveTextContent("Mind");
    expect(summaryPane).toHaveTextContent("75%");
    expect(summaryPane).toHaveTextContent("Intuitive");
    expect(summaryPane).toHaveTextContent("You focus on patterns and distant possibilities.");
    expect(summaryPane).toHaveTextContent(
      "你的直觉倾向非常清楚。你天然会沿着意义、隐含结构和未来可能性去理解世界，单纯停留在表层信息里会让你很快感到局促。",
    );
  });

  it("renders light band nuance as a separate supplement below the canonical summary", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShellWithProjection({
      projectionViewModel: createProjectionViewModel([
        {
          axisCode: "EI",
          axisTitle: "Energy",
          leftPole: "Extraverted",
          rightPole: "Introverted",
          leftCode: "E",
          rightCode: "I",
          dominantPole: "I",
          dominantLabel: "Introverted",
          dominantPct: 54,
          summary: "You prefer to recharge quietly while staying open to close connections.",
        },
      ]),
    });

    const summaryPane = await screen.findByTestId("mbti-traits-summary-pane");
    expect(summaryPane).toHaveTextContent("Energy");
    expect(summaryPane).toHaveTextContent("54%");
    expect(summaryPane).toHaveTextContent("Introverted");
    expect(summaryPane).toHaveTextContent("You prefer to recharge quietly while staying open to close connections.");
    expect(screen.getByTestId("mbti-traits-band-nuance")).toHaveTextContent(
      "你更偏向把能量收回到内在世界，但这种内倾并不排斥连接；在合适的关系和话题里，你依然愿意打开自己。",
    );
  });

  it("renders canonical traits summary on non-zh pages without storage content", async () => {
    renderShellWithProjection({
      locale: "en",
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
      ]),
    });

    const summaryPane = await screen.findByTestId("mbti-traits-summary-pane");
    expect(summaryPane).toHaveTextContent("Energy");
    expect(summaryPane).toHaveTextContent("65%");
    expect(summaryPane).toHaveTextContent("Introverted");
    expect(summaryPane).toHaveTextContent("You prefer fewer, deeper interactions and quieter spaces.");
    expect(screen.queryByTestId("mbti-traits-band-nuance")).not.toBeInTheDocument();
  });
});
