import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ISFJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先看谁需要被照顾、什么细节容易漏掉、怎样做才能让局面更稳。外界常感受到你的温和，真正稳定的是你对关系和责任的持续留意。",
  intro: [
  "ISFJ 更习惯从具体的人、具体的需要和具体的细节进入判断。你会自然留意别人是否被忽略、安排是否周到、承诺是否真正落到了对的人身上。",
  "这让你在支持、协作、照看和长期维护里很有优势，也会让你更容易把别人的需求提前放进自己的优先级。对你来说，稳定常常来自把细节照看好。"
],
  traits: {
    eyebrow: "人格概览",
    title: "细致而稳定",
    value: "先看照应",
    body: "你会自然从具体需要出发，判断怎样做才算真正有帮助。",
    paragraphs: [
  "你通常不是靠强存在感影响别人，而是通过细致、可靠和持续的照应让关系与合作真正稳下来。很多人会把这种能力理解成温和，其实它背后是很强的责任感和观察力。",
  "但如果环境长期把你的照看视为理所当然，而不给你明确边界和回馈，你的能量会被持续抽走。你需要的不只是被需要，也需要被认真看见。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你很适合那些需要高可靠度、细节照看、长期服务和稳定协作的角色。你未必追求高曝光，但很擅长把别人忽略的环节真正补齐。",
  "真正适合你的工作，通常允许你把耐心、观察力和责任心用到具体的人和流程上，而不是长期把你置于含糊、混乱和高压抢话语权的环境里。"
],
      influentialTraits: [
          { label: "照看", colorKey: "blue", body: "会留意细节" },
          { label: "稳定", colorKey: "gold", body: "持续把事做稳" },
          { label: "责任", colorKey: "green", body: "愿意补位" },
          { label: "耐心", colorKey: "purple", body: "能长期陪跑" }
        ],
      strengths: [
          { title: "关系维护稳", body: "你能让协作中的很多细小环节真正被照顾到。" },
          { title: "细节执行强", body: "面对具体任务时，你通常能把收尾做得很完整。" },
          { title: "稳定履约", body: "一旦认领责任，你会尽量把事情做稳而不是只做完。" },
          { title: "情境记忆强", body: "你会记住别人真正需要什么以及何时需要。" },
          { title: "支持落地稳", body: "你擅长把抽象关怀转成具体可执行的帮助。" },
          { title: "节奏平衡", body: "你能让关系和任务维持在较可持续的速度上。" }
        ],
      weaknesses: [
          { title: "先照顾别人", body: "你会太早把别人需求放进自己的负担里。" },
          { title: "需求表达慢", body: "很多不适你能感觉到，但未必会及时说。" },
          { title: "对冲突敏感", body: "高压正面冲撞会快速拉高你的消耗。" },
          { title: "边界延后", body: "为了维持和气，你可能会晚于需要的时候说不。" },
          { title: "对评价在意", body: "如果长期得不到明确反馈，你容易怀疑自己是否做得不够。" },
          { title: "长期补位", body: "系统失衡时，你会先默默把空缺补上。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最适合你的细节照看、稳定服务与长期支持能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种节奏、职责边界和反馈方式里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再变得更有责任感，而是学会让责任感和边界一起存在。你已经很会照顾别人，下一步更关键的是别让照顾自动变成长期透支。",
  "当你愿意把自己的需求也视作需要被认真响应的信息，而不是总排到最后，很多成长会从被动扛住，变成更主动的调整。"
],
      influentialTraits: [
          { label: "照顾", colorKey: "blue", body: "会先想到别人" },
          { label: "边界", colorKey: "gold", body: "需要更早说出" },
          { label: "恢复", colorKey: "green", body: "别总排到最后" },
          { label: "稳定", colorKey: "purple", body: "按节奏修正" }
        ],
      strengths: [
          { title: "自我修正稳", body: "你会从具体经验里慢慢调整自己的做法。" },
          { title: "长期耐心足", body: "对重要关系和任务，你能维持很久的投入。" },
          { title: "恢复靠安定", body: "稳定、可预期的环境通常能让你很快回稳。" },
          { title: "经验沉淀强", body: "你会把做过的照看变成越来越成熟的方法。" },
          { title: "责任感可持续", body: "只要节奏合适，你能长期稳定地承担。" },
          { title: "支持别人有力", body: "你很擅长在别人需要时提供实际、持续的支持。" }
        ],
      weaknesses: [
          { title: "自己排最后", body: "你常常知道自己累了，但还是先顾别人。" },
          { title: "求助偏晚", body: "即使已经超负荷，你也不一定会主动开口。" },
          { title: "边界不够早", body: "很多委屈要到很后面才会被你说出来。" },
          { title: "对评价敏感", body: "关系和工作里若反馈模糊，你会更容易内耗。" },
          { title: "压力长期积累", body: "你可能先撑着，直到状态明显下降才停下。" },
          { title: "把问题内化", body: "局面失衡时，你容易先问是不是自己做得不够。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、支持和恢复条件最能保护你的稳定照看能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些边界延后和长期补位最容易耗损你。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你会自然留意对方的需求、习惯和情绪变化，并尝试把很多具体的事提前照顾好。你不一定高调表达，但会通过持续行动说明这段关系的重要性。",
  "你能给关系带来很强的稳定感，但如果长期只有你在维持、你在记得、你在补位，你会慢慢失去轻松感。对你来说，被珍惜应该也是具体的。"
],
      influentialTraits: [
          { label: "细致", colorKey: "blue", body: "会记得很多细节" },
          { label: "稳定", colorKey: "gold", body: "关系要可依赖" },
          { label: "照顾", colorKey: "green", body: "会主动补位" },
          { label: "边界", colorKey: "purple", body: "也需要被照顾" }
        ],
      strengths: [
          { title: "体贴具体", body: "你会把关心落到对方真正需要的细节上。" },
          { title: "长期照看稳", body: "你不只是热情开始，更能持续把关系维护好。" },
          { title: "承诺感强", body: "重要关系里，你通常愿意长期负责。" },
          { title: "情绪留意细", body: "你会比多数人更早注意到对方状态变化。" },
          { title: "修复意愿高", body: "关系出现摩擦时，你通常不想轻易放掉。" },
          { title: "生活稳定感强", body: "你能让关系里的很多日常变得更可依赖。" }
        ],
      weaknesses: [
          { title: "委屈说得晚", body: "你常常已经累了很久，才真正表达不舒服。" },
          { title: "过度补位", body: "你容易把很多本不该由你负责的事也做掉。" },
          { title: "对冷淡敏感", body: "如果长期只有你在回应，你会明显受伤。" },
          { title: "冲突回避", body: "很多该说清的事，你会先想办法缓过去。" },
          { title: "把需要藏起来", body: "你不想给别人添麻烦，于是更晚让人知道你也有需要。" },
          { title: "关系责任过量", body: "你可能把关系运转本身也背成自己的任务。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的照看方式、承诺模式与支持优势。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些委屈延后和过度补位最容易让你在关系里透支。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的支持力和边界感一起保留下来",
    body: "解锁后可继续查看更细的职业协作、成长节奏与关系盲点，让照顾别人不再只靠你自己硬撑。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ISFJ_ZH_CONTENT;
