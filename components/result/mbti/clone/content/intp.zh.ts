import { createMbtiDesktopCloneContent } from "@/components/result/mbti/clone/content/factory";

const INTP_ZH_CONTENT = createMbtiDesktopCloneContent({
  heroSummary: "你会先拆概念、找前提，再决定值不值得行动。外界会先感受到你的跳跃思路，真正稳定的是你对模型和解释力的执着。",
  intro: [
  "INTP 更习惯先理解问题本身，再决定要不要进入执行。你会自然追问定义、边界和假设是否成立，因此常能看出一个讨论里被默认跳过的漏洞。",
  "这让你在研究、建模和抽象判断上很有优势，同时也会让你对重复流程、低密度协作和过早收口更敏感。对你来说，想清楚往往先于表态。"
],
  traits: {
    eyebrow: "人格概览",
    title: "模型优先",
    value: "先看逻辑",
    body: "你更在意解释是否成立，而不是现场是否立刻形成共识。",
    paragraphs: [
  "你会本能地把复杂情境还原成更基础的结构：这件事的前提是什么，变量之间怎样互相影响，当前的结论是不是只是习惯性说法。这个过程常常比动作本身更能激活你。",
  "一旦模型清楚，你的表达会非常有穿透力；但如果外部节奏要求你先给答案、再慢慢想清楚，你会明显感到失真和疲惫。"
],
  },
  chapters: {
    career: {
      intro: [
  "在职业上，你很适合那些需要建立解释框架、研究新问题或拆解复杂系统的角色。你不一定偏好高压管理，但很擅长为别人看不清的事情建立更可讨论的结构。",
  "对你来说，真正有价值的工作通常要同时满足两个条件：问题本身足够有趣，环境允许你先做深入判断，而不是被迫在粗糙信息上持续快速表态。"
],
      influentialTraits: [
          { label: "建模", colorKey: "blue", body: "先建解释模型" },
          { label: "抽象", colorKey: "gold", body: "先看底层原理" },
          { label: "好奇", colorKey: "green", body: "不断追问假设" },
          { label: "弹性", colorKey: "purple", body: "愿意重新修正" }
        ],
      strengths: [
          { title: "概念建模", body: "你能把模糊议题整理成更可推演的模型。" },
          { title: "问题重述", body: "你擅长换一个更准确的问法，让讨论回到正题。" },
          { title: "独立研究", body: "面对新议题时，你通常能快速自建理解路径。" },
          { title: "结构简化", body: "你会剥离表面噪音，抓住真正决定结果的变量。" },
          { title: "跨域联想", body: "你能把不同领域的原理连接到同一个问题上。" },
          { title: "避免从众", body: "即使大多数人已经接受某个结论，你也会继续验证。" }
        ],
      weaknesses: [
          { title: "收束偏慢", body: "当问题还没想透时，你不喜欢过早进入执行。" },
          { title: "执行节奏松", body: "长期重复推进并不是最能激活你的部分。" },
          { title: "流程耐心低", body: "面对层层确认和例行手续时，你容易掉投入感。" },
          { title: "表达跳步", body: "你脑中的推理很快，但别人未必能立刻跟上。" },
          { title: "不爱重复协同", body: "高频对齐和反复解释会快速消耗你的注意力。" },
          { title: "落地易搁置", body: "如果没有清晰的收束机制，想法可能停留在草图阶段。" }
        ],
      lockedBlocks: [
        {
          title: "更匹配的岗位簇",
          overlayTitle: "解锁岗位簇",
          overlayBody: "查看哪些岗位更需要你的建模、研究与问题重述能力。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "更稳的协作场景",
          overlayTitle: "解锁工作方式",
          overlayBody: "看清你在哪种节奏与协作密度下最能稳定产出高质量判断。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    growth: {
      intro: [
  "你的成长重点通常不是再多吸收信息，而是让认知升级和实际动作之间的距离更短。你已经擅长看出问题的本质，下一步更关键的是把这种能力变成可重复的输出。",
  "当你愿意接受“足够好”的阶段性版本，而不是等到完全想透才开始推进，很多资源会真正开始为你服务，而不是一直停留在脑内。"
],
      influentialTraits: [
          { label: "迭代", colorKey: "blue", body: "允许先做后改" },
          { label: "学习", colorKey: "gold", body: "持续吸收新模型" },
          { label: "弹性", colorKey: "green", body: "愿意修正判断" },
          { label: "独处", colorKey: "purple", body: "靠安静恢复" }
        ],
      strengths: [
          { title: "自学很快", body: "你能快速吸收一个领域的核心逻辑和结构。" },
          { title: "抽象复盘", body: "你会把经验上升成可迁移的方法，而不只是记事件。" },
          { title: "认知迭代", body: "面对新证据时，你通常愿意更新原有结论。" },
          { title: "兴趣驱动", body: "一旦问题足够有张力，你会自然进入高强度专注。" },
          { title: "允许修正", body: "你不怕承认自己原来判断得不够完整。" },
          { title: "独立恢复", body: "给你足够独处空间后，状态常能迅速回稳。" }
        ],
      weaknesses: [
          { title: "行动门槛高", body: "没想明白之前，你可能很难真正开始。" },
          { title: "兴趣漂移", body: "一旦问题失去新鲜张力，你会较快分散注意。" },
          { title: "长期分散", body: "如果没有外部收束点，很多线索会同时悬着。" },
          { title: "琐碎回避", body: "对重复维护和执行细节的耐心通常不高。" },
          { title: "身体后置", body: "你可能在脑中持续工作，却较晚觉察身体已疲惫。" },
          { title: "练习断续", body: "即使知道方向正确，也不一定喜欢机械重复。" }
        ],
      lockedBlocks: [
        {
          title: "更能补能的条件",
          overlayTitle: "解锁补能条件",
          overlayBody: "查看哪些学习方式和节奏能把你的思考真正接到行动上。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "最耗损你的模式",
          overlayTitle: "解锁耗损模式",
          overlayBody: "看清哪些分散与拖延模式最容易让你停留在想法层。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
    relationships: {
      intro: [
  "在关系里，你更看重思路是否诚实、边界是否被尊重，以及两个人能不能在复杂问题上真正讨论，而不是只交换情绪表态。",
  "你不是不在意感受，而是习惯先理解结构。对你来说，好的关系通常允许独立空间，也允许不同意见被认真展开，而不是立刻要求统一。"
],
      influentialTraits: [
          { label: "真实", colorKey: "blue", body: "讨论要诚实" },
          { label: "空间", colorKey: "gold", body: "需要独立空间" },
          { label: "好奇", colorKey: "green", body: "愿意理解差异" },
          { label: "松弛", colorKey: "purple", body: "不喜欢过度黏连" }
        ],
      strengths: [
          { title: "尊重自由", body: "你不会天然把亲密理解为高控制和高占有。" },
          { title: "思路新鲜", body: "你能为关系带来新的解释角度和讨论方式。" },
          { title: "低控制感", body: "你更愿意让彼此按自己的节奏保留空间。" },
          { title: "诚实讨论", body: "遇到分歧时，你更偏好把问题真正说清楚。" },
          { title: "好奇理解", body: "你愿意理解对方为什么会那样反应。" },
          { title: "修正能力强", body: "如果对方给出新信息，你通常愿意调整理解。" }
        ],
      weaknesses: [
          { title: "情绪回应慢", body: "你可能先理解结构，后回应情绪需求。" },
          { title: "即时表达少", body: "很多在意和好感未必会被你及时说出来。" },
          { title: "维护靠灵感", body: "关系经营不一定会自然进入你的日常优先级。" },
          { title: "边界偏松", body: "你有时会因怕麻烦而把需求说得太晚。" },
          { title: "高黏度回避", body: "被持续要求高频互动时，你会明显想后撤。" },
          { title: "被误解后抽离", body: "如果多次解释无效，你可能直接减少投入。" }
        ],
      lockedBlocks: [
        {
          title: "关系里的稳定优势",
          overlayTitle: "解锁关系优势",
          overlayBody: "查看你在关系里最稳定的理解方式与支持模式。",
          overlayCtaLabel: "解锁完整报告",
        },
        {
          title: "关系里的常见盲点",
          overlayTitle: "解锁关系盲点",
          overlayBody: "看清哪些表达迟滞最容易让你被误解为疏离。",
          overlayCtaLabel: "解锁完整报告",
        },
      ],
    },
  },
  finalOffer: {
    eyebrow: "完整解锁",
    headline: "把你的模型感落到真实选择",
    body: "解锁后可继续查看更细的职业结构、成长节奏与关系误区，让思考真正接到行动。",
    priceLabel: "当前价格",
    ctaLabel: "解锁完整报告",
    guarantee: "一次解锁，继续保留当前桌面阅读壳与真实动作入口。",
  },
});

export default INTP_ZH_CONTENT;
