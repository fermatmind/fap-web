import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const ENTP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先改写问题，再决定怎么出手。外界常先感受到你的反应快和点子多，真正稳定的是你对可能性、结构松动点和说服空间的敏感。",
  intro: [
  "ENTP 往往擅长在看似固定的局面里重新定义议题，把别人默认接受的前提重新掰开来检视。你不只是想提出新点子，更在意是否还有更高杠杆的解释与做法。",
  "这让你在变化、谈判、创意与试验性环境里很有优势，也会让你对僵硬流程、低质量重复和过早定案更敏感。对你来说，机会通常藏在重述问题之后。"
],
  traits: {
    eyebrow: "人格概览",
    title: "重构很快",
    value: "先改问题",
    body: "你会自然寻找更高杠杆的问法，再决定是否值得投入。",
    paragraphs: [
  "你很少只接受表面结论，而是会继续追问还有没有别的解释、更优路径或被默认略过的选项。这个习惯让你在复杂情境中非常灵活，也让你更容易看见别人没注意到的入口。",
  "但如果环境只奖励快速收口、低风险重复和稳定执行，你会明显掉能量。你需要的不只是自由，而是允许试错和重新定义的空间。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业上，你适合那些需要发现机会、重述议题、连接资源和快速试验的角色。你未必喜欢长期守着同一套流程，但很擅长为停滞局面打开新的入口。",
  "比起被动执行既定路线，你更擅长在不确定里看见更好的打法。真正适合你的岗位，通常允许你一边试、一边改，而不是要求你完全按脚本运行。"
],
      influentialTraits: [
          { label: "重构", colorKey: "blue", body: "先改写问题" },
          { label: "试探", colorKey: "gold", body: "先试再收束" },
          { label: "说服", colorKey: "green", body: "会推动局面" },
          { label: "联想", colorKey: "purple", body: "跨域连接快" }
        ],
      strengths: [
          { title: "重构议题", body: "你能快速看出一个问题还可以换什么问法。" },
          { title: "机会识别", body: "在别人只看到阻力时，你常能看到新的切口。" },
          { title: "现场回应", body: "临场变化出现时，你通常能迅速接住并转向。" },
          { title: "跨域连接", body: "你擅长把不同经验拼出新的解决方案。" },
          { title: "试错意愿高", body: "你愿意先跑小样，再决定哪条路值得放大。" },
          { title: "说服力强", body: "你能把新方案讲得让人愿意继续讨论。" }
        ],
      weaknesses: [
          { title: "持续收尾弱", body: "当问题失去新鲜感时，你的耐心会明显下降。" },
          { title: "慢流程烦躁", body: "面对层层确认和缓慢推进，你容易失去兴致。" },
          { title: "承诺过多", body: "你容易同时打开太多可能性和试验线。" },
          { title: "细节跟进散", body: "长期维护和稳定收口通常不是最强项。" },
          { title: "容易辩过头", body: "如果只想验证逻辑，别人可能先感到被挑战。" },
          { title: "稳定性忽视", body: "你可能高估变化带来的好处，低估维护成本。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位更需要你的重构能力、试验意愿与说服张力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种变化密度与决策空间里最能稳定发挥。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是获得更多选择，而是学会决定哪些选择值得继续追。你已经很会打开局面，下一步更关键的是建立筛选、收束和复盘机制。",
  "当你愿意把一部分精力从发现新可能，转到保护已有优势和跟进完成度，很多结果会真正开始累积，而不是总在新起点附近徘徊。"
],
      influentialTraits: [
          { label: "筛选", colorKey: "blue", body: "学会关掉选项" },
          { label: "复盘", colorKey: "gold", body: "把试验变经验" },
          { label: "收束", colorKey: "green", body: "让点子落地" },
          { label: "耐心", colorKey: "purple", body: "允许慢一点" }
        ],
      strengths: [
          { title: "学习快", body: "新领域出现时，你通常能快速进入理解状态。" },
          { title: "愿意修正", body: "面对新证据时，你常能立刻更新原有判断。" },
          { title: "反馈利用强", body: "你能把外部反馈迅速变成下一轮试验假设。" },
          { title: "不怕试错", body: "你不会因为一次失败就停止探索。" },
          { title: "恢复速度高", body: "对你来说，变化和新输入本身就有补能效果。" },
          { title: "重新设计强", body: "当旧做法失效时，你能很快提出替代路径。" }
        ],
      weaknesses: [
          { title: "节奏偏飘", body: "没有收束点时，你容易被新刺激持续带走。" },
          { title: "新鲜感依赖", body: "问题一旦进入维护期，你的投入感会变弱。" },
          { title: "深耕后劲低", body: "长期重复打磨并不是最自然的推进方式。" },
          { title: "情绪后置", body: "你可能先把压力当刺激，之后才发现已透支。" },
          { title: "边界随兴", body: "当所有机会都看起来有意思时，边界容易松。" },
          { title: "收口拖延", body: "你可能知道该怎么做，却不想马上定下来。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些筛选机制与节奏设置最能把你的优势留住。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些分散和兴奋式推进最容易拖慢长期积累。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你喜欢真实、好玩、有智力张力的互动。你不太偏好黏连式维系，更看重两个人能否一起讨论、一起变化，而不是只守着固定剧本。",
  "你能给关系带来很多新鲜感和灵活度，但如果只顾着推进想法而没照顾情绪承接，对方可能会感到你在讨论问题，却没有真的陪在关系里。"
],
      influentialTraits: [
          { label: "新鲜", colorKey: "blue", body: "关系要有活性" },
          { label: "讨论", colorKey: "gold", body: "喜欢来回碰撞" },
          { label: "弹性", colorKey: "green", body: "不爱固定剧本" },
          { label: "转向", colorKey: "purple", body: "随时改打法" }
        ],
      strengths: [
          { title: "关系有活性", body: "你能让互动保持新鲜，不容易僵成固定套路。" },
          { title: "讨论张力强", body: "你愿意把问题说开，而不是停在表面和气。" },
          { title: "适应变化快", body: "关系进入新阶段时，你常能较快调整节奏。" },
          { title: "低控制感", body: "你不喜欢用高压方式维持关系。" },
          { title: "回应灵活", body: "面对突然情况时，你常能找到新办法接住。" },
          { title: "不怕重来", body: "如果旧的相处方式失效，你愿意重建一套新的。" }
        ],
      weaknesses: [
          { title: "情绪承接少", body: "你可能先顾着讨论逻辑，后顾对方感受。" },
          { title: "稳定确认低", body: "对需要高频稳定反馈的关系，你容易疲惫。" },
          { title: "辩论压强大", body: "如果只想推动想法，对方可能先感觉被顶住。" },
          { title: "收口较慢", body: "很多重要关系节点，你未必想太快给承诺。" },
          { title: "随兴抽离", body: "当互动失去张力时，你可能先把注意力移开。" },
          { title: "边界不连续", body: "你有边界，但不一定每次都及时讲清楚。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最能带来的活性、讨论张力与适应力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些表达压强和随兴抽离最容易让关系失衡。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的想法优势变成稳定打法",
    body: "解锁后可继续查看更细的职业试验路径、成长筛选机制与关系盲点，不再只停留在公开概览。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default ENTP_ZH_CONTENT;
