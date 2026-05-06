import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchPersonalityDesktopCloneContent,
  normalizeDesktopCloneApiLocale,
  normalizeDesktopCloneTypeSlug,
} from "@/lib/cms/personality-desktop-clone";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function createValidPayload(tag: string) {
  const createAxisExplainers = () => ({
    EI: {
      E: {
        light: { band_nuance: "你明显更容易被外部世界激活，但这种外倾仍保留着收回来整理自己的能力；你不是一直要热闹，而是更容易在互动中启动状态。" },
        clear: { band_nuance: "你的外倾已经比较明确。和人碰撞、即时反馈、现场感与变化感，通常会比独自封闭处理更能让你进入状态。" },
        strong: { band_nuance: "你的外倾倾向非常清楚。你往往需要通过对话、行动、连接与现场推进来保持能量，一旦长期被关在低反馈环境里，就很容易迅速失活。" },
      },
      I: {
        light: { band_nuance: "你更偏向把能量收回到内在世界，但这种内倾并不排斥连接；在合适的关系和话题里，你依然愿意打开自己。" },
        clear: { band_nuance: "你的内倾已经比较明确。独处、沉淀、内在加工和低刺激环境，会更稳定地帮助你恢复专注和判断。" },
        strong: { band_nuance: "你的内倾倾向非常清楚。你通常需要较大的心理空间来整理体验和形成观点，过多社交或持续外部打断会明显削弱你的能量质量。" },
      },
    },
    SN: {
      S: {
        light: { band_nuance: "你更偏向从可见事实和现实线索出发，但并不是拒绝想象；你只是更相信脚下能落地的东西。" },
        clear: { band_nuance: "你的实感倾向已经比较明确。你更容易先抓住证据、细节、步骤和现实限制，再决定怎么行动。" },
        strong: { band_nuance: "你的实感倾向非常清楚。你天然会优先信任眼前可验证的信息，对脱离现实支点的推演和空泛设想会更快失去耐心。" },
      },
      N: {
        light: { band_nuance: "你更偏向看见趋势、含义和可能性，但仍保留对现实条件的基本感知；你不是脱离地面，只是更容易先看到远方。" },
        clear: { band_nuance: "你的直觉倾向已经比较明确。你通常会比别人更早想到模式、方向和潜在空间，而不只盯着眼前事实。" },
        strong: { band_nuance: "你的直觉倾向非常清楚。你天然会沿着意义、隐含结构和未来可能性去理解世界，单纯停留在表层信息里会让你很快感到局促。" },
      },
    },
    TF: {
      T: {
        light: { band_nuance: "你更常从逻辑、效果和一致性切入判断，但并不是忽略感受；只是你会先问这件事是否合理、是否有效。" },
        clear: { band_nuance: "你的思考倾向已经比较明确。你在决策时更容易优先考虑结构、效率、边界和结果，而不是先被情绪牵引。" },
        strong: { band_nuance: "你的思考倾向非常清楚。你往往会本能地把问题拆开、排序、判断利弊，再决定行动方向；当环境过度情绪化时，你会更想把它拉回理性轨道。" },
      },
      F: {
        light: { band_nuance: "你更常从感受、关系与价值切入判断，但并不是没有逻辑；你只是更在意这件事对人意味着什么。" },
        clear: { band_nuance: "你的情感倾向已经比较明确。你在决策时更容易优先考虑关系质量、价值一致与情绪承接，而不只看表面的效率。" },
        strong: { band_nuance: "你的情感倾向非常清楚。你会天然把人的处境、关系影响和内在价值放进判断核心，因此很难长期接受只讲结果、不顾人感受的做法。" },
      },
    },
    JP: {
      J: {
        light: { band_nuance: "你更偏向先形成框架和判断，但仍保留一定弹性；你喜欢知道大致怎么走，只是不一定把一切都锁死。" },
        clear: { band_nuance: "你的判断倾向已经比较明确。你通常更安心于有计划、有节点、有预期的推进方式，不喜欢长期处在悬而未决的状态。" },
        strong: { band_nuance: "你的判断倾向非常清楚。你会自然追求结构、秩序、提前安排和收束感，长期模糊、频繁改动或毫无边界的节奏会很快消耗你。" },
      },
      P: {
        light: { band_nuance: "你更偏向保留空间和灵活应对，但并不是无法规划；你只是更希望计划能跟着现实一起调整。" },
        clear: { band_nuance: "你的感知倾向已经比较明确。你通常更自在于边走边看、动态修正和根据现场反馈调整节奏，而不是过早把一切定死。" },
        strong: { band_nuance: "你的感知倾向非常清楚。你会天然保留探索空间和变招余地，过度僵硬的规则、过细的预设和无法调整的流程会明显压缩你的状态。" },
      },
    },
    AT: {
      A: {
        light: { band_nuance: "你更偏向内在稳定和自我信任，但并不是完全不受波动影响；只是你比较容易在起伏里重新站稳。" },
        clear: { band_nuance: "你的果断倾向已经比较明确。你通常更容易保持心理重心，不会因为一时反馈就迅速推翻自己。" },
        strong: { band_nuance: "你的果断倾向非常清楚。你往往能在压力下维持较稳定的内在秩序和自我判断，不容易长期被外部噪音牵着走。" },
      },
      T: {
        light: { band_nuance: "你更偏向警觉、自我校准和反复审视，但这种敏感也让你保留了细腻与修正空间。" },
        clear: { band_nuance: "你的敏感倾向已经比较明确。你通常更容易察觉风险、缺口和未完成之处，因此会持续调整自己和周围环境。" },
        strong: { band_nuance: "你的敏感倾向非常清楚。你会天然保持较高的自我要求和环境警觉度，这会带来推进力与精细度，但也更容易让你长期紧绷、难以彻底放松。" },
      },
    },
  });

  const createTraitsUnlock = (chapter: "career" | "growth" | "relationships") => {
    const expressionKey =
      chapter === "career" ? "career_expression" : chapter === "growth" ? "growth_expression" : "relationship_expression";
    const advantageKey =
      chapter === "career" ? "career_advantage" : chapter === "growth" ? "growth_advantage" : "relationship_advantage";

    return {
      title: `${chapter} traits unlock title ${tag}`,
      intro: `${chapter} traits unlock intro ${tag}`,
      items: [1, 2, 3, 4].map((index) => ({
        id: `${chapter}-trait-${index}`,
        label: `${chapter} trait ${index} ${tag}`,
        role: `${chapter} role ${index} ${tag}`,
        definition: `${chapter} definition ${index} ${tag}`,
        why_it_matters: `${chapter} why ${index} ${tag}`,
        [expressionKey]: `${chapter} expression ${index} ${tag}`,
        [advantageKey]: `${chapter} advantage ${index} ${tag}`,
        overuse_risk: `${chapter} overuse ${index} ${tag}`,
        real_world_signal: `${chapter} signal ${index} ${tag}`,
        upgrade_hint: `${chapter} hint ${index} ${tag}`,
        links_to_existing_blocks: {
          summary: [`${chapter}.summary`],
        },
      })),
    };
  };

  const createInsightListModule = (moduleKey: string) => ({
    schema_version: "insight_list_v1",
    title: `${moduleKey} ${tag}`,
    intro: `${moduleKey} intro ${tag}`,
    items: [1, 2, 3, 4].map((index) => ({
      id: `${moduleKey}-${index}`,
      title: `${moduleKey} item ${index} ${tag}`,
      description: `${moduleKey} preview ${index} ${tag}`,
      body: `${moduleKey} body ${index} ${tag}`,
      why_it_matters: `${moduleKey} why ${index} ${tag}`,
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
  });

  return {
    ok: true,
    template_key: "mbti_desktop_clone_v1",
    schema_version: "v1",
    full_code: "INFJ-A",
    base_code: "INFJ",
    locale: "zh-CN",
    content: {
      hero: {
        summary: `hero ${tag}`,
        profile_identity: {
          code: "INFJ-A",
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
      letters_intro: {
        headline: `letters headline ${tag}`,
        letters: [
          { letter: "E", title: `letter E ${tag}`, description: `letter E body ${tag}` },
          { letter: "I", title: `letter I ${tag}`, description: `letter I body ${tag}` },
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
        axis_explainers: createAxisExplainers(),
      },
      chapters: {
        career: {
          intro: [`career intro 1 ${tag}`, `career intro 2 ${tag}`],
          strengths: {
            title: `career strengths ${tag}`,
            items: [
              { title: `career strengths item 1 ${tag}`, description: `career strengths body 1 ${tag}` },
            ],
          },
          weaknesses: {
            title: `career weaknesses ${tag}`,
            items: [
              { title: `career weaknesses item 1 ${tag}`, description: `career weaknesses body 1 ${tag}` },
            ],
          },
          matched_jobs: {
            title: `matched jobs ${tag}`,
            fit_bucket: "primary",
            summary: `matched jobs summary ${tag}`,
            fit_reason: `matched jobs reason ${tag}`,
            job_examples: [`job 1 ${tag}`, `job 2 ${tag}`],
          },
          matched_guides: {
            title: `matched guides ${tag}`,
            summary: `matched guides summary ${tag}`,
            fit_reason: `matched guides reason ${tag}`,
          },
          career_ideas: {
            title: `career ideas ${tag}`,
            items: [
              { title: `career ideas item 1 ${tag}`, description: `career ideas body 1 ${tag}` },
            ],
          },
          work_styles: {
            title: `work styles ${tag}`,
            items: [
              { title: `work styles item 1 ${tag}`, description: `work styles body 1 ${tag}` },
            ],
          },
          influentialTraits: [
            { label: `career trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `career trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `career trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `career trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          traits_unlock: createTraitsUnlock("career"),
          visibleBlocks: [
            {
              title: `career visible ${tag}`,
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
              overlayCtaLabel: "unlock",
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
              overlayCtaLabel: "unlock",
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
            items: [
              { title: `growth strengths item 1 ${tag}`, description: `growth strengths body 1 ${tag}` },
            ],
          },
          weaknesses: {
            title: `growth weaknesses ${tag}`,
            items: [
              { title: `growth weaknesses item 1 ${tag}`, description: `growth weaknesses body 1 ${tag}` },
            ],
          },
          what_energizes: createInsightListModule("what energizes"),
          what_drains: createInsightListModule("what drains"),
          influentialTraits: [
            { label: `growth trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `growth trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `growth trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `growth trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          traits_unlock: createTraitsUnlock("growth"),
          visibleBlocks: [
            {
              title: `growth visible ${tag}`,
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
              overlayCtaLabel: "unlock",
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
              overlayCtaLabel: "unlock",
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
            items: [
              { title: `relationships strengths item 1 ${tag}`, description: `relationships strengths body 1 ${tag}` },
            ],
          },
          weaknesses: {
            title: `relationships weaknesses ${tag}`,
            items: [
              { title: `relationships weaknesses item 1 ${tag}`, description: `relationships weaknesses body 1 ${tag}` },
            ],
          },
          superpowers: createInsightListModule("superpowers"),
          pitfalls: createInsightListModule("pitfalls"),
          influentialTraits: [
            { label: `relationships trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
            { label: `relationships trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
            { label: `relationships trait 3 ${tag}`, body: "body 3", colorKey: "green" },
            { label: `relationships trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
          ],
          traits_unlock: createTraitsUnlock("relationships"),
          visibleBlocks: [
            {
              title: `relationships visible ${tag}`,
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
              overlayCtaLabel: "unlock",
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
              overlayCtaLabel: "unlock",
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
        eyebrow: `offer eyebrow ${tag}`,
        headline: `offer headline ${tag}`,
        body: `offer body ${tag}`,
        priceLabel: `offer price ${tag}`,
        ctaLabel: `offer cta ${tag}`,
        guarantee: `offer guarantee ${tag}`,
      },
    },
    asset_slots: [
      {
        slot_id: "hero-illustration",
        label: "Hero cover",
        aspect_ratio: "236:160",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "traits-illustration",
        label: "Traits illustration",
        aspect_ratio: "636:148",
        status: "ready",
        asset_ref: {
          provider: "cdn",
          path: "mbti/desktop/traits/infj-a/v1.webp",
          url: "https://cdn.example.com/mbti/desktop/traits/infj-a/v1.webp",
          version: "v1",
          checksum: "sha256:abc",
        },
        alt: "Traits",
        meta: null,
      },
      {
        slot_id: "traits-summary-illustration",
        label: "Traits summary",
        aspect_ratio: "240:118",
        status: "disabled",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "career-illustration",
        label: "Career illustration",
        aspect_ratio: "636:148",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "growth-illustration",
        label: "Growth illustration",
        aspect_ratio: "636:148",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "relationships-illustration",
        label: "Relationships illustration",
        aspect_ratio: "636:148",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
      {
        slot_id: "final-offer-illustration",
        label: "Final offer illustration",
        aspect_ratio: "252:220",
        status: "placeholder",
        asset_ref: null,
        alt: null,
        meta: null,
      },
    ],
    _meta: {
      authority_source: "personality_profile_variant_clone_contents",
      route_mode: "full_code_exact",
      public_route_type: "32-type",
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("personality desktop clone api adapter contract", () => {
  it("normalizes locale and fullCode slug, then maps a published payload with compatibility fields retained", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("/api/v0.5/personality/infj-a/desktop-clone?");
      expect(url).toContain("locale=zh-CN");
      expect(url).toContain("org_id=0");
      expect(url).toContain("scale_code=MBTI");

      return jsonResponse(createValidPayload("seed"));
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");
    expect(result).not.toBeNull();
    expect(result?.templateKey).toBe("mbti_desktop_clone_v1");
    expect(result?.schemaVersion).toBe("v1");
    expect(result?.fullCode).toBe("INFJ-A");
    expect(result?.baseCode).toBe("INFJ");
    expect(result?.locale).toBe("zh-CN");
    expect(result?.content.hero.summary).toBe("hero seed");
    expect(result?.content.hero.profileIdentity?.code).toBe("INFJ-A");
    expect(result?.content.hero.profileIdentity?.name).toBe("name seed");
    expect(result?.content.hero.profileIdentity?.nickname).toBe("nickname seed");
    expect(result?.content.hero.profileIdentity?.rarity).toBe("rarity seed");
    expect(result?.content.hero.profileIdentity?.keywords).toEqual([
      "keyword 1 seed",
      "keyword 2 seed",
      "keyword 3 seed",
      "keyword 4 seed",
      "keyword 5 seed",
      "keyword 6 seed",
    ]);
    expect(result?.content.lettersIntro?.headline).toBe("letters headline seed");
    expect(result?.content.overview?.title).toBe("overview title seed");
    expect(result?.content.chapters.career.strengths?.items[0]?.description).toBe("career strengths body 1 seed");
    expect(result?.content.chapters.career.weaknesses?.items[0]?.description).toBe("career weaknesses body 1 seed");
    expect(result?.content.chapters.growth.strengths?.items[0]?.description).toBe("growth strengths body 1 seed");
    expect(result?.content.chapters.growth.weaknesses?.items[0]?.description).toBe("growth weaknesses body 1 seed");
    expect(result?.content.chapters.relationships.strengths?.items[0]?.description).toBe("relationships strengths body 1 seed");
    expect(result?.content.chapters.relationships.weaknesses?.items[0]?.description).toBe("relationships weaknesses body 1 seed");
    expect(result?.content.chapters.career.matchedJobs?.fitBucket).toBe("primary");
    expect(result?.content.chapters.career.matchedGuides?.fitReason).toBe("matched guides reason seed");
    expect(result?.content.chapters.career.traitsUnlock?.title).toBe("career traits unlock title seed");
    expect(result?.content.chapters.career.traitsUnlock?.items[0]?.label).toBe("career trait 1 seed");
    expect(result?.content.chapters.career.traitsUnlock?.items[0]?.expression).toBe("career expression 1 seed");
    expect(result?.content.chapters.career.traitsUnlock?.items[0]?.linksToExistingBlocks).toEqual({
      summary: ["career.summary"],
    });
    expect(result?.content.chapters.growth.traitsUnlock?.items[0]?.label).toBe("growth trait 1 seed");
    expect(result?.content.chapters.growth.traitsUnlock?.items[0]?.advantage).toBe("growth advantage 1 seed");
    expect(result?.content.chapters.growth.traitsUnlock?.items[0]?.linksToExistingBlocks).toEqual({
      summary: ["growth.summary"],
    });
    expect(result?.content.chapters.relationships.traitsUnlock?.items[0]?.label).toBe("relationships trait 1 seed");
    expect(result?.content.chapters.relationships.traitsUnlock?.items[0]?.expression).toBe("relationships expression 1 seed");
    expect(result?.content.chapters.relationships.traitsUnlock?.items[0]?.linksToExistingBlocks).toEqual({
      summary: ["relationships.summary"],
    });
    // Deprecated transition fields remain adapter-visible for compatibility,
    // but this assertion does not imply they are rendered in desktop main flow.
    expect(result?.content.chapters.career.careerIdeas?.items[0]?.description).toBe("career ideas body 1 seed");
    expect(result?.content.chapters.career.workStyles?.items[0]?.description).toBe("work styles body 1 seed");
    expect(result?.content.chapters.growth.whatEnergizes?.schemaVersion).toBe("insight_list_v1");
    expect(result?.content.chapters.growth.whatEnergizes?.intro).toBe("what energizes intro seed");
    expect(result?.content.chapters.growth.whatEnergizes?.items[0]?.description).toBe("what energizes preview 1 seed");
    expect(result?.content.chapters.growth.whatEnergizes?.items[0]?.body).toBe("what energizes body 1 seed");
    expect(result?.content.chapters.growth.whatEnergizes?.items[0]?.whyItMatters).toBe("what energizes why 1 seed");
    expect(result?.content.chapters.growth.whatEnergizes?.items[0]?.signals).toEqual([
      "what energizes signal 1a seed",
      "what energizes signal 1b seed",
    ]);
    expect(result?.content.chapters.growth.whatEnergizes?.items[0]?.actions.do).toBe("what energizes do 1 seed");
    expect(result?.content.chapters.growth.whatDrains?.items[0]?.actions.avoid).toBe("what drains avoid 1 seed");
    expect(result?.content.chapters.relationships.superpowers?.schemaVersion).toBe("insight_list_v1");
    expect(result?.content.chapters.relationships.superpowers?.items[0]?.body).toBe("superpowers body 1 seed");
    expect(result?.content.chapters.relationships.superpowers?.items[0]?.tags).toEqual(["superpowers", "seed"]);
    expect(result?.content.chapters.relationships.pitfalls?.items[0]?.whyItMatters).toBe("pitfalls why 1 seed");
    expect(result?.content.chapters.relationships.pitfalls?.items[0]?.actions.do).toBe("pitfalls do 1 seed");
    expect(result?.content.traits.axisExplainers?.EI?.E?.light?.bandNuance).toBe(
      "你明显更容易被外部世界激活，但这种外倾仍保留着收回来整理自己的能力；你不是一直要热闹，而是更容易在互动中启动状态。",
    );
    expect(result?.content.traits.axisExplainers?.SN?.N?.clear?.bandNuance).toBe(
      "你的直觉倾向已经比较明确。你通常会比别人更早想到模式、方向和潜在空间，而不只盯着眼前事实。",
    );
    expect(result?.content.traits.axisExplainers?.AT?.T?.strong?.bandNuance).toBe(
      "你的敏感倾向非常清楚。你会天然保持较高的自我要求和环境警觉度，这会带来推进力与精细度，但也更容易让你长期紧绷、难以彻底放松。",
    );
    expect(result?.assetSlots).toHaveLength(7);
    expect(result?.assetSlots[0]?.slotId).toBe("hero-illustration");
    expect(result?.assetSlots[1]?.status).toBe("ready");
    expect(result?.assetSlots[2]?.status).toBe("disabled");
    expect(result?.meta?.route_mode).toBe("full_code_exact");
  });

  it("accepts backend-redacted locked preview items without dropping the published desktop clone payload", async () => {
    const payload = createValidPayload("redacted");
    const chapters = payload.content.chapters as Record<string, Record<string, unknown>>;

    for (const chapter of Object.values(chapters)) {
      const lockedBlocks = chapter.lockedBlocks as Array<Record<string, unknown>>;
      for (const block of lockedBlocks) {
        block.blurredItems = Array.from({ length: 6 }, () => ({ is_locked: true }));
      }
    }

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(payload)));

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");

    expect(result).not.toBeNull();
    expect(result?.content.hero.summary).toBe("hero redacted");
    expect(result?.content.chapters.career.strengths?.items[0]?.description).toBe("career strengths body 1 redacted");
    expect(result?.content.chapters.career.lockedBlocks[0].blurredItems).toHaveLength(6);
    expect(result?.content.chapters.career.lockedBlocks[0].blurredItems[0]).toEqual({
      title: "career locked 1 redacted 1",
      body: "已隐藏的付费内容。解锁后可查看完整细节。",
      tone: "neutral",
      isPlaceholder: true,
    });
    expect(result?.content.chapters.growth.lockedBlocks[1].blurredItems[5]?.isPlaceholder).toBe(true);
    expect(result?.content.chapters.relationships.lockedBlocks[0].blurredItems[0]).not.toHaveProperty("is_locked");
  });

  it("returns null when locale is not zh/zh-CN and skips network", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "en");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps rendering-safe parsing when optional canonical and compatibility modules are missing", async () => {
    const payload = createValidPayload("partial");
    delete (payload.content as Record<string, unknown>).letters_intro;
    delete (payload.content as Record<string, unknown>).overview;
    const chapters = (payload.content as Record<string, unknown>).chapters as Record<string, unknown>;
    const career = chapters.career as Record<string, unknown>;
    const growth = chapters.growth as Record<string, unknown>;
    const relationships = chapters.relationships as Record<string, unknown>;
    delete career.matched_jobs;
    delete career.matched_guides;
    delete career.career_ideas;
    delete career.work_styles;
    delete growth.what_energizes;
    delete growth.what_drains;
    delete relationships.superpowers;
    delete relationships.pitfalls;
    delete career.traits_unlock;
    delete growth.traits_unlock;
    delete relationships.traits_unlock;

    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(payload)));

    const result = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh-CN");
    expect(result).not.toBeNull();
    expect(result?.content.lettersIntro).toBeUndefined();
    expect(result?.content.overview).toBeUndefined();
    expect(result?.content.chapters.career.matchedJobs).toBeUndefined();
    expect(result?.content.chapters.career.matchedGuides).toBeUndefined();
    expect(result?.content.chapters.career.careerIdeas).toBeUndefined();
    expect(result?.content.chapters.career.workStyles).toBeUndefined();
    expect(result?.content.chapters.growth.whatEnergizes).toBeUndefined();
    expect(result?.content.chapters.growth.whatDrains).toBeUndefined();
    expect(result?.content.chapters.relationships.superpowers).toBeUndefined();
    expect(result?.content.chapters.relationships.pitfalls).toBeUndefined();
    expect(result?.content.chapters.career.traitsUnlock).toBeUndefined();
    expect(result?.content.chapters.growth.traitsUnlock).toBeUndefined();
    expect(result?.content.chapters.relationships.traitsUnlock).toBeUndefined();
  });

  it("returns null for unsupported fullCode slug input", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPersonalityDesktopCloneContent("INFJ", "zh");
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when api responds not found or shape validation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({
            ok: false,
            error_code: "NOT_FOUND",
            message: "Not found",
          }, 404),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            ...createValidPayload("bad-shape"),
            content: {},
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            ...createValidPayload("bad-meta"),
            _meta: {
              route_mode: "base_code_fallback",
              public_route_type: "32-type",
            },
          }),
        ),
    );

    const miss = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");
    const badShape = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh-CN");
    const badMeta = await fetchPersonalityDesktopCloneContent("INFJ-A", "zh");

    expect(miss).toBeNull();
    expect(badShape).toBeNull();
    expect(badMeta).toBeNull();
  });

  it("keeps normalization helpers aligned with cutover contract", () => {
    expect(normalizeDesktopCloneApiLocale("zh")).toBe("zh-CN");
    expect(normalizeDesktopCloneApiLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeDesktopCloneApiLocale("en")).toBeNull();

    expect(normalizeDesktopCloneTypeSlug("INFJ-A")).toBe("infj-a");
    expect(normalizeDesktopCloneTypeSlug("entj-t")).toBe("entj-t");
    expect(normalizeDesktopCloneTypeSlug("INFJ")).toBeNull();
  });
});
