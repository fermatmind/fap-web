import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ISTP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先判断问题在哪、手上有什么工具、有没有更快的修法，再决定是否出手。外界常先感受到你的冷静和效率，真正稳定的是你对现实反馈的敏感。",
  intro: [
  "ISTP 更习惯从现场、工具和可验证结果进入判断，而不是先谈一套大而空的方向。你会自然去看卡点在哪里、什么可以立刻修、什么不值得多说。",
  "这让你在排障、应急、实操、独立处理复杂问题时很有优势，也会让你对过度流程、重复解释和高密度情绪讨论更敏感。对你来说，有用比好听重要。"
],
  traits: {
    eyebrow: "人格概览",
    title: "现场判断快",
    value: "先看能否修",
    body: "你更信任现实反馈、工具感和直接有效的处理方式。",
    paragraphs: [
  "你通常不会先被宏大叙事或群体情绪带着跑，而是更自然地回到具体问题、可操作条件和真实反馈。这个判断习惯让你在需要冷静、灵活和独立处理的场景里很有优势。",
  "但如果外部长期要求你高频解释、反复对齐或在没有实质进展的讨论里停留太久，你会明显掉耐心。你需要的是能动手、能试、能修的空间。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你很适合那些需要现场判断、快速排障、独立处理和工具意识的职责。你不一定偏好层层讨论，但很擅长在问题真正出现时把它快速拆开。",
  "真正适合你的工作，通常允许你保留行动自由、把复杂问题转成可操作步骤，并且少一点空转、多一点现实反馈。"
],
      influentialTraits: [
          { label: "排障", colorKey: "blue", body: "先定位问题" },
          { label: "工具", colorKey: "gold", body: "会找最顺手的解法" },
          { label: "冷静", colorKey: "green", body: "现场不易慌" },
          { label: "灵活", colorKey: "purple", body: "会边试边调" }
        ],
      strengths: [
          { title: "问题定位快", body: "你常能迅速看出真正卡住局面的点在哪里。" },
          { title: "工具意识强", body: "你会自然寻找最有效、最省动作的解决路径。" },
          { title: "冷静止损", body: "现场压力上来时，你通常还能保持清醒。" },
          { title: "独立处理稳", body: "很多复杂问题你更喜欢自己拆开来做。" },
          { title: "反应灵活", body: "条件变化时，你能快速换一种更可行的打法。" },
          { title: "低噪执行", body: "你不一定话多，但很能在安静里把事做完。" }
        ],
      weaknesses: [
          { title: "长期规划弱", body: "你更擅长先处理眼前问题，而不是先搭长线蓝图。" },
          { title: "情绪表达少", body: "你未必愿意花很多时间解释自己此刻的感受。" },
          { title: "不爱解释", body: "你知道怎么做，但不一定想把思路讲得很长。" },
          { title: "对管控敏感", body: "被持续盯细节和过程时，你容易立刻掉耐心。" },
          { title: "重复维护烦", body: "一旦问题进入长期机械维护期，你的投入会下降。" },
          { title: "突然抽离", body: "当讨论长期空转时，你可能直接减少参与。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的排障、判断与独立处理能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种自由度、反馈密度和管理边界里最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再变得更能应付现场，而是让现场能力延伸到长期节奏。你已经很会处理当下，下一步更关键的是给自己建立一点点稳定的复盘和计划。",
  "当你愿意把经验整理成更可预期的方法，而不是每次都从零开始应对，很多优势会从临场反应升级成真正的长期资产。"
],
      influentialTraits: [
          { label: "复盘", colorKey: "blue", body: "把经验沉下去" },
          { label: "节奏", colorKey: "gold", body: "给自己留一点计划" },
          { label: "空间", colorKey: "green", body: "需要独立恢复" },
          { label: "收束", colorKey: "purple", body: "别只顾眼前解法" }
        ],
      strengths: [
          { title: "适应环境快", body: "陌生局面出现时，你常能迅速找到操作入口。" },
          { title: "学习靠实践", body: "你更容易在真实操作里快速学会一件事。" },
          { title: "不怕修正", body: "方法不对时，你通常能立即换路而不纠缠。" },
          { title: "恢复靠独处", body: "低噪音和自由空间通常能让你迅速回血。" },
          { title: "行动力直接", body: "一旦看清问题，你通常不会拖着不处理。" },
          { title: "经验能提效", body: "你做过一次的事，下次往往能更快做对。" }
        ],
      weaknesses: [
          { title: "计划感较弱", body: "你更擅长应对变化，而不是长期排布。" },
          { title: "表达修正少", body: "你可能已经调整了做法，但未必会说明。" },
          { title: "只看眼前可修", body: "一些长期问题可能被你先压成局部修补。" },
          { title: "关系求助偏少", body: "即使状态不佳，你也不一定愿意主动麻烦别人。" },
          { title: "维护期掉能量", body: "问题解决后进入重复维护时，你容易失去兴致。" },
          { title: "恢复边界太硬", body: "如果被过度打扰，你会立刻把自己抽走。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、空间和复盘方式最能放大你的现场优势。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些只顾眼前解法的模式最容易拖慢长期积累。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重舒服、真实、不过度控制。你不一定喜欢高密度情绪讨论，但会用行动、陪同和问题处理来表达在意。",
  "你能给关系带来轻松和实用的一面，但如果对方把很多未说清的期待都压到你身上，你会明显想抽离。对你来说，关系最好少一点控制，多一点自在。"
],
      influentialTraits: [
          { label: "自在", colorKey: "blue", body: "不爱被管" },
          { label: "实际", colorKey: "gold", body: "会用行动表达" },
          { label: "冷静", colorKey: "green", body: "问题来时先处理" },
          { label: "边界", colorKey: "purple", body: "需要被尊重" }
        ],
      strengths: [
          { title: "低控制感", body: "你不喜欢用占有和管理来维持关系。" },
          { title: "问题处理直接", body: "遇到现实问题时，你会倾向先动手解决。" },
          { title: "陪同感轻松", body: "你通常能让关系少一点表演、多一点自在。" },
          { title: "行动表达稳", body: "你未必话多，但会在关键处真正出现。" },
          { title: "不爱制造戏剧", body: "很多时候你更偏好把事情做实，而不是放大情绪。" },
          { title: "尊重空间", body: "你愿意让彼此保留自己的活动和节奏。" }
        ],
      weaknesses: [
          { title: "情绪回应短", body: "对需要高密度情绪交流的关系，你容易疲惫。" },
          { title: "不爱解释很多", body: "你可能已经在意，但未必会长篇说明。" },
          { title: "突然抽离", body: "一旦感到被控制或被缠住，你会迅速后撤。" },
          { title: "承诺节奏慢", body: "你不喜欢被太快拉进高黏度安排。" },
          { title: "边界表达硬", body: "当你不舒服时，可能直接切断而不是慢慢说。" },
          { title: "关系维护被动", body: "如果没有明确刺激，你不一定会主动高频经营。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的自在感、行动支持与边界优势。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些抽离、解释过少和低维护倾向最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的现场判断延伸到长期策略",
    body: "解锁后可继续查看更细的职业选择、成长节奏与关系边界，让临场优势真正接到长期结果。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ISTP_ZH_CONTENT;
