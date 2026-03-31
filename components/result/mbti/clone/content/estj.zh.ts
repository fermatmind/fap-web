import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ESTJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先确认目标、责任和执行纪律，再决定如何推进。外界常先感受到你的直接和效率感，真正稳定的是你对秩序、结果和兑现的要求。",
  intro: [
  "ESTJ 往往擅长在混乱里迅速拉清目标、明确分工、压住节奏，并让一件事进入真正可执行的状态。你不只是想把事情做完，更想让它按标准完成。",
  "这让你在带队、统筹、执行管理和现场推进里很有优势，也会让你对含糊、拖延、低标准和重复失误更敏感。对你来说，秩序是效率的前提。"
],
  traits: {
    eyebrow: "人格概览",
    title: "执行轴很稳",
    value: "责任优先",
    body: "你会自然先确认目标、边界与分工，再推动事情往结果靠拢。",
    paragraphs: [
  "你通常不会把很多时间花在模糊和试探上，而是更愿意尽快把优先级排出来、把责任放到对应的人手里、把执行节奏拉到正轨。这个习惯让你很适合带着事情向前走。",
  "但如果你总是只看结果而忽略承接方式，别人可能先感受到压强。你需要的不是降低标准，而是知道怎样让标准更容易被接住。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你很适合那些需要明确目标、组织执行、把控进度和压实责任的角色。你未必偏好过多试探，但很擅长把局面从散乱拉回可管理状态。",
  "真正适合你的工作，通常允许你对结果、流程和分工有足够掌控，而不是长期被困在责任不明、标准漂浮和进度松散的环境里。"
],
      influentialTraits: [
          { label: "执行", colorKey: "blue", body: "先把事落下去" },
          { label: "标准", colorKey: "gold", body: "结果要过线" },
          { label: "统筹", colorKey: "green", body: "分工要清楚" },
          { label: "压进", colorKey: "purple", body: "会推着往前" }
        ],
      strengths: [
          { title: "目标推进强", body: "你能把事情从讨论阶段迅速拉到执行阶段。" },
          { title: "责任分派清", body: "你擅长明确谁该做什么以及何时交付。" },
          { title: "秩序搭建稳", body: "面对混乱局面，你通常会先把节奏拉直。" },
          { title: "执行跟进实", body: "你不会只给方向，还会盯住关键节点。" },
          { title: "结果导向强", body: "你会持续确认事情有没有真正向目标靠近。" },
          { title: "资源调度快", body: "你能较快判断哪里需要补人、补动作或补规则。" }
        ],
      weaknesses: [
          { title: "语气偏硬", body: "在压力下，你的提醒方式容易让人先感到被压。" },
          { title: "耐心有限", body: "面对慢节奏和反复确认时，你容易烦躁。" },
          { title: "默认别人跟上", body: "你可能高估别人接收标准和节奏的速度。" },
          { title: "模糊容忍低", body: "边界不清和责任漂浮会迅速拉高你的压力。" },
          { title: "控制感偏强", body: "当执行失控时，你容易把更多东西收回自己手里。" },
          { title: "休息滞后", body: "你常在事情处理完后才意识到自己已经累。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的执行力、秩序感与统筹能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种目标密度、汇报边界和团队响应下最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再更强势一点，而是让标准和弹性一起存在。你已经很会把事情推进下去，下一步更关键的是在不牺牲结果的前提下提高承接质量。",
  "当你愿意把一部分注意力从盯结果，转向看别人为什么跟不上，以及怎样让系统本身更容易被执行，很多压力会从纯粹的压强变成更有效的带动。"
],
      influentialTraits: [
          { label: "标准", colorKey: "blue", body: "先定要求" },
          { label: "承接", colorKey: "gold", body: "学会让人接住" },
          { label: "调配", colorKey: "green", body: "资源要重分配" },
          { label: "恢复", colorKey: "purple", body: "别总压满自己" }
        ],
      strengths: [
          { title: "执行自律强", body: "确定方向后，你通常能长期保持推进节奏。" },
          { title: "问题处理快", body: "你不喜欢把问题悬着，会尽快处理关键项。" },
          { title: "经验能制度化", body: "你会把一次经验整理成下次更稳的规则。" },
          { title: "责任承载高", body: "面对高压任务时，你通常不会轻易后退。" },
          { title: "优先级清楚", body: "你能较快判断哪些事必须先做、先补、先停。" },
          { title: "长期推进稳", body: "只要目标明白，你通常能持续拉住局面。" }
        ],
      weaknesses: [
          { title: "总想再压一点", body: "事情紧时，你容易先加压自己而不是调结构。" },
          { title: "柔性回应少", body: "你知道问题在哪，但未必总照顾对方接收方式。" },
          { title: "恢复排最后", body: "你会先把任务做完，再考虑自己状态。" },
          { title: "对慢人烦躁", body: "别人节奏慢时，你容易直接接管而不是带动。" },
          { title: "自我要求过硬", body: "结果没达到时，你可能先质疑自己是否压得不够。" },
          { title: "把管理变成控制", body: "压力上来时，你可能会扩大想掌控的范围。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏、授权和恢复方式最能让你的推进力更可持续。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些过度控制和恢复滞后最容易拖慢你的长期升级。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重可靠、直接和把问题讲清楚。你不会天然回避责任，也不喜欢让关系长期停在模糊区，因此常会主动推动双方把话说开。",
  "你能给关系带来很强的确定感，但如果只强调规则和结果，对方可能会先感到压力。对你来说，好的关系不只是运转顺，而是也能让人愿意继续靠近。"
],
      influentialTraits: [
          { label: "可靠", colorKey: "blue", body: "说到做到" },
          { label: "直接", colorKey: "gold", body: "问题会说清" },
          { label: "责任", colorKey: "green", body: "愿意往前站" },
          { label: "承接", colorKey: "purple", body: "需要更柔一些" }
        ],
      strengths: [
          { title: "确定感强", body: "你能让关系里的很多事不再悬着不定。" },
          { title: "承诺兑现", body: "你通常会认真履行自己说过的话。" },
          { title: "问题会处理", body: "遇到现实问题时，你不会轻易拖着不谈。" },
          { title: "责任感稳定", body: "重要关系里，你往往会主动承担该承担的部分。" },
          { title: "节奏拉得直", body: "你能让混乱关系更快回到清楚状态。" },
          { title: "边界明白", body: "你知道什么能接受，什么需要被明确改掉。" }
        ],
      weaknesses: [
          { title: "语气压强大", body: "当你只想解决问题时，对方可能先感到被管。" },
          { title: "柔软回应少", body: "你会更快进入结论，而不是先接住感受。" },
          { title: "耐心偏短", body: "面对重复失误和反复失信时，你容易变硬。" },
          { title: "容易接管安排", body: "你可能无意中让关系失去协商感。" },
          { title: "不太示弱", body: "你不一定愿意主动承认自己也需要被照顾。" },
          { title: "结果感过强", body: "在压力下，你可能把关系谈成了执行问题。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的承担方式、承诺优势与边界感。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些表达压强和控制倾向最容易让关系变硬。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的执行标准升级成更稳的带队方式",
    body: "解锁后可继续查看更细的职业路径、成长节奏与关系盲点，让高标准不再只靠压强推进。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ESTJ_ZH_CONTENT;
