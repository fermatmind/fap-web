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

function createInsightListBlock(moduleKey: string, title: string, tag: string) {
  return {
    schemaVersion: "insight_list_v1" as const,
    title,
    intro: `${moduleKey} intro ${tag}`,
    items: [1, 2, 3, 4].map((index) => ({
      id: `${moduleKey}-${index}`,
      title: `${moduleKey} item ${index} ${tag}`,
      description: `${moduleKey} preview ${index} ${tag}`,
      body: `${moduleKey} body ${index} ${tag}`,
      whyItMatters: `${moduleKey} why ${index} ${tag}`,
      signals: [
        `${moduleKey} signal ${index}a ${tag}`,
        `${moduleKey} signal ${index}b ${tag}`,
      ],
      actions: {
        do: `${moduleKey} do ${index} ${tag}`,
        avoid: `${moduleKey} avoid ${index} ${tag}`,
      },
      tags: [moduleKey, tag],
    })),
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
          ...createInsightListBlock("what energizes", "什么让你充电", tag),
        },
        whatDrains: {
          ...createInsightListBlock("what drains", "什么让你消耗", tag),
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
            ...createInsightListBlock("superpowers", "关系超级优势", tag),
          },
          pitfalls: {
            ...createInsightListBlock("pitfalls", "关系潜在陷阱", tag),
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
  const unifiedUnlockBody = "解锁完整报告后即可查看这些结果，并纳入你的人格分析。";

  it("keeps Career chapter-end premium teasers on the locked path without extra matched cards", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const section = document.querySelector("#career") as HTMLElement;
    const scoped = within(section);

    const traitsTitle = scoped.getByText("Influential Traits");
    const traitsLockPanel = scoped.getByTestId("mbti-career-traits-lock-panel");
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
    expect(scoped.queryByText("解锁这一章的完整细节")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-career-career-ideas")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-career-work-styles")).not.toBeInTheDocument();
    expect(traitsLockPanel).toHaveTextContent("解锁完整报告");
    expect(traitsLockPanel).toHaveTextContent(unifiedUnlockBody);
    expect(within(firstTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(firstTeaserOverlay).toHaveTextContent("解锁完整报告");
    expect(firstTeaserOverlay).toHaveTextContent(unifiedUnlockBody);
    expect(within(secondTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(secondTeaserOverlay).toHaveTextContent("解锁完整报告");
    expect(secondTeaserOverlay).toHaveTextContent(unifiedUnlockBody);

    expect(screen.getAllByText("职业优势")).toHaveLength(1);
    expect(screen.getAllByText("职业短板")).toHaveLength(1);

    expectBefore(traitsTitle as HTMLElement, traitsLockPanel);
    expectBefore(traitsLockPanel, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);
    expectBefore(weaknessesCard, firstTeaser);
    expectBefore(firstTeaser, secondTeaser);
    expectBefore(secondTeaser, nextSection);
  });

  it("renders Career authored body blocks on the unlocked path", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A", "zh", true);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const section = document.querySelector("#career") as HTMLElement;
    const scoped = within(section);

    const weaknessesCard = scoped.getByTestId("mbti-p0-career-weaknesses");
    const careerIdeasBlock = scoped.getByTestId("mbti-p1-career-career-ideas");
    const workStylesBlock = scoped.getByTestId("mbti-p1-career-work-styles");
    const nextSection = document.querySelector("#growth") as HTMLElement;

    expect(scoped.getByText("你可能会喜欢的职业选择")).toBeInTheDocument();
    expect(scoped.getByText("适合你的工作方式")).toBeInTheDocument();
    expect(scoped.getByText("career ideas item infj-a")).toBeInTheDocument();
    expect(scoped.getByText("career ideas body infj-a")).toBeInTheDocument();
    expect(scoped.getByText("work styles item infj-a")).toBeInTheDocument();
    expect(scoped.getByText("work styles body infj-a")).toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-premium-career-career-ideas")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-premium-career-work-styles")).not.toBeInTheDocument();
    expect(scoped.queryByText("匹配岗位建议")).not.toBeInTheDocument();
    expect(scoped.queryByText("匹配阅读指南")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p0-career-matched-jobs")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p0-career-matched-guides")).not.toBeInTheDocument();
    expect(scoped.queryByText(unifiedUnlockBody)).not.toBeInTheDocument();

    expectBefore(weaknessesCard, careerIdeasBlock);
    expectBefore(careerIdeasBlock, workStylesBlock);
    expectBefore(workStylesBlock, nextSection);
  });

  it("renders Growth chapter-end premium teasers with compact inline unlock copy", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ENTJ-T"));

    renderShell("ENTJ-T");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    const section = document.querySelector("#growth") as HTMLElement;
    const scoped = within(section);

    const traitsLockPanel = scoped.getByTestId("mbti-growth-traits-lock-panel");
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
    expect(scoped.queryByText("解锁这一章的完整细节")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-growth-what-energizes")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-growth-what-drains")).not.toBeInTheDocument();
    expect(traitsLockPanel).toHaveTextContent("解锁完整报告");
    expect(traitsLockPanel).toHaveTextContent(unifiedUnlockBody);
    expect(within(firstTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(firstTeaserOverlay).toHaveTextContent("解锁完整报告");
    expect(firstTeaserOverlay).toHaveTextContent(unifiedUnlockBody);
    expect(within(secondTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(secondTeaserOverlay).toHaveTextContent("解锁完整报告");
    expect(secondTeaserOverlay).toHaveTextContent(unifiedUnlockBody);

    expect(screen.getAllByText("成长优势")).toHaveLength(1);
    expect(screen.getAllByText("成长短板")).toHaveLength(1);

    expectBefore(traitsLockPanel, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);
    expectBefore(weaknessesCard, firstTeaser);
    expectBefore(firstTeaser, secondTeaser);
    expectBefore(secondTeaser, nextSection);
  });

  it("renders Growth authored insight blocks on the unlocked path", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ENTJ-T"));

    renderShell("ENTJ-T", "zh", true);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ENTJ-T", "zh");
    });

    const section = document.querySelector("#growth") as HTMLElement;
    const scoped = within(section);

    const weaknessesCard = scoped.getByTestId("mbti-p0-growth-weaknesses");
    const whatEnergizesBlock = scoped.getByTestId("mbti-p1-growth-what-energizes");
    const whatDrainsBlock = scoped.getByTestId("mbti-p1-growth-what-drains");
    const nextSection = document.querySelector("#relationships") as HTMLElement;

    expect(scoped.getByText("什么能让你充满活力？")).toBeInTheDocument();
    expect(scoped.getByText("什么让你精力力竭？")).toBeInTheDocument();
    expect(scoped.getByText("what energizes intro entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what energizes item 1 entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what energizes body 1 entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what energizes why 1 entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what energizes do 1 entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what drains item 1 entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what drains body 1 entj-t")).toBeInTheDocument();
    expect(scoped.getByText("what drains avoid 1 entj-t")).toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-premium-growth-what-energizes")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-premium-growth-what-drains")).not.toBeInTheDocument();
    expect(scoped.queryByText(unifiedUnlockBody)).not.toBeInTheDocument();

    expectBefore(weaknessesCard, whatEnergizesBlock);
    expectBefore(whatEnergizesBlock, whatDrainsBlock);
    expectBefore(whatDrainsBlock, nextSection);
  });

  it("renders Relationships chapter-end premium teasers with compact inline unlock copy", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ISTP-A"));

    renderShell("ISTP-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ISTP-A", "zh");
    });

    const section = document.querySelector("#relationships") as HTMLElement;
    const scoped = within(section);

    const traitsLockPanel = scoped.getByTestId("mbti-relationships-traits-lock-panel");
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
    expect(scoped.queryByText("解锁这一章的完整细节")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-relationships-superpowers")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-p1-relationships-pitfalls")).not.toBeInTheDocument();
    expect(traitsLockPanel).toHaveTextContent("解锁完整报告");
    expect(traitsLockPanel).toHaveTextContent(unifiedUnlockBody);
    expect(within(firstTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(firstTeaserOverlay).toHaveTextContent("解锁完整报告");
    expect(firstTeaserOverlay).toHaveTextContent(unifiedUnlockBody);
    expect(within(secondTeaserOverlay).getByRole("link", { name: "解锁完整报告" })).toBeInTheDocument();
    expect(secondTeaserOverlay).toHaveTextContent("解锁完整报告");
    expect(secondTeaserOverlay).toHaveTextContent(unifiedUnlockBody);

    expect(screen.getAllByText("关系优势")).toHaveLength(1);
    expect(screen.getAllByText("关系短板")).toHaveLength(1);

    expectBefore(traitsLockPanel, strengthsCard);
    expectBefore(strengthsCard, weaknessesCard);
    expectBefore(weaknessesCard, firstTeaser);
    expectBefore(firstTeaser, secondTeaser);
    expectBefore(secondTeaser, finalOffer);
  });

  it("renders Relationships authored insight blocks on the unlocked path", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("ISTP-A"));

    renderShell("ISTP-A", "zh", true);

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("ISTP-A", "zh");
    });

    const section = document.querySelector("#relationships") as HTMLElement;
    const scoped = within(section);

    const weaknessesCard = scoped.getByTestId("mbti-p0-relationships-weaknesses");
    const superpowersBlock = scoped.getByTestId("mbti-p1-relationships-superpowers");
    const pitfallsBlock = scoped.getByTestId("mbti-p1-relationships-pitfalls");
    const finalOffer = screen.getByTestId("mbti-offer-full");

    expect(scoped.getByText("你的人际关系优势")).toBeInTheDocument();
    expect(scoped.getByText("人际关系陷阱")).toBeInTheDocument();
    expect(scoped.getByText("superpowers intro istp-a")).toBeInTheDocument();
    expect(scoped.getByText("superpowers item 1 istp-a")).toBeInTheDocument();
    expect(scoped.getByText("superpowers body 1 istp-a")).toBeInTheDocument();
    expect(scoped.getByText("superpowers why 1 istp-a")).toBeInTheDocument();
    expect(scoped.getByText("pitfalls item 1 istp-a")).toBeInTheDocument();
    expect(scoped.getByText("pitfalls body 1 istp-a")).toBeInTheDocument();
    expect(scoped.getByText("pitfalls avoid 1 istp-a")).toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-premium-relationships-superpowers")).not.toBeInTheDocument();
    expect(scoped.queryByTestId("mbti-premium-relationships-pitfalls")).not.toBeInTheDocument();
    expect(scoped.queryByText(unifiedUnlockBody)).not.toBeInTheDocument();

    expectBefore(weaknessesCard, superpowersBlock);
    expectBefore(superpowersBlock, pitfallsBlock);
    expectBefore(pitfallsBlock, finalOffer);
  });

  it("keeps locked state on the compact traits unlock strip and hides traits unlock detail panels", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    const section = document.querySelector("#career") as HTMLElement;
    const scoped = within(section);
    const traitsLockPanel = scoped.getByTestId("mbti-career-traits-lock-panel");

    expect(traitsLockPanel).toBeInTheDocument();
    expect(traitsLockPanel).toHaveTextContent("解锁完整报告");
    expect(traitsLockPanel).toHaveTextContent(unifiedUnlockBody);
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

  it("uses the same authored profileIdentity in hero and rail header", async () => {
    vi.mocked(fetchPersonalityDesktopCloneContent).mockResolvedValueOnce(createStoragePayload("INFJ-A"));

    renderShell("INFJ-A");

    await waitFor(() => {
      expect(fetchPersonalityDesktopCloneContent).toHaveBeenCalledWith("INFJ-A", "zh");
    });

    expect(await screen.findByTestId("mbti-hero")).toHaveTextContent("INFJ-A");
    expect(screen.getByTestId("mbti-hero-identity-line")).toHaveTextContent("name infj-a · nickname infj-a");
    const railIdentity = screen.getByTestId("mbti-rail-profile-identity");
    expect(railIdentity).toHaveTextContent("INFJ-A");
    expect(railIdentity).toHaveTextContent("name infj-a · nickname infj-a");
    expect(railIdentity).toHaveTextContent("稀有度：rarity infj-a");
    expect(railIdentity).toHaveTextContent("keyword 1 infj-a");
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
          rawFirstPolePct: 35,
          dominantPole: "I",
          dominantLabel: "Introverted",
          dominantPct: 54,
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
          dominantPct: 62,
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
          dominantPct: 75,
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
    expect(summaryPane).toHaveTextContent("54%");
    expect(summaryPane).toHaveTextContent("Introverted");
    expect(summaryPane).toHaveTextContent("You prefer fewer, deeper interactions and quieter spaces.");
    expect(summaryPane).toHaveTextContent(
      "你更偏向把能量收回到内在世界，但这种内倾并不排斥连接；在合适的关系和话题里，你依然愿意打开自己。",
    );

    fireEvent.click(mindAxis);

    expect(mindAxis).toHaveAttribute("data-state", "active");
    expect(energyAxis).toHaveAttribute("data-state", "idle");
    expect(summaryPane).toHaveTextContent("Mind");
    expect(summaryPane).toHaveTextContent("62%");
    expect(summaryPane).toHaveTextContent("Intuitive");
    expect(summaryPane).toHaveTextContent("You focus on patterns and distant possibilities.");
    expect(summaryPane).toHaveTextContent(
      "你的直觉倾向已经比较明确。你通常会比别人更早想到模式、方向和潜在空间，而不只盯着眼前事实。",
    );
    expect(summaryPane).not.toHaveTextContent("25%");

    fireEvent.click(natureAxis);

    expect(natureAxis).toHaveAttribute("data-state", "active");
    expect(summaryPane).toHaveTextContent("Nature");
    expect(summaryPane).toHaveTextContent("75%");
    expect(summaryPane).toHaveTextContent("Thinking");
    expect(summaryPane).toHaveTextContent("You lean toward clear logic and consistent principles in decisions.");
    expect(summaryPane).toHaveTextContent(
      "你的思考倾向非常清楚。你往往会本能地把问题拆开、排序、判断利弊，再决定行动方向；当环境过度情绪化时，你会更想把它拉回理性轨道。",
    );
  });
});
