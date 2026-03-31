import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const INTJ_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先搭结构，再决定动作顺序。外界常看到你的克制，真正支撑你的是对长期路径和系统边界的持续判断。",
  intro: [
  "INTJ 更习惯先确认方向、约束和长期代价，再判断什么值得投入。你未必在现场最热闹，但通常会比多数人更早看到一个系统会在哪个环节失速。",
  "这让你在复杂环境里很容易承担结构化判断的角色，同时也会让你对低质量协作和反复摇摆的决策更敏感。对你来说，好的路径不只是能跑，而是逻辑上站得住。"
],
  traits: {
    eyebrow: "人格概览",
    title: "先搭系统",
    value: "结构先行",
    body: "你倾向先确认边界、依赖与长期后果，再进入动作层。",
    paragraphs: [
  "你对复杂问题的第一反应通常不是立刻表态，而是先判断结构是否清楚、假设是否成立、执行路径是否会在后面失真。这个过程让你看起来慢一拍，实际上是在提前规避返工。",
  "一旦判断完成，你的推进通常会很果断。你不喜欢被频繁打断，也不喜欢为了照顾表面效率而牺牲整体质量，因此更适合那些尊重独立思考和长线标准的环境。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业场景里，你的价值往往来自搭框架、定优先级和提前识别系统性的风险。只要目标明确、边界清楚，你通常会比多数人更快进入长期规划状态。",
  "你未必偏好高噪音竞争，但很适合那些需要独立判断、复杂拆解和长期负责的岗位。对你来说，真正的效率不是更快，而是少走弯路。"
],
      influentialTraits: [
          { label: "架构", colorKey: "blue", body: "先搭整体框架" },
          { label: "预判", colorKey: "gold", body: "先看长期后果" },
          { label: "标准", colorKey: "green", body: "先定质量门槛" },
          { label: "独立", colorKey: "purple", body: "独立完成判断" }
        ],
      strengths: [
          { title: "搭框架", body: "你会先定义边界、依赖与节奏，再推动执行。" },
          { title: "长线预判", body: "你能较早看到一个方案在后段会出现的阻力。" },
          { title: "标准定义", body: "你会先说明什么算达标，而不是边做边猜。" },
          { title: "独立推进", body: "在边界清楚的任务里，你通常不需要高频监督。" },
          { title: "复杂拆解", body: "你擅长把大问题拆成可判断、可排序的模块。" },
          { title: "低噪决策", body: "你能在信息嘈杂时保留自己的判断轴。" }
        ],
      weaknesses: [
          { title: "不耐反复", body: "当团队长期摇摆时，你会迅速失去投入感。" },
          { title: "解释不足", body: "你知道为什么这样做，但未必愿意把过程讲长。" },
          { title: "提前下结论", body: "一旦判断形成，你可能过早假设别人也看明白了。" },
          { title: "边界偏硬", body: "遇到职责不清的协作时，你容易直接后撤。" },
          { title: "低质量协作敏感", body: "你对拖沓、空转和低标准的容忍度较低。" },
          { title: "抽离较快", body: "当路径长期失真时，你会比别人更早停下投入。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位最能放大你的结构判断与长期规划能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种授权边界与协作密度下最稳。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再多想一点，而是让判断、表达和恢复形成更平衡的节奏。你已经很会搭结构，下一步更关键的是减少因为高标准带来的无形耗损。",
  "当你愿意把阶段性可交付放到完美方案之前，很多推进会更顺。你需要的不是降低标准，而是学会让标准分层，而不是一次压满。"
],
      influentialTraits: [
          { label: "校准", colorKey: "blue", body: "持续修正方法" },
          { label: "复盘", colorKey: "gold", body: "把经验归档" },
          { label: "节奏", colorKey: "green", body: "安排恢复窗口" },
          { label: "边界", colorKey: "purple", body: "避免过量消耗" }
        ],
      strengths: [
          { title: "自我校准", body: "你会持续修正框架，而不是执着于第一次方案。" },
          { title: "长期升级", body: "你更擅长做长期有效的优化，而不是表面补丁。" },
          { title: "方法沉淀", body: "你会把经验整理成下次还能复用的判断标准。" },
          { title: "独处恢复", body: "给你安静空间后，你通常恢复得很快。" },
          { title: "风险复盘", body: "你能从失败里抽出真正值得修的结构问题。" },
          { title: "节奏自控", body: "一旦决定了路线，你通常能稳住执行节奏。" }
        ],
      weaknesses: [
          { title: "完美阈值高", body: "你可能因为想把方案做完整而延后动作。" },
          { title: "难以示弱", body: "即使负担已经很高，你也未必会主动说出来。" },
          { title: "休息滞后", body: "你常在效率明显下降后才承认自己需要停一下。" },
          { title: "环境僵硬", body: "当规则长期混乱时，你容易变得更强硬和封闭。" },
          { title: "情绪后置", body: "你会先处理问题，之后才发现自己已经被消耗。" },
          { title: "系统化过度", body: "有些短期波动并不需要立刻上升到结构层解释。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些节奏与恢复条件最能保护你的判断质量。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些长期高压模式最容易拖低你的稳定度。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更重视可靠、清楚和长期一致，而不是高频情绪表达。你通常会先观察对方是否值得信任，再决定自己要投入到什么程度。",
  "你并不是冷淡，而是不喜欢反复确认那些你已经看清的事情。对你来说，好的关系应该同时允许独立思考、清晰边界和稳定承诺。"
],
      influentialTraits: [
          { label: "可靠", colorKey: "blue", body: "重视一致性" },
          { label: "边界", colorKey: "gold", body: "边界要清楚" },
          { label: "判断", colorKey: "green", body: "先看长期走势" },
          { label: "克制", colorKey: "purple", body: "表达不过量" }
        ],
      strengths: [
          { title: "承诺稳定", body: "一旦认定关系值得投入，你通常会长期负责。" },
          { title: "边界清楚", body: "你知道什么该承担，什么不该被默认转移给你。" },
          { title: "问题拆解", body: "遇到摩擦时，你能较快识别真正的症结。" },
          { title: "尊重独立", body: "你不会要求关系靠高频确认来维持存在感。" },
          { title: "风险预判", body: "你会比多数人更早看到关系里的失衡迹象。" },
          { title: "长期视角", body: "你看重这段关系是否能经得起时间检验。" }
        ],
      weaknesses: [
          { title: "温度表达少", body: "你心里在意很多，但未必第一时间说出来。" },
          { title: "解释偏短", body: "当你只给结论时，对方可能感受不到你的用意。" },
          { title: "容错有限", body: "对反复失信或低质量沟通的耐心通常不高。" },
          { title: "不爱反复确认", body: "对需要频繁情绪回应的关系，你会感到疲惫。" },
          { title: "失望后收回", body: "一旦判断对方不可靠，你会很快减少投入。" },
          { title: "关系项目化", body: "在压力下，你可能更像在修系统而不是先安抚感受。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的支持方式与承诺模式。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些沟通习惯最容易让你被误解为冷淡或过硬。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的判断扩成长期策略",
    body: "解锁后可继续查看更细的职业结构、成长节奏与关系边界，不再只停留在公开概览。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续沿用当前桌面阅读壳与真实动作入口。",
  },
});

export default INTJ_ZH_CONTENT;
