import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ESFJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先看气氛、关系和现实需要，再决定如何把人和事情安排稳。外界常先注意到你的热心和组织感，真正稳定的是你对关系秩序的持续维护。",
  intro: [
  "ESFJ 往往擅长把现场照顾好、把关系连起来、把执行细节补齐。你会自然留意谁被忽略、谁需要回应、什么安排会让局面更顺，而不是更乱。",
  "这让你在协作、服务、组织与关系维护里很有优势，也会让你更容易把他人的期待提前背到自己身上。对你来说，照顾别人和保留边界需要同时成立。"
],
  traits: {
    eyebrow: "人格概览",
    title: "关系组织感强",
    value: "先看现场需要",
    body: "你会自然从关系和现实需求出发，判断怎样安排才更稳。",
    paragraphs: [
  "你对人的状态、场面的流动和具体需求通常都很敏感，因此常能在别人还没察觉时就先把很多细节补上。这个能力让你很容易成为团队和关系里的稳定组织者。",
  "但如果环境长期把你的照应视为理所当然，而不给你对应的支持和边界，你会慢慢从热心变成疲惫。你需要的不只是被喜欢，也需要被认真分担。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你很适合那些需要组织协调、持续服务、关系维护和执行跟进的角色。你不只是会照顾现场，也会让流程真正顺起来。",
  "真正适合你的工作，通常允许你把对人的敏感和对细节的执行一起用出来，而不是长期处在高压冲撞、职责含混和反馈迟钝的环境里。"
],
      influentialTraits: [
          { label: "组织", colorKey: "blue", body: "会把现场安排好" },
          { label: "照顾", colorKey: "gold", body: "知道谁需要回应" },
          { label: "执行", colorKey: "green", body: "会把细节补齐" },
          { label: "稳定", colorKey: "purple", body: "想让局面更顺" }
        ],
      strengths: [
          { title: "现场协调强", body: "你能让多人合作时的细节和节奏更顺。" },
          { title: "氛围照顾稳", body: "你会留意哪些安排会让人更愿意参与。" },
          { title: "执行服务强", body: "你擅长把照顾和交付落到具体动作上。" },
          { title: "关系持续力高", body: "你能长期维护联系，而不是只在开始时热情。" },
          { title: "细节跟进稳", body: "很多零散但关键的环节，你会主动补齐。" },
          { title: "群体稳定器", body: "你常能让现场从散乱回到可合作状态。" }
        ],
      weaknesses: [
          { title: "过度迎合", body: "为了让局面顺，你可能答应超出边界的需求。" },
          { title: "难拒绝", body: "你不喜欢让别人失望，因此更晚说不。" },
          { title: "对评价敏感", body: "反馈一旦变冷，你容易先怀疑自己是否做得不够。" },
          { title: "冲突回避", body: "很多该正面处理的问题，你会先尝试绕开。" },
          { title: "忙而不精", body: "如果过多事务同时压上来，你容易先忙着补位。" },
          { title: "关系责任过量", body: "你可能把维持合作和关系的负担揽得太多。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最适合你的组织协调、关系维护与执行跟进能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种节奏、反馈和职责边界里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再变得更有责任感，而是学会把责任感和取舍感一起放进系统里。你已经很会照顾和协调，下一步更关键的是别让照顾长期替代边界。",
  "当你愿意把自己的需求也视作系统中的一项重要输入，而不是永远排到最后，很多付出会变得更可持续。"
],
      influentialTraits: [
          { label: "照顾", colorKey: "blue", body: "会主动补位" },
          { label: "取舍", colorKey: "gold", body: "要学会筛选" },
          { label: "边界", colorKey: "green", body: "别全都接住" },
          { label: "恢复", colorKey: "purple", body: "也要轮到自己" }
        ],
      strengths: [
          { title: "责任感稳定", body: "你面对长期合作时通常很少轻易掉线。" },
          { title: "经验会落地", body: "你能把照顾和执行变成越来越成熟的方法。" },
          { title: "恢复靠秩序", body: "可预期、有人回应的环境通常能让你回稳。" },
          { title: "支持别人有力", body: "你擅长用具体行动给别人安全感。" },
          { title: "长期投入强", body: "对认定重要的人和事，你愿意一直做下去。" },
          { title: "调整意愿高", body: "只要看到更好的做法，你通常愿意修正自己。" }
        ],
      weaknesses: [
          { title: "边界延迟", body: "你可能拖到很累才真正意识到自己需要停。" },
          { title: "太在意外部回应", body: "别人冷下来时，你容易把问题先收到自己身上。" },
          { title: "取舍偏晚", body: "很多事情都想照顾时，你很难先砍掉一部分。" },
          { title: "恢复排后面", body: "你会先确保别人没问题，再处理自己的状态。" },
          { title: "冲突拖延", body: "很多该说清的界限，你会拖到很后面。" },
          { title: "内耗来自关系", body: "你容易因为关系不稳而比别人更快掉能量。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、反馈和支持方式最能保护你的稳定照应能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些过度迎合和边界延迟最容易让你透支。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你很重视回应、陪伴和具体照顾。你不一定把很多道理挂在嘴上，但会通过记得、安排和持续出现来表达这段关系的重要性。",
  "你能给关系带来很多温度和稳定感，但如果长期只有你在维持、你在记得、你在补救，你会慢慢感觉自己像是在一个人守着关系。"
],
      influentialTraits: [
          { label: "回应", colorKey: "blue", body: "会及时接住" },
          { label: "陪伴", colorKey: "gold", body: "在场感强" },
          { label: "安排", colorKey: "green", body: "会把细节照顾好" },
          { label: "边界", colorKey: "purple", body: "也需要被照顾" }
        ],
      strengths: [
          { title: "在场感强", body: "你会让对方清楚感受到自己被记得和被回应。" },
          { title: "照顾很具体", body: "你的关心常常落在真实需要而不是空话上。" },
          { title: "关系经营稳", body: "你擅长维持长期互动，而不只是开头热情。" },
          { title: "情绪承接好", body: "对方状态起伏时，你通常能较快接住。" },
          { title: "生活稳定感强", body: "你能让关系里的很多日常变得更顺。" },
          { title: "修复意愿高", body: "只要关系值得，你通常愿意把问题拉回来谈。" }
        ],
      weaknesses: [
          { title: "需求藏后面", body: "你常先顾别人，再说自己真正缺什么。" },
          { title: "过量补位", body: "很多本该共同承担的维护工作会先落到你身上。" },
          { title: "对冷回应敏感", body: "如果长期得不到回应，你会明显受伤。" },
          { title: "冲突不够早", body: "为了不破坏气氛，你可能拖到最后才谈边界。" },
          { title: "评价影响大", body: "对方一个冷淡信号就可能让你想很多。" },
          { title: "失衡后才喊停", body: "很多不公平你能感觉到，但不一定会马上停。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的照顾方式、在场感与修复优势。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些过度迎合和需求延后最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的组织与照顾能力用在更可持续的关系里",
    body: "解锁后可继续查看更细的职业协作、成长边界与关系节奏，让照顾别人不再只靠你一个人兜底。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ESFJ_ZH_CONTENT;
