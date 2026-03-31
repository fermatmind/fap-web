import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const INFP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先确认一件事是否与你真正认同的价值一致，再决定要不要投入。外界常看到你的温和，真正稳定的是你对意义和真实感的坚持。",
  intro: [
  "INFP 更习惯先感受一件事是否值得，再考虑如何参与。你会自然留意语言背后的诚意、关系中的不对称，以及一个环境到底是要求你合作，还是要求你长期压掉自己。",
  "这让你在表达、理解、创作和深度连接里很有优势，也会让你对高压比较、粗暴节奏和价值失真更敏感。对你来说，能做不等于应该做。"
],
  traits: {
    eyebrow: "人格概览",
    title: "意义优先",
    value: "先看是否值得",
    body: "你更在意一件事是否真实、有意义，以及是否允许你保留自己的内在标准。",
    paragraphs: [
  "你会本能地把注意力放在真正重要的东西上：人是否真诚，关系是否公平，工作是否只是效率机器，还是仍然保留人的位置。这个判断过程通常比外界看到的更坚定。",
  "一旦环境要求你反复妥协这些标准，你的状态会明显下滑；但只要方向与你认同的价值一致，你的投入和韧性往往比外界想象得更强。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你更适合那些允许你保留判断、表达真实感，并把价值和工作连接起来的角色。你不一定偏好强管控竞争，但很适合做深度创作、理解与长期陪伴。",
  "比起在高噪音体系里不断证明自己，你更适合在有余地、有信任、能把个人标准用出来的场景里长期积累。对你来说，岗位不是标签，而是你要不要把时间交出去。"
],
      influentialTraits: [
          { label: "价值", colorKey: "blue", body: "先看是否认同" },
          { label: "共感", colorKey: "gold", body: "对人很敏锐" },
          { label: "表达", colorKey: "green", body: "适合深层传达" },
          { label: "坚持", colorKey: "purple", body: "内在标准稳定" }
        ],
      strengths: [
          { title: "价值辨认", body: "你能较快判断一件事是否值得长期投入。" },
          { title: "深度共感", body: "你对人的处境和情绪变化通常有较高敏感度。" },
          { title: "文字表达", body: "你擅长把复杂感受和隐性问题讲得有层次。" },
          { title: "长期投入", body: "一旦认同方向，你往往会持续打磨下去。" },
          { title: "独立思考", body: "你不会轻易把外部标准直接替换成自己的判断。" },
          { title: "温和坚持", body: "你不一定高压推进，但能长期守住重要原则。" }
        ],
      weaknesses: [
          { title: "决断偏慢", body: "在价值不明时，你很难快速做出选择。" },
          { title: "边界延后", body: "为了维持关系或和气，你可能太晚表达不适。" },
          { title: "价值失真敏感", body: "当环境只剩指标时，你容易快速掉投入感。" },
          { title: "执行受情绪影响", body: "内在状态起伏时，推进节奏也会明显波动。" },
          { title: "不爱硬碰硬", body: "面对粗暴权力结构时，你可能先选择绕开。" },
          { title: "容易自责", body: "事情没做好时，你可能先怀疑自己是否辜负了标准。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位更适合你的价值判断、表达能力和长期投入方式。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种节奏、授权边界和反馈方式里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是变得更强硬，而是让价值感和边界感一起变清楚。你已经很会理解别人，下一步更关键的是别让理解自动变成长期让步。",
  "当你把抽象的理想拆成可执行的小步，而不是一次要求自己活成完整版本，很多内耗会明显下降。成长不是背叛敏感，而是让敏感有容器。"
],
      influentialTraits: [
          { label: "真诚", colorKey: "blue", body: "先对自己诚实" },
          { label: "感受", colorKey: "gold", body: "保留情绪信息" },
          { label: "边界", colorKey: "green", body: "学会及时说不" },
          { label: "沉淀", colorKey: "purple", body: "慢慢形成方法" }
        ],
      strengths: [
          { title: "自我觉察强", body: "你能看见自己真正被什么触发和消耗。" },
          { title: "愿意修正", body: "只要认定方向更真实，你通常愿意调整做法。" },
          { title: "经验会沉淀", body: "你能慢慢把感受整理成自己的判断原则。" },
          { title: "恢复需要真实", body: "当外界允许你按真实状态生活时，你恢复很快。" },
          { title: "长期韧性高", body: "对认同的事情，你的耐心往往比外界想象得更强。" },
          { title: "适合慢升级", body: "你擅长做那种需要长期积累的内在重建。" }
        ],
      weaknesses: [
          { title: "理想压得过满", body: "你可能同时要求真实、善良、有效，最后先累到自己。" },
          { title: "情绪内耗久", body: "不舒服时，你可能在心里反复咀嚼很久。" },
          { title: "求助偏晚", body: "即使需要支持，你也不一定愿意开口麻烦别人。" },
          { title: "行动起步慢", body: "当方向还没完全对齐时，你很难真正开始。" },
          { title: "边界说得晚", body: "很多不适你能感觉到，但未必会马上表达。" },
          { title: "把问题内化", body: "关系或环境失真时，你容易先怪自己不够好。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、支持与恢复方式最能保护你的价值感。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些内耗模式最容易拖慢你的行动与恢复。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重真实、理解和不被强迫改变。你愿意投入很深，但这种投入通常建立在对方是否真诚、是否尊重你的感受与节奏上。",
  "你不喜欢关系被经营成交换，也不喜欢需要不断证明自己有多在意。对你来说，好的亲密感通常来自被理解，而不是被管理。"
],
      influentialTraits: [
          { label: "真实", colorKey: "blue", body: "关系要真诚" },
          { label: "柔软", colorKey: "gold", body: "需要被理解" },
          { label: "边界", colorKey: "green", body: "不想被压迫" },
          { label: "深度", colorKey: "purple", body: "偏好深连接" }
        ],
      strengths: [
          { title: "关系有真诚感", body: "你会很在意这段关系是否真的能说真话。" },
          { title: "共情能力强", body: "你常能较快感受到对方没说出口的情绪。" },
          { title: "投入很深", body: "当关系值得时，你往往会给出长期而稳定的投入。" },
          { title: "尊重差异", body: "你不喜欢把亲密变成控制和同化。" },
          { title: "表达有温度", body: "你擅长用不刺人的方式讲重要的事。" },
          { title: "愿意一起成长", body: "你在意关系能否同时保护两个人的内在空间。" }
        ],
      weaknesses: [
          { title: "需求说得晚", body: "你常常先理解对方，最后才轮到自己。" },
          { title: "对冷淡敏感", body: "对方若长期敷衍或迟钝，你会迅速受伤。" },
          { title: "失望自己消化", body: "很多委屈你不会立刻说，而是默默退后。" },
          { title: "边界不够早", body: "为了维持温和，你可能拖到很累才真正设边界。" },
          { title: "冲突回避", body: "知道该谈时，你也可能因为怕失真而先沉默。" },
          { title: "容易理想化", body: "关系早期若感受到高度共鸣，你可能先给太多期待。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的理解力、投入方式与修复倾向。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些理想化、延迟表达与过度体谅最容易伤到你。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把价值判断落成更稳定的选择",
    body: "解锁后可继续查看更细的职业匹配、成长节奏与关系误区，让敏感不再只停留在感觉层。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与所有真实动作入口。",
  },
});

export default INFP_ZH_CONTENT;
